const mockedModules = require("./"),
      { expect } = require("chai");

describe("mockedModules", function () {
  it("method wrap should wrap code correctly", function () {
    console.log("wat");
    const code = "return [exports, require, module, __filename, __dirname];";

    const args = [1, 2, 3, 4, 5];

    const result = eval(mockedModules.native_module.wrap(code)).apply(null, args);

    const l = args.length;
    for(let i = 0; i < l; i++){
      expect(result[i]).to.be.equal(args[i]);
    }
  });
});
