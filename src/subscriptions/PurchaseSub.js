import React from 'react';
import {
    AsyncStorage,
    Text,         // Renders text
    View, Dimensions,
    TouchableOpacity,
    Image, TextInput,
    FlatList, Button,
    Linking         // Container component
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Modal from "react-native-modal";
import CheckBox from 'react-native-check-box';
import { Dialog } from 'react-native-simple-dialogs';
import device_style from '../styles/device.style';
import commons from '../commons';
import uicommons from '../ui.commons';
//import Moment from 'react-moment';
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require("../config/AWSConfig.json");
import { styles, dialogbox } from './styles';

export default class PurchaseSub extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            dlist: [],
            dlist2: [],
            loading: false,
            ref: false,
            ViewColor: 'white',
            refresh: false,
            notexpand: 'none',
            notcompre: 'flex',
            dw: Dimensions.get('window').width,
            dh: Dimensions.get('window').height,
            purFlag: 'flex',
            purFlag11: 'none',
            purFlag12: 'none',
            purFlag13: 'none',
            purStax: [],
            purStax1: [],
            isModalVisible: false,
            btnColor: '#919396',
            confirm_purchase: false,
            confirm_password: false,
            showsearch: false,
            d_orderId: '',
            d_boughtOn: '',
            d_price: '',
            ddl_defaultVal: 'Last 30 days',
            show_cancel: true,
            purc_Stax_Data: []

        }
        this.openLink = this.openLink.bind(this);
        this.openLink1 = this.openLink1.bind(this);
    }
    static navigationOptions = ({ navigation }) => {
        const { goBack } = navigation;

        let title = "Purchases & Subscriptions";
        let headerStyle = { backgroundColor: "#006BBD" };
        let headerTitleStyle = {
            color: "white",
            fontFamily: 'Roboto-Bold', fontWeight: '200',
            marginLeft: 0,
            fontSize: 18
        };
        let headerTitleAllowFontScaling = false;
        let headerTintColor = "white";
        let headerLeft = uicommons.headerLeft(goBack);

        return {
            title,
            headerStyle,
            headerTitleStyle,
            headerTintColor,
            headerLeft,
            headerTitleAllowFontScaling
        };
    };
    componentWillUnmount() {

        Linking.removeEventListener('url', this.openLink1);
    }
    async openLink1() {
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
                        //commons.replaceScreen(this, 'bottom_menu', {});
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

    async  componentDidMount() {

        var Mixpannel_tocken = AWSConfig.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
            Mixpanel.default.track("My Purchases");
        });
        Linking.getInitialURL().then(async (url) => {
            if (url)
                this.openLink(url);
            else Linking.addEventListener('url', this.openLink1);
        });

        purc_Stax_Data = []
        await this.getpurchasedata(0);
    }

    async getpurchasedata(index) {
        var from_date = 0;
        console.log("TestJSON1123 : " + index);
        if (index == 0) {
            from_date = commons.getDateDifference(30);
        }
        else if (index == 1) {
            from_date = commons.getDateDifference(180);
        }
        else if (index == 2) {
            from_date = commons.getDateDifference1();
        }
        else {
            from_date = commons.getDateDifference2();
        }
        var operation = "userPurchaseList"
        var username = await AsyncStorage.getItem("username");
        //  var username='sajin.joseph@dhisigma.com';

        console.log("from_date" + username);

        await fetch('' + AWSConfig.path + AWSConfig.stage + 'rewardmanagement', {
            method: 'POST',
            headers: commons.getHeader(),
            body: JSON.stringify({
                "operation": operation,

                "comDate": from_date,
                "userid": username
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                purStaxDet = [];
                if (responseJson.hasOwnProperty("data") && responseJson.data.length > 0) {
                    for (var i = 0; i < responseJson.data.length; i++) {
                        var purStaxDetOb = {};

                        purStaxDetOb["key"] = i + "";
                        purStaxDetOb["d_staxName"] = responseJson.data[i].staxname;
                        purStaxDetOb["d_orderID"] = responseJson.data[i].orderid;

                        var pdate = await commons.format_string_date(responseJson.data[i].Timestamp, 'YYYYMMDDHHmmssSSS', 'MM/DD/YYYY')
                        purStaxDetOb["d_boughtOn"] = pdate;
                        if (responseJson.data[i].purchasetype == "payment") {
                            purStaxDetOb["d_price"] = "$ " + responseJson.data[i].staxprice;
                        }
                        else {
                            purStaxDetOb["d_price"] = "C " + responseJson.data[i].staxcoins;
                        }
                        purStaxDetOb["g_username"] = "UNAME";
                        console.log("tval : " + i % 2 + " -" + i)
                        if ((i % 2) == 0) {
                            //  alert("true");
                            purStaxDetOb["color"] = "#EFEFEF";
                        }
                        else {
                            // alert("false");
                            purStaxDetOb["color"] = "#FFFFFF";
                        }
                        purStaxDet.push(purStaxDetOb);


                    }
                    console.log("JsonVal : " + JSON.stringify(purStaxDet))
                    this.setState({ purStax: purStaxDet })
                }
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.error(error);
            });
    }

    async purchaseDataBinding() {
        purStaxDet = [];

        for (var i = 1; i < 9; i++) {
            var purStaxDetOb = {};

            purStaxDetOb["key"] = i + "";
            purStaxDetOb["d_staxName"] = "StaX Dallas";
            purStaxDetOb["d_orderID"] = "12345678";
            purStaxDetOb["d_boughtOn"] = "12/12/18";
            purStaxDetOb["d_price"] = "999";



            purStaxDetOb["g_username"] = "UNAME";
            // this.setState({showsearch:true});
            console.log("tval : " + i % 2 + " -" + i)
            if ((i % 2) == 0) {
                purStaxDetOb["color"] = "#EFEFEF";
            }
            else {
                purStaxDetOb["color"] = "#FFFFFF";
            }
            //  alert(JSON.stringify(purStaxDetOb))
            purStaxDet.push(purStaxDetOb);
        }
        console.log("JsonVal : " + JSON.stringify(purStaxDet))
        this.setState({ purStax: purStaxDet })

    }
    expand(tval) {
        if (tval == 1) {
            this.setState({ purFlag11: 'flex' });
            this.setState({ purFlag: 'none' });
            this.setState({ purFlag12: 'none' });
            this.setState({ purFlag13: 'none' });
        }
        else if (tval == 2) {
            this.setState({ purFlag12: 'flex' });
            this.setState({ purFlag: 'none' });
            this.setState({ purFlag11: 'none' });
            this.setState({ purFlag13: 'none' });
        }
        else {
            this.setState({ purFlag13: 'flex' });
            this.setState({ purFlag: 'none' });
            this.setState({ purFlag12: 'none' });
            this.setState({ purFlag11: 'none' });
        }
    }
    compress(tval) {

        if (tval == 1) {
            this.setState({ purFlag: 'flex' });

            this.setState({ purFlag11: 'none' });
            this.setState({ purFlag12: 'none' });
            this.setState({ purFlag13: 'none' });


        }
        else if (tval == 2) {
            this.setState({ purFlag: 'flex' });
            this.setState({ purFlag11: 'none' });
            this.setState({ purFlag12: 'none' });
            this.setState({ purFlag13: 'none' });



        }
        else {
            this.setState({ purFlag: 'flex' });
            this.setState({ purFlag11: 'none' });
            this.setState({ purFlag12: 'none' });

            this.setState({ purFlag13: 'none' });

        }
    }
    hidesearch() {
        if (this.state.showsearch) {
            this.setState({
                showsearch: false
            })
        }
        this.setState({
            showsearch: false
        });
    }
    async  login() {
        this.setState({ confirm_purchase: true })

    }
    async onClick() {
        this.setState({ btnColor: '#0065B2' });


    }
    async cancel_Subscription() {
        this.setState({ confirm_password: true })
        this.setState({ confirm_purchase: false })

    }
    _toggleModal = () =>
        this.setState({ isModalVisible: !this.state.isModalVisible });
    async toggleModal1(item) {
        // alert(JSON.stringify(item));
        this.setState({ isModalVisible: !this.state.isModalVisible });
        this.setState({
            d_staxName: item.d_staxName,
            d_price: item.d_price,
            d_orderId: item.d_orderID,
            d_boughtOn: item.d_boughtOn,
        });

    }
    _dropdown_2_renderRow(rowData) {
        return (
            <TouchableOpacity>
                <View style={{ width: '100%', marginTop: 12, alignSelf: 'center' }}>
                    <View style={{ flex: 1, flexDirection: "row", marginTop: 2, justifyContent: 'center' }}>

                        <Text allowFontScaling={false} style={{ color: '#3F97DC', textAlign: 'center', justifyContent: 'center', marginTop: 3 }}>
                            {rowData}            </Text>
                    </View>

                </View>
            </TouchableOpacity>
        );
    }
    _adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = '40%'
        style.height = '25%';
        //  style.left = 0;

        return style;
    }
    _renderSeparator(rowID) {
        if (rowID == this.state.categories.length - 1) return;
        let key = `spr_${rowID}`;
        return (<View style={{
            height: 0,
        }}
            key={key}
        />);
    }

    render() {
        //  const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
        return (
            <View style={styles.container}>
                <View style={{ display: this.state.purFlag }}>
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh / 8, justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_credit_card_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 4 }}>Purchases </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>

                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh / 8, justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(2)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_description_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Purchased App Features </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>

                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh / 8, justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(3)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_rss_feed_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>App Subscriptions </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>


                </View>
                {/*Each1*/}
                <View style={{ display: this.state.purFlag11 }} >
                    {/*head1*/}
                    <View style={{ width: '100%', height: this.state.dh * (5 / 28), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 10, paddingLeft: 6 }} onPress={() => this.compress(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_credit_card_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingLeft: 4 }}>Purchases </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_white.png")} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.box_view_sortby}>
                            <View><Text allowFontScaling={false} style={{ color: '#FFCB08', fontSize: 13, fontFamily: 'Roboto-Bold' }} >Sort by</Text>
                            </View>

                            <ModalDropdown options={['Last 30 days', 'Last 6 months', 'This year', 'Last year']}
                                textStyle={{ color: '#FFCB08', fontSize: 12, paddingLeft: 10, fontFamily: 'Roboto-Bold' }}
                                defaultIndex={-1}

                                defaultValue={this.state.ddl_defaultVal}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx) => this.getpurchasedata(idx)}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                            />
                            <View style={{ paddingLeft: 5 }}>
                                <Image style={{ height: 5, width: 10, paddingLeft: 5 }} source={require("../assets/arrow_down_orange.png")} />
                            </View>
                        </View>
                    </View>
                    {/*body1*/}
                    <View>
                        <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', height: this.state.dh * (1 / 14), justifyContent: 'center', backgroundColor: '#ffffff', paddingBottom: 15 }}>

                            <View style={{ width: '40%', paddingLeft: 3 }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Description</Text>
                            </View>
                            <View style={{ width: '25%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Date</Text>
                            </View>
                            <View style={{ width: '25%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Price</Text>
                            </View>

                        </View>
                    </View>
                    <View style={{ width: '100%', height: this.state.dh * (6 / 14) }}>
                        <View>
                            <Modal isVisible={this.state.isModalVisible}
                                style={[styles.bottomModal, { marginTop: 185 }, { marginLeft: this.state.dw * (4 / 14) }, { paddingBottom: this.state.dh * (5 / 14) }]}
                            >
                                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 20 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={{ paddingLeft: 20, fontFamily: 'Roboto-Bold' }}>{this.state.d_staxName}</Text>
                                        </View>
                                        <View style={{ paddingLeft: this.state.dw * (4 / 14) }}>
                                            <TouchableOpacity onPress={this._toggleModal}>
                                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_info_blue_small.png")} />
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 5 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={[styles.dialog_text1, {}]}>Order Id:</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.dialog_text2, { fontFamily: 'Roboto-Bold' }]}>{this.state.d_orderId}</Text>

                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 2 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={[styles.dialog_text1, { fontFamily: 'Roboto-Bold' }]}>Bought On:</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.dialog_text2, { fontFamily: 'Roboto-Bold' }]}>{this.state.d_boughtOn}</Text>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 2, paddingBottom: 20 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={[styles.dialog_text3, { paddingLeft: 20, fontFamily: 'Roboto-Bold' }]}>Price- </Text>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.dialog_text3, { fontFamily: 'Roboto-Bold' }]}>{this.state.d_price}</Text>

                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', paddingTop: 2, paddingBottom: 2 }}>
                                        <View>
                                            <Text allowFontScaling={false} style={[styles.dialog_text4, { fontFamily: 'Roboto-Bold' }]}>Cancel purchase within</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={[styles.dialog_text5, { fontFamily: 'Roboto-Bold' }]}> 30 days </Text>
                                        {commons.renderIf(this.state.show_cancel,
                                            <TouchableOpacity onPress={this._toggleModal}>

                                                <Image style={{ height: 15, width: 15 }} source={require("../assets/icon_play_arrow_black.png")} />
                                            </TouchableOpacity>)}
                                    </View>
                                </View>
                            </Modal>
                        </View>
                        <FlatList style={{ flex: 1 }}
                            data={this.state.purStax}
                            extraData={this.state}
                            style={{ backgroundColor: 'white', width: '100%' }}
                            refreshing={this.state.refresh}
                            renderItem={({ item }) =>
                                <View style={{ width: '100%', height: this.state.dh * (1 / 14), backgroundColor: item.color }}>

                                    <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: item.color }}>

                                        <View style={{ width: '40%', paddingLeft: 15 }}>
                                            <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#006BBC' }}>{item.d_staxName}</Text>
                                        </View>
                                        <View style={{ width: '25%' }}>
                                            <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#295A75' }}>{item.d_boughtOn}</Text>
                                        </View>
                                        <View style={{ width: '25%' }}>
                                            <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#295A75', paddingLeft: '20%' }}>{item.d_price}</Text>
                                        </View>
                                        <View style={{ width: '10%' }}>
                                            <TouchableOpacity style={{ flexDirection: 'row', paddingTop: 10, paddingLeft: 6 }} onPress={() => this.toggleModal1(item)}>
                                                <View style={{ width: '10%' }}>
                                                    <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_info_blue_small.png")} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {commons.renderIf(this.state.showsearch,
                                        <View style={{ flex: 1, flexDirection: 'row', width: '100%', paddingLeft: 5, paddingBottom: 1, alignItems: 'center' }}>
                                            <Image style={{ height: 9, width: 9 }} source={require("../assets/gift_blue.png")} />
                                            <Text allowFontScaling={false} style={{ fontSize: 10, fontFamily: 'Roboto-Bold', color: '#295A75' }}> Gift sent to {item.g_username}</Text>
                                        </View>
                                    )}
                                </View>
                            } />

                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh * (2 / 14), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(2)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_description_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>App Subscriptions </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh * (2 / 14), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(3)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_rss_feed_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>App Subscriptions </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>



                </View>
                {/*Each2*/}
                <View style={{ display: this.state.purFlag12 }} >
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh / 8, justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_credit_card_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Purchases </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>


                    <View style={{ width: '100%', height: this.state.dh * (3 / 14), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', paddingTop: 20, paddingBottom: 10, paddingLeft: 6 }} onPress={() => this.compress(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_description_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingLeft: 4 }}>Purchased App Features </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_white.png")} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.box_view_sortby}>
                            <View><Text allowFontScaling={false} style={{ color: '#FFCB08', fontSize: 13, fontFamily: 'Roboto-Bold' }} >Sort by</Text>
                            </View>

                            <ModalDropdown options={['Last 30 days', 'Last 6 months', 'This year', 'Last year']}
                                textStyle={{ color: '#FFCB08', fontSize: 12, paddingLeft: 10, fontFamily: 'Roboto-Bold' }}
                                defaultIndex={-1}
                                defaultValue={this.state.ddl_defaultVal}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx) => this.getpurchasedata(idx)}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                            />
                            <View style={{ paddingLeft: 5 }}>
                                <Image style={{ height: 5, width: 10, paddingLeft: 5 }} source={require("../assets/arrow_down_orange.png")} />
                            </View>
                        </View>
                    </View>
                    {/*end*/}

                    {/*body2*/}
                    <View>
                        <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', height: this.state.dh * (1 / 14), justifyContent: 'center', backgroundColor: '#ffffff', paddingBottom: 15 }}>
                            <View style={{ width: '100%', paddingLeft: 5 }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Description</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh * (6 / 14), justifyContent: 'center', paddingTop: 10, backgroundColor: 'white' }}>
                        <FlatList style={{ flex: 1 }}
                            data={this.state.purStax1}
                            extraData={this.state}
                            style={{ backgroundColor: 'white', width: '100%' }}
                            refreshing={this.state.refresh}
                            // onRefresh={()=>this.onRefresh()}
                            renderItem={({ item }) =>
                                <View style={{ flex: 1, flexDirection: 'row', width: '100%', height: this.state.dh * (1 / 18), backgroundColor: item.color }}>
                                    <View style={{ width: '100%', paddingLeft: 2 }}>
                                        <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#006BBC', paddingBottom: 5 }}>List of purchased features</Text>
                                    </View>
                                </View>
                            } />
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh / 8, justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(3)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_rss_feed_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>App Subscriptions </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>



                </View>
                {/*Each3*/}

                {/*Dialogue-1*/}
                <Dialog
                    visible={this.state.confirm_purchase}
                    onTouchOutside={() => this.setState({ confirm_purchase: false })}
                    animation='fade' >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 5, fontWeight: '300', textAlign: 'center' }]}>Do you want to cancel your subcription to XYZ feature?</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontFamily: 'Roboto-Bold', textAlign: 'center' }]}>{this.state.stackname}</Text>

                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ confirm_purchase: false }) }}>NO</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this.cancel_Subscription()}>YES</Text>
                        </View>
                    </View>
                </Dialog>

                {/*Dialogue-2*/}

                <Dialog
                    visible={this.state.confirm_password}
                    onTouchOutside={() => this.setState({ confirm_purchase: false })}
                    animation='fade'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 5, fontWeight: '300', textAlign: 'center' }]}>APRROW Password</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: 'bold', textAlign: 'center' }]}>{this.state.stackname}</Text>
                        <TextInput
                            value={this.state.device}
                            style={dialogbox.dialog_textinput}
                            underlineColorAndroid='transparent'
                            onChangeText={(device) => this.setState({ device })}
                        ></TextInput>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ confirm_password: false }) }}>CANCEL</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this.cancel_Subscription()}>OK</Text>
                        </View>
                    </View>
                </Dialog>

                <View style={{ display: this.state.purFlag13 }} >
                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh * (3 / 28), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_credit_card_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Purchases </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>

                    <View style={{ width: '100%', alignItems: 'center', height: this.state.dh * (3 / 28), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.expand(2)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_description_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Purchased App features </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_white.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center', height: 3, justifyContent: 'center', backgroundColor: 'white' }}></View>

                    <View style={{ width: '100%', height: this.state.dh * (5 / 28), justifyContent: 'center', paddingTop: 10, backgroundColor: '#3F97DC' }}>
                        <TouchableOpacity style={{ flexDirection: 'row', paddingTop: 20, paddingBottom: 10, paddingLeft: 6 }} onPress={() => this.compress(1)}>
                            <View style={{ width: '10%' }}>
                                <Image style={{ height: 25, width: 25 }} source={require("../assets/icon_rss_feed_white.png")} />
                            </View>
                            <View style={{ width: '80%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingLeft: 4 }}>App Subscriptions </Text>
                            </View>
                            <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_white.png")} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.box_view_sortby}>
                            <View><Text allowFontScaling={false} style={{ color: '#FFCB08', fontSize: 13, fontFamily: 'Roboto-Bold' }} >Sort by</Text></View>
                            <ModalDropdown options={['Last 30 days', 'Last 6 months', 'This year', 'Last year']}
                                textStyle={{ color: '#FFCB08', fontSize: 12, paddingLeft: 10, fontFamily: 'Roboto-Bold' }}
                                defaultIndex={-1}
                                defaultValue={this.state.ddl_defaultVal}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx) => this.getpurchasedata(idx)}
                                adjustFrame={style => this._adjustFrame(style)}
                                renderRow={this._dropdown_2_renderRow.bind(this)} />
                            <View style={{ paddingLeft: 5 }}>
                                <Image style={{ height: 5, width: 10, paddingLeft: 5 }} source={require("../assets/arrow_down_orange.png")} />
                            </View>
                        </View>
                    </View>
                    <View>
                        <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', height: this.state.dh * (1 / 14), justifyContent: 'center', backgroundColor: '#ffffff', paddingBottom: 15 }}>
                            <View style={{ width: '60%', paddingLeft: 5 }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Description</Text>
                            </View>
                            <View style={{ width: '40%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#FFFFFF', paddingBottom: 5 }}>Price</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '100%', height: this.state.dh * (13 / 28) }}>
                        <FlatList style={{ flex: 1 }}
                            data={this.state.purStax1}
                            extraData={this.state}
                            style={{ backgroundColor: 'white', width: '100%' }}
                            refreshing={this.state.refresh}
                            // onRefresh={()=>this.onRefresh()}
                            renderItem={({ item }) =>

                                <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', height: this.state.dh * (1 / 14), backgroundColor: item.color }}>
                                    <View style={{ width: '60%', paddingLeft: 5 }}>
                                        <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#006BBC', paddingBottom: 5 }}>{item.color}</Text>
                                    </View>
                                    <View style={{ width: '20%' }}>
                                        <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto-Bold', color: '#295A75', paddingBottom: 5 }}>{item.date}</Text>
                                    </View>
                                    <View style={{ width: '20%' }}>
                                        <CheckBox
                                            style={{ flex: 1, padding: 10 }}
                                            onClick={() => this.onClick()}
                                            isChecked={item.checked} />
                                    </View>
                                </View>
                            } />
                        <View style={{ paddingLeft: '30%', width: '100%', paddingTop: 10 }}>
                            <View style={{ width: 110, backgroundColor: this.state.btnColor, borderRadius: 3 }}>
                                <Button
                                    color="#ffffff"
                                    title='CANCEL'
                                    onPress={this.login.bind(this)}
                                />
                            </View>
                        </View>
                    </View>
                </View>

            </View>
        );
    }
}