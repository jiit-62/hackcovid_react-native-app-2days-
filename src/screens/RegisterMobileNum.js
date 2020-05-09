import React from "react";
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Input, Button, Card } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import trackAPI from "../api/trackAPI"
import AsyncStorage from '@react-native-community/async-storage'
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message'

// import { TouchableOpacity } from "react-native-gesture-handler";
class RegisterMobileNum extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registered: false,
      phoneno: "",
      otp_sent_status: false,
      otp: "",
      error1: "",
      error2: ""
    };
    this.info = {
      message: "Registration of phone number",
      type: "info",
      autoHide: false,
      position: 'bottom',
      description: "",
      icon: { icon: "auto", position: 'left' },
      hideOnPress: true,
      floating: true
    }
  }

  async componentDidMount() {
    console.log("component did mount called in register")
    const phoneno = await AsyncStorage.getItem("phoneno");
    if (phoneno) {
      this.setState({ phoneno, registered: true });
    }
    if (this.state.registered) {
      this.info.description = "Your Phone number is already registered. You can continue to track your location"
      showMessage(this.info)
    } else {
      this.info.description = "Your Phone number is not registered. Please register your phone number and fill the OTP number"
      showMessage(this.info)
    }
  }

  sendOTP = async () => {
    try {
      const res = await trackAPI.post("/getotp", { phoneno: this.state.phoneno });
      console.log("OTP response recieved:", res.status);
      this.setState({ otp_sent_status: true, error1: "" })
    } catch (err) {
      console.log("err1:", err);
      this.setState({ error1: "Something went wrong. Please try again!" })
    }
  }

  verifyOTP = async () => {
    try {
      const res = await trackAPI.post("/verifyotp", { phoneno: this.state.phoneno, otp: this.state.otp });
      this.setState({ error2: "" });
      console.log("OTP verified", res.status)
      await AsyncStorage.setItem("phoneno", this.state.phoneno);
      this.setState({ registered: true })
      this.props.navigation.navigate("Try", { phoneno: this.state.phoneno })
    } catch (err) {
      console.log("err2:", err);
      this.setState({ error2: "Something went wrong. Please try again!" })
    }
  }

  render() {
    console.log("state in register:", this.state)
    return (
      (!this.state.registered) ? (
        <>
          <View style={styles.spacing}><Input autoCapitalize='none' label="Mobile Number" onChangeText={(phoneno) => {
            if (phoneno) {
              if (phoneno.match(/^\d{10}$/)) {
                this.setState({ phoneno })
              }
            }
          }} />
          </View>

          {(this.state.error1 == "") ? null : <Text style={styles.error}>{this.state.error1}</Text>}

          {(this.state.otp_sent_status) ?
            (
              <View style={styles.spacing}><Input autoCapitalize='none' label="Enter OTP" onChangeText={(text) => {
                this.setState({ otp: text })
              }} />
                {(this.state.error2 == "") ? null : <Text style={styles.error}>{this.state.error2}</Text>}

              </View>
            ) : null}
          {(!this.state.otp_sent_status) ? (
            <View style={styles.spacing}>
              <Button
                title="Send OTP"
                onPress={() => this.sendOTP()}
                disabled={(this.state.phoneno.length > 0) ? false : true} />
            </View>
          ) : (
              <View style={styles.spacing}>
                <Button
                  title="Verify OTP"
                  onPress={() => this.verifyOTP()}
                  disabled={(this.state.otp.length == 4) ? false : true} />
              </View>
            )}
        </>
      ) : (
          <View>
            <Card title="Your Registered Phone Number" style={styles.spacing}>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '600' }}>{this.state.phoneno}</Text>
            </Card>
            <View style={styles.spacing}>
              <Button
                title="Go to location-tracker"
                onPress={() => { console.log("state:", this.state); this.props.navigation.navigate("Try", { phoneno: this.state.phoneno }) }}
                disabled={(this.state.phoneno.length > 0) ? false : true} />
            </View>
            <View style={styles.spacing}>
              <Button
                title="Change Phone Number"
                onPress={async () => { this.setState({ phoneno: "", registered: false }); await AsyncStorage.removeItem("phoneno") }} />
            </View>
          </View>
        )
    )
  }
}

RegisterMobileNum.navigationOptions = ({ navigation }) => {
  return {
    title: "Register",
    headerRight: () => (<TouchableOpacity onPress={() => navigation.navigate("AdminSignin")}><Text style={{ marginRight: 10, color: 'red', fontWeight: 'bold' }}>ADMIN</Text></TouchableOpacity>)
  }
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

// 9582200194