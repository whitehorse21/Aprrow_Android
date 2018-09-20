import React, { Component } from 'react';
//import Loader from './utils/Loader';
import LoaderNew from '../utils/LoaderNew';
import Slider from "react-native-slider";

import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'react-native-aws-cognito-js';
import { Dialog } from 'react-native-simple-dialogs';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} from "react-native-fbsdk";
import commons from '../commons';
import device_style from '../styles/device.style';

import {
  Text,
  TextInput,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  ToastAndroid,
  BackHandler,
  AsyncStorage,
  Dimensions
} from 'react-native';
import databasehelper from '../utils/databasehelper';
import { GoogleSignin } from 'react-native-google-signin';
import { styless, customStyles6, styles } from './index.style';

const awsCognitoSettings = {
  UserPoolId: commons.AWSConfig.UserPoolId,
  ClientId: commons.AWSConfig.ClientId
};

var AWS = require("aws-sdk");
AWS.config.update({ region: "" + commons.AWSConfig.region });

import ForgetPassword from '@components/forget-password'

export default class Login extends Component {

  static navigationOptions = {
    header: () => null
  }

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      Password: '',
      Email_warningborder: "grey",
      Email_warning: "none",

      Password_warning: "none",
      Password_warningborder: "grey",
      password_help: "Enter verification code to reset your password",
      password_help_email: "Enter your email address. you will receive a verification code to reset your password",
      buttonText: "Retrieve Password",
      loading: false,
      eula_id: "",
      eula_text: "",
      user: "",
      forgetPass: false,

      Email: "",
      Email_warningborder: "grey",
      Email_warning: "none",

      CurrentPassword: "",
      CurrentPassword_warningborder: "grey",
      CurrentPassword_warning: "none",

      Password: "",
      Password_warningborder: "grey",
      password_color_charlimit: "grey",
      password_color_uppercase: "#004d99",
      password_color_lowercase: "#004d99",
      password_color_number: "#004d99",
      password_color_Specialcharachters: "#004d99",

      password_char_limitwarning: "Use at least 6 characters.",
      password_uppercase_warning: "- uppercase",
      password_lowercase_warning: "- lowercase",
      password_number_warning: "- Number",
      password_Specialcharachters_warning: "- special characters",

