import tracker from "./src/screens/tracker"
import MultiuserTracker from "./src/screens/pubnub_tracker"
import Try from "./src/screens/try"
import RegisterMobileNum from "./src/screens/RegisterMobileNum"

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

const my_navigation = createStackNavigator({
  RegisterMobileNum,
  Try,
  MultiuserTracker,
  tracker
},
)

export default createAppContainer(my_navigation)