import React from 'react'
import { Button, PermissionsAndroid, Platform, TextInput, Text, View, Switch, TouchableOpacity } from 'react-native'
import io from 'socket.io-client'
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker } from 'react-native-maps'
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message'
import NotifService from "../components/NotifService"

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
    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }

  async componentDidMount() {
    this.socket = io("https://location-trackerserver.herokuapp.com/");
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
        if (!this.state.users.has(mssg.phoneno)) {
          console.log("user not present")
          this.socket.emit("position", {
            latitude: this.state.currentLocation.latitude,
            longitude: this.state.currentLocation.longitude,
            phoneno: this.state.phoneno,
            allowsGPS: this.state.allowsGPS
          })
        }
        // if (this.isDanger(users).result) {
        //   this.notif.localNotif("location-tracker-app", "Alert Message", "Your location is close to covid infected person. BE ALERT!!!")
        // }
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
          console.log("position:", position.coords)
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
    if (
      this.isCurrentLocationChange(prevState.currentLocation, this.state.currentLocation) ||
      prevState.allowsGPS != this.state.allowsGPS
    ) {
      console.log("phoneno:", this.state.phoneno)
      this.socket.emit("position", {
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
        phoneno: this.state.phoneno,
        allowsGPS: this.state.allowsGPS
      })
    }
  }

  componentWillUnmount() {
    console.log("umnount called")
    this.socket.close();
    Geolocation.stopObserving()
  }


  onRegister(token) {
    // Alert.alert("Registered !", JSON.stringify(token));
    console.log(token);
    // this.setState({ registerToken: token.token, gcmRegistered: true });
  }

  onNotif(notif) {
    console.log('notification recieved', notif);
  }

  handlePerm(perms) {
    console.log("Permissions", JSON.stringify(perms));
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
    var d = (R * c) * 1000; // Distance in meters
    return d;
  }

  isCurrentLocationChange = (prevPositon, currentPosition) => {
    const distance = this.getDistanceFromLatLonInKm(
      prevPositon.latitude,
      prevPositon.longitude,
      currentPosition.latitude,
      currentPosition.longitude
    )
    if (distance < 5) {
      return false
    } else {
      return true
    }
  }

  isDanger = (users) => {
    let usersArray = Array.from(users.values())
    let closestUsers = usersArray.filter(user => {
      let distance = this.getDistanceFromLatLonInKm(
        this.state.currentLocation.latitude,
        this.state.currentLocation.longitude,
        user.latitude,
        user.longitude
      )
      if (distance < 1000 && user.phoneno != this.state.phoneno) {
        return true
      } else {
        return false
      }
    })
    if (closestUsers.length > 0) {
      return { result: true, listOfUsers: closestUsers }
    } else {
      return { result: false, listOfUsers: closestUsers }
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
      if (distance < 5000) {
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
          region={{
            latitude: this.state.currentLocation.latitude,
            longitude: this.state.currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
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
        <Text style={{ margin: 10, fontWeight: "bold" }}>{"There are " + ((this.getNeighbourUsers().length) ? this.getNeighbourUsers().length - 1 : 0) + " users near you"}</Text>

        {(this.isDanger(this.state.users).result) ? (
          showMessage({
            message: "ALERT PLEASE!!!",
            type: "danger",
            position: 'bottom',
            autoHide: false,
            description: "Your are found near to covid victim. Be alert and safe",
            icon: { icon: "auto", position: 'left' },
            hideOnPress: false
          })
        ) : (
            hideMessage()
          )}
      </View>
    )
  }
}


Try.navigationOptions = ({ navigation }) => {
  return {
    title: "Live-Location-Tracker",
    headerRight: () => (<TouchableOpacity onPress={() => navigation.navigate("AdminSignin")}><Text style={{ marginRight: 10, color: 'red', fontWeight: 'bold' }}>ADMIN</Text></TouchableOpacity>)
  }
}
export default Try