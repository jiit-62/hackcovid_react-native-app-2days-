import React from 'react';
import { Text, PermissionsAndroid, View, Button } from 'react-native'
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps'
import Animated from 'react-native-reanimated';
import Geocoder from 'react-native-geocoding'

class tracker extends React.Component {
  state = {
    counter: 0,
    latitude: 37.33233,
    longitude: -122.03121,
    coordinates: []
  }
  counter = 0;
  componentDidMount() {
    Geocoder.init("AIzaSyDOwch8aYR7yIp6-CGu52c9sv82J1V3GGI")
    Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log("position2:", latitude, longitude)
        this.setState({
          latitude,
          longitude
        })
      },
      err => console.log("error reported2:", err)

    )
    Geocoder.from("nehru nagar ghaziabad").then(json => {
      let location = json.results[0].geometry.location;
      console.log("location:", location);
    }).catch(err => console.log("err in geocoding:", err))
  }
  fakePointer = (e) => {
    const latitude = this.state.latitude + Math.random() * 0.0011 - 0.0001;
    const longitude = this.state.longitude + Math.random() * 0.0011 - 0.0001;
    this.setState({ latitude, longitude })
    this.setState(prevState => ({
      coordinates: [
        ...prevState.coordinates,
        { longitude, latitude }
      ]
    }))
  }
  render() {
    console.log(this.state.coordinates)
    return (
      <View>
        <Text>Tracker here</Text>
        <MapView
          style={{ height: 300 }}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }}
        >
          <Polyline coordinates={this.state.coordinates} strokeWidth={4} />
          <Marker
            ref={marker => this.marker = marker}
            draggable
            coordinate={this.state}
            onDrag={e => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              this.setState({ latitude, longitude })
              this.setState(prevState => ({
                coordinates: [
                  ...prevState.coordinates,
                  { longitude, latitude }
                ]
              }))
            }}
          />
        </MapView>
        <Button title="start timmer" onPress={() => { this.timmer = setInterval(this.fakePointer, 500) }} />
        <Button title="Stop timmer" onPress={() => { this.counter = 0; clearInterval(this.timmer) }} />
      </View>
    )
  }
}

export default tracker;