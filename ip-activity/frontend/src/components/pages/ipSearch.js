/* global fetch */
/* global ZC */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

// React Elements
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import ZingGrid from "zinggrid";
import Zingchart from "../widgets/charts";
import ZinggridChart from "../widgets/gridRowCharts";
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import DataLoading from "../../assets/dataLoadingScreen";
import GetKentikPortalUrl from "../widgets/getKentikPortalUrl";

// Icons
import LinkIcon from '@material-ui/icons/LinkTwoTone';

// i11n Translation
import { withTranslation } from 'react-i18next';

const styles = theme => ({
  root: {
    flexGrow: 1,
    'text-align': 'center',
    width: '100%',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
  centerLookup: {
    'text-align': 'center',
    'width': '100%',
  }
});

const zinggridChart = new ZinggridChart();

window.renderZinggridLineChart = (ctv, cellRef, $cell) => {
  let zcRef = cellRef.querySelector('div');
  let id = `line-chart-${Math.floor(Math.random() * 99999)}`;
  zcRef.setAttribute('id', id);
  let mapValues = ctv.map(function(trend) {
    return trend.Close;
  });
  // render line chart
  zinggridChart.updateChart({
    id: id,
    timeSeries: [
      {
        values: mapValues,
      }
    ],
    width: 60,
    height: 40
  });
};

class IpAddressLookupLegacy extends React.Component {
  
  IPRegex = /(^((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|(0?[0-9]{1,2}))\.((25[0-5])|(1[0-9]{2})|(0?[0-9]{1,2}))\.((25[0-5])|(1[0-9]{2})|(0?[0-9]{1,2}))\.((25[0-5])|(1[0-9]{2})|(0?[0-9]{1,2}))$)|(^([0-9a-fA-F]{1,4}:{1,2}){1,7}[0-9a-f]{1,4}$)/;

  constructor(props) {
    super(props);
    this.zingchart = new Zingchart();
    this.GetKentikPortalUrl = new GetKentikPortalUrl();
  }
  
  state = {
    helperText: '',
    error: false,
    loading: false,
    txJson: [],
    rxJson: [],
    totalTx: [],
    totalRx: [],
    targetIp: '',
    country: '',
    asn: '',
    maxTxMbps: '',
    maxRxMbps: ''
  };
  
  componentDidMount() {}
  
  componentDidUpdate() {
    if (this.state.targetIp) {
      let totalTX = [];
      let totalRX = [];
      if (this.state.totalTx) {
        totalTX = this.state.totalTx.map((item) => {
          return parseFloat(item, 10);
        });
      } else {
        if (this.state.totalRx) {
          for(let i=0,l=this.state.totalRx.length; i<l; i++) {
            totalTX.push(0);
          }
        }
      }
      if (this.state.totalRx) {
        totalRX = this.state.totalRx.map((item) => {
          return parseFloat(item, 10);
        });
      } else {
        if (this.state.totalTx) {
          for(let i=0,l=this.state.totalTx.length; i<l; i++) {
            totalRX.push(0);
          }
        }
      }
      this.zingchart.updateChart({
        timeSeries: [
          {
            values: totalTX,
            text: 'Sent'
          },
          {
            values: totalRX,
            text: 'Recived'
          }
        ],
        xStep: this.state.step,
        xStart: this.state.start,
        title: '',
        id: 'ipLookupTotal'
      });
    }
  }
  
  getData = (targetIP) => {
    return new Promise ((resolve, reject) => {
      const url = '/query/ip/activity/' + targetIP;
      console.log(url);
      fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        cache: "no-cache"
      })
      .then(response => {
        if (response.status == 429) {
          console.log('To many calls, waiting 1 sec');
          setTimeout(() => {
            this.getData(targetIP)
            .then(text => {
              resolve(text);
            })
            .catch(err => {
              reject(err);
            });
          }, 
          1000);
        } else if (response.status == 204) {
          response.text()
          .then(data => {console.log("204 returened"); console.log(data)});
          resolve({
            tx: [],
            rx: [],
            totalTx: {},
            totalRx: {}
          });
        } else {
          response.json()
          .then(data => {
            if (data.code) {
              reject(data.message);
            } else {
              resolve(data);
            }
          })
          .catch(err => {
            reject(err);
          });
        }
      })
      .catch(err => {
        reject(err);
      });
    });
  }
  
  targetIpChange = (event) => {
    const { classes } = this.props;
    const { t } = this.props;
    
    if (event.target.value == this.state.targetIp) {
      
    } else if (this.IPRegex.test(event.target.value)) {
      this.setState({
        error: false,
        helperText: '',
        loading: true
      });
      const startGetDataTime = Date.now();
      const targetIP = event.target.value;
      this.getData(targetIP)
      .then(data => {
        console.log('Retrived data from server');
        console.log((Date.now() - startGetDataTime) / 1000 + 'sec');
        if (data.tx.length < 1 && data.rx.length < 1) {
          console.log("No data for this IP");
          this.setState({
            error: true,
            helperText: t('labels.query.noData'),
            loading: false
          });
        } else {
          console.log(data);
          this.setState({
            txJson: JSON.stringify(data.tx),
            rxJson: JSON.stringify(data.rx),
            step: data.totalRx.step,
            start: data.totalRx.startTime,
            targetIp: targetIP,
            country: data.totalTx.country || data.totalRx.country,
            asn: data.totalTx.asn || data.totalRx.asn,
            maxTxMbps: data.totalTx.maxMbps || 0,
            maxRxMbps: data.totalRx.maxMbps || 0,
            totalTx: data.totalRx.timeSeries,
            totalRx: data.totalTx.timeSeries,
            totalTxUrl: data.totalTxUrl,
            totalRxUrl: data.totalRxUrl,
            loading: false
          });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          error: true,
          helperText: t('labels.query.serverError'),
          loading: false
        });
      });
    } else {
      this.setState({
        error: true,
        helperText: t('labels.query.targetIpHelperText'),
        loading: false
      });
    }
  }
  
  catchReturn = (event) => {
    if (event.key === 'Enter') {
      this.targetIpChange(event);
      this.enterPresed = true;
    }
  }
  
  catchTargetIpBlur = (event) => {
    if (this.enterPresed) {
      this.enterPresed = false;
    } else {
      this.targetIpChange(event);
      this.enterPresed = false;
    }
  }
  
  ZingChartConfig = (type, series) => {
    return {
      type,
      theme: 'spark',
      tooltip: {
        visible: type != 'pie' ? false : true,
      },
      crosshairX:{},
      series,
    };
  };

  render() {
    const { classes } = this.props;
    const { t } = this.props;
    
    let dataDisplay = '';
    if (this.state.loading) {
      // Loading Data Screen
      dataDisplay = <DataLoading />;
    } else if (this.state.targetIp) {
      // We have data to show
      let zinggridRowChart = '';
      if (ZC.LICENSEKEY) {
        console.log('Zingchart License foud.  Adding charts to table rows');
        zinggridRowChart = <zg-column index="timeSeries" header="{t('labels.ipLookup.grid.chart)}" sort="false" renderer="renderZinggridLineChart"><div></div></zg-column>;
      } else {
        console.log('Zingchart license not foud.  Skipping adding charts to table rows as it will not fit with Zingchart Logo');
      }
      dataDisplay = <div>
        <div className={classes.root}>
          <Typography variant="subtitle2" gutterBottom>
            <Grid container spacing={24}>
              <Grid item xs={3}>
                <div>{t('labels.ipLookup.country')}: {this.state.country}</div>
              </Grid>
              <Grid item xs={3}>
                <div>{t('labels.ipLookup.as')}: {this.state.asn}</div>
              </Grid>
              <Grid item xs={3}>
                <div>{t('labels.ipLookup.maxSent')}: {this.state.maxTxMbps} Mbps&nbsp;
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      if (this.txURL && this.lastTargetIP == this.state.targetIp) {
                        window.open(this.txURL);
                      } else {
                        let kenitkPortal = window.open('/ibmLoading.gif');
                        this.GetKentikPortalUrl.url({
                          dimensions: [
                            "IP_dst",
                            "Port_dst",
                            "Proto",
                            "AS_dst",
                            "dst_geo_city",
                            "dst_geo_region",
                            "Geography_dst",
                            "i_device_id"
                          ],
                          filters: [{
                            "name": "",
                            "named": false,
                            "connector": "All",
                            "not": false,
                            "autoAdded": "",
                            "filters": [
                              {
                                "filterField": "inet_src_addr",
                                "operator": "ILIKE",
                                "filterValue": this.state.targetIp,
                              }
                            ],
                            "saved_filters": [],
                            "filterGroups": []
                          }],
                          options: {
                            lookback_seconds: 3600,
                          },
                        })
                        .then(result => {
                          this.txURL = result;
                          this.lastTargetIP = this.state.targetIp;
                          kenitkPortal.location.replace(result);
                        })
                        .catch(err => {
                          console.log(err);
                        });
                      }
                    }}
                  >
                    <LinkIcon />
                  </Link>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div>{t('labels.ipLookup.maxRecived')}: {this.state.maxRxMbps} Mbps&nbsp;
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      if (this.rxURL && this.lastTargetIP == this.state.targetIp) {
                        window.open(this.txURL);
                      } else {
                        let kenitkPortal = window.open('/ibmLoading.gif');
                        this.GetKentikPortalUrl.url({
                          dimensions: [
                            "IP_src",
                            "Port_src",
                            "Proto",
                            "AS_src",
                            "src_geo_city",
                            "src_geo_region",
                            "Geography_src",
                            "i_device_id"
                          ],
                          filters: [{
                            "name": "",
                            "named": false,
                            "connector": "All",
                            "not": false,
                            "autoAdded": "",
                            "filters": [
                              {
                                "filterField": "inet_dst_addr",
                                "operator": "ILIKE",
                                "filterValue": this.state.targetIp,
                              }
                            ],
                            "saved_filters": [],
                            "filterGroups": []
                          }],
                          options: {
                            lookback_seconds: 3600,
                          },
                        })
                        .then(result => {
                          this.rxURL = result;
                          this.lastTargetIP = this.state.targetIp;
                          kenitkPortal.location.replace(result);
                        })
                        .catch(err => {
                          console.log(err);
                        });
                      }
                    }}
                  >
                    <LinkIcon />
                  </Link>
                </div>
              </Grid>
            </Grid>
          </Typography>
        </div>
        <div>
          <Zingchart 
            id="ipLookupTotal" 
            width="100%" 
            height="400px" 
            title="" 
            ref={ ipLookupTotalChart => {
              this.ipLookupTotalChart = ipLookupTotalChart;
            }}
          />
        </div>
        <br />
        <div className="zingGridHolder">
          <zing-grid
            ref={grid => {
              this.grid = grid;
            }}
            data={this.state ? this.state.txJson : []}
            caption={t('query.ip.txChartTitle')}
            loading={this.state ? this.state.loading : false}
          >
            <zg-colgroup>
              <zg-column index="ipAddress" header={t('labels.ipLookup.grid.ipAddress')} type="text"></zg-column>
              <zg-column index="port" header={t('labels.ipLookup.grid.port')} type="number"></zg-column>
              <zg-column index="protocol" header={t('labels.ipLookup.grid.protocol')} type="text"></zg-column>
              <zg-column index="asn" header={t('labels.ipLookup.grid.asn')} type="text"></zg-column>
              <zg-column index="city" header={t('labels.ipLookup.grid.city')} type="text"></zg-column>
              <zg-column index="region" header={t('labels.ipLookup.grid.region')} type="text"></zg-column>
              <zg-column index="country" header={t('labels.ipLookup.grid.country')} type="text"></zg-column>
              <zg-column index="device" header={t('labels.ipLookup.grid.flowSource')} type="text"></zg-column>
              <zg-column index="maxMbps" header={t('labels.ipLookup.grid.maxMbps')} type="number"></zg-column>
              {zinggridRowChart}
            </zg-colgroup>
          </zing-grid>
        </div>
        <br />
        <div className="zingGridHolder">
          <zing-grid
            ref={grid => {
              this.grid2 = grid;
            }}
            data={this.state ? this.state.rxJson : []}
            caption={t('query.ip.rxChartTitle')}
            loading={this.state ? this.state.loading : false}
          >
            <zg-colgroup>
              <zg-column index="ipAddress" header={t('labels.ipLookup.grid.ipAddress')} type="text"></zg-column>
              <zg-column index="port" header={t('labels.ipLookup.grid.port')} type="number"></zg-column>
              <zg-column index="protocol" header={t('labels.ipLookup.grid.protocol')} type="text"></zg-column>
              <zg-column index="asn" header={t('labels.ipLookup.grid.asn')} type="text"></zg-column>
              <zg-column index="city" header={t('labels.ipLookup.grid.city')} type="text"></zg-column>
              <zg-column index="region" header={t('labels.ipLookup.grid.region')} type="text"></zg-column>
              <zg-column index="country" header={t('labels.ipLookup.grid.country')} type="text"></zg-column>
              <zg-column index="device" header={t('labels.ipLookup.grid.flowSource')} type="text"></zg-column>
              <zg-column index="maxMbps" header={t('labels.ipLookup.grid.maxMbps')} type="number"></zg-column>
              {zinggridRowChart}
            </zg-colgroup>
          </zing-grid>
        </div>
      </div>;
    }
    
    return (
      <div>
        <Tooltip title={t('labels.query.targetIpToolTip')} placement="top-end">
          <TextField
            required
            id="targetIp"
            label={t('labels.query.targetIp')}
            placeholder="8.8.8.8"
            helperText={this.state ? this.state.helperText : ''}
            error={this.state ? this.state.error : false}
            className={classes.textField}
            margin="normal"
            onBlur={this.catchTargetIpBlur}
            onKeyPress={this.catchReturn}
          />
        </Tooltip>
        {dataDisplay}
      </div>
    );  
  }
}

const IpAddressLookup = withTranslation()(IpAddressLookupLegacy);

IpAddressLookup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IpAddressLookup);