const fs = require("fs"), {
  coreModules
} = require("../constants");

let fsCache = {};

module.exports = {
  readFileSync(...args) {
    const filename = args[0],
          cached = fsCache[filename];

    if (cached) {
      return cached;
    }

    return fsCache[filename] = fs.readFileSync.apply(fs, args);
  },
  removeShebang(content) {
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
  },
  useRequire: (id) => (coreModules.indexOf(id) > -1)
}
