import React, { Component } from 'react';
import { AsyncStorage, BackHandler, FlatList, Text, Image, View, KeyboardAvoidingView, StatusBar, Dimensions, ScrollView, StyleSheet, TouchableOpacity, TextInput, Slider, ImageBackground, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import device_style from './styles/device.style';
import widgets_style from './styles/widgets_style';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import ToastExample from './nativemodules/Toast';
import CheckBox from 'react-native-check-box';
import { Dropdown } from 'react-native-material-dropdown';
import ModalDropdown from 'react-native-modal-dropdown';
import databasehelper from './utils/databasehelper.js';
import commons from './commons.js';
import LoaderNew from './utils/LoaderNew';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Share, { ShareSheet } from "react-native-share";
import ImagePicker1 from 'react-native-image-crop-picker';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var DeviceInfo = require('react-native-device-info');
var navWidgetId;
var navDeviceId;
var navItem;
var Mixpanel = require('react-native-mixpanel');
var awsData = require("./config/AWSConfig.json");
export default class widgeteditor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password: '',
            dialogWidgetRename: false,
            position: 1,
            applist: [],
            appListBack: [],
            selectedAppList: [],
            selectedAppsMap: {},
            widgetName: "",
            widgetNewName: "",
            widgetId: "9",
            deviceid: "",
            showsearch: false,
            expandAppPanel: false,
            currentBottomPanel: "default",
            headerBackgroundColor: "#1b4076",
            transperancyValue: 0,
            widgetBackground: "#ffffff",
            backgroundPicture: 'data:image/png;base64',
            editorBackup: {},
            loading: false,
            appMenuCollapsedDisplay: 'none',
            appTextColor: '#ffffff',
            appDataToDbNew: [],
            changingImage: false,
            editFlag: false,
            dialogWidgetBack: false,
            gotoLoginFlow: false,
            curFileId: "",
            offlineFlag: false,
            infoFlag: false,
            appBarFlag: true,
            MFandSSFlag: true,
            isTab:false
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let title = Strings.staxeditor_page_head;
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', fontFamily:'Roboto-Bold',fontWeight:'200', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        let headerTitleAllowFontScaling=false;
        let headerLeft = (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => params._dialogWidgetback()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginBottom: 1, marginLeft: 5 }} source={assetsConfig.iconArrowBack} />
                </TouchableOpacity>
            </View>
        );
        let headerRight = (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <TouchableOpacity onPress={() => params._WidgetRenameenable()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginLeft: 10, marginRight: 5, marginBottom: 1 }} source={assetsConfig.iconEditWhite} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => params._dialogWidgetenable()} >
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginRight: 5, marginLeft: 10, marginBottom: 1 }} source={assetsConfig.iconDeleteWhite} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => params._ShareFunc()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginLeft: 5, marginRight: 5, marginBottom: 1 }} source={assetsConfig.iconShareWhite} />
                </TouchableOpacity>
            </View>
        );
        return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerLeft ,headerTitleAllowFontScaling};
    };
    _handleSave = () => {
    }
