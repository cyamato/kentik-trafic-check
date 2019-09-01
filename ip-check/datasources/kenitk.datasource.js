'use strict';
const restifyClient = require('restify-clients');
const fs = require('fs');

let _user = null;
let _token = null;
let _baseUrl = null;

const setUser=(user) => {
  _user = user;
};

const setToken=(token) => {
  _token = token;
};

const setBaseUrl=(url) => {
  _baseUrl = url;
};

const setAuth=(user, token) => {
  _user = user;
  _token = token;
}

class Kentik {
  constructor(options) {
    options = options || {};
    _baseUrl = options.baseUrl || _baseUrl;
    this.baseUrl = _baseUrl || 'https://api.kentik.com';
    _user = options.user || _user;
    _token = options.token || _token;
    this.headers = {
      'X-CH-Auth-Email': _user,
      'X-CH-Auth-API-Token': _token,
    };
    this.client = restifyClient.createJsonClient({
      url: this.baseUrl,
      headers: this.headers
    });
  }
}

class Query extends Kentik{
  ipActivity(targetIP, options) {
    const client = this.client;
    return new Promise((resolve, reject) => {
      options = options || {};
      options.lookBack = options.lookBack || 2592000;
      options.topX = options.topX || 10;
      fs.readFile('./datasources/query.ipActivity.json', (err, data) => {
        if (err) {
          reject(err);
        } else {
          let query = JSON.parse(data);
          // Modify the query
          query.queries[0].query.filters_obj.filterGroups[0].filters[0]
            .filterValue = targetIP;
          query.queries[0].query.lookback_seconds = options.lookBack;
          
          query.queries[1].query.filters_obj.filterGroups[0].filters[0]
            .filterValue = targetIP;
          query.queries[1].query.lookback_seconds = options.lookBack;
          
          client.post('/api/v5/query/topXdata', 
            query, 
            (err, req, res, obj) => {
            if (err) {
              reject(err);
              return;
            } else {
              let activity = {
                totalTx: {},
                totalRx: {}
              };
              
              // Extract the datasets from the Query return
              let txTotalResults = [];
              let rxTotalResults = [];
              for (let i=0, l=obj.results.length; i<l; i++) {
                if (obj.results[i].bucket == "totalTx") 
                  txTotalResults = obj.results[i].data;
                else if (obj.results[i].bucket == "totalRx") 
                  rxTotalResults = obj.results[i].data;
              }
              obj = null;
              
              // Check for results
              if (txTotalResults.length < 1 && rxTotalResults.length < 1) {
                reject(new Error('No Data Found'));
              } else {
                // Process total transmit acitivty
                if (txTotalResults.length > 0) {
                  let timeSeries = [];
                  let startTime;
                  let timeStep;
                  if (txTotalResults[0].timeSeries) {
                    startTime = txTotalResults[0].timeSeries.both_bits_per_sec.flow[0][0];
                    timeStep = txTotalResults[0].timeSeries.both_bits_per_sec.flow[0][2];
                    for (let it=0, 
                      lt=txTotalResults[0].timeSeries.both_bits_per_sec.flow
                      .length;
                      it<lt;it++) {
                        timeSeries.push(
                          (txTotalResults[0]
                            .timeSeries
                            .both_bits_per_sec
                            .flow[it][1] / 1000000)
                          .toFixed(2),
                        );
                    }
                  }
                  activity.totalTx = {
                    maxMbps: (txTotalResults[0].max_bits_per_sec / 1000000).toFixed(2),
                    startTime: startTime,
                    step: timeStep*1000,
                    timeSeries: timeSeries,
                  };
                  timeSeries = null;
                  txTotalResults = null;
                }
                
                // Process total recived activity
                if (rxTotalResults.length > 0) {
                  let timeSeries = [];
                  let startTime;
                  let timeStep;
                  if (rxTotalResults[0].timeSeries) {
                    startTime = rxTotalResults[0].timeSeries.both_bits_per_sec.flow[0][0];
                    timeStep = rxTotalResults[0].timeSeries.both_bits_per_sec.flow[0][2];
                    for (let it=0, 
                      lt=rxTotalResults[0].timeSeries.both_bits_per_sec.flow
                      .length;
                      it<lt;it++) {
                        timeSeries.push(
                          (rxTotalResults[0]
                            .timeSeries
                            .both_bits_per_sec
                            .flow[it][1] / 1000000)
                          .toFixed(2),
                        );
                    }
                  }
                  activity.totalRx = {
                    maxMbps: (rxTotalResults[0].max_bits_per_sec / 1000000).toFixed(2),
                    startTime: startTime,
                    step: timeStep*1000,
                    timeSeries: timeSeries,
                  };
                  timeSeries = null;
                  rxTotalResults = null;
                }
                
                resolve(activity);
              }
            }
          });
        }
      });
    });
  }
  portalURL(dimensions, filters, options) {
    const client = this.client;
    return new Promise((resolve, reject) => {
      fs.readFile('./datasources/query.ipActivity.json', (err, data) => {
        if (err) {
          reject(err);
        } else {
          let query = JSON.parse(data);
          options = options || {};
          query = query.queries.pop();
          query.bucket = "Left +Y Axis";
          query.query.viz_type = options.viz_type || "stackedArea";
          query.query.depth = options.depth || 100;
          query.query.topx = options.topx || 8;
          query.query.lookback_seconds = options.lookback_seconds || query.query.lookback_seconds; 
          query.query.aggregateTypes = options.aggregateTypes || ["max_bits_per_sec"];
          query.query.aggregateThresholds = options.aggregateThresholds || {"max_bits_per_sec": 0};
          query.query.aggregates = options.aggregates || query.query.aggregates;
          query.query.outsort = options.outsort || "max_bits_per_sec";
          query.query.metric = options.metric || "bytes";
          query.query.filterDimensions.connector = options.filterConnector || "All";
          query.query.filters_obj.connector = options.filterConnector || "All";
          query.query.filters_obj.filterGroups = filters || [];
          query.query.fastData = options.fastData || "Auto";
          if (!dimensions || dimensions.length < 1) {
            query.query.dimension = ["Traffic"];
          } else {
            query.query.dimension = dimensions;
          }
          if (options.device_name) {
            query.query.all_devices = false;
            query.query.device_name = options.device_name;
          }
          query = {"queries": [query]};
          
          client.post('/api/v5/query/url', query, (err, req, res, obj) => {
            if (err) {
              reject(err);
              return;
            } else {
              resolve(obj);
            }
          });
        }
      });
    });
  }
  deviceFps(targetDevices, options) {
    const client = this.client;
    return new Promise((resolve, reject) => {
      options = options || {};
      options.lookBack = options.lookBack || 2592000;
      options.topX = options.topX || 40;
      fs.readFile('./datasources/query.deviceFps.json', (err, data) => {
        if (err) {
          reject(err);
        } else {
          if (!Array.isArray(targetDevices)) targetDevices = [targetDevices];
          let query = JSON.parse(data);
          query.queries[0].query.device_name = targetDevices;
          query.queries[0].query.lookback_seconds = options.lookBack;
          query.queries[0].query.depth = options.topX;
          query.queries[0].query.topx = options.topX;
          
          client.post('/api/v5/query/topXdata',
            query, 
            (err, req, res, obj) => {
            if (err) {
              reject(err);
              return;
            } else {
              let devices = [];
              for (let i=0, l=obj.results[0].data.length; i<l; i++) {
                let timeSeries = [];
                let ts = obj.results[0].data[0].timeSeries.flows_per_sec.flow;
                for (let it=0,lt=ts.length; it<lt; it++) {
                  timeSeries.push(Math.ceil(ts[it][1]));
                }
                devices.push({
                  name: obj.results[0].data[i].i_device_name,
                  maxFps: Math.ceil(obj.results[0].data[i].max_flows_per_sec),
                  startTime: obj.results[0].data[0].timeSeries.flows_per_sec.flow[0][0],
                  timeStep: obj.results[0].data[0].timeSeries.flows_per_sec.flow[0][2]*1000,
                  timeSeries: timeSeries
                });
              }
              resolve(devices);
            }
          });
        }
      });
    });
  }
}

