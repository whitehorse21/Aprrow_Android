import React, { Component } from 'react';
import {
    AppRegistry,
    BackHandler,
    Text,
    View,
    Dimensions,
    Image, TouchableOpacity, TextInput, Linking, AsyncStorage,
    AppState

} from 'react-native';
import TabNavigator from 'react-native-tab-navigator';

import { styles } from './bottom_menu.style'
import Welcome from '../welcome';
import Widget from '../widget';
import Notification from '../notifications';
import Rewards from '../rewards';
import Store from '../store/store_home';
import Logout from '../profileLogin';
import commons from '../commons';
const deviceW = Dimensions.get('window').width
import databasehelper from '../utils/databasehelper';
import Touch from 'react-native-touch';
var Mixpanel = require('react-native-mixpanel');
//import Link from './LinkOpen.js';
var istab = "false";

//setCustomView(customTextProps);

var navigation = null;

export default class TabDemo extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let title = params.title;
        let header = params.header;
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', marginLeft: 0, fontSize: 18, alignSelf: 'center', fontWeight: '200', fontFamily: 'Roboto-Bold' };
        let headerTintColor = 'white';
        let headerTitleAllowFontScaling = false;
        let headerRight = params.headerRight;
        let headerLeft = params.headerLeft;
        return {
            title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerLeft,
            header, headerTitleAllowFontScaling
        };
    }

    constructor(props) {

        super(props);

        this.state = {
            selectedTab: 'Home',
            avatarSource: require('../assets/perfil_toolbar_39px.png'),
            count: "",
        };

        navigation = this.props.navigation;
        this.setHeader = this.setHeader.bind(this);
        this.setNav = this.setNav.bind(this);
        this.badgeCount = this.badgeCount.bind(this);

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.handler = this.handler.bind(this)
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.setNavigation = this.setNavigation.bind(this);
        this.openLink = this.openLink.bind(this);
        this.openLink1 = this.openLink1.bind(this);
        global.applist = [];

    }

    async componentWillUnmount() {
        //BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Linking.removeEventListener('url', this.openLink1);
    }
    async handleBackButtonClick(content) {
        if (content != 'Home') {
            await this.setState({ selectedTab: 'Home' });
            this.headerComponent();
            return true;
        } else {
            BackHandler.exitApp();
            return false;
        }
    }

    async handler() {
        //commons.replaceScreen(this,"bottom_menu");
    }

    async componentDidMount() {
        istab = await AsyncStorage.getItem("istab");
        Linking.getInitialURL().then(async (url) => {
            if (url)
                this.openLink(url);
            else Linking.addEventListener('url', this.openLink1);
        });


        const username = await AsyncStorage.getItem("username");
        var mix_username = username;
        var Mixpannel_tocken = commons.AWSConfig.mixpanel_token;
        if (username == null || username == commons.guestuserkey()) {
            mix_username = await commons.getuuid();
            Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
                Mixpanel.default.track("Guest User");
                Mixpanel.default.identify(mix_username);
            });
        }
        else {
            Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
                Mixpanel.default.track("Login");
                Mixpanel.default.identify(mix_username);
            });
        }

        await this.bottomMenu_font();


        this.badgeCount();
        var page = this.props.navigation.state.params.page;
        if (page != undefined) {
            await this.setState({ selectedTab: page });
            if (page == 'Notification')
                this.refs.Notification.RecomponentDidMount();
        }
        this.headerComponent();
        this.setAccount();
    }
    async handleAppStateChange(newAppState) {
        if (newAppState === 'active') {
            AppState.removeEventListener('change', this.handleAppStateChange);
            this.openLink();
        }
    }
    async openLink1(url) {
        var username = await AsyncStorage.getItem("username");
        var isfirstrun = await AsyncStorage.getItem("firstrun");
        setTimeout(() => {
            if (username != null) {
                var urldata = "";
                if (url != null)
                    if (url.url != null && username != commons.guestuserkey()) {
                        urldata = (url.url).split("#");
                        commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
                    }
                    else {
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
    async openLink(url) {
        var username = await AsyncStorage.getItem("username");
        var isfirstrun = await AsyncStorage.getItem("firstrun");
        setTimeout(() => {
            if (username != null) {
                var urldata = "";
                if (url != null)
                    if (url.url != null && username != commons.guestuserkey()) {
                        urldata = (url.url).split("#");
                        commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
                    }
                    else {
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

    async setAccount() {
        var imagereturnD = await databasehelper.getProfileImage();
        var imageData = imagereturnD.res;
        var imageBase64 = imageData[0].profileimage;

        if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
            this.setState({
                avatarSource: { uri: `data:image/gif;base64,${imageBase64}` }
            });
        }

        var userData = await databasehelper.getuser();

        this.setState({
            HName: "Hi, " + userData.res[0].firstname,
            H1Name: userData.res[0].username
        });
    }
    setHeader(content) {
        const headerLeft = <View style={{ marginLeft: 10 }}><Text allowFontScaling={false} style={{ color: 'white', fontFamily: 'Roboto-Bold', marginLeft: 0, fontSize: 18 }}>Stax Viewer</Text><Text allowFontScaling={false} style={{ color: '#A7A9AC', fontFamily: 'Roboto-Bold', marginLeft: 0, fontSize: 14, }}>{content}</Text></View>;
        navigation.setParams({ headerLeft: headerLeft });
    }
    async setNav(content) {
        await this.setState({ selectedTab: content });
        await this.headerComponent();
        if (content == 'home')
            this.refs.Home.RecomponentDidMount();
        if (content == 'Rewards')
            this.refs.Rewards.RecomponentDidMount();

        if (content == 'Notification')
            this.refs.Notification.RecomponentDidMount();

    }
    async setNavigation(content, id) {
        await this.setState({ selectedTab: content });
        await this.headerComponent();
        if (content == 'STAX')
            this.refs.widget.Repeat_ComponentDidMount(id);
    }
    showdevicemanagment() {

    }
    async componentWillMount() {
        // this.headerComponent();
    }
    async headerComponent() {
        if (this.state.selectedTab === 'Home') {
            const title = '';
            const headerRight = null;
            var headerLeft = <View style={{ justifyContent: 'center', alignItems: 'center', height: Dimensions.get('window').height, width: Dimensions.get('window').width }}><Image style={{}} source={require("../assets/logo_aprrow_white_130x22.png")} /></View>;
            const header = undefined;
            navigation.setParams({ title: title, headerRight: headerRight, headerLeft: headerLeft, header: header });
        }
        else if (this.state.selectedTab === 'STAX') {
            const headerLeft = (<View style={{ marginLeft: 10 }}><Text allowFontScaling={false} style={{ color: 'white', fontWeight: '200', fontFamily: 'Roboto', marginLeft: 0, fontSize: 18 }}>Stax Viewer</Text><Text allowFontScaling={false} style={{ color: '#A7A9AC', marginLeft: 0, fontSize: 14, fontFamily: 'Roboto' }}></Text></View>);
            var title = "";
            var header = undefined;
            const headerRight = (
                <View style={{ flexDirection: 'row', margin: 10 }}>
                    {this.renderHeaderButton(require('../assets/icon_sync_white_21px.png'), () => this.refs.widget.syncdata())}
                    {this.renderHeaderButton(require('../assets/icon_device_white_21px.png'), () => this.refs.widget.showdevicemanagment())}
                    <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.refs.widget.shareApplist()}>
                        <Image source={require('../assets/icon_applist_white_21px.png')}
                            style={{
                                marginLeft: 10,
                                marginTop: 1,
                                marginBottom: 1
                            }}
                        />
                    </Touch>
                    {this.renderHeaderButton(require('../assets/icon_share_white.png'), () => this.refs.widget.sharewidget())}
                    {this.renderHeaderButton(require('../assets/icon_search_white_21px.png'), () => this.refs.widget.serach_widget())}
                    {this.renderHeaderButton(require('../assets/icon_organizer_white_21px.png'), () => this.refs.widget.OrganizeStax())}
                </View>
            );
            navigation.setParams({ title: title, headerLeft: headerLeft, headerRight: headerRight, header: header });
        }
        else if (this.state.selectedTab === 'Discover') {
            var title = '';
            var headerLeft = null;

            var headerRight = '';
            var header = undefined;
            var windowProp = Dimensions.get('window').width;
            headerRight = (
                <View
                    style={{
                        alignItems: "center",
                        width: windowProp,
                        height: 40,
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                    <View
                        style={{
                            //  borderColor: "white",
                            // borderWidth: 1,
                            //    borderRadius: 30,
                            alignItems: "center",
                            width: windowProp,
                            marginRight: -18,
                            height: 40,
                            flexDirection: "row",
                            alignItems: "center"
                        }}>

                        <Image
                            style={{ width: 20, height: 20, marginLeft: 2, marginRight: 5 }}
                            source={require("../assets/icon_search_white.png")}
                        />
                        <TextInput
                            style={{ width: "100%", borderWidth: 0, color: "white", fontSize: 12 }}
                            allowFontScaling={false}
                            placeholder="Search STAX"
                            placeholderTextColor="#3F97DC"
                            onChangeText={(value) => this.refs.Store.setval(value)}
                            onSubmitEditing={() => this.refs.Store.search(false)}
                            underlineColorAndroid="transparent"
                        />

                    </View>

                    <View style={{ width: "100%", height: 5, alignItems: 'center', paddingLeft: 27 }}>

                        <Image
                            style={{ width: Dimensions.get('window').width - 60, height: 1 }}
                            source={require("../assets/line_search_stax.png")}
                        />
                    </View>
                </View>
            );
            navigation.setParams({ title: title, headerLeft: headerLeft, headerRight: headerRight, header: header });

        }
        else if (this.state.selectedTab === 'Rewards') {

            var title = 'Rewards';
            var headerLeft = '';

            var headerRight = '';
            var header = null;
            navigation.setParams({ title: title, headerLeft: headerLeft, headerRight: headerRight, header: header });
        }
        else if (this.state.selectedTab === 'Notification') {
            var height = Dimensions.get('window').height;
            var width = Dimensions.get('window').width;
            var title = '';
            var headerRight = '';
            var header = undefined;
            var headerLeft = '';
            headerLeft = (

                <View
                    style={{
                        borderColor: "#006BBD",
                        borderWidth: 1,
                        borderRadius: 30,
                        alignItems: "center",

                        marginRight: -18,
                        width: width,
                        height: height,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                    <Image
                        style={{ width: 25, height: 25, marginLeft: 15, marginRight: 5 }}
                        source={require("../assets/icon_search_white.png")}
                    />

                    <TextInput
                        style={{ width: "80%", borderWidth: 0, color: '#FFFFFF', fontFamily: 'Roboto' }}
                        allowFontScaling={false}
                        placeholder="Search"
                        placeholderTextColor="white"
                        onChangeText={(value) => this.refs.Notification.setval(value)}
                        onSubmitEditing={() => this.refs.Notification.search(false)}
                        underlineColorAndroid="white"
                    />
                </View>
            );
            navigation.setParams({ title: title, headerLeft: headerLeft, headerRight: headerRight, header: header });
        }
        else if (this.state.selectedTab === 'Logout') {
            var title = '';
            var headerRight = '';
            var header = null;
            var headerLeft = '';
            navigation.setParams({ header: header, title: title, headerLeft: headerLeft, headerRight: headerRight });
        }

    }
    async badgeCount() {
        var count = "";
        count = await AsyncStorage.getItem("BadgeNo");
        if (count != this.state.count)
            await this.setState({ count: count });

    }
    async bottomMenu_font() {
        this.setState({ font_s: deviceW <= 330 ? 6 : deviceW > 370 ? 9 : 8 })
    }
    async upBadge() {
        //this.setState({selectedTab:"Rewards"});
    }

    renderHeaderButton(ic, callBack) {
        return (
            <TouchableOpacity onPress={callBack}>
                <Image
                    source={ic}
                    style={{
                        marginLeft: 10,
                        marginTop: 1,
                        marginBottom: 1
                    }}
                />
            </TouchableOpacity>
        )
    }

    render() {
        var window = Dimensions.get('window').height;
        var h = (window * .04);
        //var font_s=7;
        var font_s = 8;
        var icon_wh = 35;
        var tabstyle = "";
        if (istab == "true") {
            font_s = 12;
            tabstyle = { height: '8%' };
        }
        return (
            <TabNavigator
                tabBarStyle={tabstyle}
                style={styles.container}>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'Home'}
                    title="HOME"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderIcon={() => istab == "true" ? <Image source={require('../assets/icon_home_grey_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_home_grey_px24.png')} style={{}} />}
                    renderSelectedIcon={() => istab == "true" ? <Image source={require('../assets/icon_home_active_blue_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_home_active_blue_px24.png')} style={{}} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'Home' });
                        this.headerComponent()
                        this.refs.Home.RecomponentDidMount();
                        try {
                            this.refs.widget.resetWebViewToInitialUrl();
                        } catch (err) {
                        }
                    }}>
                    <Welcome ref={"Home"} handleBackButtonClick={this.handleBackButtonClick} navigation={navigation} setNavigation={this.setNavigation} handler={this.handler} badgeCount={this.badgeCount} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'STAX'}
                    title="STAX"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderIcon={() => istab == "true" ? <Image source={require('../assets/icon_stax_grey_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_stax_grey_px24.png')} style={{}} />}
                    renderSelectedIcon={() => istab == "true" ? <Image source={require('../assets/icon_stax_active_blue_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_stax_active_blue_px24.png')} style={{}} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'STAX' }); this.headerComponent();
                        this.refs.widget.Repeat_ComponentDidMount();
                    }}>
                    <Widget ref={"widget"} handleBackButtonClick={this.handleBackButtonClick} setHeader={this.setHeader} navigation={navigation} timestmap={commons.gettimestamp()} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'Discover'}
                    title="DISCOVER"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderIcon={() => istab == "true" ? <Image source={require('../assets/icon_discover_grey_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_discover_grey_px24.png')} style={{}} />}
                    renderSelectedIcon={() => istab == "true" ? <Image source={require('../assets/icon_discover_active_blue_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_discover_active_blue_px24.png')} style={{}} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'Discover' }); this.headerComponent();
                        this.refs.Store.RepeatcomponentDidMount();
                        try {
                            this.refs.widget.resetWebViewToInitialUrl();
                        } catch (err) {
                        }
                    }}>
                    <Store ref={"Store"} handleBackButtonClick={this.handleBackButtonClick} setNav={this.setNav} navigation={navigation} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'Rewards'}
                    title="REWARDS"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderIcon={() => istab == "true" ? <Image source={require('../assets/icon_rewards_grey_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_rewards_grey_px24.png')} style={{}} />}
                    renderSelectedIcon={() => istab == "true" ? <Image source={require('../assets/icon_rewards_active_blue_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_rewards_active_blue_px24.png')} style={{}} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'Rewards' }); this.headerComponent();
                        this.refs.Rewards.RecomponentDidMount();
                        try {
                            this.refs.widget.resetWebViewToInitialUrl();
                        } catch (err) {
                        }
                    }}>
                    <Rewards ref={"Rewards"} handleBackButtonClick={this.handleBackButtonClick} setNav={this.setNav} upBadge={this.upBadge} navigation={navigation} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'Notification'}
                    title="NOTIFICATION"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderBadge={() => commons.renderIf(this.state.count != "" && this.state.count != null, <Text style={{ borderRadius: 10, width: 20, height: 20, color: '#FFFFFF', backgroundColor: '#FF5600', textAlign: 'center', fontWeight: '500' }}>{this.state.count}</Text>)}
                    renderIcon={() => istab == "true" ? <Image source={require('../assets/icon_notifications_grey_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_notifications_grey_px24.png')} style={{}} />}
                    renderSelectedIcon={() => istab == "true" ? <Image source={require('../assets/icon_notifications_active_blue_px24.png')} style={{ width: icon_wh, height: icon_wh }} /> : <Image source={require('../assets/icon_notifications_active_blue_px24.png')} style={{}} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'Notification', count: '' }); this.headerComponent(); await AsyncStorage.setItem("BadgeNo", '');
                        this.refs.Notification.RecomponentDidMount();
                        try {
                            this.refs.widget.resetWebViewToInitialUrl();
                        } catch (err) {
                        }
                    }}>
                    <Notification setNav={this.setNav} handleBackButtonClick={this.handleBackButtonClick} setNavigation={this.setNavigation} ref={"Notification"} navigation={navigation} />
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'Logout'}
                    title="PROFILE"
                    titleStyle={{ fontSize: font_s }}
                    selectedTitleStyle={{ color: "#3496f0" }}
                    renderIcon={() => <Image style={{ borderRadius: h / 2, width: h, height: h }} source={this.state.avatarSource} />}
                    renderSelectedIcon={() => <Image style={{ borderRadius: h / 2, width: h, height: h }} source={this.state.avatarSource} />}
                    onPress={async () => {
                        await this.setState({ selectedTab: 'Logout' }); this.headerComponent();
                        try {
                            this.refs.widget.resetWebViewToInitialUrl();
                        } catch (err) {
                        }
                    }}>
                    <Logout ref={"Logout"} handleBackButtonClick={this.handleBackButtonClick} navigation={navigation} />
                </TabNavigator.Item>
            </TabNavigator>
        );
    }
}

AppRegistry.registerComponent('TabDemo', () => TabDemo);