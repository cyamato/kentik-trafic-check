'use strict';
module.exports = function (config) {
  return {
    getActivityForIp: require('./getActivityForIp.controller')(config),
    getPortalUrl: require('./getPortalUrl.controller')(config),
  };
};