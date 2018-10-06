import React, { Component } from 'react';
import {BackHandler,Dimensions,Platform, FlatList, Text, TextInput, KeyboardAvoidingView, Button, View, StyleSheet,Animated,   Image, ScrollView, TouchableOpacity, AsyncStorage, ToastAndroid } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Dialog } from 'react-native-simple-dialogs';
import ToastExample from './nativemodules/Toast';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import LoaderNew from './utils/LoaderNew';
import Permissions from 'react-native-permissions'
import appusageservice from './appusageupdatingservice.js';
import syncingservice from './backgroundservices.js';
import loactiontrackingservice from './locationtracking.js';
import smartstaxservice from './smartstaxservice.js';
import smartstaxAppUpdateservice from './smartstaxAppUpdateservice.js';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Swiper from 'react-native-swiper';
import device_style from './styles/device.style';
import PushNotification from 'react-native-push-notification';
import { Header } from 'react-navigation';
import assetsConfig from "./config/assets.js";
import Strings from './utils/strings.js';
var {height, width} = Dimensions.get('window');
var DeviceInfo = require('react-native-device-info');
var awsData = require("./config/AWSConfig.json");
var Mixpanel = require('react-native-mixpanel');
var isTablet1= DeviceInfo.isTablet();
var DhId = DeviceInfo.getUniqueID();
var vtoken = "";
var notificationCounter = 0;
var NotCount = 0;
appusageservice.starservice();
syncingservice.startsyncingservice();
loactiontrackingservice.starservice();
smartstaxservice.starservice();
smartstaxAppUpdateservice.starservice();
export default class Welcome extends Component {
  scroll = new Animated.Value(0);
  headerY;
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation
    let title =<Image style={{width:390,height:66}} source={assetsConfig.logoAprrowWhite130x22}/>;
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18,alignSelf:'center' };
    let headerTintColor = 'white';
    return {  headerStyle, headerTitleStyle, headerTintColor, 
     }; 
  }; 
  handleSave = () => {
    this.setState({ isOpen: !this.state.isOpen, });
  }
/** 
  * (Exit from app)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  async handleBackButtonClick() 
      {        
        BackHandler.exitApp();
        return false;           
      }
/** 
  * (Update the count of notfication in the badge)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/    
  async badgeCountCall(notification)
  {   
      const{navigate}=this.props.navigation;
      if (notification.foreground) {
        //new notification, display it
        PushNotification.localNotificationSchedule({
          message: notification.message, 
          date: new Date(Date.now()),
        });
      } else {
        if (notification.userInteraction == true) {
          notification.userInteraction == false
          PushNotification.cancelAllLocalNotifications();
        }
      }
      var Ncount = await AsyncStorage.getItem("BadgeNo");
      if (Ncount == null) {
        await AsyncStorage.setItem("BadgeNo", "1");
      } else {
        var count = parseInt(Ncount);
        count++;
        await AsyncStorage.setItem("BadgeNo", count + "");
      }
      this.props.badgeCount();
      if (Platform.OS == 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
  }
/** 
  * (Configure push notification)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async PushNotificationConfigure() {
    const { navigate } = this.props.navigation;
    const {_this}=this;
    var awsData = require("./config/AWSConfig.json");
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        vtoken = token.token;
      },
      // (required) Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        this.badgeCountCall(notification);
      },
      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: awsData.senderID,
      // IOS ONLY (optional): default: all - Permissions to register.
      /*  permissions: {
            alert: true,
            badge: true,
            sound: true
        }, */
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });
  }
/** 
  * (Local notification when forground)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  snsNotification() {
    PushNotification.localNotificationSchedule({
      /* iOS and Android properties */
      title: "My Notification Title", // (optional)
      message: "My Notification Message", // (required)
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      date: new Date(Date.now() + (60 * 1000)), // in 60 secs
    });
  }
/** 
  * (Push the notification to backend )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async NotificationFetch() {
    var awsData = require("./config/AWSConfig.json");
    var awsLamda = require("./config/AWSLamdaConfig.json");
    var notificationId = await AsyncStorage.getItem("username");
    var emailId = notificationId;
    var notification=1;
    var token = " ";
    if (notification == 1) {
      token = vtoken;
    }
    else if (notification == 0) {
      token = " ";
    } else {
      await AsyncStorage.setItem("NotificationPermission", '1');
      token = vtoken;
    }
    var Ndata = {
      "userid": notificationId,
      "emailid": emailId,
      "device": [{
        "id": DhId + '#android',
        "token": token,
      }]
    }
    var acceesToken=await commons.get_token();
    fetch('' + awsData.path + awsData.stage + awsLamda.snspushnotification, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization':acceesToken
      },
      body: JSON.stringify(Ndata),
    }).then((response) => response.json())
      .then((responseJson) => {
      })
      .catch((error) => {
        console.error(error);
      });
  } 
  /** 
        Location Permission Popup Enable
        @param Nil
        @return Nil
        @created by DhiD7
        @modified date 
    */
  async requestPermission(){
    await Permissions.request('location').then(async response => {
      this.setState({ locationAppPermission: response })
    })
  }
  /** 
        Location Permission Checking and Enabling
        @param Nil
        @return Nil
        @created by DhiD7
        @modified date 
    */
  async locationPermission()
  {
    await Permissions.check('location').then(async response => {
      await this.setState({ locationAppPermission: response })
      });
    if(this.state.locationAppPermission!='authorized')
    {
      await this.requestPermission();
    }
    var hasaksedpersmission = await AsyncStorage.getItem("askedlocation");
    var locationpermission = await ToastExample.checkstatusof_GPS()  
    const deviceid = await AsyncStorage.getItem("currentdeviceid");  
    if (hasaksedpersmission == null && !locationpermission && deviceid!=null) {
      AsyncStorage.setItem("askedlocation", "1");
      ToastExample.askpermissionforGPS(); 
    }
  }
