import React, { Component } from 'react';
import {
    AsyncStorage,AppState, Animated, WebView, ActivityIndicator,
    Easing, Dimensions,BackHandler,
    Platform, Text, Image, View, StatusBar, ScrollView, StyleSheet, TextInput, ViewPagerAndroid, FlatList, ToastAndroid, TouchableOpacity, ImageBackground, Linking
} from 'react-native';
import device_style from './styles/device.style';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import widgets_style from './styles/widgets_style';
import databasehelper from './utils/databasehelper.js';
import ToastExample from './nativemodules/Toast';
import Swiper from 'react-native-swiper';
import commons from './commons';
import LoaderNew from './utils/LoaderNew';
import Modal from 'react-native-modal';
import SortableList from 'react-native-sortable-list';
import Share, { ShareSheet } from "react-native-share";
import Button from 'react-native-share/components/Button';
import device from './device';
import CheckBox from 'react-native-check-box';
import Touch from 'react-native-touch';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
import settingIcon from './config/assets.js'
var Mixpanel = require('react-native-mixpanel');
var awsData = require("./config/AWSConfig.json");
const window = Dimensions.get('window');
var DeviceInfo = require('react-native-device-info');
var screen = "staxviewer"
export default class widgets extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dialogWidgetRename: false,
            deviceName: "",
            position: 1,
            widgetData: [],
            widgetid: "",
            Swiperbutton: true,
            configStyle: 'flex',
            mostusedId: 0,
            loading: false,
            widgetVisible: false,
            mostFrequentStyle: 'flex',
            dialogWidgetName: false,
            currentWidget: [],
            showOrganiser: false,
            data: {},
            offlineFlag: false,
            order: [],
            needReload: false,
            curindex: 0,
            dialogWidgetDelete: false,
            widgetToDelete: {},
            fullscreen: false,
            showSearchDialogue: false,
            widgetSearchSource: [],
            fullScreenView: [],
            widgetName: '',
            devices: [],
            showDeviceOptions: false,
            choosenDeviceId: "",
            choosenDevice: {},
            replicateModel: false,
            renameModel: false,
            deleteModel: false,
            editingDeviceIndex: "",
            editingDeviceName: "",
            showAddOption: 'flex',
            valid: '#2699FB',
            insertModel: false,
            searchText: "",
            loadVisible: false,
            selectStaxModel: false,
            selectDeviceModel: false,
            staxReplicate: [],
            devicesTempToReplicate: [],
            widgetIndex: 0,
            appsDisplay: true,
            gotoLoginFlow: false,
            feedWebView: '',
            openLink: '',
            feed: '1',
            WebViewHeight: '60%',
            FlatViewHeight: '40%',
            expandFeed: 'flex',
            compressFeed: 'none',
            loadedOnce: false,
            StaxNav: null,
            uri:'',
            appState: AppState.currentState,
            feedUrl:'',
            key: 1
        }
        this.delete_stax = this.delete_stax.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.sharewidget = this.sharewidget.bind(this);
        this.addStax = this.addStax.bind(this)
    }
    resetWebViewToInitialUrl = () => {
        this.setState({
          key: this.state.key + 1,
        });
      };
    componentWillReceiveProps(nextprops) {
    }
    async showdevicemanagment() {
        this.mixpanelTrack("Device");
        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotoLoginFlow: true });
            return;
        }
        this.setState({ showDeviceOptions: true });
    }
/** 
  * (Share stax button click
   >> Calls shareWidget Function)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
    async  sharewidget() {
        this.mixpanelTrack("Share with Friends");
        var connectionStatus = await commons.isconnected();
        if (connectionStatus) {
            var username = await AsyncStorage.getItem("username");
            if (username == null || username == commons.guestuserkey()) {
                this.setState({ gotoLoginFlow: true });
                return;
            }
            if (this.state.widgetid != "") {
                this.shareWidget();
            }
            else {
                ToastAndroid.show(Strings.staxviewer_widget_none, 500);
            }
        }
        else {
            this.setState({ offlineFlag: true });
        }
    }

/** 
  * (Add stax button click
   >> Calls addWidget Function)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :22/09/18
 */

    async addStax(){
        this.resetWebViewToInitialUrl();
        var username = await AsyncStorage.getItem("username");
        if ((username == null || username == commons.guestuserkey()) && this.state.widgetData.length >= 5) {
            this.setState({ gotoLoginFlow: true });
            return;
        }
        this.setState({ dialogWidgetName: true });
        this.mixpanelTrack("Enter Stax Name View");
    }
    /** 
  * (Activate search stax dialogue box )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
    serach_widget() {
        this.setState({ showSearchDialogue: true })
    }
 /** 
  * (Activate share applist dialogue box
    >> Loads the applist and displays )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */   
    async shareApplist() {
        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotoLoginFlow: true });
            return;
        }
        var currentdeviceid = await AsyncStorage.getItem("currentdeviceid");
        if (!this.state.appsDisplay)
            return;
        await this.setState({ appsDisplay: false })
        if (currentdeviceid == null) {
            ToastAndroid.show(Strings.staxviewer_device_none, 3000);
            await this.setState({ appsDisplay: true })
        }
        else {
            var item = {};
            var devices = this.state.devices;
            for (var i = 0; i < devices.length; i++) {
                if (devices[i].id == this.state.choosenDeviceId) {
                    item = devices[i];
                    break;
                }
            }
            const { navigate } = this.props.navigation;
            this.resetWebViewToInitialUrl();
            await navigate("SharedWidgetApplist", user = { item });
            setTimeout(() => { this.setState({ appsDisplay: true }) }, 2000);
        }
    }
 /** 
  * (Sync data to Dynamo DB
   >>updates local DB
   >>Sync data to backend 
   >>Fetches updated dat )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
    async syncdata() {
        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotoLoginFlow: true });
            return;
        }
        var isconnected = await commons.isconnected();
        if (isconnected) {
            try {
                this.refs.loaderRef.show();
                await this.updateLocaldb();
                await this.updateWidgetLocaldb(this.state.choosenDeviceId);
                var result = await commons.syncdatatobackend();
                if (result == "SUCCESS") {
                    ToastAndroid.show(Strings.staxviewer_sync_toast, 500);
                    await this.deviceDisplay();
                     var devicename="";
                     var deviceid="0";
                     for(var i=0;i<this.state.devices.length;i++)
                     {
                         if(this.state.devices[i].id==this.state.choosenDeviceId)
                         {
                           devicename=this.state.devices[i].name;
                           deviceid=this.state.choosenDeviceId;
                         }
                     }
                  await this.widgetDisplay(deviceid);     
                  this.props.setHeader(devicename);
                }
                else {
                    ToastAndroid.show(JSON.stringify(result), 500);
                }
            }
            catch (error) {
                ToastAndroid.show(error, 500);
            }
            finally {
                this.refs.loaderRef.hide();
            }
        }
        else {
            ToastAndroid.show(Strings.network_toast_msg1, 500);
        }
    }
/** 
  * (Replicate widgets of current device
   >> List  widgets)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
    async deviceListToReplicate() {
        var deviceid = this.state.devices[this.state.editingDeviceIndex].id;
        this.setState({ staxReplicate: [] });
        var result = await databasehelper.getAllwidget(deviceid);
        var len = result.dataArray.length;
        var deviceList = [];
        for (var i = 0; i < len; i++) {
            if (result.dataArray[i].mostusedwidget == 0 || result.dataArray[i].mostusedwidget == 4)
                continue;
            var deviceObj = {};
            var dataObj = JSON.parse(JSON.stringify(result.dataArray[i]));
            dataObj["key"] = i + "";
            dataObj["checked"] = false;
            deviceList.push(dataObj);
        }
        await this.setState({ staxReplicate: deviceList });
    }
/** 
  * (Checkbox click of device list dialogue box
   >> remove the device index from list of device)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    onClickDevice(index) {
        var curToRep = this.state.devicesTempToReplicate;
        var status = curToRep[index].checked;
        curToRep[index].checked = !status;
        this.setState({ devicesTempToReplicate: curToRep });
    }
/** 
  * (Checkbox click of replicate stax dialogue box
   >> remove the stax index from list of stax)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    onClick(index) {
        var curToRep = this.state.staxReplicate;
        var status = curToRep[index].checked;
        curToRep[index].checked = !status;
        this.setState({ staxReplicate: curToRep });
    }
 /** 
  * (Updates local DB
   >> Fetch data from backend and update local DB)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */      
    async updateLocaldb() {
        //fetch device data for user
        //get current devices
        //check new devices and new devices to update
        await commons.writelog(screen, "checking device updates start", commons.gettimestamp_log())
        var connectionStatus = await commons.isconnected();
        var username = await AsyncStorage.getItem("username");
        if (connectionStatus && username != commons.guestuserkey()) {
            let dObj = {};
            await commons.writelog(screen, "00_reading_lastup_time_device_sqllite", commons.gettimestamp_log())
            var maxtimeObj = await databasehelper.maxDeviceUpdatetime();
            var maxTime = maxtimeObj.updatetime;
            await commons.writelog(screen, "00_donereading_updatetime_device", commons.gettimestamp_log())
            await commons.writelog(screen, "01_reading currentdevicelist", commons.gettimestamp_log())
            var deviceListObj = await databasehelper.getAlldeviceDeletedAlso()
            await commons.writelog(screen, "01_done_readingcurrentdevicelist", commons.gettimestamp_log())
            await commons.writelog(screen, "02_arranging devicelist base on id", commons.gettimestamp_log())
            if (deviceListObj.dataArray != undefined && deviceListObj.dataArray != 'undefined') {
                var deviceList = deviceListObj.dataArray;
                if (deviceList.length > 0) {
                    for (let i = 0; i < deviceList.length; i++) {
                        var createtime = 0;
                        dObj[deviceList[i]["deviceid"]] = deviceList[i]["createtime"];
                    }
                }
            }
            await commons.writelog(screen, "02_done_devicelist_arrangement", commons.gettimestamp_log())
            //----------------------------------------------------------------------------------------------
            var username = await AsyncStorage.getItem("username");
            await commons.writelog(screen, "03_fetching_updates_device", commons.gettimestamp_log())
            var awsData = require("./config/AWSConfig.json");
            var awsLamda = require("./config/AWSLamdaConfig.json");
            var token = await commons.get_token();
            const resp = await fetch('' + awsData.path + awsData.stage + awsLamda.userdatamgnt, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    "operation": "getUserDeviceList",
                    "TableName": "Users",
                    "username": username,
                    "maxtime": maxTime
                }),
            });
            try {
                responseJson =await resp.json();
                await commons.writelog(screen, "03_got response device", commons.gettimestamp_log())
                var deviceData = responseJson.device;
                var curdevice=await AsyncStorage.getItem("currentdeviceid"); 
                await commons.writelog(screen, "04_reading device response", commons.gettimestamp_log())
                var newdeviceArray = [];
                var updatedeviceArray = [];
                if (deviceData != null && deviceData.length > 0) {
                    for (let i = 0; i < deviceData.length; i++) {
                        var deviceid = deviceData[i].deviceid;
                        var createtime = deviceData[i].createtime;
                        if (dObj.hasOwnProperty(deviceid)) {
                            if (dObj[deviceid] < createtime)
                            {
                               updatedeviceArray.push(deviceData[i])              
                               if(deviceData[i].deleteflag=="1"&&curdevice!=null&&curdevice ==  deviceData[i].deviceid)
                                 await AsyncStorage.removeItem("currentdeviceid"); 
                            }
                        }
                        else {
                            newdeviceArray.push(deviceData[i])
                        }
                    }
                }
                if (newdeviceArray.length > 0 || updatedeviceArray.length > 0)
                    await databasehelper.bulkinsertAndUpdatedevice(newdeviceArray, updatedeviceArray);
                await commons.writelog(screen, "04_done_reading_response_device", commons.gettimestamp_log())
            }
            catch (error) {
            }
        }
    }
