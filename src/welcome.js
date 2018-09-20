import React, { Component } from 'react';
import { BackHandler, Dimensions, Platform, FlatList, Text, TextInput, KeyboardAvoidingView, Button, View, Image, ScrollView, TouchableOpacity, AsyncStorage } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import ToastExample from './nativemodules/Toast';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import LoaderNew from './utils/LoaderNew';

import appusageservice from './services/appusageupdatingservice.js';
import syncingservice from './services/backgroundservices.js';
import loactiontrackingservice from './services/locationtracking';
import smartstaxservice from './services/smartstaxservice.js';
import smartstaxAppUpdateservice from './services/smartstaxAppUpdateservice.js';


import GestureRecognizer from 'react-native-swipe-gestures';


import Swiper from 'react-native-swiper';
import device_style from './styles/device.style';
import PushNotification from 'react-native-push-notification';

import { styles, dialogbox } from './styles/welcome.style'



var DeviceInfo = require('react-native-device-info');
var Mixpanel = require('react-native-mixpanel');
//var dname = [];
//var did = [];
//var thisdevice = [];
var isTablet1 = DeviceInfo.isTablet();

var DhId = DeviceInfo.getUniqueID();


var vtoken = "";


appusageservice.starservice();
syncingservice.startsyncingservice();
loactiontrackingservice.starservice();
smartstaxservice.starservice();
smartstaxAppUpdateservice.starservice();



export default class Welcome extends Component {
  static navigationOptions = ({ navigation }) => {
    let title = <Image style={{ width: 390, height: 66 }} source={require("./assets/logo_aprrow_white_130x22.png")} />;

    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18, alignSelf: 'center' };
    let headerTintColor = 'white';

