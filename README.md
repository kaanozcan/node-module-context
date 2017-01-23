#Node Module Context

This is a module that intends to fix some concurrency issues by contextifying core module system and not spawning child processes. This module executes your module and every other module you required in a desired context by instantiating new module provider(lib/module.js basically). With this you could have multiple module providers executing your code in parallel in an controlled environment without mixing with each other.

##Warning
This module uses undocumented api (process.bindings). While there is a discussion about removing it ( [see the closed github issue](https://github.com/nodejs/node/pull/2768) ) it seems it's advised against(too many packages already using it) or at worst case a flag will be introduced.

##How

```lang="javascript"
const contextify = require("node-module-context");

const execute = contextify("path/to/your/file", options);

execute(context);
```

What execute gives you is what you exported on path/to/your/file.

##Options

###preCompiler: function

A function with a single argument "source". You will required to return resulting code.
Example:
```lang="javascript"
const contextify = require("node-module-context");

const execute = contextify("path/to/your/file", {
  preCompiler (source) {
    return transform(source);
  }
});

execute(context);
```

##TODO

- [x] Preload user modules.
- [ ] Preload npm packages.
