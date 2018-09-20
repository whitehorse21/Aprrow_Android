import React from 'react';
import { AsyncStorage, Linking, ActivityIndicator, BackHandler, WebView, StyleSheet } from 'react-native';
import commons from '../commons';

export default class Help extends React.Component {

  static navigationOptions = ({ navigation }) => {
    let title = 'Help Center';
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
      return true;
    }
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
  async openLink1() {

  }
  async  componentDidMount() {
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
  onNavigationStateChange = (navState) => {
    this.setState({
      backButtonEnabled: navState.canGoBack,
    });
  };
  render() {
    return (
      <WebView
        source={{ uri: 'https://help.aprrow.com' }}
        style={{}}
        javaScriptEnabled={true}
        //renderLoading={this.renderLoadingView} 
        //startInLoadingState={true}
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
