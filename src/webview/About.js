import React from 'react';
import { Linking, ActivityIndicator, BackHandler, WebView, StyleSheet, Image, TouchableOpacity, AsyncStorage } from 'react-native';
import commons from '../commons';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require('../config/AWSConfig.json');
export default class profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { goBack } = navigation;
    let title = 'About';
    let headerStyle = { backgroundColor: "#006BBD", };
    let headerTitleStyle = {
      alignItems: 'center',
      color: "white",
      fontFamily: 'Roboto-Bold', fontWeight: '200',
      marginLeft: 0,
      fontSize: 18
    };
    let headerTitleAllowFontScaling = false;
    let headerTintColor = "white";

    return {
      title,
      headerStyle,
      headerTitleStyle,
      headerTintColor,
      headerTitleAllowFontScaling
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,

    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);
  }
  webView = {
    canGoBack: false,
    ref: null,
  }

  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() {
    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
      return true;
    } else {
      commons.replaceScreen(this, "bottom_menu", { "page": "Logout" });
      /*  const { goBack } = this.props.navigation;
        goBack();
      */
      return true;
    }
  }
  async openLink1() {

  }
  async openLink(url) {
    var username = await AsyncStorage.getItem("username");
    var isfirstrun = await AsyncStorage.getItem("firstrun");
    setTimeout(() => {
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
        if (isfirstrun == null)
          commons.replaceScreen(this, 'userypeselector', {});
        else
          commons.replaceScreen(this, 'login', {});
      }
    }, 2000);


  }
  async  componentDidMount() {
    var Mixpannel_tocken = aws_data11.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
      Mixpanel.default.track("About");
    });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });

  }
  renderLoadingView() {
    return (
      <ActivityIndicator
        color='#006BBD'
        size='large'
        styles={styles.activityIndicator}
      />
    );
  }

  render() {
    return (
      <WebView
        source={{ uri: 'https://aprrow.com' }}
        style={{}}
        javaScriptEnabled={true}
        ref={(webView) => { this.webView.ref = webView; }}
        onNavigationStateChange={(navState) => { this.webView.canGoBack = navState.canGoBack; }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  }
});
