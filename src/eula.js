import React from 'react';
import {ActivityIndicator,WebView,BackHandler, CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AppRegistry,ToolbarAndroid,SectionList, TouchableOpacity,AsyncStorage,Linking  } from 'react-native';
import commons from "./commons";
import Strings from './utils/strings.js';
var Mixpanel = require('react-native-mixpanel');
var awsDataMixpanel = require("./config/AWSConfig.json");
export default class profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;
    let title= Strings.eula_page_head;
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
      eula_id:'',
      eula_text:'',
      html:''
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink=this.openLink.bind(this);
    this.openLink1=this.openLink1.bind(this);
  }
  async componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  webView = {
    canGoBack: false,
    ref: null,
  }
  async handleBackButtonClick() 
    {
          if (this.webView.canGoBack && this.webView.ref) {
            this.webView.ref.goBack();
            return true;
        }else{
            const { goBack } = this.props.navigation;
            goBack(); 
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
              this.mixpanelTrack("EULA View");
              BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
              Linking.getInitialURL().then(async (url) => {
                if(url)
                this.openLink(url);
                else Linking.addEventListener('url', this.openLink1);
              });        
       await this.setState({html:commons.getHTML("https://aprrow.com/eula","common")})       
      }
  openDialog(show) {   
    commons.replaceScreen(this, 'Settings', {})
  }
  async eula(){    var awsData=require("./config/AWSConfig.json");   
  var awsLamda = require("./config/AWSLamdaConfig.json");   
             var acceesToken=await commons.get_token();  
             await fetch(''+awsData.path+awsData.stage+awsLamda.eulaDataMgnt, {
              method: 'POST',
              headers: {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                          'Authorization':acceestoken
                        },
              body: JSON.stringify({
              "operation":"getEulatext",
              "TableName":"EulaDetails",
              "eulaId":"1"
                                  }),
              }).then((response) => response.json())
              .then(async (responseJson) => {
              var result=JSON.parse(responseJson);
              var eulaId=result.Item.eulaId.S;
              var eulaText=result.Item.eulaText.S;
              this.setState({eula_id:eula_id,eula_text:eula_text});
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
   const{navigate}=this.props.navigation;
    return (  
          <View style={{flex: 1,justifyContent: 'center', alignItems: 'center',borderRadius:10}}>
          <View style={{height:'100%',width:'100%',borderRadius:10,backgroundColor:'white'}}>
          <WebView
                    source={{uri: 'https://aprrow.com/eula'}}
                    style={{flex:1}}
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