      ConfirmPassword: "",
      ConfirmPassword_warningborder: "grey",
      ConfirmPassword_warning: "none",
      cognitouserdata: '',
      dialogWidget_delete: false,
      verificationcode: '',
      changePwdFail: false,
      headColor: "#006BBC",
      bodyColor: "#bcb7b7",
      pwdImage: true,
      pwdHelpMsg: false,
      showDialog: false

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
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this._setupGoogleSignin();
  }

  async facebookLogin() { //this.setState({loading:true});
    var image = [];


    const { navigate } = this.props.navigation;
    var _this = this;
    await LoginManager.logInWithReadPermissions(['public_profile']).then(await
      function (result) {
        if (result.isCancelled) {
          ToastAndroid.show('Login was cancelled', 3000);
        } else {
          _this.refs.loaderTest.show();
          AccessToken.getCurrentAccessToken().then(async data => {
            AWS.config.region = commons.AWSConfig.region; // "us-west-2";
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(
              {
                IdentityPoolId: commons.AWSConfig.IdentityPoolId,//  "us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25",
                Logins: {
                  'graph.facebook.com': data.accessToken.toString()
                  //"graph.facebook.com": data.accessToken.toString()
                }
              });


            AWS.config.credentials.get(async function () {
              var id = AWS.config.credentials.accessToken;

              let accessToken = data.accessToken;
              const responseInfoCallback = async (error, result) => {
                if (error) {
                  console.log(error)
                } else {
                  var acceestoken1 = await commons.get_token();
                  await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'accountvalidation', {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization': acceestoken1
                    },
                    body: JSON.stringify({
                      "username": "" + result.email,
                      "from": "facebook"
                    }),
                  }).then((response) => response.json())
                    .then(async (responseJson) => {

                      if (responseJson.status == true || responseJson.status == "true") {
                        var uuid = await commons.getuuid()
                        uuid = "facebook" + uuid;

                        await databasehelper.AllTableDelete();

                        var createtime = await commons.gettimestamp();
                        var dataObj = {};
                        dataObj.firstname = result.first_name;
                        dataObj.lastname = result.last_name;
                        dataObj.accountUniqueID = result.id;
                        //dataObj.username = result.id;
                        dataObj.username = uuid;
                        dataObj.eulaid = "1";
                        dataObj.createtime = createtime;

                        dataObj.email = result.email;
                        //dataObj.federatedId=identityId;
                        dataObj.federatedId = id;
                        dataObj.facebookId = result.id;
                        dataObj.loginfrom = "facebook";
                        dataObj.accessToken = accessToken;


                        var acceestoken = await commons.get_token();
                        await fetch("" + commons.AWSConfig.path + commons.AWSConfig.stage + "newusermgnt", {
                          method: 'POST',
                          headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': acceestoken
                          },
                          body: JSON.stringify({
                            "operation": "CreateNewUser01",
                            "TableName": commons.AWSConfig.usertable,
                            "payload": dataObj
                          }),
                        }).then((response) => response.json())
                          .then(async (responseJson) => {
                            if (responseJson.status == "SUCCESS" || responseJson.status == '"SUCCESS"' || responseJson.status == "Already_exists" || responseJson.status == '"Already_exists"') {

                              var username = responseJson.username;
                              //alert("Enter======>>>>>"+responseJson.username);
                              dataObj.username = username;

                              var proObj = {};
                              proObj.profileimage = '0';
                              proObj.username = dataObj.username;
                              proObj.createtime = dataObj.createtime;
                              //--------------------------login start-------------------------------------------------
                              //await AsyncStorage.setItem("username", result.id);
                              await AsyncStorage.setItem("username", responseJson.username);
                              await AsyncStorage.setItem("facebook", "1");
                              await AsyncStorage.setItem("firstrun", "1");


                              var acceestoken2 = await commons.get_token();
                              await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'userdatamgnt', {
                                method: 'POST',
                                headers: {
                                  Accept: 'application/json',
                                  'Content-Type': 'application/json',
                                  'Authorization': acceestoken2
                                },
                                body: JSON.stringify({
                                  "operation": "getUser",
                                  "TableName": "Users",
                                  "username": username
                                }),
                              }).then((response) => response.json())
                                .then(async (responseJson) => {
                                  responseJson["createtime"] = "0";

                                  var profiledata = responseJson.profile;
                                  var devicedata = responseJson.device;
                                  var widgetdata = responseJson.widgets;
                                  var em = "";
                                  if (responseJson.hasOwnProperty("email"))
                                    em = responseJson.email;

                                  await AsyncStorage.setItem("email", em);
                                  await databasehelper.insertuser(responseJson);
                                  await databasehelper.insertprofile(profiledata);

                                  //insertprofile image if has one 
                                  var proObj = {};
                                  proObj["profileimage"] = '0';
                                  if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                                    proObj.profileimage = profiledata.profileimage;
                                  }
                                  proObj.username = profiledata.username;
                                  proObj.createtime = profiledata.createtime;

                                  //get current device
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
                                  var smartstaxid = "";
                                  var fileids_download = [];
                                  if (widgetdata != null && widgetdata.length > 0) {
                                    await databasehelper.bulkinsertwidget(widgetdata);

                                    for (var i = 0; i < widgetdata.length; i++) {
                                      if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                                        mostusedwidgetid = widgetdata[i].widgetid;
                                      }
                                      if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "4") {
                                        smartstaxid = widgetdata[i].widgetid;
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
                              ToastAndroid.show('Sign Up Successful.', 500);
                              _this.refs.loaderTest.hide();
                              navigate("bottom_menu", user = { "page": "Home" });
                            }
                            else if (JSON.stringify(responseJson) == "Already_exists" || responseJson.status == "Already_exists") {
                              _this.refs.loaderTest.hide();
                              ToastAndroid.show('Login successfully.', 500);
                              navigate("bottom_menu", user = { "page": "Home" });
                            }
                            else {
                              _this.refs.loaderTest.hide();
                              ToastAndroid.show(JSON.stringify(responseJson), 500);
                            }
                          })
                          .catch((error) => {
                            console.error(error);
                          });
                      }
                      else {
                        LoginManager.logOut();
                        _this.refs.loaderTest.hide();
                        var existingAccount = responseJson.existingAccount;
                        if (existingAccount == "app")
                          existingAccount = "APRROW";

                        ToastAndroid.show("This account is already linked with " + existingAccount + ". Please use " + existingAccount + " sign-in", 3000);
                      }
                    });
                }
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
        ToastAndroid.show('Login failed with error: ' + error, 500);
      }
    );
    if (image.length > 0) {
      alert(image.length);
      this.downloadimages(image);
    }

  }

  async downloadimages(ids) {
  }
  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });

      await GoogleSignin.configure({
        webClientId: commons.AWSConfig.webClientId,
        offlineAccess: false
      });

      const user = await GoogleSignin.currentUserAsync();
      this.setState({ user });
    }
    catch (err) {
      console.log("There are any error", err.message);
    }
  }

  async onGoogleSignInButton() {
    // this._setupGoogleSignin();
    GoogleSignin.signIn()
      .then(async (user) => {
        var acceestoken1 = await commons.get_token();
        await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'accountvalidation', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': acceestoken1
          },
          body: JSON.stringify({
            "username": "" + user.email,
            "from": "google"
          }),
        }).then((response) => response.json())
          .then(async (responseJson) => {
            if (responseJson.status == true) {
              await this.refs.loaderTest.show();
              var IdentityPoolId = commons.AWSConfig.IdentityPoolId;
              const { navigate } = this.props.navigation;
              AWS.config.region = commons.AWSConfig.region;// 'us-west-2';

              AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                //'us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25', // your identity pool id here
                IdentityPoolId: IdentityPoolId,
                Logins: {
                  'accounts.google.com': user.idToken
                }
              });

              //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
              AWS.config.credentials.refresh(async (error) => {
                if (error) {
                  await this.refs.loaderTest.hide();
                  ToastAndroid.show(error, 3000);
                } else {
                  await databasehelper.AllTableDelete();
                  var identity_id = AWS.config.credentials.identityId;
                  let accessToken = user.accessToken;

                  var uuid = await commons.getuuid()
                  uuid = "google" + uuid;
                  var createtime = commons.gettimestamp();
                  var dataObj = {};
                  dataObj.firstname = user.givenName;
                  dataObj.lastname = user.familyName;
                  //dataObj.username = user.id;
                  dataObj.username = uuid;
                  dataObj.accountUniqueID = user.id;
                  dataObj.eulaid = "1";
                  dataObj.createtime = createtime;

                  dataObj.email = user.email;
                  //dataObj.federatedId=identityId;
                  dataObj.federatedId = identity_id;
                  dataObj.googleId = user.id;
                  dataObj.loginfrom = "google";
                  dataObj.accessToken = accessToken;


                  var acceestoken = await commons.get_token();
                  await fetch("" + commons.AWSConfig.path + commons.AWSConfig.stage + "newusermgnt", {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization': acceestoken
                    },
                    body: JSON.stringify({
                      "operation": "CreateNewUser01",
                      "TableName": commons.AWSConfig.usertable,
                      "payload": dataObj
                    }),
                  }).then((response) => response.json())
                    .then(async (responseJson) => {
                      if (responseJson.status == "SUCCESS" || responseJson.status == "Already_exists") {
                        dataObj.username = responseJson.username;
                        var username = dataObj.username;

                        var proObj = {};
                        proObj.profileimage = '0';
                        proObj.username = dataObj.username;
                        proObj.createtime = dataObj.createtime;
                        await AsyncStorage.setItem("firstrun", "1");
                        await AsyncStorage.setItem("username", responseJson.username);

                        var acceestoken2 = await commons.get_token();
                        await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'userdatamgnt', {
                          method: 'POST',
                          headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': acceestoken2
                          },
                          body: JSON.stringify({
                            "operation": "getUser",
                            "TableName": "Users",
                            "username": username
                          }),
                        }).then((response) => response.json())
                          .then(async (responseJson) => {
                            await AsyncStorage.setItem("google", "1");
                            await AsyncStorage.setItem("email", responseJson.email);
                            responseJson["createtime"] = "0";

                            var profiledata = responseJson.profile;
                            var devicedata = responseJson.device;
                            var widgetdata = responseJson.widgets;

                            await databasehelper.insertuser(responseJson);
                            await databasehelper.insertprofile(profiledata);

                            var proObj = {};
                            proObj["profileimage"] = '0';
                            if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                              proObj.profileimage = profiledata.profileimage;
                            }
                            proObj.username = profiledata.username;
                            proObj.createtime = profiledata.createtime;


                            //get current device
                            var DeviceInfo = require('react-native-device-info');
                            var curr_deviceid_hardid = await DeviceInfo.getUniqueID();
                            var curr_device_uuid = "";
                            if (devicedata != null && devicedata.length > 0) {
                              for (var i = 0; i < devicedata.length; i++) {

                                if (devicedata[i].devicehardwareid == curr_deviceid_hardid) {
                                  curr_device_uuid = devicedata[i].deviceid;
                                  break;
                                }
                              }
                            }

                            var mostusedwidgetid = "";
                            var smartstaxid = "";
                            var fileids_download = [];

                            if (widgetdata != null && widgetdata.length > 0) {
                              for (var i = 0; i < widgetdata.length; i++) {
                                if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                                  mostusedwidgetid = widgetdata[i].widgetid;
                                }
                                if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "4") {
                                  smartstaxid = widgetdata[i].widgetid;
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
                          });
                      }
                      this.refs.loaderTest.hide();


                      if (JSON.stringify(responseJson) == "SUCCESS" || responseJson.status == "SUCCESS") {
                        ToastAndroid.show('Sign Up Successful.', 500);
                        navigate("bottom_menu", user = { "page": "Home" });
                      }
                      else if (JSON.stringify(responseJson) == "Already_exists" || responseJson.status == "Already_exists") {
                        ToastAndroid.show('Login successfully.', 500);
                        navigate("bottom_menu", user = { "page": "Home" });
                      }
                      else {
                        ToastAndroid.show(JSON.stringify(responseJson), 500);
                      }
                    })
                    .catch((error) => {
                    });
                }
              })
            }
            else {
              GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
              })
                .done();
              var existingAccount = responseJson.existingAccount;

              if (existingAccount == "app")
                existingAccount = "APRROW";

              ToastAndroid.show("This account is already linked with " + existingAccount + ". Please use " + existingAccount + " sign-in", 3000);
            }
          });
      })
      .catch((err) => {
      })
      .done();
  }

  onGoogleSignOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({ user: null });
    })
      .done();
  }
  openDialog(show) {
    this.setState({
      headColor: "#006BBC",
      bodyColor: "",
      buttonText: "Retrieve Password",
      pwdImage: true,
      Password_warningborder: "grey",
      password_help_email: "Enter your email address. you will receive a verification code to reset your password",
    });
    this.setState({ showDialog: show });
  }
  openDialog_d2(show) {
    this.setState({ showDialog_d2: show });
  }
  password_reset() {
    this.setState({ showDialog: false });

    var params = {
      ClientId: 'STRING_VALUE', /* required */
      ConfirmationCode: 'STRING_VALUE', /* required */
      Password: 'STRING_VALUE', /* required */
      Username: 'STRING_VALUE', /* required */
      AnalyticsMetadata: {
        AnalyticsEndpointId: 'STRING_VALUE'
      },
      SecretHash: 'STRING_VALUE',
      UserContextData: {
        EncodedData: 'STRING_VALUE'
      }
    };
    cognitoidentityserviceprovider.confirmForgotPassword(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data);           // successful response
    });
  }

  async geteulaText() {

    var acceestoken = await commons.get_token();
    fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'eulaDataMgnt', {
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
      .then((responseJson) => {
        var result = JSON.parse(responseJson);
        this.state.eula_id = result.Item.eulaId.S;
        this.state.eula_text = result.Item.eulaText.S;
      })
      .catch((error) => {
      });
  }

  async  login() {
    this.refs.loaderTest.show();
    var username = (this.state.username).toLowerCase();
    var _this = this
    const userPool = new CognitoUserPool(awsCognitoSettings);
    const authDetails = new AuthenticationDetails({
      Username: (this.state.username).toLowerCase(),
      Password: this.state.Password
    });
    const cognitoUser = new CognitoUser({
      Username: (this.state.username).toLowerCase(),
      Pool: userPool
    });
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        var userpoolmap = AWSConfig["userpoolmap"];
        var loginmap = {};
        loginmap[userpoolmap] = result.getIdToken().getJwtToken();
        await databasehelper.AllTableDelete();
        AWS.config.region = commons.AWSConfig.region;// "us-west-2";
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: commons.AWSConfig.IdentityPoolId,// "us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25",
          Logins: loginmap
        });
        AWS.config.credentials.get(async function () {
        });
        AWS.config.credentials.refresh((error) => {
          if (error) {
            this.setState({ dialogWidget_delete: true });
          } else {
          }
        });

        var params = {
          AccessToken: result.getAccessToken().getJwtToken()
        };
        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
        cognitoidentityserviceprovider.getUser(params, async function (err, data11) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            username = data11.Username;
            await AsyncStorage.setItem("username", username);
            AsyncStorage.setItem("firstrun", "1");

            var acceestoken = await commons.get_token();
            fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'userdatamgnt', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': acceestoken
              },
              body: JSON.stringify({
                "operation": "getUser",
                "TableName": "Users",
                "username": username
              }),
            }).then((response) => response.json())
              .then(async (responseJson) => {

                AsyncStorage.setItem("email", responseJson.email);
                responseJson["createtime"] = "0";

                var profiledata = responseJson.profile;
                var devicedata = responseJson.device;
                var widgetdata = responseJson.widgets;

                await databasehelper.insertuser(responseJson);
                await databasehelper.insertprofile(profiledata);

                var proObj = {};
                proObj["profileimage"] = '0';
                if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                  proObj.profileimage = profiledata.profileimage;
                }
                proObj.username = profiledata.username;
                proObj.createtime = profiledata.createtime;

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
                var smartstaxid = "";
                var fileids_download = [];
                if (widgetdata != null && widgetdata.length > 0) {
                  await databasehelper.bulkinsertwidget(widgetdata);

                  for (var i = 0; i < widgetdata.length; i++) {
                    if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "0") {
                      mostusedwidgetid = widgetdata[i].widgetid;
                    }
                    if (widgetdata[i].deviceid == curr_device_uuid && widgetdata[i].mostusedwidget == "4") {
                      smartstaxid = widgetdata[i].widgetid;
                    }

                    if (widgetdata[i].deviceid == curr_device_uuid && commons.isimagevalid(widgetdata[i])) {
                      fileids_download.push(widgetdata[i].fileid)
                    }
                  }
                  _this.downloadimages(fileids_download);
                }
                await AsyncStorage.setItem("mostusedwidgetid", mostusedwidgetid);
                await AsyncStorage.setItem("smartstaxid", smartstaxid);
                await AsyncStorage.setItem("currentdeviceid", curr_device_uuid);
                _this.refs.loaderTest.hide();
                commons.replaceScreen(_this, 'bottom_menu', {});
              })
              .catch((error) => {
                _this.refs.loaderTest.hide();
              });
          }
        });
      },
      onFailure: () => {
        this.refs.loaderTest.hide();
        this.setState({ dialogWidget_delete: true }); //this.setState({ username: '', Password: '' });
        return;
      }
    });
  }
  async verificationPass() {
    this.setState({ showDialog: false });
    this.setState({ forgetPass: false });
    var params = {
      ClientId: commons.AWSConfig.ClientId, /* required */
      ConfirmationCode: this.state.verificationcode, /* required */
      Password: this.state.Password, /* required */
      Username: (this.state.username).toLowerCase(), /* required */
    };
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    cognitoidentityserviceprovider.confirmForgotPassword(params, function (err, data) {
      if (err) {
        var errormsg = JSON.stringify(err);
        if (errormsg.contains("Invalid verification")) {
          ToastAndroid.show('Incorrect Verification Code', 500);
        }
        else if (errormsg.contains("lambda")) {
          ToastAndroid.show('Password Changed Successfully ', 500);
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
  _handleSave = () => {
    var errocount = 0;

    var temp_password = this.state.Password;
    if (temp_password == null)
      temp_password = "";

    if (temp_password.length < 6 || temp_password.length > 15) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_char_limitwarning: "* 6 to 15 characters",
        password_color_charlimit: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_char_limitwarning: "✓  6 to 15 characters",
        password_color_charlimit: "green",
      })
    }

    //confirm password validations
    if (this.state.ConfirmPassword == null || this.state.ConfirmPassword == "" || this.state.ConfirmPassword != this.state.Password) {
      errocount++;
      this.setState({
        ConfirmPassword_warning: "flex",
        ConfirmPassword_warningborder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        ConfirmPassword_warning: "none",
        ConfirmPassword_warningborder: "grey"
      });
    }


    if (errocount == 0) {
      this.verificationPass();
    }
  }


  Get_password_strength(password_user_input) {
    var temp_password = password_user_input;

    var strength = 0;
    var label = "";
    var color = "";


    if (temp_password == null)
      temp_password = "";

    var n = temp_password.length;
    var haslower = false;
    var hasupper = false;
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
      updateColorAndStrength(100, "#2CAE1C", "STRONG");
    }
    else if (n >= 6 && strength >= 3) {
      updateColorAndStrength(60, "#0065B2", "Good");
    }
    else {
      updateColorAndStrength(30, "#CC0000", "Weak");
    }

    this.setState({
      strength: strength,
      color: color,
      label: label
    });

    function updateColorAndStrength(s, c, l) {
      strength = s;
      color = c;
      label = l;
    }
  }

  _next = () => {
    this._password && this._password.focus();
  }
  _submit = () => {
    this.login();
  };

  renderInputField(placeholder, returnKeyType, keyboardType, isPassword, textChangeCallback, refrence, val, submitEditingCallback) {
    return (
      <View style={styles.container}>
        <View style={styles.SectionStyle}>
          <TextInput allowFontScaling={false}
            style={{ flex: 1, borderColor: this.state.Email_warningborder, padding: 10 }}
            placeholder={placeholder}
            ref={refrence}
            onChangeText={textChangeCallback}
            autoCapitalize="none"
            keyboardType={keyboardType}
            underlineColorAndroid="transparent"
            value={val}
            returnKeyType={returnKeyType}
            Password={isPassword}
            secureTextEntry={isPassword}
            onSubmitEditing={submitEditingCallback} />
        </View>
      </View>
    )
  }
  render() {
    var windowProp = Dimensions.get('window');
    var winwidth = windowProp.width;
    const { navigate } = this.props.navigation
    return (
      <ImageBackground source={require('../assets/login_background.png')}
        style={{ flex: 1 }}>
        < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-300} style={{ flex: 1 }}>
          <LoaderNew ref={"loaderTest"} />
          <ScrollView style={{ width: '100%', height: '100%' }}>
            <View style={{ height: '100%', alignItems: 'center' }}>
              <View style={{
                width: '82%',
                flexDirection: 'column',
                alignItems: 'center',
                //backgroundColor: '#014E82',
                paddingTop: '5%',
                alignItems: 'center'
              }}>
                <Image source={require('../assets/login_logo.png')}
                  style={{
                    marginTop: '15%',
                    marginBottom: '15%'
                  }}
                />
                {this.renderInputField("Email", "next", "email-address", false, (username) => this.setState({ username }), ref => { this._username = ref }, this.state.username, this._next)}
                <Text allowFontScaling={false} style={{ color: "red", display: this.state.Email_warning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>Enter a valid email</Text>
                {this.renderInputField("Password", "send", "default", true, (Password) => this.setState({ Password }), ref => { this._password = ref }, this.state.Password, this._submit)}
                <Text allowFontScaling={false} style={{ color: "red", display: this.state.Password_warning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>Enter Password</Text>

                <View style={styles.container}>
                  <TouchableOpacity style={{ width: "100%" }} onPress={this.login.bind(this)}>
                    <View style={[styles.SectionStyle2]}>
                      <View style={{ backgroundColor: "#F16822", borderRadius: 5, alignItems: 'center', width: '100%', padding: '4%' }}>
                        <Text allowFontScaling={false} style={{ color: 'white', fontFamily: 'Roboto-Bold', fontSize: 18 }}>Login</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.container, { marginTop: '3%', marginBottom: '8%' }]}>
                  <View style={[styles.SectionStyle2]}>
                    <Text allowFontScaling={false} onPress={() => this.openDialog(true)} style={{ marginTop: '0.003%', marginBottom: '0.3%', color: '#ffffff', fontFamily: 'Roboto-Bold' }} numberOfLines={1}>                 Forgot your password?</Text>
                  </View>
                </View>
                <ForgetPassword
                  allowFontScaling={false} 
                  showDialog = {this.state.showDialog} 
                  bodyColor = {this.state.bodyColor}
                  pwdImage = {this.state.pwdImage}
                  username = {this.state.username}
                  Email_warningborder = {this.state.Email_warningborder}
                  password_help_email = {this.state.password_help_email}
                  buttonText = {this.state.buttonText}
                  headColor = {this.state.headColor} />

                <Dialog
                  visible={this.state.changePwdFail}
                  onTouchOutside={() => this.setState({ changePwdFail: false })}
                  animation='fade'
                >
                  <View >
                    <Image source={require('../assets/icon_error_grey_60px.png')} style={{ alignSelf: 'center' }} />
                    <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontFamily: 'Roboto-Bold', textAlign: 'center' }}>Opps !</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>Incorrect verification code</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>Please try again</Text>
                    <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                      <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ changePwdFail: false }) }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>OK</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Dialog>
                <Dialog
                  visible={this.state.pwdHelpMsg}
                  onTouchOutside={() => this.setState({ pwdHelpMsg: false })}
                  animation='fade'
                >
                  <View >
                    <Image source={require('../assets/icon_email_blue_40px.png')} style={{ alignSelf: 'center' }} />
                    <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontFamily: 'Roboto-Bold', textAlign: 'center', color: '#236dd3' }}>Change Password</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>Verification code have been sent</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, textAlign: 'center' }}>to your email address</Text>
                    <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                      <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ forgetPass: true, pwdHelpMsg: false }) }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>OK</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Dialog>
                <Dialog
                  visible={this.state.dialogWidget_delete}
                  onTouchOutside={() => this.setState({ dialogWidget_delete: false })}
                  animation='fade'
                >
                  <View >
                    <Image source={require('../assets/icon_error_grey_60px.png')} style={{ alignSelf: 'center' }} />
                    <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>Opps !</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}>Incorrect email or password</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>Please try again</Text>
                    <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                      <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>OK</Text>
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
                      <Text allowFontScaling={false} style={{ fontSize: 20, color: "#F88017", textAlign: 'left', fontFamily: 'Roboto-Bold' }}>Change Password</Text>
                      <Text allowFontScaling={false} style={{ marginTop: 20 }}>{this.state.password_help}</Text>
                    </View>
                    <Text allowFontScaling={false} style={styless.headStyle}>Verification Code</Text>
                    <TextInput allowFontScaling={false}
                      underlineColorAndroid="transparent"
                      autoCapitalize="none"
                      Password={true}
                      secureTextEntry={true}
                      style={[styless.textInputStyle, { borderColor: this.state.Password_warningborder }]}
                      onChangeText={(verificationcode) => this.setState({ verificationcode })}
                      value={this.state.verificationcode}
                    />

                    <Text allowFontScaling={false} style={styless.headStyle}>New Password</Text>
                    <TextInput allowFontScaling={false}
                      placeholder="Password"
                      underlineColorAndroid="transparent"
                      autoCapitalize="none"
                      Password={true}
                      secureTextEntry={true}
                      style={{ padding: '2%', borderRadius: 3, borderColor: this.state.Password_warningborder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10 }}
                      onChangeText={(Password) => {
                        this.setState({ Password });
                        this.Get_password_strength(Password)
                      }}
                      value={this.state.Password}
                    />
                    <Text allowFontScaling={false} style={{ alignSelf: "flex-end", color: this.state.password_color_charlimit, marginTop: 10, marginRight: 10 }}>{this.state.password_char_limitwarning}</Text>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                      <View style={{ flexDirection: "row", marginTop: 10, flex: .4 }}>
                        <Image source={require("../assets/icon_password_level_blue_48px.png")} />
                        <Text allowFontScaling={false} style={{ marginLeft: 5, color: "#006BBC", fontSize: 14, fontWeight: "300" }}>Password Level :</Text>
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
                    <Text allowFontScaling={false} style={styless.headStyle}>Confirm New Password</Text>
                    <TextInput allowFontScaling={false}
                      Password={true}
                      secureTextEntry={true}
                      autoCapitalize="none"
                      underlineColorAndroid="transparent"
                      style={[styless.textInputStyle, { borderColor: this.state.ConfirmPassword_warningborder }]}
                      onChangeText={(ConfirmPassword) => this.setState({ ConfirmPassword })}
                      value={this.state.ConfirmPassword}
                    />
                    <Text allowFontScaling={false} style={[styless.warningText, { display: this.state.ConfirmPassword_warning }]}>the specified passwords do not match</Text>
                    <Text allowFontScaling={false} style={{ color: "red", display: this.state.checked_warning, fontSize: 10, fontWeight: 'bold', marginTop: '10%', marginLeft: 12 }}></Text>
                    <TouchableOpacity onPress={() => this._handleSave()}>
                      <View style={{ borderRadius: 10, backgroundColor: 'orange', padding: 10, alignItems: 'center', marginLeft: 8, marginRight: 8 }}>
                        <Text allowFontScaling={false} style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Submit</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={{ bottom: 0, right: 0, paddingTop: '0.2%' }}>
                      <Text 
                        allowFontScaling={false} onPress={() => this.setState({ forgetPass: false, showDialog: false })} 
                        style={{ textAlign: 'left', color: 'blue' }}>Back to Sign in</Text>
                    </View>
                  </ScrollView>
                </Dialog>
                <View style={[styles.container, { marginTop: '6%' }]}>
                  <View style={styles.SectionStyle2}>
                    <View style={{ width: '60%' }}>
                      <Text allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: winwidth > 350 ? 14 : 12, fontFamily: 'Roboto-Bold' }}
                        numberOfLines={1}
                      >Don't have an account?</Text>
                    </View>
                    <TouchableOpacity style={{}} onPress={() => navigate("signup", { screen: "signup" })} style={{ width: '40%' }}>
                      <View style={{ backgroundColor: '#F16822', alignItems: 'center', padding: '2%', borderRadius: 13 }}>
                        <Text allowFontScaling={false} style={{ color: 'white', fontFamily: 'Roboto-Bold', fontSize: 14 }}>    Sign Up    </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ width: "100%", height: 240, flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: -20 }}>
                  <TouchableOpacity style={{ borderRadius: 5, flexDirection: "row", width: '90%', height: '18%', backgroundColor: 'white', alignItems: 'center', justifyContent: "center" }} onPress={() => this.facebookLogin()} >
                    <Image source={require('../assets/icon_facebook_28px.png')} />
                    <Text allowFontScaling={false} style={{ marginLeft: '8%', fontSize: 15, fontFamily: 'Roboto-Bold', color: "#000F70" }}>Log in With Facebook</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginTop: 14, borderRadius: 5, flexDirection: "row", width: '90%', height: '18%', backgroundColor: 'white', alignItems: 'center', justifyContent: "center" }} onPress={() => this.onGoogleSignInButton()} >
                    <Image source={require('../assets/icon_google+.png')} />
                    <Text allowFontScaling={false} style={{ marginLeft: '8%', fontSize: 15, fontFamily: 'Roboto-Bold', color: "#D21919" }}>Log in With Google+</Text>
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