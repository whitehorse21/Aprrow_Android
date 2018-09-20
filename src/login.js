import React, { Component } from 'react';
import prompt from 'react-native-prompt-android';
import LoaderNew from './utils/LoaderNew';
import Slider from "react-native-slider";
import assetsConfig from "./config/assets.js";
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'react-native-aws-cognito-js';
import { Config,CognitoIdentityCredentials} from 'aws-sdk/dist/aws-sdk-react-native';
import { Dialog } from 'react-native-simple-dialogs';
import PopupDialog from 'react-native-popup-dialog';
import FBSDK, {
  LoginManager,
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} from "react-native-fbsdk";
import commons from './commons';
import device_style from './styles/device.style';
import Strings from './utils/strings.js';
import {
  AppRegistry,
  Text,
  TextInput,
  View,
  Image,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  ToastAndroid,
  BackHandler,
  AsyncStorage,
  Dimensions
} from 'react-native';
import SideMenu from 'react-native-side-menu';
import { NavigationActions } from 'react-navigation';
import databasehelper from './utils/databasehelper.js';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

var aws_data11 = require("./config/AWSConfig.json");
var Mixpanel = require('react-native-mixpanel');
const awsCognitoSettings = {
  UserPoolId:aws_data11.UserPoolId,
  ClientId: aws_data11.ClientId
};
var AWS = require("aws-sdk");
AWS.config.update({ region:""+aws_data11.region});
var flogin = 0;
export default class Login extends Component {
     static navigationOptions = {
             header: () => null
          }
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      password: '',
      emailWarningBorder: "grey",
      emailWarning: "none",
      passwordWarning: "none",
      passwordWarningBorder: "grey",
      passwordHelp: Strings.login_pop_verification,
      passwordHelpEmail: "Enter your email address. you will receive a verification code to reset your password",
      buttonText: Strings.login_forgot_btn,
      loading: false,
      eulaId: "",
      eulaText: "",
      user: "",
      forgetPass: false,
      Email: "",
      passwordColorCharLimit: "grey",
      passwordCharLimitWarning: Strings.login_pop_verification_warn,
      confirmPassword: "",
      confirmPasswordWarningBorder: "grey",
      confirmPasswordWarning: "none",
      dialogWidgetDelete: false,
      verificationCode: '',
      changePwdFail: false,
      headColor: "#006BBC",
      bodyColor: "#bcb7b7",
      pwdImage:true,
      pwdHelpMsg:false
    };
    this.downloadimages = this.downloadimages.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() {
    BackHandler.exitApp();
    return false;
  }
  async componentDidMount() {
    this.mixpanelTrack("Login View");
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.setupGoogleSignin();
  }
