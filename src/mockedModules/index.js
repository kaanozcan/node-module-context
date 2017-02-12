import {
  nonInternalModules
} from "../constants";

module.exports = {
  native_module: {
    require,
    wrap: (src) => `(function (exports, require, module, __filename, __dirname) { \n${src}\n});`,
    nonInternalExists: (id) => (nonInternalModules.filter(_id => id === _id).length > 0),
    exists: () => false
  }
};
