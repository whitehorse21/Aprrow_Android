import React, { Component } from "react";
import {BackHandler, View, ToastAndroid, Button,Animated, Dimensions, ScrollView, ImageBackground, TouchableOpacity, Image, StyleSheet, Text, TextInput, FlatList, AsyncStorage } from "react-native";
import commons from './commons';
import LoaderNew from './utils/LoaderNew';
import databasehelper from './utils/databasehelper.js';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import device_style from './styles/device.style';
import Slider from "react-native-slider";
import Tabs from './utils/tabs_rewards';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import Modal from 'react-native-modal';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
let Height=Dimensions.get('window').height;

var Mixpanel = require('react-native-mixpanel');
var awsData = require("./config/AWSConfig.json");
export default class Rewards extends Component {
    scroll = new Animated.Value(0);
    headerY;
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        const { navigate } = navigation
        const { goBack } = navigation;
        let title = 'Rewards';
        let headerStyle = { backgroundColor: '#005798' };
        let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        return {
            title, headerStyle, headerTitleStyle, headerTintColor,
        };
    };
    constructor(props) {
        super(props);
        this.headerY = Animated.multiply(Animated.diffClamp(this.scroll, 0, 180), -1);
        this.state = {
            currentBadge: "",
            userName: "",
            firstName: "",           
            coinsCollected: "0",
            allCoinsCollected: "0",
            coinsToNextbadge: "0",
            nextBadge: "",
            timeLine: [],
            taskProgress: [],
            statusInfo: false,
            loading: false,
            offlineFlag:false,
            userImage: assetsConfig.photoMiniPerfil,
            gotoLoginFlow:false,
            backendDownPopup:false,
            translateY: new Animated.Value(0),
            TabsTranslateY: new Animated.Value(0),
            TabsHeight: new Animated.Value(60),
            scrollY: new Animated.Value(0)
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
 /** 
  * (navigate to previos page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     
    async handleBackButtonClick() 
      {
                this.props.handleBackButtonClick("Rewards");
                return true;
      }
 /** 
  * (return the slider background color based on badge)
  * @param  :nil     
  * @return :color
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */       
    getSliderBgColor() {
        if (this.state.currentBadge == "PLATINUM")
            return "#444444"
        else
            return "#005CA1"
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
 /** 
  * (Navigate to Discover page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     
    getMainSliderColor() {
        var currBadge = this.state.currentBadge;
        var currentBadgeUppercase = currBadge.toUpperCase();
        switch (currentBadgeUppercase) {
            case "BRONZE":
                return "#D99679"
                break;
            case "SILVER":
                return "#BFBFBF"
                break;
            case "GOLD":
                return "#FFBB00"
                break;
            case "PLATINUM":
                return "#444444"
                break;
            default:
                return "#FFFFFF"
                break;
        }
    }
/** 
  * (Returns next badge name)
  * @param  :currBadge(current badge)     
  * @return :badge(Badge name)
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    getNextBadge(currBadge) {
        var currentBadgeUppercase = currBadge.toUpperCase();
        switch (currentBadgeUppercase) {
            case "BRONZE":
                return Strings.reward_activity_silver
                break;
            case "SILVER":
                return Strings.reward_activity_gold
                break;
            case "GOLD":
                return Strings.reward_activity_platinum
                break;
            case "PLATINUM":
                return Strings.reward_activity_platinum
                break;
            default:
                return "BRONZE"
                break;
        }
    }
/** 
  * (Returns the next badge's point)
  * @param  :currBadge(current badge)     
  * @return :point(point of next badge)
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    getPointsToNextBadge(currBadge) {
        var currentBadgeUppercase = currBadge.toUpperCase();
        switch (currentBadgeUppercase) {
            case "BRONZE":
                return "25"
                break;
            case "SILVER":
                return "50"
                break;
            case "GOLD":
                return "100"
                break;
            case "PLATINUM":
                return "0"
                break;
            default:
                return "10"
                break;
        }
    }
/** 
  * (It gives corresponding images to the activities
  *  >>Based on badge it returns corresponding image)
  * @param  :badge(current badge),isNewLevel(Level change),reqLine     
  * @return :image(path of the icon)
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */ 
    getImageForTimeline(badge, isNewLevel, reqLine) {
        var init_normal =assetsConfig.ellipseBlueSmall;
        var init_line = assetsConfig.lineBlue;
        var bonze_normal = assetsConfig.ellipseBronzeSmall;
        var bonze_newlevel = assetsConfig.ellipseBronzeBig;
        var bonze_line = assetsConfig.lineBronzeSmall;
        var silver_normal = assetsConfig.ellipseSilverSmall;
        var silver_newlevel = assetsConfig.ellipseSilverBig;
        var silver_line = assetsConfig.lineSilver;
        var gold_normal = assetsConfig.ellipseGoldSmall;
        var gold_newlevel = assetsConfig.ellipseGoldBig;
        var gold_line = assetsConfig.lineGold;
        var platinum_normal = assetsConfig.ellipsePlatinumSmall;
        var platinum_newlevel = assetsConfig.ellipsePlatinumBig;
        var platinum_line =assetsConfig.linePlatinum;
        switch (badge) {
            case "BRONZE":
                if (reqLine)
                    return bonze_line;
                if (isNewLevel)
                    return bonze_newlevel;
                else
                    return bonze_normal;
                break;
            case "SILVER":
                if (reqLine)
                    return silver_line;
                if (isNewLevel)
                    return silver_newlevel;
                else
                    return silver_normal;
                break;
            case "GOLD":
                if (reqLine)
                    return gold_line;
                if (isNewLevel)
                    return gold_newlevel;
                else
                    return gold_normal;
                break;
            case "PLATINUM":
                if (reqLine)
                    return platinum_line;
                if (isNewLevel)
                    return platinum_newlevel;
                else
                    return platinum_normal;
                break;
            default:
                if (reqLine)
                    return init_line;
                else
                    return init_normal;
                break;
        }
    }
/** 
  * (return margin size)
  * @param  :nil     
  * @return :margin
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    getMargin(bigIcon) {
        if (!bigIcon)
            return 12;//for small icon
        else
            return 0;
    }
  /** 
  * (Navigate to Discover page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */   
    goToStore() {
      const {navigate}=this.props.navigation;
      navigate("bottom_menu", {"page":"Discover","coins": this.state.coinsCollected });
    }
/** 
  * (Updates the coin in dynamo db)
  * @param  :item(array object)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    async  collectCoins(item) {
        //update coin count in server on result update ui        
        if(item.taskheading=="Created STAX")
         {
            this.mixpanelTrack("Created STAX");
         }
         else if(item.taskheading=="Shared STAX")
         {
            this.mixpanelTrack("Shared STAX");
         }
         else if(item.taskheading=="Discover Purchases")
         {
            this.mixpanelTrack("Discover Purchases");
         }
         else if(item.taskheading=="Follow APRROW")
         {
            this.mixpanelTrack("Follow APRROW");
         }
        var awsData = require("./config/AWSConfig.json");
        var awsLamda = require("./config/AWSLamdaConfig.json");
        var acceestoken=await commons.get_token();
        await fetch('' + awsData.path + awsData.stage + awsLamda.rewardmanagement, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
            },
            body: JSON.stringify({
                "operation": "getCollectingCoins",
                "userid": this.state.userName,
                "noOfCoins": item.numberofcoins,
                "createtime": commons.gettimestamp(),
                "taskid": item.id
            }),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                var curbadge = "";
                if (responseJson.BADGE != "none")
                    curbadge = responseJson.BADGE
                if (this.state.currentBadge.toUpperCase() != curbadge.toUpperCase()) {
                    ToastAndroid.show(Strings.reward_toast_badgerise + curbadge.toUpperCase(), 500)
                    this.props.setNav("Rewards");
                }
                else {
                    var index = parseInt(item.key);
                    var curentCoins = parseInt(this.state.coinsCollected);
                    var curentAllCoinsCollected=  parseInt(this.state.allCoinsCollected);
                    var coinsToAdd = parseInt(item.numberofcoins);
                    var currentProgress = this.state.taskProgress;
                    currentProgress[index].eligibleforcoin = false;
                    currentProgress[index].numberofcoins = "0";
                    curentCoins += coinsToAdd;
                    curentAllCoinsCollected+= coinsToAdd;
                    this.setState({
                        taskProgress: currentProgress,
                        coinsCollected: curentCoins + "",
                        allCoinsCollected:curentAllCoinsCollected
                    })
                   ToastAndroid.show(Strings.reward_toast_collectcoin,500)
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
/** 
  * (Check the web portal is down
   >>checks the return type of network call 
   >> based on return code,update the status)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    async isBackendDown(){
        var awsData = require("./config/AWSConfig.json");
        var respFlag=false;
        var request = new XMLHttpRequest();  
       await request.open('GET', awsData.WebsitePath, true);
       request.onreadystatechange = function(){
           if (request.readyState === 4){
               if (request.status === 0) { 
               respFlag=true;
               }  
           }
           else{
           }
       };
       await request.send();
       await setTimeout(() => {
        { 
          if(respFlag){
            this.setState({backendDownPopup:true});
           }
          else
        {
          this.setState({backendDownPopup:false});
        } }
       }, 2000);
      }
    async componentDidMount()
    {
        this.mixpanelTrack("Rewards Page");
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
           this.isBackendDown();// checks for backend status
          this.refs.loaderRef.show();
           const userName = await AsyncStorage.getItem("username"); 
           //get profile image from db     
           var imageReturnD = await databasehelper.getProfileImage(); 
           var imageData = imageReturnD.res;
           var imageBase64 = imageData[0]["profileimage"];
           var uri = assetsConfig.photoMiniPerfil;
           if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
               uri = { uri: `data:image/gif;base64,${imageBase64}` };
           }
           //get user details from db     
           var firstName=""; 
           var userData=await databasehelper.getuser(); 
           if(userData.res!=null&&userData.res.length>0)
           {
               firstName=userData.res[0].firstname; 
           }
           if(userName==null || userName==commons.guestuserkey())
           {
               this.setState({gotoLoginFlow:true});
               this.setState({
                   userName: userName,
                   firstName: firstName,
                   userImage: uri,
                   loading: false});
               this.refs.loaderRef.hide();
               return;
           }
           // do the netwrok call 
           var acceestoken=await commons.get_token();
           var awsData = require("./config/AWSConfig.json");
           var awsLamda = require("./config/AWSLamdaConfig.json");
           await fetch('' + awsData.path + awsData.stage + awsLamda.rewardmanagement, {
               method: 'POST',
               headers: {
                   Accept: 'application/json',
                   'Content-Type': 'application/json',
                   'Authorization':acceestoken
               },
               body: JSON.stringify({
                   "operation": "getUserRewards",
                   "userid": userName
               }),
           }).then((response) => response.json())
               .then(async (responseJson) => {
                   var coins = responseJson.Coins;
                   var allCoinCount = responseJson.allCoinCount;
                   var badge = "";
                   if (responseJson.Badge != "none")
                       badge = responseJson.Badge.toUpperCase();
                   var nextBadge = this.getNextBadge(badge);
                   var pointsNextBadge = this.getPointsToNextBadge(badge);
                   var taskProgress = responseJson.taskprogressdata;
                   var modifiedTaskProgress = [];
                   for (var i = 0; i < taskProgress.length; i++) {
                       var taskObj = {};
                       taskObj["key"] = i + "";
                       taskObj["id"] = taskProgress[i].taskid;
                       console.log("taskheading\n"+taskProgress[i].taskheading);
                       console.log("task description\n"+taskProgress[i].taskdescription);
                       if(taskProgress[i].taskheading=="Created STAX")
                       {
                       taskObj["taskheading"] = Strings.reward_activity_create_head;
                       taskObj["taskdescription"] = Strings.reward_activity_creat_desc;
                       }else if(taskProgress[i].taskheading=="Shared STAX")
                       {
                       taskObj["taskheading"] = Strings.reward_activity_shared_head;
                       taskObj["taskdescription"] = Strings.reward_activity_shared_desc;
                       }else if(taskProgress[i].taskheading=="Discover Purchases")
                       {
                       taskObj["taskheading"] = Strings.reward_activity_discover_head;
                       taskObj["taskdescription"] = Strings.reward_activity_discover_desc;
                       }else if(taskProgress[i].taskheading=="Follow APRROW")
                       {
                       taskObj["taskheading"] = Strings.reward_activity_follow_head;
                       taskObj["taskdescription"] = Strings.reward_activity_follow_desc;
                       }
                       taskObj["pointscollected"] = "0"
                       taskObj["pointsrequired"] = taskProgress[i].pointsrequired;
                       taskObj["eligibleforcoin"] = false;
                       taskObj["numberofcoins"] = "0";
                       if (taskProgress[i].hasOwnProperty("pointscollected"))
                           taskObj["pointscollected"] = taskProgress[i].pointscollected;
                       if (taskProgress[i].hasOwnProperty("numberofcoins")) {
                           taskObj["numberofcoins"] = taskProgress[i].numberofcoins;
                           if (parseInt(taskProgress[i].numberofcoins) > 0)
                               taskObj["eligibleforcoin"] = true;
                       }
                       modifiedTaskProgress.push(taskObj);
                   }
                   var activityProgressModified = [];
                   var activityProgressServer = responseJson.activityprogress;
                   var len = activityProgressServer.length;
                   var currBadge = "";
                   var badgechangekey = "Badge Change";
                   activityProgressServer.sort(function (a, b) {
                       return parseFloat(a.timestmap) - parseFloat(b.timestmap);
                   });
                   //once badges updated  on task progrss update from backend we can remove this loop.
                   for (var i = 0; i < len; i++) {
                       var actvty_obj = {};
                       actvty_obj["key"] = i + "";
                       if(activityProgressServer[i].taskheading=="Created STAX")
                       {
                           actvty_obj["taskheading"] =Strings.reward_activity_create_head;
                       }else if(activityProgressServer[i].taskheading=="Shared STAX")
                       {
                           actvty_obj["taskheading"] =Strings.reward_activity_shared_head;
                       }else if(activityProgressServer[i].taskheading=="Discover Purchases")
                       {
                           actvty_obj["taskheading"] =Strings.reward_activity_discover_head;
                       }else if(activityProgressServer[i].taskheading=="Follow APRROW")
                       {
                           actvty_obj["taskheading"] =Strings.reward_activity_follow_head;
                       }else actvty_obj["taskheading"]=activityProgressServer[i].taskheading;
                       actvty_obj["date"] = commons.format_string_date(activityProgressServer[i].timestmap, 'YYYYMMDDHHmmss', 'MMM DD hh:mm a');
                       actvty_obj["badge"] = currBadge;
                       actvty_obj["reachednewlevel"] = false;
                       if (activityProgressServer[i].hasOwnProperty("reachednewlevel") || actvty_obj["taskheading"].toUpperCase() == badgechangekey.toUpperCase()) {
                           currBadge = this.getNextBadge(currBadge);
                           actvty_obj["reachednewlevel"] = true;
                           actvty_obj["badge"] = currBadge;
                           var currbadge1=currBadge.toUpperCase();
                           var badge="";
                           if(currbadge1=="BRONZE")
                           currbadge2=Strings.reward_activity_bronze;
                           if(currbadge1=="SILVER")
                           currbadge2=Strings.reward_activity_silver;
                           if(currbadge1=="GOLD")
                           currbadge2=Strings.reward_activity_gold;
                           if(currbadge1=="PLATINUM")
                           currbadge2=Strings.reward_activity_platinum;
                           actvty_obj["taskheading"] = Strings.reward_activity_badge_head1+" " + currbadge2+" "+Strings.reward_activity_badge_head2;
                       }
                       activityProgressModified.push(actvty_obj);
                   }
                   activityProgressModified.reverse();
                   this.setState({
                       taskProgress: modifiedTaskProgress,
                       timeLine: activityProgressModified,
                       currentBadge: badge,
                       coinsCollected: coins,
                       allCoinsCollected: allCoinCount,
                       coinsToNextbadge: pointsNextBadge,
                       nextBadge: nextBadge,
                   })
               })
               .catch((error) => {
                   console.log(error);
               });
           this.setState({
               userName: userName,
               firstName: firstName,
               userImage: uri,
               loading: false
           })
           this.refs.loaderRef.hide();
       }
       else{
           this.setState({offlineFlag:true});
       }    }
/** 
  * (Trigger mixpanel track event with event name)
  * @param  :event     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
 async mixpanelTrack(event)
  {
    try{
        var Mixpannel_tocken=awsData.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
            Mixpanel.default.track(event);
            });
      }catch(err){
      }
  } 
  
/** 
  * (disables the offline popup and navigate to Home page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    offlineFunc()
    {
     this.setState({offlineFlag:false,backendDownPopup:false});
     this.props.setNav('Home');
    }
    render() {
        var windowProp = Dimensions.get('window');
        var winheight = windowProp.height;
        var winwidth = windowProp.width;
        const tabY = Animated.add(this.scroll,this.headerY);
        let translateY = this.state.scrollY.interpolate({
            inputRange: [0, 220],
            outputRange: [0, -210],
            extrapolate: 'clamp'
          });
      
          let TabsTranslateY = this.state.scrollY.interpolate({
            inputRange: [0, 220],
            outputRange: [0, -210],
            extrapolate: 'clamp'
          });
        return (
            <View style={{ flex: 1 }}>
              <Modal
                        isVisible={this.state.gotoLoginFlow}
                        onBackButtonPress={() => this.setState({ gotoLoginFlow: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" }}>
                            <View style={{ backgroundColor: "#006BBD", height: '18%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <Text allowFontScaling={false} style={[{ fontSize: 18, fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.guestuser_create}</Text>
                            </View>
                            <View style={{ height: "30%", alignItems: "center", justifyContent: "center", marginTop: "8%" }}>
                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title1}</Text>
                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title2}</Text>
                            </View>
                            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "10%" }}>
                                <TouchableOpacity onPress={() => { this.setState({ gotoLoginFlow: false }) }}
                                    style={{ marginRight: 10, height: 42, width: 125, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_nobtn}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ gotoLoginFlow: false })
                                        const { navigate } = this.props.navigation;
                                        navigate("login", {});
                                    }}
                                    style={{ marginLeft: 10, height: 42, width: 125, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_loginbtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                <Modal
                    isVisible={this.state.statusInfo}
                    style={{ flex: 1 }}
                    swipeDirection="right"
                    animationIn="fadeIn"
                    onBackdropPress={() => this.setState({ statusInfo: false })}
                    animationOut="fadeOut">
                    <View style={{ borderRadius: 3, backgroundColor: '#FFFFFF', height: 420 }}>
                        <View style={{ backgroundColor: "#006BBD", height: '13%', width: '100%', alignItems: "center", justifyContent: "center" }}>
                            <Text allowFontScaling={false} style={{fontSize:24, color: "white", fontFamily:'Roboto-Bold' }}>{Strings.reward_popup_statuscaption}</Text>
                        </View>
                        <View style={{ alignItems: "flex-start",marginLeft:'8%',marginRight:'8%',marginTop:'5%',marginBottom:'5%' }} >
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#D99679", fontFamily:'Roboto-Bold' }}>{Strings.reward_popup_bronze}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#D99679" }}>{Strings.reward_popup_10coin}</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#BFBFBF", fontFamily:'Roboto-Bold' }}>{Strings.reward_popup_silver} </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#BFBFBF" }}>{Strings.reward_popup_25coin}</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#FFBB00", fontFamily:'Roboto-Bold' }}>{Strings.reward_popup_gold} </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#FFBB00" }}>{Strings.reward_popup_50coin}</Text>
                            <View allowFontScaling={false} style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                            <Text allowFontScaling={false} style={{ fontSize: 20, marginTop: '5%', color: "#444444", fontFamily:'Roboto-Bold' }}  >{Strings.reward_popup_platinum} </Text>
                            <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 5, color: "#444444" }}>{Strings.reward_popup_100coin}</Text>
                        </View>
                    </View>
                </Modal>
                <LoaderNew
                    ref={"loaderRef"} />
                    <Dialog visible={this.state.backendDownPopup}
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
                <Dialog
                    visible={this.state.statusinfo1}
                    onTouchOutside={() => this.setState({ statusInfo: false })}
                    animation='fade'>
                    <View style={{ alignItems: "flex-start" }} >
                        <Text allowFontScaling={false} style={{ fontSize: 26, fontWeight: 'bold', color: "#005CA1", alignSelf: 'center' }}>{Strings.reward_popup_statuscaption}</Text>
                        <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#D99679", fontWeight: 'bold' }}>{Strings.reward_popup_bronze}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#D99679" }}>{Strings.reward_popup_10coin}</Text>
                        <View  style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#BFBFBF", fontWeight: 'bold' }}>{Strings.reward_popup_silver} </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#BFBFBF" }}>{Strings.reward_popup_25coin}</Text>
                        <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#FFBB00", fontWeight: 'bold' }}>{Strings.reward_popup_gold} </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#FFBB00" }}>{Strings.reward_popup_50coin}</Text>
                        <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#444444", fontWeight: 'bold' }}  >{Strings.reward_popup_platinum} </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#444444" }}>{Strings.reward_popup_100coin}</Text>
                    </View>
                </Dialog>
                <Animated.View
                    style={{position:'absolute',
                    zIndex:1,
                    elevation:0,
                    flex:1,
                    transform : [{
                    translateY:translateY
                    }],
                    backgroundColor:'#006BBD'
                    }}
                >
                  <View style={{ width: '100%', height: 130, backgroundColor: this.getSliderBgColor(), flexDirection: "row" }}>
                    <Image source={this.state.userImage}
                        style={{ marginLeft: 8, alignSelf: "center", height: 50, width: 50, borderRadius: 40 }}
                    />
                    <View style={{ flexDirection: "column", marginLeft: 9 }}>
                        <View style={{ flexDirection: "row", marginTop: 20 }}>
                            <View style={{ width:winwidth>350?'62%':'58%' }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontSize: 14, fontFamily:'Roboto-Bold' }} numberOfLines={1}>{Strings.reward_head_hi}, {this.state.firstName}</Text>
                            </View>
                            <View style={{ width: '30%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 13, color: "white", marginLeft: '4%', textDecorationLine: 'underline', alignSelf: 'center', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }} onPress={() =>{this.setState({ statusInfo: true });this.mixpanelTrack("Status Levels View")}}>{Strings.reward_popup_statuscaption}</Text>
                            </View>
                        </View>
                        {commons.renderIf(this.state.currentBadge != "PLATINUM",
                            <View>
                                <View style={{ marginTop: 10, width: winwidth - 95 }}>
                                    <Slider
                                        minimumValue={0}
                                        maximumValue={parseInt(this.state.coinsToNextbadge)}
                                        step={1}
                                        value={parseInt(this.state.coinsCollected)}
                                        disabled={true}
                                        trackStyle={customStyles6.track1}
                                        thumbStyle={customStyles6.thumb}
                                        minimumTrackTintColor={this.getMainSliderColor()}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", paddingBottom: 0 }}>
                                    <Text allowFontScaling={false} style={{  width:winwidth>350?'23%':'25%',color: this.getMainSliderColor(this.state.currentBadge), fontSize: 13, fontFamily:'Roboto-Bold' }}>{this.state.currentBadge}</Text>
                                    <Text allowFontScaling={false} style={{ marginLeft:winwidth>350?'11%':'5%',marginRight: this.state.nextBadge!='PLATINUM'?'5%':'-1%', color: "#FFFFFF", fontSize: 13 }}>{this.state.allCoinsCollected}/{this.state.coinsToNextbadge} {Strings.reward_coin}</Text>
                                    <Text allowFontScaling={false} style={{ marginRight: '1%',marginLeft:winwidth>350?'11%':'7%', color: "#7EB4DD", fontSize: 13, fontFamily:'Roboto-Bold' }}>{this.state.nextBadge}</Text>
                                </View>
                            </View>
                        )}
                        {commons.renderIf(this.state.currentBadge == "PLATINUM",
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 25, marginLeft: 10 }}>
                                <Text allowFontScaling={false} style={{ width: 60, color: "white", fontSize: 12 }}>{this.state.currentBadge}</Text>
                                <Text allowFontScaling={false} style={{ marginLeft: '15%', color: "white", fontSize: 12 }}>{this.state.coinsCollected} {Strings.reward_points}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ width: '100%', height: 80, backgroundColor: "#3F97DC", flexDirection: "row" }}>
                    <View style={{ width: '60%', flexDirection: "column", marginLeft: '5%', marginTop: 5 }}>
                        <Text allowFontScaling={false} style={{ fontSize: 15, color: "white" }}>{Strings.reward_head_title}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <Image style={{ marginTop: 5, width: 30, height: 30 }} source={assetsConfig.aprrowCoin} />
                            <Text allowFontScaling={false} style={{ marginTop: 3, marginLeft: 3, fontSize: winwidth>350?25:22, color: "white", fontFamily:'Roboto-Bold' }}>{this.state.coinsCollected}</Text>
                            <Text allowFontScaling={false} style={{ marginTop: 10, marginLeft: 3, fontSize: winwidth>350?18:15, color: "white", fontFamily:'Roboto-Bold' }}>{Strings.reward_head_aprrowcoin}</Text>
                        </View>
                    </View>
                    <View style={{ width: '30%', flexDirection: 'row', flex: 1, marginTop: '2%', marginLeft: '1%', marginRight: '3%', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text allowFontScaling={false} onPress={() =>{
                            this.mixpanelTrack("Use Now");
                            this.goToStore()}} style={{ marginLeft: 3, fontFamily:'Roboto-Bold', fontSize: 20, color: "#FFBB00" }}>{Strings.reward_head_usenow} </Text>
                        <Image style={{ height: 15, width: 12 }} source={assetsConfig.arrowDownGold}></Image>
                    </View>
                </View>
              </Animated.View>
        <Animated.View style={{
          flex: 0,
          marginTop:210,
          backgroundColor:'green',
          transform: [{translateY: TabsTranslateY}],
          height: Dimensions.get('window').height
        }}>

        
                <Tabs 
                  style={{
                      transform :[{transform:tabY}],
                      zIndex:2,
                      width:"100%",
                  }}                
                >
                    {/* First tab */}
                    <View title={Strings.reward_tab_head1} style={{ flex: 1, backgroundColor: "white"}}>
                    <Animated.ScrollView
  q                     scrollEventThrottle={1}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        style={{zIndex: 0, height: "100%", elevation: -1}}
                        onScroll={Animated.event(
                            [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                            {useNativeDriver: true},
                        )}
                        overScrollMode="never">
                        
                        <FlatList
                            data={this.state.taskProgress}
                            style={{flex:1,marginTop:0}}
                            extraData={this.state}
                            renderItem={({ item }) =>
                                <View style={{ marginTop: 15, marginBottom: 15, marginLeft: 5, flexDirection: "column" }}>
                                    {commons.renderIf(!item.eligibleforcoin,
                                        <View style={{flex:1}}>
                                            <View style={{flex:0}}>
                                                <View syle={{ flexDirection: "row" }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 17, color: "black" }}>{item.taskheading}</Text>
                                                </View>
                                                <View syle={{ flexDirection: "row" }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 13, width: '90%',marginLeft:-3,textAlign:'justify' }} > {item.taskdescription}</Text>
                                                    <Image style={{ marginTop: -20, marginRight: 8, alignSelf: "flex-end", width: 30, height: 30 }} source={assetsConfig.aprrowCoin} />
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
                                                    minimumTrackTintColor='#0077FF'
                                                />
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
                                                    <Text allowFontScaling={false} style={{ color: "#1aad39", fontSize: 22, fontFamily:'Roboto-Bold' }}>{Strings.reward_congratulations}</Text>
                                                    <Text allowFontScaling={false} style={{ fontSize: 16, color: 'black', marginTop: '2%', marginLeft: '2%' }}>{item.taskheading} {Strings.reward_reward}</Text>
                                                    <View style={{ flexDirection: "row", marginTop: '2%', alignItems: 'center', marginLeft: '16%' }}>
                                                        <Image style={{ width: 30, height: 30 }} source={assetsConfig.aprrowCoin} />
                                                        <Text allowFontScaling={false} style={{ fontSize: 18, marginLeft: 3 }}>x{item.numberofcoins}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ width: '45%', marginTop: '5%' }}>
                                                    <TouchableOpacity style={{ height: 45, width: 100, backgroundColor: "#1aad39", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.collectCoins(item)}>
                                                        <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.reward_collect}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={{ width: '100%', height: 1, marginTop: '5%', backgroundColor: "#BFBFBF" }} />
                                        </View>
                                    )}
                                </View>
                            }>
                        </FlatList>
                    <View style={{marginTop: Height * 0.40}}/>
                        
                        </Animated.ScrollView>
                    </View>
                    <View title={Strings.reward_tab_head2} style={{ flex: 1, backgroundColor: "white" }}>
                    <Animated.ScrollView
  q                     scrollEventThrottle={1}
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        style={{zIndex: 0, height: "100%", elevation: -1}}
                        onScroll={Animated.event(
                            [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}],
                            {useNativeDriver: true},
                        )}
                        overScrollMode="never">
                        <FlatList
                            data={this.state.timeLine}
                            style={{ flex: 1, marginTop: 35 }}
                            renderItem={({ item }) =>
                                <View style={{ marginLeft: 25, flexDirection: "row" }}>
                                    <View style={{ flexDirection: "column" }}>
                                        <Image style={{ marginLeft: this.getMargin(item.reachednewlevel) }} source={this.getImageForTimeline(item.badge, item.reachednewlevel, false)} />
                                        <Image style={{ marginLeft: 21 }} source={this.getImageForTimeline(item.badge, item.reachednewlevel, true)} />
                                    </View>
                                    <View style={{ flexDirection: "column", marginLeft: '2%' }}>
                                        <Text allowFontScaling={false} style={{ fontSize:item.taskheading.length>15?17:18}} numberOfLines={2}>{item.taskheading}</Text>
                                        <Text allowFontScaling={false}>{item.date}</Text>
                                    </View>
                                </View>}>
                        </FlatList>
                        </Animated.ScrollView>
                    </View>
                </Tabs>
               
                </Animated.View>
            </View >
        )
    }
}
var customStyles6 =
    StyleSheet.create({
        track: {
            height: 14,
            borderRadius: 2,
            backgroundColor: '#BFBFBF',
            borderColor: '#BFBFBF',
            borderWidth: 1,
        },
        track1: {
            height: 14,
            borderRadius: 2,
            backgroundColor: '#7eb4dd',
            borderColor: '#7eb4dd',
            borderWidth: 1,
        },
        thumb: {
            width: 0,
            height: 0,
            borderRadius: 2,
            backgroundColor: '#BFBFBF',
            borderColor: '#9a9a9a',
            borderWidth: 1,
        },
        texstyle: {
            fontSize: 18,
            color: "black"
        }
    });