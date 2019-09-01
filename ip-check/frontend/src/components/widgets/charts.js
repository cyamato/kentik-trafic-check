import React from 'react';
import ReactDOM from 'react-dom';
import zingchart from 'zingchart';

class Zingchart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    zingchart.TOUCHZOOM = 'pinch';
  }
  
  componentDidMount() {
    
  }
  
  updateChart(options) {
    if (!this.props) this.props = {}; 
    if (!options) options = {};
    options.xLabel = options.xLabel || "Mbps";
    let config = {
      id: this.props.id || options.id,
      width: options.width || this.props.width,
      height: options.height || this.props.height,
      transform: {
        type:"date",
        all:"%Y-%mm/%dd<br>%H:%i:%sZ"
      },
      utc: true,
      data: {
        type: 'area',
        title: {
          text: options.title || this.props.title
        },
        noData: {
          text: options.noData || '',
          fontSize: 20,
        },
        crosshairX: {
          plotLabel: {
            text: '%t: %v ' + options.xLabel
          }
        },
        scaleX: {
          label: {
            text: 'Date & Time UTC'
          },
          transform : {
            type : 'date',
            item : {
              visible : true
            },
            all:"%Y-%mm/%dd<br>%H:%i:%sZ"
          }
        },
        scaleY: {
          guide: {
            visible: false
          },
          label: {
            text: options.xLabel
          }
        },
        plot: {
          aspect: 'spline'
        },
        series: options.timeSeries || [{values: []}]
      }
    };
    if (options.xStep && options.xStart) {
      config.data.scaleX.step = options.xStep;
      config.data.scaleX.minValue = options.xStart;
    }
    if (options.yMax) {
      config.data.scaleY.minValue = 0;
      config.data.scaleY.maxValue = options.yMax;
    }
    zingchart.render(config);
    return config;
  }
  
  render() {
    return (<div id={this.props.id}></div>); 
  }
}

export default Zingchart;