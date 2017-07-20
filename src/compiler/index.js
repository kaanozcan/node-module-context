const path = require("path"),
      vm = require("vm"), {
  removeShebang
} = require("../utils");

//TODO: removed stat.cache check what it is doing
module.exports = (Module, context, _require) => (function (content, filename) {
  const internalModule = _require("internal/module");

  content = removeShebang(content);

  // create wrapper function
  var wrapper = Module.wrap(content);

  if(!vm.isContext(context)){
    vm.createContext(context);
  }

  var compiledWrapper = vm.runInContext(wrapper, context, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true
  });

  var inspectorWrapper = null;
  if (process._breakFirstLine && process._eval == null) {
    if (!resolvedArgv) {
      // we enter the repl if we're not given a filename argument.
      if (process.argv[1]) {
        resolvedArgv = Module._resolveFilename(process.argv[1], null, false);
      } else {
        resolvedArgv = 'repl';
      }
    }

    // Set breakpoint on module start
    if (filename === resolvedArgv) {
      delete process._breakFirstLine;
      inspectorWrapper = process.binding('inspector').callAndPauseOnStart;
      if (!inspectorWrapper) {
        const Debug = vm.runInDebugContext('Debug');
        Debug.setBreakPoint(compiledWrapper, 0, 0);
      }
    }
  }
  var dirname = path.dirname(filename);
  var require = internalModule.makeRequireFunction(this);
  var depth = internalModule.requireDepth;
  var result;
  if (inspectorWrapper) {
    result = inspectorWrapper(compiledWrapper, this.exports, this.exports,
                              require, this, filename, dirname);
  } else {
    result = compiledWrapper.call(this.exports, this.exports, require, this,
                                  filename, dirname);
  }
  return result;
});
