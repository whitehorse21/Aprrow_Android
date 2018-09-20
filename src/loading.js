import React from 'react';
import {AppState,AsyncStorage, CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image, KeyboardAvoidingView, AppRegistry, ToolbarAndroid, SectionList, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown';
import commons from './commons.js';
import SplashScreen from 'react-native-splash-screen';
import Strings from './utils/strings.js';
var deviceInfo = require('react-native-device-info');
export default class profile extends React.Component {
  static navigationOptions = {
    title: '',
    headerStyle: { backgroundColor: 'black' },
    headerTitleStyle: { color: 'black' },
    headerTintColor: 'black'
  };
  constructor(props) {
    super(props);
    this.state = 
    {
    };
    navigation = this.props.navigation;
    this.handleAppStateChange=this.handleAppStateChange.bind(this);
  }
  async componentDidMount() 
  {
    SplashScreen.hide();
    await commons.setLanguage();
    var isTab= deviceInfo.isTablet();
    await AsyncStorage.setItem("istab",""+isTab);
    Linking.getInitialURL().then(async (url) => {
        this.handleAppStateChange(url);
      });
      Linking.addEventListener('url', this.handleAppStateChange);
  }
  async componentWillUnmount() 
  {
    Linking.removeEventListener('url', this.handleAppStateChange);
  }
   /** 
(Multiway Switch from splash  screen)
@param  :  URL
@return : nil
@created by    : Dhi
@modified by   : Dhi
@modified date : 04/09/18
*/
 async handleAppStateChange(url) {
        var userName = await AsyncStorage.getItem("username");
        var isFirstRun=await AsyncStorage.getItem("firstrun");
        setTimeout(() => {
          if (userName != null) {
            var urlData = "";
            if (url != null&&userName!=commons.guestuserkey()) { //Accept shared stax 
              urlData = url.split("#");
              commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urlData[1] });
            }
            else {                                                
              var wIdFromHSW="";
              wIdFromHSW=this.props.screenProps["WidgetID"];
              if(wIdFromHSW!=null&&wIdFromHSW!='undefined'&&wIdFromHSW!=undefined&&wIdFromHSW!="")
                  {
                  commons.replaceScreen(this, "bottom_menu", { "page": "STAX", "widget_id1": wIdFromHSW });
                  }
               else{
                 commons.replaceScreen(this, 'bottom_menu', {});
                    }           
            }
          }
          else {
            if(isFirstRun==null)
             commons.replaceScreen(this, 'userypeselector', {});
            else
             commons.replaceScreen(this, 'login', {});
          }
        }, 500);  
  }
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.loadingStyle}>
      </View>
    ); 
} 
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  },
  loadingStyle: {
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }
});
