import React from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Input, Button, Divider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import trackAPI from "../api/trackAPI"
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message'


class AdminPortal extends React.Component {
  state = {
    phoneno: "",
    list: [],
    token: this.props.navigation.getParam('token')
  }
  componentDidMount() {
    let mssg = "Here you can add list the phone numbers of covid-19 contacted person.SMS are sent and recorded in our data so that we can track live update of users location.Please make sure the phone numbers are valid."
    showMessage({
      message: "Admin Portal",
      type: "info",
      autoHide: false,
      position: 'bottom',
      description: mssg,
      icon: { icon: "auto", position: 'left' },
      hideOnPress: true,
      floating: true
    })
  }

  onSubmit = async () => {
    let i = 0;
    for (const item of this.state.list) {
      console.log("on:", item);
      try {
        await trackAPI.post("/sms", { phoneno: item }, { headers: { Authorization: this.state.token } });
      } catch (err) {
        console.log(err)
      }
    }
    console.log('Done!');
    const res = await trackAPI.post("/addcontacts", { list: this.state.list }, { headers: { Authorization: this.state.token } });
    console.log("response of check:", res.data);
    showMessage({
      message: "Submitted Successfully",
      type: "success",
      autoHide: false,
      position: 'bottom',
      description: "Messages has been sent to all above contacts and successfully recorded in our data",
      icon: { icon: "auto", position: 'left' },
      hideOnPress: true,
      floating: true
    })
    this.setState({ list: [] })
  }
  render() {
    return (
      <>
        <View style={styles.phoneno}>
          <Input
            label="Phone Number"
            value={this.state.phoneno}
            onChangeText={text => {
              if (!isNaN(text) && text.length <= 10) {
                this.setState({ phoneno: text })
              }
            }}
            rightIcon={
              <Icon
                disabled={(this.state.phoneno.length == 10) ? false : true}
                name="plus"
                style={{ fontSize: 25 }}
                onPress={() => { this.setState({ list: [...this.state.list, this.state.phoneno] }); this.setState({ phoneno: "" }) }}
              />}
            leftIcon={<Icon name="phone" style={{ fontSize: 25 }} />}
            placeholder="9999-9999-99"
          />
        </View>
        <View style={styles.spacing}>
          <Text style={{ fontWeight: 'bold', marginLeft: 5 }}>{(this.state.list.length > 0) ? "Contacts added in list:" : "No contacts added yet!"}</Text>
        </View>
        <View style={styles.spacing}>
          <FlatList
            data={this.state.list}
            keyExtractor={phoneno => phoneno}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => {
                    let arr = this.state.list;
                    arr.splice(arr.indexOf(item), 1);
                    this.setState({ list: arr })
                  }}
                >
                  <Text style={{ marginBottom: 5, fontSize: 20, fontWeight: '600' }}>{item}</Text>
                  <Divider style={{ backgroundColor: 'grey' }} />
                </TouchableOpacity>
              )
            }}
          />
        </View>
        <View style={styles.spacing}>
          <Button
            title="Submit"
            onPress={() => this.onSubmit()}
            disabled={(this.state.list.length > 0) ? false : true}
          />
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  spacing: {
    margin: 10
  },
  error: {
    color: 'red',
    marginLeft: 10
  },
  phoneno: {
    flexDirection: 'column',
    margin: 10
  }
});

export default AdminPortal