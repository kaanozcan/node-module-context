const {
  expect
} = require("chai"), {
  spy
} = require("sinon"),
  proxy = require("proxyquire");

let readFileSync, fsMock;

describe("utils", function () {

  beforeEach(function () {
    fsMock = {
      readFileSync: function (filename) {
        return filename;
      }
    }

    spy(fsMock, "readFileSync");

    readFileSync = proxy("./", {
      fs: fsMock
    }).readFileSync;
  });

  describe("readFileSync", function () {

    it("should cache results", function () {
      readFileSync("some/file/name");
      readFileSync("some/file/name");

      expect(fsMock.readFileSync.calledOnce).to.be.ok;
    });

  });
});