/** 
  * (Checks for the backend(web portal) health )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  async isBackendDown(){
    var awsData = require("./config/AWSConfig.json");
    var resp_flag=false;
    var request = new XMLHttpRequest();  
   await request.open('GET', awsData.WebsitePath, true);
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
        this.setState({backendDown:true});
       }
      else
    {
      this.setState({backendDown:false});
    } }
   }, 2000);
  }
 async componentDidMount()
 {
  var connectionstatus = await commons.isconnected();
  if (!connectionstatus) {
    this.setState({offlineFlag:false}) 
    }
    else{
      this.setState({offlineFlag:true}) 
      await this.isBackendDown();   
    }
    this.mixpanelTrack("Home Page");
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    // We can only set the function after the component has been initialized    
  this.setState({initialLoad:1});
    var Ncount=await AsyncStorage.getItem("BadgeNo");
    var count=0;
    if(Ncount!=null)
    {
       count=Ncount;
       this.props.navigation.setParams({ count: count });
    }
    this.setState({ loading: true });
    this.PushNotificationConfigure();
    this.NotificationFetch();
    await this.welcomebox();
    var SmartFlag =await commons.checkSmartFlag();
    if(SmartFlag==true)
    {
     this.smartAppFetch();
    }
    this.listAllApps();
    var username2 = await AsyncStorage.getItem("username");
    var awsLamda = require("./config/AWSLamdaConfig.json");
    var urlNmae="";
    if (username2 == null || username2 == commons.guestuserkey()) {
      urlNmae=awsLamda.commenapis;    
    }
    else
    {
      urlNmae=awsLamda.webrewardsmanagement;
    }
    var awsData = require("./config/AWSConfig.json");
    var s3config = require("./config/AWSConfig.json");
    var acceesToken=await commons.get_token();
    fetch('' + awsData.path + awsData.stage + urlNmae, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization':acceesToken
        },
        body: JSON.stringify({
            "operation": "getAllHomeBannerDataFrMobile"
        }),
    }).then((response) => response.json())
        .then(async (responseJson) => {
            var images = [];
            var bannerDet = [];
            for (var i = 0; i < responseJson.length; i++) {
                images.push( s3config.s3path+"/"+s3config.s3bucketname+"/"+s3config.homebanners+"/HomeBanner_"+responseJson[i].bannerId+".jpg" + "?time=" + responseJson[i].createtime)
                var eachBanDet= { "key": ""+i};           
                eachBanDet["staxid"]=responseJson[i].ContentId;
                eachBanDet["category"]=responseJson[i].Category;
                eachBanDet["bimage"]=s3config.s3path+"/"+s3config.s3bucketname+"/"+s3config.homebanners+"/HomeBanner_"+responseJson[i].bannerId+".jpg" + "?time=" + responseJson[i].createtime;
                bannerDet.push(eachBanDet);
            }
            this.setState({
               bannerLength:(responseJson.length-1),
               banners: images,
                loading: false,
                bannerDet:bannerDet
            });
        })
        .catch((error) => {
            console.error(error);
        });
    var username3 = await AsyncStorage.getItem("username");
    var urlName="";
    var awsLamda = require("./config/AWSLamdaConfig.json");
    if (username3 == null || username3 == commons.guestuserkey()) {     
      urlName=awsLamda.commenapis;
    }
    else
    {
      urlName=awsLamda.contentmanagement;
    }
     fetch('' + awsData.path + awsData.stage +urlName, {
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization':acceesToken
      },
      body: JSON.stringify({
          "operation": "getLatestStax"
      }),
  }).then((response) => response.json())
      .then(async (responseJson) => {
          var newatapprowstore = [];
          for (var i = 0; i < responseJson.length; i++) 
          {
           var cid=responseJson[i].contentid;
            var kk= { "key": ""+i, "preview": s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + cid + ".jpg" }; 
            kk["staxid"]=responseJson[i].contentid;
            kk["category"]=responseJson[i].category;
            kk["widgetName"]=responseJson[i].widgetname;
            newatapprowstore.push(kk);
          }
          this.setState({ loading: false, newAtAppStore: newatapprowstore });
      })
      .catch((error) => {
          console.error(error);
      });  
  }
/** 
  * (Banner Timeout on manual swipe)
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
  * (naviagets to purchase screen)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/      
  bannerOnclick()
  {
    this.mixpanelTrack("Clicks to Banner");
    var pos=this.state.position;
    var bannerDet=this.state.bannerDet;
    for(i=0;i<bannerDet.length;i++)
    {
     if(bannerDet[i].key==pos)
     {
       const { navigate } = this.props.navigation;
       commons.replaceScreen(this, "store_purchase", user = { "staxid": bannerDet[i].staxid, "category": bannerDet[i].category });
     }
    }
  }
  async RecomponentDidMount() 
  {
    var connectionstatus = await commons.isconnected();
    if (!connectionstatus) {
      this.setState({offlineFlag:false}) 
      }
      else{
        this.setState({offlineFlag:true}) 
        await this.isBackendDown(); 
      }
    if(this.state.initialLoad==1)
    {
      this.setState({initialLoad:2});  
    }
    else if(this.state.initialLoad==2)
    {
                  var Ncount=await AsyncStorage.getItem("BadgeNo");
                  var count=0;
                  if(Ncount!=null)
                  {
                      count=Ncount;
                      this.props.navigation.setParams({ count: count });
                  }
                  this.PushNotificationConfigure();
                  this.NotificationFetch();
                  this.welcomebox();
                      var SmartFlag =await commons.checkSmartFlag();
                      if(SmartFlag==true)
                      {
                       this.smartAppFetch();
                      }
                  this.listAllApps();
                  var awsData = require("./config/AWSConfig.json");
                  var s3config = require("./config/AWSConfig.json");
                  var acceesToken=await commons.get_token(); 
                  var username = await AsyncStorage.getItem("username");
                  var urlName="";
                  var awsLamda = require("./config/AWSLamdaConfig.json");
                  if (username == null || username == commons.guestuserkey()) {     
                    urlName=awsLamda.commenapis;
                  }
                  else
                  {
                    urlName=awsLamda.webrewardsmanagement;
                  }              
                  fetch('' + awsData.path + awsData.stage + urlName, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':acceesToken
                    },
                    body: JSON.stringify({
                        "operation": "getAllHomeBannerDataFrMobile"
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        var images = [];
                        var bannerDet = [];
                        for (var i = 0; i < responseJson.length; i++) {
                            images.push( s3config.s3path+"/"+s3config.s3bucketname+"/"+s3config.homebanners+"/HomeBanner_"+responseJson[i].bannerId+".jpg")
                            var eachBanDet= { "key": ""+i};
                            eachBanDet["staxid"]=responseJson[i].ContentId;
                            eachBanDet["category"]=responseJson[i].Category;
                            eachBanDet["bimage"]=s3config.s3path+"/"+s3config.s3bucketname+"/"+s3config.homebanners+"/HomeBanner_"+responseJson[i].bannerId+".jpg";
                            bannerDet.push(eachBanDet);
                        }
                        this.setState({
                           bannerLength:(responseJson.length-1),
                           banners: images,
                            loading: false,
                            bannerDet:bannerDet
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                  var urlName1="";
                  var awsLamda = require("./config/AWSLamdaConfig.json");
                  if (username == null || username == commons.guestuserkey()) {     
                    urlName1=awsLamda.commenapis;
                  }
                  else
                  {
                    urlName1=awsLamda.contentmanagement;
                  }   
                  fetch('' + awsData.path + awsData.stage + urlName1, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':acceesToken
                    },
                    body: JSON.stringify({
                        "operation": "getLatestStax"
                    }),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        var newatapprowstore = [];
                        for (var i = 0; i < responseJson.length; i++) 
                        {
                          var cid=responseJson[i].contentid;
                          var kk= { "key": ""+i, "preview": s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + cid + ".jpg" };
                          kk["staxid"]=responseJson[i].contentid;
                          kk["category"]=responseJson[i].category
                          newatapprowstore.push(kk);
                        }
                        this.setState({ loading: false, newAtAppStore: newatapprowstore });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
    }
  }
  constructor(props) {
    super(props); 
    this.headerY = Animated.multiply(Animated.diffClamp(this.scroll, 0, 60), -1);
    this.state = {
      showDialog_d3:false,
      dialogVisible: false,
      username: "User Name",
      device: '',
      position: 0,
      interval: null,
      isOpen: false,
      selectedItem: 'About',
      valid: '#1569C7',
      deviceName: "",
      deviceId: [],
      len: 0,
      loading: false,
      trendingApps: [],
      recomendedApps: [],
      smartApps:[],
      smartAppTemp:[],
      devices: [{ "devicename": "test", "platform": "ios", "iscurrentdevice": false,"android":"none","ios":"none","tab_android":"none","tab_ios":"none","phone_android":"none","phone_ios":"none" }, { "devicename": "test2", "platform": "android", "iscurrentdevice": true,"android":"none","ios":"none","tab_android":"none","tab_ios":"none","phone_android":"none","phone_ios":"none" }],
      dialogVisibleRename: false,
      editingDeviceKey: "",
      addedCurrentDevice: true,
      banners: [],
      newAtAppStore:[],
      appUsageBox:false,
      appUsageBoxOk:false,
      MostFrequentViewDisable:'none',
      MostFrequentViewEnable:'flex',
      SmartStaxDisable:'none',
      SmartStaxEnable:'flex',
      tutorialBox: false,
      bannerLength:0,
      initialLoad:0,
      offlineFlag:true,
      bannerDet:[],
      SmartVisible:'none',
      bannerTimeout:5,
      backendDown:false,
      locationAppPermission:""
    }
   this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
/** 
  * (Fetches the smart aprrow apps from the backend)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async smartAppFetch()
  {
      var connectionstatus = await commons.isconnected();
      var username = await AsyncStorage.getItem("username");
      if (username == null || username == commons.guestuserkey()) {
      }
      else
      {
             /***** mostusedwidget flag
               * 0-->mostusedwidget
               * 1-->customized
               * 2-->purchased
               * 3-->sharing
               * 4-->smartstax
               * ******/
                // var appsString = await ToastExample.getmostusedapps();
                 // var apps = JSON.parse(appsString);
                 var smartstaxid=await AsyncStorage.getItem('smartstaxid');
                 const username = await AsyncStorage.getItem("username");
                 var deviceid = await AsyncStorage.getItem("currentdeviceid");
                  var smart_widget_id = await commons.getuuid();
                  var smart_widget_name ="Smart Stax";// "Smart APRROW";
                  var smart_mostusedwidget = 4;
                  var smart_applists = [];
                  var time = commons.gettimestamp(); 
                if(smartstaxid!=undefined && smartstaxid!=null && smartstaxid!="")
                 { 
                    var result = await databasehelper.getwidget(smartstaxid);                   
                    var r=[]
                    if(result.dataObj.hasOwnProperty("applist"));
                    { 
                     r=result.dataObj.applist;                    
                    }
                    await this.setState({smartAppTemp:r});  
                    await this.listAllApps();        
                 }
                else
                {
                if(deviceid!=null)
                {
                  if(connectionstatus)
                  {
                    var lastlocation1 = await AsyncStorage.getItem("lastlocation");
                      var lastlocation ={};
                      if(lastlocation1!=null)
                      { lastlocation=JSON.parse(lastlocation1); }
                      var llat="";
                      var llong="";
                      if(lastlocation.hasOwnProperty("lat"));
                          llat=lastlocation.lat; 
                      if(lastlocation.hasOwnProperty("long") );
                          llong=lastlocation.long;  
                      var sInput={};
                          sInput["operation"]="getAppsList";
                          sInput["userid"]   =username;
                          sInput["deviceid"] =deviceid;                            
                          sInput["lat"]      =""+llat;
                          sInput["long"]     =""+llong;                                   
                      var awsData = require("./config/AWSConfig.json");
                      var awsLamda = require("./config/AWSLamdaConfig.json");
                      var acceesToken=await commons.get_token();
                      fetch(''+awsData.path+awsData.stage+awsLamda.smartstaxmgmt, {
                           method: 'POST',
                           headers: {
                               Accept: 'application/json',
                               'Content-Type': 'application/json',
                               'Authorization':acceesToken
                           },
                           body:JSON.stringify(sInput)
                       }).then((response) => response.json())
                           .then(async (responseJson) => 
                           {                            
                               if(responseJson.length>0)  
                               {  
                                    for (let i = 0; i < responseJson.length; i++) 
                                    {
                                      var appobj = responseJson[i];
                                      var dbApp = {};
                                      dbApp["package"] =appobj.package; // appobj.applabel;
                                      dbApp["appname"] = appobj.appname;
                                      smart_applists.push(dbApp);
                                    }
                                }
                                  await this.setState({smartAppTemp:smart_applists});
                                  if(deviceid!=undefined && deviceid!=null && deviceid!="")
                                  {
                                   var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, deviceid);
                                   await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                                   await this.listAllApps();
                                  }                                 
                           })
                           .catch((error) => {
                               console.log(error);
                           });   
                  }
                  else
                  {
                      var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, deviceid);
                      await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                  }
                }
                }                                     
      }
  }
