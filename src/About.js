import React from 'react';
import {Linking,ActivityIndicator,BackHandler,WebView, CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AppRegistry,ToolbarAndroid,SectionList, TouchableOpacity,AsyncStorage  } from 'react-native';
import commons from './commons';
import Strings from './utils/strings.js';
var Mixpanel = require('react-native-mixpanel');
var awsDataMixpanel = require("./config/AWSConfig.json");
export default class profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;
    let title= Strings.about_page_head;
    let headerStyle = { backgroundColor: "#006BBD", };
    let headerTitleStyle = {
      alignItems:'center',
      color: "white",
      fontFamily: 'Roboto-Bold',fontWeight:'200', 
      marginLeft: 0,
      fontSize: 18
    };
    let headerTitleAllowFontScaling = false;
    let headerTintColor = "white";
    let headerLeft=(
          <TouchableOpacity onPress={() => goBack}>
      <Image style={{ marginTop: 15, marginBottom: 1, marginLeft: 5 }} source={require("./assets/icon_arrow_back.png")} />
    </TouchableOpacity>
    );
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
    this.openLink=this.openLink.bind(this);
    this.openLink1=this.openLink1.bind(this);
  }
  webView = {
    canGoBack: false,
    ref: null,
  }
  async componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() 
    {
          if (this.webView.canGoBack && this.webView.ref) {
                this.webView.ref.goBack();
                return true;
          }else{
                commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});
                return true;
          }
    }
    async openLink1(url)
    {
    }
    async openLink(url)
      {
            const { navigate } = this.props.navigation;
            var userName = await AsyncStorage.getItem("username");
            var isFirstRun=await AsyncStorage.getItem("firstrun");
            setTimeout(() => {
              if (userName != null) {
                var urlData = "";
                if(url!=null)
                if (url.url != null&&userName!=commons.guestuserkey()) {
                  urlData = (url.url).split("#");
                  commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urlData[1] });
                }
                else {
                }
              }
              else {
                if(isFirstRun==null)
                  commons.replaceScreen(this, 'userypeselector', {});
                else
                  commons.replaceScreen(this, 'login', {});
              }
            }, 2000);    
      }
    async mixpanelTrack(event)
      {
       try{
        var mixPanelTocken=awsDataMixpanel.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(mixPanelTocken).then(() => {
            Mixpanel.default.track(event);
            });
        }catch(err){
        }
      }
      async  componentDidMount() {
              this.mixpanelTrack("About View");
              BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
              Linking.getInitialURL().then(async (url) => {
                if(url)
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
   const{navigate}=this.props.navigation;
   return (
             <WebView
                    source={{uri: 'https://aprrow.com'}}
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