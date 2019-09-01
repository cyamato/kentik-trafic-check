/* global fetch */
/* global ZC */
/* global index */
/* global record */
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

// React Elements
import ZingGrid from "zinggrid";
import Zingchart from "../widgets/charts";
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import GetKentikPortalUrl from "../widgets/getKentikPortalUrl";
import GetDeviceFlowsFromKentik from "../widgets/getDeviceFlowsFromKentik";
import GoogleMap from "../widgets/googlemap";

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
  },
});

const test = () => {
  console.log('test');
};

class deviceListLegacy extends React.Component {
  state = {
    deviceListData: [],
    selectedDevice: "",
    markerName: "",
    markerLat: 0,
    markerLon: 0,
  }
  
  constructor(props) {
    super(props);
    this.zingchart = new Zingchart();
    this.getKentikPortalUrl = new GetKentikPortalUrl();
    this.getDeviceFlowsFromKentik = new GetDeviceFlowsFromKentik();
  }
  
  showChartData(name) {
    this.getDeviceFlowsFromKentik.query({deviceName: name})
    .then(result => {
      let options = {
        id: 'selectedDeviceFlowChart',
        title: result[0].name,
        timeSeries: [{
          values: result[0].timeSeries,
          text: result[0].name,
        }],
        xStep: result[0].timeStep,
        xStart: result[0].startTime,
        xLabel: 'flows/sec',
        width: '100%',
        height: '200px',
      };
      this.zingchart.updateChart(options);
    })
    .catch(reson => {
      console.log(reson);
    });
  }
  
  gridLink(name) {
    console.log('Link Clicked for ', name);
    let kenitkPortal = window.open('/ibmLoading.gif');
    this.getKentikPortalUrl.url({
      dimensions: [],
      filters: [],
      options: {
        lookback_seconds: 3600,
        viz_type: "line",
        aggregateTypes: [
          "avg_flows_per_sec",
          "p95th_flows_per_sec",
          "max_flows_per_sec",
          "p95th_bits_per_sec",
          "p95th_pkts_per_sec",
          "p95th_max_sample_rate"
        ],
        aggregateThresholds: {
          "avg_bits_per_sec": 0,
          "p95th_bits_per_sec": 0,
          "max_bits_per_sec": 0,
          "avg_flows_per_sec": 0,
          "p95th_flows_per_sec": 0,
          "max_flows_per_sec": 0,
          "p95th_pkts_per_sec": 0,
          "p95th_max_sample_rate": 0
        },
        aggregates: [
          {
            "value": "avg_flows_per_sec",
            "column": "trautocount",
            "columnPrefixes": [
              "f_fumlat",
              "f_fsumloc"
            ],
            "fn": "average",
            "label": "Flows/s Average",
            "unit": "fps",
            "group": "Flows/s",
            "origLabel": "Average",
            "sample_rate": 1,
            "raw": true,
            "name": "avg_flows_per_sec"
          },
          {
            "value": "p95th_flows_per_sec",
            "column": "trautocount",
            "columnPrefixes": [
              "f_fumlat",
              "f_fsumloc"
            ],
            "fn": "percentile",
            "rank": 95,
            "label": "Flows/s 95th Percentile",
            "unit": "fps",
            "group": "Flows/s",
            "origLabel": "95th Percentile",
            "sample_rate": 1,
            "name": "p95th_flows_per_sec"
          },
          {
            "value": "max_flows_per_sec",
            "column": "trautocount",
            "columnPrefixes": [
              "f_fumlat",
              "f_fsumloc"
            ],
            "fn": "max",
            "label": "Flows/s Max",
            "unit": "fps",
            "group": "Flows/s",
            "origLabel": "Max",
            "sample_rate": 1,
            "name": "max_flows_per_sec"
          },
          {
            "value": "p95th_bits_per_sec",
            "column": "f_sum_both_bytes",
            "fn": "percentile",
            "label": "Bits/s Sampled at Ingress + Egress 95th Percentile",
            "rank": 95,
            "unit": "bytes",
            "group": "Bits/s Sampled at Ingress + Egress",
            "origLabel": "95th Percentile",
            "sample_rate": 1,
            "name": "p95th_bits_per_sec"
          },
          {
            "value": "p95th_pkts_per_sec",
            "column": "f_sum_both_pkts",
            "fn": "percentile",
            "rank": 95,
            "label": "Packets/s Sampled at Ingress + Egress 95th Percentile",
            "unit": "packets",
            "group": "Packets/s Sampled at Ingress + Egress",
            "origLabel": "95th Percentile",
            "sample_rate": 1,
            "name": "p95th_pkts_per_sec"
          },
          {
            "value": "p95th_max_sample_rate",
            "column": "f_max_sample_rate",
            "fn": "percentile",
            "rank": 95,
            "label": "Sample Rate Max 95th Percentile",
            "unit": "max_sample_rate",
            "group": "Sample Rate Max",
            "origLabel": "95th Percentile",
            "sample_rate": 0.01,
            "name": "p95th_max_sample_rate"
          }
        ],
        outsort: "avg_flows_per_sec",
        fastData: "Full",
        device_name: [name],
      },
    })
    .then(result => {
      this.rxURL = result;
      this.lastTargetIP = this.state.targetIp;
      kenitkPortal.location.replace(result);
    })
    .catch(err => {
      console.log(err);
      kenitkPortal.close();
    });
  }

