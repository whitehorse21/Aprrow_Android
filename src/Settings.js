import React from 'react';
import { Linking, BackHandler, AsyncStorage, CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image, KeyboardAvoidingView, AppRegistry, ToolbarAndroid, SectionList, TouchableOpacity, Picker, FlatList } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown';
import commons from "./commons";
import SideMenu from 'react-native-side-menu';
import ModalDropdown from 'react-native-modal-dropdown';
import databasehelper from './utils/databasehelper.js';
import ToastExample from './nativemodules/Toast';
import OpenSettings from 'react-native-open-settings';
import Modal from 'react-native-modal';
import device_style from './styles/device.style';
import Strings from './utils/strings.js';
import LoaderNew from './utils/LoaderNew';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");
export default class profile extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        const { navigate } = navigation
        let title = Strings.settings_head;
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
            isOpen: false,
            appsdisplay: false,
            gotologinflow: false,
            offlineFlag: false,
            resetPermision: 'flex',
            language: "",
            languageDefault: "",
            languageCode: [],
            languageName: []

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.openLink = this.openLink.bind(this);
        this.openLink1 = this.openLink1.bind(this);
    }

    /** 
        Listing All language options
        @param 
        @return language Code and Name
        @created by DhiD7
        @modified by DhiD5
        @modified date 04/09/2018

    */
    async languageOptions() {

        var username = await AsyncStorage.getItem("username");
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        var urlName = "";

        if (username == null || username == commons.guestuserkey()) {
            urlName = aws_lamda.commenapis;
        }
        else {
            urlName = aws_lamda.multilanguage;
        }
        var acceestoken = await commons.get_token();

        await fetch('' + aws_data.path + aws_data.stage + urlName, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': acceestoken,
                'X-Api-Key':'xgWUKSHoA3aQpDhrrZnxb1A3TFkx0J3J6d7lcuok'

            },
            body: JSON.stringify({
                "operation": "getAllLLanguage"
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {

                try {

                    responseJson.sort(function (a, b) { return (a.languageName > b.languageName) ? 1 : ((b.languageName > a.languageName) ? -1 : 0); });
                } catch (err) {
                    console.log(err + "@line 95");
                }
                var services = [];
                var languageName = [];
                var languageCode = [];
                for (i = 0; i < responseJson.length; i++) {
                    languageName.push(responseJson[i].languageName);
                    languageCode.push(responseJson[i].languageCode);
                    if (this.state.language == responseJson[i].languageCode)
                        await this.setState({ languageDefault: responseJson[i].languageName });
                }

                await this.setState({
                    services: services,
                    languageCode: languageCode,
                    languageName: languageName
                });



            })
    }

    /** 
        Language Setting to the app
        @param idx(index),Value
        @return
        @created by DhiD7
        @modified by
        @modified date
    */
    async languageSet1(idx, value) {
        this.refs.loaderRef.show();
        var str = this.state.languageCode[idx];

        var path = aws_data11.s3path + "/" + aws_data11.s3bucketname + "/" + aws_data11.s3languagefolder + "/" + aws_data11.s3languagesubfolder + "/";
        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
            await commons.download_language_file_tocache(path, str, ".json");
            var data = await commons.jsonReader(str);
            this.refs.loaderRef.hide();
            if (data)
                commons.replaceScreen(this, "loading");
        } else {
            this.setState({ offlineFlag: true });
            this.refs.loaderRef.hide();
        }
    }
    async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Linking.removeEventListener('url', this.openLink1);
    }
    /** 
        System BackButton operations
        @param 
        @return true
        @created by DhiD7
        @modified by
        @modified date
    */
    async handleBackButtonClick() {
        const { goBack } = this.props.navigation;
        goBack();
        return true;
    }
    /** 
        Sharing Link Open operation
        @param url
        @return true
        @created by DhiD7
        @modified by
        @modified date
    */
    async openLink(url) {

        const { navigate } = this.props.navigation;
        var username = await AsyncStorage.getItem("username");
        var isfirstrun = await AsyncStorage.getItem("firstrun");
        setTimeout(async () => {
            if (username != null) {
                var urldata = "";
                if (url != null)
                    if (url.url != null && username != commons.guestuserkey()) {
                        urldata = (url.url).split("#");
                        commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
                    }

            }
            else {
                if (isfirstrun == null)
                    commons.replaceScreen(this, 'userypeselector', {});
                else
                    commons.replaceScreen(this, 'login', {});
            }
        }, 2000);


    }
    async openLink1(url) {

    }
    async  componentDidMount() {
        try {
            var lan = await AsyncStorage.getItem("lan");
            if (lan != null) {
                await this.setState({ language: lan });
            }
        } catch (err) {
        }


        try {
            var tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Settings Page");
            });
        }
        catch (err) {
        }

        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
            this.languageOptions();
        } else
            this.setState({ offlineFlag: true });

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        Linking.getInitialURL().then(async (url) => {
            if (url)
                this.openLink(url);
            else
                Linking.addEventListener('url', this.openLink1);
        });

        try {
            if (await AsyncStorage.getItem("google") != undefined || await AsyncStorage.getItem("facebook") != undefined)
                await this.setState({ resetPermision: 'none' });
        } catch (err) {
        }
        var Ncount = await AsyncStorage.getItem("BadgeNo");
        var count = 0;
        if (Ncount != null) {
            count = Ncount;
            this.props.navigation.setParams({ count: count });
        }

    }
    /** 
        Opening the access page of the app
        @param 
        @return 
        @created by DhiD6
        @modified by
        @modified date
    */
    MixPanelAccess() {
        OpenSettings.openSettings();
        try {
            var tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Access Page");
            });
        } catch (err) {

        }

    }
    /** 
        Opening the Notification page of the app
        @param 
        @return 
        @created by DhiD6
        @modified by
        @modified date
    */
    async MixPanelNotification() {
        await ToastExample.isNotificationServiceRunning();
        try {
            var mixpannelTocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(mixpannelTocken).then(() => {
                Mixpanel.default.track("Settings Notifications");
            });

        } catch (err) {

        }

    }
    /** 
       Network Checking
       @param 
       @return 
       @created by DhiD1
       @modified by
       @modified date
   */
    offlineFunc() {
        this.setState({ offlineFlag: false });
    }
    render() {
        const { navigate } = this.props.navigation

        return (

            < KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
                <LoaderNew ref={"loaderRef"} />
                <Dialog visible={this.state.offlineFlag}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={require('./assets/icon_offline_grey_40px.png')} style={{ alignSelf: 'center' }} />
                        <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.offline_head}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title1}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title2}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>

                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.offline_common_okbutton}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                <Modal
                    isVisible={this.state.gotologinflow}
                    onBackButtonPress={() => this.setState({ gotologinflow: false })}
                    style={{ flex: 1 }}
                    swipeDirection="right"
                    animationIn="fadeIn"
                    animationOut="fadeOut">
                    <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" }}>
                        <View style={{ backgroundColor: "#006BBD", height: '18%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>

                            <Text allowFontScaling={false} style={[{ fontSize: 18, fontFamily: 'Roboto-Bold', color: "white" }]}>{Strings.guestuser_create}</Text>

                        </View>

                        <View style={{ height: "30%", alignItems: "center", justifyContent: "center", marginTop: "8%" }}>
                            <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16, fontWeight: "100", color: "black" }}>{Strings.guestuser_title1}</Text>
                            <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16, fontWeight: "100", color: "black" }}>{Strings.guestuser_title2}</Text>
                        </View>


                        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "10%" }}>
                            <TouchableOpacity onPress={() => { this.setState({ gotologinflow: false }) }}
                                style={{ marginRight: 10, height: 42, width: 125, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_nobtn}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({ gotologinflow: false })
                                    const { navigate } = this.props.navigation;
                                    navigate("login", {});
                                }}

                                style={{ marginLeft: 10, height: 42, width: 125, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_loginbtn}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </Modal>

                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View>
                        <View style={{ flexDirection: 'row', padding: '5%' }}>
                            <TouchableOpacity onPress={async () => {
                                var connectionstatus = await commons.isconnected();

                                if (connectionstatus) {
                                    var username = await AsyncStorage.getItem("username");
                                    if (username == null || username == commons.guestuserkey()) {
                                        this.setState({ gotologinflow: true });
                                        return;
                                    }
                                    navigate("profile");
                                }
                                else {
                                    this.setState({ offlineFlag: true })
                                }
                            }} style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_editprofile}</Text>
                            </TouchableOpacity>
                            <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>

                            </View>
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
                        <View style={{ flexDirection: 'row', padding: '5%', display: this.state.resetPermision }}>
                            <TouchableOpacity onPress={async () => {
                                var connectionstatus = await commons.isconnected();
                                if (connectionstatus) {
                                    var username = await AsyncStorage.getItem("username");
                                    if (username == null || username == commons.guestuserkey()) {
                                        this.setState({ gotologinflow: true });
                                        return;
                                    }
                                    navigate("loginandsecurites");
                                } else {
                                    this.setState({ offlineFlag: true });
                                }

                            }} style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_reset}</Text>
                            </TouchableOpacity>
                            <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>

                            </View>
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
                        <View style={{ flexDirection: 'row', padding: '5%' }}>
                            <TouchableOpacity onPress={async () => {
                                var connectionstatus = await commons.isconnected();
                                if (connectionstatus) {
                                    var username = await AsyncStorage.getItem("username");
                                    if (username == null || username == commons.guestuserkey()) {
                                        this.setState({ gotologinflow: true });
                                        return;
                                    }
                                    navigate("PurchaseSub");
                                }
                                else {
                                    this.setState({ offlineFlag: true })
                                }
                            }} style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_purchase}</Text>
                            </TouchableOpacity>
                            <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }}>

                            </View>
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
                        <View style={{ flexDirection: 'row', padding: '5%' }}>
                            <View style={{ width: '70%' }}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_language}</Text>
                            </View>
                            <View style={{ width: '30%', flexDirection: 'row', alignSelf: 'center' }}>

                                <ModalDropdown options={this.state.languageName}
                                    defaultValue={this.state.languageDefault}
                                    style={{ flex: 1 }}
                                    allowFontScaling={false}
                                    textStyle={{ fontSize: 14, color: 'black', fontFamily: 'Roboto-Bold' }}
                                    dropdownStyle={{ width: '30%', height: "20%" }}
                                    dropdownTextStyle={{ fontSize: 14, color: 'black', fontFamily: 'Roboto-Bold' }}
                                    onSelect={async (idx, value) => await this.languageSet1(idx, value)}
                                >
                                </ModalDropdown>

                                <Image style={{ height: 25, width: 25 }} source={require("./assets/icon_keyboard_arrow_right.png")} />
                            </View>
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
                        <View style={{ flexDirection: 'row', padding: '5%' }}>
                            <TouchableOpacity style={{ width: '80%' }} onPress={async () => this.MixPanelNotification()}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_notification}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />


                        <View style={{ flexDirection: 'row', padding: '5%' }}>
                            <TouchableOpacity onPress={() => this.MixPanelAccess()} style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', fontFamily: 'Roboto-Bold', color: '#006BBD' }}>{Strings.settings_access}</Text>
                            </TouchableOpacity>
                            <View style={{ width: '20%', flexDirection: 'row', alignItems: 'center' }} />

                        </View>
                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />

                        <View style={{ height: 1, width: '100%', backgroundColor: "#b2babb" }} />
                    </View>
                </View>


            </ KeyboardAvoidingView>
        );
    }
}