class Devices extends Kentik{
  getDevices() {
    const client = this.client;
    return new Promise((resolve, reject) => {
      client.get('/api/v5/devices', (err, req, res, obj) => {
        if (err) {
          reject(err);
          return;
        } else {
          let devices = [];
          for (let i=0,l=obj.devices.length; i<l; i++){
            let ips = obj.devices[i].sending_ips;
            if (obj.devices[i].device_bgp_neighbor_ip){
              if (!ips.includes(obj.devices[i].device_snmp_ip))
                ips.push(obj.devices[i].device_snmp_ip);
            }
            if (obj.devices[i].device_bgp_neighbor_ip){
              if (!ips.includes(obj.devices[i].device_bgp_neighbor_ip))
                ips.push(obj.devices[i].device_bgp_neighbor_ip);
            }
            devices.push({
              name: obj.devices[i].device_name,
              description: obj.devices[i].device_description,
              site: {
                name: obj.devices[i].site.site_name,
                lat: obj.devices[i].site.lat,
                lon: obj.devices[i].site.lon
              },
              ips: ips
            });
          }
          resolve(devices);
          return;
        }
      });
    });
  }
  findDeviceByIp(deviceIp) {
    return new Promise((resolve, reject) => {
      this.getDevices()
        .then(response => {
          let targetDevice = null;
          for(let i=0,l=response.length; i<l; i++){
            for (let ii=0,li=response[i].ips.length; ii<li; ii++){
              if (response[i].ips[ii] == deviceIp) {
                targetDevice = response[i];
                break;
              }
            }
            if (targetDevice) break;
          }
          if (!targetDevice) {
            resolve([]);
            return;
          } else {
            const query = new Query(_baseUrl, _token, _user);
            query.deviceFps(targetDevice.name)
              .then(response => {
                targetDevice.maxFps = response[0].maxFps;
                targetDevice.timeSeries = response[0].timeSeries;
                resolve(targetDevice);
                return;
              })
              .catch(reson => {
                reject(reson);
                return;
              });
          }
        })
        .catch(reson => {
          reject(reson);
          return;
        });
    });
  }
}

module.exports = {
    Devices: Devices,
    Query: Query,
    setUser: setUser,
    setToken: setToken,
    setBaseUrl: setBaseUrl,
    setAuth: setAuth,
};