  componentDidMount() {
    this.grid.addEventListener('cell:click', (e) => {
      if (e.detail.ZGData.fieldIndex == "url") {
        this.gridLink(e.detail.ZGData.value);
      }
    });
    this.grid.addEventListener('record:click', (e) => {
      this.showChartData(e.detail.ZGData.data.name);
    });
    this.getData()
    .then(response => {
      console.log('Got Data');
      this.setState({
        deviceListData: response,
      });  
    })
    .catch(err => {
      console.log(err);
      this.setState({
      });
    });
  }
  
  componentDidUpdate() {}
  
  getData = () => {
    return new Promise ((resolve, reject) => {
      const url = '/devices';
      console.log(url);
      const startGetDataTime = Date.now();
      fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        cache: "no-cache"
      })
      .then(response => {
        if (response.status == 429) {
          console.log('To many calls, waiting 1 sec');
          setTimeout(() => {
            this.getData()
            .then(text => {
              resolve(text);
            })
            .catch(err => {
              reject(err);
            });
          }, 
          1000);
        }
        else {
          response.json()
          .then(data => {
            console.log((Date.now() - startGetDataTime) / 1000 + 'sec');
            if (data.code) {
              reject(data.message);
            } else {
              let deviceList = [];
              for (let i=0,l=data.length; i<l; i++) {
                deviceList.push({
                  name: data[i].name,
                  description: data[i].description,
                  siteName: data[i].site.name,
                  siteLat: data[i].site.lat,
                  siteLon: data[i].site.lon,
                  ips: data[i].ips.join('<br />'),
                  url: data[i].name,
                });
              }
              resolve(deviceList);
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

  render() {
    const { classes } = this.props;
    const { t } = this.props;
    
    let dataDisplay = '';
    dataDisplay = <div>
      <br />
      <Card className={classes.card}>
        <CardContent>
          <Zingchart 
            id="selectedDeviceFlowChart" 
            width="100%" 
            height="300px" 
            title={this.state.selectedDevice} 
            ref={ selectedDeviceFlowChart => {
              this.selectedDeviceFlowChart = selectedDeviceFlowChart;
            }}
          />
        </CardContent>
      </Card>
      <br />
      <div>
        <zing-grid
          ref={grid => {
            this.grid = grid;
          }}
          data={JSON.stringify(this.state.deviceListData)}
          caption={t('labels.devices.grid.title')}
          loading={this.state ? this.state.loading : false}
          sorter
          filter
        >
          <zg-colgroup>
            <zg-column index="name" header={t('labels.devices.grid.name')} type="text"></zg-column>
            <zg-column index="description" header={t('labels.devices.grid.description')} type="text"></zg-column>
            <zg-column index="siteName" header={t('labels.devices.grid.siteName')} type="text"></zg-column>
            <zg-column index="ips" header={t('labels.devices.grid.ips')} type="text"></zg-column>
            <zg-column index="url" header={t('labels.devices.grid.kentikPortalUrlLink')} type="custom" filter="false" sort="false">
              <IconButton>
                <LinkIcon />
              </IconButton>
            </zg-column>
          </zg-colgroup>
        </zing-grid>
      </div>
    </div>;
    
    return (
      <div>
        {dataDisplay}
      </div>
    );  
  }
}

const deviceList = withTranslation()(deviceListLegacy);

deviceList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(deviceList);