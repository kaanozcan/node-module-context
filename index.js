const vm = require("vm"),
      detective = require("detective"),
      fs = require("fs"),
      path = require("path"),
      util = require("util"),
      bindings = process.binding("natives"),
      extensionsIgnoredForPreload = [".json"],
      nonInternalModules = ["module", "assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto"],
      coreModules = ["assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto"],
      mockedModules = {
        ["native_module"]: {
          require,
          wrap: (src) => `(function (exports, require, module, __filename, __dirname) { \n${src}\n});`,
          nonInternalExists: (id) => (nonInternalModules.filter(_id => id === _id).length > 0),
          exists: () => false
        }
      };

let compilerCache = {}, fsCache = {}, detectiveCache = {};

const defaultOptions = {
  preCompiler: false,
  context: {},
  extensions: [".js", ".jsx"]
};

const readFileSync = (...args) => {
  const filename = args[0],
        cached = fsCache[filename];

  if (cached) {
    return cached;
  }

  return fsCache[filename] = fs.readFileSync.apply(fs, args);
};

const removeShebang = (content) => {
  const contLen = content.length;

  if (contLen >= 2) {
    if (content.charCodeAt(0) === 35 && content.charCodeAt(1) === 33) {
      if (contLen === 2) {
        content = "";
      } else {
        let i = 2;

        for (; i < contLen; ++i) {
          const code = content.charCodeAt(i);

          if (code === 10 || code === 13)
            break;
        }
        if (i === contLen)
          content = "";
        else {
          content = content.slice(i);
        }
      }
    }
  }

  return content;
};

const findRequires = (source, filename) => {
  if (detectiveCache[filename]) {
    return detectiveCache[filename];
  }

  return detectiveCache[filename] = detective.find(source);
};

const useRequire = (id) => (coreModules.indexOf(id) > -1);

const isExtensionIgnored = (ext) => (extensionsIgnoredForPreload.filter(_ext => ext === _ext).length > 0);

const getNativeRunner = (context) => (id, require) => {
  let code = bindings[id];

  const wrappedCode = mockedModules.native_module.wrap(code);

  let module = { exports: {} },
      __filename = "lib/" + id + ".js";

  vm.runInContext(wrappedCode, context, { filename: __filename })(module.exports, require, module, __filename, path.dirname(__filename));

  return module.exports;
};

const getRequire = (nativeRunner, cache) => (function _require (id) {
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

const getCompiler = (Module, context, _require) => (function (content, filename) {
  const internalModule = _require("internal/module");

  content = removeShebang(content);

  var wrapper = Module.wrap(content);
  var compiledWrapper = vm.runInContext(wrapper, context, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  });

  if (process._debugWaitConnect && process._eval == null) {
    if (!resolvedArgv) {
      if (process.argv[1]) {
        resolvedArgv = Module._resolveFilename(process.argv[1], null);
      } else {
        resolvedArgv = "repl";
      }
    }

    // Set breakpoint on module start
    if (filename === resolvedArgv) {
      delete process._debugWaitConnect;
      const Debug = vm.runInDebugContext("Debug");

      Debug.setBreakPoint(compiledWrapper, 0, 0);
    }
  }
  var dirname = path.dirname(filename);
  var require = internalModule.makeRequireFunction.call(this);
  var args = [this.exports, require, this, filename, dirname];
  var result = compiledWrapper.apply(this.exports, args);

  return result;
});

const getPreloader = (precompiler) => (function _preload (filename) {
  let source, nextPwd, target, isIndexModule, fullPath;

  const extName = path.extname(filename),
        hasExt = extName && extName !== "";

  fullPath = filename;

  try {
    if (hasExt) {
      source = readFileSync(fullPath, "utf-8");
    } else {
      fullPath = filename + ".js";
      source = readFileSync(fullPath, "utf-8");
    }
  } catch (e) {
    isIndexModule = true;
    fullPath = filename + "/index.js";
    source = readFileSync(fullPath, "utf-8");
  }

  nextPwd = path.dirname(fullPath);

  if (detectiveCache[fullPath] || hasExt && isExtensionIgnored(extName)) {
    return;
  }

  source = precompiler(source, fullPath);

  findRequires(source, fullPath).strings.forEach((module) => {
    if (module.indexOf(".") === 0) {
      _preload(path.join(nextPwd, module));
    } else {

      //TODO: Preload npm packages

    }
  });

});

const getPrecompiler = (compiler, cache) => (source, filename) => {
  const hasCompiler = compiler && typeof compiler === "function",
        hasInCache = cache[filename] !== undefined;

  let result = source;

  if (hasCompiler && hasInCache) {
    result = cache[filename];
  } else if (hasCompiler) {
    result = cache[filename] = compiler(source);
  }

  return result;
};

module.exports = function (filename, opt) {
  const {
    preCompiler,
    extensions
  } = Object.assign({}, defaultOptions, opt);

  const preCompile = getPrecompiler(preCompiler, compilerCache);

  getPreloader(preCompile)(path.join(process.cwd(), filename));

  return function (context) {
    let requireCache = {};

    const _context = Object.assign({}, global, context),
          nativeRunner = getNativeRunner(_context),
          _require = getRequire(nativeRunner, requireCache);

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