/** 
(Login through Facebook)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async facebookLogin() { 
    var image = [];
    this.mixpanelTrack("Login with Facebook");
    const { navigate } = this.props.navigation;
    var _this=this;
    await LoginManager.logInWithReadPermissions(['public_profile']).then(await
      function (result) {
        if (result.isCancelled) {
          ToastAndroid.show(Strings.login_toast_logincancelled, 3000);
        } else {
          _this.refs.loaderTest.show();
          var facebookmap=aws_data11.facebookmap;
          AccessToken.getCurrentAccessToken().then(async data => {
            AWS.config.region =aws_data11.region; // "us-west-2";
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(
              {
                IdentityPoolId:aws_data11.IdentityPoolId,//  "us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25",
                Logins: {
                  'graph.facebook.com':data.accessToken.toString()
                }
              });
            AWS.config.credentials.get(async function () {
              var id = AWS.config.credentials.accessToken;
              var accessKeyId = AWS.config.credentials.accessKeyId;
              var secretAccessKey = AWS.config.credentials.secretAccessKey;         
              let accessToken = data.accessToken;
              const responseInfoCallback = async (error, result) => {
                if (error) {
                  console.log(error)
                } else {                
                 var aws_data = require("./config/AWSConfig.json");
                  var aws_lamda = require("./config/AWSLamdaConfig.json");
                  var acceestoken1=await commons.get_token();
                  await fetch('' + aws_data.path + aws_data.stage + aws_lamda.accountvalidation, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization':acceestoken1,
                      'X-Api-Key':aws_data.XApiKey
                      },
                    body: JSON.stringify({
                      "username": ""+result.email,
                      "from": "facebook"
                    }),
                  }).then((response) => response.json())
                    .then(async (responseJson) => {
                      if(responseJson.status==true || responseJson.status=="true")
                      {
                   var uuid = await commons.getuuid()
                      uuid = "facebook"+uuid;
                  await databasehelper.AllTableDelete();
                  var createtime = await commons.gettimestamp();
                  var dataObj = {};
                  dataObj.firstname = result.first_name;
                  dataObj.lastname = result.last_name;
                  dataObj.accountUniqueID = result.id;
                  dataObj.username = uuid;
                  dataObj.eulaid = "1";
                  dataObj.createtime = createtime;
                  dataObj.email = result.email;
                  dataObj.federatedId = id;
                  dataObj.facebookId = result.id;
                  dataObj.loginfrom = "facebook";
                  dataObj.accessToken = accessToken; 
                  var aws_data = require("./config/AWSConfig.json");
                  var aws_lamda = require("./config/AWSLamdaConfig.json");
                  var acceestoken=await commons.get_token();
                  await fetch("" + aws_data.path + aws_data.stage + aws_lamda.newusermgnt, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization':acceestoken,
                      'X-Api-Key':aws_data.XApiKey
                    },
                    body: JSON.stringify({
                      "operation": "CreateNewUser01",
                      "TableName": aws_data.usertable,
                      "payload": dataObj
                    }),
                  }).then((response) => response.json())
                    .then(async (responseJson) => {
                        if (responseJson.status == "SUCCESS" ||responseJson.status == '"SUCCESS"' || responseJson.status == "Already_exists"|| responseJson.status == '"Already_exists"') {
                          var userName     = responseJson.username;
                          dataObj.username = userName;
                          var returnData = await databasehelper.insertuser(dataObj);
                          var returnData = await databasehelper.insertprofile(dataObj);
                          var proObj = {};
                          proObj.profileimage = '0';
                          proObj.username = dataObj.username;
                          proObj.createtime = dataObj.createtime;
                          var imagereturnData = await databasehelper.insertProfileImage(proObj);
                        //--------------------------login start-------------------------------------------------    //await AsyncStorage.setItem("username", result.id);
                        await AsyncStorage.setItem("username", responseJson.username);
                        await AsyncStorage.setItem("facebook", "1");
                        await AsyncStorage.setItem("firstrun", "1");
                        var aws_data = require("./config/AWSConfig.json");
                        var aws_lamda = require("./config/AWSLamdaConfig.json");
                        var acceestoken2=await commons.get_token();
                        await fetch('' + aws_data.path + aws_data.stage + aws_lamda.userdatamgnt, {
                          method: 'POST',
                          headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization':acceestoken2,
                            'X-Api-Key':aws_data.XApiKey
                          },
                          body: JSON.stringify({
                            "operation": "getUser",
                            "TableName": "Users",
                            "username": userName
                          }),
                        }).then((response) => response.json())
                          .then(async (responseJson) => {
                            var username11 = await AsyncStorage.getItem("username");          
                            var userdata = {};
                            userdata["firstname"] = responseJson.firstname;
                            userdata["lastname"] = responseJson.lastname;
                            userdata["username"] = responseJson.username;
                            userdata["eulaid"] = responseJson.eulaid;
                            userdata["loginfrom"] = responseJson.loginfrom;
                            userdata["email"] = responseJson.email;
                            userdata["createtime"] = "0";
                            var profiledata = responseJson.profile;
                            var devicedata = responseJson.device;
                            var widgetdata = responseJson.widgets;
                            var em="";
                            if(responseJson.hasOwnProperty("email")) 
                              em=responseJson.email;
                            await AsyncStorage.setItem("email",em);
                            await databasehelper.insertuser(userdata);
                            await databasehelper.insertprofile(profiledata);
                            var proObj = {};
                            proObj["profileimage"] = '0';
                            if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                              proObj.profileimage = profiledata.profileimage;
                            }
                            proObj.username = profiledata.username;
                            proObj.createtime = profiledata.createtime;
                            var imagereturnData = databasehelper.insertProfileImage(proObj);
                            var DeviceInfo = require('react-native-device-info');
                            var curr_deviceid_hardid = await DeviceInfo.getUniqueID();
                            var curr_device_uuid = "";
                            if (devicedata != null && devicedata.length > 0) {
                              await databasehelper.bulkinsertdevice(devicedata);
                              for (var i = 0; i < devicedata.length; i++) {
                                if (devicedata[i].devicehardwareid == curr_deviceid_hardid) {
                                  curr_device_uuid = devicedata[i].deviceid;
                                  break;
                                }
                              }
                            }
                            var mostusedwidgetid = "";
                            var smartstaxid="";
                            var fileids_download = [];
                            if (widgetdata != null && widgetdata.length > 0) {
                              await databasehelper.bulkinsertwidget(widgetdata);
                              for (var i = 0; i < widgetdata.length; i++) {
                                if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                                  mostusedwidgetid = widgetdata[i].widgetid;
                         }
                                if(widgetdata[i].deviceid==curr_device_uuid&&widgetdata[i].mostusedwidget=="4")
                                     {
                                      smartstaxid=widgetdata[i].widgetid;
                                     }
                                if (widgetdata[i].deviceid == curr_device_uuid && commons.isimagevalid(widgetdata[i])) {
                                  fileids_download.push(widgetdata[i].fileid)
                                }
                              }
                              image = fileids_download;
                            }
                            await AsyncStorage.setItem("mostusedwidgetid", mostusedwidgetid);
                            await AsyncStorage.setItem("smartstaxid", smartstaxid);   
                            await AsyncStorage.setItem("currentdeviceid", curr_device_uuid);
                          })
                          .catch((error) => {
                            console.error(error);
                          });
                        //---------------------------- login end----------------------------------------------
                      }
                      if (JSON.stringify(responseJson) == "SUCCESS" || responseJson.status == "SUCCESS") {
                        ToastAndroid.show(Strings.login_toast_success, 500);
                         _this.refs.loaderTest.hide();
                        navigate("bottom_menu", user = { "page": "Home" });
                        flogin = 1;
                      }
                      else if (JSON.stringify(responseJson) == "Already_exists" || responseJson.status == "Already_exists") {
                         _this.refs.loaderTest.hide();
                        ToastAndroid.show(Strings.login_toast_loginsuccess, 500);
                        navigate("bottom_menu", user = { "page": "Home" });
                        flogin = 2;
                      }
                      else {
                         _this.refs.loaderTest.hide();
                        ToastAndroid.show(JSON.stringify(responseJson), 500);
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                  //--------------------------------------------------------------------------------------------------------
                  }
                  else
                  {
                    LoginManager.logOut();   
                    _this.refs.loaderTest.hide();
                    var existingAccount=responseJson.existingAccount;
                    if(existingAccount=="app")
                        existingAccount="APRROW";
                     ToastAndroid.show(Strings.login_toast_existing+existingAccount+Strings.login_toast_existing1+existingAccount+Strings.login_toast_existing2, 3000);
                  }
                });
                }
                //..........'''''''''''''''''.............................''''''''''''........''''''''''''''.....
              }
              const infoRequest = new GraphRequest('/me', {
                accessToken: accessToken,
                parameters: {
                  fields: {
                    string: 'email,name,first_name,middle_name,last_name'
                  }
                }
              }, await responseInfoCallback);
              // Start the graph request.
              new GraphRequestManager()
                .addRequest(infoRequest)
                .start();
            });
          });
        }
      },
      await function (error) {
        ToastAndroid.show(Strings.login_toast_faild + error, 500);
      }
    );
    if (image.length > 0) {
      alert(image.length);
      this.downloadimages(image);
    }
  }
/** 
(Download images to cache from s3)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async downloadimages(ids) {
    for (var i = 0; i < ids.length; i++) {
      var res = await commons.download_file_tocache(ids[i], '.jpg');
    }
  }
      /** 
(Initailize google sign in configuration)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        webClientId:aws_data11.webClientId,
        offlineAccess: false
      });
      const user = await GoogleSignin.currentUserAsync();
      this.setState({ user });
    }
    catch (err) {
      console.log("There are any error", err.message);
    }
  }
    /** 
(Signin through google account)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async onGoogleSignInButton() {
   this.mixpanelTrack("Login with Google");
    GoogleSignin.signIn()
      .then(async (user) => {
    var aws_data = require("./config/AWSConfig.json");
    var aws_lamda = require("./config/AWSLamdaConfig.json");
    var acceestoken1=await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + aws_lamda.accountvalidation, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization':acceestoken1,
        'X-Api-Key':aws_data.XApiKey
      },
      body: JSON.stringify({
        "username": ""+user.email,
        "from": "google"
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        if(responseJson.status==true)
        {
       await this.refs.loaderTest.show();
       var googlemap=aws_data11.googlemap;
       var IdentityPoolId= aws_data11.IdentityPoolId;
       const { navigate } = this.props.navigation;
        var idToken = user.idToken;
        var accessToken = user.accessToken;
        AWS.config.region =aws_data11.region;// 'us-west-2';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId:IdentityPoolId,
          Logins: {
            // Change the key below according to the specific region your user pool is in.
            'accounts.google.com': user.idToken
          }
        });
        //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        AWS.config.credentials.refresh(async (error) => {
          if (error) {
            console.error(error);
            await this.refs.loaderTest.hide();
            ToastAndroid.show(error, 3000);
          } else {
            await databasehelper.AllTableDelete();
            var identity_id = AWS.config.credentials.identityId;
            var accessKeyId = AWS.config.credentials.accessKeyId;
            var secretAccessKey = AWS.config.credentials.secretAccessKey;
            let accessToken = user.accessToken;
            var uuid = await commons.getuuid()
                uuid="google"+uuid;
            var createtime = commons.gettimestamp();
            var dataObj = {};
            dataObj.firstname = user.givenName;
            dataObj.lastname = user.familyName;
            dataObj.username =uuid;
            dataObj.accountUniqueID =user.id;
            dataObj.eulaid = "1";
            dataObj.createtime = createtime;
            dataObj.email = user.email;
            dataObj.federatedId = identity_id;
            dataObj.googleId = user.id;
            dataObj.loginfrom = "google";
            dataObj.accessToken = accessToken;
            var aws_data = require("./config/AWSConfig.json");
            var aws_lamda = require("./config/AWSLamdaConfig.json");
            var acceestoken=await commons.get_token();
            await fetch("" + aws_data.path + aws_data.stage + aws_lamda.newusermgnt, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken,
                'X-Api-Key':aws_data.XApiKey
              },
              body: JSON.stringify({
                "operation": "CreateNewUser01",
                "TableName": aws_data.usertable,
                "payload": dataObj
              }),
            }).then((response) => response.json())
              .then(async (responseJson) => {
                  if (responseJson.status == "SUCCESS" || responseJson.status == "Already_exists") {
                  dataObj.username = responseJson.username;
                  var username = dataObj.username;
                  var returnData = await databasehelper.insertuser(dataObj);
                  var returnData = await databasehelper.insertprofile(dataObj);
                  var proObj = {};
                  proObj.profileimage = '0';
                  proObj.username = dataObj.username;
                  proObj.createtime = dataObj.createtime;
                  var imagereturnData = await databasehelper.insertProfileImage(proObj);
                  //--------------------------login start-------------------------------------------------Already_exists
                  await AsyncStorage.setItem("firstrun", "1");
                 // await AsyncStorage.setItem("username", user.id);
                  await AsyncStorage.setItem("username", responseJson.username);
                  var acceestoken2=await commons.get_token();
                  var aws_data = require("./config/AWSConfig.json");
                  var aws_lamda = require("./config/AWSLamdaConfig.json");
                  await fetch('' + aws_data.path + aws_data.stage + aws_lamda.userdatamgnt, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization':acceestoken2,
                      'X-Api-Key':aws_data.XApiKey
                    },
                    body: JSON.stringify({
                      "operation": "getUser",
                      "TableName": "Users",
                      "username": username
                    }),
                  }).then((response) => response.json())
                    .then(async (responseJson) => {
                      await AsyncStorage.setItem("google", "1");
                      var username11 = await AsyncStorage.getItem("username");
                      await AsyncStorage.setItem("email", responseJson.email);
                      var userdata = {};
                      userdata["firstname"] = responseJson.firstname;
                      userdata["lastname"] = responseJson.lastname;
                      userdata["username"] = responseJson.username;
                      userdata["eulaid"] = responseJson.eulaid;
                      userdata["loginfrom"] = responseJson.loginfrom;
                      userdata["email"] = responseJson.email;
                      userdata["createtime"] = "0";
                      var profiledata = responseJson.profile;
                      var devicedata = responseJson.device;
                      var widgetdata = responseJson.widgets;
                      var rs1 = await databasehelper.insertuser(userdata);                     
                      var rs2 = await databasehelper.insertprofile(profiledata);
                      var proObj = {};
                            proObj["profileimage"] = '0';
                            if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                              proObj.profileimage = profiledata.profileimage;
                            }
                            proObj.username = profiledata.username;
                            proObj.createtime = profiledata.createtime;
                            var imagereturnData = databasehelper.insertProfileImage(proObj);
                      var DeviceInfo = require('react-native-device-info');
                      var curr_deviceid_hardid = await DeviceInfo.getUniqueID();
                      var curr_device_uuid = "";
                      if (devicedata != null && devicedata.length > 0) {
                        var rs3 = await databasehelper.bulkinsertdevice(devicedata);
                        for (var i = 0; i < devicedata.length; i++) {
                          if (devicedata[i].devicehardwareid == curr_deviceid_hardid) {
                            curr_device_uuid = devicedata[i].deviceid;
                            break;
                          }
                        }
                      }
                      var mostusedwidgetid = "";
                      var smartstaxid="";
                      var fileids_download = [];
                      if (widgetdata != null && widgetdata.length > 0) {
                        var rs4 = await databasehelper.bulkinsertwidget(widgetdata);
                        for (var i = 0; i < widgetdata.length; i++) {
                          if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                            mostusedwidgetid = widgetdata[i].widgetid;
                          }
                          if(widgetdata[i].deviceid==curr_device_uuid&&widgetdata[i].mostusedwidget=="4")
                                     {
                                      smartstaxid=widgetdata[i].widgetid;
                                     }
                          if (widgetdata[i].deviceid == curr_device_uuid && commons.isimagevalid(widgetdata[i])) {
                            fileids_download.push(widgetdata[i].fileid)
                          }
                        }
                        this.downloadimages(fileids_download);
                      }
                      await AsyncStorage.setItem("mostusedwidgetid", mostusedwidgetid);
                      await AsyncStorage.setItem("smartstaxid", smartstaxid);  
                      await AsyncStorage.setItem("currentdeviceid", curr_device_uuid);
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                  //---------------------------- login end----------------------------------------------
                }
                this.refs.loaderTest.hide();
                if (JSON.stringify(responseJson) == "SUCCESS" || responseJson.status == "SUCCESS") {
                  ToastAndroid.show(Strings.login_toast_success, 500);
                   navigate("bottom_menu",user={"page":"Home"});    
                }
                else if (JSON.stringify(responseJson) == "Already_exists" || responseJson.status == "Already_exists") {
                  ToastAndroid.show(Strings.login_toast_loginsuccess, 500);
                  navigate("bottom_menu",user={"page":"Home"});
                }
                else {
                  ToastAndroid.show(JSON.stringify(responseJson), 500);
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
        })
    //------------------
      }
      else
      {
        GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
          })
          .done();
          var existingAccount=responseJson.existingAccount;
          if(existingAccount=="app")
            existingAccount="APRROW";
        ToastAndroid.show(Strings.login_toast_existing+existingAccount+Strings.login_toast_existing1+existingAccount+Strings.login_toast_existing2, 3000);
      }
      });
    //------------------
      })
      .catch((err) => {
        console.log('error', err);
      })
      .done();
  }
  onGoogleSignOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({ user: null });
    })
      .done();
  }
       /** 
(Retieve Password Dialogue)
@param  :image url   
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  openDialog(show) {
    this.setState({
      headColor: "#006BBC",
      bodyColor: "",
      buttonText: Strings.login_forgot_btn,
      pwdImage:true,
      passwordWarningBorder: "grey",
      passwordHelpEmail: Strings.login_forgot_desc,
    });
    this.setState({ showDialog: show });
  }
     /** 
(Mixpanel Track event)
@param  :event  
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async mixpanelTrack(event)
   {
     try{
        var Mixpannel_tocken=aws_data11.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
            Mixpanel.default.track(event);
            });
        }catch(err){
        }
   } 
      /** 
(Function for login operations)
@param  :nil
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
 
  async  login() {
    this.refs.loaderTest.show();
    this.mixpanelTrack("User Login"); 
    var username = (this.state.userName).toLowerCase();
    var password = this.state.password;
      var _this=this
    const userPool = new CognitoUserPool(awsCognitoSettings);
    const authDetails = new AuthenticationDetails({
      Username: (this.state.userName).toLowerCase(),
      Password: this.state.password
    });
    const cognitoUser = new CognitoUser({
      Username: (this.state.userName).toLowerCase(),
      Pool: userPool
    });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess:async (result) => {
        var userpoolmap=aws_data11["userpoolmap"];
        var loginmap={};
        loginmap[userpoolmap]= result.getIdToken().getJwtToken();
        await databasehelper.AllTableDelete();
        AWS.config.region =aws_data11.region;// "us-west-2";
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId:aws_data11.IdentityPoolId,// "us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25",
          Logins: loginmap
        });
        var identity_id = ""
        AWS.config.credentials.get(async function () {
          var identity_id = AWS.config.credentials.identityId;
        });
        AWS.config.credentials.refresh((error) => {
          if (error) {
            this.setState({ dialogWidgetDelete: true });
          } else {
          }
        });
          var params = {
            AccessToken: result.getAccessToken().getJwtToken()
          };
          var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
          cognitoidentityserviceprovider.getUser(params,async function(err, data11) {
            if (err) console.log(err, err.stack); // an error occurred
            else
            {    
                username=data11.Username;                
                await AsyncStorage.setItem("username", username);
        AsyncStorage.setItem("firstrun", "1");
        var acceestoken=await commons.get_token();
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        fetch('' + aws_data.path + aws_data.stage + aws_lamda.userdatamgnt, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization':acceestoken,
            'X-Api-Key':aws_data.XApiKey

          },
          body: JSON.stringify({
            "operation": "getUser",
            "TableName": "Users",
            "username": username
          }),
        }).then((response) => response.json())
          .then(async (responseJson) => {
           // alert("OK");
            AsyncStorage.setItem("email", responseJson.email);
            var userdata = {};
            userdata["firstname"] = responseJson.firstname;
            userdata["lastname"] = responseJson.lastname;
            userdata["username"] = responseJson.username;
            userdata["eulaid"] = responseJson.eulaid;
            userdata["loginfrom"] = responseJson.loginfrom;
            userdata["email"] = responseJson.email;
            userdata["createtime"] = "0";
            var profiledata = responseJson.profile;
            var devicedata = responseJson.device;
            var widgetdata = responseJson.widgets;
            await databasehelper.insertuser(userdata);
            await databasehelper.insertprofile(profiledata);
            var proObj = {};
            proObj["profileimage"] = '0';
            if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
              proObj.profileimage = profiledata.profileimage;
            }
            proObj.username = profiledata.username;
            proObj.createtime = profiledata.createtime;
            var imagereturnData = databasehelper.insertProfileImage(proObj);
            //insertprofile image if has one
            //get current device
            var DeviceInfo = require('react-native-device-info');
            var curr_deviceid_hardid = DeviceInfo.getUniqueID();
            var curr_device_uuid = "";
            if (devicedata != null && devicedata.length > 0) {
              await databasehelper.bulkinsertdevice(devicedata);
              for (var i = 0; i < devicedata.length; i++) {
                if (devicedata[i].devicehardwareid == curr_deviceid_hardid) {
                  curr_device_uuid = devicedata[i].deviceid;
                  break;
                }
              }
            }
            var mostusedwidgetid = "";
            var smartstaxid="";
            var fileids_download = [];
            if (widgetdata != null && widgetdata.length > 0) {
              await databasehelper.bulkinsertwidget(widgetdata);
              for (var i = 0; i < widgetdata.length; i++) {
                if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                  mostusedwidgetid = widgetdata[i].widgetid;
                }
                if(widgetdata[i].deviceid==curr_device_uuid&&widgetdata[i].mostusedwidget=="4")
                {
                  smartstaxid=widgetdata[i].widgetid;
                }
                if (widgetdata[i].deviceid == curr_device_uuid && commons.isimagevalid(widgetdata[i])) {
                  fileids_download.push(widgetdata[i].fileid)
                }
              }
              _this.downloadimages(fileids_download);
            }
            await AsyncStorage.setItem("mostusedwidgetid", mostusedwidgetid);          
            await  AsyncStorage.setItem("smartstaxid", smartstaxid);  
            await AsyncStorage.setItem("currentdeviceid", curr_device_uuid);
            _this.refs.loaderTest.hide();
            commons.replaceScreen(_this, 'bottom_menu', {});
          })
          .catch((error) => {
            _this.refs.loaderTest.hide();
            console.error(error);
          });
        } 
      });  
      },
      onFailure: (err) => {
        this.refs.loaderTest.hide();
        this.setState({ dialogWidgetDelete: true });                
        return;
      }
    });
  }
     /** 
(Retieve Password Function)
@param  :image url   
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async pass() {
    const userPool = new CognitoUserPool(
      awsCognitoSettings
    );
    var params = {
      ClientId:aws_data11.ClientId,/* required */
      Username: (this.state.userName).toLowerCase(), /* required */
    };
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    var _this = this;
    cognitoidentityserviceprovider.forgotPassword(params, function (err, data) {
      if (err) {
        _this.setState({
          pwdImage:false,
          headColor: "red",
          bodyColor: "red",
          buttonText: "Try Again",
          passwordHelpEmail: "This email does not exist.\n\t Enter another email"
        });
      } 
      else {   
       _this.setState({ pwdHelpMsg: true,showDialog:false });
      }          // successful response
    });
  }
     /** 
(Password Reset => verifies password)
@param  : nil
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async verificationPass() {
    this.setState({ showDialog: false });
    this.setState({ forgetPass: false });
    var params = {
      ClientId: aws_data11.ClientId, /* required */
      ConfirmationCode: this.state.verificationCode, /* required */
      Password: this.state.password, /* required */
      Username: (this.state.userName).toLowerCase(), /* required */
    };
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.confirmForgotPassword(params, function (err, data) {
      if (err) {
        var errormsg = JSON.stringify(err);
        if (errormsg.contains("Invalid verification")) {
          ToastAndroid.show(Strings.login_toast_pwdverification, 500);
        }
        else if (errormsg.contains("lambda")) {
          ToastAndroid.show(Strings.login_toast_pwdsuccess, 500);
        }
        else {
          alert(err, err.stackerr);
        }
      } // an error occurred
      else {
        alert("Success==> " + JSON.stringify(data));           // successful response
      }
    });
  }
    /** 
(Password Reset)
@param  : nil
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  _handleSave = () => {
    var errocount = 0;
    var temp_password = this.state.password;
    if (temp_password == null)
      temp_password = "";
    if (temp_password.length < 6 || temp_password.length > 15) {
      errocount++;
      this.setState({
        passwordWarningBorder: "red",
        passwordCharLimitWarning: "* 6 to 15 characters",
        passwordColorCharLimit: "red",
      })
    }
    else {
      this.setState({
        passwordWarningBorder: "grey",
        passwordCharLimitWarning: "✓  6 to 15 characters",
        passwordColorCharLimit: "green",
      })
    }
    //confirm password validations
    if (this.state.confirmPassword == null || this.state.confirmPassword == "" || this.state.confirmPassword != this.state.password) {
      errocount++;
      this.setState({
        confirmPasswordWarning: "flex",
        confirmPasswordWarningBorder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        confirmPasswordWarning: "none",
        confirmPasswordWarningBorder: "grey"
      });
    }
    //Current  password null  validations
    if (errocount == 0) {
      //---------------------------------------------------------------------------------------
      this.verificationPass();
    }
  }
    /** 
(Checks the password strength)
@param  : password
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  GetPasswordStrength(password_user_input) {
    var temp_password = password_user_input;
    var strength = 0;
    var label = "";
    var color = "";
    if (temp_password == null)
      temp_password = "";
    var n = temp_password.length;
    var haslower = false;
    var hasupper = false;
    var good_length = false;
    var has_special = false;
    var hasnumber = false;
    var hasupper = (/[A-Z]/.test(temp_password));
    var haslower = (/[a-z]/.test(temp_password));
    var hasnumber = (/\d/.test(temp_password));
    var has_special = (/^[a-zA-Z0-9]*$/.test(temp_password));
    var strength = 0;
    if (hasupper)
      strength++;
    if (haslower)
      strength++;
    if (hasnumber)
      strength++;
    if (!has_special)
      strength++;
    if (n >= 6 && strength >= 4) {
      strength = 100;
      color = "#2CAE1C";
      label = "STRONG";
    }
    else if (n >= 6 && strength >= 3) {
      strength = 60;
      color = "#0065B2";
      label = "Good";
    }
    else {
      strength = 30;
      color = "#CC0000";
      label = "Weak";
    }
    this.setState({
      strength: strength,
      color: color,
      label: label
    });
  }
  /** 
(On click enter )
@param  : nil
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  _next = () => {
    this._password && this._password.focus();
    }
    /** 
(login click )
@param  : nil
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  _submit = () => {
    this.login();
    };
  render() {
    var windowProp = Dimensions.get('window');
    var winheight = windowProp.height;
    var winwidth = windowProp.width;
    const { navigate } = this.props.navigation
    return (
      <ImageBackground source={assetsConfig.loginBackground}
        style={{ flex: 1 }}>
        < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-300} style={{ flex: 1 }}>
          <LoaderNew ref={"loaderTest"} />
          <ScrollView style={{width:'100%',height:'100%'}}>
          <View style={{ height: '100%', alignItems: 'center' }}>
            <View style={{
              width: '82%',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '5%',
              alignItems: 'center'
            }}
            >
              <Image source={assetsConfig.loginLogo}
                style={{
                  marginTop: '15%',
                  marginBottom: '15%'
                }}
              />
              <View style={styles.container}>
                <View style={styles.SectionStyle}>
                   <TextInput allowFontScaling={false}
                    style={{ flex: 1, borderColor: this.state.emailWarningBorder,padding:10 }}
                    placeholder={Strings.login_textinput_email}
                    ref={ref => {this._username = ref}}
                    onChangeText={(userName) => this.setState({ userName })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    value={this.state.userName}
                    returnKeyType="next"
                    onSubmitEditing={this._next}
                  />
                </View>
              </View>
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.emailWarning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>Enter a valid email</Text>
              <View style={styles.container}>
                <View style={styles.SectionStyle}>
                  <TextInput allowFontScaling={false}
                    style={{ flex: 1, borderColor: this.state.passwordWarningBorder,padding:10 }}
                    Password={true}
                    secureTextEntry={true}
                    ref={ref => {this._password = ref}}
                    autoCapitalize="none"
                    onChangeText={(password) => this.setState({ password })}
                    underlineColorAndroid='transparent'
                    placeholder={Strings.login_textinput_password}
                    keyboardType="default"
                    returnKeyType="send"
                    onSubmitEditing={this._submit}
                    value={this.state.password}
                  />
                </View>
              </View>
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.passwordWarning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>Enter Password</Text>
              <View style={styles.container}>
                <TouchableOpacity style={{ width: "100%" }} onPress={this.login.bind(this)}>
                  <View style={[styles.SectionStyle2]}>
                    <View style={{ backgroundColor: "#F16822", borderRadius: 5, alignItems: 'center', width: '100%', padding: '4%' }}>
                      <Text allowFontScaling={false} style={{ color: 'white', fontFamily:'Roboto-Bold', fontSize: 18 }}>{Strings.login_button_login}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[styles.container, { marginTop: '3%', marginBottom: '8%' }]}>
                <View style={[styles.SectionStyle2]}>
                  <Text allowFontScaling={false} onPress={() => this.openDialog(true)} style={{ marginTop: '0.003%', marginBottom: '0.3%', color: '#ffffff', fontFamily:'Roboto-Bold' }} numberOfLines={1}>                 {Strings.login_page_forgot}</Text>
                </View>
              </View>
              <Dialog visible={this.state.showDialog}
                onTouchOutside={() => this.openDialog(false)}
                contentStyle={{ justifyContent: 'center', alignItems: 'center', }}
                animationType="fade">
                <View style={{ height: 300,width:'90%' }}>
                  <View style={{ marginTop: 15, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={false} style={{ color: this.state.headColor, fontFamily:'Roboto-Bold', fontSize: 28, textAlign: 'left', alignSelf: 'center' }}>{Strings.login_dlg_password_head}</Text>
                    <Text allowFontScaling={false} style={{  color: this.state.bodyColor, fontSize: 15, marginTop: 22 }}>{this.state.passwordHelpEmail}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <Text allowFontScaling={false} style={{ color: '#FF0000', textAlign: 'left' }}>*</Text>
                    <Text allowFontScaling={false} style={{ color: this.state.headColor, textAlign: 'left', fontFamily:'Roboto-Bold' }}>{Strings.login_dlg_password_email}</Text>
                  </View>
                  <View style={styles.dialog_container}>
                    <View style={[styles.dialog_SectionStyle, { borderColor: this.state.headColor }]}>
                      {commons.renderIf(this.state.pwdImage,
                      <Image source={assetsConfig.icEmailSmall} style={styles.dialog_ImageStyle} />
                      )}
                       {commons.renderIf(!this.state.pwdImage,
                      <Image source={assetsConfig.iconEmailError20px} style={styles.dialog_ImageStyle} />
                      )}
                      <TextInput allowFontScaling={false}
                        style={{ flex: 1, borderColor: this.state.emailWarningBorder }}
                        autoCapitalize="none"
                        onChangeText={(userName) => this.setState({ userName })}
                        underlineColorAndroid="transparent"
                        value={this.state.userName}
                      />
                    </View>
                    <TouchableOpacity style={{ marginTop: 20, marginRight: 10, height: 45, width: '65%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.pass()}>
                      <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{this.state.buttonText}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text allowFontScaling={false} onPress={() => this.openDialog(false)} style={{ textAlign: 'left', color: '#2554C7' }}>{Strings.login_dlg_password_back}</Text>
                  </View>
                </View>
              </Dialog>
              {/*oops*/}
              <Dialog
                visible={this.state.changePwdFail}
                onTouchOutside={() => this.setState({ changePwdFail: false })}
                animation='fade'
              >
                <View >
                  <Image source={assetsConfig.iconErrorGrey60px} style={{ alignSelf: 'center' }} />
                  <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontFamily:'Roboto-Bold', textAlign: 'center' }}>Opps !</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>Incorrect verification code</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>Please try again</Text>
                  <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ changePwdFail: false }) }}>
                      <Text allowFontScaling={false} style={{ color: "white",fontFamily:'Roboto-Bold' }}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Dialog>
                {/*password-Msg-*/}
                <Dialog
                visible={this.state.pwdHelpMsg}
                onTouchOutside={() => this.setState({ pwdHelpMsg: false })}
                animation='fade'
              >
                <View >
                  <Image source={assetsConfig.iconEmailBlue40px} style={{ alignSelf: 'center' }} />
                  <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontFamily:'Roboto-Bold', textAlign: 'center',color:'#236dd3' }}>{Strings.login_pop_change_head}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>{Strings.login_pop_change_desc1}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14,  marginBottom: 5, textAlign: 'center' }}>{Strings.login_pop_change_desc2}</Text>
                  <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ forgetPass: true,pwdHelpMsg:false }) }}>
                      <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.login_pop_change_btn}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Dialog>
              {/*oops*/}
              <Dialog
                visible={this.state.dialogWidgetDelete}
                onTouchOutside={() => this.setState({ dialogWidgetDelete: false })}
                animation='fade'
              >
                <View >
                  <Image source={assetsConfig.iconErrorGrey60px} style={{ alignSelf: 'center' }} />
                  <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.login_error_title}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>{Strings.login_error_message}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>{Strings.login_error_message1}</Text>
                  <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidgetDelete: false }) }}>
                      <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.login_error_button}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Dialog>
              <Dialog visible={this.state.forgetPass}
                onTouchOutside={() => this.setState({ forgetPass: true })}
                contentStyle={{ justifyContent: 'center', alignItems: 'center', }}
                style={{ width: '100%', height: '100%' }}
                animationType="fade">
                <ScrollView style={styless.container}>
                  <View style={{ marginTop: 15 }}>
                    <Text allowFontScaling={false} style={{ fontSize: 20, color: "#F88017", textAlign: 'left', fontFamily:'Roboto-Bold' }}>{Strings.login_verify_head}</Text>
                    <Text allowFontScaling={false} style={{ marginTop: 20 }}>{this.state.passwordHelp}</Text>
                  </View>
                  <Text allowFontScaling={false} style={styless.headStyle}>{Strings.login_verify_message}</Text>
                  <TextInput allowFontScaling={false}
                    // placeholder="Password"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    Password={true}
                    secureTextEntry={true}
                    style={[styless.textInputStyle, { borderColor: this.state.passwordWarningBorder }]}
                    onChangeText={(verificationCode) => this.setState({ verificationCode })}
                    value={this.state.verificationCode}
                  />
                  <Text allowFontScaling={false} style={styless.headStyle}>{Strings.login_verify_newpassword}</Text>
                  <TextInput allowFontScaling={false}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    Password={true}
                    secureTextEntry={true}
                    style={{ padding: '2%', borderRadius: 3, borderColor: this.state.passwordWarningBorder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10 }}
                    onChangeText={(password) => {
                      this.setState({ password });
                      this.GetPasswordStrength(password)
                    }}
                    value={this.state.password}
                  />
                  <Text allowFontScaling={false} style={{ alignSelf: "flex-end", color: this.state.passwordColorCharLimit, marginTop: 10, marginRight: 10 }}>{this.state.passwordCharLimitWarning}</Text>
                  {/*show password strength indicator here*/}
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <View style={{ flexDirection: "row", marginTop: 10, flex: .4 }}>
                      <Image source={assetsConfig.iconPasswordLevelBlue48px} />
                      <Text allowFontScaling={false} style={{ marginLeft: 5, color: "#006BBC", fontSize: 14, fontWeight: "300" }}>{Strings.login_verify_passwordlevel}</Text>
                    </View>
                    <View style={{ flex: .4, marginTop: "5%", marginLeft: '6%' }} >
                      <Slider
                        minimumValue={0}
                        maximumValue={100}
                        step={1}
                        value={this.state.strength}
                        disabled={true}
                        trackStyle={customStyles6.track}
                        thumbStyle={customStyles6.thumb}
                        minimumTrackTintColor={this.state.color} />
                      <Text allowFontScaling={false} style={{ alignSelf: "center", color: this.state.color, marginTop: -5 }}>{this.state.label}</Text>
                    </View>
                  </View>
                  <Text allowFontScaling={false} style={styless.headStyle}>{Strings.login_verify_cnpass}</Text>
                  <TextInput allowFontScaling={false}
                    // placeholder="Confirm Password"
                    Password={true}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                    style={[styless.textInputStyle, { borderColor: this.state.confirmPasswordWarningBorder }]}
                    onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                    value={this.state.confirmPassword}
                  />
                  <Text allowFontScaling={false} style={[styless.warningText, { display: this.state.confirmPasswordWarning }]}>{Strings.login_verify_warn}</Text>
                  <Text allowFontScaling={false} style={{ color: "red", display: this.state.checked_warning, fontSize: 10, fontWeight: 'bold', marginTop: '10%', marginLeft: 12 }}></Text>
                  <TouchableOpacity onPress={() => this._handleSave()}>
                    <View style={{ borderRadius: 10, backgroundColor: 'orange', padding: 10, alignItems: 'center', marginLeft: 8, marginRight: 8 }}>
                      <Text allowFontScaling={false} style={{ color: 'white', fontSize: 16, fontWeight: '500',fontFamily:"Roboto" }}>{Strings.login_verify_button}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ bottom: 0, right: 0, paddingTop: '0.2%' }}>
                    <Text allowFontScaling={false} onPress={() => this.setState({ forgetPass: false, showDialog: false })} style={{ textAlign: 'left', color: 'blue' }}>{Strings.login_dlg_password_back}</Text>
                  </View>
                </ScrollView>
              </Dialog>
              {/*NEW SIGNUP*/}
              <View style={[styles.container, { marginTop: '6%' }]}>
                <View style={styles.SectionStyle2}>
                  <View style={{ width: '60%' }}>
                    <Text allowFontScaling={false} style={{ color: '#FFFFFF',fontSize:winwidth>350?14:12, fontFamily:'Roboto-Bold' }}
                      numberOfLines={1}
                    >{Strings.login_page_account}</Text>
                  </View>
                  <TouchableOpacity style={{}} onPress={() => navigate("signup", { screen: "signup" })} style={{ width: '40%' }}>
                    <View style={{ backgroundColor: '#F16822', alignItems: 'center', padding: '2%', borderRadius: 13 }}>
                      <Text allowFontScaling={false} style={{ color: 'white', fontFamily:'Roboto-Bold', fontSize: 14 }}>    {Strings.login_page_signup}    </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              {/* <Login/> */}
             <View style={{width:"100%",height:240,flexDirection:"column",alignItems:"center",justifyContent:"center",marginTop:-20}}>
                <TouchableOpacity style={{ borderRadius: 5, flexDirection: "row", width: '90%', height: '18%', backgroundColor: 'white', alignItems: 'center', justifyContent: "center" }} onPress={() => this.facebookLogin()} >
                  <Image source={assetsConfig.iconFacebook28px} />
                  <Text allowFontScaling={false} style={{ marginLeft: '8%', fontSize: 15, fontFamily:'Roboto-Bold', color: "#000F70" }}>{Strings.login_page_signupfb}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 14, borderRadius: 5, flexDirection: "row", width: '90%', height: '18%', backgroundColor: 'white', alignItems: 'center', justifyContent: "center" }} onPress={() => this.onGoogleSignInButton()} >
                  <Image source={assetsConfig.google} />
                  <Text allowFontScaling={false} style={{ marginLeft: '8%', fontSize: 15, fontFamily:'Roboto-Bold', color: "#D21919" }}>{Strings.login_page_signupgoogle}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
         </ ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '4%'
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: .5,
    borderColor: '#000',
    padding: '0.005%',
    width: '90%',
    borderRadius: 5,
    marginBottom: '0.556%'
  },
  SectionStyle2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.005%',
    width: '90%',
    borderRadius: 5,
    marginBottom: '0.556%'
  },
  ImageStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center'
  },
  dialogbutton: {
    alignItems: 'center',
    width: 0.5,
    height: 40,
    padding: 10
  },
  dialog_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog_SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: .5,
    // borderColor: 'red',
  },
  dialog_SectionStyle1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: .5,
    borderColor: '#FF0000',
  },
  dialog_ImageStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center'
  },
});
const styless = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: "white"
  },
  buttonStyle: {
    color: 'red',
    marginTop: 10,
    padding: 20,
    backgroundColor: 'green'
  },
  content: {
    marginBottom: 10,
  },
  textInputStyle: {
    padding: 3,
    borderRadius: 3,
    height: 40,
    borderWidth: 1,
    marginTop: 4,
    marginLeft: 10,
    marginRight: 10
  },
  warningText:
    {
      color: "red",
      fontSize: 10,
      fontFamily:'Roboto-Bold',
      marginTop: 4,
      marginLeft: 12
    },
  headStyle: {
    color: "dodgerblue",
    fontSize: 12,
    fontFamily:'Roboto-Bold',
    marginTop: 10,
    marginLeft: 10
  },
});
var customStyles6 =
  StyleSheet.create({
    track: {
      height: 14,
      borderRadius: 2,
      backgroundColor: '#BFBFBF',
      borderColor: '#BFBFBF',
      borderWidth: 1,
    },
    thumb: {
      width: 0,
      height: 0,
      borderRadius: 2,
      backgroundColor: '#BFBFBF',
      borderColor: '#9a9a9a',
      borderWidth: 1,
    },
    texstyle: {
      fontSize: 18,
      color: "black"
    }
  });
