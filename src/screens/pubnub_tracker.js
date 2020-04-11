import React, { Component } from 'react';
import { View, Switch, TouchableOpacity, Image, Platform, PermissionsAndroid, Text } from 'react-native'
import PubNubReact from 'pubnub-react';
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker } from 'react-native-maps'
import PubNub from 'pubnub'

export default class PubnubTracker extends Component {
  constructor(props) {
    super(props);
    try {
      this.pubnub = new PubNub({
        publishKey: "pub-c-22ba8394-a4c0-435a-aeb5-ff99cdcda523",
        subscribeKey: "sub-c-399bedb6-78a9-11ea-889f-0e61cd120b1b"
      });
    } catch (err) {
      console.log('err:', err)
    }

    this.state = {
      currentLocation: {
        latitude: 0,
        longitude: 0
      },
      numUsers: 0,
      username: 'AnshikaAgrawal',
      fixedOnUUID: "",
      users: new Map(),
      isFocused: false,
      allowsGPS: true
    }
  }



  // setUpApp = async () => {

  // }

  async componentDidMount() {
    this.pubnub.subscribe({
      channels: ["location-tracker-channel"],
      withPresence: true
    })

    this.pubnub.addListener({
      message: mssg => {
        console.log("message:", mssg.message.message)
        let users = this.state.users;
        if (mssg.message.hideUser) {
          users.delete(mssg.publisher);
          this.setState({
            users
          })
        } else {
          let oldUser = this.state.users.get(mssg.publisher);
          let newUser = {
            uuid: mssg.publisher,
            latitude: mssg.message.latitude,
            longitude: mssg.message.longitude
          }
          // if (mssg.message.message) {
          //   setTimeout(mssg.publisher, this.clearMessage, 5000, mssg.publisher);
          //   newUser.message = mssg.message.message
          // } else if (oldUser) {
          //   newUser.message = oldUser.message
          // }
          users.set(newUser.uuid, newUser);
          this.setState({
            users
          })
        }
      }
    })
    this.pubnub.publish({
      message: { check: "Anshika here", from: '5' },
      channel: "location_tracker_channel"
    }, () => console.log("publish 5"));

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
      Geolocation.getCurrentPosition(
        position => {
          if (this.state.allowsGPS) {
            this.pubnub.publish({
              message: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                from: '1'
              },
              channel: "location_tracker_channel"
            }, () => console.log("publish 1"))
            let users = this.state.users;
            let tempUser = {
              uuid: this.pubnub.getUUID(),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            users.set(tempUser.uuid, tempUser)
            this.setState({
              users,
              currentLocation: position.coords
            })
          }
        },
        error => console.log("error in currentPos:", error),
        {
          enableHighAccuracy: true,
          distanceFilter: 0.1
        }
      )

      Geolocation.watchPosition(
        position => {
          this.setState({
            currentLocation: position.coords
          })
          if (this.state.allowsGPS) {
            this.pubnub.publish({
              message: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                from: '2'
              },
              channel: "location-tracker-channel"
            }, () => console.log("publish 2"))
          }
        },
        err => console.log("err in geolocation:", err),
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
    if (prevState.allowsGPS != this.state.allowsGPS) {
      if (this.state.allowsGPS) {
        let users = this.state.users;
        let tempUser = {
          uuid: this.pubnub.getUUID(),
          latitude: this.state.currentLocation.latitude,
          longitude: this.state.currentLocation.longitude,
          image: this.state.currentPicture,
          username: this.state.username,
          from: '3'
        }
        users.set(tempUser.uuid, tempUser);
        this.pubnub.publish({
          message: tempUser,
          channel: "location_tracker_channel",
        }, (e) => console.log("publish 3", e))
        this.setState({
          users
        })
      }
      else {
        let users = this.state.users;
        let uuid = this.pubnub.getUUID();

        users.delete(uuid);
        let tempMssg = { hideUser: true, from: '4' }
        this.pubnub.publish({
          message: tempMssg,
          channel: "location_tracker_channel",
        }, () => console.log("publish 4"))

        this.setState({
          users
        })
      }
    }
  }

  focusLocation = () => {
    if (this.state.focusOnMe || this.state.fixedOnUUID) {
      this.setState({
        focusOnMe: false,
        fixedOnUUID: ""
      });
    } else {
      region = {
        latitude: this.state.currentLocation.latitude,
        longitude: this.state.currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }
      this.setState({
        focusOnMe: true
      })
      this.map.animateToRegion(region, 2000);
    }
  }

  toggleGPS = () => {
    this.setState({
      allowsGPS: !this.state.allowsGPS
    })
  }
  render() {
    let usersArray = Array.from(this.state.users.values())
    console.log('users:', usersArray)
    return (
      <View>
        <MapView
          ref={ref => this.map = ref}
          style={{ height: 400 }}
          // onMoveShouldSetResponder={this.draggedMap}
          initialRegion={{
            latitude: 36.81808,
            longitude: -98.640297,
            latitudeDelta: 60.0001,
            longitudeDelta: 60.0001
          }}
        >
          {usersArray.map(item => {
            return (
              <Marker
                key={item.uuid}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude
                }}
                ref={marker => this.marker = marker}
              />
            )
          })}
        </MapView>
        <Switch
          value={this.state.allowsGPS}
          onValueChange={this.toggleGPS}
        />
        <TouchableOpacity onPress={this.focusLocation}>
          <Text>Focus Location</Text>
        </TouchableOpacity>
      </View>
    )
  }
}