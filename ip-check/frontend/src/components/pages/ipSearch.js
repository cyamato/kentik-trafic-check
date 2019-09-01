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
import Zingchart from "../widgets/charts";
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
    'text-align': 'left',
    width: '100%',
  },
  base: {
    flexGrow: 1,
    'text-align': 'center',
    width: '100%',
  },
  logoButton: {
    width: '90px',
  },
  logoTag: {
    width: '70px',
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
    totalTx: [],
    totalRx: [],
    targetIp: '',
    maxTxMbps: '',
    maxRxMbps: ''
  };
  
  kentikDashbaordId = "6626";
  
  dashbaordQueryString = {
    "filters":{
      "connector":"All",
      "filterGroups":[],
    },
    "lookback_seconds":3600,
    "from_to_lookback":3600,
    "time_format":"UTC",
    "starting_time":"",
    "ending_time":"",
    "all_devices":true,
    "device_name":[],
    "device_labels":[],
    "device_sites":[],
    "device_types":[],
    "parametric_fields":[
      {
        "type":"ip",
        "value":"8.8.8.8",
        "label":"IP Address",
        "question":"IP Address or CIDR"
      }
    ]
  }
  
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
        id: 'ipLookupTotal',
        width: '100%',
      });
    }
  }
  
  getData = (targetIP) => {
    return new Promise ((resolve, reject) => {
      this.dashbaordQueryString.parametric_fields.value = targetIP;
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
        // Check if there is any activity
        if (data.totalRx.maxMbps < 0.001 && data.totalTx.maxMbps < 0.001) {
          console.log("No data for this IP");
          this.setState({
            error: true,
            helperText: t('labels.query.noData'),
            loading: false
          });
        } else {
          console.log(data);
          this.setState({
            step: data.totalRx.step,
            start: data.totalRx.startTime,
            targetIp: targetIP,
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
      dataDisplay = <div className={classes.base}>
        <div className={classes.base}>
          <Typography variant="subtitle2" gutterBottom>
            <Grid container spacing={24}>
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
              <Grid item xs={3}>
                <div>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                      window.open('https://portal.kentik.com/library/dashboard/'+this.kentikDashbaordId+'/urlParams/'+encodeURI(JSON.stringify(this.dashbaordQueryString)));
                    }}
                  >
                    View In <img src="/img/kentik_logo_r.svg" className={classes.logoButton} />
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
      </div>;
    }
    
    return (
      <div className={classes.root}>
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
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Powered by <img src="/img/kentik_logo_r.svg" className={classes.logoTag} />
          </Typography>
        </div>
      </div>
    );  
  }
}

const IpAddressLookup = withTranslation()(IpAddressLookupLegacy);

IpAddressLookup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IpAddressLookup);