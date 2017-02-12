const { 
  expect
} = require("chai");

const getPrecompiler = require("./");

let preCompile, cache;

describe("preCompiler", function () {

  beforeEach(function () {
    cache = {};

    preCompile = getPrecompiler(function (source) {
      return source + "a"
    }, cache);
  });

  it("should use the compiler provided", function () {
    const result = preCompile("a", "filename");

    expect(result).to.be.equal("aa");
  });

  it("if no compiler provided should return without modification", function () {
    preCompile = getPrecompiler(null, cache);

    const result = preCompile("a", "filename");

    expect(result).to.be.equal("a");
  });

  it("should cache", function () {
    const result = preCompile("a", "filename");

    expect(cache.filename).to.be.equal("aa");
  });

  it("should return the cached", function () {
    cache.filename = "b";

    const result = preCompile("a", "filename");

    expect(cache.filename).to.be.equal("b");
  });
});
