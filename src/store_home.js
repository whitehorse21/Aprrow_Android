import React, { Component } from "react";
import { BackHandler,View, Button, TextInput, Dimensions, ScrollView, TouchableOpacity, Image, StyleSheet, Text, FlatList, AsyncStorage } from "react-native";
import commons from './commons';
import { Dialog } from 'react-native-simple-dialogs';
import LoaderNew from './utils/LoaderNew';
import ModalDropdown from 'react-native-modal-dropdown';
import Swiper from 'react-native-swiper';
import device_style from './styles/device.style';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
export default class storehome extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        const { navigate } = navigation
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
                        alignItems: "center",
                        width: windowProp,
                        marginRight: -18,
                        height: 40,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                    <Image
                        style={{ width: 20, height: 20, marginLeft: 2, marginRight: 5 }}
                        source={assetsConfig.iconSearchWhite}
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
                        source={assetsConfig.lineSearchStax}
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
            categoriesLanguage: ["Home Discover","Favorites","New","Cities",],
            banners: [],
            staxdata: [],
            catgorychoosen: Strings.discover_category_home,
            staxdata_categorized: [],
            loading: false,
            username: "",
            last_key_val_mapping: {},
            searchquery: "",
            dh: Dimensions.get('window').height,
            position: 0,
            bannerLength:0,
            offlineFlag:false,
            bannerDet:[],
            bannerTimeout:5,
            loadTime:0,
            backend_Down_Popup:false
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    setval(value) {
        this.setState({ searchquery: value })
    }  
