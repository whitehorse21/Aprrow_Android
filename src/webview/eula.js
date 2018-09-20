import React from 'react';
import { ActivityIndicator, WebView, BackHandler, StyleSheet, View, AsyncStorage, Linking } from 'react-native';
import commons from "../commons";
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require('../config/AWSConfig.json');
export default class profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let title = 'EULA';
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
      eula_id: '',
      eula_text: '',
      html: ''


    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);
  }

  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  webView = {
    canGoBack: false,
    ref: null,
  }
  async handleBackButtonClick() {
    //  commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});

    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
      return true;
    } else {
      const { goBack } = this.props.navigation;
      goBack();

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
        //navigate("welcome", { screen: "welcome" }); 
        var urldata = "";
        //console.log(url);
        if (url != null)
          if (url.url != null && username != commons.guestuserkey()) {
            urldata = (url.url).split("#");
            commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
          }
          else {
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
    var Mixpannel_tocken = AWSConfig.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
      Mixpanel.default.track("EULA");
    });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });

    await this.setState({ html: commons.getHTML("https://aprrow.com/eula", "common") })
    // await this.eula();
  }
  openDialog() {

    commons.replaceScreen(this, 'Settings', {})
  }
  async eula() {
    var acceestoken = await commons.get_token();
    await fetch('' + AWSConfig.path + AWSConfig.stage + 'eulaDataMgnt', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getEulatext",
        "TableName": "EulaDetails",
        "eulaId": "1"
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        var result = JSON.parse(responseJson);
        var eula_id = result.Item.eulaId.S;
        var eula_text = result.Item.eulaText.S;
        this.setState({ eula_id: eula_id, eula_text: eula_text });
      })
      .catch((error) => {
        console.error(error);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
        <View style={{ height: '100%', width: '100%', borderRadius: 10, backgroundColor: 'white' }}>
          <WebView
            source={{ uri: 'https://aprrow.com/eula' }}
            style={{ flex: 1 }}
            automaticallyAdjustContentInsets={true}
            javaScriptEnabled={true}
            scalesPageToFit={false}
            bounces={false}
            ref={(webView) => { this.webView.ref = webView; }}
            onNavigationStateChange={(navState) => { this.webView.canGoBack = navState.canGoBack; }}
          />
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  }
});