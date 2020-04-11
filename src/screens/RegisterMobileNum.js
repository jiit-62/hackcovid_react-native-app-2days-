import React from "react";
import { View, StyleSheet } from 'react-native';
import { Text, Input, Button } from 'react-native-elements'

class RegisterMobileNum extends React.Component {
  state = {
    phoneno: ""
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
        }} /></View>
        <View style={styles.spacing}><Button
          title="Register"
          onPress={() => this.props.navigation.navigate("Try", { phoneno: this.state.phoneno })}
          disabled={(this.state.phoneno.length > 0) ? false : true} />
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