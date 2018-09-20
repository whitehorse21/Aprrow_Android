import React, { Component } from "react";
import { Linking, BackHandler, Platform, View, Alert, ToastAndroid, Dimensions, Button, ScrollView, ImageBackground, TouchableOpacity, Image, StyleSheet, Text, TextInput, FlatList, AsyncStorage } from "react-native";
import commons from '../commons';
import uicommons from '../ui.commons';
//import Loader from './utils/Loader';
import LoaderNew from '../utils/LoaderNew';
import Share, { ShareSheet } from "react-native-share";
import databasehelper from '../utils/databasehelper';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import Modal from 'react-native-modal';
import device_style from '../styles/device.style';
import * as RNIap from 'react-native-iap';
import Touch from 'react-native-touch';
import ToastExample from '../nativemodules/Toast';
var DeviceInfo = require('react-native-device-info');
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require('../config/AWSConfig.json');
var aws_lamda = require('../config/AWSLamdaConfig.json');
export default class storepurchase extends Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation
    const { goBack } = navigation;
    let title = 'Purchase Stax';
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '100', marginLeft: 0, fontSize: 18 };
    let headerTintColor = 'white';
    let headerTitleAllowFontScaling = false;
    let headerLeft = uicommons.headerLeft(params.backPage);
    return { title, headerStyle, headerTitleStyle, headerTintColor, headerLeft, headerTitleAllowFontScaling };
  };


  constructor(props) {
    super(props);
    this.state = {
      stackid: "",
      staxbackground: "data:image/jpeg;base64",
      staxdownload: "data:image/jpeg;base64",
      stackname: "No Name",
      price: "0",
      coins: "0",
      favoriteicon: require("../assets/icon_favorites_white.png"),
      likeicon: require("../assets/icon_like_white.png"),
      applist: [],
      likecount: "",
      downloads: "",
      Description: "",
      isfavorite: false,
      isliked: false,
      confirm_purchase: false,
      staxpurchased: false,
      pricecategoryid: "",
      purchased_before: false,
      username: "",
      methode: "",
      coinsUnavailable: false,
      purchaseNotSuccess: false,
      timestamp: "",
      gotologinflow: false,
      feed: [],
      goback: false,
      priceUnit: "USD",
      istab: false

    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() {
    this.backPage();
    return true;
  }

  async backPage() {
    if (this.state.goback) {
      const { goBack } = this.props.navigation;
      goBack();
    }
    else {
      commons.replaceScreen(this, "bottom_menu", { "page": "Discover" });
    }
  }

  async like() {
    //update like count on server and the update ui on seccess response
    //need backend api for update like count

    try {
      var MixPanl_tocken = aws_data11.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
        Mixpanel.default.track("Purchase Like");
      });
    } catch (err) {

    }

    var username = await AsyncStorage.getItem("username");
    if (username == null || username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }


    var acceestoken = await commons.get_token();



    var uuid = await commons.getuuid()
    var statuse = "false";
    if (!this.state.isliked)
      statuse = "true"

    var reqobj = {
      "operation": "updateuserCount",
      "contentid": this.state.stackid,
      "category": this.state.category,
      "staxtype": "like", //or like,favorite,purchase,downloads
      "staxvalue": statuse, //true/false
      "userid": this.state.username,
      "uuid": uuid, //for history & opperation table primery id
      "createdate": commons.gettimestamp() + ""
    }
    this.refs.loaderRef.show();


    await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify(reqobj),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        //  alert(JSON.stringify(responseJson));
        var icon = "";
        var liked = !this.state.isliked;
        var likecount = parseInt(this.state.likecount);

        if (liked) {
          icon = require("../assets/icon_like_orange.png");
          likecount++;
        }
        else {
          icon = require("../assets/icon_like_white.png");
          likecount--;
        }
        this.setState({
          likeicon: icon,
          isliked: liked,
          likecount: likecount,
          // loading: false
        })
        this.refs.loaderRef.hide();


      })
      .catch((error) => {
        // this.setState({ loading: false });
        this.refs.loaderRef.hide();

        console.error(error);
      });

  }

  async favorite() {

    try {
      var MixPanl_tocken = aws_data11.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
        Mixpanel.default.track("Favorites");
      });
    } catch (err) {

    }

    var username = await AsyncStorage.getItem("username");
    if (username == null || username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }

    var uuid = await commons.getuuid()

    var statuse = "false";
    if (!this.state.isfavorite)
      statuse = "true"

    var reqobj = {
      "operation": "updateuserCount",
      "contentid": this.state.stackid,
      "category": this.state.category,
      "staxtype": "favorite", //or like,favorite,purchase,downloads
      "staxvalue": statuse, //true/false
      "userid": this.state.username,
      "uuid": uuid, //for history & opperation table primery id
      "createdate": commons.gettimestamp()
    }


    this.refs.loaderRef.show();

    //this.setState({ loading: true })
    var acceestoken = await commons.get_token();
    await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify(reqobj),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        // alert(JSON.stringify(responseJson));

        var icon = "";
        var fav = !this.state.isfavorite;

        if (fav)
          icon = require("../assets/icon_favorites_orange.png");
        else
          icon = require("../assets/icon_favorites_white.png");

        this.setState({
          favoriteicon: icon,
          isfavorite: fav,
          //  loading: false
        })
        this.refs.loaderRef.hide();


      })
      .catch((error) => {
        this.refs.loaderRef.hide();

        // this.setState({ loading: false });
        console.error(error);
      });
  }

  async downloadstax(mod) {


    var username = await AsyncStorage.getItem("username");
    if (username == null || username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }
    if (mod == "payment") {
      this.setState({ methode: mod });
      this.downloadstax_execute();
    }
    else {
      this.setState({ confirm_purchase: true, methode: mod });
    }
  }
  async downloadstax_execute() {
    //get curent device
    //create stax data with choosen profile
    //insert stax
    this.refs.loaderRef.show();
    //alert("d");
    // this.setState({ loading: true });

    var acceestoken = await commons.get_token();
    var operation = "downloads";
    const { goBack } = this.props.navigation;
    this.setState({ confirm_purchase: false });
    this.setState({ coinsUnavailable: false });
    this.setState({ purchaseNotSuccess: false });

    let deviceid1 = await AsyncStorage.getItem("currentdeviceid");


    var staxid = this.props.navigation.state.params.staxid;
    var installedwidgets = await databasehelper.get_purchased_widgetids(deviceid1);
    installedwidgets = installedwidgets.widgetid_map


    if (installedwidgets.hasOwnProperty(staxid + "#" + this.state.category)) //Checks, is it purchased?
    {
      // alert("test");
      //To check installed stax
      var st_inst = await databasehelper.tocheck_stax_installed(staxid + "#" + this.state.category);
      st_inst = st_inst.widgetid_map;

      if (st_inst.hasOwnProperty(1) && !st_inst.hasOwnProperty(0)) // not installed but purchased
      {
        let dataObj = {};
        let createtime = commons.gettimestamp();
        let guid = await commons.getuuid();
        let deviceid = await AsyncStorage.getItem("currentdeviceid");

        if (deviceid == null) {
          ToastAndroid.show('You have to add current device', ToastAndroid.SHORT);
          //   this.setState({ loading: false });
          this.refs.loaderRef.hide();

          return;
        }

        var price = parseFloat(this.state.price);
        var coins = parseFloat(this.state.coins);
        var widget_idParam = this.state.stackid + "#" + this.state.category;//anandu
        dataObj.widgetid = this.state.stackid + "#" + this.state.category;
        dataObj.deviceid = deviceid;
        dataObj.createtime = createtime;
        dataObj.widgetname = this.state.stackname;
        dataObj.deleteflag = 0;
        dataObj.applist = this.state.applist;
        dataObj.mostusedwidget = 2;
        dataObj.headercolor = this.isColorValid(this.state.headercolor);
        dataObj.fontcolor = this.isColorValid(this.state.fontcolor);
        dataObj.backgroundcolor = "";
        dataObj.transperancy = this.state.transperancy;
        dataObj.backgroundpicture = "file://";
        dataObj.feed = this.state.feed;
        var widgetarr = [];
        widgetarr.push(dataObj);


        var fileid = await commons.getuuid();
        var store_status = await commons.store_download_file_tocache(this.state.staxdownload, fileid, ".jpg");
        var res = await databasehelper.upsert_fileid(fileid);
        widgetarr[0].fileid = fileid;

        if (store_status == true) {
          var result = await databasehelper.shareinsertwidget(widgetarr);
        }
        else {
          ToastAndroid.show("error", 500);
          return
        }
        var uuid = await commons.getuuid()
        //this.setState({ loading: true });
        this.refs.loaderRef.show();

        var reqobj = {
          "operation": "updateuserCount",
          "contentid": this.state.stackid,
          "category": this.state.category,
          "staxtype": operation, //or like,favorite,purchase,downloads
          "staxvalue": "true", //true/false
          "userid": this.state.username,
          "uuid": uuid, //for history & opperation table primery id
          "createdate": commons.gettimestamp() + "",
          "purchasetype": "payment"
          // "staxprice":0
        }
        await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': acceestoken
          },
          body: JSON.stringify(reqobj),
        }).then((response) => response.json())
          .then(async (responseJson) => {
            // alert(JSON.stringify(responseJson));

            this.setState({
              //  loading: false,

            });
            this.refs.loaderRef.hide();

            //    widget_idParam
            ToastAndroid.show('Stax Downloaded', ToastAndroid.SHORT);
            var item = this.props.navigation.state.params.item;
            //  this.setState({ loading: false });
            this.refs.loaderRef.hide();

            const { navigate } = this.props.navigation;
            commons.replaceScreen(this, "bottom_menu", { "page": "STAX", "widget_id1": widget_idParam });

          })
          .catch((error) => {
            this.refs.loaderRef.hide();
            // this.setState({ loading: false });
            console.error(error);
          });


        this.refs.loaderRef.hide();

        //this.setState({ loading: false });




        return;
        ///////

      }
      else {
        //Already purchased and Installed
        ToastAndroid.show('Stax Already Installed', ToastAndroid.SHORT);
        // this.setState({ loading: false });
        this.refs.loaderRef.hide();
        return;
      }
      return;
    }


    let dataObj = {};
    let createtime = commons.gettimestamp();
    let guid = await commons.getuuid();
    let deviceid = await AsyncStorage.getItem("currentdeviceid");

    if (deviceid == null) {
      ToastAndroid.show('You have to add current device', ToastAndroid.SHORT);
      // this.setState({ loading: false });
      this.refs.loaderRef.hide();

      return;
    }

    var price = parseFloat(this.state.price);
    var coins = parseFloat(this.state.coins);
    var widget_idParam = this.state.stackid + "#" + this.state.category;//anandu
    dataObj.widgetid = this.state.stackid + "#" + this.state.category;
    dataObj.deviceid = deviceid;
    dataObj.createtime = createtime;
    dataObj.widgetname = this.state.stackname;
    dataObj.deleteflag = 0;
    dataObj.applist = this.state.applist;
    dataObj.mostusedwidget = 2;
    dataObj.headercolor = this.isColorValid(this.state.headercolor);
    dataObj.fontcolor = this.isColorValid(this.state.fontcolor);
    dataObj.backgroundcolor = "";
    dataObj.transperancy = this.state.transperancy;
    dataObj.backgroundpicture = "file://";
    dataObj.feed = this.state.feed;
    var widgetarr = [];
    widgetarr.push(dataObj);

    if (coins >= 0 && this.state.methode == "coins" && !this.state.purchased_before) {
      this.purchase_withcoin(widgetarr)
      return;
    }

    else if (price >= 0 && this.state.methode == "payment" && !this.state.purchased_before) {

      //this.setState({
      //  loading: true
      // })

      operation = "purchase";
      try {
        if (price != 0) {
          const message = await RNIap.prepareAndroid()
          const receipt = await RNIap.buyItem(this.state.pricecategoryid);
        }
        var fileid = await commons.getuuid();
        var store_status = await commons.store_download_file_tocache(this.state.staxdownload, fileid, ".jpg");
        var res = await databasehelper.upsert_fileid(fileid);
        widgetarr[0].fileid = fileid;
        if (store_status == true) {
          var result = await databasehelper.shareinsertwidget(widgetarr);
          // this.setState({ loading: false });
          this.refs.loaderRef.hide();

        }

        else {
          ToastAndroid.show("error", 500);

          this.setState({ purchaseNotSuccess: true, loading: false });
          this.refs.loaderRef.hide();

          return
        }

        //update suuccesfull purchase on server,userid,stackid



      } catch (errorCode) {
        //  this.setState({ loading: false });
        // alert(errorCode);
        this.refs.loaderRef.hide();

        return;
      }

    }

    else {
      //alert("els");

      var fileid = await commons.getuuid();
      var store_status = await commons.store_download_file_tocache(this.state.staxdownload, fileid, ".jpg");
      var res = await databasehelper.upsert_fileid(fileid);
      widgetarr[0].fileid = fileid;
      // alert(" St Sts==> "+store_status);
      if (store_status == true)
        var result = await databasehelper.shareinsertwidget(widgetarr);
      else {
        ToastAndroid.show("error", 500);
        return
      }
      //  this.setState({ loading: false });
      //  ToastAndroid.show('Stax Downloaded', ToastAndroid.SHORT);
      // goBack();

    }

    var uuid = await commons.getuuid()
    //  this.setState({ loading: true });
    this.refs.loaderRef.show();

    let curdeviceid = await AsyncStorage.getItem("currentdeviceid");

    var reqobj = {
      "operation": "updateuserCount",
      "contentid": this.state.stackid,
      "category": this.state.category,
      "staxtype": operation, //or like,favorite,purchase,downloads
      "staxvalue": "true", //true/false
      "userid": this.state.username,
      "uuid": uuid, //for history & opperation table primery id
      "createdate": commons.gettimestamp() + "",
      "purchasetype": "payment",
      "currentdevice": curdeviceid
      // "staxprice":price
    }


    await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify(reqobj),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        // alert("Upd Count ==>"+JSON.stringify(responseJson));

        this.setState({
          loading: false,

        });
        this.refs.loaderRef.hide();

        var StxNme = this.state.stackname;
        try {
          var MixPanl_tocken = aws_data11.mixpanel_token;
          Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
            Mixpanel.default.track("Number of Purchases " + StxNme);
          });
        } catch (err) {
        }

        //    widget_idParam
        ToastAndroid.show('Stax Downloaded', ToastAndroid.SHORT);
        // goBack(); anandu
        //   commons.replaceScreen(this, "widgetseditor", { "widget_id": this.state.widgetid, "deviceid": this.state.choosendeviceid, "item": this.state.choosen_device });

        var item = this.props.navigation.state.params.item;
        this.setState({ loading: false });
        this.refs.loaderRef.hide();

        const { navigate } = this.props.navigation;
        //commons.replaceScreen(this, "widgets", { "widget_id1": widget_idParam });
        commons.replaceScreen(this, "bottom_menu", { "page": "STAX", "widget_id1": widget_idParam });
      })
      .catch((error) => {
        this.setState({ loading: false });
        this.refs.loaderRef.hide();

        console.error(error);
      });



    this.refs.loaderRef.hide();



  }
  isColorValid(color) {
    // if(color!=null&&color!=""&&color!="Nil"&&color.startsWith("#"))
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      return color;
    }
    else {
      return "";
    }


  }
  async Share() {
    widgetArray = [];
    devObj = {};
    devObj["widgetid"] = await commons.getuuid();
    devObj["widgetname"] = this.state.stackname;
    devObj["createtime"] = await commons.gettimestamp();
    devObj["storeid"] = this.state.stackid + "#" + this.state.category;

    widgetArray.push(devObj);
    // alert(JSON.stringify(widgetArray));
    const { navigate } = this.props.navigation;
    navigate("Friends", user = { widgetArray });
  }

  async share_widget() {

    try {
      var MixPanl_tocken = aws_data11.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
        Mixpanel.default.track("Share Widget");
      });
    } catch (err) {

    }

    var username = await AsyncStorage.getItem("username");
    if (username == null || username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }


    widgetArray = [];
    devObj = {};
    devObj["widgetid"] = await commons.getuuid();
    devObj["widgetname"] = this.state.stackname;
    devObj["createtime"] = await commons.gettimestamp();
    devObj["storeid"] = this.state.stackid + "#" + this.state.category;

    widgetArray.push(devObj);
    // alert(JSON.stringify(widgetArray));

    // this.setState({ loading: true });
    this.refs.loaderRef.show();
    var userData = await databasehelper.getuser();
    var firstname = "";
    var lastname = "";
    if (userData.res != null && userData.res.length > 0) {
      firstname = userData.res[0].firstname;
      lastname = userData.res[0].lastname;
    }
    var req_obj = {};
    req_obj["operation"] = "insertSharedList";
    var acceestoken = await commons.get_token();
    // var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
    var date = commons.gettimestamp();
    var uuid = await commons.getuuid()
    // var username = await AsyncStorage.getItem("username");
    var tranid = await commons.getuuid();
    var payload = {};

    payload["sharingid"] = uuid;
    payload["from"] = username;
    payload["to"] = "";
    payload["status"] = "pending";
    payload["medium"] = "socialmedia";
    payload["transactionid"] = tranid;
    payload["senddate"] = date;
    payload["widget"] = widgetArray;
    payload["fromName"] = firstname + " " + lastname;
    req_obj["payload"] = payload;

    await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.sharingfunction, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify(req_obj),
    }).then((response) => response.json())
      .then(async (responseJson) => {

        //    alert(JSON.stringify(responseJson));
        //  this.setState({ loading: false });
        this.refs.loaderRef.hide();

        var options = shareOptions = {
          title: "Share By",
          message: "Hello,\n\n" + firstname + " " + lastname + " has shared the " + widgetArray[0].widgetname + " Stax with you. Please click on the link below to receive your APRROW Stax.\n\n https://www.aprrow.com/redirect.html?id=#" + uuid + "\n\nPlease note that you must have APRROW installed in your device to receive a Stax. Please click here https://play.google.com/store/apps/details?id=com.aprrow to install APRROW.\n\nLife is a Journey! Where will APRROW take YOU?",
          url: "www.aprrow.com",
          subject: firstname + " " + lastname + " has shared an APRROW Stax with You" //  for email
        };

        Share.open(options);

      })
      .catch((error) => {

        console.error(error);
      });


  }
  purchase() {

  }

  async purchase_withcoin(widgetarr) {
    var widget_idParam = this.state.stackid + "#" + this.state.category;//anandu
    var acceestoken = await commons.get_token();
    var coins1 = parseFloat(this.state.coins);
    //alert("Coin :: "+coins1);
    const { goBack } = this.props.navigation;
    // this.setState({ loading: true });
    this.refs.loaderRef.show();

    operation = "purchase";
    await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.rewardmanagement, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "purchasewithcoin",
        "userid": this.state.username,
        "contentid": this.state.stackid,
        "category": this.state.category
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {


        if (responseJson.Status == "SUCCESS") {

          var fileid = await commons.getuuid();
          var store_status = await commons.store_download_file_tocache(this.state.staxdownload, fileid, ".jpg");
          var res = await databasehelper.upsert_fileid(fileid);
          widgetarr[0].fileid = fileid;
          if (store_status == true)
            var result = await databasehelper.shareinsertwidget(widgetarr);
          else {
            //  this.setState({ loading: false });
            this.refs.loaderRef.hide();

            ToastAndroid.show("error", 500);
            //       this.setState({ purchaseNotSuccess: true});

            return
          }

          ///////update status on server///////////////
          let curdeviceid1 = await AsyncStorage.getItem("currentdeviceid");

          var uuid = await commons.getuuid()
          // this.setState({ loading: true });
          this.refs.loaderRef.show();

          var reqobj = {
            "operation": "updateuserCount",
            "contentid": this.state.stackid,
            "staxtype": operation, //or like,favorite,purchase,downloads
            "staxvalue": "true", //true/false
            "userid": this.state.username,
            "uuid": uuid, //for history & opperation table primery id
            "createdate": commons.gettimestamp() + "",
            "category": this.state.category,
            "purchasetype": "coin",
            "currentdevice": curdeviceid1
            // "staxprice":coins1
          }

          await fetch('' + AWSConfig.path + AWSConfig.stage + aws_lamda.contentmanagement, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': acceestoken
            },
            body: JSON.stringify(reqobj),
          }).then((response) => response.json())
            .then(async (responseJson) => {


              this.setState({
                loading: false,

              });
              this.refs.loaderRef.hide();
              var StxNme = this.state.stackname;
              try {
                var MixPanl_tocken = aws_data11.mixpanel_token;
                Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                  Mixpanel.default.track("Number of Purchases " + StxNme);
                });
              } catch (err) {
              }
              ToastAndroid.show('Stax Downloaded', ToastAndroid.SHORT);
              // goBack(); anandu
              var item = this.props.navigation.state.params.item;
              this.setState({ loading: false });
              const { navigate } = this.props.navigation;
              //    commons.replaceScreen(this, "widgets", user = { item });
              commons.replaceScreen(this, "bottom_menu", { "page": "STAX", "widget_id1": widget_idParam });
            })
            .catch((error) => {
              this.refs.loaderRef.hide();
              this.setState({ loading: false });
              console.error(error);
            });

          /////////////////////////////////////////////      
        }
        else {
          this.setState({ coinsUnavailable: true, loading: false })
          this.refs.loaderRef.hide();

          // Alert.alert("Error", "you Dont Have enough coins to purchase this item");
          return;
        }

      })
      .catch((error) => {
        this.refs.loaderRef.hide();
        this.setState({ loading: false });
        console.error(error);
        return;
      });

    this.refs.loaderRef.hide();


  }
  async openLink1(url) {

  }
  async openLink(url) {

    const { navigate } = this.props.navigation;
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
  async  componentDidMount() {
    var istab = await DeviceInfo.isTablet();
    this.setState({ istab: istab });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });


    this.props.navigation.setParams({ backPage: this.backPage.bind(this) });
    var s3config = require('../config/AWSConfig.json');
    var staxid = this.props.navigation.state.params.staxid;
    var category = this.props.navigation.state.params.category;

    if (this.props.navigation.state.params.hasOwnProperty("goback"))
      this.setState({ goback: true });
    else
      this.setState({ goback: false });


    var username = await AsyncStorage.getItem("username");
    //alert(" "+staxid+" "+category+" "+username)
    //this.setState({ loading: true })
    var urlName = "";
    if (username == null || username == commons.guestuserkey()) {
      urlName = aws_lamda.commenapis;
    }
    else {
      urlName = aws_lamda.contentmanagement;
    }
    var Locale = require('react-native-locale');
    //var Country_Code=Locale.constants()["countryCode"];
    var Country_Code = await ToastExample.getCurrentCountryCode();
    Country_Code = Country_Code.toUpperCase();
    if (Country_Code == "" || Country_Code == null || Country_Code == "null") {
      Country_Code = Locale.constants()["countryCode"];
    }
    this.refs.loaderRef.show();

    var acceestoken = await commons.get_token();
    await fetch('' + AWSConfig.path + AWSConfig.stage + urlName, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({

        "operation": "getSingleContent",
        "contentid": staxid,
        "category": category,
        "userid": username,
        "country": Country_Code

      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        //  alert(JSON.stringify(responseJson));
        var Country_Currency_Code = "USD";
        if (responseJson.CountryCode != "US" && responseJson.CountryCode != "" && responseJson.CountryCode != null) {
          Country_Currency_Code = await ToastExample.getCurrentCurrencyCode();

          if (Country_Currency_Code == null || Country_Currency_Code == "" || Country_Currency_Code == "null") {
            Country_Currency_Code = Locale.constants()["currencyCode"];
            // alert("Loc")
          }
        }
        /*  if(responseJson.CountryCode!="US"&&responseJson.CountryCode!=""&&responseJson.CountryCode!=null)
          {
            Country_Currency_Code=Locale.constants()["currencyCode"];     
          }*/

        responseJson.staxpreview = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/LowImage_" + staxid + ".jpg";
        responseJson.downloadstax = s3config.s3path + "/" + s3config.s3bucketname + "/" + s3config.s3storefolder + "/HighImage_" + staxid + ".jpg"

        if (!responseJson.hasOwnProperty("headercolor"))
          responseJson["headercolor"] = "";
        if (!responseJson.hasOwnProperty("fontcolor"))
          responseJson["fontcolor"] = "#3b1cd8";
        if (!responseJson.hasOwnProperty("transperancy"))
          responseJson["transperancy"] = "";

        if (!responseJson.hasOwnProperty("PriceList"))
          responseJson["PriceList"] = "0";

        if (!responseJson.hasOwnProperty("pricecategory")) {
          responseJson["PriceList"] = "0";
          responseJson["pricecategory"] = "";
        }

        if (!responseJson.hasOwnProperty("likecount")) {
          responseJson["likecount"] = "0";
        }


        if (!responseJson.hasOwnProperty("downloadscount")) {
          responseJson["downloadscount"] = "0";
        }

        if (!responseJson.hasOwnProperty("Rewards")) {
          responseJson["Rewards"] = "0";
        }

        if (!responseJson.userStatus.hasOwnProperty("like")) {
          responseJson.userStatus["like"] = false;
          responseJson.userStatus["favorite"] = false;
          responseJson.userStatus["purchase"] = false;
        }
        else {

          if (responseJson.userStatus["like"] == "false")
            responseJson.userStatus["like"] = false;
          else
            responseJson.userStatus["like"] = true;



          if (responseJson.userStatus["favorite"] == "false")
            responseJson.userStatus["favorite"] = false;
          else
            responseJson.userStatus["favorite"] = true;



          if (responseJson.userStatus["purchase"] == "false")
            responseJson.userStatus["purchase"] = false;
          else
            responseJson.userStatus["purchase"] = true;

        }

        var favicon = ""
        if (responseJson.userStatus.favorite)
          favicon = require("../assets/icon_favorites_orange.png")
        else
          favicon = require("../assets/icon_favorites_white.png");

        var likeicon = ""
        if (!responseJson.userStatus.like)
          likeicon = require("../assets/icon_like_white.png");
        else
          likeicon = require("../assets/icon_like_orange.png");

        var timestamp = responseJson.createtime;
        var staxNme = responseJson.widgetname;
        try {
          var MixPanl_tocken = aws_data11.mixpanel_token;
          Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
            Mixpanel.default.track("Store Home Page");
          });
        } catch (err) {

        }

        //alert("test:"+responseJson.PriceList);
        this.setState({
          stackid: staxid,
          category: category,
          headercolor: responseJson.headercolor,
          fontcolor: responseJson.fontcolor,
          transperancy: responseJson.transperancy,
          pricecategoryid: responseJson.pricecategory,//need this data from backed
          staxbackground: responseJson.staxpreview,
          staxdownload: responseJson.downloadstax,
          stackname: responseJson.widgetname,
          applist: responseJson.applist,
          priceUnit: Country_Currency_Code,
          price: responseJson.PriceList,//update price with dta frombackend
          coins: responseJson.Rewards,
          favoriteicon: favicon,
          likeicon: likeicon,
          likecount: responseJson.likecount,
          downloads: responseJson.downloadscount,
          Description: responseJson.description,
          isfavorite: responseJson.userStatus.favorite,
          isliked: responseJson.userStatus.like,
          purchased_before: responseJson.userStatus.purchase,
          loading: false,
          timestamp: timestamp,
          username: username,

        });
        if (responseJson.FeedsLink != undefined) {

          await this.setState({ feed: responseJson.FeedsLink });

        }


        // console.log(JSON.stringify(responseJson));
      })
      .catch((error) => {
        this.refs.loaderRef.hide();

        //   this.setState({ loading: false });
        console.error(error);
      });
    this.refs.loaderRef.hide();

  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <LoaderNew ref={"loaderRef"} />

        <Modal
          isVisible={this.state.termsconmodel}
          style={{ flex: 1 }}
          swipeDirection="right"
          animationIn="fadeIn"
          animationOut="fadeOut">
          <View style={[styles.container, { borderRadius: 3 }]}>
            <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center" }}>
              <Text allowFontScaling={false} style={{ color: 'white', fontFamily: 'Roboto-Bold' }}>PURCHASE TERMS & CONDITIONS</Text>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", alignContent: 'center', backgroundColor: 'white', height: '85%', width: '100%', paddingLeft: '3%', paddingRight: '3%' }}>
              <ScrollView>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12, lineHeight: 30 }}></Text>
                <Text allowFontScaling={false} style={{ color: "black", fontSize: 12, lineHeight: 18 }}>All APRROW Stax purchases are final and non-refundable.</Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12 }}></Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12 }}></Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12, lineHeight: 18 }}>If you have any issues with receiving a purchased APRROW Stax or the functionality of a purchased APRROW Stax, you can find support or contact us through our Help Center. Alternatively, you can contact us at support@aprrow.com.</Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12, lineHeight: 18 }}></Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12, lineHeight: 18 }}></Text>
                <Text allowFontScaling={false} style={{ alignSelf: 'center', justifyContent: 'center', color: "black", fontSize: 12, lineHeight: 18, textAlign: 'justify' }}>LIMITED PERMISSION:  As consideration for your non-refundable purchase, MobileUX Technologies, Inc. (MobileUX) grants you a non-exclusive, non-transferable, revocable, limited right to access and view this Stax and the materials thereon. MobileUX authorizes you to view the information on this Stax ("Materials") only for your personal, non-commercial use. MobileUX and/or third parties with whom MobileUX has entered into contractual arrangements retain all rights, interest and title in the Materials and copies of the Materials, and any use thereof is subject to the following restrictions: 1) you may not modify the Materials in any way or reproduce or publicly display, perform, license, sublicense, distribute or otherwise use them for any public or commercial purpose; and 2) you must not transfer and/or share (via social media outlets or otherwise) the Materials to any other person. You agree to abide by all additional restrictions displayed on the Stax as it may be updated from time to time. Except for the limited use described above (which may be revoked at any time without notice), MobileUX does not grant any express or implied right to you under any patents, trademarks, copyrights or trade secret information.</Text>
              </ScrollView>
            </View>


            <TouchableOpacity onPress={() => { this.setState({ termsconmodel: false }) }} style={{ backgroundColor: "#006BBD", height: 36, width: '35%', alignItems: "center", marginBottom: 8, borderRadius: 3 }}>

              <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {uicommons.loginFlowDialog(this)}
        <Dialog
          visible={this.state.confirm_purchase}
          onTouchOutside={() => this.setState({ confirm_purchase: false })}
          animation='fade'
        >
          <View style={{ height: Dimensions.get('window').height * (11 / 40) }}>
            <Text allowFontScaling={false} style={{ marginBottom: '3%', fontFamily: 'Roboto-Bold', textAlign: 'center', color: 'black', fontSize: 26 }}>Confirm  Purchase</Text>
            <Text allowFontScaling={false} style={{ color: '#1569C7', fontSize: 19, marginBottom: '1%', textAlign: 'center' }}>{this.state.stackname} for {this.state.coins} coins ?</Text>

            <View style={{ flexDirection: 'row', marginTop: '15%', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#757575', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }} onPress={() => { this.setState({ confirm_purchase: false }) }}>

                <Text allowFontScaling={false} style={{ fontSize: 12, color: 'white', fontFamily: 'Roboto-Bold' }} >CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#0065B2', justifyContent: 'center', alignItems: 'center', marginLeft: 20, borderRadius: 5 }} onPress={() => this.downloadstax_execute()}>

                <Text allowFontScaling={false} style={{ fontSize: 12, color: 'white', fontFamily: 'Roboto-Bold' }} >BUY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>

        {/*Error Dialogue1*/}

        <Dialog
          visible={this.state.coinsUnavailable}
          onTouchOutside={() => this.setState({ coinsUnavailable: false })}
          animation='fade'
        >
          <View style={{ height: Dimensions.get('window').height * (11 / 40), marginTop: '5%' }}>
            <Text allowFontScaling={false} style={{ color: '#757575', fontSize: 20, marginBottom: '2%', textAlign: 'center' }}>Sorry, but you do not have</Text>
            <Text allowFontScaling={false} style={{ color: '#757575', fontSize: 20, marginBottom: '2%', textAlign: 'center' }}>enough coins available.</Text>

            <View style={{ flexDirection: 'row', marginTop: '20%', alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#757575', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }} onPress={() => { this.setState({ coinsUnavailable: false }) }}>

                <Text allowFontScaling={false} style={{ fontSize: 15, color: 'white', fontFamily: 'Roboto-Bold' }} >CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#F16822', justifyContent: 'center', alignItems: 'center', marginLeft: 20, borderRadius: 5 }} onPress={() => this.downloadstax("payment")}>

                <Text allowFontScaling={false} style={{ fontSize: 15, color: 'white', fontFamily: 'Roboto-Bold' }} >BUY {this.state.priceUnit} {this.state.price}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>

        {/*Error Dialogue2*/}

        <Dialog
          visible={this.state.purchaseNotSuccess}
          onTouchOutside={() => this.setState({ confirm_purchase: false })}
          animation='fade'
        >
          <View style={{ height: Dimensions.get('window').height * (5 / 20) }}>
            <Text allowFontScaling={false} style={{ color: '#757575', fontSize: 20, marginBottom: 5, textAlign: 'center' }}>Sorry, your purchase was not</Text>
            <Text allowFontScaling={false} style={{ color: '#757575', fontSize: 20, marginBottom: 5, textAlign: 'center' }}>successful.</Text>

            <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#757575', justifyContent: 'center', alignItems: 'center', borderRadius: 5 }} onPress={() => { this.setState({ purchaseNotSuccess: false }) }}>

                <Text allowFontScaling={false} style={{ fontSize: 15, color: 'white', fontFamily: 'Roboto-Bold' }} >CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '44%', height: 40, backgroundColor: '#F16822', justifyContent: 'center', alignItems: 'center', marginLeft: 20, borderRadius: 5 }} onPress={() => this.downloadstax("payment")} >

                <Text allowFontScaling={false} style={{ fontSize: 15, color: 'white', fontFamily: 'Roboto-Bold' }} >BUY  {this.state.priceUnit} {this.state.price}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>

        <ScrollView style={{ flex: 1 }}>
          <ImageBackground style={{ height: this.state.istab == true ? Dimensions.get('window').width - 80 : Dimensions.get('window').width - 50, width: Dimensions.get('window').width }}
            source={{ uri: this.state.staxbackground + "?time=" + this.state.timestamp }}
            imageStyle={{ resizeMode: 'stretch' }}

          >
          </ImageBackground>

          <View style={{ flexDirection: "row", flex: 1, marginTop: 2, marginLeft: '8%', marginTop: '2%' }}>
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.favorite()}>
                <Image source={this.state.favoriteicon} />
                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto' }}>Favorites</Text>
              </Touch>
            </View>

            <View style={{ flexDirection: "column", alignItems: "center", marginLeft: '8%' }}>
              <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.like()}>
                <Image source={this.state.likeicon} />
                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto' }}>{this.state.likecount}</Text>
              </Touch>

            </View>

            <View style={{ flexDirection: "column", alignItems: "center", marginLeft: '8%' }}>
              <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.share_widget()}>
                <Image source={require("../assets/icon_share_grey.png")} />
                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Roboto' }}>Share</Text>
              </Touch>
            </View>

            <View style={{ flex: 1, height: "50%", width: "50%", flexDirection: "column", marginTop: '-5%', marginLeft: '2%' }}>
              <View style={{ alignItems: "center", justifyContent: "center", alignSelf: "center" }}>
                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.downloadstax("payment")} style={{ marginLeft: '15%', flex: 1 }}>
                  <Image source={require("../assets/bt_price.png")} />
                </Touch>
                <Text allowFontScaling={false} style={{ marginTop: this.state.istab == true ? -36 : '-30%', fontSize: 17, marginLeft: this.state.istab == true ? '16%' : '5%', color: "white" }} onPress={() => this.downloadstax("payment")} >{this.state.priceUnit} {this.state.price}</Text>
              </View>

              <Text allowFontScaling={false} style={{ marginTop: '3%', marginLeft: this.state.istab == true ? "55%" : "50%" }}>or</Text>

              <View style={{ flex: 1, marginTop: '1%', alignItems: "center", justifyContent: "center" }}>
                <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.downloadstax("coins")} style={{ marginLeft: '15%' }}>
                  <Image source={require("../assets/bt_coin.png")} />
                </Touch>
                <View style={{ flexDirection: "row", marginTop: this.state.istab == true ? '-10%' : '-22%', marginLeft: this.state.istab == true ? "10%" : "15%", alignSelf: "center", alignItems: "center" }} onPress={() => this.downloadstax("coins")}>
                  <Text allowFontScaling={false} style={{ fontSize: 18, color: "white" }} onPress={() => this.downloadstax("coins")}>{this.state.coins}</Text>
                  {/*<Image style={{ marginLeft: "5%" }} source={require("./assets/aprrow_coin.png")}  />*/}
                  <Touch pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.downloadstax("coins")} style={{ marginLeft: "5%" }}>
                    <Image source={require("../assets/aprrow_coin.png")} />
                  </Touch>
                </View>

              </View>
            </View>

          </View>
          <View style={{ flexDirection: "column", width: '60%', height: 5 }}>
            <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () => {
              await this.setState({ termsconmodel: true })

            }}>
              <Text allowFontScaling={false} style={{ color: "red", marginTop: 3, marginBottom: 9, marginLeft: '6%', textDecorationLine: 'underline', fontSize: 14 }}>Purchase Terms & Conditions</Text>
            </TouchableOpacity>
          </View>

          <Text allowFontScaling={false} style={{ marginTop: 18, marginLeft: 15 }}>{this.state.downloads} Downloads</Text>
          <Image style={{ marginTop: 8, marginLeft: 11, marginRight: 2, width: '95%' }} source={require("../assets/line.png")} />

          <Text allowFontScaling={false} style={{ marginTop: 15, marginLeft: 15 }}>{this.state.Description}</Text>


        </ScrollView>
      </View >
    )

  }


}
var styles = {
  wrapper: {
  },
  slide1: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },

  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: '#000000',
  },

  list: {
    flex: 1,
    marginTop: 5,
    marginBottom: 8
  },

  contentContainer: {
    width: window.width,


    ...Platform.select({
      ios: {
        paddingHorizontal: 0,
      },

      android: {
        paddingHorizontal: 0,
      }
    })
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,

    flex: 1,
    marginTop: 5,
    borderRadius: 4,


    ...Platform.select({
      ios: {
        width: window.width - 30 * 2,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: { height: 2, width: 2 },
        shadowRadius: 2,
      },

      android: {
        width: window.width - 30 * 2,
        elevation: 0,
        marginHorizontal: 10,
      },
    })
  },

  image: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25,
  },

  text: {
    fontSize: 18,
    color: '#222222',
  }

}
