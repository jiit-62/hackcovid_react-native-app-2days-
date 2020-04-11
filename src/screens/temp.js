import React from 'react'
import { Button, PermissionsAndroid, Platform, TextInput, Text, View } from 'react-native'
import io from 'socket.io-client'
import Geolocation from 'react-native-geolocation-service'

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneno: "",
      users: new Map(),
      currentLocation: {
        latitude: 0,
        longitude: 0
      }
    }
  }
  async componentDidMount() {
    this.socket = io("http://192.168.1.4:3000/");
    this.socket.on('connect', () => console.log("connected"))
    this.socket.on("position", mssg => {
      if (mssg.phoneno) {
        let users = this.state.users;
        users.set(mssg.phoneno, {
          latitude: mssg.latitude,
          longitude: mssg.longitude,
          phoneno: mssg.phoneno
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
  componentDidUpdate(prevProps, prevState) {
    console.log("phoneno:", this.state.phoneno);
    console.log('prevstate:', prevState.currentLocation)
    console.log("currentstate:", this.state.currentLocation)
    if (prevState.phoneno != this.state.phoneno || JSON.stringify(prevState.currentLocation) != JSON.stringify(this.state.currentLocation)) {
      console.log("phoneno:", this.state.phoneno)
      this.socket.emit("position", {
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
        phoneno: this.state.phoneno
      })
    }
  }
  render() {
    return (
      <View>
        <Text>Enter your phone number</Text>
        <TextInput onChangeText={(phoneno) => {
          if (phoneno) {
            if (phoneno.match(/^\d{10}$/)) {
              this.setState({ phoneno })
            }
          }
        }}></TextInput>
      </View>
    )
  }
}