import React from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'react-native-aws-cognito-js';
import Slider from "react-native-slider";
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var aws_data11 = require("./config/AWSConfig.json");
var Mixpanel = require('react-native-mixpanel');
const awsCognitoSettings = {
  UserPoolId:aws_data11.UserPoolId,
  ClientId: aws_data11.ClientId
};
import {Linking, CheckBox, StyleSheet,TouchableOpacity, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AsyncStorage} from 'react-native';
export default class signup extends React.Component { 
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let title=Strings.passwordreset_page_head;
    let headerStyle= { backgroundColor: '#006BBD',};
    let headerTitleStyle= { color: 'white',fontFamily: 'Roboto-Bold',fontWeight:'200' };
    let headerTintColor= 'white'; 
    let headerTitleAllowFontScaling=false;
    let headerRight = (
       <View style={{width:1}}>
    </View> 
    );
    return { title,headerStyle,headerTitleStyle,headerTintColor,headerTitleAllowFontScaling };
  };
/** 
(Navigate to the widgetrecievebeta or userypeselector or login)
@param  :url     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/   
  async openLink(url)
  {  
         const { navigate } = this.props.navigation;
         var username = await AsyncStorage.getItem("username");
         var isfirstrun=await AsyncStorage.getItem("firstrun");
         setTimeout(() => {
           if (username != null) {
             var urldata = "";
             if(url!=null)
             if (url.url != null&&username!=commons.guestuserkey()) {
               urldata = (url.url).split("#");
               commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
             }
             else {
             }
           }
           else {
             if(isfirstrun==null)
              commons.replaceScreen(this, 'userypeselector', {});
             else
              commons.replaceScreen(this, 'login', {});
           }
         }, 2000);      
  }
  
  async openLink1(url)
  {
  }
    async  componentDidMount() {
      this.mixpanelTrack("Change Email / Password View");
      Linking.getInitialURL().then(async (url) => {
        if(url)
        this.openLink(url);
        else Linking.addEventListener('url', this.openLink1);
      }); 
    this.props.navigation.setParams({ handleSave: this._handleSave });
    var email=await AsyncStorage.getItem("email");    
    this.setState({Email:email})
  }
  async componentWillUnmount()
  {
    Linking.removeEventListener('url', this.openLink1);
  }
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      Email: "",
      Email_warningborder: "grey",
      Email_warning: "none",
      CurrentPassword: "",
      CurrentPassword_warningborder: "grey",
      CurrentPassword_warning: "none",
      Password: "",
      Password_warningborder: "grey",
      password_color_charlimit: "#757575",
      password_color_uppercase: "#004d99",
      password_color_lowercase: "#004d99",
      password_color_number: "#004d99",
      password_color_Specialcharachters: "#004d99",
      password_char_limitwarning: Strings.passwordreset_page_6leter,
      password_uppercase_warning: "- uppercase",
      password_lowercase_warning: "- lowercase",
      password_number_warning: "- Number",
      password_Specialcharachters_warning: "- special characters",
      ConfirmPassword: "",
      ConfirmPassword_warningborder: "grey",
      ConfirmPassword_warning: "none",
      checked: false,
      checked_warning: "none",
      eula_id:"",
      eula_text:""
    };
    navigation = this.props.navigation;
    this.resetPassword=this.resetPassword.bind(this)
    this.openLink=this.openLink.bind(this);
    this.openLink1=this.openLink1.bind(this);
  }
/** 
(Check the validations)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/    
  _handleSave = () => {  
            var errocount = 0;
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
    var hasupper = (/[A-Z]/.test(temp_password));
    if (!hasupper) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_uppercase_warning: "x uppercase",
        password_color_uppercase: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_uppercase_warning: "? uppercase",
        password_color_uppercase: "green",
      })
    }
    var haslower = (/[a-z]/.test(temp_password));
    if (!haslower) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_lowercase_warning: "x lowercase",
        password_color_lowercase: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_lowercase_warning: "? lowercase",
        password_color_lowercase: "green",
      })
    }
    var hasnumber = (/\d/.test(temp_password));
    if (!hasnumber) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_number_warning: "x Number",
        password_color_number: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_number_warning: "? Number",
        password_color_number: "green",
      })
    }
    var hasspecial = (/^[a-zA-Z0-9]*$/.test(temp_password));
    if (temp_password == null || temp_password == "" || hasspecial) {
      errocount++;
      this.setState({
        Password_warningborder: "red",
        password_Specialcharachters_warning: "x special characters",
        password_color_Specialcharachters: "red",
      })
    }
    else {
      this.setState({
        Password_warningborder: "grey",
        password_Specialcharachters_warning: "? special characters",
        password_color_Specialcharachters: "green",
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
     //Current  password null  validations
     if (this.state.CurrentPassword == null || this.state.CurrentPassword == "" ) {
      errocount++;
      this.setState({
        CurrentPassword_warning: "flex",
        CurrentPassword_warningborder: "red"
      });
      errocount++;
    }
    else {
      this.setState({
        CurrentPassword_warning: "none",
        CurrentPassword_warningborder: "grey"
      });
    }
    var userdata = {};
    userdata["Email"] = this.state.Email;
    userdata["Password"] = this.state.Password;
    if (errocount == 0) {
    this.resetPassword();
    this.mixpanelTrack("Email / Password Updated"); 
              }
  }

/** 
(Reset the password according with cognito user pool)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/    
  async resetPassword(){
    var newPassword=this.state.Password;
    var oldPassword=this.state.CurrentPassword;
    //var username=await AsyncStorage.getItem("username");
    var username=await AsyncStorage.getItem("email");    
    const userPool = new CognitoUserPool(
      awsCognitoSettings
    );
    const cognitoUser = new CognitoUser({
      Username: username.toLowerCase(),
      Pool: userPool
    }); 
    const authDetails = new AuthenticationDetails({
      Username: username.toLowerCase(),
      Password: oldPassword
  });
  cognitoUser.authenticateUser(authDetails, {
    onSuccess:  (result) => {
      cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {     
        if (err) 
        {
          ToastAndroid.show(result,3000);
        }
        if(result=='SUCCESS')
       { 
         ToastAndroid.show(Strings.passwordreset_toast_success,3000);
         navigation.goBack();
       }
        else 
        {
          ToastAndroid.show(result,3000); 
        }
    });
    },
    onFailure: function(err) {
      ToastAndroid.show(Strings.passwordreset_toast_error,3000);
  }
});   
  }
/** 
(Trigger the track event of mixpanel)
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
(Login through Facebook)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/    
Get_password_strength(password_user_input)
{
  var temp_password = password_user_input;
  var strength=0;
  var label="";
  var color="";
  if (temp_password == null)
      temp_password = "";
    var n=temp_password.length;
    var haslower=false;
    var hasupper=false;
    var good_length=false;
    var has_special=false;
    var hasnumber=false;
    var hasupper = (/[A-Z]/.test(temp_password));
    var haslower = (/[a-z]/.test(temp_password));
    var hasnumber = (/\d/.test(temp_password));
    var has_special = (/^[a-zA-Z0-9]*$/.test(temp_password));
   if(n>=8&&hasupper&&haslower&&hasnumber&&!has_special)
   {
    strength=100;
    color="#2CAE1C";
    label="STRONG";
   }
   else if(n>=6&&hasupper&&haslower&&hasnumber&&!has_special)
  {
    strength=60;
    color="#0065B2";
    label="Good"; 
  }
  else
  {
    strength=30;
    color="#CC0000";
    label="Weak";
  }

this.setState({strength:strength,
  color:color,
  label:label});
}
  render() {
    return (
     < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1 ,backgroundColor:"white" }}>
     <ScrollView style={{flex:1}}>
     <View style={{width:"85%",height:600,alignSelf:'center', backgroundColor: "white"}}>
     <Text allowFontScaling={false} style={styles.headStyle}>{Strings.passwordreset_page_email}</Text>
        <TextInput
         // placeholder="Email"
          allowFontScaling={false}
          underlineColorAndroid="transparent"
          style={[styles.textInputStyle, {borderColor: this.state.Email_warningborder,color:'#000000'}]}
          onChangeText={(Email) => this.setState({ Email })}
          editable={false}
          value={this.state.Email}
        />
        <Text allowFontScaling={false} style= {[styles.warningText,{display: this.state.Email_warning}]}>{Strings.passwordreset_page_emailwarn}</Text>
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.passwordreset_page_cpassword}</Text>
        <TextInput
          //placeholder="Current Password"
          allowFontScaling={false}
          Password={true}
          secureTextEntry={true}
          underlineColorAndroid="transparent"
          style={[styles.textInputStyle, {borderColor: this.state.CurrentPassword_warningborder}]}
          onChangeText={(CurrentPassword) => this.setState({ CurrentPassword })} 
          value={this.state.CurrentPassword}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.CurrentPassword_warning}]}>{Strings.passwordreset_page_cpasswarn}</Text>
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.passwordreset_page_npassword}</Text>
        <TextInput
         // placeholder="Password"
         allowFontScaling={false}
          underlineColorAndroid="transparent"
          Password={true}
          secureTextEntry={true}
          style={[styles.textInputStyle, {borderColor: this.state.Password_warningborder}]}
          onChangeText={(Password) =>{ 
            this.setState({ Password });
            this.Get_password_strength(Password)
          }}
          value={this.state.Password}
        />
<Text allowFontScaling={false} style={{alignSelf:"flex-end", color: this.state.password_color_charlimit, marginTop: 15,marginRight: 10  }}>{this.state.password_char_limitwarning}</Text>
       {/*show password strength indicator here*/}
      <View style={{width:"100%",alignItems:"baseline",justifyContent:"center",flexDirection:"row"}}> 
       <View style={{width:"8%",height:"8%"}}>
       <Image source={assetsConfig.iconPasswordLevelBlue48px}/>
       </View>
       <View style={{width:"32%"}}>
       <Text allowFontScaling={false} style={{color:"#006BBC",fontSize:12,fontWeight:"300",}} numberOfLines={1}>{Strings.passwordreset_page_passlevel}</Text>
       </View>
        <View style={{width:"50%"}} >
         <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={this.state.strength}
            disabled={true}
            trackStyle={customStyles6.track}
            thumbStyle={customStyles6.thumb}
            minimumTrackTintColor={this.state.color}/>                             
       <Text allowFontScaling={false} style={{alignSelf:"center",marginTop:"-5%",color:this.state.color}}>{this.state.label}</Text>
       </View>
      </View>
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.passwordreset_page_cnpass}</Text>
        <TextInput
         // placeholder="Confirm Password"
          allowFontScaling={false}
          Password={true}
          secureTextEntry={true}
          underlineColorAndroid="transparent"
          style={[styles.textInputStyle, {borderColor: this.state.ConfirmPassword_warningborder}]}
          onChangeText={(ConfirmPassword) => this.setState({ ConfirmPassword })}
          value={this.state.ConfirmPassword}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.ConfirmPassword_warning}]}>{Strings.passwordreset_page_passwarn}</Text>       
        <Text allowFontScaling={false} style={{ color: "red", display: this.state.checked_warning, fontSize: 10, fontWeight: 'bold', marginTop: 1, marginLeft: 12 }}>{Strings.passwordreset_page_passwarnalert}</Text>    
       </View>
      </ScrollView >
      <TouchableOpacity  onPress={()=>this._handleSave()} style={[{backgroundColor: '#fff',alignItems: 'center',justifyContent: 'center'},{ height:'9%',borderWidth: 0,marginTop: 4,borderRadius: 0 ,
          borderColor:'white',backgroundColor:"#2699FB"},{display:'flex'}]}>        
            <Text allowFontScaling={false} style={{color: "white"}}>{Strings.passwordreset_page_button}</Text>
      </TouchableOpacity>
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
    width:"80%",
    alignItems:"center",
    backgroundColor: "white"
  },
  buttonStyle: {
    color: 'red',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'green'
  },
  content: {
    marginBottom:20,
    },
  textInputStyle:{
    padding: 5,
    borderRadius: 3,
    height: 40,  
    borderWidth: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10 
  },
  warningText:
  { 
   color: "red",
   fontSize: 10,
   fontFamily: 'Roboto-Bold',
   marginTop: 4,
   marginLeft: 12
  } ,
  headStyle:{
    color: "dodgerblue",
    fontSize: 12, 
    fontFamily: 'Roboto-Bold',
    marginTop: 29,
    marginLeft: 10
   }, 
});