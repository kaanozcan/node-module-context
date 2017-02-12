const vm = require("vm"),
      path = require("path"),
      mockedModules = require("../mockedModules");

const bindings = process.binding("natives");

module.exports = (context) => (id, require) => {
  let code = bindings[id];

  const wrappedCode = mockedModules.native_module.wrap(code);

  let module = { exports: {} },
      __filename = "lib/" + id + ".js";

  vm.runInContext(wrappedCode, context, { filename: __filename })(module.exports, require, module, __filename, path.dirname(__filename));

  return module.exports;
};
