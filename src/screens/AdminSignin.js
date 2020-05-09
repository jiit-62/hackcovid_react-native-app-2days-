import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Input, Button } from 'react-native-elements'
import trackAPI from "../api/trackAPI"

class AdminSignin extends React.Component {
  state = {
    email: "",
    password: "",
    error: ""
  }

  onsubmit = async () => {
    try {
      const res = await trackAPI.post("/signin", { email: this.state.email, password: this.state.password })
      console.log("token recieved:", res.data.token)
      this.props.navigation.navigate('AdminPortal', { token: res.data.token })
    } catch (err) {
      console.log("err:", err)
      this.setState({ error: "Something is wrong. Please try again!" })
    }
  }
  render() {
    return (
      <>
        <View style={styles.spacing}><Input autoCapitalize='none' label="Email" value={this.state.email} onChangeText={text => this.setState({ email: text })} /></View>
        <View style={styles.spacing}><Input secureTextEntry label="password" value={this.state.password} onChangeText={text => this.setState({ password: text })} /></View>
        {(this.state.error == "") ? null : <Text style={styles.error}>{this.state.error}</Text>}
        <View style={styles.spacing}><Button title="Signin" onPress={() => this.onsubmit()} /></View>
      </>
    )
  }
}

AdminSignin.navigationOptions = {
  title: "Admin Signin"
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

export default AdminSignin