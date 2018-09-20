import React from 'react';	
import { StackNavigator } from 'react-navigation';
import loading from './src/loading.js';
import login from './src/login';
import signup from './src/signup';
import profile from './src/profile';
import welcome from './src/welcome';
import device from './src/device';
import photoupload from './src/photoupload';
import widgets from './src/widgets';
import widgetseditor from './src/widgetseditor';
import new_widgets from './src/new_widgets';
import create from './src/widget_create';
import loginandsecurites from './src/loginandsecurites.js';
import account from './src/account.js';
import sharedStaxBy from './src/sharedStaxBy.js';
import PurchaseSubscription from './src/PurchaseSubscription.js';
import ShareOptions from './src/ShareOptions.js';
import AnotherDevice from './src/AnotherDevice.js';
import Friends from './src/Friends.js';
import Approwfriends from './src/AprrowFriends.js';
import widgetrecievebeta from './src/widgetrecievebeta.js';
import ShareStax from './src/ShareStax.js';
import ShareWidgetOptions from './src/ShareWidgetOptions.js';
import ShareWidgetAnotherDevice from './src/ShareWidgetAnotherDevice.js';
import Applist from './src/Applist.js';
import store_home from './src/store_home.js'
import store_purchase from './src/store_purchase'
import store_search from './src/store_search'
import sharedApprow from './src/sharedApprow.js';
import sharedbylist from './src/sharedbylist.js';
import SharedWidgetApplist from './src/SharedWidgetApplist.js';
import Notifications from './src/Notification.js';
import Rewards from './src/Rewards.js';
import Settings from './src/Settings.js';
import eula from './src/eula.js';
import About from './src/About.js';
import PurchaseSub from './src/PurchaseSub.js';
import help from './src/Help_center.js';
import bottom_menu from './src/bottom_menu.js';
import Tutorial from './src/Tutorial.js';
import userypeselector from './src/userypeselector.js';
import widgetFullScreen from './src/widgetFullScreen.js';
import {Platform,Dimensions,View} from 'react-native';

//import navigation_menu from './src/NavigationPage.js';

import {
    setCustomView,
    setCustomTextInput,
    setCustomText,
    setCustomImage,
    setCustomTouchableOpacity
  } from 'react-native-global-props';
  //import SplashScreen from 'react-native-splash-screen' 
  const customTextProps = { 
    style: {
        fontFamily:'Roboto',
    },
    
  };
  const customTextInputProps = { 
    style: {
        fontFamily:'Roboto',
    }
  };
  setCustomText(customTextProps);
  setCustomTextInput(customTextInputProps);
  
class App extends React.Component {
    componentDidMount()
    {
    //  SplashScreen.hide();
    
    }
    render() {
     // console.log('this.props in MyApp', this.props); // This will list the initialProps.
  
      // StackNavigator **only** accepts a screenProps prop so we're passing
      // initialProps through that.
    return(<Navigator screenProps={this.props} />); 
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
    Notifications:{screen:Notifications},
    sharedApprow: { screen: sharedApprow },
    sharedbylist: { screen: sharedbylist },
    SharedWidgetApplist: { screen: SharedWidgetApplist },
    Settings:{screen:Settings},
    eula:{screen:eula},
    About:{screen:About},
    help:{screen:help},
    Tutorial:{screen:Tutorial},
    bottom_menu: { screen:bottom_menu },
    widgetFullScreen: { screen: widgetFullScreen}
})

export default App;