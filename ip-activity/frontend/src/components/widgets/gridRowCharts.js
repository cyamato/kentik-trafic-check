import React from 'react';
import ReactDOM from 'react-dom';
import zingchart from 'zingchart';

class ZinggridChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  
  componentDidMount() {
    
  }
  
  updateChart (options) {
    if (!options) options = {};
    let config = {
      id: options.id,
      width: options.width,
      height: options.height,
      data: {
        type: 'line',
        noData: {
          text: options.noData || '',
          fontSize: 6,
        },
        series: options.timeSeries || [{values: []}]
      }
    };
    if (options.step && options.start) {
      config.data.scaleX.step = options.step;
      config.data.scaleX["min-value"] = options.start;
    }
    zingchart.render(config);
  }
  
  render() {
    return; 
  }
}

export default ZinggridChart;