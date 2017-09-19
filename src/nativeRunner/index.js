const vm = require("vm"),
      path = require("path"),
      mockedModules = require("../mockedModules");

const bindings = process.binding("natives");

module.exports = (context) => {
  const cache = {};
  return (id, require) => {
    if (cache[id]) {
      return cache[id]
    }

    const code = bindings[id],
          wrappedCode = mockedModules.native_module.wrap(code);

    cache[id] = { exports: {} };

    const __filename = "lib/" + id + ".js";

    const module = vm.runInContext(wrappedCode, context, { filename: __filename });

    module(cache[id].exports, require, cache[id], __filename, path.dirname(__filename));

    return cache[id].exports;
  };
}
