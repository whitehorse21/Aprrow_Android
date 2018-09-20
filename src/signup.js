import React from 'react';
import { CognitoUserPool } from 'react-native-aws-cognito-js';
import { AsyncStorage } from 'react-native';
import databasehelper from './utils/databasehelper.js';
import LoaderNew from './utils/LoaderNew';
import { StyleSheet, Text, View, TextInput, ScrollView, ToastAndroid, Image, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import Slider from "react-native-slider";
import Modal from 'react-native-modal';
import commons from './commons.js';
import CheckBox from 'react-native-check-box';

export default class signup extends React.Component {

  static navigationOptions = ({ navigation }) => {
    let title = 'Sign up';
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
      FirstName_warningborder: "grey",
      FirstName: "",
      FirstName_warning: "none",

      LastName: "",
      LastName_warningborder: "grey",
      LastName_warning: "none",

      Email: "",
      Email_warningborder: "grey",
      Email_warning: "none",

      Password: "",
      Password_warningborder: "grey",
      password_color_charlimit: "#757575",
      password_color_uppercase: "#004d99",
      password_color_lowercase: "#004d99",
      password_color_number: "#004d99",
      password_color_Specialcharachters: "#004d99",

      password_char_limitwarning: " Use at least 6 characters",
      password_uppercase_warning: "- Upper case",
      password_lowercase_warning: "- Lower case",
      password_number_warning: "- Number",
      password_Specialcharachters_warning: "- Special Character",
      ConfirmPassword: "",
      ConfirmPassword_warningborder: "grey",
      ConfirmPassword_warning: "none",


      checked: false,
      checked_warning: "none",
      eula_id: "",
      eula_text: "",
      page: "",
      loading: false,
      VerificationMail: false,
      appsdisplay: false,

      strength: 30,
      color: "#CC0000",
      label: "Weak",

      userid: "",
      acceptedeula: false,
      eula_warning: "#004d99"
    };
    // this.eula.bind(this);

  }

  openDialog(show) {

    this.setState({ showDialog: show })
  }

  componentDidMount() {
    this.refs.loaderRef.show();
    this.eula();
    this.refs.loaderRef.hide();

  }


  async eula() {
    var aws_data = require("./config/AWSConfig.json");
    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'eulaDataMgnt', {
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
        //alert(this.state.eula_text)
        //  this.props.Text.value = result.Item.eulaText.S;

      })
      .catch((error) => {
        console.error(error);
      });
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



    //alert(hasupper+">>>"+haslower+">>>>"+hasnumber+">>>>"+has_special);
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

      //alert("weak");

    }

    this.setState({
      strength: strength,
      color: color,
      label: label
    });

  }


  async singup() {

    var errocount = 0;

    if (this.state.FirstName == null || this.state.FirstName == "") {
      this.setState({
        FirstName_warning: "flex",
        FirstName_warningborder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        FirstName_warning: "none",
        FirstName_warningborder: "grey"
      });
    }



    if (this.state.LastName == null || this.state.LastName == "") {
      this.setState({
        LastName_warning: "flex",
        LastName_warningborder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        LastName_warning: "none",
        LastName_warningborder: "grey"
      });
    }


    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var emailstatus = re.test(this.state.Email.toLowerCase());

    if (!emailstatus) {
      this.setState({
        Email_warning: "flex",
        Email_warningborder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        Email_warning: "none",
        Email_warningborder: "grey"
      });
    }

    //password validation 
    var temp_password = this.state.Password;
    if (temp_password == null)
      temp_password = "";

    if (temp_password.length < 6) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_char_limitwarning: "Use at least 6 characters",
        password_color_charlimit: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_char_limitwarning: "Use at least 6 characters",
        password_color_charlimit: "#757575",
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
    if (!this.state.acceptedeula) {
      this.setState({
        eula_warning: "red",
      });
      errocount++;
    }
    var userdata = {};
    userdata["firstname"] = this.state.firstname;
    userdata["LastName"] = this.state.LastName;
    userdata["Email"] = (this.state.Email).toLowerCase();
    userdata["Password"] = this.state.Password;

    var aws_data11 = require("./config/AWSConfig.json");
    const awsCognitoSettings = {
      UserPoolId: aws_data11.UserPoolId,
      ClientId: aws_data11.ClientId
    };

    if (errocount == 0) {
      this.refs.loaderRef.show();
      const userPool = new CognitoUserPool(awsCognitoSettings);

      var attribute = [{
        Name: 'custom:first_name',
        Value: this.state.FirstName
      },
      {
        Name: 'custom:last_name',
        Value: this.state.LastName
      },
      // { Name:'custom:eula_text',Value:this.state.eula_text },
      {
        Name: 'custom:eula_id',
        Value: this.state.eula_id
      }];
      console.log(attribute);
      //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
      var aws_data = require("./config/AWSConfig.json");
      var acceestoken1 = await commons.get_token();
      await fetch('' + aws_data.path + aws_data.stage + 'accountvalidation', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': acceestoken1
        },
        body: JSON.stringify({
          "username": "" + (this.state.Email).toLowerCase(),
          "from": "app"
        }),
      }).then((response) => response.json())
        .then(async (responseJson) => {
          if (responseJson.status == true) {

            var createtime = await commons.gettimestamp();

            var dataObj = {};
            dataObj.firstname = this.state.FirstName;
            dataObj.lastname = this.state.LastName;
            //dataObj.username = (this.state.Email).toLowerCase();
            dataObj.eulaid = this.state.eula_id;
            dataObj.createtime = createtime;
            dataObj.email = (this.state.Email).toLowerCase();
            dataObj.accountUniqueID = (this.state.Email).toLowerCase();
            dataObj.loginfrom = "app";

            userPool.signUp(
              (this.state.Email).toLowerCase(),
              this.state.Password,
              attribute,
              null,
              async (err, result) => {
                // alert(JSON.stringify(result));
                if (err) {
                  alert(err);
                  this.refs.loaderRef.hide();
                  this.setState({ Email: '', Password: '' });
                  return;
                }
                dataObj.username = result.userSub;

                await this.setState({ userid: result.userSub });

                var proObj = {};
                proObj.profileimage = '0';
                proObj.username = dataObj.username;
                proObj.createtime = dataObj.createtime;

                //---------------------------------------------------
                var aws_data = require("./config/AWSConfig.json");

                var acceestoken = await commons.get_token();
                fetch("" + aws_data.path + aws_data.stage + "newusermgnt", {
                  method: 'POST',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': acceestoken
                  },
                  body: JSON.stringify({
                    "operation": "CreateNewUser01",
                    "TableName": aws_data.usertable,
                    "payload": dataObj
                  }),
                }).then((response) => response.json())
                  .then((responseJson) => {


                    if (responseJson.status == "SUCCESS") {
                      ToastAndroid.show('Sign Up Successful.  Check your Email for a verification', 500);
                      this.setState({ page: '' });
                      this.refs.loaderRef.hide();
                      this.setState({ VerificationMail: true })

                    }
                    else {
                      this.refs.loaderRef.hide();
                      ToastAndroid.show(JSON.stringify(responseJson), 500);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            );
            //------------------
          }
          else {
            var existingAccount = responseJson.existingAccount;
            if (existingAccount == "app")
              existingAccount = "APRROW";

            ToastAndroid.show("This account is already linked with " + existingAccount + ". Please use " + existingAccount + " sign-in", 3000);
            // ToastAndroid.show("This account is already linked with google. Please use google sign-in", 3000);
            this.refs.loaderRef.hide();
          }
        });
      //------------------

    }
  }

  async  VerificationMessagePopUp() {

    var username = await AsyncStorage.getItem("username");
    var device_id = await AsyncStorage.getItem("currentdeviceid");
    if (username != null && username == commons.guestuserkey()) {
      AsyncStorage.setItem("username", this.state.userid);
      var isconnected = await commons.isconnected();
      if (isconnected) {

        var mostusedwidgetid = await AsyncStorage.getItem("mostusedwidgetid");
        //alert("mostusedwidgetid=====>>"+mostusedwidgetid);
        if (device_id != null && mostusedwidgetid != null && mostusedwidgetid != undefined) {
          var smart_widget_id = await commons.getuuid();
          var smart_widget_name = "Smart Aprrow";
          var smart_mostusedwidget = 4;
          var smart_applists = [];

          var time = commons.gettimestamp();



          var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, device_id);
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

          try {
            LoginManager.logOut();
          }
          catch (err) { }
          commons.replaceScreen(this, "login", {});
        }
        else {
          ToastAndroid.show(JSON.stringify(result), 500);
        }
      }
      else {
        ToastAndroid.show("No network available.", 500);
      }

    }
    else {
      commons.replaceScreen(this, "login", {});
    }


  }
  _next = (value) => {
    //alert(">>>>>>>>>");
    if (value == 'fname')
      this._lname && this._lname.focus();
    if (value == 'lname')
      this._email && this._email.focus();
    if (value == 'email')
      this._password && this._password.focus();
    if (value == 'password')
      this._cpassword && this._cpassword.focus();
    if (value == 'cpassword')
      this._check && this._check.focus();

  }
  _submit = () => {
    //this.login();
  };

  render() {

    return (
      < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1, backgroundColor: "white" }}>
        <LoaderNew ref={"loaderRef"} />
        <ScrollView style={{ width: '100%', height: '100%' }}>
          <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '90%', justifyContent: 'center' }}>
              <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto', marginTop: '8%', marginLeft: 12, color: 'black' }} >Create an account</Text>

              <TextInput

                placeholder="First Name"
                underlineColorAndroid="transparent"
                style={{ padding: '2%', borderColor: this.state.FirstName_warningborder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10, borderRadius: 3 }}
                onChangeText={(FirstName) => this.setState({ FirstName })}
                value={this.state.FirstName}
                ref={ref => { this._fname = ref }}
                autoFocus={true}
                keyboardType="default"
                returnKeyType="next"
                autoCapitalize="none"
                onSubmitEditing={() => this._next("fname")}

              />

              <Text allowFontScaling={false} style={{ color: "red", display: this.state.FirstName_warning, fontSize: 10, fontFamily: 'Roboto', marginTop: 1, marginLeft: 12 }}>This information is required</Text>


              <TextInput
                placeholder="Last Name"
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.LastName_warningborder, borderWidth: 1, marginTop: 10, marginLeft: 10, marginRight: 10 }}
                onChangeText={(LastName) => this.setState({ LastName })}
                value={this.state.LastName}
                ref={ref => { this._lname = ref }}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => this._next("lname")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.LastName_warning, fontSize: 10, fontFamily: 'Roboto', marginTop: 1, marginLeft: 12 }}>This information is required</Text>

              <View style={{ marginTop: '6%', height: 1, width: '100%', backgroundColor: "#b2babb" }}>

              </View>

              <TextInput
                placeholder="Email"
                underlineColorAndroid="transparent"
                autoCapitalize="none"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.Email_warningborder, borderWidth: 1, marginTop: 15, marginLeft: 10, marginRight: 10 }}
                onChangeText={(Email) => this.setState({ Email })}
                value={this.state.Email}
                ref={ref => { this._email = ref }}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => this._next("email")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.Email_warning, fontSize: 10, fontFamily: 'Roboto', marginTop: 1, marginLeft: 12 }}>Enter a valid email</Text>

              <TextInput
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
                ref={ref => { this._password = ref }}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => this._next("password")}
              />


              <Text allowFontScaling={false} style={{ alignSelf: "flex-end", color: this.state.password_color_charlimit, marginTop: 10, marginRight: 10 }}>{this.state.password_char_limitwarning}</Text>

              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>

                <View style={{ flexDirection: "row", marginTop: 10, flex: .4 }}>
                  <Image source={require("./assets/icon_password_level_blue_48px.png")} />
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

              <TextInput
                placeholder="Confirm Password"
                Password={true}
                secureTextEntry={true}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                style={{ padding: '2%', borderRadius: 3, borderColor: this.state.ConfirmPassword_warningborder, borderWidth: 1, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                onChangeText={(ConfirmPassword) => this.setState({ ConfirmPassword })}
                value={this.state.ConfirmPassword}
                ref={ref => { this._cpassword = ref }}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => this._next("cpassword")}
              />
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.ConfirmPassword_warning, fontSize: 10, fontFamily: 'Roboto', marginTop: 1, marginLeft: 12 }}>the specified passwords do not match</Text>

              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ marginTop: 20 }}>
                  <CheckBox
                    onClick={() => {
                      var eualastatus = this.state.acceptedeula;
                      this.setState({ acceptedeula: !eualastatus })
                    }}

                    checkedImage={<Image source={require("./assets/icon_checkbox_on_lightblue_24px.png")} />}
                    unCheckedImage={<Image source={require("./assets/icon_checkbox_off_grey_24px.png")} />}
                  />
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <Text allowFontScaling={false} style={{ color: this.state.eula_warning, marginTop: 20, marginLeft: 10 }}>I confirm that i have read and agree to the</Text>
                  <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () => {
                    await this.setState({ appsdisplay: true })
                    const { navigate } = this.props.navigation
                    navigate("eula", { screen: 'eula' })
                    setTimeout(() => { this.setState({ appsdisplay: false }) }, 1000);
                  }}>
                    <Text allowFontScaling={false} style={{ color: this.state.eula_warning, marginTop: 1, marginLeft: 10, textDecorationLine: 'underline' }}>end user license agreement</Text>

                  </TouchableOpacity>
                </View>

              </View>


              <Dialog
                visible={this.state.showDialog}
                style={{ width: '100%', height: '100%' }}
                onTouchOutside={() => this.openDialog(false)}
                contentStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#006BBD' }}
                animationType="fade">
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10 }}>
                  <Image source={require('./assets/logo_mobileux.png')} style={{ marginTop: 10, marginLeft: 30 }} />


                  <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center', color: 'black' }} >MOBILEUX TECHNOLOGIES</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2, marginBottom: 10, textAlign: 'left', color: 'black' }} >END USER LICENCE AGREEMENT</Text>
                  <ScrollView  >
                    <Text allowFontScaling={false} style={{ fontSize: 10, marginTop: 5, marginBottom: 10, marginRight: '2%', marginLeft: '2%', textAlign: 'justify', fontSize: 13, fontWeight: '300' }}>{this.state.eula_text}</Text>


                  </ScrollView>
                  <TouchableOpacity onPress={() => this.openDialog(false)} style={{ backgroundColor: '#006BBD', padding: '4%', marginTop: '3%', marginBottom: '2%' }}>
                    <Text allowFontScaling={false} style={{ color: 'white', fontWeight: '500' }}>CLOSE</Text>
                  </TouchableOpacity>
                  {/* <Button onPress={() => this.openDialog(false)} style={{ marginTop: 10 }} title="CLOSE" /> */}
                </View>
              </Dialog>
              <Modal
                isVisible={this.state.VerificationMail}
                style={{ flex: 1 }}
                swipeDirection="right"
                animationIn="fadeIn"
                animationOut="fadeOut">

                <View style={{ paddingLeft: 30, paddingBottom: 30, paddingRight: 30, paddingTop: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', width: '100%', flexDirection: "column" }}>

                  <Image style={{ marginTop: 12 }} source={require('./assets/icon_email_blue_40px.png')} />
                  <Text allowFontScaling={false} style={{ marginTop: 12, textAlign: "center", color: "#0065B2", fontSize: 23, fontWeight: 'bold' }}>Email verification</Text>

                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>Thank you for creating your APRROW account and welcome to our community!</Text>
                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>We want to be sure that we have the email that you’d like us to use, so check your Inbox and verify your email.</Text>
                  <Text allowFontScaling={false} style={{ marginTop: 15, textAlign: "center", color: '#757575', fontSize: 18, fontWeight: '300' }}>Please note that our email might be on your Junk Box.</Text>

                  <TouchableOpacity onPress={() => this.VerificationMessagePopUp()} style={{ marginTop: 25, height: 45, width: 130, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                    <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500", fontSize: 18 }}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
              <Text allowFontScaling={false} style={{ color: "red", display: this.state.checked_warning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>This information is required</Text>

              <View style={{ marginTop: 20, marginBottom: 20, marginLeft: 10, marginRight: 10, borderRadius: 5 }}>
                <TouchableOpacity onPress={this.singup.bind(this)}>
                  <View style={{ backgroundColor: "#F16822", borderRadius: 10, alignItems: 'center', padding: 10 }}>
                    <Text allowFontScaling={false} style={{ color: 'white', fontFamily: 'Roboto-Bold', fontSize: 18 }}>Login</Text>
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


