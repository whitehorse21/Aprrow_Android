import React, { Component } from "react";
import { BackHandler, View, ToastAndroid, Dimensions, TouchableOpacity, Image, Text, FlatList, AsyncStorage } from "react-native";
import commons from '../commons';
//import Loader from './utils/Loader';
import LoaderNew from '../utils/LoaderNew';
import databasehelper from '../utils/databasehelper';
import { Dialog } from 'react-native-simple-dialogs';

import Slider from "react-native-slider";
import Tabs from '../utils/tabs_rewards';
import Modal from 'react-native-modal';

var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require("../config/AWSConfig.json");

import { customStyles6 } from '../styles/rewards.style'

var u = require('./ui');
var uiCommons = require('../ui.commons')
var statusDialog = require('./dialogs');

export default class Rewards extends Component {
    static navigationOptions = () => {
        let title = 'Rewards';
        let headerStyle = { backgroundColor: '#005798' };
        let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        return {
            title, headerStyle, headerTitleStyle, headerTintColor
        };
    };


    constructor(props) {
        super(props);
        this.state = {
            currentbadge: "",
            userimage: "",
            Username: "",
            firstname: "",
            coins_collected: "0",
            all_coins_collected: "0",
            coins_to_nextbadge: "0",
            nextbadge: "",
            timeline: [],
            taskprogrss: [],
            statusinfo: false,
            loading: false,
            offlineFlag: false,
            userimage: require("../assets/photo_mini_perfil.png"),
            gotologinflow: false
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    async handleBackButtonClick() {
        this.props.handleBackButtonClick("Rewards");
        return true;
    }

    getsliderbgcolor() {
        if (this.state.currentbadge == "PLATINUM")
            return "#444444";

        return "#005CA1"
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    getmainslidercolor() {
        var currbadge = this.state.currentbadge;
        var up_currbdge = currbadge.toUpperCase();
        switch (up_currbdge) {
            case "BRONZE":
                return "#D99679"
            case "SILVER":
                return "#BFBFBF"
            case "GOLD":
                return "#FFBB00"
            case "PLATINUM":
                return "#444444"
            default:
                return "#FFFFFF"
        }
    }

    getmargin(bigicon) {
        if (!bigicon)
            return 12;
        return 0;
    }
    gotostore() {
        const { navigate } = this.props.navigation;
        navigate("bottom_menu", { "page": "Discover", "coins": this.state.coins_collected });
    }
    async  collectcoins(item) {
        if (item.taskheading == "Created STAX") {
            try {
                var tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                    Mixpanel.default.track("Created STAX");
                });
            }
            catch (err) {
            }
        }
        else if (item.taskheading == "Shared STAX") {
            try {
                var tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                    Mixpanel.default.track("Shared STAX");
                });
            }
            catch (err) {
            }
        }
        else if (item.taskheading == "Discover Purchases") {
            try {
                var tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                    Mixpanel.default.track("Discover Purchases");
                });
            }
            catch (err) {
            }
        }
        else if (item.taskheading == "Follow APRROW") {
            try {
                var tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                    Mixpanel.default.track("Follow APRROW");
                });
            }
            catch (err) {
            }
        }


        await fetch('' + AWSConfig.path + AWSConfig.stage + 'rewardmanagement', {
            method: 'POST',
            headers: commons.getHeader(),
            body: JSON.stringify({
                "operation": "getCollectingCoins",
                "userid": this.state.Username,
                "noOfCoins": item.numberofcoins,
                "createtime": commons.gettimestamp(),
                "taskid": item.id
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                var curbadge = "";
                if (responseJson.BADGE != "none")
                    curbadge = responseJson.BADGE

                if (this.state.currentbadge.toUpperCase() != curbadge.toUpperCase()) {
                    ToastAndroid.show("You Rised To  " + curbadge.toUpperCase(), 500)
                    this.props.setNav("Rewards");
                }

                else {
                    var index = parseInt(item.key);
                    var curentcoins = parseInt(this.state.coins_collected);
                    var curentallcoinscollected = parseInt(this.state.all_coins_collected);
                    var cions_toadd = parseInt(item.numberofcoins);
                    var cur_prgs = this.state.taskprogrss;
                    cur_prgs[index].eligibleforcoin = false;
                    cur_prgs[index].numberofcoins = "0";

                    curentcoins += cions_toadd;
                    curentallcoinscollected += cions_toadd;
                    this.setState({
                        taskprogrss: cur_prgs,
                        coins_collected: curentcoins + "",
                        all_coins_collected: curentallcoinscollected
                    })
                    // ToastAndroid.show("You Got  " + cions_toadd + "  Coins!!!", 500)
                    ToastAndroid.show("You have collected your Coins", 500)
                }

            })
            .catch((error) => {
                console.log(error);
            });
    }
    async componentDidMount() {
        try {
            var tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Rewards Page");
            });
        }
        catch (err) {
        }
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.RecomponentDidMount();
    }
    async RecomponentDidMount() {
        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
            this.refs.loaderRef.show();
            // this.setState({ loading: true });
            const Username = await AsyncStorage.getItem("username");

            var imagereturnD = await databasehelper.getProfileImage();
            var imageData = imagereturnD.res;

            var imageBase64 = imageData[0]["profileimage"];
            var uri = require("../assets/photo_mini_perfil.png");
            if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
                uri = { uri: `data:image/gif;base64,${imageBase64}` };
            }

            var firstname = "";
            var userData = await databasehelper.getuser();
            if (userData.res != null && userData.res.length > 0) {
                firstname = userData.res[0].firstname;
            }

            if (Username == null || Username == commons.guestuserkey()) {
                this.setState({ gotologinflow: true });
                this.setState({
                    Username: Username,
                    firstname: firstname,
                    userimage: uri,
                    loading: false
                });
                this.refs.loaderRef.hide();
                return;
            }

            // do the netwrok call 
            await fetch('' + AWSConfig.path + AWSConfig.stage + 'rewardmanagement', {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getUserRewards",
                    "userid": Username
                }),
            }).then((response) => response.json())
                .then(async (responseJson) => {


                    var coins = responseJson.Coins;
                    var allCoinCount = responseJson.allCoinCount;
                    var badge = "";
                    if (responseJson.Badge != "none")
                        badge = responseJson.Badge.toUpperCase();

                    var nextbadge = ui.getnextbadge(badge);
                    var points_nextbadge = u.getpointsto_nextbadge(badge);

                    var taskprogrss = responseJson.taskprogressdata;

                    var modified_taskprogress = [];
                    for (var i = 0; i < taskprogrss.length; i++) {
                        var taskobj = {};
                        taskobj["key"] = i + "";
                        taskobj["id"] = taskprogrss[i].taskid;
                        taskobj["taskheading"] = taskprogrss[i].taskheading;
                        taskobj["taskdescription"] = taskprogrss[i].taskdescription;
                        taskobj["pointscollected"] = "0"
                        taskobj["pointsrequired"] = taskprogrss[i].pointsrequired;
                        taskobj["eligibleforcoin"] = false;
                        taskobj["numberofcoins"] = "0";

                        if (taskprogrss[i].hasOwnProperty("pointscollected"))
                            taskobj["pointscollected"] = taskprogrss[i].pointscollected;

                        if (taskprogrss[i].hasOwnProperty("numberofcoins")) {
                            taskobj["numberofcoins"] = taskprogrss[i].numberofcoins;
                            if (parseInt(taskprogrss[i].numberofcoins) > 0)
                                taskobj["eligibleforcoin"] = true;

                        }
                        modified_taskprogress.push(taskobj);
                    }

                    var activityprogress_modified = [];
                    var activityprogrs_server = responseJson.activityprogress;
                    var len = activityprogrs_server.length;
                    var currbadge = "";
                    var badgechangekey = "Badge Change";

                    activityprogrs_server.sort(function (a, b) {
                        return parseFloat(a.timestmap) - parseFloat(b.timestmap);
                    });

                    //once badges updated  on task progrss update from backend we can remove this loop.

                    for (var i = 0; i < len; i++) {
                        var actvty_obj = {};
                        actvty_obj["key"] = i + "";
                        actvty_obj["taskheading"] = activityprogrs_server[i].taskheading;
                        actvty_obj["date"] = commons.format_string_date(activityprogrs_server[i].timestmap, 'YYYYMMDDHHmmss', 'MMM DD hh:mm a');
                        actvty_obj["badge"] = currbadge;
                        actvty_obj["reachednewlevel"] = false;

                        if (activityprogrs_server[i].hasOwnProperty("reachednewlevel") || actvty_obj["taskheading"].toUpperCase() == badgechangekey.toUpperCase()) {
                            currbadge = ui.getnextbadge(currbadge);
                            actvty_obj["reachednewlevel"] = true;
                            actvty_obj["badge"] = currbadge
                            actvty_obj["taskheading"] = "You have achieved " + currbadge.toUpperCase() + " Status!";
                        }
                        activityprogress_modified.push(actvty_obj);
                    }

                    activityprogress_modified.reverse();

                    this.setState({
                        taskprogrss: modified_taskprogress,
                        timeline: activityprogress_modified,
                        currentbadge: badge,
                        coins_collected: coins,
                        all_coins_collected: allCoinCount,
                        coins_to_nextbadge: points_nextbadge,
                        nextbadge: nextbadge,
                    })

                })
                .catch((error) => {
                    console.log(error);
                });

            this.setState({
                Username: Username,
                firstname: firstname,
                userimage: uri,
                loading: false
            })
            this.refs.loaderRef.hide();
        }
        else {
            this.setState({ offlineFlag: true });
        }
    }
    offlineFunc() {
        this.setState({ offlineFlag: false });
        this.props.setNav('Home');
    }
    render() {
        var windowProp = Dimensions.get('window');
        var winwidth = windowProp.width;
        return (
            <View style={{ flex: 1 }}>
                {uiCommons.loginFlowDialog(this)}
                <Modal
                    isVisible={this.state.statusinfo}
                    style={{ flex: 1 }}
                    swipeDirection="right"
                    animationIn="fadeIn"
                    onBackdropPress={() => this.setState({ statusinfo: false })}
                    animationOut="fadeOut">
                    <View style={{ borderRadius: 3, backgroundColor: '#FFFFFF', height: 420 }}>
                        <View style={{ backgroundColor: "#006BBD", height: '13%', width: '100%', alignItems: "center", justifyContent: "center" }}>
                            <Text allowFontScaling={false} style={{ fontSize: 24, color: "white", fontFamily: 'Roboto-Bold' }}>Status Level</Text>
                        </View>
                        <View style={{ alignItems: "flex-start", marginLeft: '8%', marginRight: '8%', marginTop: '5%', marginBottom: '5%' }} >
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#D99679", fontFamily: 'Roboto-Bold' }}>Bronze</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#D99679" }}>Earned 10+  coins in a year</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#BFBFBF", fontFamily: 'Roboto-Bold' }}>Silver </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#BFBFBF" }}>Earned 25+ coins in a year</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>

                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#FFBB00", fontFamily: 'Roboto-Bold' }}>Gold </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#FFBB00" }}>Earned 50+  coins in a year</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#444444", fontFamily: 'Roboto-Bold' }}  >Platinum </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#444444" }}>Earned 100+ coins in a year</Text>
                        </View>
                    </View>
                </Modal>
                <LoaderNew
                    ref={"loaderRef"} />

                {uiCommons.offlineDialog(this)}
                {statusDialog.renderStatusDialog(this)}

                <View style={{ width: '100%', height: 130, backgroundColor: this.getsliderbgcolor(), flexDirection: "row" }}>
                    <Image source={this.state.userimage} style={{ marginLeft: 8, alignSelf: "center", height: 50, width: 50, borderRadius: 40 }} />
                    <View style={{ flexDirection: "column", marginLeft: 9 }}>
                        <View style={{ flexDirection: "row", marginTop: 20 }}>
                            <View style={{ width: winwidth > 350 ? '62%' : '58%' }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontSize: 14, fontFamily: 'Roboto-Bold' }} numberOfLines={1}>Hi, {this.state.firstname}</Text>
                            </View>
                            <View style={{ width: '30%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 13, color: "white", marginLeft: '4%', textDecorationLine: 'underline', alignSelf: 'center', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} onPress={() => this.setState({ statusinfo: true })}>Status Level</Text>
                            </View>
                        </View>

                        {commons.renderIf(this.state.currentbadge != "PLATINUM",
                            <View>
                                <View style={{ marginTop: 10, width: winwidth - 95 }}>
                                    <Slider
                                        minimumValue={0}
                                        maximumValue={parseInt(this.state.coins_to_nextbadge)}
                                        step={1}
                                        value={parseInt(this.state.coins_collected)}
                                        disabled={true}
                                        trackStyle={customStyles6.track1}
                                        thumbStyle={customStyles6.thumb}
                                        minimumTrackTintColor={this.getmainslidercolor()}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", paddingBottom: 0 }}>
                                    <Text allowFontScaling={false} style={{ width: winwidth > 350 ? '23%' : '25%', color: this.getmainslidercolor(this.state.currentbadge), fontSize: 13, fontFamily: 'Roboto-Bold' }}>{this.state.currentbadge}</Text>
                                    <Text allowFontScaling={false} style={{ marginLeft: winwidth > 350 ? '11%' : '5%', marginRight: this.state.nextbadge != 'PLATINUM' ? '5%' : '-1%', color: "#FFFFFF", fontSize: 13 }}>{this.state.all_coins_collected}/{this.state.coins_to_nextbadge} Coins</Text>
                                    <Text allowFontScaling={false} style={{ marginRight: '1%', marginLeft: winwidth > 350 ? '11%' : '7%', color: "#7EB4DD", fontSize: 13, fontFamily: 'Roboto-Bold' }}>{this.state.nextbadge}</Text>
                                </View>
                            </View>
                        )}
                        {commons.renderIf(this.state.currentbadge == "PLATINUM",
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 25, marginLeft: 10 }}>
                                <Text allowFontScaling={false} style={{ width: 60, color: "white", fontSize: 12 }}>{this.state.currentbadge}</Text>
                                <Text allowFontScaling={false} style={{ marginLeft: '15%', color: "white", fontSize: 12 }}>{this.state.coins_collected} points</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ width: '100%', height: 80, backgroundColor: "#3F97DC", flexDirection: "row" }}>
                    <View style={{ width: '60%', flexDirection: "column", marginLeft: '5%', marginTop: 5 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 15, color: "white" }}>You have</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Image style={{ marginTop: 5, width: 30, height: 30 }} source={require("../assets/aprrow_coin.png")} />
                            <Text allowFontScaling={false} style={{ marginTop: 3, marginLeft: 3, fontSize: winwidth > 350 ? 25 : 22, color: "white", fontFamily: 'Roboto-Bold' }}>{this.state.coins_collected}</Text>
                            <Text allowFontScaling={false} style={{ marginTop: 10, marginLeft: 3, fontSize: winwidth > 350 ? 18 : 15, color: "white", fontFamily: 'Roboto-Bold' }}>APRROW Coins</Text>
                        </View>
                    </View>

                    <View style={{ width: '30%', flexDirection: 'row', flex: 1, marginTop: '2%', marginLeft: '1%', marginRight: '3%', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text allowFontScaling={false} onPress={() => {
                            //Mixpannel use now
                            var MixPanl_tocken = AWSConfig.mixpanel_token;
                            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                                Mixpanel.default.track("Use Now");
                            });
                            this.gotostore()
                        }} style={{ marginLeft: 3, fontFamily: 'Roboto-Bold', fontSize: 20, color: "#FFBB00" }}>USE NOW </Text>
                        <Image style={{ height: 15, width: 12 }} source={require("../assets/arrow_down_gold.png")}></Image>
                    </View>
                </View>
                <Tabs >
                    {/* First tab */}
                    <View title="PROGRESS" style={{ flex: 1, backgroundColor: "white" }}>
                        <FlatList
                            data={this.state.taskprogrss}
                            extraData={this.state}
                            renderItem={({ item }) =>
                                <View style={{ marginTop: 15, marginBottom: 15, marginLeft: 5, flexDirection: "column" }}>
                                    {commons.renderIf(!item.eligibleforcoin,
                                        <View style={{}}>
                                            <View style={{}}>
                                                <View syle={{ flexDirection: "row" }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 17, color: "black" }}>{item.taskheading}</Text>
                                                </View>
                                                <View syle={{ flexDirection: "row" }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 13, width: '90%', marginLeft: -3, textAlign: 'justify' }} > {item.taskdescription}</Text>
                                                    <Image style={{ marginTop: -20, marginRight: 8, alignSelf: "flex-end", width: 30, height: 30 }} source={require("../assets/aprrow_coin.png")} />
                                                </View>
                                            </View>
                                            <View style={{ marginTop: 2, width: '97%' }}>
                                                <Slider
                                                    minimumValue={0}
                                                    maximumValue={parseInt(item.pointsrequired)}
                                                    step={1}
                                                    value={parseInt(item.pointscollected)}
                                                    disabled={true}
                                                    trackStyle={customStyles6.track}
                                                    thumbStyle={customStyles6.thumb}
                                                    minimumTrackTintColor='#0077FF'/>

                                            </View>
                                            <View style={{ flexDirection: "row", alignSelf: "center" }}>
                                                <Text allowFontScaling={false} style={{ color: "#0077FF", fontSize: 16, marginTop: -10 }}>{item.pointscollected}</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignSelf: "flex-end", marginTop: -20, marginRight: 10 }}>
                                                <Text allowFontScaling={false} style={{ fontSize: 16 }}>{item.pointsrequired}</Text>
                                            </View>
                                            <View style={{ width: '100%', height: 1, backgroundColor: "#BFBFBF" }} />
                                        </View>)}

                                    {commons.renderIf(item.eligibleforcoin,
                                        <View>
                                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                                <View style={{ width: '55%', marginLeft: '5%', alignContent: 'center' }}>
                                                    <Text allowFontScaling={false} style={{ color: "#1aad39", fontSize: 22, fontFamily: 'Roboto-Bold' }}>Congratulations</Text>
                                                    <Text allowFontScaling={false} style={{ fontSize: 16, color: 'black', marginTop: '2%', marginLeft: '2%' }}>{item.taskheading} Reward</Text>
                                                    <View style={{ flexDirection: "row", marginTop: '2%', alignItems: 'center', marginLeft: '16%' }}>
                                                        <Image style={{ width: 30, height: 30 }} source={require("../assets/aprrow_coin.png")} />
                                                        <Text allowFontScaling={false} style={{ fontSize: 18, marginLeft: 3 }}>x{item.numberofcoins}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ width: '45%', marginTop: '5%' }}>
                                                    <TouchableOpacity style={{ height: 45, width: 100, backgroundColor: "#1aad39", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.collectcoins(item)}>
                                                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>COLLECT</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={{ width: '100%', height: 1, marginTop: '5%', backgroundColor: "#BFBFBF" }} />
                                        </View>
                                    )}
                                </View>
                            }>
                        </FlatList>
                    </View>
                    <View title="ACTIVITIES" style={{ flex: 1, backgroundColor: "white" }}>
                        <FlatList
                            data={this.state.timeline}
                            style={{ flex: 1, marginTop: 35 }}
                            renderItem={({ item }) =>
                                <View style={{ marginLeft: 25, flexDirection: "row" }}>
                                    <View style={{ flexDirection: "column" }}>
                                        <Image style={{ marginLeft: this.getmargin(item.reachednewlevel) }} source={u.getimagefortimeline(item.badge, item.reachednewlevel, false)} />
                                        <Image style={{ marginLeft: 21 }} source={u.getimagefortimeline(item.badge, item.reachednewlevel, true)} />
                                    </View>
                                    <View style={{ flexDirection: "column", marginLeft: '2%' }}>
                                        <Text allowFontScaling={false} style={{ fontSize: item.taskheading.length > 15 ? 17 : 18 }} numberOfLines={2}>{item.taskheading}</Text>
                                        <Text allowFontScaling={false}>{item.date}</Text>
                                    </View>
                                </View>}>
                        </FlatList>
                    </View>
                </Tabs>
            </View >
        )
    }
}