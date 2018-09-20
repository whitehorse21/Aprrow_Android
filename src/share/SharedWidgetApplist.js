import React, { Component } from 'react';
import ToastExample from '../nativemodules/Toast';
import {
  AsyncStorage,
  BackHandler,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ToastAndroid         // Container component
} from 'react-native';
import Share from "react-native-share";
import commons from '../commons';
import databasehelper from '../utils/databasehelper';
import Loader from '../utils/Loader';
import CheckBox from 'react-native-check-box';
var item = {};
var devicename = '';
var applimit = 0;
var paramsDisabledValue = false;
var aws_data = require("../config/AWSConfig.json");

export default class sharedApprow extends Component {


  static navigationOptions = ({ navigation }) => {

    const { params = {} } = navigation.state;
    const devicename = "App List";
    let title = devicename;
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '200' };
    let headerTintColor = 'white';
    let headerTitleAllowFontScaling = false;
    let headerRight = (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity disabled={params.disabledValue} onPress={() => params._ShareFunc()}>
          <Image style={{ height: 25, width: 25, marginTop: 1, marginRight: 15, marginBottom: 1 }} source={require("../assets/icon_share_white.png")} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => params.allSelect()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginRight: 10

            }}
            source={require("../assets/icon_done_all_white.png")}
          />
        </TouchableOpacity>
      </View>
    );

    return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerTitleAllowFontScaling };
  };
  constructor(props) {
    super(props);
    this.state = {
      applist_fromdevice: [],
      dlist: [],
      dlist2: [],
      show: false,
      ref: false,
      devicename: '',
      loading: false,
      appUninstallDesign: 'none'
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() {
    // commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});
    const { goBack } = this.props.navigation;
    goBack();

    return true;
  }
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    this.props.navigation.setParams({ _ShareFunc: this._ShareFunc.bind(this) });
    this.props.navigation.setParams({ disabledValue: false });
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this) });
    this.props.navigation.setParams({ deSelect: this.deSelect.bind(this) });
    paramsDisabledValue = false;
    //this.list();
    this.appList();
    item = this.props.navigation.state.params.item;
    devicename = item.name;

  }
  async appList() {

    var choosedDevice = this.props.navigation.state.params.item;

    var nav_deviceid = choosedDevice.id;
    var curdeviceid = await AsyncStorage.getItem("currentdeviceid");
    //alert("hello"+curdeviceid+"="+nav_deviceid);
    if (curdeviceid != null && curdeviceid == nav_deviceid) {
      this.setState({ appUninstallDesign: 'flex' });
      this.list();
    }
    else {
      const response = await fetch('' + aws_data.path + aws_data.stage + 'deviceappoperations', {
        method: 'POST',
        headers: commons.getHeader(),
        body: JSON.stringify({ "operation": "getApplist", "deviceid": nav_deviceid }),
      });
      const res = await response.json();

      var applist_Remotedevice = [];
      //alert(res.length);
      applimit = res.length;
      for (var i = 0; i < res.length; i++) {

        let applabel = res[i].applabel;
        let packagename = res[i].package;
        let icon = "";
        if (global.applist.hasOwnProperty(packagename))
          icon = "file://" + global.applist[packagename].icon
        else
          icon = commons.getIconUnavailable();

        var appobj = {};
        appobj["key"] = i + "";
        appobj["icon"] = icon;
        appobj["package"] = packagename;
        appobj["appname"] = applabel;
        appobj["checked"] = this.state.show;

        applist_Remotedevice.push(appobj);

      }
      this.setState({ dlist: applist_Remotedevice });


    }

  }
  async deSelect() {
    //await ToastExample.appUnInstaller()
  }


  async share_widget(widgetArray) {

    this.setState({ load_visible: true });
    var userData = await databasehelper.getuser();
    var firstname = "";
    var lastname = "";
    if (userData.res != null && userData.res.length > 0) {
      firstname = userData.res[0].firstname;
      lastname = userData.res[0].lastname;
    }
    var req_obj = {};
    req_obj["operation"] = "insertSharedList";
    // var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
    var date = commons.gettimestamp();
    var uuid = await commons.getuuid()
    var username = await AsyncStorage.getItem("username");
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

    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: commons.getHeader(),
      body: JSON.stringify(req_obj),
    }).then((response) => response.json())
      .then(async () => {
        //alert(responseJson);
        this.setState({ load_visible: false });
        var options = shareOptions = {
          title: "Share By",
          message: "Hello,\n\n" + firstname + " " + lastname + " has shared the " + widgetArray[0].widgetname + " Stax with you. Please click on the link below to receive your APRROW Stax.\n\n https://www.aprrow.com/redirect.html?id=#" + uuid + "\n\nPlease note that you must have APRROW installed in your device to receive a Stax. Please click here  https://play.google.com/store/apps/details?id=com.aprrow to install APRROW.\n\nLife is a Journey! Where will APRROW take YOU?",
          url: "www.aprrow.com",
          subject: firstname + " " + lastname + " has shared an APRROW Stax with You" //  for email
        };
        Share.open(options);
      })
      .catch((error) => {
        this.setState({ load_visible: false });
        console.error(error);
      });


  }

  async _ShareFunc() {
    this.props.navigation.setParams({ disabledValue: true });
    paramsDisabledValue = true;
    let d_list = this.state.dlist;

    let temp = JSON.stringify(d_list);
    let applist = [];
    for (let i = 0; i < d_list.length; i++) {
      if (d_list[i]["checked"] == true) {
        let dataObj = JSON.parse(temp);
        let applistObj = dataObj[i];
        applist.push(applistObj);
      }
    }
    var widgetArray = applist;
    if (widgetArray.length > 0) {
      if (paramsDisabledValue == true) {

        var applist_temp = [];
        //var temp=this.props.navigation.state.params.widgetArray;
        for (var i = 0; i < widgetArray.length; i++) {
          dataObj["appname"] = widgetArray[i]["appname"];
          dataObj["package"] = widgetArray[i]["package"];
          applist_temp.push(dataObj);
        }
        var newwidget = [];
        let dataObj = {};
        let createtime = commons.gettimestamp();
        let guid = await commons.getuuid();
        let deviceid = temp[0]["id"];
        dataObj.widgetid = guid;
        dataObj.deviceid = deviceid;
        dataObj.createtime = createtime;
        dataObj.widgetname = "Share Apps Friends";
        dataObj.deleteflag = 0;
        dataObj.applist = applist_temp;
        dataObj.mostusedwidget = 1;
        dataObj.headercolor = "";
        dataObj.backgroundcolor = "";
        dataObj.transperancy = "";
        dataObj.backgroundpicture = "";

        newwidget.push(dataObj);
        this.share_widget(newwidget);
        setTimeout(() => { this.props.navigation.setParams({ disabledValue: false }); paramsDisabledValue = false }, 1000);
      }
    }
    else {
      ToastAndroid.show("Apps Not Found.Please add apps", 3000);
      this.props.navigation.setParams({ disabledValue: false });
    }
  }
  async allSelect() {
    var trending_App_List = this.state.dlist;

    for (var i = 0; i < trending_App_List.length; i++) {
      // alert(trending_App_List[i]["checked"]);
      trending_App_List[i]["checked"] = true;
    }
    await this.setState({ dlist: [] });
    await this.setState({ dlist: trending_App_List });

  }
  async list() {
    this.setState({ dlist: [] });

    var applist_fromdevice = global.applist;

    var trending_App_List = [];
    applimit = Object.keys(applist_fromdevice).length;
    var k = 0;
    for (var app in applist_fromdevice) {

      let icon = "file://" + applist_fromdevice[app].icon;
      let applabel = applist_fromdevice[app].applabel;
      let packagename = applist_fromdevice[app].package;

      var appobj = {};
      appobj["key"] = k + "";
      appobj["icon"] = icon;
      appobj["package"] = packagename;
      appobj["appname"] = applabel;
      appobj["checked"] = this.state.show;
      trending_App_List.push(appobj);
      k++;

    }

    this.setState({ dlist: trending_App_List });
    //  });

  }

  async onClick(item) {
    if (item.checked == true) {

      item.checked = false;
    }
    else item.checked = true;

  }
  async UnInstallApps(item) {
    var arrayOfObjects = this.state.dlist;
    var app_array = [];
    for (var i = 0; i < arrayOfObjects.length; i++) {
      var obj = arrayOfObjects[i];
      if (obj.key !== item.key)
        app_array.push(obj);
      else applimit = applimit - 1;
    }
    this.setState({ dlist: app_array });
  }

  render() {

    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} />
        <View title="INSTALLED" style={styles.content}>
          <View style={{ height: 1, width: "100%", backgroundColor: "#b2babb" }}>
          </View>
          <View style={{ width: '100%', height: '12%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#F5F5F5' }}>
            <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: "black" }}>In "</Text>
            <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: "black" }}>{devicename}</Text>
            <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: 'Roboto-Bold', color: "black" }}>" Device ({applimit})</Text>
          </View>
          <View style={{ height: 1, width: "100%", backgroundColor: "#b2babb" }}>
          </View>
          <FlatList style={{ flex: 1 }}
            extraData={this.state}
            data={this.state.dlist}
            renderItem={({ item }) =>
              <View style={{ paddingLeft: 5, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'white', paddingTop: 10, paddingBottom: 20, paddingLeft: 10, paddingRight: 10 }}>

                  <View style={{ width: '15%', flexDirection: 'row', justifyContent: 'center' }}>
                    <Image style={{ width: 55, height: 55 }} source={{ uri: item.icon }} />
                  </View>
                  <View style={{ width: '45%', flexDirection: 'row', paddingTop: 15 }}>
                    <Text allowFontScaling={false} style={{ textAlign: 'left', marginLeft: 10, color: "black", fontFamily: 'Roboto-Bold', fontSize: 16 }} onPress={() => { }}>{item.appname}</Text>
                  </View>
                  <View style={{ marginLeft: "8%", width: '15%', justifyContent: 'center' }}>
                    <CheckBox
                      style={{ borderColor: 'blue' }}
                      onClick={() => this.onClick(item)}
                      isChecked={item.checked}
                      checkedImage={<Image source={require("../assets/icon_checkbox_on_lightblue_24px.png")} />}
                      unCheckedImage={<Image source={require("../assets/icon_checkbox_off_grey_24px.png")} />}
                    />
                  </View>
                  <TouchableOpacity style={{ width: '15%', justifyContent: 'center', display: this.state.appUninstallDesign }} onPress={async () => {
                    var as = await ToastExample.appUnInstaller(item.package);
                    //await alert(as=='true');
                    if (as == 'true')
                      await this.UnInstallApps(item);
                  }} >
                    <Image style={{ height: 30, width: 30 }} source={require("../assets/icon_delete_blue.png")} />
                  </TouchableOpacity>


                </View>
                <View style={{ height: 1, width: "85%", backgroundColor: "#b2babb", justifyContent: 'center' }}>
                </View>
              </View>
            }
          />
        </View>
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
    alignItems: 'center',
    alignContent: 'center',            // Center horizontally
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