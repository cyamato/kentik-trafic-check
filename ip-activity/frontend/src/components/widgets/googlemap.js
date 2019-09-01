
import React from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

const style = {
  width: '100%',
  height: '400px',
};

export class MapContainer extends React.Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
  };
 
  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
 
  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };
  
  render() {
    return (
      <Map 
        google={this.props.google} 
        zoom={14}
        style={style}
        onClick={this.onMapClicked}
      >
        <Marker onClick={this.onMarkerClick}
          name={this.props.markerName}
          position={{lat: this.props.lat, lng: this.props.lon}}
        />
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
        >
          <div>
            <h1>{this.state.selectedPlace.name}</h1>
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey,
    language: props.language,
  })
)(MapContainer);