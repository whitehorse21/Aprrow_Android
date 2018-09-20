import React from 'react';
import { Linking, BackHandler, AsyncStorage, StyleSheet, Text, View, Image, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import commons from "../commons";
import uicommons from "../ui.commons";
import ToastExample from '../nativemodules/Toast';
import OpenSettings from 'react-native-open-settings';
import Modal from 'react-native-modal';
import device_style from '../styles/device.style';

var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require("../config/AWSConfig.json");
export default class profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = 'Settings';
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleAllowFontScaling = false;
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '200', marginLeft: 0, fontSize: 18 };
    let headerTintColor = 'white';

    return {
      title, headerStyle, headerTitleStyle, headerTintColor, headerTitleAllowFontScaling
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      isOpen: false,
      Switchbutton: false,
      appsdisplay: false,
      gotologinflow: false,
      offlineFlag: false,
      resetPermision: 'flex'

    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);
  }
  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() {
    const { goBack } = this.props.navigation;
    goBack();
    return true;
  }
  async openLink(url) {
    var username = await AsyncStorage.getItem("username");
    var isfirstrun = await AsyncStorage.getItem("firstrun");
    setTimeout(async () => {
      if (username != null) {
        var urldata = "";
        if (url != null)
          if (url.url != null && username != commons.guestuserkey()) {
            urldata = (url.url).split("#");
            commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
          }
          else {
            //commons.replaceScreen(this, 'bottom_menu', {});
          }
      }
      else {
        // navigate("login", { screen: "login" }); 
        if (isfirstrun == null)
          commons.replaceScreen(this, 'userypeselector', {});
        else
          commons.replaceScreen(this, 'login', {});
      }
    }, 2000);


  }
  async openLink1() {
  }
  async  componentDidMount() {
    try {
      var tocken = AWSConfig.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Settings Page");
      });
    }
    catch (err) {
    }

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });

    try {
      if (await AsyncStorage.getItem("google") != undefined || await AsyncStorage.getItem("facebook") != undefined)
        await this.setState({ resetPermision: 'none' });
    } catch (err) {
    }
    var Ncount = await AsyncStorage.getItem("BadgeNo");
    var count = 0;
    if (Ncount != null) {
      count = Ncount;
      this.props.navigation.setParams({ count: count });
    }
    this.permission();
  }
  async permission() {
    try {
      var NotificationPermission = await AsyncStorage.getItem("NotificationPermission");
      if (NotificationPermission == 1) {
        this.setState({ Switchbutton: true });
      } else if (NotificationPermission == 0) {
        this.setState({ Switchbutton: false })
      } else {
      }
    }
    catch (error) {
    }
  }
  MixPanelAccess() {
    OpenSettings.openSettings();
    try {
      var tocken = AWSConfig.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Access Page");
      });
    } catch (err) {
    }
  }
  async MixPanelNotification() {
    await ToastExample.isNotificationServiceRunning();
    try {
      var Mixpannel_tocken = AWSConfig.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
        Mixpanel.default.track("Settings Notifications");
      });
    } catch (err) {
    }
  }
  offlineFunc() {
    this.setState({ offlineFlag: false });
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      < KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
         {uicommons.offlineDialog(this)}
         {uicommons.loginFlowDialog(this)}
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View>
            <View style={{ flexDirection: 'row', padding: '5%' }}>
              <TouchableOpacity onPress={async () => {
                var connectionstatus = await commons.isconnected();
                if (connectionstatus) {
                  var username = await AsyncStorage.getItem("username");
                  if (username == null || username == commons.guestuserkey()) {
                    this.setState({ gotologinflow: true });
                    return;
                  }
                  navigate("profile");
                }
                else {
                  this.setState({ offlineFlag: true })
                }
              }} style={{ width: '80%' }}>
                <Text allowFontScaling={false} style={styles.lefttext}>EDIT PROFILE</Text>
              </TouchableOpacity>
              <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }} />
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
            <View style={{ flexDirection: 'row', padding: '5%', display: this.state.resetPermision }}>
              <TouchableOpacity onPress={async () => {
                var connectionstatus = await commons.isconnected();
                if (connectionstatus) {
                  var username = await AsyncStorage.getItem("username");
                  if (username == null || username == commons.guestuserkey()) {
                    this.setState({ gotologinflow: true });
                    return;
                  }
                  navigate("loginandsecurites");
                } else {
                  this.setState({ offlineFlag: true });
                }

              }} style={{ width: '80%' }}>
                <Text allowFontScaling={false} style={styles.lefttext}>CHANGE EMAIL / PASSWORD</Text>
              </TouchableOpacity>
              <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }} />
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
            <View style={{ flexDirection: 'row', padding: '5%' }}>
              <TouchableOpacity onPress={async () => {
                var connectionstatus = await commons.isconnected();
                if (connectionstatus) {
                  var username = await AsyncStorage.getItem("username");
                  if (username == null || username == commons.guestuserkey()) {
                    this.setState({ gotologinflow: true });
                    return;
                  }
                  navigate("PurchaseSub");
                }
                else {
                  this.setState({ offlineFlag: true })
                }
              }} style={{ width: '80%' }}>
                <Text allowFontScaling={false} style={styles.lefttext}>PURCHASES & SUBCRIPTIONS</Text>
              </TouchableOpacity>
              <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }} />
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
            <View style={{ flexDirection: 'row', padding: '5%' }}>
              <View style={{ width: '80%' }}>
                <Text allowFontScaling={false} style={styles.lefttext}>LANGUAGE</Text>
              </View>
              <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>
                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold' }}>English</Text>
                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_keyboard_arrow_right.png")} />
              </View>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />

            <View style={{ flexDirection: 'row', padding: '5%' }}>
              <TouchableOpacity style={{ width: '80%' }} onPress={async () => this.MixPanelNotification()}>
                <Text allowFontScaling={false} style={styles.lefttext}>NOTIFICATIONS</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
            <View style={{ flexDirection: 'row', padding: '5%' }}>
              <TouchableOpacity onPress={() => this.MixPanelAccess()} style={{ width: '80%' }}>
                <Text allowFontScaling={false} style={styles.lefttext}>ACCESS</Text>
              </TouchableOpacity>
              <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }} />
            </View>
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
            <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
          </View>
        </View>
      </ KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  lefttext: { textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' },
})