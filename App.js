import React from 'react'
import Try from "./src/screens/LocationTracker"
import RegisterMobileNum from "./src/screens/RegisterMobileNum"
import AdminSignin from "./src/screens/AdminSignin"
import AdminPortal from "./src/screens/AdminPortal"

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import FlashMessage from "react-native-flash-message";

const my_navigation = createStackNavigator({
  RegisterMobileNum,
  Try,
  AdminSignin,
  AdminPortal
},
)

const App = createAppContainer(my_navigation);

export default () => {
  return (
    <>
      <App />
      <FlashMessage position="top" animated={true} />
    </>
  )
}