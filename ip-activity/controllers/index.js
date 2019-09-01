'use strict';
module.exports = function (config) {
  return {
    getKentikDevices: require('./getKentikDevices.controller')(config),
    getKentikDeviceByIp: require('./getKenitkDeviceByIp.controller')(config),
    getActivityForIp: require('./getActivityForIp.controller')(config),
    getPortalUrl: require('./getPortalUrl.controller')(config),
    getKentikDevicesFlows: require('./getKentikDevicesFlows.controller')(config),
  };
};