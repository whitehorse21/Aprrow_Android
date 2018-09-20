import React, { Component } from 'react';
import { AsyncStorage, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import commons from './commons';
import CheckBox from 'react-native-check-box';
import databasehelper from './utils/databasehelper.js';



export default class usertypeselector extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            acceptedeula: false,
            error: 'none'
        };
    }


    render() {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
                <View style={{ alignItems: "center", justifyContent: "center", marginTop: "5%" }}>
                    <Image source={require('./assets/logo_aprrow_black.png')} />
                </View>

                <View style={{ alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 22, color: "#F16822", fontFamily: 'Roboto' }}>Welcome to APRROW !!!</Text>

                </View>


                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>You can use APRROW as a guest user and</Text>

                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>enjoy our personalization features</Text>

                </View>


                <View style={{ flexDirection: "column", marginTop: "2%", marginLeft: "5%" }}>
                    <View style={{ flexDirection: "row", marginTop: "1%", width: "80%" }}>
                        <Image style={{ alignSelf: "center" }} source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={1}>Organize Apps into APRROW Stax</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image style={{ alignSelf: "center" }} source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%", marginTop: "3%" }} numberOfLines={2}>Add APRROW Stax to device's home screen using widgets</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={1}>Get your Most Frequent Stax</Text>
                    </View>
                </View>

                <View style={{ width: '100%', marginTop: "2%", alignItems: "center", justifyContent: "center" }}>
                    <Image source={require('./assets/line_grey_360px.png')} />
                </View>

                <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "3%" }}>
                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>OR, Login to access our enhanced features.</Text>

                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "#0065B2", fontWeight: "300" }} numberOfLines={1}>It's FREE</Text>

                </View>

                <View style={{ flexDirection: "column", marginTop: "2%", marginLeft: "5%" }}>
                    <View style={{ flexDirection: "row", marginTop: "1%", width: "80%" }}>
                        <Image style={{ alignSelf: "center" }} source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={1}>Personalize Multiple Devices</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image style={{ alignSelf: "center" }} source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>Replicate Devices</Text>
                    </View>
                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>Share apps and APRROW Stax with people you know</Text>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: "1%" }}>
                        <Image source={require('./assets/marker_logo_aprrow.png')} />
                        <Text allowFontScaling={false} style={{ fontSize: 14, color: "#757575", fontWeight: "200", marginLeft: "3%", width: "80%" }} numberOfLines={2}>Discover new apps and more</Text>
                    </View>
                </View>


                <View style={{ flex: 1, flexDirection: 'row', marginTop: "2%", alignItems: "center", justifyContent: "center" }}>
                    <CheckBox


                        onClick={() => {
                            var eualastatus = this.state.acceptedeula;
                            this.setState({ acceptedeula: !eualastatus })
                        }}

                        checkedImage={<Image source={require("./assets/icon_checkbox_on_lightblue_24px.png")} />}
                        unCheckedImage={<Image source={require("./assets/icon_checkbox_off_grey_24px.png")} />}



                    />
                    <View style={{ flexDirection: 'column' }}>
                        <Text allowFontScaling={false} style={{ color: "#0065B2", marginTop: 20, marginLeft: 10 }}>I confirm that I have read and agree to the</Text>
                        <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () => {
                            await this.setState({ appsdisplay: true })
                            const { navigate } = this.props.navigation
                            navigate("eula", { screen: 'eula' })
                            setTimeout(() => { this.setState({ appsdisplay: false }) }, 1000);
                        }}>
                            <Text allowFontScaling={false} style={{ color: "#0065B2", marginTop: 1, marginLeft: 10, textDecorationLine: 'underline', textDecorationColor: "#0065B2", fontFamily: 'Roboto-Bold' }}>End User License Agreement</Text>
                        </TouchableOpacity>

                        <Text allowFontScaling={false} style={{ display: this.state.error, color: "red", marginTop: 1, marginLeft: 10 }}>Required Field</Text>

                    </View>
                </View>

                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "5%", marginBottom: "10%" }}>
                    <TouchableOpacity onPress={async () => {
                        var eulastatus = this.state.acceptedeula;

                        if (!eulastatus) {
                            this.setState({ error: 'flex' })
                        }
                        else {

                            this.setState({ error: 'none' })

                            /////////intialise testuser and go to bottom menu//////////////
                            await AsyncStorage.setItem("username", commons.guestuserkey());

                            var userdata = {};
                            userdata["firstname"] = "guest";
                            userdata["lastname"] = "user";
                            userdata["username"] = commons.guestuserkey();
                            userdata["eulaid"] = "0";
                            userdata["loginfrom"] = "guest";
                            userdata["email"] = "test";
                            userdata["createtime"] = "0";


                            await databasehelper.insertuser(userdata);


                            var profiledata = {};
                            profiledata.createtime = "0";
                            profiledata.username = commons.guestuserkey();
                            profiledata.firstname = "guest";
                            profiledata.lastname = "user";


                            await databasehelper.insertprofile(profiledata);




                            var proObj = {};
                            proObj["profileimage"] = '0';
                            //if (profiledata.profileimage != undefined && profiledata.profileimage != 'undefined') {
                            //  proObj.profileimage = profiledata.profileimage;
                            //  }
                            proObj.username = commons.guestuserkey();
                            proObj.createtime = "0";

                            /////////////////////////
                            commons.replaceScreen(this, 'bottom_menu', {});

                        }

                    }}

                        style={{ marginRight: 10, height: 45, width: 150, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontSize: 16, fontFamily: 'Roboto' }}>Guest User</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            var eulastatus = this.state.acceptedeula;

                            if (!eulastatus) {
                                this.setState({ error: 'flex' })
                            }
                            else {
                                this.setState({ error: 'none' })
                                //navigate to login
                                commons.replaceScreen(this, 'login', {});


                            }

                        }}

                        style={{ marginLeft: 10, height: 45, width: 150, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto', fontSize: 16 }}>Login</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        );
    }
}