/** 
  * (Checks for backend down)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/      
    async isBackendDown(){
        var aws_data = require("./config/AWSConfig.json");
        var resp_flag=false;
        var request = new XMLHttpRequest();  
       await request.open('GET', aws_data.WebsitePath, true);
       request.onreadystatechange = function(){
           if (request.readyState === 4){
               if (request.status === 0) { 
               resp_flag=true;
               }  
           }
           else{
           }
       };
       await request.send();
       await setTimeout(() => {
        { 
          if(resp_flag){
            this.setState({backend_Down_Popup:true});
           }
          else
        {
          this.setState({backend_Down_Popup:false});
        } }
       }, 2000);
      }
/** 
  * (Discover Stax Search
  *   >>search in staxes)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/       
    async search() {
        this.mixpanelTrack("Discover Stax Search Started");
        if(this.state.catgorychoosen==Strings.discover_category_home)
       { 
          await this.catWisestax(this.state.searchquery);
       }
       else
       { 
        await this.categoryselected("", this.state.catgorychoosen)
       }
    }
    async componentWillUnmount()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    async componentDidMount()
    {   
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.RepeatcomponentDidMount();
    }
    async RepeatcomponentDidMount() {
        this.mixpanelTrack("Store Home Page");
        var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
        await this.isBackendDown();   
        this.props.navigation.setParams({ setval: this.setval.bind(this) });
        this.refs.loaderRef.show();
        this.props.navigation.setParams({ search: this.search.bind(this) });
        var username = await AsyncStorage.getItem("username");
        var s3config = require("./config/AWSConfig.json");
        this.setState({ loading: true, username: username });
      var aws_lamda = require("./config/AWSLamdaConfig.json");
        var urlName="";
        if (username == null || username == commons.guestuserkey()) {     
          urlName=aws_lamda.commenapis;
        }
        else
        {
          urlName=aws_lamda.categorylistfunctions;
        }    
        //for getting Category order
        var aws_data = require("./config/AWSConfig.json");
        var acceestoken=await commons.get_token();
        var languageCode=await AsyncStorage.getItem("lan");
        if(languageCode==null||languageCode==undefined)
        languageCode="en";
        await fetch('' + aws_data.path + aws_data.stage + urlName, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
            },
            body: JSON.stringify({
                "operation": "getCategoriesOrderLanguageWise",
                "languageCode": languageCode
               }),
        }).then((response) => response.json())
            .then(async (responseJson) => { 
                responseJson1=[];
                responseJsonLanguage=[];
                responseJson1[0]=Strings.discover_category_home;
                responseJson1[1]=Strings.discover_category_new;
                responseJson1[2]=Strings.discover_category_favorite;
                responseJsonLanguage[0]="Home Discover";
                responseJsonLanguage[1]="New";
                responseJsonLanguage[2]="Favorites";
                var resultEnglish=responseJson.English;
                var resultLanguage=responseJson.Language;
                for(var i=0;i<resultEnglish.length;i++){
                responseJson1.push(resultLanguage[i]);
                responseJsonLanguage.push(resultEnglish[i]);
                }
                this.setState({
                    categories: responseJson1,
                    categoriesLanguage:responseJsonLanguage
                });
            })
            .catch((error) => {
                console.error(error);
            });
            var aws_lamda = require("./config/AWSLamdaConfig.json");
            var urlName1="";
            if (username == null || username == commons.guestuserkey()) {     
              urlName1=aws_lamda.commenapis;
            }
            else
            {
              urlName1=aws_lamda.contentmanagement;
            }  
        //for getting banners  
        var aws_data = require("./config/AWSConfig.json");
        await fetch('' + aws_data.path + aws_data.stage + urlName1, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
            },
            body: JSON.stringify({
                "operation": "getAllBannerData"
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                var images = [];
                var bannerDet = [];
                for (var i = 0; i < responseJson.length; i++) {
                    images.push(s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.storebanners + "/StoreBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime)
                    var eachBanDet= { "key": ""+i};
                    eachBanDet["staxid"]=responseJson[i].ContentId;
                    eachBanDet["category"]=responseJson[i].Category;
                    eachBanDet["bimage"]=s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.storebanners + "/StoreBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime;    
                    bannerDet.push(eachBanDet);             
                }
                this.setState({
                    bannerLength:responseJson.length-1,
                    banners: images,
                    loading: false,
                    bannerDet:bannerDet
                });
                       this.refs.loaderRef.hide();
            })
            .catch((error) => {
                console.error(error);
            });
             await this.catWisestax("");
            }
            else{
                this.setState({offlineFlag:true});
            }
    }
/** 
  * (Trigger the mixpanel track event)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/    
    async mixpanelTrack(events)
     {
     try{
         var Mixpannel_tocken=aws_data11.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
             Mixpanel.default.track(events);
             });
        }catch(err){
 
       }
     }
/** 
  * (Search in the stax list with search query
  *   >>Search in selected language)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/     
    async catWisestax(squery)
    {
         var acceestoken=await commons.get_token();
         var username = await AsyncStorage.getItem("username");
         var aws_data = require("./config/AWSConfig.json");
         var aws_lamda = require("./config/AWSLamdaConfig.json");
         var s3config = require("./config/AWSConfig.json");
        var cats = this.state.categories;
        var catsLanguage=this.state.categoriesLanguage;
        var cur_staxdata = [];
       var count=0;
        for (var i = 0; i < cats.length; i++) {
            if (cats[i] == Strings.discover_category_favorite||cats[i] == Strings.discover_category_home||cats[i] == Strings.discover_category_new)
                continue;  
                var urlName2="";    
            if (username == null || username == commons.guestuserkey()) {     
              urlName2=aws_lamda.commenapis;
            }
            else
            {
              urlName2=aws_lamda.contentmanagement;
            }  
            await fetch('' + aws_data.path + aws_data.stage + urlName2, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                },
                body: JSON.stringify({
                    "operation": "getContentList", //"getSingleCategoryList",
                    "category": catsLanguage[i],
                    "widgetname": ""+squery,
                    "userid": this.state.username,
                    "LastEvaluatedKey": {}
                }),
            }).then((response) => response.json())
                .then(async (responseJson) => {
                    var catstax_obj = {};
                    catstax_obj["category"] = cats[i];
                    catstax_obj["key"] =count;
                    catstax_obj["staxdata"] =[]; 
                    if(responseJson.hasOwnProperty("data")) 
                        catstax_obj["staxdata"] = responseJson.data;
                    for (var j = 0; j < catstax_obj["staxdata"].length; j++) {
                        catstax_obj["staxdata"][j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + catstax_obj["staxdata"][j].staxid + ".jpg" + "?time=" + catstax_obj["staxdata"][j].createtime;
                    }
                  if(catstax_obj["staxdata"].length>0)  
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
    async handleBackButtonClick() 
      {
                this.props.handleBackButtonClick("Store");
                return true; 
      }
    componentWillMount() {
    }
/** 
  * (Navigate to purchase stax screen with parameters)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/    
    bannerOnclick()
    {
      this.mixpanelTrack("Discover Banner Stax Opened");
      var pos=this.state.position;
      var bannerDet=this.state.bannerDet;
      for(i=0;i<bannerDet.length;i++)
      {
       if(bannerDet[i].key==pos)
       {
         const { navigate } = this.props.navigation;
         navigate("store_purchase", user = { "staxid": bannerDet[i].staxid, "category": bannerDet[i].category,"goback":"1" });
       }
      }
    }
/** 
  * (Fetches the stax from backend
  *  >>Category is passed as filter parameter)
  * @param  :pos(index of dropdown),value(value of dropdwon)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/    
       
    async categoryselected(pos, value) { 
        var acceestoken=await commons.get_token();
        var s3config = require("./config/AWSConfig.json");        
        this.setState({ loading: true });
        this.refs.loaderRef.show();
        if (value == Strings.discover_category_home) {
            this.mixpanelTrack("Store Home Page");
            var cats = this.state.categories;
            var catsLanguage=this.state.categoriesLanguage;
            var cur_staxdata = [];
            var count=0;
            for (var i = 0; i < cats.length; i++) { 
                if (cats[i] == Strings.discover_category_favorite||cats[i]==Strings.discover_category_home||cats[i]==Strings.discover_category_new)
                    continue;
                var aws_data = require("./config/AWSConfig.json");
                var aws_lamda = require("./config/AWSLamdaConfig.json");
                var urlName="";
                if (this.state.username == null || this.state.username == commons.guestuserkey()) {     
                  urlName=aws_lamda.commenapis;
                }
                else
                {
                  urlName=aws_lamda.contentmanagement;
                }  
                await fetch('' + aws_data.path + aws_data.stage + urlName, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                        "operation":"getContentList",// "getSingleCategoryList",
                        "category": catsLanguage[i],
                        "widgetname": ""+this.state.searchquery,
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
                      if(catstax_obj["staxdata"].length>0)
                          cur_staxdata.push(catstax_obj);
                        var last_val_map = this.state.last_key_val_mapping;
                        if (responseJson.hasOwnProperty("LastEvaluatedKey"))
                            last_val_map[cats[i]] = responseJson.LastEvaluatedKey;
                        this.setState({
                            catgorychoosen: Strings.discover_category_home,
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
            var aws_data = require("./config/AWSConfig.json");
            var aws_lamda = require("./config/AWSLamdaConfig.json");
            var operation ="getContentList"// "getSingleCategoryList"
            this.mixpanelTrack(value);
            if (value == Strings.discover_category_new)
            {
                var urlName="";
                if (this.state.username == null || this.state.username == commons.guestuserkey()) {     
                  urlName=aws_lamda.commenapis;
                }
                else
                {
                  urlName=aws_lamda.contentmanagement;
                }  
                await fetch('' + aws_data.path + aws_data.stage +urlName, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                        "operation": "getLatestStax"
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        var resp = [];
                            resp = responseJson;
                        for (var j = 0; j < resp.length; j++) {
                            resp[j].key=responseJson[j].contentid;
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
            else{
                if (value == Strings.discover_category_favorite)
                {
                    operation = "getfavouriteContentList";
                }
                var cats=this.state.categories;
                var catsLanguage=this.state.categoriesLanguage;
                var valueDisplay=""
                for(var i=0;i<catsLanguage.length;i++)
                {
                    if (value ==cats[i])
                        {
                            valueDisplay=value;
                            value=catsLanguage[i];
                            break;
                        }
                }
                var urlName="";
                if (this.state.username == null || this.state.username == commons.guestuserkey()) {     
                  urlName=aws_lamda.commenapis;
                }
                else
                {
                  urlName=aws_lamda.contentmanagement;
                }  
            await fetch('' + aws_data.path + aws_data.stage + urlName, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                },
                body: JSON.stringify({
                    "operation": operation,
                    "category": value,
                    "widgetname": ""+this.state.searchquery,
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

                    if (value == Strings.discover_category_favorite)
                        resp = responseJson;
                    else
                        resp = responseJson.data;
                    for (var j = 0; j < resp.length; j++) {
                        resp[j].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + resp[j].staxid + ".jpg" + "?time=" + resp[j].createtime;
                    }
                    this.setState({
                        loading: false,
                        staxdata_categorized: resp,
                        catgorychoosen: valueDisplay
                    });
                    this.refs.loaderRef.hide();    
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
        switch (catname) {
            case Strings.discover_category_home:
                return assetsConfig.iconHomeBluepx24;
                break;
            case "Home Store":
                return assetsConfig.iconHomeBluepx24;
                break;
            case Strings.discover_category_favorite:
                return assetsConfig.iconFavoritiesBlue24px;
                break;
            case "Teams":
                return assetsConfig.iconPersonasBlue24px;
                break;
            case "Celebrities":
                return assetsConfig.icon_celebrities_blue_24px;
                break;
            case "Games":
                return assetsConfig.iconGamesBlue24px;
                break;
            case "Youtubers":
                return assetsConfig.iconYoutubersBlue24px;
                break;
            case "Cities":
                return assetsConfig.iconCitiesBlue24px;
                break;
            case "Movies":
                return assetsConfig.iconMoviesBlue24px;
                break;
            case "Personas":
                return assetsConfig.iconPersonasBlue24px;
                break;
        }
    }
    _dropdown_2_renderRow(rowData, rowID, highlighted) {
        let icon = this.getcaticon(rowData);
        return (
            <TouchableOpacity  >
                <View style={{ flexDirection: "row", backgroundColor: "#ffffff", marginTop: '6%', alignItems: "center", justifyContent: "center", width: "100%" }}> 
                    <View style={{ width: "100%",alignItems:'center' }}>
                        <Text allowFontScaling={false} style={{ fontFamily:'Roboto-Bold', color: "black" }}>
                            {rowData}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
 /** 
  * (Set the size of the drop down)
  * @param  :style(default)     
  * @return :style(updated style)
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
    _adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = Dimensions.get("window").width;
        style.height = '75%';
        style.left = 0;
        return style;
    }
     
    _indexChange(index) {
    }
 /** 
  * (Navigate to store purchase)
  * @param  :item(stax details)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/      
    onclickstack(item) {
        var valueIntxt=this.state.searchquery;
        this.mixpanelTrack("Discover Stax Opened Category :"+item.category);
        this.mixpanelTrack("Discover Stax Opened " +item.category+" :"+item.widgetname);
        if(valueIntxt!="")
        {
          this.mixpanelTrack("Discover Stax Selected");
        }  
        const { navigate } = this.props.navigation;
        navigate("store_purchase", user = { "staxid": item.key, "category": item.category,"goback":"1" });
    }
 /** 
  * (fetches set of data from backend based on last evaluated key
  *    >>>Loads next set of stax)
  * @param  :index(index of flatlist),category(category name)    
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/     
    async  loadmore(index, category) {
        var lastkey = this.state.last_key_val_mapping[category];
        var s3config = require("./config/AWSConfig.json");
        var acceestoken=await commons.get_token();
        this.setState({ loading: true });
        this.refs.loaderRef.show();
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        var selected_category = this.state.catgorychoosen;
        var urlName2="";
            if (this.state.username == null || this.state.username == commons.guestuserkey()) {     
              urlName2=aws_lamda.commenapis;
            }
            else
            {
              urlName2=aws_lamda.contentmanagement;
            }  
        await fetch('' + aws_data.path + aws_data.stage +urlName2, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
            },
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
                if (selected_category == Strings.discover_category_home) {
                    for (var i = 0; i < staxarr.length; i++) {
                        staxarr[i].staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + staxarr[i].staxid + ".jpg" + "?time=" + staxarr[i].createtime;
                        staxdt[index]["staxdata"].push(staxarr[i]);
                    }
                }
                else {
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
    _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
        if (rowID == this.state.categories.length - 1) return;
        let key = `spr_${rowID}`;
        return (<View style={{
            height: 0,
        }}
            key={key}
        />);
    }
 /** 
  * (On manual swipe on banner
  * >>set Timout as 10 sec)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/     
    async _indexChange1() {
        this.setState({bannerTimeout:10});
          }
/** 
  * (Offline flag will change and navigate to home page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/           
    offlineFunc()
    {
     this.setState({offlineFlag:false});
     this.setState({backend_Down_Popup:false});
     this.props.setNav('Home');
    }
    render() {
        var DeviceInfo1 = require('react-native-device-info');
        var isTablet2= DeviceInfo1.isTablet();
        return (
            <View style={{ flex: 1, backgroundColor: "#ffff" }}>
                   <LoaderNew ref={"loaderRef"}/>
 <Dialog visible={this.state.backend_Down_Popup}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{alignSelf:'center'}} />
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>{Strings.serverdown_popup_msg1}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5,  fontWeight: 'bold',textAlign: 'center' }}>{Strings.serverdown_popup_msg2}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>{Strings.serverdown_popup_msg3}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.serverdown_popup_btn}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
    <Dialog visible={this.state.offlineFlag}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{ alignSelf: 'center' }} />
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
                <View style={{ width: '100%', height: (this.state.dh) * (1 / 20), backgroundColor: "#1a8cff", alignItems: "center" }} >
                    <ModalDropdown style={{ flex: 1, marginTop: 8 }} 
                        options={this.state.categories}
                        defaultIndex={-1}
                        defaultValue={Strings.discover_categorylist_caption}
                        textStyle={{ color: "#ffff", fontSize: 16,fontFamily:"Roboto" }}
                        onSelect={(idx, value) => this.categoryselected(idx, value)}
                        renderRow={this._dropdown_2_renderRow.bind(this)}
                        adjustFrame={style => this._adjustFrame(style)}
                        dropdownStyle={{ flex: 1, alignItems: "center",justifyContent:'center'}}
                        renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
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
                  paginationStyle={{position:'absolute', bottom: 6}}
                  containerStyle={{ width: Dimensions.get('window').width, height:isTablet2?320:Dimensions.get('window').height*0.3 }}
                  onIndexChanged={(position) =>{this.setState({ position,bannerTimeout:5 })}}
                  onTouchEnd={(index1) => this.bannerOnclick()}>
      {this.state.bannerDet.map((item_main, key) => {
        return (
          <View style={{}} key={key}>
            <View style={{ width: Dimensions.get('window').width, height:isTablet2?320:Dimensions.get('window').height*0.3}}>
              <GestureRecognizer
                onSwipeLeft={(state) => this._indexChange1()}
                onSwipeRight={(state) => this._indexChange1()}
              >
                <Image style={{ width: Dimensions.get('window').width, height:isTablet2?320:Dimensions.get('window').height*0.3 }} source={{ uri: item_main.bimage }} />
              </GestureRecognizer>
            </View>
          </View>
        )
      })}
    </Swiper>)
    }
                    <View Style={{ flex: 1, marginTop: 50, width: '100%', height: '100%', marginBottom: 5 }} >
                        {commons.renderIf(this.state.catgorychoosen == Strings.discover_category_home,
                            <FlatList
                                data={this.state.staxdata}
                                extraData={this.state}
                                renderItem={({ item }) =>
                                    <View key={item.key} style={{ flexDirection: 'column', marginTop: '.5%', }}>
                                       <View style={{ flexDirection:'row' }}>
                                        <Text allowFontScaling={false} style={{ fontSize: 16, textAlign: 'left', marginLeft: 12, color: "#0073e6",fontFamily:'Roboto-Bold' }} numberOfLines={1}>{item.category}</Text>
                                        <Image source={assetsConfig.group2531} style={{ marginLeft: 5,width:22,height:22}} />
                                        </View>
                                        <View style={{ height:isTablet2==true?200:Dimensions.get('window').height * (24 / 120), marginTop: '.5%', marginLeft:'3%'}}>
                                            <FlatList
                                                data={item.staxdata}
                                                extraData={this.state}
                                                horizontal={true}
                                                ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping.hasOwnProperty(item.category), <TouchableOpacity onPress={() => this.loadmore(item.key, item.category)} style={{ marginLeft: 10, alignItems: "center", justifyContent: "center", alignContent: "center", height: '100%', width: 100,marginRight: 15 }}><Image style={{ alignSelf: "center" }} source={assetsConfig.arrowRight} /></TouchableOpacity>)}
                                                renderItem={({ item }) =>
                                                    <View key={item.key} style={{ marginRight:12 }}>
                                                        <TouchableOpacity onPress={() => this.onclickstack(item)}>
                                                            <Image style={{ height:isTablet2==true?200:Dimensions.get('window').height * (24 / 120), width:isTablet2==true?150:Dimensions.get('window').width * (33 / 120) }}
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
                        {commons.renderIf(this.state.catgorychoosen != Strings.discover_category_home,
                            <View style={{ flex: 1, marginLeft: Dimensions.get('window').width * (3/ 120), marginRight: Dimensions.get('window').width * (3/ 120), marginTop:'1%' }}>
                                <View style={{ flexDirection:'row' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, textAlign: 'left', marginLeft: 12, color: "#0073e6",fontFamily:'Roboto' }} numberOfLines={1}>{this.state.catgorychoosen}</Text>
                                        <Image source={assetsConfig.group2531} style={{ marginLeft: 5,width:22,height:22}} />
                               </View>
                                <FlatList
                                    data={this.state.staxdata_categorized}
                                    numColumns={3}
                                    ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping.hasOwnProperty(this.state.catgorychoosen), <TouchableOpacity onPress={() => this.loadmore(0, this.state.catgorychoosen)} style={{ marginTop: 15, alignItems: "center", marginBottom: 10, justifyContent: "center", alignSelf: "center", height: 40, width: '40%', backgroundColor: "grey", marginRight: 15 }}><Text style={{ color: "white" }}>See More</Text></TouchableOpacity>)}
                                    renderItem={({ item }) =>
                                        <View style={{ marginLeft:isTablet2==true?Dimensions.get('window').width * (5/ 120):Dimensions.get('window').width * (2/ 120), marginTop: '3%',marginRight: isTablet2==true?Dimensions.get('window').width * (6/ 120):Dimensions.get('window').width * (2/ 120) }}>
                                            <TouchableOpacity onPress={() => this.onclickstack(item)}>
                                                <Image
                                                    style={{ height:isTablet2==true?200:Dimensions.get('window').height * (24 / 120), width:isTablet2==true?150:Dimensions.get('window').width * (33 / 120) }}
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