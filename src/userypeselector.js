import React, { Component } from 'react';
import {AsyncStorage, BackHandler, WebView, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image, KeyboardAvoidingView, AppRegistry, ToolbarAndroid, SectionList, TouchableOpacity } from 'react-native';
import commons from './commons';
import CheckBox from 'react-native-check-box';
import databasehelper from './utils/databasehelper.js';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");
export default class usertypeselector extends Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props);
        this.state = {
            acceptedEula: false,
            error: 'none'
        };
    }
     /** 
(Mixpanel Track Event)
@param  :event     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :
*/
 async mixpanelTrack(event)
  {
     try{
         var mixPanelToken=aws_data11.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(mixPanelToken).then(() => {
             Mixpanel.default.track(event);
             });
       }catch(err){
       }
   }
    async componentDidMount() {
        this.mixpanelTrack("Welcome View");    
    }    
    render() {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: "5%" }}>
                    <Image source={assetsConfig.userTypeSelectorLogo} />
                </View>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 22, color: "#F16822", fontFamily:'Roboto' }}>{Strings.userypeselector_head}</Text>
                </View>
                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>{Strings.userypeselector_title1}</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>{Strings.userypeselector_title2}</Text>
                </View>
                <View style={{ flexDirection: "column", marginTop: "2%", marginLeft: "5%" }}>
                    <View style={{ flexDirection: "row", marginTop: "1%", width: "80%" }}>
                        <Image style={{ alignSelf: "center" }} source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>{Strings.userypeselector_title3}</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image style={{ alignSelf: "center" }} source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%", marginTop: "3%" }} numberOfLines={2}>{Strings.userypeselector_title4}</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>{Strings.userypeselector_title5}</Text>
                    </View>
                </View>
                <View style={{ width: '100%', marginTop: "2%", alignItems: "center", justifyContent: "center" }}>
                    <Image source={assetsConfig.lineGray} />
                </View>
                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontS caling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>{Strings.userypeselector_title6}</Text>
                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>{Strings.userypeselector_title7}</Text>
                </View>
                <View style={{ flexDirection: "column", marginTop: "2%", marginLeft: "5%" }}>
                    <View style={{ flexDirection: "row", marginTop: "1%", width: "80%" }}>
                        <Image style={{ alignSelf: "center" }} source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={1}>{Strings.userypeselector_title8}</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image style={{ alignSelf: "center" }} source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>{Strings.userypeselector_title9}</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>{Strings.userypeselector_title10}</Text>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={assetsConfig.aprrowMarker} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>{Strings.userypeselector_title11}</Text>
                    </View>
                </View>


                <View style={{ flex: 1, flexDirection: 'row', marginTop: "2%", alignItems: "center", justifyContent: "center" }}>
                    <CheckBox
                        onClick={() => {
                            var eualaStatus = this.state.acceptedEula;
                            this.setState({ acceptedEula: !eualaStatus })//eula check/uncheck
                        }}
                        checkedImage={<Image source={assetsConfig.checkboxCheckedIcon} />}
                        unCheckedImage={<Image source={assetsConfig.checkbocUncheckedIcon} />}
                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text allowFontScaling={false} style={{ color: "#0065B2", marginTop: 20, marginLeft: 10 }} numberOfLines={2}>{Strings.userypeselector_agree1}</Text>
                        <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () => {
                            await this.setState({ appsdisplay: true })
                            const { navigate } = this.props.navigation
                            navigate("eula", { screen: 'eula' })
                            setTimeout(() => { this.setState({ appsdisplay: false }) }, 1000);
                        }}>
                            <Text allowFontScaling={false} style={{ color: "#0065B2", marginTop: 1, marginLeft: 10, textDecorationLine: 'underline', textDecorationColor: "#0065B2", fontFamily:'Roboto-Bold' }}>{Strings.userypeselector_EULA}</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ display: this.state.error, color: "red", marginTop: 1, marginLeft: 10 }}>{Strings.userypeselector_Required}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "5%", marginBottom: "10%" }}>
                    <TouchableOpacity onPress={async() => {     
                        this.mixpanelTrack("Not Login Welcome View");  // mix Panel->Event-> Guest event
                        var eulaStatus = this.state.acceptedEula;
                        if (!eulaStatus) {
                            this.setState({ error: 'flex' })
                        }
                        else {
                            this.setState({ error: 'none' })
                            /////////intialise testuser and go to bottom menu//////////////
                            await  AsyncStorage.setItem("username", commons.guestuserkey());              
                            var userData = {};
                            userData["firstname"] = "guest";
                            userData["lastname"] = "user";
                            userData["username"] = commons.guestuserkey();
                            userData["eulaid"] = "0";
                            userData["loginfrom"] = "guest";
                            userData["email"] = "test";
                            userData["createtime"] = "0";
                            await databasehelper.insertuser(userData);
                            var profileData={};
                            profileData.createtime="0";
                            profileData.username=commons.guestuserkey();
                            profileData.firstname="guest";
                            profileData.lastname="user";      
                            await databasehelper.insertprofile(profileData);
                            var proObj = {};
                            proObj["profileimage"] = '0';
                            proObj.username = commons.guestuserkey();
                            proObj.createtime ="0";
                            var imagereturnData = databasehelper.insertProfileImage(proObj);
                            commons.replaceScreen(this, 'bottom_menu', {});
                        }
                    }}
                        style={{ marginRight: 10, height: 45, width: 150, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white",  fontSize: 16 ,fontFamily:'Roboto'}}>{Strings.userypeselector_GuestUserButton}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {                             
                            this.mixpanelTrack("Login Welcome View");//mix Panel::Event-> Login
                            var eulaStatus = this.state.acceptedEula;
                            if (!eulaStatus) {                      //eula not accpted
                                this.setState({ error: 'flex' })
                            }
                            else {
                                this.setState({ error: 'none' })   //eula accpted    
                                commons.replaceScreen(this, 'login', {});  // Navigate to Login screen
                            }
                        }}
                        style={{ marginLeft: 10, height: 45, width: 150, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto', fontSize: 16 }}>{Strings.userypeselector_LoginButton}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        );
    }
}


