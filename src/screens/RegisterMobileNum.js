import React from "react";
import { View, StyleSheet } from 'react-native';
import { Text, Input, Button } from 'react-native-elements'
import PushNotification from 'react-native-push-notification'
import NotifService from "../components/NotifService"

class RegisterMobileNum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneno: ""
    };

    this.notif = new NotifService(this.onRegister.bind(this), this.onNotif.bind(this));
  }


  onRegister(token) {
    Alert.alert("Registered !", JSON.stringify(token));
    console.log(token);
    // this.setState({ registerToken: token.token, gcmRegistered: true });
  }

  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }

  handlePerm(perms) {
    Alert.alert("Permissions", JSON.stringify(perms));
  }

  render() {
    return (
      <>
        <View style={styles.spacing}><Input autoCapitalize='none' label="Mobile Number" onChangeText={(phoneno) => {
          if (phoneno) {
            if (phoneno.match(/^\d{10}$/)) {
              this.setState({ phoneno })
            }
          }
        }} />
        </View>
        <View style={styles.spacing}>
          <Button
            title="Register"
            onPress={() => this.props.navigation.navigate("Try", { phoneno: this.state.phoneno })}
            disabled={(this.state.phoneno.length > 0) ? false : true} />
        </View>

        <View style={styles.spacing}>
          <Button
            title="Local Notification (now)"
            onPress={() => { this.notif.localNotif("location-tracker-app", "Alert Message", "Your location is close to covid infected person. BE ALERT!!!") }}
          />
        </View>

      </>
    )
  }
}

RegisterMobileNum.navigationOptions = {
  title: "Register"
}

const styles = StyleSheet.create({
  spacing: {
    margin: 10
  },
  error: {
    color: 'red',
    marginLeft: 10
  }
});

export default RegisterMobileNum