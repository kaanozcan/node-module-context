module.exports = {
  extensionsIgnoredForPreload: [".json"],
  nonInternalModules: ["module", "assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto", "child_process", "tls"],
  coreModules: ["assert", "http", "https", "buffer", "fs", "path", "os", "tty", "util", "vm", "inherits", "zlib", "stream", "crypto", "tls"]
};
