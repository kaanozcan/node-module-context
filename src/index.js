const vm = require("vm"),
      fs = require("fs"),
      path = require("path"),
      util = require("util"),
      getNativeRunner = require("./nativeRunner"),
      getCompiler = require("./compiler"),
      getPreloader = require("./preLoader"),
      mockedModules = require("./mockedModules"),
      getPrecompiler = require("./preCompiler"), {
        readFileSync,
        useRequire
      } = require("./utils"), {
        extensionsIgnoredForPreload,
        nonInternalModules,
        coreModules
      } = require("./constants"),
      bindings = process.binding("natives");

let compilerCache = {}, fsCache = {};

const defaultOptions = {
  preCompiler: false,
  context: {},
  extensions: [".js", ".jsx"]
};

const getRequire = (nativeRunner, mockedModules, cache) => (function _require (id) {
  let result;

  if (cache[id]) {
    return cache[id];
  }

  if (useRequire(id)) {
    return require(id);
  }

  if (mockedModules[id]) {
    result = mockedModules[id];
  } else if (bindings[id]) {
    result = nativeRunner(id, _require);
  }

  cache[id] = result;

  return result;
});

module.exports = function (filename, opt) {
  const {
    preCompiler,
    preload,
    extensions
  } = Object.assign({}, defaultOptions, opt);

  const preCompile = getPrecompiler(preCompiler, compilerCache);

  if (preload) {
    getPreloader(preCompile)(path.join(process.cwd(), filename));
  }

  return function (context) {
    let requireCache = {};

    const _context = Object.assign({}, global, context),
          nativeRunner = getNativeRunner(_context),
          _require = getRequire(nativeRunner, mockedModules, requireCache);

    _require.resolve = require.resolve;
    vm.createContext(_context);

    const Module = _require("module"),
          internalModule = _require("internal/module"),
          compile = getCompiler(Module, _context, _require);

    extensions.forEach((ext) => Module._extensions[ext] = function (module, filename) {
      let content = internalModule.stripBOM(readFileSync(filename, "utf8"));

      content = preCompile(content, filename);

      compile.apply(module, [content, filename]);
    });

    return Module._load(
      path.join(process.cwd(), filename),
      null,
      true
    );
  };
};
