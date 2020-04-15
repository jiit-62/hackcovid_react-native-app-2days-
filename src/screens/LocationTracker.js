import React from 'react'
import { Button, PermissionsAndroid, Platform, TextInput, Text, View, Switch } from 'react-native'
import io from 'socket.io-client'
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker } from 'react-native-maps'
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message'

class Try extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneno: this.props.navigation.getParam('phoneno'),
      users: new Map(),
      currentLocation: {
        latitude: 0,
        longitude: 0
      },
      allowsGPS: true
    }
  }
  async componentDidMount() {
    this.socket = io("http://900e825d.ngrok.io");
    this.socket.on('connect', () => console.log("connected"))
    this.socket.on("position", mssg => {
      if (mssg.phoneno) {
        let users = this.state.users;
        users.set(mssg.phoneno, {
          latitude: mssg.latitude,
          longitude: mssg.longitude,
          phoneno: mssg.phoneno,
          allowsGPS: mssg.allowsGPS
        })
        console.log("users:", users)
        this.setState({ users })
      }
    })

    let granted;
    if (Platform.OS == "android") {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permissions',
          message: 'LocationTracker needs to access your location',
          buttonNegative: 'NO',
          buttonPositive: 'YES'
        }
      )
    }

    if (granted == PermissionsAndroid.RESULTS.GRANTED || Platform.OS == 'ios') {
      Geolocation.watchPosition(
        position => {
          this.setState({ currentLocation: position.coords })
        },
        error => console.log("err in geolocation:", error),
        {
          enableHighAccuracy: true,
          distanceFilter: 0.1
        }
      )
    } else {
      console.log("location permission denied")
    }
  }

  deg2rad = (deg) => {
    return deg * (Math.PI / 180)
  }

  getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("phoneno:", this.state.phoneno);
    console.log('prevstate:', prevState.currentLocation)
    console.log("currentstate:", this.state.currentLocation)
    if (
      prevState.phoneno != this.state.phoneno ||
      JSON.stringify(prevState.currentLocation) != JSON.stringify(this.state.currentLocation) ||
      prevState.allowsGPS != this.state.allowsGPS
    ) {
      console.log("phoneno:", this.state.phoneno)
      console.log("distance:", this.getDistanceFromLatLonInKm(
        prevState.currentLocation.latitude,
        prevState.currentLocation.longitude,
        this.state.currentLocation.latitude,
        this.state.currentLocation.longitude
      ))
      this.socket.emit("position", {
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
        phoneno: this.state.phoneno,
        allowsGPS: this.state.allowsGPS
      })
    }
  }

  toggleGPS = () => {
    this.setState({ allowsGPS: !this.state.allowsGPS })
  }

  getNeighbourUsers = () => {
    let usersArray = Array.from(this.state.users.values());
    return usersArray.filter(user => {
      let distance = this.getDistanceFromLatLonInKm(
        user.latitude,
        user.longitude,
        this.state.currentLocation.latitude,
        this.state.currentLocation.longitude
      )
      if (distance < 0.2) {
        return true
      } else {
        return false
      }
    })
  }

  render() {
    let usersArray = Array.from(this.state.users.values())
    return (
      <View>
        <MapView
          ref={ref => this.map = ref}
          style={{ height: 350 }}
          initialRegion={{
            latitude: 36.81808,
            longitude: -98.640297,
            latitudeDelta: 60.0001,
            longitudeDelta: 60.0001
          }}
        >
          {this.getNeighbourUsers().map(item => {
            if (item.allowsGPS) {
              return (
                <Marker
                  key={item.phoneno}
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude
                  }}
                  ref={marker => this.marker = marker}
                ></Marker>
              )
            } else {
              return null
            }
          })}
        </MapView>
        <Text style={{ margin: 10, fontWeight: "bold" }}>
          {(!this.state.allowsGPS) ? "Your location view is hidden. Click the toggle to let others view your location" :
            "You are visbile to others. Click the toggle to hide your location view"}
        </Text>
        <Switch
          value={this.state.allowsGPS}
          onValueChange={this.toggleGPS}
        />
        <Text style={{ margin: 10, fontWeight: "bold" }}>{"There are " + this.getNeighbourUsers().length + " users near you"}</Text>
        <Button title="show flash message" onPress={() => {
          console.log("pressed")
          showMessage({
            message: "ALERT PLEASE!!!",
            type: "danger",
            position: 'bottom',
            autoHide: false,
            description: "Your are found near to covid victim. Be alert and safe",
            icon: { icon: "auto", position: 'left' }
          })
        }} />
      </View>
    )
  }
}

Try.navigationOptions = {
  title: "Live-Location-Tracker"
}
export default Try