/** 
  * (Calls the locaton and app usage permission request)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async AprrowPermission() {
    await this.locationPermission();
    var enabledAppUsagePermission = await ToastExample.checkappusagepermission()
    if (!enabledAppUsagePermission) {
     var a= await ToastExample.askpermission();
      var k=await ToastExample.checkappusagepermission(); 
      if(k==true)
      {
        var MFW=await AsyncStorage.getItem("mostusedwidgetid");
        var smartstaxid=await AsyncStorage.getItem("smartstaxid");
        if(MFW==undefined||MFW=='undefined')
         {  
            this.MostFrequentWidget();          
         }
         var SmartFlag =await commons.checkSmartFlag();
        if(SmartFlag==true)
        {
          if(smartstaxid==undefined ||smartstaxid==null || smartstaxid=='undefined')
          {
           this.smartAppFetch();
          }
        }  
         this.listAllApps();
      }
      await this.setState({tutorialBox:true});
    }
  }
/** 
  * (creates the Most Frequent App widget)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async MostFrequentWidget() {
    var appsString = await ToastExample.getmostusedapps();
    var apps = JSON.parse(appsString);  
    var applists = [];
    for (let i = 0; i < apps.length; i++) {
      var appobj = apps[i];
      var dbApp = {};
      dbApp["appname"] = appobj.applabel;
      dbApp["package"] = appobj.package;
      applists.push(dbApp);
    }
    time = commons.gettimestamp();
    var deviceId = await AsyncStorage.getItem("currentdeviceid");
    var widget_id = await commons.getuuid();
    var widget_name = "Most Frequent";
    var mostusedwidget = 0;
    var result = await databasehelper.insertwidget(widget_id, widget_name, JSON.stringify(applists), time, mostusedwidget, deviceId);
    await AsyncStorage.setItem('mostusedwidgetid', widget_id);
   this.props.handler();  
    this.listAllApps();
  }
/** 
  * (Navigate to most frequent or smart stax)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/    
  async smartandMostredirect(Type) 
  {    
        var stax_id="";
        if(Type=="most")
        {
          stax_id= await AsyncStorage.getItem("mostusedwidgetid");     
        }
        else
        {
          stax_id = await AsyncStorage.getItem("mostusedwidgetid");     
        }     
        if(stax_id!=null && stax_id!='null' && stax_id!=undefined && stax_id!="undefined" && stax_id!="")
           this.props.setNavigation('STAX',stax_id);
   }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    clearInterval(this.state.interval);
  }
/** 
  * (Launches the app based on package name)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async luanchapp(packagename,opFlag,appNme) { 
    this.mixpanelTrack("App Launched");
    if(opFlag=="most")
    {
      var  mostData="Most Used Apps :"+appNme
      this.mixpanelTrack(mostData);     
    }
    else if(opFlag=="dev")
    {
      var devData="Device Apps :"+appNme;
      this.mixpanelTrack(devData);       
    }
    else if(opFlag=="smart")
    {
      var smrtDta="SMART APPROW Apps :"+appNme;
      this.mixpanelTrack(smrtDta);
    }
    ToastExample.launchapp(packagename);
  }

  openDialog_d3(show) {
    this.setState({ showDialog_d3: show });
  }
/** 
  * (Navigate to store_purchase page)
  * @param  :item(stax data)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
     onclickstack(item) {   
      this.mixpanelTrack("Stax Opened :"+item.widgetName);             
    const { navigate } = this.props.navigation;
    commons.replaceScreen(this, "store_purchase", user = { "staxid": item.staxid, "category": item.category, "ChkFlag":"1" });
   }
/** 
  * (Naviagte to Home page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
   offlineFunc()
   {
   this.props.setNavigation('Home');
   }
/** 
  * (Fetch all apps from device
  *  >>Creates Most used apps, smart apps, recomended apps)
  * @param  :nil   
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async listAllApps() {
    ToastExample.getapps(
      (msg) => {
        console.log(msg);
      },
      async (applist) => {
        var applist_fromdevice = JSON.parse(applist);
        var trending_App_List = [];
        var recomended_App_List = [];
        var mostused_apps = [];
        var enabledAppUsagePermission = await ToastExample.checkappusagepermission()
        if (enabledAppUsagePermission) {
          this.setState({MostFrequentViewDisable:'none',MostFrequentViewEnable:'flex'});
          this.setState({SmartStaxDisable:'none',SmartStaxEnable:'flex'});
          var apps = await ToastExample.getmostusedapps();
          apps = JSON.parse(apps);
          for (var i = 0; i < apps.length; i++) {
            var apptempobj = {};
            apptempobj["applabel"] = apps[i].applabel;
            apptempobj["package"] = apps[i].package;
            mostused_apps.push(apptempobj);
          }
        }else {
          this.setState({MostFrequentViewDisable:'flex',MostFrequentViewEnable:'none'});
          this.setState({SmartStaxDisable:'flex',SmartStaxEnable:'none'});
        }
        var packagename_icon_mapping = {};
        for (let i = 0; i < applist_fromdevice.length; i++) {
          let icon = "file://" + applist_fromdevice[i].icon;
          let applabel = applist_fromdevice[i].applabel;
          let packagename = applist_fromdevice[i].package;
          let usage = applist_fromdevice[i].usage;
          var appobj = {};
          appobj["key"] = i + "";
          appobj["icon"] = icon;
          appobj["package"] = packagename;
          appobj["applabel"] = applabel;
          appobj["bgcolor"] = "white"
          appobj["usage"] = usage;
          packagename_icon_mapping[packagename] = appobj;
          trending_App_List.push(appobj);
        }
        global.applist=packagename_icon_mapping;
        AsyncStorage.setItem("appdata",JSON.stringify(packagename_icon_mapping));
        for (let i = 0; i < mostused_apps.length; i++) {
          mostused_apps[i]["key"] = i + "";
          mostused_apps[i]["icon"] = 'data:image/png;base64';
          if (packagename_icon_mapping.hasOwnProperty(mostused_apps[i].package))
            mostused_apps[i]["icon"] = packagename_icon_mapping[mostused_apps[i].package].icon;
        }
        var smartAppTemp=this.state.smartAppTemp;
     if(smartAppTemp!=null && smartAppTemp.length>0)  
     {
        for (let i = 0; i < smartAppTemp.length; i++) {
          smartAppTemp[i]["key"] = i + "";
          smartAppTemp[i]["icon"] = 'data:image/png;base64';
          if (packagename_icon_mapping.hasOwnProperty(smartAppTemp[i].package))
          smartAppTemp[i]["icon"] = packagename_icon_mapping[smartAppTemp[i].package].icon;
          else smartAppTemp[i]["icon"] =commons.getIconUnavailable();
        }
      }
        trending_App_List.sort(function (a, b) {
          var prop = "applabel";
          if (a[prop] > b[prop]) {
            return 1;
          } else if (a[prop] < b[prop]) {
            return -1;
          }
          return 0;
        })
        this.setState({
          trendingApps: trending_App_List,
          recomendedApps: mostused_apps,
          smartApps:smartAppTemp
        });
        if(this.state.smartApps.length>0)
        {
          this.setState({SmartVisible:'flex'});
        }
        else{
          this.setState({SmartVisible:'none'});
        } 
      });
  }
/** 
  * (Inserts Device
  *  >>Fetches the smart apps )
  * @param  :nil    
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
 async device_insert() {
    this.refs.loaderRef.show(); 
    var devicehardid = DeviceInfo.getUniqueID();
    var model = DeviceInfo.getBrand() + " " + DeviceInfo.getModel();
    var istab=await DeviceInfo.isTablet();
    var manufacturer =await DeviceInfo.getManufacturer();
    var device = DeviceInfo.getModel();
    if (device.length <= 15 && device.length > 0) {
      var deviceId = await commons.getuuid();
      var time = commons.gettimestamp();
      var res = await databasehelper.insertdevice(device, deviceId, time, devicehardid, model,istab,manufacturer);
      await AsyncStorage.setItem("currentdeviceid", deviceId);
      this.refs.loaderRef.hide();
        this.openDialog_d3(false);
      } else {
        this.setState({ valid: 'red' });
        this.refs.loaderRef.hide();
      }
      var enabledAppUsagePermission = await ToastExample.checkappusagepermission()
    if (!enabledAppUsagePermission) {
      this.setState({appUsageBox:true})
    }
    else {
      this.MostFrequentWidget(); 
      var SmartFlag =await commons.checkSmartFlag();   
      if(SmartFlag==true)
      {
        this.smartAppFetch();
      }
    }
  } 
  showstax() {
  }
  renamedevice() {
  }
  replicatedevice(item) {
    const { navigate } = this.props.navigation;
    navigate("ShareStax", user = { item });
  }
  showapplist() {
  }
  deletedevice() {
  }
/** 
  * (fetch device data for user
    >>get current devices
    >>check new devices and new devices to update)
  * @param  :nil   
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async updateLocaldb() {
    var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
      let dObj = {};
      var maxtimeObj = await databasehelper.maxDeviceUpdatetime();
      var maxtime = maxtimeObj.updatetime;
      var deviceListObj = await databasehelper.getAlldeviceDeletedAlso();
      if (deviceListObj.dataArray != undefined && deviceListObj.dataArray != 'undefined') {
        var deviceList = deviceListObj.dataArray;
        if (deviceList.length > 0) {
          for (let i = 0; i < deviceList.length; i++) {
            var createtime = 0;
            dObj[deviceList[i]["deviceid"]] = deviceList[i]["createtime"];
          }
        }
      }
      var username = await AsyncStorage.getItem("username");
      var awsData = require("./config/AWSConfig.json");
      var awsLamda = require("./config/AWSLamdaConfig.json");
      var acceesToken=await commons.get_token();
      fetch('' + awsData.path + awsData.stage + awsLamda.userdatamgnt, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization':acceesToken
        },
        body: JSON.stringify({
          "operation": "getUserDeviceList",
          "TableName": "Users",
          "username": username,
          "maxtime": maxtime
        }),
      }).then((response) => response.json())
        .then(async (responseJson) => {
          var devicedata = responseJson.device;     
          var newdeviceArray = [];
          var updatedeviceArray = [];
          if (devicedata != null && devicedata.length > 0) {
            for (let i = 0; i < devicedata.length; i++) {
              var deviceid = devicedata[i].deviceid;
              var createtime = devicedata[i].createtime;
              if (dObj.hasOwnProperty(deviceid)) {
                if (dObj[deviceid] < createtime)
                  updatedeviceArray.push(devicedata[i])
              }
              else {
                newdeviceArray.push(devicedata[i])
              }
            }
          }
          if (newdeviceArray.length > 0 || updatedeviceArray.length > 0)
            await databasehelper.bulkinsertAndUpdatedevice(newdeviceArray, updatedeviceArray);
        })
        .catch((error) => {
          this.refs.loaderRef.hide();
          console.error(error);
        });
    }
  }
/** 
  * (Create device and insert)
  * @param  :nil   
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  async welcomebox() {
    var devicehardid = DeviceInfo.getUniqueID();
    var user = await databasehelper.getuser();
    var loginuser = user.res[0]["username"];
    this.setState({ username: loginuser });
    var result = await databasehelper.getdevice(devicehardid);
    var len = result.dataArray.length;
    if (len <= 0) {
      await this.setState({ addedCurrentDevice: false });
      this.device_insert();
    }
  }
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
  render() {
    const { navigate } = this.props.navigation
    return (
      <View style={{flex:1}}>
      <Animated.View style={[{position:'absolute',
            zIndex:1,
            elevation:0,
            flex:1,
            transform : [{
              translateY:this.headerY
            }],
            backgroundColor:'#006BBD'
            }]}>
            <View style={{flex:1,height:60, width:width,justifyContent:'center',alignContent:'center',flexDirection:'row'}}>
              <View style={{ marginTop:60 * 0.3}}>
                <Image style={{}} source={require("./assets/logo_aprrow_white_130x22.png")}/>
              </View>
            </View>
        </Animated.View>
        <LoaderNew ref={"loaderRef"}  />
        <Dialog
          visible={this.state.appUsageBox}
          onTouchOutside={() => this.setState({ appUsageBox: false })}
          animation='bottom'
        >
        <View style={[dialogbox.dialog_content,{width:'100%'}]}>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.06,color: "#F88017",marginBottom: "10%",marginTop:'5%',textAlign:'center',fontFamily:'Roboto-Bold'}}>{Strings.welcome_welcomeboxTitle1}</Text> 
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'justify'}}>{Strings.welcome_welcomeboxTitle2}</Text>
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'justify'}}>{Strings.welcome_welcomeboxTitle3}</Text>
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'justify'}}>{Strings.welcome_welcomeboxTitle4}</Text>
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'justify'}}>{Strings.welcome_welcomeboxTitle5}</Text>
        </View>
      <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <TouchableOpacity style={{marginTop:'10%',width: '45%',backgroundColor:"#0065B2" }} onPress={async ()=>await this.setState({appUsageBox: false,tutorialBox:true })}>
             <Text allowFontScaling={false} style={{alignSelf:'center',padding:10,color:'#FFFFFF',fontFamily:'Roboto-Bold'}}>{Strings.welcome_welcomeboxNoButton}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginTop:'10%',width: '45%',backgroundColor:"#F88017" }} onPress={async ()=>await this.setState({appUsageBox: false,appUsageBoxOk:true })}>
              <Text allowFontScaling={false} style={{alignSelf:'center',padding:10,color:'#FFFFFF',fontFamily:'Roboto-Bold'}}>{Strings.welcome_welcomeboxEnableButton}</Text>
            </TouchableOpacity>
      </View>    
        </Dialog>
        {/*Dialog Box For App permission Window*/}
        <Dialog
          visible={this.state.appUsageBoxOk}
          onTouchOutside={() => this.setState({ appUsageBoxOk: false })}
          animation='bottom'
        >
        <View style={[dialogbox.dialog_content,{width:'100%'}]}>
        <Text allowFontScaling={false}  style={{fontSize:(Dimensions.get("window").width)*0.06,color: "#F88017",marginBottom: '10%',textAlign:'center',fontFamily:'Roboto-Bold',marginTop:'5%'}} numberOfLines={1}>{Strings.welcome_accessbox_head}</Text>  
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title1}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title2}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title3}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center',marginTop:'5%'}}>{Strings.welcome_accessbox_title4}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title5}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center',marginTop:'5%'}}>{Strings.welcome_accessbox_title6}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title7}</Text>
        <Text allowFontScaling={false} style={{fontSize:(Dimensions.get("window").width)*0.049,color: "#000000",textAlign:'center'}}>{Strings.welcome_accessbox_title8}</Text>  
        <View style={{marginTop:'10%',width: '40%',justifyContent:'center' }}>
              <Button
                color="#0065B2"
                title={Strings.welcome_accessbox_okbutton}
                onPress={async ()=>{this.setState({appUsageBoxOk: false });await this.AprrowPermission();}}
              />
            </View>
        </View>
        </Dialog>
        <Dialog
          visible={this.state.tutorialBox}
          onTouchOutside={() => this.setState({ tutorialBox: false })}
          animation='bottom'
        >
        <View style={[dialogbox.dialog_content,{width:'100%'}]}>
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.06,color: "#F88017",marginBottom: 10,textAlign:'center',fontFamily:'Roboto-Bold'}}  numberOfLines={1}>{Strings.welcome_tutorialbox_head}</Text>
        <View style={{width:'80%',marginTop:'10%'}}>
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000"}}>{Strings.welcome_tutorialbox_title1}</Text> 
        <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.049,color: "#000000",marginBottom: 10,}}>{Strings.welcome_tutorialbox_title2}</Text>
        </View>
        </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <TouchableOpacity style={{marginTop:'10%',width: '45%',backgroundColor:"#F88017" }} onPress={async ()=>{await this.setState({tutorialBox: false }); const{navigate}=this.props.navigation;
                commons.replaceScreen(this,"Tutorial",{});
                }}>
              <Text allowFontScaling={false} style={{alignSelf:'center',padding:10,color:'#FFFFFF',fontFamily:'Roboto-Bold'}}>{Strings.welcome_tutorialbox_yesbutton}</Text>
            </TouchableOpacity>
        <TouchableOpacity style={{marginTop:'10%',width: '45%',backgroundColor:"#0065B2" }} onPress={async ()=>await this.setState({tutorialBox: false })}>
             <Text allowFontScaling={false} style={{alignSelf:'center',padding:10,color:'#FFFFFF',fontFamily:'Roboto-Bold'}}>{Strings.welcome_tutorialbox_nobutton}</Text>
        </TouchableOpacity>
      </View>     
        </Dialog>
      {/* <KeyboardAvoidingView behavior='padding' style={{ flex: 1,backgroundColor:'white' }}>   */}
          <Animated.ScrollView
            style={{zIndex: 0, height: "100%", elevation: -1}}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: this.scroll}}}],
              {useNativeDriver: true},
            )}
            bounces={false}
            overScrollMode="never"
            scrollEventThrottle={1} 
           > 
           <View style={{marginTop:60}}/>
{
  commons.renderIf(this.state.offlineFlag && this.state.bannerDet.length > 0&&!this.state.backendDown,
    <Swiper style={{ flex: 1 }}
      ref={"slidermain"}
      autoplay={true}
      autoplayDirection={true}
      activeDotColor={"white"}
      autoplayTimeout={this.state.bannerTimeout}
      index={this.state.position}
      paginationStyle={{position:'absolute', bottom: 6}}
      containerStyle={{ width: Dimensions.get('window').width, height:isTablet1?350:Dimensions.get('window').height*0.32 }}
      onIndexChanged={(position) =>{this.setState({ position,bannerTimeout:5 })}}
      onTouchEnd={(index1) => this.bannerOnclick()}>
      {this.state.bannerDet.map((item_main, key) => {
        return (
          <View style={{}} key={key}>
            <View style={{ width: Dimensions.get('window').width, height:isTablet1?350:Dimensions.get('window').height*0.32  }}>
              <GestureRecognizer
                onSwipeLeft={(state) => this._indexChange1()}
                onSwipeRight={(state) => this._indexChange1()}
              >
                <Image style={{ width: Dimensions.get('window').width, height:isTablet1?350:Dimensions.get('window').height*0.32 }} source={{ uri: item_main.bimage }} />
              </GestureRecognizer>
            </View>
          </View>
        )
      })}
    </Swiper>)
}
             {commons.renderIf(!this.state.offlineFlag,
            <View style={{ flex: 1, width: '100%', height: 220 }}>
            <View style={{ marginTop:'5%' }}>
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{alignSelf:'center'}} />
                        <Text allowFontScaling={false} style={{ fontSize:21, marginBottom: 15,marginTop:10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.offline_head}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}>{Strings.offline_title1}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}>{Strings.offline_title2}</Text>
                        <Text allowFontScaling={false} style={{  fontWeight: 'bold', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}>{Strings.offline_title3}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>            
                        </View>
                    </View>
            </View>  
            )}
             {commons.renderIf(this.state.backendDown,
            <View style={{ flex: 1, width: '100%', height: 220 }}>
            <View style={{ marginTop:'5%' }}>
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{alignSelf:'center'}} />
                        <Text allowFontScaling={false} style={{ fontSize:21, marginBottom: 15,marginTop:10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.serverdown_welcome_msg1}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}>{Strings.serverdown_welcome_msg2}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}>{Strings.serverdown_welcome_msg3}</Text>
                        <Text allowFontScaling={false} style={{  fontWeight: 'bold', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={ { fontSize:14, marginBottom: 5,  textAlign: 'center' }}></Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                        </View>
                    </View>
            </View>  
            )}
             {commons.renderIf(this.state.offlineFlag&&!this.state.backendDown,
            <View style={[styles.container, { marginRight:5,width: '96%' }]}>
              <View style={{flexDirection:'row'}}>
              <Text allowFontScaling={false} style={styles.text}>{Strings.welcome_discover}</Text>
              </View>
              <FlatList 
                data={this.state.newAtAppStore}
                extraData={this.state}
                horizontal={true}
                renderItem={({ item }) =>
                  <View style={{ flexDirection: 'column', marginTop: 5, marginRight: 10, marginBottom: 4, }}>
                     <TouchableOpacity onPress={() => this.onclickstack(item)}>
                     <Image style={{height:isTablet1==true?200:Dimensions.get('window').height * (24 / 120), width:isTablet1==true?150:Dimensions.get('window').width * (33 / 120) }} source={{uri:item.preview}} />
                      </TouchableOpacity> 
                  </View>
                } />
            </View>
              )}
            <View style={[styles.container, { width: '96%' }]}>
              <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={()=>this.smartandMostredirect("smart")}>     
              <Text allowFontScaling={false} style={[styles.text,{display:this.state.SmartVisible}]}>{Strings.welcome_smartstax}</Text>
            </TouchableOpacity>   
              </View>
              <ScrollView horizontal={true} style={{display:this.state.SmartStaxEnable}}>
                <FlatList style={{ flex: 1, alignContent: 'center',}}
                  data={this.state.smartApps}
                  extraData={this.state}
                  horizontal={true}
                  renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => this.luanchapp(item.package,"smart",item.appname)}>
                      <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center',paddingRight:10,paddingTop:5,paddingBottom:5 }}>
                        <Image style={{ height: 50, width: 50 }} source={{ uri: item.icon }} />
                        <Text allowFontScaling={false} style={{ width: 60, fontSize: 12,fontWeight:'300', textAlign: 'center',color:'#000000' }}>{item.appname}</Text>{/* numberOfLines={2} */}
                      </View>
                    </TouchableOpacity>
                  }
                />  
              </ScrollView>
               <TouchableOpacity onPress={()=>this.setState({appUsageBox:true})}  style={{display:this.state.SmartStaxDisable,height:'50%',justifyContent:'center'}}> 
                <Text allowFontScaling={false} style={{textDecorationLine:'underline',color:'red',alignSelf:'center',fontSize:14,fontFamily:'Roboto-BoldItalic',display:this.state.SmartVisible}}>{Strings.welcome_enablelocationapps}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.container, { width: '96%',height:'30%' }]}>
              <View style={{flexDirection:'row'}}>
             <TouchableOpacity onPress={()=>this.smartandMostredirect("most")}>    
                <Text style={styles.text} allowFontScaling={false}>{Strings.welcome_mostfrequent}</Text>
              </TouchableOpacity>  
              </View>
              <View style={{display:this.state.MostFrequentViewEnable}}>
              <ScrollView horizontal={true} >
                <FlatList style={{ flex: 1, alignContent: 'center' }}
                  data={this.state.recomendedApps}
                  horizontal={true}
                  extraData={this.state}
                  renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => this.luanchapp(item.package,"most",item.applabel)}>
                      <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center',paddingRight:10,paddingTop:5,paddingBottom:5 }}>
                        <Image style={{ height: 50, width: 50, }} source={{ uri: item.icon }} />
                        <Text allowFontScaling={false} style={{ width: 60, fontSize: 12, textAlign: 'center',fontWeight:'300',color:'#000000' }} >{item.applabel}</Text>{/* numberOfLines={2} */}
                      </View>
                    </TouchableOpacity>
                  }
                />
              </ScrollView>
              </View>
              <TouchableOpacity onPress={()=>this.setState({appUsageBox:true})} style={{display:this.state.MostFrequentViewDisable,height:'40%',justifyContent:'center'}}>
                <Text allowFontScaling={false} style={{textDecorationLine:'underline',color:'red',alignSelf:'center',fontSize:14,fontFamily:'Roboto-BoldItalic'}}>{Strings.welcome_enablelocationapps}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.container, { width: '96%' }]}>
              <View style={{flexDirection:'row'}}>
              <Text style={styles.text} allowFontScaling={false}>{Strings.welcome_deviceapplist} </Text>
              </View>
              <ScrollView horizontal={true} >
                <FlatList style={{ flex: 1, alignContent: 'center',}}
                  data={this.state.trendingApps}
                  extraData={this.state}
                  horizontal={true}
                  renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => this.luanchapp(item.package,"dev",item.applabel)}>
                      <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center',paddingRight:10,paddingTop:5,paddingBottom:5 }}>
                        <Image style={{ height: 50, width: 50 }} source={{ uri: item.icon }} />
                        <Text allowFontScaling={false} style={{ width: 60, fontSize: 12,fontWeight:'300', textAlign: 'center',color:'#000000' }} >{item.applabel}</Text>{/* numberOfLines={2} */}
                      </View>
                    </TouchableOpacity>
                  }
                />
              </ScrollView>  
            </View>
           <View style={{height:'1%',marginBottom:'3%'}}>
            </View>
          </Animated.ScrollView>
      {/* </KeyboardAvoidingView> */}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  container1: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    maxHeight: 200,
    marginTop: 10,
    marginLeft: 10
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 2,
    marginLeft: 10,
    marginBottom: 1
  },
  viewImage: {
    width: 75,
    height: 75,
    margin: 10,
    resizeMode: Image.resizeMode.stretch
  },
  viewImage1: {
    width: 100,
    height: 150,
    margin: 10,
    resizeMode: Image.resizeMode.stretch
  },
  text: {
    marginLeft: 0,
    marginTop: 2,
    fontSize:16,
    fontFamily:'Roboto-Bold',
    color: "#2699FB", 
  },
  text1: {
    marginLeft: 10,
    marginTop: 10,
    color: "#6F9BE1",
    fontSize: 16,
    fontWeight: 'bold',
  },
  text2: {
    marginLeft: 10,
    marginTop: 12,
    fontSize: 14,
    color: "#6F9BE1",
    fontWeight: '500',
  }
});
const dialogbox = StyleSheet.create({
  dialog_content: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialog_view:
    {
      margin: 0,
      height: 300
    },
  dialog_view_ti: {
    marginBottom: 25
  },
  dialog_welcome: {
    fontWeight: '500',
    fontSize: 25,
    color: "#F88017",
    marginBottom: 10
  },
  dialog_text: {
    fontSize: 16,
    color: "#2699FB"
  },
  dialog_textinput: {
    padding: 5,
    height: 40,
    borderWidth: 1,
    borderColor: "#000000",
    marginTop: 10,
  }
});