/** 
  * (Fetches Device Icon
   >> Based on device type, fetches the icon )
  * @param  :dataObj->object that holds device data     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */ 
    getDeviceIcon(dataObj) {
        if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Google") {
            if (this.state.choosenDeviceId == dataObj.id)
                return assetsConfig.iconTabletAndroidBlue36px;
            else
                return assetsConfig.iconTabletAndroidGrey36px;
        } else if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Apple") {
            if (this.state.choosenDeviceId == dataObj.id)
                return assetsConfig.iconIpadBlue36px;
            else
                return assetsConfig.iconIpadBlue36px;
        } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Google") {
            if (this.state.choosenDeviceId == dataObj.id)
                return assetsConfig.iconPhoneAndroidBlue30px;
            else
                return assetsConfig.iconPhoneAndroidGrey30px;
        } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Apple") {
            if (this.state.choosenDeviceId == dataObj.id)
                return assetsConfig.iconIphoneBlue30px;
            else
                return assetsConfig.iconIphoneGrey30px;
        } else {
            if (this.state.choosenDeviceId == dataObj.id)
                return assetsConfig.iconPhoneAndroidBlue30px;
            else
                return assetsConfig.iconPhoneAndroidGrey30px;
        }
    }
  /** 
(Loads all device(current and remote) data from local db to front )
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async deviceDisplay() {
        await commons.writelog(screen, "05_rendering_device_reading_sqllite", commons.gettimestamp_log())
        var result = await databasehelper.getAlldevice();
        await commons.writelog(screen, "05_donereading_devices_sqllite", commons.gettimestamp_log())
        var devicehardid = DeviceInfo.getUniqueID();
        var currdeviceid = await AsyncStorage.getItem("currentdeviceid");
        var len = result.dataArray.length;
        var device_list = [];
        await commons.writelog(screen, "06_start_device_rendering", commons.gettimestamp_log())
        if (currdeviceid == null) {
            var m = {};
            m["add_device"] = true;
            m["deleted"] = false;
            m["name"] = "This Device";
            m["model"] = DeviceInfo.getBrand() + " " + DeviceInfo.getModel();;
            m["id"] = "tempid_111";
            m["key"] = "tempid_111";
            m["hardid"] = "";
            m["currentdevice"] = 'flex';
            m["fontcolor"] = "#2699FB";
            m["android"] = 'none';
            m["ios"] = 'none';
            m["device_type"] = DeviceInfo.isTablet();
            var platform = DeviceInfo.getManufacturer();
            m["device_platform"] = platform;
            if (platform == "Google")
                m["android"] = 'flex';
            else if (platform == "Apple")
                m["ios"] = 'flex';
            else
                m["android"] = 'flex';
            device_list.push(m);
            if (this.state.choosenDeviceId == "")
                await this.setState({ choosenDeviceId: m.id, choosenDevice: m });
        }
        if (len > 0)
            for (var i = 0; i < len; i++) {
                var deviceObj = {};
                var dataObj = result.dataArray[i];
                deviceObj["add_device"] = false;
                deviceObj["deleted"] = false;
                deviceObj["name"] = dataObj.devicename;
                deviceObj["model"] = dataObj.devicemodel;
                deviceObj["id"] = dataObj.deviceid;
                deviceObj["key"] = dataObj.deviceid;
                deviceObj["hardid"] = dataObj.devicehardid;
                deviceObj["currentdevice"] = 'none';
                deviceObj["fontcolor"] = "#757575";
                deviceObj["device_type"] = dataObj.device_type;
                deviceObj["device_platform"] = dataObj.device_platform;
                if (dataObj.device_platform == "Google") {
                    deviceObj["android"] = 'flex';
                    deviceObj["ios"] = 'none';
                } else if (dataObj.device_platform == "Apple") {
                    deviceObj["android"] = 'none';
                    deviceObj["ios"] = 'flex';
                } else {
                    deviceObj["android"] = 'flex';
                    deviceObj["ios"] = 'none';
                }
                if ((dataObj.devicehardid) == devicehardid) {
                    deviceObj["currentdevice"] = 'flex';
                    if (this.state.choosenDeviceId == "") {
                        await this.setState({ choosenDeviceId: dataObj.deviceid, choosenDevice: dataObj });
                        //  this.props.navigation.setParams({ devicename: dataObj.devicename });
                        this.props.setHeader(dataObj.devicename)
                    }
                }
                if (this.state.choosenDeviceId == deviceObj.id)
                    deviceObj.fontcolor = "#2699FB";
                device_list.push(deviceObj);
            }
        device_list.sort(function (a, b) {
            var prop = "currentdevice";
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        })
        var deviceobj = this.state.choosenDevice;
        if (deviceobj.hasOwnProperty("name")) {
            this.props.setHeader(deviceobj.name)
        }
        else if (deviceobj.hasOwnProperty("devicename")) {
            this.props.setHeader(deviceobj.devicename)
        }
        await this.setState({ devices: device_list });
        await commons.writelog(screen, "06_device_rendering_completed", commons.gettimestamp_log())
    }
/** 
  * (Share stax through social media
   >> Fetch the data and share through link )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */
    async shareWidget() {
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
        var date = commons.gettimestamp();
        var uuid = await commons.getuuid()
        var username = await AsyncStorage.getItem("username");
        var tranid = await commons.getuuid();
        var payload = {};
        var widgetData = await databasehelper.getAllwidgetShare("'" + this.state.widgetid + "'");
        widgetArray = widgetData.dataArray;
        if (widgetArray.length>0&&commons.isimagevalid(widgetArray[0]))
        {
            var staxobj=widgetArray[0];
            var fileid=staxobj.fileid;       
            var isfileuploaded=await databasehelper.is_file_uploaded(fileid)
            if(isfileuploaded=="0")
            {
              var res= await commons.upload_file_toS3(fileid,".jpg");  
              if(res)
               await databasehelper.update_filesync_status(fileid);
            }
        }
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
        var awsData = require("./config/AWSConfig.json");
        var awsLamda = require("./config/AWSLamdaConfig.json");
        var token = await commons.get_token();
        await fetch('' + awsData.path + awsData.stage + awsLamda.sharingfunction, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(req_obj),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                this.refs.loaderRef.hide();
                var options = shareOptions = {
                    title: Strings.share_title,
                    message: Strings.share_message_line1+"\n\n"+firstname +" "+lastname+ Strings.share_message_line2 + widgetArray[0].widgetname+Strings.share_messageline3+"\n\n"+ Strings.share_message_line4 +uuid+"\n\n"+Strings.share_installation_link+"\n\n"+ Strings.share_message_line5,
                    url: Strings.url,
                    subject: firstname + " " + lastname+ Strings.share_mail_subject //  for email
                };
                Share.open(options);
            })
            .catch((error) => {
                this.refs.loaderRef.hide();
                console.error(error);
            });
    }
/** 
  * (Search Stax
   >> Search the stax name with entered name )
  * @param  :event(search Text)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     

    search(event) {
        this.mixpanelTrack("Search Stax");
        var searchText = event;
        var data = this.state.widgetSearchSource;
        searchText = searchText.trim().toLowerCase();
        data = data.filter(l => {
            if (l.widgetname.toLowerCase().match(searchText))
                l["render"] = true;
            else
                l["render"] = false
            return true;
        });
        this.setState({
            widgetSearchSource: data,
            searchText: event
        });
    }
/** 
  * (Go to the selected stax from searched stax list
   >> Displays the stax with corresponding index )
  * @param  :dataObj->object that holds device data     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     
    serachWidgetGotoIndex(tg_index) {
        this.mixpanelTrack("Stax Selected");
        var curr_index = this.state.curindex;
        var curwidgetlist = this.state.widgetSearchSource;
        for (var i = 0; i < curwidgetlist.length; i++)
            curwidgetlist[i].render = true;
        this.setState({ showSearchDialogue: false, widgetSearchSource: curwidgetlist, searchText: "" })
        this.refs.slidermain.scrollBy(tg_index - curr_index);
    }
    async scrollto(tg_index,feed,openLink) {
        var curr_index = this.state.curindex;
        this.refs.slidermain.scrollBy(tg_index - curr_index);
        try{
            if(feed!=undefined)
            {
                await this.setState({feed:feed});
            }
            if(openLink!=undefined)
            {
                await this.setState({openLink:openLink});
            }
        }catch(err)
        {
        }
    }
  
    componentWillMount()
    {
    AppState.addEventListener('change', () => this._handleAppStateChange());
    }
    webView = {
        canGoBack: false,
        ref: null,
      }
      async webViewGoBackRecursion()
      {
        if(this.state.feedUrl==this.state.openLink)
        {
                return true;
        }else{
            if (this.webView.canGoBack && this.webView)
            {
            this.webView.goBack();
            await this.webViewGoBackRecursion();
            }
        }
      }
/** 
  * (Handles back button
   >> reset web views  )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */        
      async handleBackButtonClick() 
      {
          if (this.webView.canGoBack && this.webView) {
              if(this.state.feedUrl==this.state.openLink)
              {
                this.props.handleBackButtonClick("Stax");
                await this.resetWebViewToInitialUrl();
                return true;
              }else{
              await this.resetWebViewToInitialUrl();
              return true;
              }
            }else{
                this.resetWebViewToInitialUrl();
                this.props.handleBackButtonClick("Stax");
                return true;
            } 
      }
    componentWillUnmount()
    {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
      AppState.removeEventListener('change', () => this._handleAppStateChange());
    }
    _handleAppStateChange() {
      const {
        appState
      } = this.state;
      switch (appState) {
        case 'active': //The app is running in the foreground
         this.listAllApps();
        break;
        default:
      }
    }
    async  componentDidMount() {
        this.mixpanelTrack("Stax Viewer");//calls mixpanel event
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({ loadedOnce: true });
        await commons.writelog(screen, "start", commons.gettimestamp_log());
        this.refs.loaderRef.show();//Activates loader
        try {
            var deviceid = await AsyncStorage.getItem("currentdeviceid");
            await this.deviceDisplay();
            if (deviceid != null) {
                this.updateWidgetLocaldb(deviceid);
                await this.widgetDisplay(deviceid);
                await this.MostFrequentWidgetFinder(deviceid, true);
                //ask permission if user denied
                const mostusedwidget_id = await AsyncStorage.getItem("mostusedwidgetid");
                var hasstatspermission = await ToastExample.checkappusagepermission();
                if (mostusedwidget_id != null && !hasstatspermission) {
                }
            }
            else {
                this.setState({ showAddOption: 'none', configStyle: 'none' });
            }
        }
        catch (error) {
        }
        finally {
            this.refs.loaderRef.hide();
            await commons.writelog(screen, "end", commons.gettimestamp_log())
        }
    }
/** 
  * (Gets all apps in current device
   >> List all apps  )
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
                  await this.updateAppICons();             
                });
            }
/** 
  * (Gets app icon
   >> Update app icon  )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */             
            async updateAppICons() {
                var MainAppADataOb=this.state.widgetData;
                var applist_obj = global.applist;
                for (var i= 0; i < MainAppADataOb.length; i++) {
                    var subDataob=MainAppADataOb[i];
                    for (var j= 0; j < subDataob.applist.length; j++) 
                    {
                        if (applist_obj.hasOwnProperty(subDataob.applist[j].package))
                        {
                            MainAppADataOb[i].applist[j]["appname"] = applist_obj[subDataob.applist[j].package].applabel;
                            MainAppADataOb[i].applist[j]["icon"] = applist_obj[subDataob.applist[j].package].icon;
                        }
                       else
                        {
                          MainAppADataOb[i].applist[j]["icon"] = commons.getIconUnavailable();  //dataobj.applist[j]["icon"]="data:image/png;base64,"
                         }
                         MainAppADataOb[i].applist[j]["key"] = j + "";
                    }
                    this.setState({widgetData:MainAppADataOb});
                }    
            }
    async Repeat_ComponentDidMount(params) {
        if (params != undefined)
            await this.setState({ StaxNav: params });
        var deviceid_temp = this.state.choosenDeviceId;
        if (deviceid_temp == null || deviceid_temp == "")
            deviceid_temp = "0"
        var newwidgets = await databasehelper.getwidget_count_in_device(deviceid_temp);;
        var newsize = newwidgets.count;
        hasnewdata = newsize - this.state.widgetData.length == 0 ? false : true;
        if (this.state.loadedOnce && !hasnewdata) {
            this.updateLocaldb();
            this.deviceDisplay();
            return;
        }
        this.refs.loaderRef.show();
        try {
            var deviceid = await AsyncStorage.getItem("currentdeviceid");
            this.updateLocaldb();
            await this.deviceDisplay();
            if (deviceid != null) {
                this.updateWidgetLocaldb(deviceid);
                await this.widgetDisplay(deviceid);
                await this.MostFrequentWidgetFinder(deviceid, true);
                //ask permission if user denied
                const mostusedwidget_id = await AsyncStorage.getItem("mostusedwidgetid");
                var hasstatspermission = await ToastExample.checkappusagepermission();
                if (mostusedwidget_id != null && !hasstatspermission) {
                }
                this.setState({ showAddOption: 'flex', selectStaxModel: false, selectDeviceModel: false });
            }
            else {
                this.setState({ showAddOption: 'none', configStyle: 'none' });
            }
        }
        catch (error) {
        }
        finally {
            this.refs.loaderRef.hide();
        }
    }
  /** 
  * (List all staxes in dialogue box  )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */   
    OrganizeStax() {
        this.mixpanelTrack("Stax Organizer");
        this.setState({ showOrganiser: true });
    }