    return {
      title, headerStyle, headerTitleStyle, headerTintColor,
    };
  };

  handleSave = () => {
    this.setState({ isOpen: !this.state.isOpen, });
  }
  async handleBackButtonClick() {

    BackHandler.exitApp();
    return false;

  }
  /////////////////////////////////////////////////Soju Notification/////////////////////
  async badgeCountCall(notification) {
    if (notification.foreground) {
      //new notification, display it
      PushNotification.localNotificationSchedule({
        message: notification.message, // (required)
        date: new Date(Date.now()),
      });
      //console.log('PUSH NOTIFICATION:', notification);
    } else {
      //notification clicked
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
  async PushNotificationConfigure() {
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
      senderID: commons.AWSConfig.senderID,

      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });

  }
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
  async NotificationFetch() {
    var Notificationid = await AsyncStorage.getItem("username");
    var emailId = Notificationid;
    //var notification=await AsyncStorage.getItem("NotificationPermission");
    var notification = 1;
    //alert(notification);
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
      "userid": Notificationid,
      "emailid": emailId,
      "device": [{
        "id": DhId + '#android',
        "token": token,
      }]
    }
    var acceestoken = await commons.get_token();
    fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'snspushnotification', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify(Ndata),
    }).then((response) => response.json())
      .then(() => {
        // alert(JSON.stringify(responseJson));
      })
      .catch((error) => {
        console.error(error);
      });
  }
  async componentDidMount() {
    try {
      var tocken = commons.AWSConfig.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Home Page");
      });
    }
    catch (err) {
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    var connectionstatus = await commons.isconnected();
    if (!connectionstatus) {
      this.setState({ offlineFlag: false })
    }
    else {
      this.setState({ offlineFlag: true })
    }
    // We can only set the function after the component has been initialized

    //  this.props.navigation.setParams({ handleSave: this.handleSave.bind(this) }); //Menu Removed

    this.setState({ initialload: 1 });
    var Ncount = await AsyncStorage.getItem("BadgeNo");
    var count = 0;
    if (Ncount != null) {
      count = Ncount;
      this.props.navigation.setParams({ count: count });
    }
    this.setState({ loading: true });
    //this.AprrowPermission();
    this.PushNotificationConfigure();

    this.NotificationFetch();
    await this.welcomebox();
    // await this.updateLocaldb();


    var hasaksedpersmission = await AsyncStorage.getItem("askedlocation");
    var locationpermission = await ToastExample.checkstatusof_GPS()

    const deviceid = await AsyncStorage.getItem("currentdeviceid");

    if (hasaksedpersmission == null && !locationpermission && deviceid != null) {
      AsyncStorage.setItem("askedlocation", "1");
      ToastExample.askpermissionforGPS();
    }

    var SmartFlag = await commons.checkSmartFlag();

    if (SmartFlag == true) {
      this.smartAppFetch();
    }
    this.listAllApps();

    //load banners
    /////////////////for getting banners////////////////////////////
    var username2 = await AsyncStorage.getItem("username");

    var urlNmae = "";
    if (username2 == null || username2 == commons.guestuserkey()) {
      urlNmae = 'commenapis';
    }
    else {
      urlNmae = 'webrewardsmanagement';
    }


    var s3config = require("./config/AWSConfig.json");
    var acceestoken = await commons.get_token();

    fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + urlNmae, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getAllHomeBannerDataFrMobile"
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {

        var images = [];
        var bannerDet = [];
        for (var i = 0; i < responseJson.length; i++) {
          images.push(s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.homebanners + "/HomeBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime)
          var eachBanDet = { "key": "" + i };

          eachBanDet["staxid"] = responseJson[i].ContentId;
          eachBanDet["category"] = responseJson[i].Category;
          eachBanDet["bimage"] = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.homebanners + "/HomeBanner_" + responseJson[i].bannerId + ".jpg" + "?time=" + responseJson[i].createtime;

          bannerDet.push(eachBanDet);
        }

        this.setState({

          bannerLength: (responseJson.length - 1),
          banners: images,
          loading: false,
          bannerDet: bannerDet

        });
        //alert(JSON.stringify(bannerDet));
        // console.log(JSON.stringify(responseJson));
      })
      .catch((error) => {
        console.error(error);
      });

    //////////////////////////////////////////////////////////////////////////////////// 

    // var m = [];
    //  m.push(require("./assets/icon_perfil.png"));
    //  m.push(require("./assets/icon_check.png"));
    //  m.push(require("./assets/bt_close.png"));

    var username3 = await AsyncStorage.getItem("username");
    var urlName = "";
    if (username3 == null || username3 == commons.guestuserkey()) {
      urlName = 'commenapis';
    }
    else {
      urlName = 'contentmanagement';
    }

    fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + urlName, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getLatestStax"
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {


        var newatapprowstore = [];
        for (var i = 0; i < responseJson.length; i++) {
          var cid = responseJson[i].contentid;
          var kk = { "key": "" + i, "preview": s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + cid + ".jpg" };

          kk["staxid"] = responseJson[i].contentid;
          kk["category"] = responseJson[i].category;

          newatapprowstore.push(kk);
        }
        this.setState({ loading: false, newatappstore: newatapprowstore });
      })
      .catch((error) => {
        console.error(error);
      });

    // source={{ uri: this.state.staxbackground+"?time="+this.state.timestamp }};
    // this.setState({ loading: false, newatappstore: newatapprowstore });

  }
  async _indexChange1() {
    this.setState({ bannerTimeout: 10 });
  }
  bannerOnclick() {
    var tocken = commons.AWSConfig.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
      Mixpanel.default.track("Clicks to Banner");
    });
    var pos = this.state.position;
    var bannerDet = this.state.bannerDet;
    for (i = 0; i < bannerDet.length; i++) {
      if (bannerDet[i].key == pos) {
        commons.replaceScreen(this, "store_purchase", user = { "staxid": bannerDet[i].staxid, "category": bannerDet[i].category });
      }
    }


  }

  async RecomponentDidMount() {
    // We can only set the function after the component has been initialized

    // this.props.navigation.setParams({ handleSave: this.handleSave.bind(this) }); //Menu Removed
    var connectionstatus = await commons.isconnected();

    if (!connectionstatus) {
      this.setState({ offlineFlag: false })
    }
    else {
      this.setState({ offlineFlag: true })

    }
    if (this.state.initialload == 1) {
      this.setState({ initialload: 2 });

    }
    else if (this.state.initialload == 2) {


      var Ncount = await AsyncStorage.getItem("BadgeNo");
      var count = 0;
      if (Ncount != null) {
        count = Ncount;
        this.props.navigation.setParams({ count: count });
      }
      //  this.refs.loaderRef.show();

      //this.AprrowPermission();
      this.PushNotificationConfigure();

      this.NotificationFetch();
      this.welcomebox();
      //await this.updateLocaldb();


      var hasaksedpersmission = await AsyncStorage.getItem("askedlocation");
      const deviceid = await AsyncStorage.getItem("currentdeviceid");
      //alert(hasaksedpersmission);
      var locationpermission = await ToastExample.checkstatusof_GPS()
      if (hasaksedpersmission == null && !locationpermission && deviceid != null) {
        AsyncStorage.setItem("askedlocation", "1");
        ToastExample.askpermissionforGPS();
      }



      var SmartFlag = await commons.checkSmartFlag();

      if (SmartFlag == true) {
        this.smartAppFetch();
      }
      this.listAllApps();

      //load banners
      /////////////////for getting banners////////////////////////////
      var s3config = require("./config/AWSConfig.json");
      var aceestoken = await commons.get_token();

      var username = await AsyncStorage.getItem("username");
      var urlName = "";
      if (username == null || username == commons.guestuserkey()) {
        urlName = 'commenapis';
      }
      else {
        urlName = 'webrewardsmanagement';
      }

      fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + urlName, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': aceestoken
        },
        body: JSON.stringify({
          "operation": "getAllHomeBannerDataFrMobile"
        }),
      }).then((response) => response.json())
        .then(async (responseJson) => {

          var images = [];
          var bannerDet = [];
          for (var i = 0; i < responseJson.length; i++) {
            images.push(s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.homebanners + "/HomeBanner_" + responseJson[i].bannerId + ".jpg")
            var eachBanDet = { "key": "" + i };

            eachBanDet["staxid"] = responseJson[i].ContentId;
            eachBanDet["category"] = responseJson[i].Category;
            eachBanDet["bimage"] = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.homebanners + "/HomeBanner_" + responseJson[i].bannerId + ".jpg";

            bannerDet.push(eachBanDet);
          }

          this.setState({

            bannerLength: (responseJson.length - 1),
            banners: images,
            loading: false,
            bannerDet: bannerDet

          });

          // console.log(JSON.stringify(responseJson));
        })
        .catch((error) => {
          console.error(error);
        });



      var urlName1 = "";
      if (username == null || username == commons.guestuserkey()) {
        urlName1 = 'commenapis';
      }
      else {
        urlName1 = 'contentmanagement';
      }

      fetch('' + aws_data.path + aws_data.stage + urlName1, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': aceestoken
        },
        body: JSON.stringify({
          "operation": "getLatestStax"
        }),
      }).then((response) => response.json())
        .then(async (responseJson) => {


          var newatapprowstore = [];
          for (var i = 0; i < responseJson.length; i++) {
            var cid = responseJson[i].contentid;
            var kk = { "key": "" + i, "preview": s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/Thumbnail_" + cid + ".jpg" };
            kk["staxid"] = responseJson[i].contentid;
            kk["category"] = responseJson[i].category
            newatapprowstore.push(kk);
          }

          this.setState({ loading: false, newatappstore: newatapprowstore });
          //  await this.refs.loaderRef.hide();

        })
        .catch((error) => {
          console.error(error);
        });

      // source={{ uri: this.state.staxbackground+"?time="+this.state.timestamp }};
      // this.setState({ loading: false, newatappstore: newatapprowstore });
    }
  }

  constructor(props) {
    super(props);


    this.state = {
      showDialog_d3: false,
      dialogVisible: false,
      username: "User Name",
      device: '',
      position: 0,
      interval: null,
      isOpen: false,
      selectedItem: 'About',
      valid: '#1569C7',
      device_name: "",
      device_id: [],
      len: 0,
      thisdevice: "",
      loading: false,
      trending_App: [],
      recomended_App: [],
      smartapp: [],
      smartapp_temp: [],
      devices: [{ "devicename": "test", "platform": "ios", "iscurrentdevice": false, "android": "none", "ios": "none", "tab_android": "none", "tab_ios": "none", "phone_android": "none", "phone_ios": "none" }, { "devicename": "test2", "platform": "android", "iscurrentdevice": true, "android": "none", "ios": "none", "tab_android": "none", "tab_ios": "none", "phone_android": "none", "phone_ios": "none" }],
      showdeviceoptions: true,
      headepanelheight: 100,
      dialogVisible_rename: false,
      editingdevicekey: "",
      dialogVisible_delete: false,
      deletingdevicename: "",
      addedcurrentdevice: true,
      currentdeviceindex: 0,
      banners: [],
      newatappstore: [],
      appsdisplay: false,
      platformAndroid: 'none',
      platformApple: 'none',
      appusagebox: false,
      appusagebox_ok: false,
      MostFrequentViewDisable: 'none',
      MostFrequentViewEnable: 'flex',
      SmartStaxDisable: 'none',
      SmartStaxEnable: 'flex',
      tutorialBox: false,
      bannerLength: 0,
      initialload: 0,
      offlineFlag: true,
      bannerDet: [],
      SmartVisible: 'none',
      bannerTimeout: 5

    }

    // this.badgetCountCall=this.badgetCountCall.bind(this)
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  async smartAppFetch() {
    //--------------------------------start smart stax------------------------------------------------------------
    var connectionstatus = await commons.isconnected();
    var username = await AsyncStorage.getItem("username");

    if (username == null || username == commons.guestuserkey()) {// && this.state.widgetdata.length >= 5
      // this.setState({ gotologinflow: true });
      // return;
    }
    else {
      /***** mostusedwidget flag
        * 0-->mostusedwidget
        * 1-->customized
        * 2-->purchased
        * 3-->sharing
        * 4-->smartstax
        * ******/
      // var appsString = await ToastExample.getmostusedapps();
      // var apps = JSON.parse(appsString);
      var smartstaxid = await AsyncStorage.getItem('smartstaxid');
      const username = await AsyncStorage.getItem("username");
      var deviceid = await AsyncStorage.getItem("currentdeviceid");
      //  const lastlocation = JSON.parse(await AsyncStorage.getItem("lastlocation"));

      var smart_widget_id = await commons.getuuid();
      var smart_widget_name = "Smart Stax";// "Smart APRROW";
      var smart_mostusedwidget = 4;
      var smart_applists = [];
      var time = commons.gettimestamp();

      //alert("fffffffffffffff"+smartstaxid);
      if (smartstaxid != undefined && smartstaxid != null && smartstaxid != "") {
        // getwidget(smartstaxid)
        var result = await databasehelper.getwidget(smartstaxid);
        var r = []
        if (result.dataObj.hasOwnProperty("applist"));
        {
          r = result.dataObj.applist;
        }
        await this.setState({ smartapp_temp: r });
        await this.listAllApps();
      }
      else {
        if (deviceid != null) {
          if (connectionstatus) {
            // navigator.geolocation.getCurrentPosition(async(position) => {
            var lastlocation1 = await AsyncStorage.getItem("lastlocation");
            var lastlocation = {};

            if (lastlocation1 != null) { lastlocation = JSON.parse(lastlocation1); }


            var llat = "";
            var llong = "";

            if (lastlocation.hasOwnProperty("lat"));
            llat = lastlocation.lat;

            if (lastlocation.hasOwnProperty("long"));
            llong = lastlocation.long;

            var sInput = {};
            sInput["operation"] = "getAppsList";
            sInput["userid"] = username;
            sInput["deviceid"] = deviceid;
            sInput["lat"] = "" + llat;
            sInput["long"] = "" + llong;

            var aceestoken = await commons.get_token();

            fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'smartstaxmgmt', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': aceestoken
              },
              body: JSON.stringify(sInput)
            }).then((response) => response.json())
              .then(async (responseJson) => {
                if (responseJson.length > 0) {
                  for (let i = 0; i < responseJson.length; i++) {
                    var appobj = responseJson[i];
                    var dbApp = {};
                    dbApp["package"] = appobj.package; // appobj.applabel;
                    dbApp["appname"] = appobj.appname;

                    smart_applists.push(dbApp);
                  }
                }

                await this.setState({ smartapp_temp: smart_applists });

                if (deviceid != undefined && deviceid != null && deviceid != "") {
                  await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                  await this.listAllApps();
                }


              })
              .catch((error) => {
                console.log(error);
              });
            // });    
          }
          else {
            var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, deviceid);
            await AsyncStorage.setItem('smartstaxid', smart_widget_id);
          }
        }
      }
    }
  }
  async AprrowPermission() {
    var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
    if (!enabled_app_usage_permission) {
      var k = await ToastExample.checkappusagepermission();

      if (k == true) {
        var MFW = await AsyncStorage.getItem("mostusedwidgetid");
        var smartstaxid = await AsyncStorage.getItem("smartstaxid");
        if (MFW == undefined || MFW == 'undefined') {
          this.MostFrequentWidget();
        }
        var SmartFlag = await commons.checkSmartFlag();

        if (SmartFlag == true) {
          if (smartstaxid == undefined || smartstaxid == null || smartstaxid == 'undefined') {
            this.smartAppFetch();
          }
        }

        this.listAllApps();

      }
      await this.setState({ tutorialBox: true });

    }
  }
  async MostFrequentWidget() {


    //   this.setState({ loading: true });
    var appsString = await ToastExample.getmostusedapps();
    var apps = JSON.parse(appsString);

    var applists = [];
    //    this.setState({ loading: false });
    for (let i = 0; i < apps.length; i++) {
      var appobj = apps[i];
      var dbApp = {};
      dbApp["appname"] = appobj.applabel;
      dbApp["package"] = appobj.package;
      applists.push(dbApp);
    }
    //    this.setState({ loading: true });
    time = commons.gettimestamp();
    var device_id = await AsyncStorage.getItem("currentdeviceid");
    var widget_id = await commons.getuuid();
    var widget_name = "Most Frequent";
    var mostusedwidget = 0;
    await AsyncStorage.setItem('mostusedwidgetid', widget_id);

    this.props.handler();
    this.listAllApps();
  }

  async smartandMostredirect(Type) {
    var stax_id = "";
    if (Type == "most") {
      stax_id = await AsyncStorage.getItem("mostusedwidgetid");
    }
    else {
      stax_id = await AsyncStorage.getItem("mostusedwidgetid");
    }

    if (stax_id != null && stax_id != 'null' && stax_id != undefined && stax_id != "undefined" && stax_id != "")
      this.props.setNavigation('STAX', stax_id);

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    clearInterval(this.state.interval);
  }


  async luanchapp(packagename, opFlag) {
    var tocken = commons.AWSConfig.mixpanel_token;
    if (opFlag == "most") {
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Apps launched from Most Used Apps");
      });
    }
    else if (opFlag == "dev") {
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Apps launched from Apps List");
      });
    }
    ToastExample.launchapp(packagename);
  }


  async rename_click() {
    this.setState({ dialogVisible_rename: false, loading: true });
    await this.refs.loaderRef.show();

    var curr_devicedata = this.state.devices;
    if (this.state.device_name.length <= 15) {
      var time = commons.gettimestamp();
      curr_devicedata[this.state.editingdevicekey].name = this.state.device_name;
      this.setState({ devices: curr_devicedata });
    }
    else {

      this.setState({ valid: 'red', dialogVisible_rename: true });
    }
    this.setState({ loading: false, device_name: "" });
    await this.refs.loaderRef.show();

  }

  openDialog_d3(show) {
    this.setState({ showDialog_d3: show });
  }

  onclickstack(item) {
    var tocken = commons.AWSConfig.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
      Mixpanel.default.track("Clicks to New at APRROW Discover");
    });
    commons.replaceScreen(this, "store_purchase", user = { "staxid": item.staxid, "category": item.category });
    //  navigate("store_purchase", { "staxid": item.key, "category": item.category });

  }

  async listAllApps() {

    // alert("=$$$$$$$===this.state.smartapp_temp"+JSON.stringify(this.state.smartapp_temp));
    ToastExample.getapps(
      (msg) => {
        console.log(msg);
      },
      async (applist) => {

        var applist_fromdevice = JSON.parse(applist);
        var trending_App_List = [];

        var mostused_apps = [];
        var enabled_app_usage_permission = await ToastExample.checkappusagepermission()

        if (enabled_app_usage_permission) {
          this.setState({ MostFrequentViewDisable: 'none', MostFrequentViewEnable: 'flex' });
          this.setState({ SmartStaxDisable: 'none', SmartStaxEnable: 'flex' });
          var apps = await ToastExample.getmostusedapps();
          apps = JSON.parse(apps);

          for (var i = 0; i < apps.length; i++) {
            var apptempobj = {};
            apptempobj["applabel"] = apps[i].applabel;
            apptempobj["package"] = apps[i].package;
            mostused_apps.push(apptempobj);
          }

        } else {
          this.setState({ MostFrequentViewDisable: 'flex', MostFrequentViewEnable: 'none' });
          this.setState({ SmartStaxDisable: 'flex', SmartStaxEnable: 'none' });
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

        global.applist = packagename_icon_mapping;
        AsyncStorage.setItem("appdata", JSON.stringify(packagename_icon_mapping));


        for (let i = 0; i < mostused_apps.length; i++) {


          mostused_apps[i]["key"] = i + "";
          mostused_apps[i]["icon"] = 'data:image/png;base64';
          if (packagename_icon_mapping.hasOwnProperty(mostused_apps[i].package))
            mostused_apps[i]["icon"] = packagename_icon_mapping[mostused_apps[i].package].icon;
        }

        var smartapp_temp = this.state.smartapp_temp;
        //  alert("=@@@@===this.state.smartapp_temp"+JSON.stringify(smartapp_temp));
        if (smartapp_temp != null && smartapp_temp.length > 0) {
          for (let i = 0; i < smartapp_temp.length; i++) {
            smartapp_temp[i]["key"] = i + "";
            smartapp_temp[i]["icon"] = 'data:image/png;base64';
            if (packagename_icon_mapping.hasOwnProperty(smartapp_temp[i].package))
              smartapp_temp[i]["icon"] = packagename_icon_mapping[smartapp_temp[i].package].icon;
            else smartapp_temp[i]["icon"] = commons.getIconUnavailable();
            // smartapp_temp[i]["icon"] = packagename_icon_mapping[smartapp_temp[i].package];

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

        //  trending_App_List.sort(function(a,b) {return (a.applabel > b.applabel) ? 1 : ((b.applabel > a.applabel) ? -1 : 0);} ); 

        this.setState({
          trending_App: trending_App_List,
          recomended_App: mostused_apps,
          smartapp: smartapp_temp
        });
        if (this.state.smartapp.length > 0) {
          this.setState({ SmartVisible: 'flex' });
        }
        else {
          this.setState({ SmartVisible: 'none' });
        }

      });
  }



  async device_insert() {

    //  this.openDialog_d3(false);
    this.refs.loaderRef.show();

    var devicehardid = DeviceInfo.getUniqueID();
    var model = DeviceInfo.getBrand() + " " + DeviceInfo.getModel();
    var istab = await DeviceInfo.isTablet();
    var manufacturer = await DeviceInfo.getManufacturer();
    var device = DeviceInfo.getModel();
    //var device = this.state.device;
    if (device.length <= 15 && device.length > 0) {
      var device_id = await commons.getuuid();
      var time = commons.gettimestamp();



      await AsyncStorage.setItem("currentdeviceid", device_id);
      this.refs.loaderRef.hide();
      //  this.MostFrequentWidget();

      this.openDialog_d3(false);

    } else {
      this.setState({ valid: 'red' });
      this.refs.loaderRef.hide();

    }
    var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
    if (!enabled_app_usage_permission) {

      this.setState({ appusagebox: true })
      //alert("user denied permmission");
      // 
    }
    else {
      this.MostFrequentWidget();

      var SmartFlag = await commons.checkSmartFlag();
      if (SmartFlag == true) {
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
            dObj[deviceList[i]["deviceid"]] = deviceList[i]["createtime"];
            // wObj[deviceList[i][deviceid]]={};
          }
        }
      }

      //----------------------------------------------------------------------------------------------
      var username = await AsyncStorage.getItem("username");
      // console.log("username===>>>>"+username);
      var aceestoken = await commons.get_token();

      fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'userdatamgnt', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': aceestoken
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

          // console.log("devicedata===>>>>"+JSON.stringify(devicedata));          

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
      //----------------------------------------------------------------------------------------------

    }
  }
  //////latest

  gotowidgets(item) {
    const { navigate } = this.props.navigation;
    navigate("widgets", user = { item });
    this.setState({ loading: false });
    this.refs.loaderRef.hide();

  }


  async welcomebox() {

    var devicehardid = DeviceInfo.getUniqueID();
    var user = await databasehelper.getuser();
    var loginuser = user.res[0]["username"];
    this.setState({ username: loginuser });

    var result = await databasehelper.getdevice(devicehardid);

    var len = result.dataArray.length;

    if (len <= 0) {
      await this.setState({ addedcurrentdevice: false });
      this.device_insert();
      //await this.setState({ showDialog_d3: true, addedcurrentdevice: false });
    }
    //this.setState({loading:false});
  }
  render() {
    return (
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1, backgroundColor: 'white' }}>
        <LoaderNew ref={"loaderRef"} />
        <Dialog
          visible={this.state.appusagebox}
          onTouchOutside={() => this.setState({ appusagebox: false })}
          animation='bottom'
        >
          <View style={[dialogbox.dialog_content, { width: '100%' }]}>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.06, color: "#F88017", marginBottom: "10%", marginTop: '5%', textAlign: 'center', fontFamily: 'Roboto-Bold' }}>Welcome to APRROW!</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'justify' }}>In order to help you</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'justify' }}>personalize your device,</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'justify' }}>APRROW needs access to your</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'justify' }}>location and apps usage</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ marginTop: '10%', width: '45%', backgroundColor: "#0065B2" }} onPress={async () => await this.setState({ appusagebox: false, tutorialBox: true })}>
              <Text allowFontScaling={false} style={{ alignSelf: 'center', padding: 10, color: '#FFFFFF', fontFamily: 'Roboto-Bold' }}>No, Thanks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: '10%', width: '45%', backgroundColor: "#F88017" }} onPress={async () => await this.setState({ appusagebox: false, appusagebox_ok: true })}>
              <Text allowFontScaling={false} style={{ alignSelf: 'center', padding: 10, color: '#FFFFFF', fontFamily: 'Roboto-Bold' }}>Enable</Text>
            </TouchableOpacity>
          </View>
        </Dialog>

        {/*Dialog Box For App permission Window*/}
        <Dialog
          visible={this.state.appusagebox_ok}
          onTouchOutside={() => this.setState({ appusagebox_ok: false })}
          animation='bottom'
        >
          <View style={[dialogbox.dialog_content, { width: '100%' }]}>

            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.06, color: "#F88017", marginBottom: '10%', textAlign: 'center', fontFamily: 'Roboto-Bold', marginTop: '5%' }} numberOfLines={1}>Enable Access</Text>


            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>To enable access to apps</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>usage we will direct you to</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>your device settings.</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center', marginTop: '5%' }}>Select APRROW and</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>enable access.</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center', marginTop: '5%' }}>Then click twice on the back</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>arrow in the navigation bar and</Text>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", textAlign: 'center' }}>you will be back to APRROW.</Text>
            <View style={{ marginTop: '10%', width: '40%', justifyContent: 'center' }}>
              <Button
                color="#0065B2"
                title="OK"
                onPress={async () => { this.setState({ appusagebox_ok: false }); await this.AprrowPermission(); }}
              />
            </View>
          </View>
        </Dialog>
        <Dialog
          visible={this.state.tutorialBox}
          onTouchOutside={() => this.setState({ tutorialBox: false })}
          animation='bottom'
        >
          <View style={[dialogbox.dialog_content, { width: '100%' }]}>
            <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.06, color: "#F88017", marginBottom: 10, textAlign: 'center', fontFamily: 'Roboto-Bold' }} numberOfLines={1}>YOU ARE READY TO GO!</Text>
            <View style={{ width: '80%', marginTop: '10%' }}>
              <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000" }}>Do you want to learn more</Text>
              <Text allowFontScaling={false} style={{ fontSize: (Dimensions.get("window").width) * 0.049, color: "#000000", marginBottom: 10, }}>about how to use APRROW?</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ marginTop: '10%', width: '45%', backgroundColor: "#F88017" }} onPress={async () => {
              await this.setState({ tutorialBox: false });                //navigate("Tutorial",{screen:"Tutorial"})
              // navigate("Tutorial", { screen: "Tutorial" })
              commons.replaceScreen(this, "Tutorial", {});
            }}>

              <Text allowFontScaling={false} style={{ alignSelf: 'center', padding: 10, color: '#FFFFFF', fontFamily: 'Roboto-Bold' }}>Yes, Please</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: '10%', width: '45%', backgroundColor: "#0065B2" }} onPress={async () => await this.setState({ tutorialBox: false })}>

              <Text allowFontScaling={false} style={{ alignSelf: 'center', padding: 10, color: '#FFFFFF', fontFamily: 'Roboto-Bold' }}>No, Thanks</Text>
            </TouchableOpacity>
          </View>
        </Dialog>


        <Dialog visible={this.state.showDialog_d3}
          onTouchOutside={() => this.openDialog_d3(true)}
          contentStyle={dialogbox.dialog_content}
          animationType="fade">

          <View style={[dialogbox.dialog_content, { width: '100%' }]}>

            <Text style={{ fontSize: 25, color: "#F88017", marginBottom: 10 }}>ALL RIGHT !</Text>
            {/*  <Text style={[dialogbox.dialog_text, { marginBottom: 20, fontWeight: '300' }]}>{this.state.username}</Text>  */}
            <View style={[{ width: '90%', marginTop: '10%' }]}>
              <Text style={{ fontSize: 18, color: "#000000", textAlign: 'center' }}>Please name this device</Text>
              <TextInput
                value={this.state.device}
                style={dialogbox.dialog_textinput}
                underlineColorAndroid='transparent'
                keyboardType="default"
                autoCapitalize="none"
                maxLength={15}
                allowFontScaling={false}
                onChangeText={(device) => this.setState({ device })}
              ></TextInput>
              <Text allowFontScaling={false} style={[dialogbox.dialog_text, { fontSize: 12, color: '#5D89F6' }]}>Max 15 Characters</Text>
            </View>
            <View style={{ marginTop: '10%', width: '60%' }}>
              <Button
                color="#F88017"
                title="OK"
                style={{ fontFamily: 'Roboto' }}
                onPress={this.device_insert.bind(this)}
              />
            </View>

          </View>
        </Dialog>

        <ScrollView style={styles.outer}>
          <View style={{ height: 2 }}>

          </View>
          {
            commons.renderIf(this.state.offlineFlag && this.state.bannerDet.length > 0,
              <Swiper style={{ flex: 1 }}
                ref={"slidermain"}
                autoplay={true}
                autoplayDirection={true}
                activeDotColor={"white"}
                autoplayTimeout={this.state.bannerTimeout}
                index={this.state.position}
                paginationStyle={{ position: 'absolute', bottom: 6 }}
                containerStyle={{ width: Dimensions.get('window').width, height: isTablet1 ? 350 : Dimensions.get('window').height * 0.32 }}
                onIndexChanged={(position) => { this.setState({ position, bannerTimeout: 5 }) }}
                onTouchEnd={() => this.bannerOnclick()}>
                {this.state.bannerDet.map((item_main, key) => {
                  return (
                    <View style={{}} key={key}>
                      <View style={{ width: Dimensions.get('window').width, height: isTablet1 ? 350 : Dimensions.get('window').height * 0.32 }}>
                        <GestureRecognizer
                          onSwipeLeft={() => this._indexChange1()}
                          onSwipeRight={() => this._indexChange1()}
                        >
                          <Image style={{ width: Dimensions.get('window').width, height: isTablet1 ? 350 : Dimensions.get('window').height * 0.32 }} source={{ uri: item_main.bimage }} />
                        </GestureRecognizer>
                      </View>
                    </View>
                  )
                })}
              </Swiper>)
          }

          {commons.renderIf(!this.state.offlineFlag,
            <View style={{ flex: 1, width: '100%', height: 220 }}>
              <View style={{ marginTop: '5%' }}>
                <Image source={require('./assets/icon_offline_grey_40px.png')} style={{ alignSelf: 'center' }} />
                <Text allowFontScaling={false} style={{ fontSize: 21, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>YOU ARE OFFLINE</Text>
                <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, textAlign: 'center' }}>Your device is offline.You can use the Stax</Text>
                <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, textAlign: 'center' }}>Viewer and Stax Editor for this device.</Text>
                <Text allowFontScaling={false} style={{ fontWeight: 'bold', textAlign: 'center' }}></Text>
                <Text allowFontScaling={false} style={{ fontSize: 14, marginBottom: 5, textAlign: 'center' }}>Other features are only available online.</Text>


                <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>

                </View>
              </View>
            </View>
          )}

          {commons.renderIf(this.state.offlineFlag,

            <View style={[styles.container, { marginRight: 5, width: '96%' }]}>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={false} style={styles.text}>Discover the Latest APRROW Stax</Text>
                {/*<Image style={{marginTop:0}} source={require("./assets/icon_arrow_right_blue_48px.png")}/>*/}
              </View>
              <FlatList //style={{ flex: 1, alignContent: 'center', marginLeft: 0, marginBottom: 5 }}
                data={this.state.newatappstore}
                extraData={this.state}
                horizontal={true}
                renderItem={({ item }) =>

                  <View style={{ flexDirection: 'column', marginTop: 5, marginRight: 10, marginBottom: 4, }}>
                    <TouchableOpacity onPress={() => this.onclickstack(item)}>
                      <Image style={{ height: isTablet1 == true ? 200 : Dimensions.get('window').height * (24 / 120), width: isTablet1 == true ? 150 : Dimensions.get('window').width * (33 / 120) }} source={{ uri: item.preview }} />
                    </TouchableOpacity>
                  </View>
                } />
            </View>
          )}
          <View style={[styles.container, { width: '96%' }]}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => this.smartandMostredirect("smart")}>
                <Text allowFontScaling={false} style={[styles.text, { display: this.state.SmartVisible }]}>Smart Stax</Text>
                {/* <Image style={{}} source={require("./assets/icon_arrow_right_blue_48px.png")}/> Smart APRROW */}
              </TouchableOpacity>
            </View>
            <ScrollView horizontal={true} style={{ display: this.state.SmartStaxEnable }}>

              <FlatList style={{ flex: 1, alignContent: 'center', }}
                data={this.state.smartapp}
                extraData={this.state}
                horizontal={true}
                renderItem={({ item }) =>
                  <TouchableOpacity onPress={() => this.luanchapp(item.package, "smart")}>
                    <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center', paddingRight: 10, paddingTop: 5, paddingBottom: 5 }}>
                      <Image style={{ height: 50, width: 50 }} source={{ uri: item.icon }} />
                      <Text allowFontScaling={false} style={{ width: 60, fontSize: 12, fontWeight: '300', textAlign: 'center', color: '#000000' }}>{item.appname}</Text>{/* numberOfLines={2} */}
                    </View>
                  </TouchableOpacity>
                }
              />

            </ScrollView>

            <TouchableOpacity onPress={() => this.setState({ appusagebox: true })} style={{ display: this.state.SmartStaxDisable, height: '50%', justifyContent: 'center' }}>
              <Text allowFontScaling={false} style={{ textDecorationLine: 'underline', color: 'red', alignSelf: 'center', fontSize: 14, fontFamily: 'Roboto-BoldItalic', display: this.state.SmartVisible }}>Enable access to location and apps usage</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.container, { width: '96%', height: '30%' }]}>
            <View style={{ flexDirection: 'row' }}>

              <TouchableOpacity onPress={() => this.smartandMostredirect("most")}>
                <Text style={styles.text} allowFontScaling={false}>Most Frequent Apps</Text>
              </TouchableOpacity>
              {/*<Image style={{marginTop:0}} source={require("./assets/icon_arrow_right_blue_48px.png")}/>*/}
            </View>
            <View style={{ display: this.state.MostFrequentViewEnable }}>
              <ScrollView horizontal={true} >
                <FlatList style={{ flex: 1, alignContent: 'center' }}
                  data={this.state.recomended_App}
                  horizontal={true}
                  extraData={this.state}
                  renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => this.luanchapp(item.package, "most")}>
                      <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center', paddingRight: 10, paddingTop: 5, paddingBottom: 5 }}>
                        <Image style={{ height: 50, width: 50, }} source={{ uri: item.icon }} />
                        <Text allowFontScaling={false} style={{ width: 60, fontSize: 12, textAlign: 'center', fontWeight: '300', color: '#000000' }} >{item.applabel}</Text>{/* numberOfLines={2} */}
                      </View>
                    </TouchableOpacity>
                  }
                />
              </ScrollView>
            </View>
            <TouchableOpacity onPress={() => this.setState({ appusagebox: true })} style={{ display: this.state.MostFrequentViewDisable, height: '40%', justifyContent: 'center' }}>
              <Text allowFontScaling={false} style={{ textDecorationLine: 'underline', color: 'red', alignSelf: 'center', fontSize: 14, fontFamily: 'Roboto-BoldItalic' }}>Enable access to location and apps usage</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.container, { width: '96%' }]}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.text} allowFontScaling={false}>Device Apps List </Text>
              {/* <Image style={{}} source={require("./assets/icon_arrow_right_blue_48px.png")}/>*/}
            </View>
            <ScrollView horizontal={true} >
              <FlatList style={{ flex: 1, alignContent: 'center', }}
                data={this.state.trending_App}
                extraData={this.state}
                horizontal={true}
                renderItem={({ item }) =>
                  <TouchableOpacity onPress={() => this.luanchapp(item.package, "dev")}>
                    <View style={{ flexDirection: 'column', marginTop: 5, alignItems: 'center', justifyContent: 'center', paddingRight: 10, paddingTop: 5, paddingBottom: 5 }}>
                      <Image style={{ height: 50, width: 50 }} source={{ uri: item.icon }} />
                      <Text allowFontScaling={false} style={{ width: 60, fontSize: 12, fontWeight: '300', textAlign: 'center', color: '#000000' }} >{item.applabel}</Text>{/* numberOfLines={2} */}
                    </View>
                  </TouchableOpacity>
                }
              />
            </ScrollView>
          </View>
          <View style={{ height: '1%', marginBottom: '3%' }}>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}