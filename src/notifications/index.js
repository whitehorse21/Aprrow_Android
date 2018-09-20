import React from 'react';
import {
  AsyncStorage,
  BackHandler,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Alert, ToastAndroid
} from 'react-native';
import databasehelper from '../utils/databasehelper.js';
import commons from '../commons.js';
import uicommons from '../ui.commons';
import Tabs from '../utils/tabs_Notification.js';
import LoaderNew from '../utils/LoaderNew.js';
import Modal from 'react-native-modal';
var Mixpanel = require('react-native-mixpanel');
export default class NotificationClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dlist: [],
      dlist2: [],
      //  loading:false,
      ref: false,
      ViewColor: 'white',
      refresh: false,
      refresh_unRead: false,
      notexpand: 'none',
      notcompre: 'flex',
      last_key_val_mapping: {},
      last_key_val_mapping_unread: {},
      NoNotification: 'none',
      yesNotifications: 'flex',
      NoNotification1: 'none',
      yesNotifications1: 'flex',
      searchquery: '',
      offlineFlag: false,
      notificationRefresh: false,
      MountTime: 0,
      gotologinflow: false

    }
    this.setVal = this.setVal.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  handleSave = () => {
    this.setState({ isOpen: !this.state.isOpen, });
  }
  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() {
    this.props.handleBackButtonClick("Notification");
    return true;

  }
  async componentDidMount() {
    try {
      var tocken = commons.AWSConfig.mixpanel_token;
      Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
        Mixpanel.default.track("Notification Page");
      });
    }
    catch (err) {
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    const Username = await AsyncStorage.getItem("username");
    if (Username == null || Username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }

    var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
      this.list();
      this.unRead_list();
    }
    else {
      this.setState({ offlineFlag: true });
    }
    await this.setState({ MountTime: 1 });
  }
  async RecomponentDidMount() {
    const Username = await AsyncStorage.getItem("username");
    if (Username == null || Username == commons.guestuserkey()) {
      this.setState({ gotologinflow: true });
      return;
    }
    if (this.state.MountTime == 1) {
      await this.setState({ MountTime: 2 });
      return;
    }

    var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
      await this.setState({ searchquery: '' });
      this.list();
      this.unRead_list();
    }
    else {
      this.setState({ offlineFlag: true });
    }
  }
  async search() {
    var Mixpannel_tocken = commons.AWSConfig.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
      Mixpanel.default.track("Notification Search");
    });
    this.list();
    this.unRead_list();
  }
  async setval(value) {
    await this.setState({ searchquery: value });
  }
  onRefresh() {
    this.setState({ refresh: true }, function () { this.list() });
  }
  onRefresh_unRead() {
    this.setState({ refresh_unRead: true }, function () { this.unRead_list() });
  }

  acceptRec(item) {
    this.StatusUpdate(item);
    Alert.alert(
      '',
      'Do you want to accept APRROW Stax ' + item.widgetName + ' by name?',
      [
        { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },
        { text: 'DECLINE', onPress: () => this.decline(item), style: 'cancel' },
        { text: 'ACCEPT', onPress: () => this.accept(item) },
      ],
      { cancelable: false }
    )
  }
  async accept(item) {
    item.recStatus = "Accepted";
    item.rcolor = '#2CAE1C';
    const deviceid = await AsyncStorage.getItem("currentdeviceid");

    if (deviceid == null) {
      ToastAndroid.show("Please Add Your Device to Recieve this widget", 500);
      return;
    }
    this.getWidgetFromBackend(item);
  }
  async getWidgetFromBackend(item) {
    var acceestoken = await commons.get_token();
    await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getSharedList",
        "sharingid": item.sharingid
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        var id = "";

        try {
          if (responseJson.widget[0].mostusedwidget == 2) {
            var splitted = responseJson.widget[0].widgetid.split('#');

            var storeid = splitted[0];
            var category = "";
            if (splitted.length >= 1)
              category = splitted[1];

            commons.replaceScreen(this, 'store_purchase', { "staxid": storeid, "category": category });
          }
          else if (responseJson.widget[0].storeid == undefined || responseJson.widget[0].storeid == 'undefined') {
            if (responseJson.medium == 'socialmedia') {
              var modified_widgets = [];
              const deviceid = await AsyncStorage.getItem("currentdeviceid");
              var widgetdata = responseJson.widget;
              for (var i = 0; i < widgetdata.length; i++) {

                var uuid = await commons.getuuid();
                id = uuid;
                widgetdata[i]["widgetid"] = uuid;
                widgetdata[i]["deviceid"] = deviceid;
                widgetdata[i]["mostusedwidget"] = 3;
                widgetdata[i]["createtime"] = commons.gettimestamp();

                if (commons.isimagevalid(widgetdata[i])) {
                  this.refs.loaderRef.show();
                  var old_fileid = widgetdata[i].fileid;
                  widgetdata[i]["fileid"] = await commons.getuuid();
                  await commons.download_sharedimage_tocache(old_fileid, widgetdata[i].fileid, responseJson.from, ".jpg");
                  this.refs.loaderRef.hide();
                }
                modified_widgets.push(widgetdata[i]);
              }
              var passdata = {
                "sharingid": item.sharingid,
                "status": "Accepted",
                "date": date,
                "Timestamp": item.Timestamp
              }
              this.backendwrite(passdata);
              this.props.setNavigation('STAX', id);
            }
            else if (responseJson.status == 'pending' && responseJson.medium == 'Email') {
              var modified_widgets = [];
              const deviceid = await AsyncStorage.getItem("currentdeviceid");
              var widgetdata = responseJson.widget;
              for (var i = 0; i < widgetdata.length; i++) {

                var uuid = await commons.getuuid();
                widgetdata[i]["widgetid"] = uuid;
                widgetdata[i]["deviceid"] = deviceid;
                widgetdata[i]["mostusedwidget"] = "1";
                widgetdata[i]["createtime"] = commons.gettimestamp();
                modified_widgets.push(widgetdata[i]);

              }

              var date = new Date().getDate() + "/" + parseInt(new Date().getMonth() + 1) + "/" + new Date().getFullYear();

              var passdata = {
                "sharingid": item.sharingid,
                "status": "Accepted",
                "date": date,
                "Timestamp": item.Timestamp
              }

              this.setState({ ref: false });
              this.backendwrite(passdata);
              var dlist = this.state.dlist2;
              var key = parseInt(item.key)
              dlist[key]["recStatus"] = "Accepted";
              dlist[key]["rcolor"] = 'green';
              this.setState({ dlist2: dlist });

            }
            else if (responseJson.status != 'pending' && responseJson.medium == 'Email') {
              ToastAndroid.show("Link Expired", 3000);
              commons.replaceScreen(this, 'welcome', {});
            }
          }
          else {

            var splitted = responseJson.widget[0].storeid.split('#');

            var storeid = splitted[0];
            var category = "";
            if (splitted.length >= 1)
              category = splitted[1];

            commons.replaceScreen(this, 'store_purchase', { "staxid": storeid, "category": category });
          }

        } catch (error) {
          alert(error);
        }
      })
      .catch((error) => {

        console.error(error);
      });

  }
  decline(item) {

    var date = new Date().getDate() + "/" + parseInt(new Date().getMonth() + 1) + "/" + new Date().getFullYear();
    item.recStatus = 'Declined';
    item.rcolor = '#CC0000';
    var passdata = {
      "sharingid": item.sharingid,
      "status": "Declined",
      "date": date,
      "Timestamp": item.Timestamp
    }

    this.setState({ ref: false });
    this.backendwrite(passdata);
  }
  async backendwrite(passdata) {
    //alert(JSON.stringify(passdata));
    var uuid = await commons.getuuid();
    var username = await AsyncStorage.getItem("username");
    var userData = await databasehelper.getuser();
    var date = await commons.gettimestamp();

    var acceestoken = await commons.get_token();
    fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "updatestatus_Temp",
        "sharingid": passdata.sharingid, //username
        "status": passdata.status,
        "statusdate": date,
        "Timestamp": passdata.Timestamp,
        "username": username,
        "name": userData.res[0].firstname + " " + userData.res[0].lastname,
        "uuid": uuid
      }),
    }).then((response) => response.json())
      .then(() => {
      });

  }
  async expand(item) { //alert(JSON.stringify(item));
    this.StatusUpdate(item);
    var dlist = this.state.dlist2;
    var key = parseInt(item.key)

    dlist[key]["display"] = "none";
    dlist[key]["displayexpand"] = "flex";

    dlist[key]["ReadFlagColor"] = "#ffffff";
    await this.setState({ dlist2: dlist });
  }
  async compress(item) {
    var dlist = this.state.dlist2;
    var key = parseInt(item.key)
    dlist[key]["display"] = "flex";
    dlist[key]["displayexpand"] = "none";
    this.setState({ dlist2: dlist });
  }
  async expand_unread(item) {
    //alert(JSON.stringify(item));
    var dlist = this.state.dlist;
    var key = parseInt(item.key)
    dlist[key]["display"] = "none";
    dlist[key]["displayexpand"] = "flex";
    dlist[key]["ReadFlagColor"] = "#ffffff";
    this.setState({ dlist: dlist });
    this.StatusUpdate(item);
  }
  async compress_unread(item) {
    var dlist = this.state.dlist;
    var key = parseInt(item.key)
    dlist[key]["display"] = "flex";
    dlist[key]["displayexpand"] = "none";
    this.setState({ dlist: dlist });
  }
  async StatusUpdate(item) { //alert(sharingid);
    if (item.ReadFlag == true)
      return


    var key = parseInt(item.key)
    var dlist = this.state.dlist2;
    dlist[key]["ReadFlagColor"] = "#ffffff";

    this.setState({ dlist2: dlist });
    var username = await AsyncStorage.getItem("username");
    console.log(JSON.stringify({
      "operation": "UpdateStatus",
      "username": username, //username
      "Timestamp": item.Timestamp
    }));
    var acceestoken = await commons.get_token();
    await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'notificationcountsstyle', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "UpdateStatus",
        "username": username, //username
        "Timestamp": item.Timestamp
      }),
    }).then(async (response) => await response.json())
      .then(async () => {
      });
  }
  offlineFunc() {
    this.setState({ offlineFlag: false });
    commons.replaceScreen(this, 'bottom_menu', {});
  }
  async loadmore(key) {
    var username = await AsyncStorage.getItem("username");
    if (key.hasOwnProperty("Timestamp")) {
      if (this.state.searchquery != '') {
        request = JSON.stringify({
          "operation": "getNotificationListofUser",
          "username": username, //username
          "from": this.state.searchquery,
          "LastEvaluatedKey": key
        });
      } else {
        request = JSON.stringify({
          "operation": "getNotificationListofUser",
          "username": username, //username
          "LastEvaluatedKey": key
        });
      }
      var acceestoken = await commons.get_token();
      await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': acceestoken
        },
        body: request,
      }).then(async (response) => await response.json())
        .then(async (responseJson) => {
          if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
            this.setState({ last_key_val_mapping: responseJson.LastEvaluatedKey });
          } else this.setState({ last_key_val_mapping: {} });

          var tolist = responseJson.to;
          device_list = [];
          device_list2 = [];

          if (tolist.length > 0) {
            var dlist_copy = this.state.dlist2;
            var dlist_length = dlist_copy.length;
            var index = 0;
            for (var i = 0; i < tolist.length; i++) {

              var deviceObj = {};
              if (tolist[i]["type"] == "reward") {
                deviceObj["key"] = (index++) + dlist_length + "";
                deviceObj["badge"] = tolist[i]["badge"];
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                deviceObj["type_reward"] = "flex";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "none";
                deviceObj["type_CollectReward"] = "none";

                dlist_copy.push(deviceObj);
              }
              if (tolist[i]["type"] == "CollectReward") {
                deviceObj["key"] = (index++) + "";
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }


                deviceObj["type_reward"] = "none";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "none";
                deviceObj["type_CollectReward"] = "flex";
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                dlist_copy.push(deviceObj);
              }
              if (tolist[i]["type"] == "from" && tolist[i]["to"] != undefined && tolist[i]["status"] != "pending") {
                // var deviceObj = {};
                deviceObj["key"] = (index++) + dlist_length + "";
                // var tempWidget
                deviceObj["name"] = "APRROW Stax";

                deviceObj["from"] = tolist[i]["from"];

                var dformat = commons.format_string_date(tolist[i]["senddate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
                deviceObj["Date"] = dformat;
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                deviceObj["fromName"] = tolist[i]["fromName"];
                deviceObj["widgetName"] = tolist[i]["widget"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                //deviceObj["Timestamp"]=tolist[i]["Timestamp"];
                deviceObj["slist"] = 'Shared By Name';
                deviceObj["sharingid"] = tolist[i]["sharingid"];
                deviceObj["widget"] = tolist[i]["widget"];


                if (tolist[i].status == 'Declined') {
                  deviceObj["recStatus"] = 'Declined';
                  deviceObj["rcolor"] = '#CC0000';
                }
                else if (tolist[i].status == 'pending') {
                  deviceObj["recStatus"] = 'Accept or Decline';
                  deviceObj["rcolor"] = '#006BCC';
                }
                else {
                  deviceObj["recStatus"] = 'Accepted';
                  deviceObj["rcolor"] = '#2CAE1C';
                }
                dlist_copy.push(deviceObj);
              } else if (tolist[i]["type"] == "to") {
                deviceObj["key"] = (index++) + dlist_length + "";
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["type_reward"] = "none";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "flex";
                deviceObj["type_CollectReward"] = "none";
                var dformat = commons.format_string_date(tolist[i]["statusdate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
                deviceObj["Date"] = dformat;
                deviceObj["FromName"] = tolist[i]["fromName"];
                deviceObj["widgetName"] = tolist[i]["widget"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                deviceObj["sharingid"] = tolist[i]["sharingid"];
                if (tolist[i].status == 'Declined') {
                  deviceObj["recStatus"] = 'Declined';
                  deviceObj["rcolor"] = '#CC0000';
                }
                else if (tolist[i].status == 'pending') {
                  deviceObj["recStatus"] = 'Accept or Decline';
                  deviceObj["rcolor"] = '#006BCC';
                }
                else {
                  deviceObj["recStatus"] = 'Accepted';
                  deviceObj["rcolor"] = '#2CAE1C';
                }
                dlist_copy.push(deviceObj);
              }
            }
            this.setState({ dlist2: dlist_copy });
          } else this.setState({ remote: 'flex' });
        })
        .catch(() => {
        });
      this.setState({ refresh: false });
    }
  }

  async list() {
    this.refs.loaderRef.show();
    this.setState({ notificationRefresh: true });
    //await this.setState({loading:false});
    var username = await AsyncStorage.getItem("username");
    var request = JSON.stringify({
      "operation": "getNotificationListofUser",
      "username": username //username
    });

    if (this.state.searchquery != '') {
      request = JSON.stringify({
        "operation": "getNotificationListofUser",
        "username": username, //username
        "from": this.state.searchquery
      });
    } else {
      request = JSON.stringify({
        "operation": "getNotificationListofUser",
        "username": username //username
      });
    }
    //alert(request);
    var acceestoken = await commons.get_token();
    await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken

      },
      body: request,
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {

        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          var last_E_key = responseJson.LastEvaluatedKey;
          await this.setState({ last_key_val_mapping: last_E_key });
        } else await this.setState({ last_key_val_mapping: {} });
        var tolist = responseJson.to;
        device_list = [];
        device_list2 = [];
        var index = 0;
        if (tolist.length > 0) {
          for (var i = 0; i < tolist.length; i++) {
            var deviceObj = {};
            if (tolist[i]["type"] == "reward") {
              deviceObj["key"] = (index++) + "";
              deviceObj["badge"] = tolist[i]["badge"];
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }

              deviceObj["type_reward"] = "flex";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "none";
              deviceObj["type_CollectReward"] = "none";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              device_list2.push(deviceObj);
            }
            if (tolist[i]["type"] == "CollectReward") {  //alert(">>>>>");
              deviceObj["key"] = (index++) + "";
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }


              deviceObj["type_reward"] = "none";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "none";
              deviceObj["type_CollectReward"] = "flex";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              device_list2.push(deviceObj);
            }


            if (tolist[i]["type"] == "from" && tolist[i]["to"] != undefined && tolist[i]["status"] != "pending") {

              deviceObj["key"] = (index++) + "";
              deviceObj["name"] = "APRROW Stax";
              deviceObj["type_from"] = "flex";
              deviceObj["type_to"] = "none";
              deviceObj["type_reward"] = "none";
              deviceObj["type_CollectReward"] = "none";
              deviceObj["from"] = tolist[i]["from"];
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              var dformat = commons.format_string_date(tolist[i]["senddate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
              //alert("INFORMAT"+tolist[i]["senddate"]+"\nOutFormat"+dformat);
              deviceObj["Date"] = dformat;
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              deviceObj["toName"] = tolist[i]["toName"];
              deviceObj["widgetName"] = tolist[i]["widget"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }

              deviceObj["slist"] = 'Shared By Name';
              deviceObj["sharingid"] = tolist[i]["sharingid"];
              deviceObj["widget"] = tolist[i]["widget"];

              if (tolist[i].status == 'Declined') {
                deviceObj["recStatus"] = 'Declined';
                deviceObj["rcolor"] = '#CC0000';
              }
              else {
                deviceObj["recStatus"] = 'Accepted';
                deviceObj["rcolor"] = '#2CAE1C';
              }
              device_list2.push(deviceObj);
            }
            else if (tolist[i]["type"] == "to") {
              deviceObj["key"] = (index++) + "";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["type_reward"] = "none";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "flex";
              deviceObj["type_CollectReward"] = "none";
              var dformat = commons.format_string_date(tolist[i]["statusdate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
              deviceObj["Date"] = dformat;
              deviceObj["FromName"] = tolist[i]["fromName"];
              deviceObj["widgetName"] = tolist[i]["widget"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              deviceObj["sharingid"] = tolist[i]["sharingid"];
              if (tolist[i].status == 'Declined') {
                deviceObj["recStatus"] = 'Declined';
                deviceObj["rcolor"] = '#CC0000';
              }
              else if (tolist[i].status == 'pending') {
                deviceObj["recStatus"] = 'Accept or Decline';
                deviceObj["rcolor"] = '#006BCC';
              }
              else {
                deviceObj["recStatus"] = 'Accepted';
                deviceObj["rcolor"] = '#2CAE1C';
              }
              device_list2.push(deviceObj);
            }
          }
        } else {
          this.setState({ remote: 'flex' });
        }
        if (device_list2.length == 0) {
          this.setState({ yesNotifications: 'none', NoNotification: 'flex' });
        } else {
          this.setState({ dlist2: device_list2, yesNotifications: 'flex', NoNotification: 'none' });
        }
        this.refs.loaderRef.hide();

      })
      .catch((error) => {
        console.error(error);
        this.refs.loaderRef.hide();
      });
    this.setState({ refresh: false });
  }

  async unRead_loadmore(key) {
    var username = await AsyncStorage.getItem("username");
    if (key.hasOwnProperty("Timestamp")) {
      if (this.state.searchquery != '') {
        request = JSON.stringify({
          "operation": "getToNotificationStaxUnreadUser",
          "username": username, //username
          "from": this.state.searchquery,
          "LastEvaluatedKey": key
        });
      } else {
        request = JSON.stringify({
          "operation": "getToNotificationStaxUnreadUser",
          "username": username, //username
          "LastEvaluatedKey": key
        });
      }
      var acceestoken = await commons.get_token();
      await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': acceestoken
        },
        body: request,
      }).then(async (response) => await response.json())
        .then(async (responseJson) => {
          if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
            this.setState({ last_key_val_mapping: responseJson.LastEvaluatedKey });
          } else this.setState({ last_key_val_mapping: {} });

          var tolist = responseJson.to;
          device_list = [];
          device_list2 = [];
          var index = 0;
          if (tolist.length > 0) {
            var dlist_copy = this.state.dlist;
            var dlist_length = dlist_copy.length;
            for (var i = 0; i < tolist.length; i++) {

              var deviceObj = {};
              if (tolist[i]["type"] == "reward") {
                deviceObj["key"] = (index++) + dlist_length + "";
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                deviceObj["badge"] = tolist[i]["badge"];
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                deviceObj["type_reward"] = "flex";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "none";
                deviceObj["type_CollectReward"] = "none";
                dlist_copy.push(deviceObj);
              }
              if (tolist[i]["type"] == "CollectReward") {  //alert(">>>>>");
                deviceObj["key"] = (index++) + "";
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }


                deviceObj["type_reward"] = "none";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "none";
                deviceObj["type_CollectReward"] = "flex";
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                dlist_copy.push(deviceObj);
              }


              if (tolist[i]["type"] == "from" && tolist[i]["to"] != undefined && tolist[i]["status"] != "pending") {
                // var deviceObj = {};
                deviceObj["key"] = (index++) + dlist_length + "";
                // var tempWidget
                deviceObj["name"] = "APRROW Stax";

                deviceObj["from"] = tolist[i]["from"];

                var dformat = commons.format_string_date(tolist[i]["senddate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
                //alert("INFORMAT"+tolist[i]["senddate"]+"\nOutFormat"+dformat);
                deviceObj["Date"] = dformat;
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                deviceObj["fromName"] = tolist[i]["fromName"];
                deviceObj["widgetName"] = tolist[i]["widget"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }

                deviceObj["slist"] = 'Shared By Name';
                deviceObj["sharingid"] = tolist[i]["sharingid"];
                deviceObj["widget"] = tolist[i]["widget"];


                if (tolist[i].status == 'Declined') {
                  deviceObj["recStatus"] = 'Declined';
                  deviceObj["rcolor"] = '#CC0000';
                }
                else if (tolist[i].status == 'pending') {
                  deviceObj["recStatus"] = 'Accept or Decline';
                  deviceObj["rcolor"] = '#006BCC';
                }
                else {
                  deviceObj["recStatus"] = 'Accepted';
                  deviceObj["rcolor"] = '#2CAE1C';
                }
                dlist_copy.push(deviceObj);
              } else if (tolist[i]["type"] == "to") {

                deviceObj["key"] = (index++) + dlist_length + "";
                deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
                deviceObj["type_reward"] = "none";
                deviceObj["type_from"] = "none";
                deviceObj["type_to"] = "flex";
                deviceObj["type_CollectReward"] = "none";
                deviceObj["Timestamp"] = tolist[i]["Timestamp"];
                var dformat = commons.format_string_date(tolist[i]["statusdate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
                deviceObj["Date"] = dformat;
                deviceObj["FromName"] = tolist[i]["fromName"];
                deviceObj["widgetName"] = tolist[i]["widget"];
                deviceObj["display"] = 'flex';
                deviceObj["displayexpand"] = 'none';
                if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                  deviceObj["ReadFlagColor"] = "#EEF4FA";

                }
                else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                  deviceObj["ReadFlagColor"] = "#ffffff";
                }
                deviceObj["sharingid"] = tolist[i]["sharingid"];
                if (tolist[i].status == 'Declined') {
                  deviceObj["recStatus"] = 'Declined';
                  deviceObj["rcolor"] = '#CC0000';
                }
                else if (tolist[i].status == 'pending') {
                  deviceObj["recStatus"] = 'Accept or Decline';
                  deviceObj["rcolor"] = '#006BCC';
                }
                else {
                  deviceObj["recStatus"] = 'Accepted';
                  deviceObj["rcolor"] = '#2CAE1C';
                }
                dlist_copy.push(deviceObj);
                // device_list2.push(deviceObj);
              }
            }
            this.setState({ dlist: dlist_copy });
          } else this.setState({ remote: 'flex' });
        })
        .catch(() => {
        });
      this.setState({ refresh: false });
    }
  }

  async unRead_list() {   //await this.setState({loading:false});
    var username = await AsyncStorage.getItem("username");
    var request = JSON.stringify({
      "operation": "getToNotificationStaxUnreadUser",
      "username": username //username
    });

    if (this.state.searchquery != '') {
      request = JSON.stringify({
        "operation": "getToNotificationStaxUnreadUser",
        "username": username, //username
        "from": this.state.searchquery
      });
    } else {
      request = JSON.stringify({
        "operation": "getToNotificationStaxUnreadUser",
        "username": username //username
      });
    }
    var acceestoken = await commons.get_token();
    await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: request,
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          var last_E_key = responseJson.LastEvaluatedKey;
          await this.setState({ last_key_val_mapping: last_E_key });
        } else await this.setState({ last_key_val_mapping: {} });
        var tolist = responseJson.to;
        device_list = [];
        device_list2 = [];

        var index = 0;
        if (tolist.length > 0) {
          for (var i = 0; i < tolist.length; i++) {
            var deviceObj = {};
            if (tolist[i]["type"] == "reward") {
              deviceObj["key"] = (index++) + "";
              deviceObj["badge"] = tolist[i]["badge"];
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              deviceObj["type_reward"] = "flex";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "none";
              deviceObj["type_CollectReward"] = "none";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              device_list2.push(deviceObj);
            }
            if (tolist[i]["type"] == "CollectReward") {  //alert(">>>>>");
              deviceObj["key"] = (index++) + "";
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }


              deviceObj["type_reward"] = "none";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "none";
              deviceObj["type_CollectReward"] = "flex";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              device_list2.push(deviceObj);
            }
            if (tolist[i]["type"] == "from" && tolist[i]["to"] != undefined && tolist[i]["status"] != "pending") {
              deviceObj["key"] = (index++) + "";
              deviceObj["name"] = "APRROW Stax";
              deviceObj["type_from"] = "flex";
              deviceObj["type_to"] = "none";
              deviceObj["type_reward"] = "none";
              deviceObj["type_CollectReward"] = "none";
              deviceObj["from"] = tolist[i]["from"];
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];

              var dformat = commons.format_string_date(tolist[i]["senddate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
              deviceObj["Date"] = dformat;
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              deviceObj["toName"] = tolist[i]["toName"];
              deviceObj["widgetName"] = tolist[i]["widget"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }

              deviceObj["slist"] = 'Shared By Name';
              deviceObj["sharingid"] = tolist[i]["sharingid"];
              deviceObj["widget"] = tolist[i]["widget"];

              if (tolist[i].status == 'Declined') {
                deviceObj["recStatus"] = 'Declined';
                deviceObj["rcolor"] = '#CC0000';
              }
              else {
                deviceObj["recStatus"] = 'Accepted';
                deviceObj["rcolor"] = '#2CAE1C';
              }
              device_list2.push(deviceObj);
            } else if (tolist[i]["type"] == "to") {
              deviceObj["key"] = (index++) + "";
              deviceObj["Timestamp"] = tolist[i]["Timestamp"];
              deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
              deviceObj["type_reward"] = "none";
              deviceObj["type_from"] = "none";
              deviceObj["type_to"] = "flex";
              deviceObj["type_CollectReward"] = "none";
              var dformat = commons.format_string_date(tolist[i]["statusdate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY HH:mm');
              deviceObj["Date"] = dformat;
              deviceObj["FromName"] = tolist[i]["fromName"];

              deviceObj["widgetName"] = tolist[i]["widget"];
              deviceObj["display"] = 'flex';
              deviceObj["displayexpand"] = 'none';
              if (deviceObj["ReadFlag"] == 'false' || deviceObj["ReadFlag"] == false) {
                deviceObj["ReadFlagColor"] = "#EEF4FA";

              }
              else if (deviceObj["ReadFlag"] == 'true' || deviceObj["ReadFlag"] == true) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              else if (deviceObj["ReadFlag"] == 'undefined' || deviceObj["ReadFlag"] == undefined) {
                deviceObj["ReadFlagColor"] = "#ffffff";
              }
              deviceObj["sharingid"] = tolist[i]["sharingid"];
              if (tolist[i].status == 'Declined') {
                deviceObj["recStatus"] = 'Declined';
                deviceObj["rcolor"] = '#CC0000';
              }
              else if (tolist[i].status == 'pending') {
                deviceObj["recStatus"] = 'Accept or Decline';
                deviceObj["rcolor"] = '#006BCC';
              }
              else {
                deviceObj["recStatus"] = 'Accepted';
                deviceObj["rcolor"] = '#2CAE1C';
              }
              device_list2.push(deviceObj);
            }
          }
        } else this.setState({ remote: 'flex' });

        if (device_list2.length == 0) {
          await this.setState({ yesNotifications1: 'none', NoNotification1: 'flex' });
        } else
          await this.setState({ dlist: device_list2, yesNotifications1: 'flex', NoNotification1: 'none' });
      })
      .catch((error) => {
        console.error(error);
      });
    this.setState({ refresh: false });
  }



  offlineFunc() {
    this.setState({ offlineFlag: false });
    this.props.setNav('Home');
  }
  async setVal() {
    //alert("hello");
    this.list();
    this.unRead_list();
  }
  render() {

    return (
      <View style={styles.container}>
        {uicommons.offlineDialog(this)}
        <Tabs setVal={this.setVal}>
          {/*Read Tab*/}
          <View title="ALL" style={{ backgroundColor: 'white', flex: 1, alignItems: 'center', backgroundColor: '#ffffff' }}>

            <View style={{ backgroundColor: 'white', flex: 1, display: this.state.YesNotification }}>
              <LoaderNew ref={"loaderRef"} />
              <FlatList style={{ flex: 1 }}
                data={this.state.dlist2}
                extraData={this.state}
                style={{ backgroundColor: 'white' }}
                refreshing={this.state.refresh}
                onRefresh={() => this.onRefresh()}
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                  this.loadmore(this.state.last_key_val_mapping);
                }}
                renderItem={({ item }) =>
                  <View style={{ flex: 1 }}>
                    <View style={{ display: this.state.yesNotifications, flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 10, backgroundColor: item.ReadFlagColor }}>
                      <View style={{ display: item.type_from }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have shared a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} >You have shared the {item.widgetName} Stax with..</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', paddingBottom: 5 }}>You have shared a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 8 }} numberOfLines={2}>You have shared the {item.widgetName} Stax with {item.toName}</Text>
                            <View style={{ width: '90%' }}>
                              {item.recStatus == 'Accept or Decline' ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontWeight: '500' }}>{item.recStatus}</Text> : <Text allowFontScaling={false} onPress={() => {
                                const { navigate } = this.props.navigation
                                navigate("sharedApprow", { screen: "sharedApprow" })
                              }} style={{ fontSize: 18, color: '#2699FB', textAlign: 'right', fontWeight: '500', textDecorationLine: 'underline' }}>View Details</Text>}
                            </View>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>

                      </View>
                      <View style={{ display: item.type_reward }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Congratulations!</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} >You have achieved....</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: 'bold', color: '#000000', paddingBottom: 5 }}>Congratulations!</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 8 }} numberOfLines={2}></Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 8 }} numberOfLines={2}>You have achieved {item.badge} level</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>
                      </View>


                      <View style={{ display: item.type_to }}>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have received a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} >You have received the {item.widgetName} Stax from.. </Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}></View>
                        </View>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have received a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} numberOfLines={2}>You have received the {item.widgetName} Stax from {item.FromName}</Text>
                            <View style={{ width: '90%' }}>
                              {item.recStatus == 'Accept or Decline' ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontWeight: '500' }}>{item.recStatus}</Text> : <Text allowFontScaling={false} onPress={() => {
                                const { navigate } = this.props.navigation
                                navigate("sharedApprow", { "val": "1" })
                              }} style={{ fontSize: 18, color: '#2699FB', textAlign: 'right', fontWeight: '500', textDecorationLine: 'underline' }}>View Details</Text>}
                            </View>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}></View>
                        </View>
                      </View>

                      <View style={{ display: item.type_CollectReward }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Aprrow Coins</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} numberOfLines={2}>You have earned APRROW Coins. </Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Aprrow Coins</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>

                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }}>You have earned APRROW Coins.</Text>
                            <View style={{ width: '90%' }}>
                              <Text allowFontScaling={false} onPress={() => this.props.setNav("Rewards")} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontWeight: '500', textDecorationLine: 'underline' }}>Collect</Text>
                            </View>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                } />
            </View>
            <View style={{ display: this.state.NoNotification, width: '100%', height: '100%', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Text allowFontScaling={false} style={{ fontSize: 18 }}>You Dont Have Any Notifications</Text>
            </View>
          </View>


          {/*UnRead*/}
          <View title="Unread" style={{ flex: 1, backgroundColor: 'white', flex: 1, alignItems: 'center', backgroundColor: '#ffffff', }}>
            <View style={{ backgroundColor: 'white', flex: 1, display: this.state.yesNotifications1 }}>
              <LoaderNew ref={"loaderRef"} />
              <FlatList style={{ flex: 1 }}
                data={this.state.dlist}
                extraData={this.state}
                style={{ backgroundColor: 'white' }}
                refreshing={this.state.refresh}
                onRefresh={() => this.onRefresh()}
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                  this.loadmore(this.state.last_key_val_mapping);
                }}
                renderItem={({ item }) =>
                  <View style={{ flex: 1 }}>
                    <View style={{ display: this.state.yesNotifications1, flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 10, backgroundColor: item.ReadFlagColor }}>
                      <View style={{ display: item.type_from }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand_unread(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have shared a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} >You have shared the {item.widgetName} Stax with..</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}></View>
                        </View>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress_unread(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have shared a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }}>You have shared the {item.widgetName} Stax with {item.toName}</Text>
                            <View style={{ width: '90%' }}>
                              {item.recStatus == 'Accept or Decline' ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontFamily: 'Roboto-Bold' }}>{item.recStatus}</Text> : <Text onPress={() => {
                                const { navigate } = this.props.navigation
                                navigate("sharedApprow", { screen: "sharedApprow" })
                              }} allowFontScaling={false} style={{ fontSize: 18, color: '#2699FB', textAlign: 'right', fontFamily: 'Roboto-Bold', textDecorationLine: 'underline' }}>View Details</Text>}
                            </View>
                          </TouchableOpacity>

                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>

                      </View>
                      <View style={{ display: item.type_reward }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand_unread(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Congratulations!</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} >You have achieved....</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress_unread(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Congratulations!</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 8 }} numberOfLines={2}>You have achieved {item.badge} level</Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                      </View>
                      <View style={{ display: item.type_to }}>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand_unread(item)}>
                            <View style={{ flexDirection: 'row' }} >
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have received a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} numberOfLines={2}>You have received the {item.widgetName} Stax from.. </Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>

                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress_unread(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>You have received a Stax</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC', paddingBottom: 5 }}>{item.Date}</Text>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }}>You have received the {item.widgetName} Stax from {item.FromName}</Text>
                            <View style={{ width: '90%' }}>
                              {item.recStatus == 'Accept or Decline' ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontFamily: 'Roboto-Bold' }}>{item.recStatus}</Text> : <Text allowFontScaling={false} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontFamily: 'Roboto-Bold' }}>{item.recStatus}</Text>}
                            </View>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>

                      </View>
                      <View style={{ display: item.type_CollectReward }}>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.display }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.expand_unread(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Aprrow Coins</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_more_black.png")} />
                              </View>
                            </View>
                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }} numberOfLines={2}>You have earned APRROW Coins. </Text>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }}>
                          </View>
                        </View>
                        <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, display: item.displayexpand }}>
                          <TouchableOpacity style={{ flexDirection: 'column', paddingBottom: 5, width: '100%' }} onPress={() => this.compress_unread(item)}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ width: '90%' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: '#000000', paddingBottom: 5 }}>Aprrow Coins</Text>
                              </View>
                              <View>
                                <Image style={{ height: 25, width: 25, right: 0, marginTop: -4 }} source={require("../assets/icon_expand_less_black.png")} />
                              </View>
                            </View>

                            <Text allowFontScaling={false} style={{ fontSize: 15, color: '#2699FB', paddingBottom: 5 }}>You have earned APRROW Coins.</Text>
                            <View style={{ width: '90%' }}>
                              <Text allowFontScaling={false} onPress={() => this.props.setNav("Rewards")} style={{ fontSize: 18, color: item.rcolor, textAlign: 'right', fontWeight: '500', textDecorationLine: 'underline' }}>Collect</Text>
                            </View>
                          </TouchableOpacity>
                          <View style={{ marginTop: 10, height: 1, backgroundColor: "#b2babb", paddingRight: 20, width: '95%' }} />
                        </View>
                      </View>

                    </View>
                  </View>
                } />
            </View>
            <View style={{ display: this.state.NoNotification1, width: '100%', height: '100%', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Text allowFontScaling={false} style={{ fontSize: 18 }}>You Dont Have Any UnRead Notifications</Text>
            </View>
          </View>
        </Tabs>

        {uicommons.loginFlowDialog(this)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // App container
  container: {
    flex: 1,                            // Take up all screen
    backgroundColor: '#ffffff',         // Darker background for content area
    // backgroundColor: '#E9163',         // Background color
  },
  // Tab content container
  content: {
    flex: 1,                            // Take up all available space
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',               // Center horizontally
    backgroundColor: '#ffffff',         // Darker background for content area
  },
  // Content header
  header: {
    margin: 10,                         // Add margin
    color: '#2c66b7',                   // White color
    fontFamily: 'Avenir',               // Change font family
    fontSize: 26,                       // Bigger font size
  },
  // Content text
  text: {
    marginHorizontal: 20,               // Add horizontal margin
    color: 'rgba(255, 255, 255, 0.75)', // Semi-transparent text
    textAlign: 'center',                // Center
    fontFamily: 'Avenir',
    fontSize: 18,
  },
});