/** 
  * (Launches the app
  * =>Calls native function for lanuch that  )
  * @param  :packagename     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */ 
    luanchapp(packagename) {
        ToastExample.launchapp(packagename);
    }
    _dialog_box() {
        console.log("successfully");
    }
    onscroll() {
    }
  /** 
  * (Opens the popup for delete confirmation)
  * @param  :item     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */  
    async delete_stax(item) {
        if (item.mostusedwidget == "0") {
            ToastAndroid.show(Strings.staxviewer_toast_mostfrequentdelete, 3000);
        }
        else if (item.mostusedwidget == "4") {
            ToastAndroid.show(Strings.staxviewer_toast_smartdelete, 3000);
        }
        else {
            await this.setState({ dialogWidgetDelete: true, widgetToDelete: item })
        }
    }
    /** 
  * (Deletes Stax)
  * @param  :packagename     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */ 
    async deleteStaxExecute(item) {
        this.mixpanelTrack("Stax Deleted :"+item.staxname);
        var sorkey_todelete = item.sorcekey;
        var currorder = this.state.order;
        var neworder = [];
        var MFW = await AsyncStorage.getItem("mostusedwidgetid");
        if (MFW == item.staxid) {
            await AsyncStorage.removeItem("mostusedwidgetid");
            this.setState({ mostFrequentStyle: 'flex' });
        }
        var smartstaxid = await AsyncStorage.getItem("smartstaxid");
        if (smartstaxid == item.staxid) {
            await AsyncStorage.removeItem("smartstaxid");
        }
        var result = await databasehelper.updatewidget_delete(item.staxid, commons.gettimestamp());
        this.mixpanelTrack("Stax Deleted");
        var indextoremove = 0;
        for (var i = 0; i < currorder.length; i++) {
            if (currorder[i] != sorkey_todelete) {
                neworder.push(currorder[i]);
            }
        }
        if (this.state.widgetData.length == 0) {
            this.setState({ configStyle: 'none', mostFrequentStyle: 'flex' });
        }
        else {
            this.setState({ configStyle: 'flex' });
        }
        await this.setState({ order: neworder, needReload: true, dialogWidgetDelete: false });
    }
   /** 
  * (Deletes Device)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */  
    async  deleteDevice() {
        this.mixpanelTrack("Device Deleted");
        this.refs.loaderRef.show();
        var time = commons.gettimestamp();
        var currdevices = this.state.devices;
        var editing_index = this.state.editingDeviceIndex;
        var result = await databasehelper.deletedevice(currdevices[editing_index].id, time);
        var dvceTyp=currdevices[editing_index].device_type;
        if(dvceTyp=="false")
        {
            this.mixpanelTrack("Device Deleted : Mobile");
        }
        else
        {
            this.mixpanelTrack("Device Deleted : Tablet");
        }
        var choosendevice = this.state.choosenDeviceId;
        var curdeviceorginalid = "";
        if (currdevices[editing_index].currentdevice == "flex") {
            await AsyncStorage.removeItem("currentdeviceid");
            await AsyncStorage.removeItem("smartstaxid");
            currdevices[editing_index].add_device = true;
            currdevices[editing_index].name = "This Device";
            curdeviceorginalid = currdevices[editing_index].id;
            currdevices[editing_index].id = "tempid_111";
        }
        else {
            currdevices[editing_index].deleted = true;
        }
        if (choosendevice == currdevices[editing_index].id || curdeviceorginalid != "" && choosendevice == curdeviceorginalid) {
            var currdeviceid = "";
            var name = ""
            var device = {}
            is_curdevice_temp = false;
            for (var i = 0; i < currdevices.length; i++) {
                if (currdevices[i].currentdevice == "flex") {
                    currdeviceid = currdevices[i].id;
                    name = currdevices[i].name;
                    currdevices[i].fontcolor = "#2699FB";
                    device = currdevices[i];
                    is_curdevice_temp = currdevices[i].add_device;
                    break;
                }
            }
            if (is_curdevice_temp)
                this.setState({ showAddOption: 'none' });
            else
                this.setState({ showAddOption: 'flex' });
            await this.setState({ choosenDeviceId: currdeviceid, choosenDevice: device });
            await this.updateWidgetLocaldb(currdeviceid);
            await this.widgetDisplay(currdeviceid);
            this.props.setHeader(name);
        }
        this.setState({ devices: currdevices, loadVisible: false, deleteModel: false });
        this.refs.loaderRef.hide();
    }
 /** 
  * (Inserts Device)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    async deviceInsert() {
        var curr_index = this.state.editingDeviceIndex;
        var curr_devices = this.state.devices;
        var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
        if (!enabled_app_usage_permission) {
            ToastExample.askpermission();
            return;
        }
        else {
            var devicehardid = DeviceInfo.getUniqueID();
            var model = DeviceInfo.getBrand() + " " + DeviceInfo.getModel();
            var istab = await DeviceInfo.isTablet();
            var manufacturer = await DeviceInfo.getManufacturer();
            var device = this.state.deviceName;
            if (device.length <= 15 && device.length > 0) {
                this.refs.loaderRef.show();
                var device_id = await commons.getuuid();
                var time = commons.gettimestamp();
                var res = await databasehelper.insertdevice(device, device_id, time, devicehardid, model, istab, manufacturer);
                await AsyncStorage.setItem("currentdeviceid", device_id);
                await this.setState({ choosenDeviceId: device_id });
                var currdeviceobj = {};
                currdeviceobj["deleted"] = false;
                currdeviceobj["name"] = device;
                currdeviceobj["model"] = model;
                currdeviceobj["id"] = device_id;
                currdeviceobj["hardid"] = devicehardid;
                currdeviceobj["currentdevice"] = 'flex';
                currdeviceobj["device_type"] = istab;
                currdeviceobj["device_platform"] = manufacturer;
                //console.log(manufacturer + "\n" + istab);
                currdeviceobj["tab_android"] = 'none';
                currdeviceobj["tab_ios"] = 'none';
                currdeviceobj["phone_android"] = 'none';
                currdeviceobj["phone_ios"] = 'none';
                currdeviceobj["android"] = 'none';
                currdeviceobj["ios"] = 'none';
                if (manufacturer == "Google") {
                    currdeviceobj["android"] = 'flex';
                } else if (manufacturer == "Apple") {
                    currdeviceobj["ios"] = 'flex';
                }
                if ((istab == true || istab == "true") && manufacturer == "Google") {
                    currdeviceobj["tab_android"] = 'flex';
                } else if ((istab == true || istab == "true") && manufacturer == "Apple") {
                    currdeviceobj["tab_ios"] = 'flex';
                } else if ((istab == false || istab == "false") && manufacturer == "Google") {
                    currdeviceobj["phone_android"] = 'flex';
                } else if ((istab == false || istab == "false") && manufacturer == "Apple") {
                    currdeviceobj["phone_ios"] = 'flex';
                }
                currdeviceobj["fontcolor"] = "#2699FB";
                currdeviceobj["add_device"] = false;
                currdeviceobj["key"] = device_id;
                curr_devices[curr_index] = currdeviceobj;
                await this.MostFrequentWidget();
                await this.widgetDisplay(device_id);
                await this.MostFrequentWidgetFinder(device_id, true);
                //this.props.navigation.setParams({ devicename: device });
                this.props.setHeader(device);
                this.setState({ devices: curr_devices, choosenDevice: currdeviceobj, insertModel: false, valid: "#2699FB", deviceName: "", loadVisible: false });
                this.refs.loaderRef.hide();
            } else {
                this.setState({ valid: 'red' });
                this.refs.loaderRef.hide();
            }
        }
    }
    /** 
  * (Renames Device)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */ 
    async  Renamedevice() {
        this.mixpanelTrack("Device Renamed");
        var curr_devicedata = this.state.devices;
        var choosenDeviceId = this.state.choosenDeviceId;
        if (this.state.deviceName.length <= 15) {
            var time = commons.gettimestamp();
            var result = await databasehelper.updatedevice(this.state.deviceName, curr_devicedata[this.state.editingDeviceIndex].id, time);
            curr_devicedata[this.state.editingDeviceIndex].name = this.state.deviceName;
            var dvceTyp=curr_devicedata[this.state.editingDeviceIndex].device_type;
            if(dvceTyp=="false")
             {
                this.mixpanelTrack("Device Renamed : Mobile");
             }
            else
             {
                this.mixpanelTrack("Device Renamed : Tablet");
             }
            if (choosenDeviceId == curr_devicedata[this.state.editingDeviceIndex].id) {
                this.props.setHeader(this.state.deviceName)
            }
            await this.setState({ devices: curr_devicedata });
            await this.setState({ valid: '#2699FB', deviceName: "", renameModel: false })
        }
        else {
            this.setState({ valid: 'red' });
        }
    }
 /** 
  * (share with other device)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */    
    async replicateDevice() {
        this.mixpanelTrack("Share with Other Devices");
        this.refs.loaderRef.show();
        var stax_selected = [];
        // reading all selected stax
        for (var i = 0; i < this.state.staxReplicate.length; i++) {
            if (this.state.staxReplicate[i].checked)
                stax_selected.push(this.state.staxReplicate[i]);
        }
        // reading selected devices
        var devices_selected = [];
        for (var i = 0; i < this.state.devicesTempToReplicate.length; i++) {
            if (this.state.devicesTempToReplicate[i].checked)
                devices_selected.push(this.state.devicesTempToReplicate[i]);
        }
        var widgets_to_insert = [];
        var m=[];
        for (var i = 0; i < devices_selected.length; i++) {
            for (var j = 0; j < stax_selected.length; j++) {
                var cur_device = devices_selected[i];
                var cur_stax = JSON.parse(JSON.stringify(stax_selected[j]));
                let createtime = commons.gettimestamp();
                let guid = await commons.getuuid();
                let deviceid = cur_device.id;
                cur_stax.widgetid = guid;
                cur_stax.deviceid = deviceid;
                cur_stax.createtime = createtime;
                cur_stax.deleteflag = 0;
                if (cur_stax.mostusedwidget != 2)
                    cur_stax.mostusedwidget = 3;
                widgets_to_insert.push(cur_stax);
            }
        }
        var result = await databasehelper.shareinsertwidget(widgets_to_insert);
        this.refs.loaderRef.hide();
        this.setState({ selectDeviceModel: false });
        this.Repeat_ComponentDidMount();
    }
            /** 
(fetch widget data for user
 *get current widget
 *check new widget and new widget to update)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async updateWidgetLocaldb(deviceid) {
        await commons.writelog(screen, "update_check_stax", commons.gettimestamp_log())
        var connectionStatus = await commons.isconnected();
        var username = await AsyncStorage.getItem("username");
        if (connectionStatus && username != commons.guestuserkey()) {
            await commons.writelog(screen, "07_reading_stax_last_update_fromsqllite", commons.gettimestamp_log())
            let dObj = {};
            var maxtimeObj = await databasehelper.maxwidgetUpdatetime(deviceid);
            var maxTime = maxtimeObj.updatetime;
            if(maxTime==null)
                maxTime="0";
            var widgetListObj = await databasehelper.getAllwidgetDeletedAlso(deviceid);
            await commons.writelog(screen, "07_done_reading", commons.gettimestamp_log())
            if (widgetListObj.dataArray != undefined && widgetListObj.dataArray != 'undefined') {
                var widgetList = widgetListObj.dataArray;
                if (widgetList.length > 0) {
                    for (let i = 0; i < widgetList.length; i++) {
                        var createtime = 0;
                        dObj[widgetList[i]["widgetid"]] = widgetList[i]["createtime"];
                    }
                }
            }
            //------------------------------------------------------------------------------------------------
            var username = await AsyncStorage.getItem("username");
            await commons.writelog(screen, "08_fetching updates stax", commons.gettimestamp_log())
            var token = await commons.get_token();
            var awsData = require("./config/AWSConfig.json");
            const resp= await fetch('' + awsData.path + awsData.stage + 'userdatamgnt', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    "operation": "getUserWidgetList",
                    "TableName": "Users",
                    "username": username,
                    "maxtime": maxTime,
                    "deviceid": deviceid
                }),
            });
                   try
                   {
                    const responseJson=await resp.json();
                    await commons.writelog(screen, "08_recieved stax update response", commons.gettimestamp_log())
                    var widgetData = responseJson.widgets;
                    await commons.writelog(screen, "09_reading stax update response", commons.gettimestamp_log())
                    var newwidgetArray = [];
                    var updatewidgetArray = [];
                    if (widgetData != null && widgetData.length > 0) {
                        for (var i = 0; i < widgetData.length; i++) {
                            var widgetid = widgetData[i].widgetid;
                            var createtime = widgetData[i].createtime;
                            if (dObj.hasOwnProperty(widgetid)) {
                                if (parseInt(dObj[widgetid]) < parseInt(createtime))
                                    updatewidgetArray.push(widgetData[i])
                            }
                            else {
                                newwidgetArray.push(widgetData[i])
                            }
                        }
                    }
                    if (newwidgetArray.length > 0 || updatewidgetArray.length > 0) {
                      var res= await databasehelper.bulkinsertAndUpdatewidget(newwidgetArray, updatewidgetArray);
                       //download images for current device and delete images for remote device
                        var currentdeviceid = await AsyncStorage.getItem("currentdeviceid");;
                        var down_deletefiles = [];
                        for (var i = 0; i < newwidgetArray.length; i++) {
                            var dataobj = {}
                            dataobj["fileid"] = newwidgetArray[i].fileid;
                            if (currentdeviceid != null && newwidgetArray[i].deviceid == currentdeviceid)
                                dataobj["curdevice"] = true;
                            else
                                dataobj["curdevice"] = false;
                            down_deletefiles.push(dataobj);
                        }
                        for (var i = 0; i < updatewidgetArray.length; i++) {
                            var dataobj = {}
                            dataobj["fileid"] = updatewidgetArray[i].fileid;
                            if (currentdeviceid != null && updatewidgetArray[i].deviceid == currentdeviceid)
                                dataobj["curdevice"] = true;
                            else
                                dataobj["curdevice"] = false;
                            down_deletefiles.push(dataobj);
                        }
                        for (var i = 0; i < down_deletefiles.length; i++) {
                            if (down_deletefiles[i].curdevice) {
                                //downloadfile
                                commons.download_file_tocache(down_deletefiles[i].fileid, '.jpg');
                            }
                            else {
                                await commons.deletefile(down_deletefiles[i].fileid, '.jpg');
                            }
                        }
                    }
                    await commons.writelog(screen, "09_done reading stax updates", commons.gettimestamp_log())
                }
                catch(error)
                {
                }
            //----------------------------------------------------------------------------------------------
        }
    }
           /** 
(widget app details fetch for display)
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async widgetDisplay(id) {
        await commons.writelog(screen, "10_start reading apps", commons.gettimestamp_log())
        var dow_widget_id = this.props.navigation.state.params.widget_id1;
        if (dow_widget_id == undefined && this.state.StaxNav != null) {
            dow_widget_id = this.state.StaxNav;
        }
        if (global.applist == null || global.applist == undefined || Object.keys(global.applist).length == 0) {
            var appiconmapping = await AsyncStorage.getItem("appdata");
            if (appiconmapping != null) {
                var mapping_data = JSON.parse(appiconmapping);
                global.applist = mapping_data;
            }
        }
        var applist_obj = global.applist;
        await commons.writelog(screen, "10_app reading completed", commons.gettimestamp_log())
        await commons.writelog(screen, "11_reading_appdata", commons.gettimestamp_log())
        //for arranging widget list
        var widget_data_source = {};
        var widget_display_order = [];
        var widget_search = [];
        await commons.writelog(screen, "11_done_reading_appdata", commons.gettimestamp_log())
        await commons.writelog(screen, "12_reading_stax_data_from_local", commons.gettimestamp_log())
        var result = await databasehelper.getAllwidget(id);
        var resultArray = result.dataArray
        await commons.writelog(screen, "12_done_reading_stax_data_from_local", commons.gettimestamp_log())
        await commons.writelog(screen, "13_formating_stax_data", commons.gettimestamp_log())
        let len = result.dataArray.length;
        if (len > 0)
            await this.setState({ curindex: 0, widgetid: resultArray[0].widgetid, widgetName: resultArray[0].widgetname, configStyle: 'flex' });
        else {
            await this.setState({ Swiperbutton: false, configStyle: 'none' });
        }
        var dataloop2 = [];
        var d_index = 0;
        for (var i = 0; i < len; i++) {
            if (result.dataArray[i].widgetid == dow_widget_id) {
                d_index = i;
                dow_widget_id = '';
            }
            var dataobj = result.dataArray[i];
            if (dataobj.mostusedwidget == 0)
                this.setState({ mostusedId: dataobj.widgetid });
            try {
                dataobj["feedView"] = '';
                if (dataobj.feed != null) {
                    var dataobjCpy = dataobj.feed;
                    if (dataobjCpy != undefined && dataobjCpy != 'undefined' && dataobjCpy.length > 0) {
                        dataobj["WebView"] = 'flex';
                        dataobj["WebViewHeight"] = '50%';
                        var feedsList = dataobj.feed;
                        dataobj["facebookView"] = 'none';
                        dataobj["instagramView"] = 'none';
                        dataobj["twitterView"] = 'none';
                        dataobj["youtubeView"] = 'none';
                        dataobj["pinterestView"] = 'none';
                        dataobj["donateView"] = 'none';
                        dataobj["websiteView"] = 'none';
                        dataobj["feedView"] = '';
                        for (var k = 0; k < feedsList.length; k++) {
                            if (feedsList[k].FeedsName == "facebook") {
                                dataobj["facebook"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["facebookFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["facebookLink"] =feedsList[k].Link;
                                dataobj["facebookView"] = 'flex';
                                dataobj["feedView"] = dataobj["facebook"];
                            }
                                if(feedsList[k].FeedsName=="instagram"){
                                    dataobj["instagram"]=commons.getHTML(feedsList[k].Link,feedsList[k].FeedsName);
                                    dataobj["instagramFull"]=commons.getFullHTML(feedsList[k].Link,feedsList[k].FeedsName);
                                    dataobj["instagramLink"]=feedsList[k].Link;
                                    dataobj["instagramView"]='flex';
                                } 
                            if (feedsList[k].FeedsName == "twitter") {
                                dataobj["twitter"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["twitterFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["twitterLink"] = feedsList[k].Link;
                                dataobj["twitterView"] = 'flex';
                            }
                            if (feedsList[k].FeedsName == "youtube") {
                                dataobj["youtube"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["youtubeFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["youtubeLink"] = "https://www.youtube.com/embed/+lastest?list="+feedsList[k].Link;
                                dataobj["youtubeView"] = 'flex';
                            }
                            if (feedsList[k].FeedsName == "pinterest") {
                                dataobj["pinterest"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["pinterest"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["pinterestLink"] = feedsList[k].Link;
                                dataobj["pinterestView"] = 'flex';
                            }
                            if (feedsList[k].FeedsName == "donate") {
                                dataobj["donate"] =commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["donateFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["donateLink"] = feedsList[k].Link;
                                dataobj["donateView"] = 'flex';
                            }
                            if (feedsList[k].FeedsName == "website") {
                                dataobj["website"] =commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["websiteFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["websiteLink"] = feedsList[k].Link;
                                dataobj["websiteView"] = 'flex';
                            }
                        }
                    }
                    else {
                        dataobj["WebView"] = 'none';
                    }
                }
                else {
                    dataobj["WebView"] = 'none';
                }
            } catch (error) {
            }
            let w_alen = (dataobj.applist).length;
            for (var j = 0; j < w_alen; j++) {
                if (applist_obj.hasOwnProperty(dataobj.applist[j].package))
                {
                    dataobj.applist[j]["icon"] = applist_obj[dataobj.applist[j].package].icon;
                    dataobj.applist[j]["appname"] = applist_obj[dataobj.applist[j].package].applabel;
                }
                else
                    dataobj.applist[j]["icon"] = commons.getIconUnavailable();  //dataobj.applist[j]["icon"]="data:image/png;base64,"
                dataobj.applist[j]["key"] = j + "";
            }
            if (!dataobj.hasOwnProperty("headercolor") || dataobj["headercolor"] == null || dataobj["headercolor"] == "" || dataobj["headercolor"] == "undefined" || dataobj["headercolor"] == "null")
                dataobj.headercolor = "#006BBD";
            if (!dataobj.hasOwnProperty("backgroundcolor") || dataobj["backgroundcolor"] == null || dataobj["backgroundcolor"] == "" || dataobj["backgroundcolor"] == "undefined" || dataobj["backgroundcolor"] == "null")
                dataobj.backgroundcolor = "#ffffff";
            if (!dataobj.hasOwnProperty("transperancy") || dataobj["transperancy"] == null || dataobj["transperancy"] == "" || dataobj["transperancy"] == "undefined" || dataobj["transperancy"] == "null")
                dataobj.transperancy = "0";
            if (commons.isimagevalid(dataobj)) {
                var uri = await commons.getfile_uri(dataobj.fileid, '.jpg');
                dataobj.backgroundpicture = uri;  
            }
            else {
                dataobj.backgroundpicture = 'data:image/png;base64';
            }               
            if (!dataobj.hasOwnProperty("fontcolor") || dataobj["fontcolor"] == null || dataobj["fontcolor"] == "" || dataobj["fontcolor"] == "undefined" || dataobj["fontcolor"] == "null")
                dataobj.fontcolor = "black";
            dataloop2.push(dataobj);
            widget_data_source[i] = {};
            widget_data_source[i]["staxid"] = dataobj.widgetid;
            widget_data_source[i]["staxname"] = dataobj.widgetname;
            widget_data_source[i]["sorcekey"] = i;
            widget_data_source[i]["mostusedwidget"] = dataobj.mostusedwidget;
            var widget_obj = {};
            widget_obj["widgetname"] = dataobj.widgetname;
            widget_obj["index"] = i;
            widget_obj["key"] = i;
            widget_obj["render"] = true;
            widget_search.push(widget_obj);
            widget_display_order.push(i);
        }
                    try{
                    if (result.dataArray[0].website != undefined)
                    {
                       await this.setState({ openLink: result.dataArray[0].facebookLink, feed: result.dataArray[0].facebookLink });
                    }else if (result.dataArray[0].donate != undefined)
                    {
                       await this.setState({ openLink: result.dataArray[0].donateLink, feed: result.dataArray[0].donateLink });
                    }else if (result.dataArray[0].instagram != undefined)
                    {
                        await this.setState({ openLink: result.dataArray[0].instagramLink, feed: result.dataArray[0].instagramLink });
                    }else if (result.dataArray[0].pinterest != undefined)
                    {
                        await this.setState({ openLink: result.dataArray[0].pinterestLink, feed: result.dataArray[0].pinterestLink });
                    }else if (result.dataArray[0].twitter != undefined)
                    {
                        await this.setState({ openLink: result.dataArray[0].twitterLink, feed: result.dataArray[0].twitterLink });
                    }else if (result.dataArray[0].facebook != undefined)
                    {
                        await this.setState({ openLink: result.dataArray[0].facebookLink, feed: result.dataArray[0].facebookLink });
                    }
                }catch(err)
                {
                }
        await commons.writelog(screen, "13_done_formated_stax_data", commons.gettimestamp_log())
        await commons.writelog(screen, "14_rendering_stax_", commons.gettimestamp_log())
        await this.setState({ widgetData: [] });
        if (dataloop2.length > 0)
            await this.setState({ widgetIndex: d_index });
        await this.setState({ widgetData: dataloop2, data: widget_data_source, order: widget_display_order, widgetSearchSource: widget_search });
        await commons.writelog(screen, "14_rendering_stax_completed", commons.gettimestamp_log())
        if (dataloop2.length > 0)
            this.indexChange(d_index);
    }
     /** 
(Move to other widget based on the index)
@param  :index     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async indexChange(index) {
        this.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' })
      
                    if (this.state.widgetData[index].website != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].websiteLink, feed: this.state.widgetData[index].websiteLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].donate != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].donateLink, feed: this.state.widgetData[index].donateLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].instagram != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].instagramLink, feed: this.state.widgetData[index].instagramLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].pinterest != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].pinterestLink, feed: this.state.widgetData[index].pinterestLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].twitter != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].twitterLink, feed: this.state.widgetData[index].twitterLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].facebook != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].facebookLink, feed: this.state.widgetData[index].facebookLink });
                        this.resetWebViewToInitialUrl();
                    }
        this.setState({ widgetid: this.state.widgetData[index].widgetid, currentWidget: this.state.widgetData[index], curindex: index, widgetName: this.state.widgetData[index].widgetname });
    }
     /** 
(Reload all widgets when navigate back to this page)
@param  :index     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async refresh() {
        var data = await AsyncStorage.getItem("updatedata");
        var deleted = await AsyncStorage.getItem("deletewidget");
        if (deleted != null) {
            var new_stax = await AsyncStorage.getItem("newstax");
            await AsyncStorage.removeItem("deletewidget");
            await AsyncStorage.removeItem("newstax");
            await AsyncStorage.removeItem("updatedata");
            //do delete ops
            var curindex = 0;
            if (new_stax != null)
                curindex = this.state.widgetData.length - 1;
            else
                curindex = this.state.curindex;
            var item = {};
            item["staxid"] = this.state.data[this.state.order[curindex]].staxid
            item["staxname"] = "";
            item["sorcekey"] = this.state.order[curindex];
            await this.deleteStaxExecute(item);
            await this.saveStaxOrder();
            return;
        }
        if (data != null) {
            var obj = JSON.parse(data);
            //update the selected widget;
            var new_stax = await AsyncStorage.getItem("newstax");
            var curindex = 0;
            if (new_stax != null)
                curindex = this.state.widgetData.length - 1;
            else
                curindex = this.state.curindex;
            this.state.data[this.state.order[curindex]].staxname = obj.widgetname;
            this.state.widgetSearchSource[curindex].widgetname = obj.widgetname;
            this.state.widgetData[curindex].headercolor = obj.headerbackgroundcolor;
            this.state.widgetData[curindex].backgroundcolor = obj.widgetbackground;
            this.state.widgetData[curindex].transperancy = obj.transperancyvalue;
            this.state.widgetData[curindex].fontcolor = obj.apptextcolor;
            if (commons.isimagevalid(obj)) {
                var uri = await commons.getfile_uri(obj.fileid, '.jpg');
                this.state.widgetData[curindex].backgroundpicture = uri; //+ "?time=" + commons.gettimestamp();// 
            }
            else {
                this.state.widgetData[curindex].backgroundpicture = 'data:image/png;base64';
            }
            this.state.widgetData[curindex].widgetname = obj.widgetname;
            this.state.widgetData[curindex].WebView == 'none';
            if (obj.editflag == "1") {
                var modifiedaplist = JSON.parse(obj.applist);
                let newapplist = [];
                var iconpackagemapping = global.applist;
                for (var i = 0; i < modifiedaplist.length; i++) {
                    var appobj = {};
                    appobj["appname"] = modifiedaplist[i].appname
                    appobj["package"] = modifiedaplist[i].package
                    if (iconpackagemapping.hasOwnProperty(modifiedaplist[i].package))
                        appobj["icon"] = iconpackagemapping[modifiedaplist[i].package].icon;
                    else
                        appobj["icon"] = commons.getIconUnavailable();  //dataobj.applist[j]["icon"]="data:image/png;base64,"
                    appobj["key"] = i + "";
                    newapplist.push(appobj);
                }
                this.state.widgetData[curindex].applist = newapplist;
            }
            await this.setState({ widgetData: this.state.widgetData, data: this.state.data, widgetSearchSource: this.state.widgetSearchSource });
            if (new_stax != null)
                this.refs.slidermain.scrollBy(curindex - this.state.curindex);
            await AsyncStorage.removeItem("newstax");
            await AsyncStorage.removeItem("updatedata");
        }
    }
     /** 
(button click of stax editor
    >> all widgets except purchased stax with feed can be edit
    >>navigates to stax editor page )
@param  :nil     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async  editor_click() {
        this.mixpanelTrack("Stax Edit Click");
        await AsyncStorage.removeItem("newstax");
        this.setState({ loading: true });
        var MFWidget = await AsyncStorage.getItem("mostusedwidgetid");
        var SmartStId = await AsyncStorage.getItem("smartstaxid");
        if (this.state.currentWidget.mostusedwidget == 2 && this.state.currentWidget.WebView=="flex") {
            this.setState({ loading: false });
            ToastAndroid.show(Strings.staxviewer_purchased_toast, 1000);
        }
        else if (this.state.mostusedId == this.state.widgetid) {
            /*    this.setState({ loading: false });
                ToastAndroid.show('Canot Edit Most Frequent Stax', 1000); */
            this.resetWebViewToInitialUrl();
            const { navigate } = this.props.navigation;
            navigate("widgetseditor", { "widget_id": this.state.widgetid, "deviceid": this.state.choosenDeviceId, "item": this.state.choosenDevice, "widgetdata": this.state.widgetData[this.state.curindex], "MFWidget": MFWidget, "SmartStId": SmartStId, onGoBack: () => this.refresh() });
        }
        else {
            this.resetWebViewToInitialUrl();
            const { navigate } = this.props.navigation;
            navigate("widgetseditor", { "widget_id": this.state.widgetid, "deviceid": this.state.choosenDeviceId, "item": this.state.choosenDevice, "widgetdata": this.state.widgetData[this.state.curindex], "MFWidget": MFWidget, "SmartStId": SmartStId, onGoBack: () => this.refresh() });
            this.setState({ loading: false });
        }
    }
