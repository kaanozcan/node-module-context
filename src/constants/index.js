module.exports = {
  extensionsIgnoredForPreload: [".json"],
  nonInternalModules: ["module", "assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto", "child_process"],
  coreModules: ["assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto"]
};
