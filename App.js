import React from 'react';
import { StackNavigator } from 'react-navigation';
import loading from './src/loading.js';
import login from './src/login/index.js';
import signup from './src/signup';
import profile from './src/profile/index.js';
import welcome from './src/welcome';
import device from './src/devices/index.js';
import photoupload from './src/photoupload';
import widgets from './src/widget/index.js';
import widgetseditor from './src/widgeteditor/index.js';
import new_widgets from './src/widget/new_widgets';
import create from './src/widget_create';
import loginandsecurites from './src/loginandsecurites.js';
import account from './src/account.js';
import sharedStaxBy from './src/share/sharedStaxBy.js';
import PurchaseSubscription from './src/subscriptions/PurchaseSubscription.js';
import ShareOptions from './src/share/ShareOptions.js';
import AnotherDevice from './src/AnotherDevice.js';
import Friends from './src/profile/Friends.js';
import Approwfriends from './src/AprrowFriends.js';
import widgetrecievebeta from './src/widgetrecievebeta.js';
import ShareStax from './src/share/ShareStax.js';
import ShareWidgetOptions from './src/share/ShareWidgetOptions.js';
import ShareWidgetAnotherDevice from './src/share/ShareWidgetAnotherDevice.js';
import Applist from './src/Applist.js';
import store_home from './src/store/store_home.js'
import store_purchase from './src/store/store_purchase.js'
import store_search from './src/store/store_search.js'
import sharedApprow from './src/share/sharedApprow.js';
import sharedbylist from './src/share/sharedbylist.js';
import SharedWidgetApplist from './src/share/SharedWidgetApplist.js';
import Notifications from './src/notifications/index.js';
import Rewards from './src/rewards/index.js';
import Settings from './src/settings/index.js';
import eula from './src/webview/eula.js';
import About from './src/webview/About.js';
import PurchaseSub from './src/subscriptions/PurchaseSub.js';
import help from './src/webview/Help_center.js';
import bottom_menu from './src/bottom_menu/index.js';
import Tutorial from './src/Tutorial.js';
import userypeselector from './src/userypeselector.js';
import widgetFullScreen from './src/widgetFullScreen.js';

//import navigation_menu from './src/NavigationPage.js';

import {
  setCustomView,
  setCustomTextInput,
  setCustomText,
  setCustomImage,
  setCustomTouchableOpacity
} from 'react-native-global-props';
const customTextProps = {
  style: {
    fontFamily: 'Roboto',
  },

};
const customTextInputProps = {
  style: {
    fontFamily: 'Roboto',
  }
};
setCustomText(customTextProps);
setCustomTextInput(customTextInputProps);

class App extends React.Component {
  componentDidMount() {
    //  SplashScreen.hide();

  }
  render() {
    // console.log('this.props in MyApp', this.props); // This will list the initialProps.

    // StackNavigator **only** accepts a screenProps prop so we're passing
    // initialProps through that.
    return (<Navigator screenProps={this.props} />);
  }
}
const Navigator = StackNavigator({
  // bottom_menu:{screen:bottom_menu},

  loading: { screen: loading },
  userypeselector: { screen: userypeselector },
  store_home: { screen: store_home },
  store_purchase: { screen: store_purchase },
  store_search: { screen: store_search },
  Rewards: { screen: Rewards },
  Approwfriends: { screen: Approwfriends },
  login: { screen: login },

  widgetrecievebeta: { screen: widgetrecievebeta },
  Friends: { screen: Friends },
  welcome: { screen: welcome },
  widgets: { screen: widgets },
  widgetseditor: { screen: widgetseditor },
  new_widgets: { screen: new_widgets },
  create: { screen: create },
  profile: { screen: profile },
  account: { screen: account },
  loginandsecurites: { screen: loginandsecurites },
  sharedStaxBy: { screen: sharedStaxBy },
  PurchaseSubscription: { screen: PurchaseSubscription },
  PurchaseSub: { screen: PurchaseSub },
  photoupload: { screen: photoupload },
  signup: { screen: signup },
  device: { screen: device },
  ShareOptions: { screen: ShareOptions },
  AnotherDevice: { screen: AnotherDevice },
  Friends: { screen: Friends },
  ShareStax: { screen: ShareStax },
  ShareWidgetOptions: { screen: ShareWidgetOptions },
  ShareWidgetAnotherDevice: { screen: ShareWidgetAnotherDevice },
  Applist: { screen: Applist },
  Notifications: { screen: Notifications },
  sharedApprow: { screen: sharedApprow },
  sharedbylist: { screen: sharedbylist },
  SharedWidgetApplist: { screen: SharedWidgetApplist },
  Settings: { screen: Settings },
  eula: { screen: eula },
  About: { screen: About },
  help: { screen: help },
  Tutorial: { screen: Tutorial },
  bottom_menu: { screen: bottom_menu },
  widgetFullScreen: { screen: widgetFullScreen }
})

export default App;