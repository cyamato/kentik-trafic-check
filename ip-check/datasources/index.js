'use strict';
module.exports = function (config) {
  return {
    Kentik: require('./kenitk.datasource'),
  };
};