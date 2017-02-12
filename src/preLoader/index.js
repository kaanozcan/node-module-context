const path = require("path"),
      detective = require("detective"), {
        readFileSync
      } = require("../utils");

const extensionsIgnoredForPreload = [".json"];
const isExtensionIgnored = (ext) => (extensionsIgnoredForPreload.filter(_ext => ext === _ext).length > 0);

const findRequires = (source, filename) => {
  if (detectiveCache[filename]) {
    return detectiveCache[filename];
  }

  return detectiveCache[filename] = detective.find(source);
};

let detectiveCache = {};

module.exports = (precompiler) => (function _preload (filename) {
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
