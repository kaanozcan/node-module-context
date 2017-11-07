module.exports = (compiler, cache) => (source, filename) => {
  const hasCompiler = compiler && typeof compiler === "function",
        hasInCache = cache[filename] !== undefined;

  let result = source;

  if (hasCompiler && hasInCache) {
    result = cache[filename];
  } else if (hasCompiler) {
    result = cache[filename] = compiler(source, filename);
  }

  return result;
};
