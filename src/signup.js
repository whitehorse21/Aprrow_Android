import React from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'react-native-aws-cognito-js';
import { AsyncStorage } from 'react-native';
import databasehelper from './utils/databasehelper.js';
import LoaderNew from './utils/LoaderNew';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, NativeModules, ToastAndroid, Image, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import Slider from "react-native-slider";
import Modal from 'react-native-modal';
import commons from './commons.js';
import CheckBox from 'react-native-check-box';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var awsData = require("./config/AWSConfig.json");
var Mixpanel = require('react-native-mixpanel');
export default class signup extends React.Component {
 
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation
    let title = Strings.signup_page_head;
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleAllowFontScaling=false;
    let headerTitleStyle = { color: 'white',fontFamily: 'Roboto-Bold',fontWeight:'200', marginLeft: 0, fontSize: 18 };
    let headerTintColor = 'white';
    return { title, headerStyle, headerTitleStyle, headerTintColor,headerTitleAllowFontScaling 
     };
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      firstNameWarningBorder: "grey",
      firstName: "",
      firstNameWarning: "none",
      lastName: "",
      lastNameWarningBorder: "grey",
      lastNameWarning: "none",
      email: "",
      emailWarningBorder: "grey",
      emailWarning: "none",
      password: "",
      passwordWarningBorder: "grey",
      passwordColorCharLimit: "#757575",
      passwordCharLimitWarning: Strings.signup_page_passrule,
      confirmPassword: "",
      confirmPasswordWarningBorder: "grey",
      confirmPasswordWarning: "none",
      checked: false,
      checkedWarning: "none",
      eulaId: "",
      eulaText: "",
      page: "",
      loading: false,
      verificationMail: false,
      appsDisplay: false,
      strength: 30,
      color: "#CC0000",
      label: "Weak",
      userId:"",
      acceptedEula: false,
      eulaWarning:"#004d99"
    };
  }
  openDialog(show) {
    this.setState({ showDialog: show })
  }
  
  componentDidMount() {
    this.mixpanelTrack("Signup View");
    this.refs.loaderRef.show();
    this.eula();
    this.refs.loaderRef.hide();
  }
          /** 
(It gets eula text from dynamoDB)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async eula() {
    var awsData = require("./config/AWSConfig.json");
    var awsLamda = require("./config/AWSLamdaConfig.json");
    var acceestoken=await commons.get_token();
    await fetch('' + awsData.path + awsData.stage + awsLamda.eulaDataMgnt, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization':acceestoken
      },
      body: JSON.stringify({
        "operation": "getEulatext",
        "TableName": "EulaDetails",
        "eulaId": "1"
      }),
    }).then((response) => response.json())
      .then((responseJson) => {
        var result = JSON.parse(responseJson);
        this.state.eulaId = result.Item.eulaId.S;
        this.state.eulaText = result.Item.eulaText.S;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
          /** 
(Mixpanel event function)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async mixpanelTrack(event)
   {
    try{
        var mixpanelToken=awsData.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(mixpanelToken).then(() => {
            Mixpanel.default.track(event);
            });
      }catch(err){
      }
   }
     /** 
(Checks the strength of the password on each text change event from input box)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  getPasswordStrength(password_user_input) {
    var tempPassword = password_user_input;
    var strength = 0;
    var label = "";
    var color = "";
    if (tempPassword == null)
      tempPassword = "";
    var n = tempPassword.length;
    var good_length = false;
    var hasUpper = (/[A-Z]/.test(tempPassword));
    var hasLower = (/[a-z]/.test(tempPassword));
    var hasNumber = (/\d/.test(tempPassword));
    var hasSpecial = (/^[a-zA-Z0-9]*$/.test(tempPassword));
    var strength = 0;
    if (hasUpper)
      strength++;
    if (hasLower)
      strength++;
    if (hasNumber)
      strength++;
    if (!hasSpecial)
      strength++;
    if (n >= 6 && strength>=4 ) {
      strength = 100;
      color = "#2CAE1C";
      label = "STRONG";
    }
    else if (n >= 6 && strength>=3 ) {
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
(Signup functionalities-Checks password validations- Creates new user in db and cognito)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async signupFunction() {
    var errocount = 0;
    if (this.state.firstName == null || this.state.firstName == "") {
      this.setState({
        firstNameWarning: "flex",
        firstNameWarningBorder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        firstNameWarning: "none",
        firstNameWarningBorder: "grey"
      });
    }
    if (this.state.lastName == null || this.state.lastName == "") {
      this.setState({
        lastNameWarning: "flex",
        lastNameWarningBorder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        lastNameWarning: "none",
        lastNameWarningBorder: "grey"
      });
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailStatus = re.test(this.state.email.toLowerCase());
    if (!emailStatus) {
      this.setState({
        emailWarning: "flex",
        emailWarningBorder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        emailWarning: "none",
        emailWarningBorder: "grey"
      });
    }
    //password validation 
    var tempPassword = this.state.password;
    if (tempPassword == null)
      tempPassword = "";
    if (tempPassword.length < 6) {
      errocount++;
      this.setState({
        passwordWarningBorder: "red",
        passwordCharLimitWarning: Strings.signup_page_passrule,
        passwordColorCharLimit: "red",
      })
    }
    else {
      this.setState({
        passwordWarningBorder: "grey",
        passwordCharLimitWarning: Strings.signup_page_passrule,
        passwordColorCharLimit: "#757575",
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
    if(!this.state.acceptedEula)
    {
      this.setState({
        eulaWarning: "red",
      });
      errocount++;
    }
    
    var userData = {};
    userData["firstname"] = this.state.firstname;
    userData["LastName"] = this.state.lastName;
    userData["Email"] = (this.state.email).toLowerCase();
    userData["Password"] = this.state.password;
    
    var awsData = require("./config/AWSConfig.json");
    const awsCognitoSettings = {
      UserPoolId:awsData.UserPoolId,
      ClientId: awsData.ClientId
    };
    if (errocount == 0) {
      this.refs.loaderRef.show();
      const userPool = new CognitoUserPool(awsCognitoSettings);
      // Sign up
      const attributeList = [
        {
          Name: 'custom:first_name',
          Value: this.state.firstName
        },
        { Name: 'custom:last_name', Value: this.state.lastName }
      
      ];
      var attribute = [{
        Name: 'custom:first_name',
        Value: this.state.firstName
      },
      {
        Name: 'custom:last_name',
        Value: this.state.lastName
      },
      {
        Name: 'custom:eula_id',
        Value: this.state.eulaId
      }];
      console.log(attribute);
//''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
      var awsData = require("./config/AWSConfig.json");
      var awsLamda = require("./config/AWSLamdaConfig.json");
      var acceestoken1=await commons.get_token();
      await fetch('' + awsData.path + awsData.stage + awsLamda.accountvalidation, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization':acceestoken1
        },
        body: JSON.stringify({
          "username": ""+(this.state.email).toLowerCase(),
          "from": "app"
        }),
      }).then((response) => response.json())
        .then(async (responseJson) => {
          if(responseJson.status==true)
          {
      //------------------------------------------------------
      //insert into sqllite 
      var createTime = await commons.gettimestamp();
      var dataObj = {};
      dataObj.firstname = this.state.firstName;
      dataObj.lastname = this.state.lastName;
      dataObj.eulaid = this.state.eulaId;
      dataObj.createtime = createTime;
      dataObj.email = (this.state.email).toLowerCase();
      dataObj.accountUniqueID = (this.state.email).toLowerCase();
      dataObj.loginfrom = "app";
      //------------------------------------------------------
      userPool.signUp(
        (this.state.email).toLowerCase(),
        this.state.password,
        attribute,
        null,
        async (err, result) => {
          if (err) {
            alert(err);
            this.refs.loaderRef.hide();
            this.setState({ email: '', password: '' });
            return;
          }
          dataObj.username=result.userSub;
          await this.setState({userId:result.userSub});
        
          var returnData = await databasehelper.insertuser(dataObj);
          var returnData = await databasehelper.insertprofile(dataObj);
          var proObj = {};
          proObj.profileimage = '0';
          proObj.username = dataObj.username;
          proObj.createtime = dataObj.createTime;
          var imagereturnData = databasehelper.insertProfileImage(proObj);
          
          //---------------------------------------------------
          var awsData = require("./config/AWSConfig.json");
          var awsLamda = require("./config/AWSLamdaConfig.json");
         
          var acceestoken=await commons.get_token();
          fetch("" + awsData.path + awsData.stage + awsLamda.newusermgnt, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization':acceestoken
            },
            body: JSON.stringify({
              "operation": "CreateNewUser01",
              "TableName": awsData.usertable,
              "payload": dataObj
            }),
          }).then((response) => response.json())
            .then((responseJson) => {
           
              if (responseJson.status == "SUCCESS") {
                ToastAndroid.show(Strings.signup_toast_success, 500);
                this.setState({ page: '' });
                this.refs.loaderRef.hide();
                this.setState({ verificationMail: true })
               
              }
              else {
                this.refs.loaderRef.hide();
                ToastAndroid.show(JSON.stringify(responseJson), 500);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          //--------------------------------------------------------------
        
        }
      );
      //------------------
        }
        else
        {
          var existingAccount=responseJson.existingAccount;
          if(existingAccount=="app")
          existingAccount="APRROW";
   
          ToastAndroid.show(Strings.login_toast_existing+existingAccount+Strings.login_toast_existing1+existingAccount+Strings.login_toast_existing2, 3000);
          this.refs.loaderRef.hide();
        }
        });
      //------------------
    }
  }
    /** 
(Email send to backend)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async  VerificationMessagePopUp() {
    var userName = await AsyncStorage.getItem("username");
    var deviceId=await AsyncStorage.getItem("currentdeviceid");
    if (userName != null && userName == commons.guestuserkey()) {
      AsyncStorage.setItem("username", this.state.userId);
      var isConnected = await commons.isconnected();
      if (isConnected) {
        var mostUsedWidgetId = await AsyncStorage.getItem("mostusedwidgetid");        
        if(deviceId!=null&&mostUsedWidgetId!=null &&mostUsedWidgetId!=undefined)
        {
                        var smartWidgetId = await commons.getuuid();
                        var smartWidgetName = "Smart Aprrow";
                        var smartMostUsedWidget = 4;
                        var smartApplists = [];
                        
                        var time = commons.gettimestamp();
             
              var result = await databasehelper.insertwidget(smartWidgetId, smartWidgetName, JSON.stringify(smartApplists), time, smartMostUsedWidget, deviceId);
        }
        var result = await commons.syncdatatobackend();
        if (result == "SUCCESS") {
          await commons.SNSNotification();
          await commons.onGoogleSignOut();
          await commons.CognitoLogout();
          await AsyncStorage.clear();
          await commons.stopallservice();
          await databasehelper.AllTableDelete();
          commons.reset(this, "login", {});
          await AsyncStorage.setItem("firstrun", "1");
          try{
          LoginManager.logOut();
          }
          catch(err)
          {}
          const { navigate } = this.props.navigation;
          commons.replaceScreen(this, "login", {});
        }
        else {
          ToastAndroid.show(JSON.stringify(result), 500);
        }
      }
      else {
        ToastAndroid.show(Strings.network_toast_msg1, 500);
      }
    }
   else
   {
    const { navigate } = this.props.navigation;
    commons.replaceScreen(this, "login", {});
   }
  }
      /** 
(Mixpanel track event of signup)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  async UserRegistr(thiss)
  {
    this.mixpanelTrack("User Register");
    this.signupFunction();
  }
    /** 
(To move  next input box on enter press)
@param  :value->input box     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
  _next = (value) => {
    //alert(">>>>>>>>>");
    if(value=='fname')
    this._lname && this._lname.focus();
    if(value=='lname')
    this._email && this._email.focus();
    if(value=='email')
    this._password && this._password.focus();
    if(value=='password')
    this._cpassword && this._cpassword.focus();
    if(value=='cpassword')
    this._check && this._check.focus();
    
    }
  
  render() {
    return (
      < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1, backgroundColor: "white" }}>
        <LoaderNew ref={"loaderRef"} />
        <ScrollView style={{ width: '100%', height: '100%' }}>
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', justifyContent: 'center' }}>
              <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto', marginTop: '8%', marginLeft: 12, color: 'black' }} >{Strings.signup_page_title}</Text>
              <TextInput
                
                placeholder={Strings.signup_page_placeholder_first}
                underlineColorAndroid="transparent"
                style={{ padding: '2%', borderColor: this.state.firstNameWarningBorder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10, borderRadius: 3 }}
                onChangeText={(firstName) => this.setState({ firstName })}
                value={this.state.firstName}
                ref={ref => {this._fname = ref}}
                autoFocus={true}
                keyboardType="default"
                returnKeyType="next"
                autoCapitalize="none"
                onSubmitEditing={()=>this._next("fname")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.firstNameWarning, fontSize: 10,fontFamily:'Roboto', marginTop: 1, marginLeft: 12 }}>{Strings.signup_page_warn}</Text>
              <TextInput
                placeholder={Strings.signup_page_placeholder_last}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.lastNameWarningBorder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10 }}
                onChangeText={(lastName) => this.setState({ lastName })}
                value={this.state.lastName}
                ref={ref => {this._lname = ref}}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={()=>this._next("lname")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.lastNameWarning, fontSize: 10, fontFamily:'Roboto', marginTop: 1, marginLeft: 12 }}>{Strings.signup_page_warn}</Text>
              <View style={{ marginTop: '6%', height: 1, width: '100%', backgroundColor: "#b2babb" }}>
              </View>
              <TextInput
                placeholder={Strings.signup_page_placeholder_email}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.emailWarningBorder, borderWidth: 1, marginTop: 15, marginLeft: 10, marginRight: 10 }}
                onChangeText={(email) => this.setState({ email })}
                value={this.state.email}
                ref={ref => {this._email = ref}}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={()=>this._next("email")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.emailWarning, fontSize: 10,fontFamily:'Roboto', marginTop: 1, marginLeft: 12 }}>{Strings.signup_page_warnemail}</Text>
              <TextInput
                placeholder={Strings.signup_page_placeholder_password}
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                Password={true}
                secureTextEntry={true}
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.passwordWarningBorder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10 }}
                onChangeText={(password) => {
                  this.setState({ password });
                  this.getPasswordStrength(password)
                }}
                value={this.state.password}
                ref={ref => {this._password = ref}}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={()=>this._next("password")}
              />
              <Text allowFontScaling={false} style={{ alignSelf: "flex-end", color: this.state.passwordColorCharLimit, marginTop: 10, marginRight: 10 }}>{this.state.passwordCharLimitWarning}</Text>
              {/*show password strength indicator here*/}
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <View style={{ flexDirection: "row", marginTop: 10, flex: .4 }}>
                  <Image source={assetsConfig.iconPasswordLevelBlue48px} />
                  <Text allowFontScaling={false} style={{ marginLeft: 5, color: "#006BBC", fontSize: 14, fontWeight: "300" }}>{Strings.signup_page_passwordlevel}</Text>
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
              <TextInput
                placeholder={Strings.signup_page_placeholder_cpass}
                Password={true}
                secureTextEntry={true}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.confirmPasswordWarningBorder, borderWidth: 1, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                value={this.state.confirmPassword}
                ref={ref => {this._cpassword = ref}}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={()=>this._next("cpassword")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.confirmPasswordWarning, fontSize: 10, fontFamily:'Roboto', marginTop: 1, marginLeft: 12 }}>{Strings.signup_page_warnpass}</Text>
              <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{marginTop: 20}}>
              <CheckBox
                          onClick={() => {
                              var eualaStatus = this.state.acceptedEula;
                              this.setState({ acceptedEula: !eualaStatus })
                          }}
                          checkedImage={<Image source={assetsConfig.checkboxCheckedIcon} />}
                          unCheckedImage={<Image source={assetsConfig.checkbocUncheckedIcon} />}
                          />
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text allowFontScaling={false} style={{ color:this.state.eulaWarning , marginTop: 20, marginLeft: 10 }}>{Strings.signup_page_eula1}</Text>
                  <TouchableOpacity disabled={this.state.appsDisplay} onPress={async () => {
                    await this.setState({ appsDisplay: true })
                    const { navigate } = this.props.navigation
                    navigate("eula", { screen: 'eula' })
                    setTimeout(() => { this.setState({ appsDisplay: false }) }, 1000);
                  }}>
                    <Text allowFontScaling={false} style={{ color:this.state.eulaWarning , marginTop: 1, marginLeft: 10, textDecorationLine: 'underline' }}>{Strings.signup_page_eula2}</Text>
                    
                  </TouchableOpacity>
                </View>
                
              </View>
             
              <Modal
                isVisible={this.state.verificationMail}
                style={{ flex: 1 }}
                swipeDirection="right"
                animationIn="fadeIn"
                animationOut="fadeOut">
                <View style={{ paddingLeft: 30, paddingBottom: 30, paddingRight: 30, paddingTop: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', width: '100%', flexDirection: "column" }}>
                  <Image style={{ marginTop: 12 }} source={assetsConfig.iconEmailBlue40px} />
                  <Text allowFontScaling={false} style={{ marginTop: 12, textAlign: "center", color: "#0065B2", fontSize: 23, fontWeight: 'bold' }}>{Strings.signup_popemail_head}</Text>
                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>{Strings.signup_popemail_message1}</Text>
                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>{Strings.signup_popemail_message2}</Text>
                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>{Strings.signup_popemail_message3}</Text>
                  <TouchableOpacity onPress={() => this.VerificationMessagePopUp()} style={{ marginTop: 25, height: 45, width: 130, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                    <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500", fontSize: 18 }}>{Strings.signup_popemail_button}</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.checkedWarning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>This information is required</Text>
              <View style={{ marginTop: 20, marginBottom: 20, marginLeft: 10, marginRight: 10, borderRadius: 5 }}>
                <TouchableOpacity onPress={()=>this.UserRegistr(this)}>
                  <View style={{ backgroundColor: "#F16822", borderRadius: 10, alignItems: 'center', padding: 10 }}>
                    <Text allowFontScaling={false} style={{ color: 'white', fontFamily:'Roboto-Bold', fontSize: 18 }}>{Strings.signup_page_button}</Text>
                    
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView >
      </ KeyboardAvoidingView>
    );
  }
}
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  buttonStyle: {
    color: 'red',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'green'
  }, content: {
    marginBottom: 20,
  }
});
