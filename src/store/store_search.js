import React, { Component } from "react";
import { Linking, View, Dimensions, TouchableOpacity, Image, Text, TextInput, FlatList, AsyncStorage } from "react-native";
import commons from '../commons';
import uicommons from '../ui.commons';
import Loader from '../utils/Loader';
var aws_data = require('../config/AWSConfig.json');
var aws_lamda = require('../config/AWSLamdaConfig.json');
var s3config = require('../config/AWSConfig.json');
export default class storesearch extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        const { goBack } = navigation;
        var windowProp = Dimensions.get('window').width;
        let searchquery1 = params.searchquery;
        let title = '';
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        let headerLeft = uicommons.headerLeft(goBack);

        headerRight = (
            <View
                style={{
                    alignItems: "center",
                    width: windowProp,
                    height: 50,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: 'center'
                }}>
                <View
                    style={{
                        //  borderColor: "white",
                        //   borderWidth: 1,
                        height: 35,
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: 'center', alignContent: 'center', alignItems: 'center'
                    }}>
                    <View style={{ width: '70%', paddingLeft: '8%' }}>
                        <TextInput
                            style={{ color: "white" }}
                            placeholder="Search STAX"
                            value={params.hasOwnProperty("currval") ? params.currval : searchquery1}
                            placeholderTextColor="white"
                            onChangeText={(value) => params.setval(value)}
                            onSubmitEditing={() => params.search(false)}
                            underlineColorAndroid="transparent"
                        />
                    </View>
                    <View style={{ width: '20%', paddingLeft: '15%', marginLeft: 1 }}>
                        <TouchableOpacity onPress={() => params.textClear1()}>

                            <Image
                                style={{ width: 20, height: 23, marginRight: 5 }}
                                source={require("../assets/icon_close_white_21px.png")}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ width: "100%", height: 5, alignItems: 'center' }}>

                    <Image
                        style={{ width: '75%', height: 1, paddingLeft: '5%' }}
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
            searchview: false,
            searchquery: "",
            queryedstax: [],
            loading: false,
            username: "",
            last_key_val_mapping: {},
            searchFlag: true,
            clearVal: ''
        };
        this.openLink = this.openLink.bind(this);
        this.openLink1 = this.openLink1.bind(this);
    }
    textClear1() {
        // alert("");
        //   var m="";
        this.props.navigation.setParams({ currval: "" });
    }
    gotopuchase(item) {

        const { navigate } = this.props.navigation;
        navigate("store_purchase", { "staxid": item.key, "category": item.category, "goback": "1" });
    }

    async search(loadmore) {
        var lastkey = {};
        if (loadmore) {
            lastkey = this.state.last_key_val_mapping["lastevlkey"];
            //   alert(JSON.stringify(lastkey));
        }
        if (this.state.searchFlag) {
            var value = this.props.navigation.state.params.searchquery;

        }
        else {
            value = this.state.searchquery;

        }
        //   alert("t : "+value);

        if (value == "")
            return;

        var cat = this.props.navigation.state.params.category;
        //alert(cat);
        if (cat == "Home Discover")
            var cat = "";

        var operation = "getContentList"
        if (cat == "Favorites")
            operation = "getfavouriteContentList";

        this.setState({ loading: true })
        var acceestoken = await commons.get_token();


        await fetch('' + aws_data.path + aws_data.stage + aws_lamda.contentmanagement, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': acceestoken

            },
            body: JSON.stringify({
                "operation": operation,
                "category": cat,
                "widgetname": value,
                "LastEvaluatedKey": lastkey,
                "userid": this.state.username
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                var last_val_map = this.state.last_key_val_mapping;
                if (responseJson.hasOwnProperty("LastEvaluatedKey"))
                    last_val_map["lastevlkey"] = responseJson.LastEvaluatedKey;
                else
                    delete last_val_map["lastevlkey"];

                var resp = [];

                if (!loadmore) {
                    if (value == "Favorites") {
                        resp = responseJson;
                        for (var i = 0; i < resp.length; i++)
                            resp[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + resp[i].staxid + ".jpg" + "?time=" + resp[i].createtime;

                    }
                    else {
                        resp = responseJson.data;
                        for (var i = 0; i < resp.length; i++)
                            resp[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + resp[i].staxid + ".jpg" + "?time=" + resp[i].createtime;

                    }
                }
                else {
                    resp = this.state.queryedstax;

                    if (value == "Favorites") {

                        for (var i = 0; i < responseJson.length; i++) {

                            responseJson[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + responseJson[i].staxid + ".jpg" + "?time=" + responseJson[i].createtime;
                            resp.push(responseJson[i]);
                        }

                    }
                    else {
                        for (var i = 0; i < responseJson.data.length; i++) {
                            responseJson.data[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + responseJson.data[i].staxid + ".jpg" + "?time=" + responseJson.data[i].createtime;
                            resp.push(responseJson.data[i]);
                        }
                    }
                }

                this.setState({
                    searchview: true,
                    queryedstax: resp,
                    loading: false,
                    last_key_val_mapping: last_val_map

                });
                this.setState({ loading: false });
                // console.log(JSON.stringify(responseJson));
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.error(error);
            });



        //do online query and fill ui with result
        //set serachview true
    }

    setval(value) {

        this.props.navigation.setParams({ currval: value });

        this.setState({ searchquery: value, searchFlag: false })
        //   searchquery1='';
        // this.setState({ searchquery1: value })

    }
    async componentWillUnmount() {
        Linking.removeEventListener('url', this.openLink1);
    }
    async openLink(url) {

        var username = await AsyncStorage.getItem("username");
        var isfirstrun = await AsyncStorage.getItem("firstrun");
        setTimeout(() => {
            if (username != null) {
                //navigate("welcome", { screen: "welcome" }); 
                var urldata = "";
                //console.log(url);
                if (url != null)
                    if (url.url != null && username != commons.guestuserkey()) {
                        urldata = (url.url).split("#");
                        //alert(JSON.stringify(url));
                        //console.log("urls>>>>>>>>>>>>"+JSON.stringify(url));
                        //alert(urldata[1]);
                        commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });

                    }
                    else {
                        //commons.replaceScreen(this, 'bottom_menu', {});
                    }
            }
            else {
                // navigate("login", { screen: "login" }); 
                if (isfirstrun == null)
                    commons.replaceScreen(this, 'userypeselector', {});
                else
                    commons.replaceScreen(this, 'login', {});


            }
        }, 2000);


    }
    async openLink1() {

    }
    async  componentDidMount() {

        Linking.getInitialURL().then(async (url) => {
            if (url)
                this.openLink(url);
            else Linking.addEventListener('url', this.openLink1);
        });

        //this.props.navigation.setParams({currval:""});     

        await this.props.navigation.setParams({ search: this.search.bind(this) });
        await this.props.navigation.setParams({ setval: this.setval.bind(this) });
        await this.props.navigation.setParams({ textClear1: this.textClear1.bind(this) });

        //alert(searchquery1);
        var username = await AsyncStorage.getItem("username");
        this.setState({ username: username });

        await this.search(false);
    }




    render() {
        return (


            <View style={{ flex: 1, backgroundColor: "white" }}>

                <Loader
                    loading={this.state.loading} />

                {/*default view*/}

                {commons.renderIf(!this.state.searchview,
                    <View style={{ alignItems: "center", marginTop: 200 }}>
                        <Text allowFontScaling={false} allowFontScaling={false} style={{ fontSize: 15, color: "#1a8cff" }}>Search Teams,Celebrities,Games,Youtubers</Text>
                        <Text allowFontScaling={false} allowFontScaling={false} style={{ fontSize: 15, color: "#1a8cff" }}>Cities,Movies And People</Text>

                    </View>
                )}


                {/*Search view*/}

                {commons.renderIf(this.state.searchview,
                    <View style={{ flex: 1, marginLeft: '2%', marginRight: '2%', marginTop: 5 }}>
                        <FlatList
                            data={this.state.queryedstax}
                            numColumns={3}
                            style={{ flex: 1 }}
                            renderItem={({ item }) =>

                                <View style={{ marginLeft: '1%', marginTop: 10, marginRight: '1%' }}>
                                    <TouchableOpacity onPress={() => this.gotopuchase(item)}>
                                        <Image
                                            style={{ width: Dimensions.get('window').width * (37 / 120), height: 150 }}
                                            source={{ uri: item.staxpreview }}>
                                        </Image>
                                    </TouchableOpacity>
                                </View>}>
                        </FlatList>
                    </View>
                )}
            </View>
        )
    }
}