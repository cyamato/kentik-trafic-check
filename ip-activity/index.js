'use strict';
const restify = require('restify');
const errors = require('restify-errors');
const yaml = require('js-yaml');
const fs = require('fs');
const bunyan = require('bunyan');

let config = {};
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

const server = restify.createServer();

server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.use(restify.plugins.throttle(config.rateLimiter));
let inflightRateLimiter = {
  limit: config.rateLimiter.limit,
  err: new errors.InternalServerError(),
  server: server
};

let throttle = restify.plugins.inflightRequestThrottle(inflightRateLimiter);

// server.pre(throttle);

const TokenBucket = require('simple-token-bucket');
let kentikTokenBuket = new TokenBucket({
  capacity: config.kenitkOptions.rateLimitPerHr,
  fillQuantity: 1,
  // fillTime: 3600000/config.kenitkOptions.rateLimitPerHr,
  fillTime: 3600,
  initialCapacity: config.kenitkOptions.rateLimitPerHr
});
config.kenitkOptions.tokenBuket = kentikTokenBuket;
const controllers = require('./controllers')(config);

const serverPort = process.env.PORT;
const serverIpAddress = process.env.IP;

server.get('/devices', throttle, controllers.getKentikDevices);
server.get('/device/ip/:targetIp', throttle, controllers.getKentikDeviceByIp);
server.get('/device/flow/:name', throttle, controllers.getKentikDevicesFlows);
server.get('/query/ip/activity/:targetIp', throttle, controllers.getActivityForIp);
server.post('/query/url', throttle, controllers.getPortalUrl);

server.get('/*', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.html',
  charSet: 'utf-8',
  maxAge: 1
}));

server.on('NotFound', function(req, res, err, next) {
  res.redirect({
    pathname: '/',
    permanent: true,
  }, next);
});

let ringbuffer = new bunyan.RingBuffer({ limit: 100 });

server.on('after', restify.plugins.auditLogger({
  log: bunyan.createLogger({
    name: 'flowCheck',
    streams: [{
      level: 'info',
      stream: process.stdout,
    },{
      level: 'info',
      path: './audit.log',
    },{
      level: 'error',
      stream: process.stderr,
    },
    {
        level: 'trace',
        type: 'raw',    // use 'raw' to get raw log record objects
        stream: ringbuffer
    }],
  }),
  event: 'after',
  server: server,
  printLog : true,
  body: true,
}));

server.listen(serverPort, serverIpAddress, function() {
  console.log('%s listening at %s', server.name, server.url);
});