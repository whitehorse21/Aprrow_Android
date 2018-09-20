import React from 'react';
import { BackHandler, Linking, AsyncStorage, StyleSheet, Text, View, ToastAndroid, Image, KeyboardAvoidingView, TouchableOpacity, Dimensions } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import uicommons from './ui.commons';
import Modal from 'react-native-modal';
import Touch from 'react-native-touch';
import device_style from './styles/device.style';
import {
    LoginManager
} from "react-native-fbsdk";
import ToastExample from './nativemodules/Toast';
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require('./config/AWSConfig.json');
export default class profile extends React.Component {
    static navigationOptions = {
        title: 'ProfileLogin',
        headerStyle: { backgroundColor: '#006BBD' },
        headerTitleStyle: { color: 'white' },
        headerTintColor: 'white',
        headerRight: <Image source={require('./assets/icon_check.png')}
            style={{
                height: 40,
                width: 40,
                marginTop: 1,
                marginBottom: 1
            }} />
    };
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
            avatarSource: require('./assets/icon_perfil_sign_in_65px.png'),
            H1Name: 'Sign in for a better APRROW experience',
            HName: 'Login',
            FollowArray: { Facebook: 0, Instagram: 0, Twitter: 0, Youtube: 0 },
            username: "",
            showlogout: false,
            login_logoutlabel: "Logout",
            offlineFlag: false,
            gotologinflow: false
        };
        navigation = this.props.navigation;
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    }
    async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    async handleBackButtonClick() {

        this.props.handleBackButtonClick("Logout");
        return true;

    }
    componentDidMount() {
        var Mixpannel_tocken = AWSConfig.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
            Mixpanel.default.track("Account Profile");
        });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setAccount();
    }

    async setAccount() {
        var imagereturnD = await databasehelper.getProfileImage();
        var imageData = imagereturnD.res;
        var imageBase64 = imageData[0].profileimage;
        var username = await AsyncStorage.getItem("username");


        if (username == commons.guestuserkey()) {
            this.setState({ login_logoutlabel: "Login" })
        }



        this.setState({
            username: username
        });

        if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
            //avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
            this.setState({
                avatarSource: { uri: `data:image/gif;base64,${imageBase64}` }
            });
        }
        /* else{
           this.setState({                
             avatarSource:require('./assets/icon_login_grey_px24.png')
           });          
         }
         */
        var userData = await databasehelper.getuser();

        this.setState({
            HName: "Hi, " + userData.res[0].firstname,
            H1Name: userData.res[0].username
        });
    }
    async followRewards(type) {
        // alert("type====>>"+type);
        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            return;
        }

        var isconnected = await commons.isconnected();
        if (isconnected) {

            var FollowArray = this.state.FollowArray;
            if (!FollowArray.hasOwnProperty(type)) {
                FollowArrayy[type] = 0;
            }
            if (FollowArray[type] == 0) {
                //-------------------------------------------------------------
                var createtime = await commons.gettimestamp();
                fetch('' + AWSConfig.path + AWSConfig.stage + 'profilemgnt', {
                    method: 'POST',
                    headers: commons.getHeader(),
                    body: JSON.stringify({
                        "operation": "followedAPRROWRewd",
                        "username": this.state.username,
                        "followType": type,
                        "createdate": createtime
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        if (responseJson.status == "SUCCESS") {

                            this.setState({
                                FollowArray: responseJson.FollowArray
                            });
                        }
                        else {
                            ToastAndroid.show(JSON.stringify(responseJson), 500);
                        }


                    })
                    .catch((error) => {
                        console.error(error);
                    });

                //--------------------------------------------------------------------------
            }
        }
        else {
            ToastAndroid.show("No network available.", 500);
        }

    }
    async logoutfn() {
        this.setState({ showlogout: false });
        var isconnected = await commons.isconnected();
        if (isconnected) {
            var result = await commons.syncdatatobackend();

            if (result == "SUCCESS") {
                //ToastExample.clearWidget();
                await commons.SNSNotification();
                await commons.onGoogleSignOut();
                await commons.CognitoLogout();
                await commons.stopallservice();
                await AsyncStorage.clear();
                await databasehelper.AllTableDelete();

                await AsyncStorage.setItem("firstrun", "1");

                commons.reset(this, "login", {});
                LoginManager.logOut();
                await ToastExample.updateHomeScreenWidgets();

            }
            else {
                ToastAndroid.show(JSON.stringify(result), 500);
            }
        }
        else {
            ToastAndroid.show("No network available.", 500);
        }
    }
    offlineFunc() {
        this.setState({ offlineFlag: false });
    }
    render() {
        const { navigate } = this.props.navigation;
        var window = Dimensions.get('window').height;
        var h = (window * .13);
        return (
            < KeyboardAvoidingView behavior='padding' style={{ flex: 1, backgroundColor: '#ffffff' }}>
                {uicommons.offlineDialog(this)}
                <View style={{ height: '20%', backgroundColor: '#006BBD', justifyContent: 'center', flexDirection: 'row' }}>

                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={async () => {
                            var username = await AsyncStorage.getItem("username");
                            if (username == null || username == commons.guestuserkey()) {
                                this.setState({ gotologinflow: true });
                                return;
                            }
                            navigate("profile");
                        }}>
                            <Image style={{ borderRadius: h / 2, width: h, height: h }} source={this.state.avatarSource} />
                        </TouchableOpacity>
                        {/*</View>*/}
                    </View>
                    <View style={{ width: '62%', justifyContent: 'center', }}>
                        <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: 'white', justifyContent: 'center', textDecorationLine: 'underline' }}>{this.state.HName}</Text>
                        <Text allowFontScaling={false} style={styles.textH}>{this.state.H1Name}</Text>
                    </View>
                    <TouchableOpacity onPress={async () => {
                        var username = await AsyncStorage.getItem("username");
                        if (username == null || username == commons.guestuserkey()) {
                            const { navigate } = this.props.navigation;
                            navigate("login", {});
                            return;
                        }
                        this.setState({ showlogout: true });

                    }} style={{ width: '13%', justifyContent: 'center', marginRight: 10 }}>
                        <Image source={require('./assets/icon_logout_white_30px.png')} style={styles.imageS} />
                        <Text allowFontScaling={false} style={styles.textH}>{this.state.login_logoutlabel}</Text>
                    </TouchableOpacity>
                </View>

                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => { navigate('Settings'); }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_settings_blue_24px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Settings</Text>
                    </View>
                </Touch>

                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={async () => {
                    var username = await AsyncStorage.getItem("username");

                    if (username == null || username == commons.guestuserkey()) {
                        this.setState({ gotologinflow: true });
                    }
                    else {
                        var Mixpannel_tocken = AWSConfig.mixpanel_token;
                        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
                            Mixpanel.default.track("Account Shared Stax");
                        });
                        navigate('sharedApprow');
                    }
                }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_share_blue_24px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Shared STAXs</Text>
                    </View>
                </Touch>

                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={async () => {
                    var connectionstatus = await commons.isconnected();
                    // alert(connectionstatus);
                    if (connectionstatus) {
                        navigate('help');
                    }
                    else {
                        this.setState({ offlineFlag: true });
                    }
                }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_help_blue_24px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Help Center</Text>
                    </View>
                </Touch>

                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={async () => {

                    var connectionstatus = await commons.isconnected();
                    // alert(connectionstatus);
                    if (connectionstatus) {
                        navigate('eula');
                    }
                    else {
                        this.setState({ offlineFlag: true });
                    }
                }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_eula_blue_24px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>EULA</Text>
                    </View>
                </Touch>
                <Touch timeout={2000} pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={async () => {
                    var connectionstatus = await commons.isconnected();
                    // alert(connectionstatus);
                    if (connectionstatus) {
                        navigate('About');
                    }
                    else {
                        this.setState({ offlineFlag: true });
                    }
                }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_aprrow_24px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>About</Text>
                    </View>
                </Touch>

                <View style={{ height: 1, backgroundColor: 'grey' }}></View>
                <View style={styles.headView}><Text allowFontScaling={false} style={styles.textS}>Follow us on:</Text></View>

                <TouchableOpacity onPress={() => { Linking.openURL('https://www.facebook.com/aprrow/'); this.followRewards('Facebook') }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_facebook_28px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Facebook</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { Linking.openURL('https://www.instagram.com/aprrow/'); this.followRewards('Instagram') }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_instagram_28px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Instagram</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { Linking.openURL('https://twitter.com/_aprrow'); this.followRewards('Twitter') }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_twitter_28px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Twitter</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { Linking.openURL('https://www.youtube.com/channel/UCUrj8HTm150rAdlrEAhlxkA'); this.followRewards('Youtube') }} style={styles.outerView}>
                    <View style={styles.imageView}>
                        <Image source={require('./assets/icon_youtube_28px.png')}
                            style={styles.imageS} />
                    </View>
                    <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Youtube</Text>
                    </View>
                </TouchableOpacity>

                <Text allowFontScaling={false} style={{ fontSize: 14, color: 'black', alignSelf: 'center' }}>MobileUX Technologies, Inc. © PATENT PENDING</Text>


                <Modal
                    isVisible={this.state.showlogout}
                    style={{ flex: 1 }}
                    swipeDirection="right"
                    animationIn="fadeIn"
                    animationOut="fadeOut">
                    <View style={[{ height: '50%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee', borderRadius: 3 }]}>
                        <View style={{ height: '10%', width: '100%', alignItems: "center" }}>
                            <Text allowFontScaling={false} style={[styles.title, { color: "#006BBD", fontSize: 20 }]}>Do you want to Logout?</Text>
                        </View>
                        <View style={{ height: '20%', width: '100%', alignItems: "center" }}>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={async () => {
                                var username = await AsyncStorage.getItem("username");
                                if (username == null || username == commons.guestuserkey()) {
                                    const { navigate } = this.props.navigation;
                                    navigate("login", {});
                                    return;
                                }
                                this.logoutfn();
                            }}
                                style={{ backgroundColor: "#006BBD", height: 36, width: '40%', alignItems: "center", marginBottom: 8, borderRadius: 3, alignSelf: 'center' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>Yes</Text>
                            </TouchableOpacity>
                            <View style={{ width: '10%', }}>
                            </View>
                            <TouchableOpacity onPress={async () => { this.setState({ showlogout: false }); }} style={{ backgroundColor: "#006BBD", height: 36, width: '40%', alignItems: "center", marginBottom: 8, borderRadius: 3, alignSelf: 'center' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </Modal>

                {uicommons.loginFlowDialog(this)}
            </ KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fbfcfc"
    },

    outerView: { height: '8%', flexDirection: 'row', backgroundColor: '#ffffff', alignItems: 'center' },
    imageView: { width: '30%', backgroundColor: '#ffffff', marginTop: 2, justifyContent: 'center' },
    imageS: { alignSelf: 'center', marginTop: 1, marginBottom: 1 },
    textView: { width: '70%', backgroundColor: '#ffffff', marginTop: 2 },
    headView: { width: '100%', backgroundColor: '#ffffff', marginTop: 2 },
    textS: { fontSize: 16, color: 'black', marginLeft: 5, marginTop: 2 },
    textH: { fontSize: 14, fontFamily: 'Roboto-Bold', color: 'white', justifyContent: 'center' },
    avatar: { borderRadius: 200 / 2, width: 200, height: 200 }
});
