# Node Module Context

Works on node.js version 8.x doesn't works on older versions.

This is a module that intends to fix some concurrency issues by contextifying core module system and not spawning child processes. It does this by executing your module and every other module you required in a desired context by instantiating a new module provider(lib/module.js basically). With this you could have multiple module providers executing your code in parallel in an controlled environment without mixing with each other.

## Attention!
This module uses undocumented api (process.bindings). While there is a discussion about removing it ( [see the closed github issue](https://github.com/nodejs/node/pull/2768) ) it seems it's advised against(too many packages already using it) or at worst case a flag will be introduced but it's still better to be informed.

## Example

```lang="javascript"
const contextify = require("node-module-context");

const execute = contextify("path/to/your/file", options);

const myExportedModule = execute(context);
```

## Pros

- Request isolation - more fault tolerant applications ( less chance to mess the rest of the app if something goes wrong with a single request).
- Especially on isomorphic applications you don't have to think twice about concurrency. You can just import your state machine and no other request can temper with it.

## Cons

- Every time you execute your code everything it depends on read from disk and interpreted by v8 (pre compile too if you included the option). On the first time of execute all of these steps are cached but interpreting remains. Which means it can get a little slow the first time but be assured I am preloading non npm modules at the moment for cache and preloading for npm modules are on the way. So might want to consider the interpreting time.

## Options

### preCompiler: function

A function with a single argument "source". You will be required to return the resulting code.
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

## TODO
- [x] Split code for testability.
- [ ] Write unit tests.
- [ ] Add option to allow choosing which modules to be resolved by global require and which by the contextified require method for performance reasons.
- [x] Preload user modules.
- [ ] Preload npm packages.
