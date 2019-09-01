'use strict';
module.exports = function (config) {
  
  const datasources = require('../datasources')(config);
  let errors = require('restify-errors');
  return (req, res, next) => {
    try {
      if (config.kenitkOptions.rateLimitConcurrentRequests == 0) {
        res.send(new errors.TooManyRequestsError({wait: 1000}));
        next();
        return;
      }
        config.kenitkOptions.rateLimitConcurrentRequests = 
          config.kenitkOptions.rateLimitConcurrentRequests - 1;
      if (config.kenitkOptions.rateLimitConcurrentQueryRequests == 0) {
        res.send(new errors.TooManyRequestsError({wait: 1000}));
        next();
        return;
      }
        config.kenitkOptions.rateLimitConcurrentQueryRequests = 
          config.kenitkOptions.rateLimitConcurrentQueryRequests - 1;
      let wait = config.kenitkOptions.tokenBuket.take(1);
      if (wait > 500) {
        res.send(new errors.TooManyRequestsError({wait: wait}));
        next();
        return;
      } else if (wait > 0) {
        let current_ms = (new Date).getTime();
        const target_ms = current_ms + wait;
        while (target_ms > current_ms) {
          current_ms = (new Date).getTime();
        }
        wait = config.kenitkOptions.tokenBuket.take(1);
        if (wait > 0) {
          res.send(new errors.TooManyRequestsError({wait: wait}));
          next();
          return;
        }
      }
    } catch (err) {
      console.log(err);
      next();
      return;
    }
    const KentikDevices = new datasources.Kentik.Devices(config.kenitkOptions);
    KentikDevices.findDeviceByIp(req.params.targetIp)
      .then(response => {
        res.send(response);
        next();
        config.kenitkOptions.rateLimitConcurrentRequests = 
          config.kenitkOptions.rateLimitConcurrentRequests + 1;
        config.kenitkOptions.rateLimitConcurrentQueryRequests = 
          config.kenitkOptions.rateLimitConcurrentQueryRequests + 1;
      })
      .catch(reson => {
        res.send(new errors.InternalServerError(reson.message));
        next();
        config.kenitkOptions.rateLimitConcurrentRequests = 
          config.kenitkOptions.rateLimitConcurrentRequests + 1;
        config.kenitkOptions.rateLimitConcurrentQueryRequests = 
          config.kenitkOptions.rateLimitConcurrentQueryRequests + 1;
      });
  };
};