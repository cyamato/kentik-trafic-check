'use strict';
module.exports = function (config) {
  const datasources = require('../datasources')(config);
  const errors = require('restify-errors');
  return (req, res, next) => {
    try {
      // Rate limiting
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
    const KentikQueries = new datasources.Kentik.Query(config.kenitkOptions);
    KentikQueries.ipActivity(req.params.targetIp)
      .then(response => {
        res.send(response);
        next(); 
        config.kenitkOptions.rateLimitConcurrentQueryRequests = 
          config.kenitkOptions.rateLimitConcurrentQueryRequests + 1;
      })
      .catch(reson => {
        if (reson.message == "No Data Found") {
          res.send(204, {
            totalTx: {},
            totalRx: {}
          });
        } else {
          res.send(new errors.InternalServerError(reson.message));
        }
        next();
        config.kenitkOptions.rateLimitConcurrentQueryRequests = 
          config.kenitkOptions.rateLimitConcurrentQueryRequests + 1;
      });
  };
};