/** 
*(Enables Stax Rename Dialogue
  >>Checks for smart stax, if it is not then move to dialogue enable )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    _WidgetRenameenable() {
        this.mixpanelTrack("Stax Renamed");
        var a = this.props.navigation.state.params.MFWidget;
        var SmartStId = this.props.navigation.state.params.SmartStId;
        if (this.state.MFandSSFlag) {
            ToastAndroid.show(Strings.staxeditor_rename_toast, 3000);
            //Smart Aprrow
        }
        else {
            this.setState({ dialogWidgetRename: true });
        }
    
    }
/** 
*(Enables the smart stax delete dialogue)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    _dialogWidgetenable = () => {
        this.mixpanelTrack("Stax Deleted");
        if (this.state.MFandSSFlag) {
            ToastAndroid.show(Strings.staxeditor_delete_toast, 3000);
             //Smart Aprrow
        }
        else {
            dialogWidget_delete: true,
                this.setState({ dialogWidget_delete: true });
        }
    }
/** 
*(Enables stax confirmation dialogue of back button)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    _dialogWidgetback = () => {
        this.mixpanelTrack("Back Button");
        this.setState({
            dialogWidgetBack: true,
        });
    }
    async setchangedbgpic() {
        await this.setState({ changingImage: true });
    }
    async mixpanelTrack(events)
     {
     try{
         var Mixpannel_tocken=awsData.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
             Mixpanel.default.track(events);
             });
        }catch(err){
       }
     }
/** 
*(Update db by new stax name)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/       
    async  renameWidget() {
        this.mixpanelTrack("Stax Renamed");
        this.mixpanelTrack("Stax Renamed :"+this.state.widgetName);
        var widgetNewNameTemp = this.state.widgetNewName;
        await databasehelper.updatewidget_rename(this.state.widgetId, this.state.widgetNewName, commons.gettimestamp());
        this.setState({
            widgetName: widgetNewNameTemp,
            dialogWidgetRename: false
        })
    }
 /** 
*(Update db by new stax name)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    _appShare = () => {
        const { navigate } = this.props.navigation;
        var widgetId = this.props.navigation.state.params.widget_id;
        var item = this.props.navigation.state.params.item;
        var flag = 1;
        navigate("Applist", user = { widgetId, flag, item });
    }
/** 
*(Share the current stax)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/       
    _ShareFunc = async () => {
        this.mixpanelTrack("Stax Editor Share");
        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
            var userName = await AsyncStorage.getItem("username");
            if (userName == null || userName == commons.guestuserkey()) {
                this.setState({ gotoLoginFlow: true }); //if guest user
                return;
            }
            this.shareWidget();
        }
        else {
            this.setState({ offlineFlag: true })
        }
    }
 /** 
*(creates share text and link and share through social media)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/       
    async shareWidget() {
        this.refs.loaderRef.show();
        var userData = await databasehelper.getuser();
        var firstName = "";
        var lastName = "";
        if (userData.res != null && userData.res.length > 0) {
            firstName = userData.res[0].firstname;
            lastName = userData.res[0].lastname;
        }
        var requestObj = {};
        requestObj["operation"] = "insertSharedList";
        var date = commons.gettimestamp();
        var uuid = await commons.getuuid()
        var userName = await AsyncStorage.getItem("username");
        var tranId = await commons.getuuid();
        var payLoad = {};
        var widgetData = await databasehelper.getAllwidgetShare("'" + this.state.widgetId + "'");
        widgetArray = widgetData.dataArray;
        payLoad["sharingid"] = uuid;
        payLoad["from"] = userName;
        payLoad["to"] = "";
        payLoad["status"] = "pending";
        payLoad["medium"] = "socialmedia";
        payLoad["transactionid"] = tranId;
        payLoad["senddate"] = date;
        payLoad["widget"] = widgetArray;
        payLoad["fromName"] = firstName + " " + lastName;
        requestObj["payload"] = payLoad;
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
            body: JSON.stringify(requestObj),
        }).then((response) => response.json())
            .then(async (responseJson) => {
                this.refs.loaderRef.hide();
                var options = shareOptions = {
                    title: "Share By",
                    message: "please click link to get your Stax",
                    url: "http://aprrow.net/#" + uuid,
                    subject: "Shared Stax" //  for email
                };
                Share.open(options);
            })
            .catch((error) => {
                this.refs.loaderRef.hide();
                console.error(error);
            });
    }
 /** 
*(Delete the widget and clear all data from front end)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/       
    async deleteWidget() {
        this.mixpanelTrack("Stax Deleted");
        this.mixpanelTrack("Stax Deleted :"+this.state.widgetName);
        var MFW = await AsyncStorage.getItem("mostusedwidgetid");
        if (MFW == this.state.widgetId) {
            await AsyncStorage.removeItem("mostusedwidgetid");
        }
        var smartStaxId = await AsyncStorage.getItem("smartstaxid");
        if (smartStaxId == this.state.widgetId) {
            await AsyncStorage.removeItem("smartstaxid");
        }
        var result = await databasehelper.updatewidget_delete(this.state.widgetId, commons.gettimestamp());
        if (result.results.rowsAffected > 0) {
            await AsyncStorage.setItem("deletewidget", "1");
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }
    }
/** 
*(toggle the aplist check box)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/      
    async expandapplistpanel1(item) {
        this.state.applist[item.key].checked = !this.state.applist[item.key].checked;
    }
/** 
*(Add the selected app to the stax)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/   
    async onClick(item, index) {
        this.setState({ editFlag: true });
        var applistTempObj = [];
        var selectedApps = this.state.selectedAppsMap
        if (selectedApps.hasOwnProperty(item.key)) {
            for (let i = 0; i < this.state.selectedAppList.length; i++) {
                if (this.state.selectedAppList[i].key != item.key)
                    applistTempObj.push(this.state.selectedAppList[i])
            }
            delete selectedApps[item.key];
        }
        else {
            applistTempObj = this.state.selectedAppList;
            applistTempObj.push(item);
            selectedApps[item.key] = "selected";
        }
        //update widget data in database
        var appDataToDB = [];
        for (var i = 0; i < applistTempObj.length; i++) {
            var data = {};
            data["package"] = applistTempObj[i].package;
            data["appname"] = applistTempObj[i].applabel;
            appDataToDB.push(data);
        }
        var currentApplist = this.state.applist;
        var checkedstatus = currentApplist[index].checked;
        currentApplist[index].checked = !checkedstatus;
        var sortedByCheckedState = [];
        for (var i = 0; i < currentApplist.length; i++) {
            if (currentApplist[i].checked)
                sortedByCheckedState.push(currentApplist[i]);
        }
        for (var i = 0; i < currentApplist.length; i++) {
            if (!currentApplist[i].checked)
                sortedByCheckedState.push(currentApplist[i]);
        }
        await this.setState({ applist: [] });
        await this.setState({ applist: sortedByCheckedState });
        await this.setState({
            selectedAppList: applistTempObj,
            selectedAppsMap: selectedApps,
            appDataToDbNew: appDataToDB
        })
    }
/** 
*(Save the stax and data to db on DONE button click)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/      
    async saveDoneBtn() {
        if (this.state.editFlag) {
            await databasehelper.updatewidget_applist(this.state.widgetId, JSON.stringify(this.state.appDataToDbNew), commons.gettimestamp());
        }
        var fileuuid = this.state.curFileId;
        if (this.state.changingImage) {
            fileuuid = await commons.getuuid();
        }
        await databasehelper.updatewidget_theme(this.state.widgetId, this.state.headerBackgroundColor, this.state.widgetBackground, this.state.transperancyValue, this.state.backgroundPicture, this.state.appTextColor, commons.gettimestamp(), fileuuid);
        if (this.state.changingImage && !commons.isremoteurl(this.state.backgroundPicture)) {
            var res = await commons.savefile(this.state.backgroundPicture, fileuuid, '.jpg');
            var res = await databasehelper.upsert_fileid(fileuuid);
            this.setState({ changingImage: false });
        }
        try {
            await ToastExample.updateHomeScreenWidgets();
        }
        catch (error) { }
        var updateObject = {};
        updateObject["headerbackgroundcolor"] = this.state.headerBackgroundColor;
        updateObject["widgetbackground"] = this.state.widgetBackground;
        updateObject["transperancyvalue"] = this.state.transperancyValue;
        updateObject["backgroundpicture"] = this.state.backgroundPicture;
        updateObject["apptextcolor"] = this.state.appTextColor;
        updateObject["fileid"] = fileuuid;
        updateObject["applist"] = JSON.stringify(this.state.appDataToDbNew);
        updateObject["editflag"] = this.state.editFlag == true ? "1" : "0";
        updateObject["widgetname"] = this.state.widgetName;
        var data = await AsyncStorage.setItem("updatedata", JSON.stringify(updateObject));
        var item = this.props.navigation.state.params.item;
        this.refs.loaderRef.hide();
        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();
    }
/** 
*(Fetch the data of stax from table)
*@param  :widgetId(ID of stax)     
*@return :object(stax details)
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/   
    async getwidget(widgetId) {
        var widgetData = await databasehelper.getwidget(widgetId)
        return widgetData.dataObj;
    }
/** 
*(navigate to stax viewer)
*@param  :widgetId(ID of stax)     
*@return :object(stax details)
*@created by    :dhi
*@modified by   :dhiD5
*@modified date :04/09/2018
*/    
    goWithoutSave() {
        var item = this.props.navigation.state.params.item;
        this.props.navigation.goBack();
    }
