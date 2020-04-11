import Try from "./src/screens/LocationTracker"
import RegisterMobileNum from "./src/screens/RegisterMobileNum"

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

const my_navigation = createStackNavigator({
  RegisterMobileNum,
  Try
},
)

export default createAppContainer(my_navigation)