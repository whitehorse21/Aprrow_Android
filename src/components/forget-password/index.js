import React, { Component } from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import { Dialog } from 'react-native-simple-dialogs';
import { styles } from '../../login/index.style';
import commons from '../../commons';

class ForgetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pwdHelpMsg: false,
      showDialog: props.showDialog
    };
  }

  render() {
    return (
      <Dialog visible={this.state.showDialog}
        onTouchOutside={() => this.openDialog(false)}
        contentStyle={{ justifyContent: 'center', alignItems: 'center', }}
        animationType="fade">
        <View style={{ height: 300, width: '90%' }}>
          <View style={{ marginTop: 15, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Text allowFontScaling={false} style={{ color: this.props.headColor, fontFamily: 'Roboto-Bold', fontSize: 28, textAlign: 'left', alignSelf: 'center' }}>Password Help</Text>
            <Text allowFontScaling={false} style={{ color: this.props.bodyColor, fontSize: 15, marginTop: 22 }}>{this.props.password_help_email}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Text allowFontScaling={false} style={{ color: '#FF0000', textAlign: 'left' }}>*</Text>
            <Text allowFontScaling={false} style={{ color: this.props.headColor, textAlign: 'left', fontFamily: 'Roboto-Bold' }}>Email address</Text>
          </View>
          <View style={styles.dialog_container}>
            <View style={[styles.dialog_SectionStyle, { borderColor: this.props.headColor }]}>
              {commons.renderIf(this.props.pwdImage,
                <Image source={require('../../assets/ic_email_small.png')} style={styles.dialog_ImageStyle} />
              )}
              {commons.renderIf(!this.props.pwdImage,
                <Image source={require('../../assets/icon_email_error_20px.png')} style={styles.dialog_ImageStyle} />
              )}

              <TextInput allowFontScaling={false}
                style={{ flex: 1, borderColor: this.props.Email_warningborder }}
                autoCapitalize="none"
                onChangeText={(username) => this.setState({ username })}
                underlineColorAndroid="transparent"
                value={this.props.username}
              />

            </View>
            <TouchableOpacity style={{ marginTop: 20, marginRight: 10, height: 45, width: '65%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.pass()}>
              <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>{this.props.buttonText}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text allowFontScaling={false} onPress={() => this.openDialog(false)} style={{ textAlign: 'left', color: '#2554C7' }}>Back to Sign in</Text>
          </View>
        </View>
      </Dialog>
    );
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


  async pass() {
    var params = {
      ClientId: commons.AWSConfig.ClientId,/* required */
      Username: (this.state.username).toLowerCase(), /* required */
    };
    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
    var _this = this;
    cognitoidentityserviceprovider.forgotPassword(params, function (err) {
      if (err) {
        _this.setState({
          pwdImage: false,
          headColor: "red",
          bodyColor: "red",
          buttonText: "Try Again",
          password_help_email: "This email does not exist.\n\t Enter another email"
        });
      }
      else {
        _this.setState({ pwdHelpMsg: true, showDialog: false });
      }
    });
  }
}

export default ForgetPassword;