/** 
*(show search box in the app bar)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    showSearch() {
        this.setState({
            showsearch: true
        })
    }
/** 
*(Hides the search box in the app bar)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    hideSearch() {
        if (this.state.showsearch) {
            data = this.state.appListBack;
            var selectedApps = this.state.selectedAppsMap
            for (var i = 0; i < data.length; i++) {
                if (selectedApps.hasOwnProperty(data[i].key)) {
                    data[i].checked = true;
                }
                else {
                    data[i].checked = false;
                }
            }
            this.setState({
                applist: data
            });
        }
        this.setState({
            showsearch: false
        })
    }
/** 
*(Expands applist panel
  >>List app icon, name and checkbox )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    expandAppListPanel() {
        this.mixpanelTrack("Expand App Box");
        var selectedApps = this.state.selectedAppsMap
        data = this.state.appListBack;
        for (var i = 0; i < data.length; i++) {
            if (selectedApps.hasOwnProperty(data[i].key)) {
                data[i].checked = true;
            }
            else {
                data[i].checked = false;
            }
        }
        var sortedByCheckedState = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].checked)
                sortedByCheckedState.push(data[i]);
        }
        for (var i = 0; i < data.length; i++) {
            if (!data[i].checked)
                sortedByCheckedState.push(data[i]);
        }
        this.setState({
            applist: sortedByCheckedState,
            expandAppPanel: true
        })
    }
/** 
*(Hides the search box in the app bar)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    colapseAppListPanel() {
        var selectedApps = this.state.selectedAppsMap
        data = this.state.appListBack;
        for (var i = 0; i < data.length; i++) {
            if (selectedApps.hasOwnProperty(data[i].key)) {
                data[i].checked = true;
            }
            else {
                data[i].checked = false;
            }
        }
        var sortedByCheckedState = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].checked)
                sortedByCheckedState.push(data[i]);
        }
        for (var i = 0; i < data.length; i++) {
            if (!data[i].checked)
                sortedByCheckedState.push(data[i]);
        }
        this.setState({
            applist: sortedByCheckedState,
            expandAppPanel: false
        })
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
/** 
*(on back button click confirmation dialogue will show )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    async handleBackButtonClick() {
        this.setState({
            dialogWidgetBack: true,
        });
        return true;
    }
/** 
*(Opens gallery using ImagePicker)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    async imagePickerFromGallery() {
        ImagePicker1.openPicker({
            width: 280,
            height: 400,
            cropping: true
          }).then(image => {
                this.setState({
              backgroundPicture:image.path
            })
          }).catch(e => {
            console.log(e);
          });
    }
/** 
*(Opens Camera using ImagePicker)
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    async imagePickerFromCamera() {
        ImagePicker1.openCamera({
            width: 280,
            height: 400,
            cropping: true
          }).then(image => {
            this.setState({
                backgroundPicture:image.path
            })
          }).catch(e => {
            console.log(e);
          });
        }
    async componentDidMount() {
        this.mixpanelTrack("Stax Editor View");
        // We can only set the function after the component has been initialized
        var isTab=await DeviceInfo.isTablet();
        this.setState({isTab:isTab});
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // We can only set the function after the component has been initialized
        this.props.navigation.setParams({ _password: this._back_page });
        this.props.navigation.setParams({ _dialogWidgetback: this._dialogWidgetback.bind(this) });
        this.props.navigation.setParams({ _dialogWidgetenable: this._dialogWidgetenable.bind(this) });
        this.props.navigation.setParams({ _WidgetRenameenable: this._WidgetRenameenable.bind(this) });
        this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
        this.props.navigation.setParams({ _ShareFunc: this._ShareFunc.bind(this) });
        this.props.navigation.setParams({ _appShare: this._appShare.bind(this) });
        navWidgetId = this.props.navigation.state.params.widget_id;
        navDeviceId = this.props.navigation.state.params.deviceid;
        navItem = this.props.navigation.state.params.item;
        MFWidget = this.props.navigation.state.params.MFWidget;
        SmartStId = this.props.navigation.state.params.SmartStId;
        var userName = await AsyncStorage.getItem("username");
        var MFW1 = await AsyncStorage.getItem("mostusedwidgetid");
        var smartstaxid1 = await AsyncStorage.getItem("smartstaxid");
        if (navWidgetId == MFW1 || navWidgetId == smartstaxid1) {
            this.setState({ appBarFlag: false })
        }
        this.setState({ loading: true });
        this.refs.loaderRef.show();
        var curDeviceId = await AsyncStorage.getItem("currentdeviceid");
        var applist_fromdevice = {};
        if (curDeviceId != null && curDeviceId == navDeviceId) {
            applist_fromdevice = JSON.parse(JSON.stringify(global.applist));
        }
        else {
            var acceestoken = await commons.get_token();
            var awsData = require("./config/AWSConfig.json");
            var awsLamda = require("./config/AWSLamdaConfig.json");
            const response = await fetch('' + awsData.path + awsData.stage + awsLamda.deviceappoperations, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': acceestoken
                },
                body: JSON.stringify({ "operation": "getApplist", "deviceid": navDeviceId}),
            });
           const res = await response.json();
            for (var i = 0; i < res.length; i++) {
                let applabel = res[i].applabel;
                let packagename = res[i].package;
                let usage = res[i].usage;
                let icon = "";
                if (global.applist.hasOwnProperty(packagename))
                    icon = "file://" + global.applist[packagename].icon
                else
                    icon = commons.getIconUnavailable();
                var appobj = {};
                appobj["key"] = i + "";
                appobj["icon"] = icon;
                appobj["package"] = packagename;
                appobj["applabel"] = applabel;
                appobj["bgcolor"] = "white"
                appobj["usage"] = usage;
                applist_fromdevice[packagename] = appobj;
            }
        }
        var applistModifiedObject = []
        var widgetData = await databasehelper.getwidget(navWidgetId);///this.props.navigation.state.params.widgetData;// 
        widgetData = widgetData.dataObj;
        var selectedAppListFromDBmap = {};
        var selectedApps = widgetData.applist;
        var widgetName = widgetData.widgetname;
        this.mixpanelTrack("Stax Editor View :"+widgetName);
        if (widgetData.mostusedwidget == 1 || widgetData.mostusedwidget == 3 || widgetData.mostusedwidget==2) {
            this.setState({ appMenuCollapsedDisplay: 'flex', MFandSSFlag: false });
        }
        var headercolor = "#006BBD";
        if (widgetData.hasOwnProperty("headercolor") && widgetData["headercolor"] != null && widgetData["headercolor"] != "" && widgetData["headercolor"] != "undefined" && widgetData["headercolor"] != "null")
            headercolor = widgetData.headercolor;
        var backgroundcolor = "#ffffff"
        if (widgetData.hasOwnProperty("backgroundcolor") && widgetData["backgroundcolor"] != null && widgetData["backgroundcolor"] != "" && widgetData["backgroundcolor"] != "undefined" && widgetData["backgroundcolor"] != "null")
            backgroundcolor = widgetData.backgroundcolor;
        var transperancy = 0;
        if (widgetData.hasOwnProperty("transperancy") && widgetData["transperancy"] != null && widgetData["transperancy"] != "" && widgetData["transperancy"] != "undefined" && widgetData["transperancy"] != "null")
            transperancy = parseFloat(widgetData.transperancy);
        var backgroundPicture = 'data:image/png;base64';
        if (commons.isimagevalid(widgetData)) {
            //get background picture with file id
            this.setState({ curFileId: widgetData.fileid });
            var uri = await commons.getfile_uri(widgetData.fileid, '.jpg');
            backgroundPicture = uri;// + "?time=" + commons.gettimestamp();
        }
        var fontcolor = "black";
        if (widgetData.hasOwnProperty("fontcolor") && widgetData["fontcolor"] != null && widgetData["fontcolor"] != "" && widgetData["fontcolor"] != "undefined" && widgetData["fontcolor"] != "null")
            fontcolor = widgetData.fontcolor;
        var sel_app_index_mapping = {}
        var selc_app_arr = [];
        for (let i = 0; i < selectedApps.length; i++) {
            var selAppObj = {};
            let icon = commons.getIconUnavailable();
            let appname = selectedApps[i].appname;
            let apppackage = selectedApps[i].package;
            selAppObj["key"] = apppackage + "";
            selAppObj["icon"] = icon;
            selAppObj["package"] = apppackage;
            selAppObj["applabel"] = appname; //applabel;
            selAppObj["bgcolor"] = "white"
            selAppObj["checked"] = true;
            selAppObj["usage"] = 0;
            selAppObj["installed"] = true;
            selectedAppListFromDBmap[selectedApps[i].package] = selAppObj
            if (!applist_fromdevice.hasOwnProperty(apppackage)) {
                selAppObj["installed"] = false;
                applist_fromdevice[apppackage] = selAppObj;
            }
        }
        var k = 0;
        for (var app in applist_fromdevice) {
            let icon = "";
            if (applist_fromdevice[app].installed) {
                if (applist_fromdevice[app].icon.contains("data:image/png;base64")) {
                    icon = applist_fromdevice[app].icon;
                }
                else {
                    icon = "file://" + applist_fromdevice[app].icon;
                }
            }
            else {
                icon = applist_fromdevice[app].icon;
            }
            let applabel = applist_fromdevice[app].applabel;
            let packagename = applist_fromdevice[app].package;
            let usage = applist_fromdevice[app].usage;
            var appobj = {};
            appobj["key"] = k + "";
            appobj["icon"] = icon;
            appobj["package"] = packagename;
            appobj["applabel"] = applabel;
            appobj["bgcolor"] = "white"
            appobj["checked"] = false;
            appobj["usage"] = usage;
            if (selectedAppListFromDBmap.hasOwnProperty(packagename)) {
                appobj["checked"] = true;
                selc_app_arr.push(appobj)
                sel_app_index_mapping[k + ""] = "selected"
                delete selectedAppListFromDBmap[packagename];
            }
            applistModifiedObject.push(appobj);
            k++;
        }
        k = 0;
        for (var key in selectedAppListFromDBmap) {
            selc_app_arr.push(selectedAppListFromDBmap[key]);
        }
        //show checked apps on top
        applistModifiedObject.sort(function (a, b) {
            var prop = "checked";
            if (a[prop] > b[prop]) {
                return -1;
            } else if (a[prop] < b[prop]) {
                return 1;
            }
            return 0;
        })
        this.setState({
            applist: applistModifiedObject,
            appListBack: applistModifiedObject,
            selectedAppList: selc_app_arr,
            selectedAppsMap: sel_app_index_mapping,
            widgetName: widgetName,
            widgetNewName: widgetName,
            widgetId: navWidgetId,
            headerBackgroundColor: headercolor,
            transperancyValue: transperancy,
            widgetBackground: backgroundcolor,
            backgroundPicture: backgroundPicture,
            appTextColor: fontcolor
        });
        this.refs.loaderRef.hide();
    }
    _dialog_box() {
    }
    _password() {
        this.setState({ dialogWidget_password: false });
        this.setState({ dialogWidget_delete: true })
    }
    onscroll() {
    }
    _back_page() {
        const { goBack } = navigation;
        goBack();
    }
    _prev_page() {
        var item = navItem;
        commons.replaceScreen(this, 'widgets', user = { navDeviceId, item });
    }
    async componentWillUnmount() {
    }
/** 
*(Searches appname based on text)
*@param  :event(search text)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/  
    search(event) {
        this.mixpanelTrack("Apps Search");
        searchText = event;
        data = this.state.appListBack;
        searchText = searchText.trim().toLowerCase();
        data = data.filter(l => {
            return l.applabel.toLowerCase().match(searchText);
        });
        var selectedApps = this.state.selectedAppsMap
        for (var i = 0; i < data.length; i++) {
            if (selectedApps.hasOwnProperty(data[i].key)) {
                data[i].checked = true;
            }
            else {
                data[i].checked = false;
            }
        }
        this.setState({
            applist: data
        });
    }
/** 
*(Based on sort type passed, Sort the array of apps)
*@param  :index(Index of Sort Type),selectedsort(Name of sort type)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/
    onSelectSortType(index, selectedsort) {
        this.mixpanelTrack("Sort Apps");
        this.mixpanelTrack("Sort Apps :"+selectedsort);
        if (selectedsort == Strings.staxeditor_appmenu_dropdown_alphabetical) {
            var appListTemp = this.state.applist;
            appListTemp.sort(function (a, b) {
                var prop = "applabel";
                if (a[prop] > b[prop]) {
                    return 1;
                } else if (a[prop] < b[prop]) {
                    return -1;
                }
                return 0;
            })
            this.setState({
                applist: appListTemp
            });
        }
        if (selectedsort == Strings.staxeditor_appmenu_dropdown_usage) {
            var appListTemp = this.state.applist;
            appListTemp.sort(function (a, b) {
                var prop = "usage";
                if (a[prop] > b[prop]) {
                    return -1;
                } else if (a[prop] < b[prop]) {
                    return 1;
                }
                return 0;
            })
            this.setState({
                applist: appListTemp
            });
        }
    }
/** 
*(Based on color code, set the background color)
*@param  :color(key of color code)    
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    setWidgetBackgroundColor(color) {
        this.setState({
            widgetBackground: color
        })
    }
/** 
*(Based on color code, set the text color)
*@param  :color(key of color code)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    setTextColor(color) {
        this.setState({
            appTextColor: color
        })
    }
 /** 
*(Based on color code, set the header background color)
*@param  :color(key of color code)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    setHeaderBackgroundColor(color) {
        this.setState({
            headerBackgroundColor: color
        })
    }
/** 
*(Based on Value,do a functionality)
*@param  :color(key of color code)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/ 
    async chooseEditProperty(key) {
        switch (key) {
            case "cancel":  //Cancel all changes ans reset from backed up data
                var bacupeditor = this.state.editorBackup;
                this.setState({
                    currentBottomPanel: "default",
                    headerBackgroundColor: bacupeditor["headerbackgroundcolor"],
                    transperancyValue: bacupeditor["transperancyvalue"],
                    widgetBackground: bacupeditor["widgetbackground"],
                    backgroundPicture: bacupeditor["backgroundpicture"],
                    appTextColor: bacupeditor["fontcolor"]
                })
                break;
            case "apply": //Applies all changes to the stax
                this.setState({
                    editorBackup: {},
                    currentBottomPanel: "default"
                })
                break;
            case "transperancy"://backup the values,enables transperancy dialogue box 
                this.backupCurrentDesign();
                this.mixpanelTrack("Transparency");
                this.setState({
                    currentBottomPanel: "transperancy"
                })
                break;
            case "Headercolor"://backup the values,enables header color dialogue box
                this.backupCurrentDesign();
                this.mixpanelTrack("Heading Color");
                this.setState({
                    currentBottomPanel: "Headercolor"
                })
                break;
            case "widgetbackground"://backup the values,enables stax background dialogue box
                this.backupCurrentDesign();
                this.mixpanelTrack("Background Color");
                this.setState({
                    currentBottomPanel: "widgetbackground"
                })
                break;
            case "backgroundpicture"://backup the values,enables background picture dialogue box
                this.backupCurrentDesign();
                this.mixpanelTrack("Background Image");
                this.setState({
                    currentBottomPanel: "backgroundpicture"
                })
                break;
            case "textcolor":////backup the values,enables text color dialogue box
                this.backupCurrentDesign();
                this.mixpanelTrack("Font Color");
                this.setState({
                    currentBottomPanel: "textcolorPanel"
                })
                break;
            default:
                break;
        }
    }
/** 
*(Backup current stax values to 'backp' array )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    backupCurrentDesign() {
        var backp = {};
        backp["headerbackgroundcolor"] = this.state.headerBackgroundColor;
        backp["widgetbackground"] = this.state.widgetBackground;
        backp["transperancyvalue"] = this.state.transperancyValue
        backp["backgroundpicture"] = this.state.backgroundPicture;
        backp["fontcolor"] = this.state.appTextColor;
        this.setState({
            editorBackup: backp
        })
    }
/** 
*(On trasperancy value change, changes the transperancy of stax )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    transperancyChange(value) {
        var tempval = 255 - value;
        var currentBackgroundTemp = this.state.widgetBackground;
        if (currentBackgroundTemp.length > 6)
            currentBackgroundTemp = currentBackgroundTemp.substring(0, 7)
        var bg_in_hex = commons.componentToHex(tempval);
        console.log("treansperancy>>>>> " + bg_in_hex);
        currentBackgroundTemp += bg_in_hex;
        this.setState(() => {
            return {
                transperancyValue: parseFloat(value),
                widgetBackground: currentBackgroundTemp
            };
        });
    }
    _adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = '35%';
        style.height = '15%';
        return style;
    }
/** 
*(enables offline dialogue box )
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
        const { transperancyValue } = this.state;
        const colorvalues = [{ "key": "#ffffff" }, { "key": "#808080" }, { "key": "#e6f7ff" }, { "key": "#cce6ff" }, { "key": "#f0e6ff" }, { "key": "#f2e6ff" }, { "key": "#ffe6ff" }, { "key": "#ffebe6" }, { "key": "#fff2e6" }, { "key": "#ffffcc" }, { "key": "#ebfaeb" },
        { "key": "#d9d9d9" }, { "key": "#595959" }, { "key": "#80d4ff" }, { "key": "#66b3ff" }, { "key": "#944dff" }, { "key": "#a64dff" }, { "key": "#ff80ff" }, { "key": "#ffad99" }, { "key": "#ffcc99" }, { "key": "#ffff80" }, { "key": "#85e085" },
        { "key": "#b3b3b3" }, { "key": "#262626" }, { "key": "#00aaff" }, { "key": "#1a8cff" }, { "key": "#5c00e6" }, { "key": "#9933ff" }, { "key": "#e600e6" }, { "key": "#ff471a" }, { "key": "#ff6700" }, { "key": "#ffff4d" }, { "key": "#33cc33" }]
        return (
            <View style={{ flex: 1 }}>
                <LoaderNew ref={"loaderRef"} />
                <Dialog visible={this.state.infoFlag}
                    onTouchOutside={() => this.setState({ infoFlag: false })}
                    animation='fade'
                >
                    <View>
                        <TouchableOpacity onPress={() => {
                            this.setState({ infoFlag: false })
                        }}>
                            <Image source={assetsConfig.iconInfoBlueSmall} style={{ alignSelf: 'center', alignSelf: 'flex-end', width: 35, height: 35 }} />
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>{Strings.staxeditor_pop_head}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>{Strings.staxeditor_pop_title}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>{Strings.staxeditor_pop_title1}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}></Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>{Strings.staxeditor_pop_title2}</Text>
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
                <View style={{ flex: 1, marginTop: 20 }}>
                    <View style={{ width: '100%', height: '80%' }}>
                        <View style={[widgets_style.box_view1, { backgroundColor: this.state.widgetBackground,height:this.state.isTab==true?winheight*.60:winheight*.55,width:this.state.isTab==true?'72%':'68%'}]}>
                        <View style={[widgets_style.box_view_bar1, { backgroundColor: this.state.headerBackgroundColor, height: '8%'}]}>
                                    <View style={{ width: '10%', marginTop: 1, justifyContent: 'center' }}>
                                        <Image style={widgets_style.box_view_bar_icon} source={assetsConfig.sharpLogoSquareOrange} />
                                    </View>
                                    <View style={{ width: '80%', justifyContent: 'center' }}>
                                        <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{this.state.widgetName=="Most Frequent"?Strings.mostfrequent_stax:this.state.widgetName}</Text>
                                    </View>
                                    <View style={{ width: '10%' }}>
                                    </View>
                                </View>
                            <ImageBackground style={{ width: '100%', height: '100%' }}
                                source={{ uri: this.state.backgroundPicture }}
                                imageStyle={{ resizeMode: 'cover' }
                                }>
                                <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 3 }}
                                    data={this.state.selectedAppList}
                                    extraData={this.state}
                                    renderItem={({ item }) =>
                                        <View style={{ flexDirection: 'column', marginTop: '1%', flex: .25, alignItems: 'center' }}>
                                            <Image style={{ height: 40, width: 40, }} source={{ uri: item.icon }} />
                                            <Text allowFontScaling={false} style={{ width: 50, fontSize: 11, textAlign: 'center', color: this.state.appTextColor }} >{item.applabel}</Text>{/*numberOfLines={2}*/}
                                        </View>
                                    }
                                    numColumns={4}
                                />
                            </ImageBackground>
                        </View>
                        {/*expanded applistpanel  start*/}
                        <TouchableWithoutFeedback onPress={() => this.setState({ expandAppPanel: false })}>
                            <Modal
                                isVisible={this.state.expandAppPanel}
                                style={[device_style.bottomModal, { marginTop: 75 }]}
                                onBackdropPress={async () => { await this.setState({ expandAppPanel: false }) }}
                                swipeDirection="right"
                                animationIn='slideInRight'
                                animationOut='slideOutRight'
                            >
                                {commons.renderIf(this.state.expandAppPanel,
                                    < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-300} style={{ flex: 1 }}>
                                        <View style={[widgets_style.box_view2,{width:this.state.isTab==true?'60%':'50%'}]}>
                                            <TouchableOpacity onPress={() => this.colapseAppListPanel()} style={[widgets_style.box_view_bar2, { borderTopLeftRadius: 0 }]}>
                                                <View >
                                                    <Image style={widgets_style.box_view_bar_icon1} source={assetsConfig.arrowDouble} />
                                                </View>
                                                <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', paddingLeft: '18%' }}>
                                                    <Text allowFontScaling={false} style={[widgets_style.box_view_bar_text1]}>{Strings.staxeditor_menu_expand_head}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            {commons.renderIf(this.state.showsearch,
                                                <View style={{
                                                    width: '100%', flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'flex-end',
                                                    backgroundColor: '#ffffff',
                                                    borderWidth: 1,
                                                    borderRadius: 15,
                                                    borderColor: '#000000',
                                                    marginRight: -10,
                                                    height: 40,
                                                }}>
                                                    <TouchableOpacity onPress={() => this.hideSearch()}>
                                                        <Image
                                                            style={{
                                                                padding: 10,
                                                                margin: 5,
                                                                height: 25,
                                                                width: 25,
                                                                resizeMode: 'stretch',
                                                                alignItems: 'center'
                                                            }}
                                                            source={assetsConfig.tmpSearch}
                                                        />
                                                    </TouchableOpacity>
                                                    <TextInput
                                                        underlineColorAndroid="transparent"
                                                        style={{ width: '80%', backgroundColor: "white", padding: 5 }}
                                                        placeholder={Strings.staxeditor_placeholde_search}
                                                        onChangeText={this.search.bind(this)}
                                                    />
                                                </View>
                                            )}
                                            {commons.renderIf(!this.state.showsearch,
                                                <TouchableOpacity onPress={() => this.showSearch()}>
                                                    <View style={widgets_style.box_view_bar3}>
                                                        <Image style={widgets_style.box_view_bar_icon2} source={assetsConfig.iconSearchWhite} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                            <View style={widgets_style.box_view_line}>
                                            </View>
                                            <TouchableOpacity style={widgets_style.box_view_bar3}>
                                                <ModalDropdown options={[Strings.staxeditor_appmenu_dropdown_usage, Strings.staxeditor_appmenu_dropdown_alphabetical]}
                                                    textStyle={{ color: "#ffff", fontSize: 15,fontFamily:'Roboto'}}
                                                    allowFontScaling={false} 
                                                    defaultValue={Strings.staxeditor_menu_expand_sort}
                                                    adjustFrame={style => this._adjustFrame(style)}
                                                    onSelect={(idx, value) => this.onSelectSortType(idx, value)}
                                                    onDropdownWillShow={() => this.hideSearch()}
                                                    dropdownTextStyle={{ fontSize: 15, color: "black" }}
                                                    dropdownStyle={{ flex: 1, borderColor: "black", borderRadius: 5, alignItems: "center" }}
                                                />
                                                <View style={{ paddingLeft: '10%' }}>
                                                    <Image source={assetsConfig.arrowDown} style={{ height: 6, width: 9 }} />
                                                </View>
                                            </TouchableOpacity>
                                            <View style={widgets_style.box_view_line}>
                                            </View >
                                            <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: "white", width: 150 }}>
                                                <FlatList style={{ flex: 1 }}
                                                    data={this.state.applist}
                                                    extraData={this.state}
                                                    renderItem={({ item, index }) =>
                                                        <TouchableOpacity onPress={() => this.onClick(item, index)} style={{ flexDirection: 'row', marginTop: 10, marginLeft: 5 }}>
                                                            <Image style={{ height: 40, width: 40, }} source={{ uri: item.icon }} />
                                                            <Text allowFontScaling={false} style={{ width: 50, fontSize: 12, marginLeft: 5, marginRight: 5, marginTop: 5, textAlign: 'center', color: 'black' }} >{item.applabel}</Text>{/*numberOfLines={2}*/}
                                                            <CheckBox
                                                                onClick={() => this.onClick(item, index)}
                                                                isChecked={item.checked}
                                                                checkedImage={<Image source={assetsConfig.checked} style={{ width: 23, height: 23 }} />}
                                                                unCheckedImage={<Image source={assetsConfig.unChecked} style={{ width: 23, height: 23 }} />}
                                                            />
                                                        </TouchableOpacity>
                                                    }
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </KeyboardAvoidingView>
                                )}
                            </Modal>
                        </TouchableWithoutFeedback>
                        {/* colapsed master applist panel*/}
                        {commons.renderIf(!this.state.expandAppPanel,
                            <View style={[widgets_style.box_view2_colapsed, { display: this.state.appMenuCollapsedDisplay,width:this.state.isTab==true?'40%':'28%' }]}>
                                <TouchableOpacity onPress={() => this.expandAppListPanel()} style={[widgets_style.box_view_bar2, { width: 90, borderTopLeftRadius: 0 }]}>
                                    <View >
                                        <Image style={widgets_style.box_view_bar_icon1_colapsed} source={assetsConfig.arrowDouble} />
                                    </View>
                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text1_colaspsed}>{Strings.staxeditor_menu_expand_head}</Text>
                                </TouchableOpacity>
                                {commons.renderIf(this.state.showsearch,
                                    <View style={{
                                        width: '100%', flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                        backgroundColor: '#ffffff',
                                        borderWidth: 1,
                                        borderRadius: 15,
                                        borderColor: '#000000',
                                        marginRight: -10,
                                        height: 40,
                                    }}>
                                        <TouchableOpacity onPress={() => this.hideSearch()}>
                                            <Image
                                                style={{
                                                    padding: 10,
                                                    margin: 5,
                                                    height: 25,
                                                    width: 25,
                                                    resizeMode: 'stretch',
                                                    alignItems: 'center'
                                                }}
                                                source={assetsConfig.tmpSearch}
                                            />
                                        </TouchableOpacity>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            style={{ width: '80%', backgroundColor: "white", padding: 5 }}
                                            placeholder={Strings.staxeditor_placeholde_search}
                                            onChangeText={this.search.bind(this)}
                                        />
                                    </View>
                                )}
                                {commons.renderIf(!this.state.showsearch,
                                    <TouchableOpacity onPress={() => this.showSearch()}>
                                        <View style={[widgets_style.box_view_bar3, { width: 90 }]}>
                                            <Image style={{ width: 30, height: 30, marginRight: 5 }} source={assetsConfig.iconSearchWhite} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <View style={[widgets_style.box_view_line, { width: 90 }]}>
                                </View>
                                <View style={[widgets_style.box_view_bar3, { width: 90 }]}>
                                    <ModalDropdown options={[Strings.staxeditor_appmenu_dropdown_usage, Strings.staxeditor_appmenu_dropdown_alphabetical]}
                                        allowFontScaling={false}
                                        textStyle={{ color: "#ffff", fontSize: 12,fontFamily:'Roboto' }}
                                        defaultValue={Strings.staxeditor_menu_expand_sort}
                                        adjustFrame={style => this._adjustFrame(style)}
                                        onSelect={(idx, value) => this.onSelectSortType(idx, value)}
                                        onDropdownWillShow={() => this.hideSearch()}
                                        dropdownTextStyle={{ fontSize: 15, color: "black" }}
                                        dropdownStyle={{ flex: 1, borderColor: "black", borderRadius: 5, alignItems: "center" }}
                                    />
                                    <View style={{ paddingLeft: '10%' }}>
                                        <Image source={assetsConfig.arrowDown} style={{ height: 6, width: 9 }} />
                                    </View>
                                </View>
                                <View style={[widgets_style.box_view_line, { width: 90 }]}>
                                </View>
                                <FlatList style={{ flex: 1, width: 90, backgroundColor: "white" }}
                                    data={this.state.applist}
                                    extraData={this.state}
                                    renderItem={({ item, index }) =>
                                        <TouchableOpacity onPress={() => this.onClick(item, index)} style={{ flexDirection: 'row', marginTop: 10, marginLeft: 5 }}>
                                            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 5, marginRight: 3, alignItems: 'center' }}>
                                                <Image style={{ height: 40, width: 40, marginRight: '12%' }} source={{ uri: item.icon }} />
                                                <CheckBox
                                                    onClick={() => this.onClick(item, index)}
                                                    isChecked={item.checked}
                                                    checkedImage={<Image source={assetsConfig.checked} style={{ height: 19, width: 19 }} />}
                                                    unCheckedImage={<Image source={assetsConfig.unChecked} style={{ height: 19, width: 19 }} />}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    }
                                />
                            </View>
                        )}
                        {commons.renderIf(this.state.MFandSSFlag,
                            <View style={{ alignItems: 'flex-end', position: 'absolute', right: '9%', marginTop: '6%', height: '92%', width: "50%", backgroundColor: 'transparent', display: 'flex' }}>
                                <TouchableOpacity onPress={() => { this.setState({ infoFlag: true }) }}>
                                    <Image source={assetsConfig.iconInfoBlueSmall} style={{ height: 35, width: 35 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {/*applist panel expanded end*/}
                    {/*default bottom panel*/}
                    {commons.renderIf(this.state.currentBottomPanel == "default",
                        <View  style={{ flex: 1 }}>
                            <View style={[editor.bottom_view_main,{height:winheight*.15}]}>
                                <View style={{ flexDirection: 'row', height: '50%', alignItems: 'center' }}>
                                    <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseEditProperty("Headercolor")}>
                                        <View style={editor.bottom_view_sub}>
                                            <Image style={editor.bottom_view_img} source={assetsConfig.iconHeading} />
                                            <Text allowFontScaling={false} style={editor.bottom_view_text}>{Strings.staxeditor_bottom_head}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseEditProperty("widgetbackground")}>
                                        <View style={editor.bottom_view_sub}>
                                            <Image style={editor.bottom_view_img} source={assetsConfig.iconBackground} />
                                            <Text allowFontScaling={false} style={editor.bottom_view_text}>{Strings.staxeditor_bottom_back}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseEditProperty("backgroundpicture")}>
                                        <View style={editor.bottom_view_sub}>
                                            <Image style={editor.bottom_view_img} source={assetsConfig.iconPicture} />
                                            <Text allowFontScaling={false} style={editor.bottom_view_text}>{Strings.staxeditor_bottom_pic}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseEditProperty("transperancy")}>
                                        <View style={editor.bottom_view_sub}>
                                            <Image style={editor.bottom_view_img} source={assetsConfig.iconTransparency} />
                                            <Text allowFontScaling={false} style={editor.bottom_view_text}>{Strings.staxeditor_bottom_transparent}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseEditProperty("textcolor")}>
                                        <View style={editor.bottom_view_sub}>
                                            <Image style={editor.bottom_view_img} source={assetsConfig.icon_font} />
                                            <Text allowFontScaling={false} style={editor.bottom_view_text}>{Strings.staxeditor_bottom_font}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ height: '50%', width: '100%', backgroundColor: '#006BBD', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ height: '50%', width: '100%', backgroundColor: '#006BBD', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.saveDoneBtn()}
                                    >
                                        <Text allowFontScaling={false} style={{ fontSize: 18, color: '#ffffff', fontFamily: 'Roboto-Bold' }}>{Strings.staxeditor_bottom_button}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    {/* adjust transperancy panel*/}
                    {commons.renderIf(this.state.currentBottomPanel == "transperancy",
                        <View style={editor.bottom_popup}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                width: '100%',
                                marginTop: 5,
                                marginLeft: 5
                            }}>
                                <Text allowFontScaling={false} style={{
                                    fontSize: 15,
                                    textAlign: 'center'
                                }}>{String((Math.round((transperancyValue / 255) * 100)))}</Text>
                                <Slider
                                    step={1}
                                    minimumValue={0}
                                    maximumValue={255}
                                    onValueChange={this.transperancyChange.bind(this)}
                                    value={transperancyValue}
                                />
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    marginTop: 15
                                }}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("cancel")} style={{ color: "black", marginLeft: '35%' }}>{Strings.staxeditor_transparent_can}</Text>
                                        <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("apply")} style={{ color: "blue", marginLeft: '25%' }}>{Strings.staxeditor_transparent_app}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentBottomPanel == "Headercolor",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity activeOpacity={5} onPress={() => this.setHeaderBackgroundColor(item.key)}>
                                                <View style={{ width: winwidth / 11, height: winheight / 22, backgroundColor: item.key }}>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        numColumns={11}
                                    />
                                </View>
                            </ScrollView>
                            <View style={{
                                height: '15%',
                                flexDirection: 'row',
                                marginLeft: 5,
                                marginBottom: 10
                            }}>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("cancel")} style={{ color: "black", marginLeft: 0 }}>{Strings.staxeditor_transparent_can}</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("apply")} style={{ color: "blue", marginLeft: 80 }}>{Strings.staxeditor_transparent_app}</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentBottomPanel == "widgetbackground",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity onPress={() => this.setWidgetBackgroundColor(item.key)}>
                                                <View style={{ width: winwidth / 11, height: winheight / 22, backgroundColor: item.key }}>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        numColumns={11}
                                    />
                                </View>
                            </ScrollView>
                            <View style={{
                                flexDirection: 'row',
                                marginLeft: 5,
                                marginBottom: 10
                            }}>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("cancel")} style={{ color: "black", marginLeft: 10 }}>{Strings.staxeditor_transparent_can}</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("apply")} style={{ color: "blue", marginLeft: 70 }}>{Strings.staxeditor_transparent_app}</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentBottomPanel == "textcolorPanel",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity onPress={() => this.setTextColor(item.key)}>
                                                <View style={{ width: winwidth / 11, height: winheight / 22, backgroundColor: item.key }}>
                                                </View>
                                            </TouchableOpacity>
                                        }
                                        numColumns={11}
                                    />
                                </View>
                            </ScrollView>
                            <View style={{
                                flexDirection: 'row',
                                marginLeft: 5,
                                marginBottom: 10
                            }}>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("cancel")} style={{ color: "black", marginLeft: 10 }}>{Strings.staxeditor_transparent_can}</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("apply")} style={{ color: "blue", marginLeft: 70 }}>{Strings.staxeditor_transparent_app}</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentBottomPanel == "backgroundpicture",
                        <View style={[editor.bottom_popup]}>
                            <View style={{ flex: 1, flexDirection: "row", width: '100%', alignItems: "center", alignSelf: "center" }}>
                                <Text allowFontScaling={false} onPress={() => this.imagePickerFromGallery()} style={{ fontSize: 15, marginTop: 20, color: "green", alignContent: "center", marginLeft: '13%' }}>{Strings.staxeditor_photo_gal}</Text>
                                <Text allowFontScaling={false} onPress={() => this.imagePickerFromCamera()} style={{ fontSize: 15, marginTop: 20, color: "green", alignContent: "center", marginLeft: '13%' }}>{Strings.staxeditor_photo_cam}</Text>
                                <Text allowFontScaling={false} onPress={() => this.setState({ backgroundPicture: 'data:image/png;base64' })} style={{ fontSize: 15, marginTop: 20, color: "green", marginLeft: '13%' }}>{Strings.staxeditor_photo_rem}</Text>
                            </View>
                            <View style={{ flex: .5, flexDirection: "row" }}>
                                <Text allowFontScaling={false} onPress={() => this.chooseEditProperty("cancel")} style={{ fontSize: 15, color: "blue", marginLeft: '15%' }}>{Strings.staxeditor_transparent_can}</Text>
                                <Text allowFontScaling={false} onPress={() => {
                                    this.setchangedbgpic();
                                    this.chooseEditProperty("apply")
                                }
                                } style={{ fontSize: 15, color: "blue", marginLeft: '15%' }}>{Strings.staxeditor_transparent_app}</Text>
                            </View>
                        </View>
                    )}
                </View>
                {/* </Modal>*/}
                < Dialog
                    visible={this.state.dialogWidgetBack}
                    onTouchOutside={() => this.setState({ dialogWidgetRename: false })}
                    animation='fade'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontFamily: 'Roboto', textAlign: 'center' }]}>{Strings.staxeditor_save_title}</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontFamily: 'Roboto', textAlign: 'center' }]}>{Strings.staxeditor_save_title1}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.goWithoutSave() }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold'}}>{Strings.staxeditor_savebtn_no}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.saveDoneBtn()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold'}}>{Strings.staxeditor_savebtn_yes}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                < Dialog
                    visible={this.state.dialogWidgetRename}
                    onTouchOutside={() => this.setState({ dialogWidgetRename: false })}
                    animation='fade'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, color: 'black', fontWeight: '300', textAlign: 'center' }]}>{Strings.staxviewer_new_stax}</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            value={this.state.widgetNewName}
                            maxLength={15}
                            onChangeText={(widgetNewName) => this.setState({ widgetNewName })}
                        ></TextInput>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: '#5D89F6', fontSize: 12 }]}>{Strings.staxviewer_devicebox_maxchara}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidgetRename: false }) }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxeditor_button_can}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.renameWidget()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxeditor_button_rename}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    visible={this.state.dialogWidget_password}
                    onTouchOutside={() => this.setState({ dialogWidget_password: false })}
                    animation='fade'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>APPROW Password</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            value={this.state.password}
                            Password={true}
                            underlineColorAndroid="transparent"
                            onChangeText={(password) => this.setState({ password })}
                        ></TextInput>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_password: false }) }}>CANCEL</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this._password()}>OK</Text>
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    visible={this.state.dialogWidget_delete}
                    onTouchOutside={() => this.setState({ dialogWidget_delete: false })}
                    animation='fade'
                >
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontWeight: '300', textAlign: 'center' }]}>{Strings.staxeditor_delete_title}</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 10, fontFamily:'Roboto-Bold', textAlign: 'center' }]}>{this.state.widgetName} ?</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '45%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxeditor_delete_can}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.deleteWidget()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold' }}>{Strings.staxeditor_delete_del}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
            </View>
        );
    }
}




const editor = StyleSheet.create({
    bottom_view_main: {
        position: 'absolute',
        bottom: 0,
        flex: 1,
        backgroundColor: 'white',
        height: '82%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottom_view_sub:
        {
            flexDirection: 'column',
            marginTop: '5%',
            alignItems: 'center',
        }, bottom_view_text:
        {
            fontFamily: 'Roboto',
            fontSize: 10,
        },
        bottom_view_img: {
            height: 23,
             width: 17
      },
    bottom_view_touch: {
        width: '21%',
    },
    bottom_popup: {
        position: 'absolute',
        bottom: 0,
        flex: 1,
        backgroundColor: 'white',
        height: '20%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
});