import React from 'react';
import { AsyncStorage, StyleSheet, View, Linking } from 'react-native';
import commons from './commons.js';
import SplashScreen from 'react-native-splash-screen';
var DeviceInfo = require('react-native-device-info');
export default class profile extends React.Component {
  static navigationOptions = {
    title: '',
    headerStyle: { backgroundColor: 'black' },
    headerTitleStyle: { color: 'black' },
    headerTintColor: 'black'

  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      prop1: this.props.test,
      test: "5"
    };

    navigation = this.props.navigation;
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  async componentDidMount() {
    SplashScreen.hide()
    var isTab = DeviceInfo.isTablet();
    await AsyncStorage.setItem("istab", "" + isTab);

    Linking.getInitialURL().then(async (url) => {
      this.handleAppStateChange(url);

    });
    Linking.addEventListener('url', this.handleAppStateChange);



  }
  async componentWillUnmount() {
    Linking.removeEventListener('url', this.handleAppStateChange);
  }
  async handleAppStateChange(url) {
    console.log(">>>>>>>>>>>loading<<<<<<<<<<<<<");
    var username = await AsyncStorage.getItem("username");
    var isfirstrun = await AsyncStorage.getItem("firstrun");
    setTimeout(() => {
      if (username != null) {
        //navigate("welcome", { screen: "welcome" }); 
        var urldata = "";

        if (url != null && username != commons.guestuserkey()) {
          urldata = url.split("#");
          //alert(urldata[1]);
          commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });

        }
        else {
          var wId_frm_HSW = "";
          wId_frm_HSW = this.props.screenProps["WidgetID"];
          // this.props.screenProps="";
          if (wId_frm_HSW != null && wId_frm_HSW != 'undefined' && wId_frm_HSW != undefined && wId_frm_HSW != "") {
            commons.replaceScreen(this, "bottom_menu", { "page": "STAX", "widget_id1": wId_frm_HSW });
          }
          else {
            commons.replaceScreen(this, 'bottom_menu', {});
          }
        }
      }
      else {
        // navigate("login", { screen: "login" }); 
        if (isfirstrun == null)
          commons.replaceScreen(this, 'userypeselector', {});
        else
          commons.replaceScreen(this, 'login', {});


      }
    }, 500);


    // }
  }


  render() {

    return (
      <View style={styles.loadingStyle}>
        {/*<Image source={require('./assets/logo_mobileux.png')} /> */}
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
