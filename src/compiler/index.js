const path = require("path"),
      vm = require("vm"), {
  removeShebang
} = require("../utils");

module.exports = (Module, context, _require) => (function (content, filename) {
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
