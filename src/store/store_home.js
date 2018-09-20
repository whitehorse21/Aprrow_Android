import React, { Component } from "react";
import { BackHandler, View, TextInput, Dimensions, ScrollView, TouchableOpacity, Image, Text, FlatList, AsyncStorage } from "react-native";
import commons from '../commons';
import uicommons from '../ui.commons';

import LoaderNew from '../utils/LoaderNew';

import ModalDropdown from 'react-native-modal-dropdown';
import Swiper from 'react-native-swiper';
import GestureRecognizer from 'react-native-swipe-gestures';
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require('../config/AWSConfig.json');
var aws_lamda = require('../config/AWSLamdaConfig.json');

export default class storehome extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let title = '';
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        var windowProp = Dimensions.get('window').width;


        let headerLeft = (
            <View>

            </View>

        );

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
                        style={{ width: "100%", borderWidth: 0, color: "FFFFFF" }}
                        allowFontScaling={false}
                        placeholder="Search STAX"
                        placeholderTextColor="#ffffff"
                        onChangeText={(value) => params.setval(value)}
                        onSubmitEditing={() => params.search(false)}
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


        return { title, headerStyle, headerTitleStyle, headerTintColor, headerLeft, headerRight };
    };


    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            categories: [],// ["Home Discover", "Teams", "Celebrities", "Games", "Youtubers", "Cities", "Movies", "Personas", "Favorites"],
            banners: [],
            staxdata: [],
            catgorychoosen: "Home Discover",
            staxdata_categorized: [],
            loading: false,
            username: "",
            last_key_val_mapping: {},
            searchquery: '',
            dh: Dimensions.get('window').height,
            position: 0,
            bannerLength: 0,
            offlineFlag: false,
            bannerDet: [],
            bannerTimeout: 5,
            loadTime: 0,

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    setval(value) {
        this.setState({ searchquery: value })
    }

    async search() {

        if (this.state.catgorychoosen == "Home Discover") {

            await this.catWisestax(this.state.searchquery);
        }
        else {
            await this.categoryselected(this.state.catgorychoosen)
        }
    }
    async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        //  await this.setState({loadTime:1})
        this.RepeatcomponentDidMount();
    }
    async RepeatcomponentDidMount() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Store Home Page");
            });
        } catch (err) {

        }

        var connectionstatus = await commons.isconnected();
        // alert(connectionstatus);
        if (connectionstatus) {
            this.props.navigation.setParams({ setval: this.setval.bind(this) });

            this.refs.loaderRef.show();
            this.props.navigation.setParams({ search: this.search.bind(this) });
            var username = await AsyncStorage.getItem("username");
            this.setState({ loading: true, username: username });

            var urlName = "";
            if (username == null || username == commons.guestuserkey()) {
                urlName = aws_lamda.commenapis;
            }
            else {
                urlName = aws_lamda.categorylistfunctions;
            }


            await fetch('' + AWSConfig.path + AWSConfig.stage + urlName, {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getCategoriesOrder"
                }),
            }).then((response) => response.json())
                .then(async (responseJson) => {

                    responseJson1 = [];
                    responseJson1[0] = "Home Discover";
                    responseJson1[1] = "New";
                    responseJson1[2] = "Favorites";
                    for (var i = 0; i < responseJson.length; i++) {
                        responseJson1.push(responseJson[i]);
                    }
                    // alert(JSON.stringify(responseJson1));
                    this.setState({
                        categories: responseJson1
                    });


                })
                .catch((error) => {
                    console.error(error);
                });

            var urlName1 = "";
            if (username == null || username == commons.guestuserkey()) {
                urlName1 = aws_lamda.commenapis;
            }
            else {
                urlName1 = aws_lamda.contentmanagement;
            }
            //for getting banners

            await fetch('' + AWSConfig.path + AWSConfig.stage + urlName1, {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getAllBannerData"
                }),
            }).then((response) => response.json())
                .then(async (responseJson) => {

                    //alert(JSON.stringify(responseJson));
                    var images = [];
                    var bannerDet = [];
                    for (var i = 0; i < responseJson.length; i++) {
                        images.push(s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.storebanners + "/StoreBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime)
                        // images.push('https://s3-us-west-2.amazonaws.com/www.approw.net/storebanners/StoreBanner_5a741232-50a4-42b9-a57f-238ffb834843.jpg');  
                        var eachBanDet = { "key": "" + i };

                        eachBanDet["staxid"] = responseJson[i].ContentId;
                        eachBanDet["category"] = responseJson[i].Category;
                        eachBanDet["bimage"] = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.storebanners + "/StoreBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime;


                        bannerDet.push(eachBanDet);
                    }

                    // alert(images[0]);
                    this.setState({

                        bannerLength: responseJson.length - 1,
                        banners: images,
                        loading: false,
                        bannerDet: bannerDet


                    });
                    this.refs.loaderRef.hide();


                    // console.log(JSON.stringify(responseJson));
                })
                .catch((error) => {
                    console.error(error);
                });
            //-------------************   cat seraching
            await this.catWisestax("");
        }
        else {
            this.setState({ offlineFlag: true });
        }

    }
    async catWisestax(squery) {
        var username = await AsyncStorage.getItem("username");


        var cats = this.state.categories;
        var cur_staxdata = [];
        var count = 0;
        for (var i = 0; i < cats.length; i++) {
            if (cats[i] == "Favorites" || cats[i] == "Home Discover" || cats[i] == "New")
                continue;

            var urlName2 = "";

            if (username == null || username == commons.guestuserkey()) {
                urlName2 = aws_lamda.commenapis;
            }
            else {
                urlName2 = aws_lamda.contentmanagement;
            }

            await fetch('' + AWSConfig.path + AWSConfig.stage + urlName2, {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getContentList", //"getSingleCategoryList",
                    "category": cats[i],
                    "widgetname": "" + squery,
                    "userid": this.state.username,
                    "LastEvaluatedKey": {}
                }),
            }).then((response) => response.json())
                .then(async (responseJson) => {
                    //  alert(cats[i]+"=> index: "+i);


                    var catstax_obj = {};
                    catstax_obj["category"] = cats[i];
                    catstax_obj["key"] = count;

                    catstax_obj["staxdata"] = [];
                    if (responseJson.hasOwnProperty("data"))
                        catstax_obj["staxdata"] = responseJson.data;

                    for (var j = 0; j < catstax_obj["staxdata"].length; j++) {
                        catstax_obj["staxdata"][j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + catstax_obj["staxdata"][j].staxid + ".jpg" + "?time=" + catstax_obj["staxdata"][j].createtime;
                    }

                    if (catstax_obj["staxdata"].length > 0)
                        cur_staxdata.push(catstax_obj);

                    var last_val_map = this.state.last_key_val_mapping;
                    if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
                        last_val_map[cats[i]] = responseJson.LastEvaluatedKey;
                    }
                    this.setState({
                        staxdata: cur_staxdata,
                        last_key_val_mapping: last_val_map
                    });


                })
                .catch((error) => {
                    console.error(error);
                });
            count++;
        }
    }
    async handleBackButtonClick() {

        this.props.handleBackButtonClick("Store");
        return true;

    }
    componentWillMount() {
    }
    bannerOnclick() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Store Home Page Clicks to Banner");
            });
        } catch (err) {

        }
        var pos = this.state.position;
        var bannerDet = this.state.bannerDet;
        // alert(bannerDet[i].staxid+"  =  ");
        for (i = 0; i < bannerDet.length; i++) {
            if (bannerDet[i].key == pos) {
                //alert(pos);
                const { navigate } = this.props.navigation;
                navigate("store_purchase", user = { "staxid": bannerDet[i].staxid, "category": bannerDet[i].category, "goback": "1" });

                // commons.replaceScreen(this, "store_purchase", user = { "staxid": bannerDet[i].staxid, "category": bannerDet[i].category });
            }
        }


    }

    async categoryselected(value) {

        this.setState({ loading: true });
        this.refs.loaderRef.show();

        if (value == "Home Discover") {

            try {
                var MixPanl_tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                    Mixpanel.default.track("Store Home Page");
                });
            } catch (err) {

            }
            var cats = this.state.categories;
            var cur_staxdata = [];
            var count = 0;
            for (var i = 0; i < cats.length; i++) {
                if (cats[i] == "Favorites" || cats[i] == "Home Discover" || cats[i] == "New")
                    continue;

                await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
                    method: 'POST',
                    headers: commons.getHeader(),
                    body: JSON.stringify({
                        "operation": "getContentList",// "getSingleCategoryList",
                        "category": cats[i],
                        "widgetname": "" + this.state.searchquery,
                        "userid": this.state.username,
                        "LastEvaluatedKey": {}
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {

                        var catstax_obj = {};
                        catstax_obj["category"] = cats[i];
                        catstax_obj["key"] = count;
                        catstax_obj["staxdata"] = responseJson.data;


                        for (var j = 0; j < catstax_obj["staxdata"].length; j++) {
                            catstax_obj["staxdata"][j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + catstax_obj["staxdata"][j].staxid + ".jpg" + "?time=" + catstax_obj["staxdata"][j].createtime;
                        }

                        if (catstax_obj["staxdata"].length > 0)
                            cur_staxdata.push(catstax_obj);

                        var last_val_map = this.state.last_key_val_mapping;
                        if (responseJson.hasOwnProperty("LastEvaluatedKey"))
                            last_val_map[cats[i]] = responseJson.LastEvaluatedKey;



                        this.setState({
                            catgorychoosen: "Home Discover",
                            staxdata: cur_staxdata,
                            staxdata_categorized: [],
                            last_key_val_mapping: last_val_map,
                            loading: false
                        });
                        count++;
                        this.refs.loaderRef.hide();

                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
        else {
            var operation = "getContentList"// "getSingleCategoryList"

            /*if (value == "Favorites")
            {
                operation = "getfavouriteContentList";
            }*/
            try {
                var MixPanl_tocken = AWSConfig.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                    Mixpanel.default.track(value);
                });
            } catch (err) {

            }
            if (value == "New") {

                var urlName = "";
                if (this.state.username == null || this.state.username == commons.guestuserkey()) {
                    urlName = aws_lamda.commenapis;
                }
                else {
                    urlName = aws_lamda.contentmanagement;
                }
                await fetch('' + AWSConfig.path + AWSConfig.stage + urlName, {
                    method: 'POST',
                    headers: commons.getHeader(),
                    body: JSON.stringify({
                        "operation": "getLatestStax"
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        var resp = [];

                        // if (value == "Favorites")
                        resp = responseJson;
                        for (var j = 0; j < resp.length; j++) {
                            resp[j].key = responseJson[j].contentid;
                            resp[j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + responseJson[j].contentid + ".jpg" + "?time=" + resp[j].createtime;
                        }
                        this.setState({
                            loading: false,
                            staxdata_categorized: resp,
                            catgorychoosen: value
                        });
                        this.refs.loaderRef.hide();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            else {
                if (value == "Favorites") {
                    operation = "getfavouriteContentList";
                }

                await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
                    method: 'POST',
                    headers: commons.getHeader(),
                    body: JSON.stringify({
                        "operation": operation,
                        "category": value,
                        "widgetname": "" + this.state.searchquery,
                        "userid": this.state.username,
                        "LastEvaluatedKey": {}
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        var last_val_map = this.state.last_key_val_mapping;
                        if (responseJson.hasOwnProperty("LastEvaluatedKey"))
                            last_val_map[value] = responseJson.LastEvaluatedKey;
                        else
                            delete last_val_map[value];

                        var resp = [];

                        if (value == "Favorites")
                            resp = responseJson;
                        else
                            resp = responseJson.data;

                        for (var j = 0; j < resp.length; j++) {
                            resp[j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + resp[j].staxid + ".jpg" + "?time=" + resp[j].createtime;
                        }
                        this.setState({
                            loading: false,
                            staxdata_categorized: resp,
                            catgorychoosen: value
                        });
                        this.refs.loaderRef.hide();
                        // console.log(JSON.stringify(responseJson));
                    })
                    .catch((error) => {
                        this.setState({ loading: false });
                        this.refs.loaderRef.hide();

                        console.error(error);
                    });
            }
        }


    }



    getcaticon(catname) {
        //            categories: ["Home Store", "Favorites", "Teams", "Celebreties", "Games", "Youtubers", "Cities", "Movies", "Persons"],

        switch (catname) {
            case "Home Discover":
                return require("../assets/icon_home_blue_px24.png");

            case "Home Store":
                return require("../assets/icon_home_blue_px24.png");

            case "Favorites":
                return require("../assets/icon_favorities_blue_24px.png");

            case "Teams":
                return require("../assets/icon_personas_blue_24px.png");

            case "Celebrities":
                return require("../assets/icon_celebrities_blue_24px.png");

            case "Games":
                return require("../assets/icon_games_blue_24px.png");

            case "Youtubers":
                return require("../assets/icon_youtubers_blue_24px.png");

            case "Cities":
                return require("../assets/icon_cities_blue_24px.png");

            case "Movies":
                return require("../assets/icon_movies_blue_24px.png");


            case "Personas":
                return require("../assets/icon_personas_blue_24px.png");
        }



    }
    _dropdown_2_renderRow(rowData) {

        return (
            <TouchableOpacity  >
                <View style={{ flexDirection: "row", backgroundColor: "#ffffff", marginTop: '6%', marginLeft: '4%', alignItems: "center", justifyContent: "center", width: "100%" }}>

                    <View style={{ width: "40%", marginLeft: 15 }}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Roboto-Bold', color: "black" }}>
                            {rowData}
                        </Text>
                    </View>

                </View>
            </TouchableOpacity>
        );
    }

    _adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = '100%'
        style.height = '75%';
        style.left = 0;

        return style;
    }


    _indexChange() {

    }

    onclickstack(item) {
        //alert(JSON.stringify(item))
        const { navigate } = this.props.navigation;
        //commons.replaceScreen(this, "store_purchase", user = { "staxid": item.key, "category": item.category });
        navigate("store_purchase", user = { "staxid": item.key, "category": item.category, "goback": "1" });

        //  navigate("store_purchase", { "staxid": item.key, "category": item.category });

    }

    async  loadmore(index, category) {
        //  alert("index:"+index+" category:"+category)
        var lastkey = this.state.last_key_val_mapping[category];
        this.setState({ loading: true });
        this.refs.loaderRef.show();

        var selected_category = this.state.catgorychoosen;

        var urlName2 = "";
        if (this.state.username == null || this.state.username == commons.guestuserkey()) {
            urlName2 = aws_lamda.commenapis;
        }
        else {
            urlName2 = aws_lamda.contentmanagement;
        }

        //alert(selected_category);
        await fetch('' + AWSConfig.path + AWSConfig.stage + urlName2, {
            method: 'POST',
            headers: commons.getHeader(),
            body: JSON.stringify({
                "operation": "getSingleCategoryList",
                "category": category,
                "LastEvaluatedKey": lastkey,
                "widgetname": "",
                "userid": this.state.username
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                var staxarr = responseJson.data;
                var lastkeymapping = this.state.last_key_val_mapping;
                var staxdt = this.state.staxdata;
                var cat_stax = this.state.staxdata_categorized;


                if (selected_category == "Home Discover") {
                    for (var i = 0; i < staxarr.length; i++) {
                        staxarr[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + staxarr[i].staxid + ".jpg" + "?time=" + staxarr[i].createtime;
                        staxdt[index]["staxdata"].push(staxarr[i]);
                    }
                    //alert("e");
                }
                else {
                    //alert("f");
                    for (var i = 0; i < staxarr.length; i++) {

                        staxarr[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + staxarr[i].staxid + ".jpg" + "?time=" + staxarr[i].createtime;
                        cat_stax.push(staxarr[i]);
                    }


                }

                if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
                    lastkeymapping[category] = responseJson["LastEvaluatedKey"];
                }
                else {
                    delete lastkeymapping[category];
                }


                this.setState({

                    last_key_val_mapping: lastkeymapping,
                    staxdata: staxdt,
                    staxdata_categorized: cat_stax,
                    loading: false

                })
                this.refs.loaderRef.hide();


            })
            .catch((error) => {
                console.error(error);
                this.refs.loaderRef.hide();
            });





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
    async _indexChange1() {
        this.setState({ bannerTimeout: 10 });
    }
    offlineFunc() {
        this.setState({ offlineFlag: false });
        this.props.setNav('Home');
    }
    render() {
        var DeviceInfo1 = require('react-native-device-info');
        var isTablet2 = DeviceInfo1.isTablet();
        return (
            <View style={{ flex: 1, backgroundColor: "#ffff" }}>
                <LoaderNew ref={"loaderRef"} />
                {uicommons.offlineDialog(this)}
                <View style={{ width: '100%', height: (this.state.dh) * (1 / 20), backgroundColor: "#1a8cff", alignItems: "center" }} >
                    <ModalDropdown style={{ flex: 1, marginTop: 8 }}

                        options={this.state.categories}
                        defaultIndex={-1}
                        defaultValue="Category"

                        textStyle={{ color: "#ffff", fontSize: 16, fontFamily: "Roboto" }}
                        onSelect={(idx, value) => this.categoryselected(value)}
                        renderRow={this._dropdown_2_renderRow.bind(this)}
                        adjustFrame={style => this._adjustFrame(style)}
                        dropdownStyle={{ flex: 1, alignItems: "center" }}
                        renderSeparator={(sectionID, rowID) => this._renderSeparator(rowID)}
                    />

                </View>

                <ScrollView style={{ flex: 1 }}>

                    {commons.renderIf(this.state.bannerDet.length > 0,
                        <Swiper style={{ flex: 1 }}
                            ref={"slidermain"}
                            autoplay={true}
                            autoplayDirection={true}
                            activeDotColor={"white"}
                            autoplayTimeout={this.state.bannerTimeout}
                            index={this.state.position}
                            paginationStyle={{ position: 'absolute', bottom: 6 }}
                            containerStyle={{ width: Dimensions.get('window').width, height: isTablet2 ? 320 : Dimensions.get('window').height * 0.3 }}
                            onIndexChanged={(position) => { this.setState({ position, bannerTimeout: 5 }) }}
                            onTouchEnd={() => this.bannerOnclick()}>


                            {this.state.bannerDet.map((item_main, key) => {
                                return (
                                    <View style={{}} key={key}>
                                        <View style={{ width: Dimensions.get('window').width, height: isTablet2 ? 320 : Dimensions.get('window').height * 0.3 }}>
                                            <GestureRecognizer
                                                onSwipeLeft={() => this._indexChange1()}
                                                onSwipeRight={() => this._indexChange1()}
                                            >
                                                <Image style={{ width: Dimensions.get('window').width, height: isTablet2 ? 320 : Dimensions.get('window').height * 0.3 }} source={{ uri: item_main.bimage }} />
                                            </GestureRecognizer>
                                        </View>
                                    </View>
                                )
                            })}
                        </Swiper>)
                    }

                    <View Style={{ flex: 1, marginTop: 50, width: '100%', height: '100%', marginBottom: 5 }} >
                        {commons.renderIf(this.state.catgorychoosen == "Home Discover",
                            <FlatList
                                data={this.state.staxdata}
                                extraData={this.state}
                                renderItem={({ item }) =>

                                    <View key={item.key} style={{ flexDirection: 'column', marginTop: '.5%', }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text allowFontScaling={false} style={{ fontSize: 16, textAlign: 'left', marginLeft: 12, color: "#0073e6", fontFamily: 'Roboto-Bold' }} numberOfLines={1}>{item.category}</Text>
                                            <Image source={require("../assets/Group2531.png")} style={{ marginLeft: 5, width: 22, height: 22 }} />
                                        </View>
                                        <View style={{ height: isTablet2 == true ? 200 : Dimensions.get('window').height * (24 / 120), marginTop: '.5%', marginLeft: '3%' }}>
                                            <FlatList
                                                data={item.staxdata}
                                                extraData={this.state}
                                                horizontal={true}
                                                ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping.hasOwnProperty(item.category), <TouchableOpacity onPress={() => this.loadmore(item.key, item.category)} style={{ marginLeft: 10, alignItems: "center", justifyContent: "center", alignContent: "center", height: '100%', width: 100, marginRight: 15 }}><Image style={{ alignSelf: "center" }} source={require("../assets/arrow_right.png")} /></TouchableOpacity>)}
                                                renderItem={({ item }) =>

                                                    <View key={item.key} style={{ marginRight: 12 }}>
                                                        <TouchableOpacity onPress={() => this.onclickstack(item)}>
                                                            <Image style={{ height: isTablet2 == true ? 200 : Dimensions.get('window').height * (24 / 120), width: isTablet2 == true ? 150 : Dimensions.get('window').width * (33 / 120) }}
                                                                source={{ uri: item.staxpreview }}>

                                                            </Image>
                                                        </TouchableOpacity>
                                                    </View>}>
                                            </FlatList>
                                        </View>

                                    </View>
                                }>
                            </FlatList>
                        )}

                        {commons.renderIf(this.state.catgorychoosen != "Home Discover",
                            <View style={{ flex: 1, marginLeft: Dimensions.get('window').width * (3 / 120), marginRight: Dimensions.get('window').width * (3 / 120), marginTop: '1%' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text allowFontScaling={false} style={{ fontSize: 16, textAlign: 'left', marginLeft: 12, color: "#0073e6", fontFamily: 'Roboto' }} numberOfLines={1}>{this.state.catgorychoosen}</Text>
                                    <Image source={require("../assets/Group2531.png")} style={{ marginLeft: 5, width: 22, height: 22 }} />
                                </View>
                                <FlatList
                                    data={this.state.staxdata_categorized}
                                    numColumns={3}
                                    ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping.hasOwnProperty(this.state.catgorychoosen), <TouchableOpacity onPress={() => this.loadmore(0, this.state.catgorychoosen)} style={{ marginTop: 15, alignItems: "center", marginBottom: 10, justifyContent: "center", alignSelf: "center", height: 40, width: '40%', backgroundColor: "grey", marginRight: 15 }}><Text style={{ color: "white" }}>See More</Text></TouchableOpacity>)}
                                    renderItem={({ item }) =>

                                        <View style={{ marginLeft: isTablet2 == true ? Dimensions.get('window').width * (5 / 120) : Dimensions.get('window').width * (2 / 120), marginTop: '3%', marginRight: isTablet2 == true ? Dimensions.get('window').width * (6 / 120) : Dimensions.get('window').width * (2 / 120) }}>
                                            <TouchableOpacity onPress={() => this.onclickstack(item)}>
                                                <Image
                                                    style={{ height: isTablet2 == true ? 200 : Dimensions.get('window').height * (24 / 120), width: isTablet2 == true ? 150 : Dimensions.get('window').width * (33 / 120) }}
                                                    source={{ uri: item.staxpreview }}>
                                                </Image>
                                            </TouchableOpacity>

                                        </View>}>
                                </FlatList>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    }
}