/** 
* (button click of stax create Ok button
   >>Creates new stax
   >>navigates to stax editor page )
* @param  :nil     
* @return :nil
* @created by    :dhi
* @modified by   :dhiD5
* @modified date :05/09/18
*/
   
    async create_widgets() {
        this.mixpanelTrack("Create Stax");
        this.setState({ dialogWidgetName: false, loading: true });
        //alert(this.props.navigation.state.params.item.id);
        var widget_id = await commons.getuuid();
        var time = commons.gettimestamp();
        var widget_name = this.state.Widget_name;
        var deviceid = this.state.choosenDeviceId;
        var applistArr = [];
        var applist = JSON.stringify(applistArr);
        var mostusedwidget = 1;
        if (widget_name.length <= 15 && widget_name.length > 0) {
            var result = await databasehelper.insertwidget(widget_id, widget_name, applist, time, mostusedwidget, deviceid);
            this.setState({ loading: false });
            if (result.results.rowsAffected > 0) {
                this.setState({
                    dialogWidgetName: false,
                    widgetVisible: false,
                    Widget_name: ""
                });
                var widgetobj = {};
                widgetobj.deviceid = deviceid;
                widgetobj.widgetid = widget_id;
                widgetobj.mostusedwidget = mostusedwidget;
                widgetobj.widgetname = widget_name;
                widgetobj.applist = [];
                widgetobj.headercolor = "#006BBD";
                widgetobj.backgroundcolor = "#ffffff";
                widgetobj.transperancy = "0";
                widgetobj.backgroundpicture = 'data:image/png;base64';
                widgetobj.fontcolor = "black";
                widgetobj.WebView = 'none';
                widgetobj.feedView = undefined;
                try {
                var newindex = this.state.widgetdata.length;
                } catch (err) { console.log(err + "@line1682") }
                //add new widget to organiser
                this.state.data[newindex] = {};
                this.state.data[newindex]["staxid"] = widget_id;
                this.state.data[newindex]["staxname"] = widget_name;
                this.state.data[newindex]["sorcekey"] = newindex;
                //add new data to search list
                var searchlist_obj = {};
                searchlist_obj["widgetname"] = widget_name;
                searchlist_obj["index"] = newindex;
                searchlist_obj["key"] = newindex;
                searchlist_obj["render"] = true;
                this.state.widgetSearchSource.push(searchlist_obj);
                this.state.order.push(newindex);
                this.state.widgetData.push(widgetobj);
                await this.setState({ widgetData: this.state.widgetData, order: this.state.order, data: this.state.data, widgetSearchSource: this.state.widgetSearchSource });
                await AsyncStorage.setItem("newstax", "1");
                const { navigate } = this.props.navigation;
                navigate("widgetseditor", { "widget_id": widget_id, "deviceid": deviceid, onGoBack: () => this.refresh(), "item": this.state.choosenDevice });
            }
            else {
                this.setState({ dialogWidgetName: true });
                this.mixpanelTrack("Enter Stax Name View");
            }
        } else {
            this.setState({ loading: false });
            this.setState({ dialogWidgetName: true });
            this.mixpanelTrack("Enter Stax Name View");
        }
    }
     /** 
(Find Most frequent stax 
    >> Fetch data of most frquent widget data from local db
    >>navigates to stax editor page )
@param  :index     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    async MostFrequentWidgetFinder(device_id, iscurrentdevice) {
        await commons.writelog(screen, "15_checking most used widget status", commons.gettimestamp_log())
        if (iscurrentdevice) {
            this.setState({ mostFrequentStyle: 'flex' });
            var result = await databasehelper.getMostFrequentwidget(device_id);
            if (result.dataArray.length > 0)
                this.setState({ mostFrequentStyle: 'none' });
        }
        else
            this.setState({ mostFrequentStyle: 'none' });
        await commons.writelog(screen, "15_donechecking most used widgets", commons.gettimestamp_log())
    }
     /** 
(Mixpanel Track Event
    >> Creates an event in mixpanel portal)
@param  :index     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
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
(Fetches Most Frequent stax data and Smart aprrow data
    >> Creates an event in mixpanel portal
    >>**** widget flag
                  * 0-->mostusedwidget
                  * 1-->customized
                  * 2-->purchased
                  * 3-->sharing
                  * 4-->smartstax
                  * *****)
@param  :index     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/

    async MostFrequentWidget() {
        var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
        if (!enabled_app_usage_permission) {
            ToastExample.askpermission();
            return;
        }
        else {
            this.setState({ widgetVisible: false })
            this.setState({ loading: true });
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
            var device_id = this.state.choosenDeviceId;
            var widget_id = await commons.getuuid();
            var widget_name = "Most Frequent";
            var mostusedwidget = 0;
            var result = await databasehelper.insertwidget(widget_id, widget_name, JSON.stringify(applists), time, mostusedwidget, device_id);
            await AsyncStorage.setItem('mostusedwidgetid', widget_id);
            var SmartFlag =await commons.checkSmartFlag();
            if(SmartFlag==true)
            { 
            //--------------------------------start smart stax------------------------------------------------------------
            var connectionStatus = await commons.isconnected();
            var username = await AsyncStorage.getItem("username");
            if (username == null || username == commons.guestuserkey()) {// && this.state.widgetData.length >= 5
            }
            else {
                /***** mostusedwidget flag
                  * 0-->mostusedwidget
                  * 1-->customized
                  * 2-->purchased
                  * 3-->sharing
                  * 4-->smartstax
                  * ******/
                var smart_widget_id = await commons.getuuid();
                var smart_widget_name = "Smart APRROW";
                var smart_mostusedwidget = 4;
                var smart_applists = [];
                if (connectionStatus) {
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
                    sInput["deviceid"] = device_id;
                    sInput["lat"] = "" + llat;
                    sInput["long"] = "" + llong;
                    var awsData = require("./config/AWSConfig.json");
                    var awsLamda = require("./config/AWSLamdaConfig.json");
                    var token = await commons.get_token();
                    fetch('' + awsData.path + awsData.stage + awsLamda.smartstaxmgmt, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': token
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
                            var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, device_id);
                            await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
                else {
                    var result = await databasehelper.insertwidget(smart_widget_id, smart_widget_name, JSON.stringify(smart_applists), time, smart_mostusedwidget, device_id);
                    await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                }
            }
            //-------------------------------- end smart stax ------------------------------------------------------------
           }  
            this.setState({ loading: false });
            this.Repeat_ComponentDidMount();
        }
    }
    /** 
(Each row of a stax organizer 
    >>returns row)
@param  :row     
@return :nil
@created by    :dhi
@modified by   :dhi
@modified date :05/09/18
*/
    _renderRow = ({ key, index, data, disabled, active }) => {
        return <Row data={data} active={active} delete_stax={this.delete_stax} />
    }
     /** 
*(Change the order of stax organizer 
  >> Manages through state)
*@param  :row     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/
    async changeStaxOrder(neworder) {
        await this.setState({ order: neworder, needReload: true })
    }
       /** 
*(Save the order of stax organizer 
  >> replaces older stax order with new order)
*@param  :row     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/
    async saveStaxOrder() {
        this.mixpanelTrack("Organize Stax");
        if (this.state.needReload) {
            var new_widgetorder = [];
            var new_search_data = [];
            var order_stax_data = [];
            var current_order = this.state.order;
            var widget_source = this.state.data;
            var index_id_map = {};
            for (var i = 0; i < this.state.widgetData.length; i++) {
                index_id_map[this.state.widgetData[i].widgetid] = i;
            }
            for (var i = 0; i < current_order.length; i++) {
                var obj = {};
                obj["widgetid"] = widget_source[current_order[i]].staxid;
                obj["createtime"] = commons.gettimestamp();
                obj["displayorder"] = i;
                new_widgetorder.push(obj);
                var staxobj = this.state.widgetData[index_id_map[widget_source[current_order[i]].staxid]];
                order_stax_data.push(staxobj);
                var searchlist_obj = {};
                searchlist_obj["widgetname"] = staxobj.widgetname;
                searchlist_obj["index"] = i;
                searchlist_obj["key"] = i;
                searchlist_obj["render"] = true;
                new_search_data.push(searchlist_obj);
            }
            await databasehelper.update_widget_orders(new_widgetorder);
            await this.setState({ widgetData: [] });
            if (order_stax_data.length > 0)
                await this.setState({ widgetIndex: 0 });
            await this.setState({ widgetData: order_stax_data });
            await this.setState({ showOrganiser: false, widgetSearchSource: new_search_data, needReload: false });
            if (order_stax_data.length > 0)
                await this.indexChange(0);
            if (this.state.widgetData.length == 0) {
                this.setState({ configStyle: 'none', mostFrequentStyle: 'flex' });
            }
            else {
                this.setState({ configStyle: 'flex' });
            }
        }
        else {
            this.setState({ showOrganiser: false })
        }
    }
    /** 
*(Change the current device  
  >> move to the selected device
  >> Fetch all  datas of selected device)
*@param  :index     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/
   
    async deviceseSelected(index) {
        var connectionStatus = await commons.isconnected();
        if (!connectionStatus && this.state.devices[index].currentdevice != 'flex') {
            this.setState({ offlineFlag: true });
            return;
        }
        await commons.writelog(screen, "16_switching device", commons.gettimestamp_log())
        var current_devicelist = this.state.devices;
        var curr_device = this.state.choosenDeviceId;
        for (var i = 0; i < current_devicelist.length; i++) {
            if (current_devicelist[i].id == curr_device) {
                current_devicelist[i].fontcolor = "#757575";
                break;
            }
        }
        current_devicelist[index].fontcolor = "#2699FB"
        await this.setState({ choosenDeviceId: current_devicelist[index].id, devices: current_devicelist, choosenDevice: current_devicelist[index] });
        this.refs.loaderRef.show();
        var iscurrentdevice = false;
        if (current_devicelist[index].currentdevice == 'flex' && !current_devicelist[index].add_device)
            iscurrentdevice = true;
        if (current_devicelist[index].add_device) {
            this.setState({ showAddOption: 'none' });
        }
        else {
            this.setState({ showAddOption: 'flex' });
        }
        if (!current_devicelist[index].add_device)
            await this.updateWidgetLocaldb(current_devicelist[index].id);
        await this.widgetDisplay(current_devicelist[index].id);
        await this.MostFrequentWidgetFinder(current_devicelist[index].id, iscurrentdevice);
        if (!current_devicelist[index].add_device)
            await this.setState({ showDeviceOptions: false });
        else
            await this.setState({ insertModel: true, editingDeviceIndex: index });
        this.props.setHeader(current_devicelist[index].name);
        this.refs.loaderRef.hide();
        await commons.writelog(screen, "16_doneswitching", commons.gettimestamp_log())
    }
/** 
*(Hides offline dialogue box)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/
    offlineFunc() {
        this.setState({ offlineFlag: false }); 
    }
    render() {
        var windowProp = Dimensions.get('window');
        var winheight = windowProp.height;
        var winwidth = windowProp.width;
        var device_loop = [];
        var bubble = [];
        const { navigate } = this.props.navigation;
        return (
            <View style={{ flex: 1 ,}}>
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
                <LoaderNew ref={"loaderRef"} />
               
                {/*new widget flow */}
                <View style={{ flex: 1, backgroundColor: "#ebebe0" }}>
                    <Dialog
                        visible={this.state.dialogWidgetDelete}
                        onTouchOutside={() => this.setState({ dialogWidgetDelete: false })}
                        animation='fade'
                    >
                        <View >
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 5, fontFamily:'Roboto', textAlign: 'center' }]}>{Strings.staxviewer_staxbox_delete}</Text>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontFamily:'Roboto-Bold', textAlign: 'center' }]}>{this.state.widgetToDelete.staxname}</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidgetDelete: false }) }}>{Strings.staxviewer_staxbox_nobutton}</Text>
                                <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this.deleteStaxExecute(this.state.widgetToDelete)}>{Strings.staxviewer_staxbox_okbutton}</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Dialog
                        visible={this.state.deleteModel}
                    >
                        <View>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 20, marginBottom: 30,fontFamily:'Roboto-Bold', color: "#2699FB", alignSelf: "center" }]}>{this.state.editingDeviceName}</Text>
                            <Text allowFontScaling={false} style={{ color: "#757575", fontSize: 16 }}>{Strings.staxviewer_devicebox_deletehead}</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontFamily:'Roboto-Bold' }]} onPress={() => { this.setState({ deleteModel: false }) }}>{Strings.staxviewer_devicebox_deletecancel}</Text>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontFamily:'Roboto-Bold' }]} onPress={() => this.deleteDevice()}>{Strings.staxviewer_devicebox_deletebutton}</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Dialog
                        visible={this.state.renameModel}
                    >
                        <View >
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontFamily:'Roboto-Bold', textAlign: 'center', fontSize: 20, color: "#2699FB" }]}>{Strings.staxviewer_devicebox_rename}</Text>
                            <TextInput
                                style={[device_style.dialog_textinput, { borderColor: "#2699FB" }]}
                                autoCapitalize="none"
                                onChangeText={(deviceName) => this.setState({ deviceName })}
                                underlineColorAndroid="transparent"
                                maxLength={15}
                                value={this.state.deviceName}
                            ></TextInput>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10, color: this.state.valid }]}>{Strings.staxviewer_devicebox_maxchara}</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontFamily:'Roboto-Bold' }]} onPress={() => { this.setState({ renameModel: false, valid: '#2699FB', deviceName: "" }) }}>{Strings.staxviewer_devicebox_rename_cancelbtn}</Text>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontFamily:'Roboto-Bold' }]} onPress={() => this.Renamedevice()}>{Strings.staxviewer_devicebox_rename_okbtn}</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Dialog
                        visible={this.state.insertModel}>
                        <View >
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '500', textAlign: 'center', fontSize: 20, color: "black" }]}>{Strings.staxviewer_devicebox_insertdevice}</Text>
                            <TextInput
                                style={[device_style.dialog_textinput, { borderColor: "#2699FB" }]}
                                autoCapitalize="none"
                                onChangeText={(deviceName) => this.setState({ deviceName })}
                                underlineColorAndroid="transparent"
                                maxLength={15}
                                value={this.state.deviceName}
                            ></TextInput>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10, color: this.state.valid }]}>{Strings.staxviewer_devicebox_maxchara}</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontWeight: "500" }]} onPress={() => { this.setState({ insertModel: false, valid: '#2699FB', deviceName: "" }) }}>{Strings.staxviewer_devicebox_insertdevice_cancelbtn}</Text>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontWeight: "500" }]} onPress={() => this.deviceInsert()}>{Strings.staxviewer_devicebox_insertdevice_okbtn}</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Modal
                        isVisible={this.state.replicateModel}
                        onBackButtonPress={() => this.setState({ replicateModel: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 3, flex: .3 }}>
                            <View style={{ backgroundColor: "#006BBD", height: '30%', width: '100%', alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                                <TouchableOpacity onPress={() => this.setState({ replicateModel: false, showDeviceOptions: true })} style={{ width: '40%' }}>
                                    <Image style={{ marginLeft: 10 }} source={assetsConfig.iconBackWhite} />
                                </TouchableOpacity>
                                <View style={{ width: "60%" }}>
                                    <Text allowFontScaling={false} style={[styles.title, { fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.staxviewer_replicate_head}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'column', marginTop: 15, alignItems: "center", justifyContent: "center" }}>
                                <TouchableOpacity onPress={async () => {
                                    await this.deviceListToReplicate();
                                    this.mixpanelTrack("Replicated All Stax");
                                    var cur_Staxs = this.state.staxReplicate;
                                    if (cur_Staxs.length > 0) {
                                        for (var i = 0; i < cur_Staxs.length; i++) {
                                            cur_Staxs[i].checked = true;
                                        }
                                        await this.setState({ staxReplicate: cur_Staxs });
                                        var device_master = this.state.devices;
                                        var editing_id = device_master[this.state.editingDeviceIndex].id;
                                        var devicetep = [];
                                        for (var i = 0; i < device_master.length; i++) {
                                            var obj = device_master[i];
                                            if (obj.add_device)
                                                continue;
                                            if (obj.id != editing_id) {
                                                obj["checked"] = false;
                                                obj["source"] = false;
                                                devicetep.push(obj);
                                            }
                                            else {
                                                obj["checked"] = false;
                                                obj["source"] = true;
                                                devicetep.push(obj);
                                            }
                                        }
                                        await this.setState({ replicateModel: false, devicesTempToReplicate: devicetep, selectDeviceModel: true })
                                    }
                                    else {
                                        ToastAndroid.show(Strings.staxviewer_toast_staxnone, 500);
                                    }
                                }}>
                                    <Text allowFontScaling={false} style={{ color: "#3F97DC", fontSize: 18, fontFamily:'Roboto-Bold' }} >{Strings.staxviewer_replicate_allstax}</Text>
                                </TouchableOpacity>
                                <Image style={{ marginTop: 10 }} source={assetsConfig.linePopup228} />
                                <TouchableOpacity onPress={async () => {                                    
                                    await this.deviceListToReplicate();
                                    this.mixpanelTrack("Replicate Selected Stax");
                                    this.setState({ selectStaxModel: true, replicateModel: false })
                                }}>
                                    <Text allowFontScaling={false} style={{ color: "#3F97DC", fontSize: 18, fontFamily:'Roboto-Bold', marginTop: 15 }} >{Strings.staxviewer_replicate_selctstax}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        isVisible={this.state.selectStaxModel}
                        onBackButtonPress={() => this.setState({ selectStaxModel: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 3 }}>
                            <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <Text allowFontScaling={false} style={[styles.title, { fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.staxviewer_replicate_selctstax}</Text>
                            </View>
                            <View style={{ height: "75%" }}>
                                <FlatList style={{ flex: 1, padding: 15 }}
                                    extraData={this.state}
                                    data={this.state.staxReplicate}
                                    renderItem={({ item, index }) =>
                                        <View style={{ marginTop: 25 }}>
                                            <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
                                                <Text allowFontScaling={false} style={{ marginLeft: 10, color: "#3F97DC", fontFamily:'Roboto-Bold', fontSize: 16 }} >{item.widgetname}</Text>
                                                <CheckBox
                                                    onClick={() => this.onClick(index)}
                                                    isChecked={item.checked}
                                                    checkedImage={<Image source={assetsConfig.checkboxCheckedIcon} />}
                                                    unCheckedImage={<Image source={assetsConfig.checkbocUncheckedIcon} />}
                                                />
                                            </View>
                                            <Image style={{ marginTop: 10, width: "100%" }} source={assetsConfig.linePopup_228} />
                                        </View>
                                    }
                                />
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 25, alignItems: "center", justifyContent: "center" }}>
                                <TouchableOpacity onPress={() => this.setState({ selectStaxModel: false, replicateModel: true })} style={{ marginRight: 10, height: 45, width: 120, backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white",fontFamily:'Roboto-Bold' }}>{Strings.staxviewer_devicebox_rename_cancelbtn}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    var cur_Data = this.state.staxReplicate;
                                    var donext = false;
                                    for (var i = 0; i < cur_Data.length; i++) {
                                        if (cur_Data[i].checked) {
                                            donext = true;
                                            break;
                                        }
                                    }
                                    if (donext) {
                                        var device_master = this.state.devices;
                                        var editing_id = device_master[this.state.editingDeviceIndex].id;
                                        var devicetep = [];
                                        for (var i = 0; i < device_master.length; i++) {
                                            var obj = device_master[i];
                                            if (obj.add_device)
                                                continue;
                                            if (obj.id != editing_id) {
                                                obj["checked"] = false;
                                                obj["source"] = false;
                                                devicetep.push(obj);
                                            }
                                            else {
                                                obj["checked"] = false;
                                                obj["source"] = true;
                                                devicetep.push(obj);
                                            }
                                        }
                                        this.setState({ selectStaxModel: false, selectDeviceModel: true, devicesTempToReplicate: devicetep });
                                    }
                                    else
                                        ToastAndroid.show(Strings.staxviewer_toast_staxselection, 500);
                                }} style={{ marginLeft: 10, height: 45, width: 120, backgroundColor: "#006BBD", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }} >{Strings.staxviewer_devicebox_rename_nextbtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        isVisible={this.state.selectDeviceModel}
                        onBackButtonPress={() => this.setState({ selectDeviceModel: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 3 }}>
                            <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <Text allowFontScaling={false} style={[styles.title, { fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.staxviewer_device_selection_select}</Text>
                            </View>
                            <View style={{ height: "75%" }}>
                                <FlatList style={{ flex: 1 }}
                                    extraData={this.state}
                                    data={this.state.devicesTempToReplicate}
                                    renderItem={({ item, index }) =>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", padding: 15 }}>
                                                <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                                                    <Image source={assetsConfig.iconDevicesBlue} />
                                                    <Text allowFontScaling={false} style={{ marginLeft: 12, color: item.source ? "#3F97DC" : "black", fontFamily:'Roboto-Bold', fontSize: 16 }} onPress={() => { }}>{item.name}</Text>
                                                </View>
                                                {commons.renderIf(!item.source,
                                                    <View >
                                                        <CheckBox
                                                            onClick={() => this.onClickDevice(index)}
                                                            isChecked={item.checked}
                                                            checkedImage={<Image source={assetsConfig.checkboxCheckedIcon} />}
                                                            unCheckedImage={<Image source={assetsConfig.checkbocUncheckedIcon} />}
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                            <Image style={{ marginTop: 10, width: "100%" }} source={assetsConfig.linePopup228} />
                                        </View>
                                    }
                                />
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 25, alignItems: "center", justifyContent: "center" }}>
                                <TouchableOpacity onPress={() => this.setState({ selectDeviceModel: false, selectStaxModel: true })} style={{ marginRight: 10, height: 45, width: 120, backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxviewer_devicebox_insertdevice_cancelbtn}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.replicateDevice()} style={{ marginLeft: 10, height: 45, width: 120, backgroundColor: "#006BBD", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxviewer_devicebox_insertdevice_replicatebtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        isVisible={this.state.gotoLoginFlow}
                        onBackButtonPress={() => this.setState({ gotoLoginFlow: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" ,zIndex:-1}}>
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
                        isVisible={this.state.fullscreen}
                        style={{ flex: 1, margin: 0 }}
                        backdropColor="#ebebe0"
                        presentationStyle="fullScreen"
                        transparent={false}
                        animationIn="fadeIn"
                        animationOut="fadeOut"
                    >
                        {this.state.fullScreenView}
                    </Modal>
                    <Modal
                        isVisible={this.state.showOrganiser}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={[styles.container, { borderRadius: 3,zIndex:-1 }]}>
                            <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center" }}>
                                <Text allowFontScaling={false} style={[styles.title, { color: "white", fontFamily:'Roboto-Bold' }]}>{Strings.staxviewer_organize_head}</Text>
                            </View>
                            <SortableList
                                onChangeOrder={(nexorder) => this.changeStaxOrder(nexorder)}
                                order={this.state.order}
                                rowActivationTime={150}
                                style={[styles.list]}
                                contentContainerStyle={styles.contentContainer}
                                data={this.state.data}
                                renderRow={this._renderRow} />
                            <TouchableOpacity onPress={() => this.saveStaxOrder()} style={{ backgroundColor: "#006BBD", height: 36, width: '35%', alignItems: "center", marginBottom: 8, borderRadius: 3 }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>{Strings.staxviewer_organize_done}</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <Modal
                        isVisible={this.state.showDeviceOptions}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ flex: 1 }}>
                            <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "space-around", flexDirection: "row" }}>
                                <TouchableOpacity onPress={() => { this.setState({ showDeviceOptions: false }) }} style={{ width: '30%' }}>
                                    <Image style={{ marginLeft: 10 }} source={assetsConfig.iconBackWhite} />
                                </TouchableOpacity>
                                <View style={{ width: "70%",alignContent:'center',alignSelf:'center'}}>
                                    <Text allowFontScaling={false} style={[styles.title, { fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.staxviewer_device_head}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 1, width: '100%', backgroundColor: "#EEEEEE" }}>
                                <FlatList
                                    style={{ flex: 1, marginTop: 2 }}
                                    data={this.state.devices}
                                    extraData={this.state}
                                    renderItem={({ item, index }) =>
                                        commons.renderIf(!item.deleted,
                                            <TouchableOpacity onPress={() => this.deviceseSelected(index)} style={{ borderRadius: 5, backgroundColor: "#FFFFFF", marginLeft: 8, marginRight: 8, marginTop: 8, flexDirection: "row", justifyContent: "space-between", padding: 15 }}>
                                                <View style={{ flexDirection: "row", width: "50%", alignItems: "center" }}>
                                                    <View>
                                                        <Image source={this.getDeviceIcon(item)} />
                                                    </View>
                                                    <View style={{ flexDirection: "column", marginLeft: 2 }}>
                                                        <Text allowFontScaling={false} style={{ fontSize: 17, fontFamily:'Roboto-Bold', color: item.fontcolor }}>{item.name}</Text>
                                                        <View style={{ flexDirection: "row" }}>
                                                            <Text allowFontScaling={false} style={{ fontSize: 12 }} numberOfLines={1}>{item.model}  </Text>
                                                            <View style={{ display: item.currentdevice }}>
                                                                <Image style={{ marginLeft: 1, marginTop: 2 }} source={assetsConfig.iconCheckCircleGreen} />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                {commons.renderIf(!item.add_device,
                                                    <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "row", width: "25%" }}>
                                                        <TouchableOpacity onPress={async () => {
                                                            this.mixpanelTrack("Replicate Stax");
                                                            var connectionStatus = await commons.isconnected();
                                                            if (!connectionStatus && this.state.devices[index].currentdevice != 'flex') {
                                                                this.setState({ offlineFlag: true });
                                                                return;
                                                            }
                                                            this.setState({ showDeviceOptions: false, replicateModel: true, editingDeviceIndex: index });
                                                        }}>
                                                            <Image source={assetsConfig.iconReplicateBlue30x19px} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={async () => {
                                                            var connectionStatus = await commons.isconnected();
                                                            if (!connectionStatus && this.state.devices[index].currentdevice != 'flex') {
                                                                this.setState({ offlineFlag: true });
                                                                return;
                                                            }
                                                            this.setState({ renameModel: true, editingDeviceIndex: index, editingDeviceName: item.name })
                                                        }}>
                                                            <Image style={{ marginLeft: 10 }} source={assetsConfig.iconRenameBlue21px} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={async () => {
                                                            var connectionStatus = await commons.isconnected();
                                                            if (!connectionStatus && this.state.devices[index].currentdevice != 'flex') {
                                                                this.setState({ offlineFlag: true });
                                                                return;
                                                            }
                                                            this.setState({ editingDeviceIndex: index, editingDeviceName: item.name, deleteModel: true })
                                                        }}>
                                                            <Image style={{ marginLeft: 10 }} source={assetsConfig.iconDeleteBlue21px} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                                {commons.renderIf(item.add_device,
                                                    <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "column", width: "30%" }}>
                                                        <Image source={assetsConfig.iconAddCircleBlue24px} />
                                                        <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily:'Roboto-Bold', color: "#2699FB", marginTop: 8 }}>{Strings.staxviewer_device_add}</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>)
                                    } />
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        isVisible={this.state.showSearchDialogue}
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", alignItems: "center", flex: 1 }}>
                            <View style={{ backgroundColor: "#006BBD", height: '13%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <TouchableOpacity style={{ marginLeft: 10, marginRight: 5 }} onPress={() => {
                                    var curwidgetlist = this.state.widgetSearchSource;
                                    for (var i = 0; i < curwidgetlist.length; i++)
                                        curwidgetlist[i].render = true;
                                    this.setState({ showSearchDialogue: false, widgetSearchSource: curwidgetlist, searchText: "" })
                                }}>
                                    <Image
                                        style={{ marginLeft: 5 }}
                                        source={assetsConfig.iconBackWhite}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    style={{ width: "75%", borderWidth: 0, color: "white", fontSize: 14, marginLeft: 10,fontFamily:'Roboto' }}
                                    placeholder={Strings.staxviewer_search_stax}
                                    allowFontScaling={false}
                                    value={this.state.searchText}
                                    autoCapitalize="none"
                                    placeholderTextColor="#CBCBCB"
                                    underlineColorAndroid="#CBCBCB"
                                    onChangeText={(value) => this.search(value)}
                                />
                                <TouchableOpacity style={{ marginLeft: 10, marginRight: 5 }} onPress={() => {
                                    var curwidgetlist = this.state.widgetSearchSource;
                                    for (var i = 0; i < curwidgetlist.length; i++)
                                        curwidgetlist[i].render = true;
                                    this.setState({ widgetSearchSource: curwidgetlist, searchText: "" })
                                }}>
                                    <Image
                                        source={assetsConfig.iconCloseWhite21px}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginTop: 15, marginLeft: 20, flex: 1 }}>
                                <FlatList style={{ flex: 1 }}
                                    data={this.state.widgetSearchSource}
                                    extraData={this.state}
                                    renderItem={({ item }) =>
                                        commons.renderIf(item.render,
                                            <View>
                                                <TouchableOpacity onPress={() => this.serachWidgetGotoIndex(item.index)} style={{ flexDirection: "column", marginTop: 15, marginLeft: 10 }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 16, color: "black", fontWeight: "200" }}>{item.widgetname}</Text>
                                                    <Image style={{ marginTop: 12 }} source={assetsConfig.linePopup228} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }
                                />
                            </View>
                        </View>
                    </Modal>
                    {commons.renderIf(this.state.widgetData.length > 0,
                        <Swiper style={{ flex: 1 }}
                            ref={"slidermain"}
                            removeClippedSubviews={false}
                            index={this.state.widgetIndex}
                            showsPagination={false}
                            showsButtons={this.state.Swiperbutton}
                            prevButton={<Image style={{ width: 15, height: 30 }} source={assetsConfig.arrowLeft} />}
                            nextButton={<Image style={{ width: 15, height: 30 }} source={assetsConfig.arrowRight} />}
                            loop={false}
                            containerStyle={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                            onIndexChanged={(index) => this.indexChange(index)}>
                            {this.state.widgetData.map((item_main, key) => {
                                return (
                                    <View style={[styles.slide1,{backgroundColor:'white',/* paddingBottom:14 */}]} key={key}>
                                        <View style={[widgets_style.box_view, { backgroundColor: item_main.backgroundcolor,paddingBottom:16,borderWidth:1 }]}>
                                            <View style={[widgets_style.box_view_bar, { backgroundColor: item_main.headercolor, justifyContent: "space-between" }]}>
                                            
                                                < View style={{ flexDirection: "row", alignItems: 'center',marginRight:4,marginLeft:4 }}>
                                                <Touch timeout={3500} pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.editor_click()}>
                                                    <View style={{ width: '10%' }}>
                                                        <Image style={widgets_style.box_view_bar_icon} source={assetsConfig.settingIconbar} />
                                                    </View>
                                                </Touch>
                                                    <View style={{ width: '80%' }}>
                                                        <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{item_main.widgetname=="Most Frequent"?Strings.mostfrequent_stax:item_main.widgetname}</Text>
                                                    </View>
                                                    <TouchableOpacity style={{ width: '15%', alignSelf: 'center' }} onPress={this.sharewidget}>
                                                    
                                                        <Image style={[widgets_style.box_view_bar_icon, { height: 20, width: 20, marginLeft: '15%' }]} source={assetsConfig.sharesIconbar} />
                                                    </TouchableOpacity>
                                                </View>
                
                                            </View>
                                            
                                            
                                            {/* <TouchableOpacity style={{ alignSelf: 'center', display: this.state.compressFeed }} onPress={async () => {
                                                            await this.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' });
                                                        }}>
                                                            <Image style={{}} source={assetsConfig.iconExpandMoreBlack} />
                                                        </TouchableOpacity> */}

                                            {commons.renderIf(item_main.WebView == 'none',
                                                <ImageBackground style={{ width: '100%', height: '100%', flex: 1 }}
                                                    source={{ uri: item_main.backgroundpicture }}
                                                    imageStyle={{ resizeMode: 'cover' }
                                                    }>
                                                    <FlatList style={{ flex: 1,paddingBottom:5}}
                                                        data={item_main.applist}
                                                        extraData={item_main}
                                                        renderItem={({ item }) =>
                                                            <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .5 : .25, marginLeft:((Object.keys(item_main.applist).length)-1==item.key && item.key % 2 == 0 && item_main.mostusedwidget == 2) ? '-15%' : item.key % 2 == 0 && item_main.mostusedwidget == 2 ? '-22%':0, marginRight: item.key % 2 != 0 && item_main.mostusedwidget == 2 ? '-22%' : 0 }}>
                                                                <View key={item.key} style={{}}>
                                                                    <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                    <Text  allowFontScaling={false} style={{   marginTop: 1, marginLeft: 2,width: 60, fontFamily:'Roboto', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }}  >{item.appname}</Text>{/* numberOfLines={2} */}
                                                                </View>
                                                            </ TouchableOpacity>
                                                        }
                                                        numColumns={item_main.mostusedwidget == 2 ? 2 : 4}
                                            /></ImageBackground>)}
                                                    
                                            {commons.renderIf(item_main.WebView == 'flex' && item_main.mostusedwidget == 2 && this.state.appState=='active',
                                                <View style={{zIndex:-1, width: '100%'/* ,borderWidth:1,borderColor:'red', */, alignItems: 'center' }}>
                                                    <View style={{ width: '100%', height: this.state.FlatViewHeight/* , borderWidth:1,borderColor:'green' */}}>
                                                        <ImageBackground style={{ width: '100%', height: '100%',}}
                                                            source={{ uri: item_main.backgroundpicture }}
                                                            imageStyle={{ resizeMode: 'cover' }
                                                            }>
                                                            <FlatList style={{ flex: 1}}
                                                                data={item_main.applist}
                                                                extraData={item_main}
                                                                renderItem={({ item }) =>
                                                                    <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .18 : .09 }}>
                                                                        <View key={item.key} >
                                                                            <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                            <Text allowFontScaling={false} style={{marginTop: 1, marginLeft: 2,width: 60,fontFamily:'Roboto', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }} >{item.appname}</Text>{/* numberOfLines={2} */}
                                                                        </View>
                                                                    </ TouchableOpacity>
                                                                }
                                                                numColumns={item_main.mostusedwidget == 2 ? 2 : 4}
                                                            />
                                                        </ImageBackground>
                                                    </View>
                                                    <View style={{zIndex:-1,width:'100%',height:17,borderBottomWidth:.5,borderBottomColor:'grey',justifyContent:'center',alignSelf:'center',alignItems:'center'}}>
                                                    {/* <Image style={{}} source={assetsConfig.iconExpandLessBlack} /> */}
                                                    <TouchableOpacity style={{ alignSelf: 'center', display: this.state.expandFeed }} onPress={async () => {
                                                            await this.setState({ WebViewHeight: '95%', FlatViewHeight: '0%', expandFeed: 'none', compressFeed: 'flex' })
                                                        }}>
                                                            <Image style={{width:20,height:15}} source={assetsConfig.shutter} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ alignSelf: 'center', display: this.state.compressFeed }} onPress={async () => {
                                                            await this.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' });
                                                        }}>
                                                            <Image style={{width:20,height:15}} source={assetsConfig.shutter} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{justifyContent:'flex-end',flexDirection:'row',alignSelf:'flex-end',marginTop:-15,marginRight:7}}>
                                                    <Image style={{width:95,height:30}} source={assetsConfig.donatehand} />
                                                    </View>
                                                    <View style={{ width: '100%',paddingTop:13, height: this.state.WebViewHeight ,/* borderWidth:1,borderColor:'red' */}}>
                                                    
                                                        {/* <TouchableOpacity style={{ alignSelf: 'center', display: this.state.expandFeed }} onPress={async () => {
                                                            await this.setState({ WebViewHeight: '95%', FlatViewHeight: '0%', expandFeed: 'none', compressFeed: 'flex' })
                                                        }}>
                                                            <Image style={{}} source={assetsConfig.iconExpandLessBlack} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ alignSelf: 'center', display: this.state.compressFeed }} onPress={async () => {
                                                            await this.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' });
                                                        }}>
                                                            <Image style={{}} source={assetsConfig.iconExpandMoreBlack} />
                                                        </TouchableOpacity> */}
                                                        <WebView
                                                            key={ this.state.key }
                                                            source={{uri:this.state.feed}}
                                                            style={{ flex: 1, display: item_main.WebView, justifyContent: 'center' }}
                                                            scalesPageToFit={true}
                                                            bounces={false}
                                                            scrollEnabled={false}
                                                            javaScriptEnabled={true}
                                                            domStorageEnabled={true}
                                                            mixedContentMode='always'
                                                            ref={(webView) => { this.webView = webView; }}
                                                            onNavigationStateChange={(navState) => {this.webView.canGoBack = navState.canGoBack;this.setState({feedUrl:navState.url}); }}
                                                          />
                                                        <View style={{height:'7%'}}>
                                                        {/* <Text>bsbb</Text> */}
                                                        </View>
                                                    </View>
                                                </View>
                                             )
                                            }
                                            <View style={{zIndex:-1, position: 'absolute',justifyContent:'space-between', flexDirection: 'row',borderWidth:.5,borderColor:'grey', bottom: 0, height:'9%',marginBottom:6, width: '100%', display: item_main.WebView, backgroundColor: 'white', justifyContent: 'center' }}>
                                            <View style={{justifyContent:"center",marginRight:10}}>
                                            <Image style={{width:45,height:17,borderRadius:5}} source={assetsConfig.liveicon} />
                                            </View>
                                            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                          {commons.renderIf(item_main.websiteView == "flex",
                                          <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.websiteLink, openLink: item_main.websiteLink })
                                                        this.resetWebViewToInitialUrl();}} style={{ display: item_main.websiteView, display: item_main.youtubeView }}>
                                                        <Image  style={{}} source={assetsConfig.webSite} />
                                                    </TouchableOpacity></View>)}
                                                {commons.renderIf(item_main.facebookView == "flex",
                                                <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.facebookLink, openLink: item_main.facebookLink });
                                                        this.resetWebViewToInitialUrl();
                                                        }} style={{ display: item_main.facebookView }}>
                                                        <Image  source={assetsConfig.iconCircleFacebook} />
                                                    </TouchableOpacity></View>)}
                                                {commons.renderIf(item_main.twitterView == "flex",
                                                <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.twitterLink, openLink: item_main.twitterLink })
                                                        this.resetWebViewToInitialUrl();
                                                        }} style={{ display: item_main.twitterView}}>
                                                        <Image  source={assetsConfig.iconCircleTwitter} />
                                                    </TouchableOpacity></View>)}
                                                {commons.renderIf(item_main.instagramView == "flex",
                                                <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.instagramLink, openLink: item_main.instagramLink });
                                                        this.resetWebViewToInitialUrl();}} style={{ display: item_main.instagramView,}}>
                                                        <Image  source={assetsConfig.iconCircleInstagram} />
                                                    </TouchableOpacity></View>)}
                                                {commons.renderIf(item_main.youtubeView == "flex",
                                                <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.youtubeLink, openLink: item_main.youtubeLink });
                                                        this.resetWebViewToInitialUrl();}} style={{ display: item_main.youtubeView }}>
                                                        <Image  source={assetsConfig.iconCircleYoutube} />
                                                    </TouchableOpacity></View>)}
                                                {commons.renderIf(item_main.pinterestView == "flex",
                                                <View style={{justifyContent:'center',marginLeft:20}}>
                                                    <TouchableOpacity onPress={async() =>{
                                                        await this.setState({ feed: item_main.pinterestLink, openLink: item_main.pinterestLink })
                                                        this.resetWebViewToInitialUrl();}} style={{ display: item_main.pinterestView, }}>
                                                        <Image  source={assetsConfig.iconCircleYoutube} />
                                                    </TouchableOpacity></View>)}
                                                    <View style={{justifyContent:'center',marginLeft:30}}>
                                                    <Image style={{width:30,height:30,borderRadius:5}} source={assetsConfig.vipicon} />
                                                    </View>
                                                    </View>
                                                    </View>
                                                {/* <TouchableOpacity onPress={async() =>{ 
                                                    await this.setState({ feed: item_main.donateLink, openLink: item_main.donateLink })
                                                this.resetWebViewToInitialUrl();}} style={{ display: item_main.donateView,right:50,bottom:50,position:'absolute',marginRight:3}}> */}
                                                {/* </TouchableOpacity> */}
                                            {/* {commons.renderIf(item_main.donateView == "flex", */}
                                                {/* )} */}
                                        </View>
                                    </View>
                                )
                            })}
                        </Swiper>
                    )}
                    {/* <View style={[widgets_style.bottom_image_view, { left: 0, display: this.state.configStyle }]}>
                        <Touch timeout={3500} pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.editor_click()}>
                            <Image style={widgets_style.bottom_image} source={assetsConfig.configButton} />
                        </Touch>
                    </View>
                    <View style={[widgets_style.bottom_image_view, { right: 0, display: this.state.showAddOption }]}>
                        <TouchableOpacity onPress={async () => {
                            this.resetWebViewToInitialUrl();
                            var username = await AsyncStorage.getItem("username");
                            if ((username == null || username == commons.guestuserkey()) && this.state.widgetData.length >= 5) {
                                this.setState({ gotoLoginFlow: true });
                                return;
                            }
                            this.setState({ dialogWidgetName: true });
                            this.mixpanelTrack("Enter Stax Name View");
                        }}>
                            <Image style={[widgets_style.bottom_image]} source={assetsConfig.addButton} />
                        </TouchableOpacity>
                    </View> */}
                   
                </View>
                <Dialog
                    visible={this.state.dialogWidgetRename}
                    onTouchOutside={() => this.setState({ dialogWidgetRename: false })}
                    animation='bottom'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>{Strings.staxviewer_widget_insert}</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            onChangeText={(deviceName) => this.setState({ deviceName })}
                            value={this.state.deviceName}
                            maxLength={15}
                            underlineColorAndroid="transparent"
                        ></TextInput>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10 }]}>{Strings.staxviewer_devicebox_maxchara}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidgetRename: false }) }}>{Strings.staxviewer_devicebox_rename_cancelbtn}</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={console.log("ok pressed")}>{Strings.staxviewer_devicebox_rename_okbtn}</Text>
                        </View>
                    </View>
                </Dialog>
                <Modal
                    isVisible={this.state.widgetVisible}
                    style={device_style.bottomModal}
                    onBackdropPress={() => this.setState({ widgetVisible: false })}
                >
                    <View style={{ flexDirection: 'row', position: 'absolute', bottom: 210, right: 0, display: this.state.mostFrequentStyle }}>
                        <View style={{ backgroundColor: 'white', height: 30, width: 120, margin: 18, borderRadius: 5, alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ marginTop: 3, fontFamily:'Roboto-Bold', color: '#84AACE' }}>Most Frequent</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.MostFrequentWidget.bind(this)}>
                                <Image style={[widgets_style.bottom_image]} source={assetsConfig.btAddMostFrequent} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', position: 'absolute', bottom: 140, right: 0 }}>
                        <View style={{ backgroundColor: 'white', height: 30, width: 120, margin: 18, borderRadius: 5, alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ marginTop: 3, fontFamily:'Roboto-Bold', color: '#84AACE' }}>Customized</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => {this.setState({ dialogWidgetName: true });this.mixpanelTrack("Enter Stax Name View")}}>
                                <Image style={[widgets_style.bottom_image]} source={assetsConfig.btAddCustomized} />
                            </TouchableOpacity>
                        </View>
                    </View>
                   
                    <View style={[widgets_style.bottom_image_view, { right: 0, bottom: 50 }]}>
                        <TouchableOpacity onPress={() => {
                            this.setState({ widgetVisible: false });
                        }}>
                            <Image style={[widgets_style.bottom_image]} source={assetsConfig.addButton} />
                        </TouchableOpacity>
                    </View>
                </Modal>
                < Dialog
                    visible={this.state.dialogWidgetName}
                    onTouchOutside={() => this.setState({ dialogWidgetName: false })}
                    animation='fade'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, color: 'black', fontWeight: '300', textAlign: 'center' }]}>{Strings.staxviewer_new_stax}</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            value={this.state.Widget_name}
                            maxLength={15}
                            onChangeText={(Widget_name) => this.setState({ Widget_name })}
                        ></TextInput>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: '#5D89F6', fontSize: 12 }]}>{Strings.staxviewer_devicebox_maxchara}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidgetName: false }) }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxviewer_devicebox_insertdevice_cancelbtn}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={this.create_widgets.bind(this)}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxviewer_devicebox_insertdevice_okbtn}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
               
            </View >
        );
    }
}
class Row extends Component {
    constructor(props) {
        super(props);
        this._active = new Animated.Value(0);
        this._style = {
            ...Platform.select({
                ios: {
                    transform: [{
                        scale: this._active.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.1],
                        }),
                    }],
                    shadowRadius: this._active.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 10],
                    }),
                },
                android: {
                    transform: [{
                        scale: this._active.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.07],
                        }),
                    }],
                    elevation: this._active.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 6],
                    }),
                },
            })
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.active !== nextProps.active) {
            Animated.timing(this._active, {
                duration: 300,
                easing: Easing.bounce,
                toValue: Number(nextProps.active),
            }).start();
        }
    }
    render() {
        const { data, active, keyval, index } = this.props;
        return (
            <Animated.View style={[
                styles.row,
                this._style,
                { backgroundColor: "white" }
            ]}>
                <View style={{ flex: 1, flexDirection: 'row', marginRight: 5, marginTop: 5, width: '100%', justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <Image style={{ height: 40, width: 40, }} source={assetsConfig.iconReorderGrey24px} />
                        <Text allowFontScaling={false} style={{ fontWeight: "300", fontSize: 16, color: "black", textAlign: 'center', marginLeft: 12, marginTop: 8 }}>{data.staxname=="Most Frequent"?Strings.mostfrequent_stax:data.staxname}</Text>
                    </View>
                    {commons.renderIf((data.mostusedwidget != 0 && data.mostusedwidget != 4),
                        <View>
                            <TouchableOpacity onPress={() => this.props.delete_stax(data)}>
                                <Image source={assetsConfig.iconDeleteBlue24px} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>
        );
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