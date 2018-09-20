import React, { Component } from 'react';
import { AsyncStorage, BackHandler, FlatList, Text, Image, View, KeyboardAvoidingView, Dimensions, ScrollView, TouchableOpacity, TextInput, Slider, ImageBackground, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import device_style from '../styles/device.style';
import widgets_style from '../styles/widgets_style';
import { Dialog } from 'react-native-simple-dialogs';
import ToastExample from '../nativemodules/Toast';
import CheckBox from 'react-native-check-box';
import ModalDropdown from 'react-native-modal-dropdown';
import databasehelper from '../utils/databasehelper';
import commons from '../commons';
import uicommons from '../ui.commons';
import LoaderNew from '../utils/LoaderNew';
//import Loader from './utils/Loader';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Share from "react-native-share";
import ImagePicker1 from 'react-native-image-crop-picker';

var DeviceInfo = require('react-native-device-info');
var nav_widgetid;
var nav_deviceid;
var nav_item;
var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require('../config/AWSConfig.json');

import { editor } from '../styles/widgetseditor.style'

export default class widgeteditor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password: '',
            dialogWidget_rename: false,
            device_name: 'Device 1',
            position: 1,
            group_name: ["Most Frequent", "Most Frequent1", "Most Frequent2"],
            applist_master: [],
            applist: [],
            applist_back: [],
            selectedapplist: [],
            selectedappsmap: {},
            widgetname: "",
            widgetnewname: "",
            widgetid: "9",
            deviceid: "",
            showsearch: false,
            expandapppanel: false,
            currentbottompanel: "default",
            headerbackgroundcolor: "#1b4076",
            transperancyvalue: 0,
            widgetbackground: "#ffffff",
            backgroundpicture: 'data:image/png;base64',
            editorbackup: {},
            loading: false,
            appmenucollapseddisplay: 'none',
            apptextcolor: '#ffffff',
            appdata_to_dbd_new: [],
            changingimage: false,
            editFlag: false,
            dialogWidget_back: false,
            gotologinflow: false,
            curfileid: "",
            offlineFlag: false,
            infoFlag: false,
            appBarFlag: true,
            MF_SS_flag: true,
            istab: false
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;

        let title = 'Stax Editor';
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '200', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        let headerTitleAllowFontScaling = false;
        let headerLeft = uicommons.headerLeft(params._dialogWidgetback);

        let headerRight = (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                {renderHeaderIcon(require("../assets/icon_edit_white.png"), () => params._WidgetRenameenable())}
                {renderHeaderIcon(require("../assets/icon_delete_white.png"), () => params._dialogWidgetenable())}
                {renderHeaderIcon(require("../assets/icon_share_white.png"), () => params._ShareFunc())}
            </View>
        );
        function renderHeaderIcon(icPath, pressCallback) {
            return (
                <TouchableOpacity onPress={pressCallback}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginLeft: 5, marginRight: 5, marginBottom: 1 }} source={icPath} />
                </TouchableOpacity>
            )
        }
        return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerLeft, headerTitleAllowFontScaling };
    };
    _handleSave = () => {
    }
    _WidgetRenameenable() {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Stax Editor Rename");
            });
        } catch (err) {

        }

        // widgetdata = widgetdata.dataObj;  
        if (this.state.MF_SS_flag) {
            ToastAndroid.show("Can't rename Smart Stax & Most Frequent Stax", 3000);
            //Smart Aprrow
        }
        else {
            this.setState({ dialogWidget_rename: true });
        }
    }
    _dialogWidgetenable = () => {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Delete Stax");
            });
        } catch (err) {

        }
        if (this.state.MF_SS_flag) {
            ToastAndroid.show("Can't delete Smart Stax & Most Frequent Stax", 3000);
            //Smart Aprrow
        }
        else {
            dialogWidget_delete: true,
                this.setState({ dialogWidget_delete: true });
        }

    }
    _dialogWidgetback = () => {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Back Button");
            });
        } catch (err) {

        }

        this.setState({
            dialogWidget_back: true,
        });
    }


    async setchangedbgpic() {
        await this.setState({ changingimage: true });
    }

    async  renamewidget() {
        var widgetnewnametemp = this.state.widgetnewname;
        await databasehelper.updatewidget_rename(this.state.widgetid, this.state.widgetnewname, commons.gettimestamp());

        this.setState({
            widgetname: widgetnewnametemp,
            dialogWidget_rename: false
        })
    }
    _appShare = () => {
        const { navigate } = this.props.navigation;
        var widgetid = this.props.navigation.state.params.widget_id;
        var item = this.props.navigation.state.params.item;
        var flag = 1;
        navigate("Applist", user = { widgetid, flag, item });
    }
    _ShareFunc = async () => {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Stax Editor Share");
            });
        } catch (err) {

        }

        var connectionstatus = await commons.isconnected();
        // alert(connectionstatus);
        if (connectionstatus) {
            var username = await AsyncStorage.getItem("username");
            if (username == null || username == commons.guestuserkey()) {
                this.setState({ gotologinflow: true });
                return;
            }
            this.share_widget();
        }
        else {
            this.setState({ offlineFlag: true })

        }
    }



    async share_widget() {

        //  this.setState({ loading: true });
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
        // var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
        var date = commons.gettimestamp();
        var uuid = await commons.getuuid()
        var username = await AsyncStorage.getItem("username");
        var tranid = await commons.getuuid();
        var payload = {};

        var widgetdata = await databasehelper.getAllwidgetShare("'" + this.state.widgetid + "'");
        widgetArray = widgetdata.dataArray;

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

        await fetch('' + AWSConfig.path + AWSConfig.stage + 'sharingfunction', {
            method: 'POST',
            headers: commons.getHeader(),
            body: JSON.stringify(req_obj),
        }).then((response) => response.json())
            .then(async () => {
                //alert(responseJson);
                //  this.setState({ loading: false });
                this.refs.loaderRef.hide();
                var options = shareOptions = {
                    title: "Share By",
                    message: "please click link to get your Stax",
                    url: "http://aprrow.net/#" + uuid,
                    subject: "Shared Stax" //  for email
                };
                Share.open(options);
            })
            .catch(() => {
                this.refs.loaderRef.hide();
            });
    }
    async deletewidget() {

        var MFW = await AsyncStorage.getItem("mostusedwidgetid");
        if (MFW == this.state.widgetid) {
            await AsyncStorage.removeItem("mostusedwidgetid");
        }
        var smartstaxid = await AsyncStorage.getItem("smartstaxid");
        if (smartstaxid == this.state.widgetid) {
            await AsyncStorage.removeItem("smartstaxid");
        }
        var result = await databasehelper.updatewidget_delete(this.state.widgetid, commons.gettimestamp());

        if (result.results.rowsAffected > 0) {
            await AsyncStorage.setItem("deletewidget", "1");
            this.props.navigation.state.params.onGoBack();
            this.props.navigation.goBack();
        }

    }
    async expandapplistpanel1(item) {
        this.state.applist[item.key].checked = !this.state.applist[item.key].checked;

        alert(this.state.applist[item.key].checked);
        //this.setState({applist[item.key].checked:!this.state.applist[item.key].checked});
    }

    async onClick(item, index) {
        this.setState({ editFlag: true });
        // this.state.applist[item.key].checked = false;//!this.state.applist[item.key].checked;

        var applist_temp = [];
        var selectedapps = this.state.selectedappsmap

        if (selectedapps.hasOwnProperty(item.key)) {

            for (let i = 0; i < this.state.selectedapplist.length; i++) {
                if (this.state.selectedapplist[i].key != item.key)
                    applist_temp.push(this.state.selectedapplist[i])
            }

            delete selectedapps[item.key];
        }
        else {
            applist_temp = this.state.selectedapplist;
            applist_temp.push(item);
            selectedapps[item.key] = "selected";
        }


        //update widget data in database
        var appdata_to_dbd = [];
        for (var i = 0; i < applist_temp.length; i++) {
            var data = {};

            data["package"] = applist_temp[i].package;
            data["appname"] = applist_temp[i].applabel;

            appdata_to_dbd.push(data);
        }
        // await databasehelper.updatewidget_applist(this.state.widgetid, JSON.stringify(appdata_to_dbd), commons.gettimestamp());

        var curr_applist = this.state.applist;

        var checkedstatus = curr_applist[index].checked;
        curr_applist[index].checked = !checkedstatus;

        var sorted_bycheckdestate = [];

        for (var i = 0; i < curr_applist.length; i++) {
            if (curr_applist[i].checked)
                sorted_bycheckdestate.push(curr_applist[i]);
        }
        for (var i = 0; i < curr_applist.length; i++) {
            if (!curr_applist[i].checked)
                sorted_bycheckdestate.push(curr_applist[i]);
        }



        await this.setState({ applist: [] });
        await this.setState({ applist: sorted_bycheckdestate });
        await this.setState({
            selectedapplist: applist_temp,
            selectedappsmap: selectedapps,
            appdata_to_dbd_new: appdata_to_dbd

        })
    }
    async save_DoneBtn() {
        if (this.state.editFlag) {
            await databasehelper.updatewidget_applist(this.state.widgetid, JSON.stringify(this.state.appdata_to_dbd_new), commons.gettimestamp());
        }

        var fileuuid = this.state.curfileid;
        if (this.state.changingimage) {
            fileuuid = await commons.getuuid();
        }

        await databasehelper.updatewidget_theme(this.state.widgetid, this.state.headerbackgroundcolor, this.state.widgetbackground, this.state.transperancyvalue, this.state.backgroundpicture, this.state.apptextcolor, commons.gettimestamp(), fileuuid);

        if (this.state.changingimage && !commons.isremoteurl(this.state.backgroundpicture)) {

            this.setState({ changingimage: false });
        }
        try {
            await ToastExample.updateHomeScreenWidgets();

        }
        catch (error) { }

        var updateobj = {};
        updateobj["headerbackgroundcolor"] = this.state.headerbackgroundcolor;
        updateobj["widgetbackground"] = this.state.widgetbackground;

        updateobj["transperancyvalue"] = this.state.transperancyvalue;

        updateobj["backgroundpicture"] = this.state.backgroundpicture;

        updateobj["apptextcolor"] = this.state.apptextcolor;
        updateobj["fileid"] = fileuuid;
        updateobj["applist"] = JSON.stringify(this.state.appdata_to_dbd_new);

        updateobj["editflag"] = this.state.editFlag == true ? "1" : "0";
        updateobj["widgetname"] = this.state.widgetname;


        this.refs.loaderRef.hide();

        this.props.navigation.state.params.onGoBack();
        this.props.navigation.goBack();

        // goBack();

    }

    async getwidget(widgetid) {
        var widgetdata = await databasehelper.getwidget(widgetid)
        return widgetdata.dataObj;
    }
    go_without_save() {
        this.refs.loaderRef.hide();
        this.props.navigation.goBack();
    }
    showsearch() {
        this.setState({
            showsearch: true
        })
    }
    hidesearch() {
        if (this.state.showsearch) {

            data = this.state.applist_back;
            var selectedapps = this.state.selectedappsmap
            for (var i = 0; i < data.length; i++) {
                if (selectedapps.hasOwnProperty(data[i].key)) {
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
    expandapplistpanel() {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Expand App Box");
            });
        } catch (err) {

        }

        var selectedapps = this.state.selectedappsmap
        data = this.state.applist_back;
        for (var i = 0; i < data.length; i++) {
            if (selectedapps.hasOwnProperty(data[i].key)) {
                data[i].checked = true;
            }
            else {
                data[i].checked = false;
            }
        }

        var sorted_bycheckdestate = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].checked)
                sorted_bycheckdestate.push(data[i]);
        }
        for (var i = 0; i < data.length; i++) {
            if (!data[i].checked)
                sorted_bycheckdestate.push(data[i]);
        }

        this.setState({
            applist: sorted_bycheckdestate,
            expandapppanel: true
        })
    }

    colapseapplistpanel() {
        var selectedapps = this.state.selectedappsmap
        data = this.state.applist_back;
        for (var i = 0; i < data.length; i++) {
            if (selectedapps.hasOwnProperty(data[i].key)) {
                data[i].checked = true;
            }
            else {
                data[i].checked = false;
            }
        }
        var sorted_bycheckdestate = [];

        for (var i = 0; i < data.length; i++) {
            if (data[i].checked)
                sorted_bycheckdestate.push(data[i]);
        }
        for (var i = 0; i < data.length; i++) {
            if (!data[i].checked)
                sorted_bycheckdestate.push(data[i]);
        }
        this.setState({
            applist: sorted_bycheckdestate,
            expandapppanel: false
        })

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    async handleBackButtonClick() {
        this.setState({
            dialogWidget_back: true,
        });
        return true;
    }
    async imagePickerFromGallery() {
        ImagePicker1.openPicker({
            width: 280,
            height: 400,
            cropping: true
        }).then(image => {
            this.setState({
                backgroundpicture: image.path
            })
        }).catch(e => {
            console.log(e);
        });
    }
    async imagePickerFromCamera() {
        ImagePicker1.openCamera({
            width: 280,
            height: 400,
            cropping: true
        }).then(image => {
            this.setState({
                backgroundpicture: image.path
            })
        }).catch(e => {
            console.log(e);
        });
    }

    async componentDidMount() {
        try {
            var tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Edit Icon");
            });
        } catch (err) {

        }
        // We can only set the function after the component has been initialized
        var istab = await DeviceInfo.isTablet();
        this.setState({ istab: istab });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // We can only set the function after the component has been initialized
        this.props.navigation.setParams({ _password: this._back_page });
        this.props.navigation.setParams({ _dialogWidgetback: this._dialogWidgetback.bind(this) });

        this.props.navigation.setParams({ _dialogWidgetenable: this._dialogWidgetenable.bind(this) });
        this.props.navigation.setParams({ _WidgetRenameenable: this._WidgetRenameenable.bind(this) });
        this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
        this.props.navigation.setParams({ _ShareFunc: this._ShareFunc.bind(this) });
        this.props.navigation.setParams({ _appShare: this._appShare.bind(this) });
        nav_widgetid = this.props.navigation.state.params.widget_id;
        nav_deviceid = this.props.navigation.state.params.deviceid;
        nav_item = this.props.navigation.state.params.item;
        MFWidget = this.props.navigation.state.params.MFWidget;
        SmartStId = this.props.navigation.state.params.SmartStId;


        var MFW1 = await AsyncStorage.getItem("mostusedwidgetid");
        var smartstaxid1 = await AsyncStorage.getItem("smartstaxid");

        if (nav_widgetid == MFW1 || nav_widgetid == smartstaxid1) {
            this.setState({ appBarFlag: false })
        }
        this.setState({ loading: true });
        this.refs.loaderRef.show();


        var curdeviceid = await AsyncStorage.getItem("currentdeviceid");
        var applist_fromdevice = {};
        if (curdeviceid != null && curdeviceid == nav_deviceid) {
            applist_fromdevice = JSON.parse(JSON.stringify(global.applist));
        }
        else {
            const response = await fetch('' + AWSConfig.path + AWSConfig.stage + 'deviceappoperations', {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({ "operation": "getApplist", "deviceid": nav_deviceid }),
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

        //JSON.parse(applist);
        var applist_modified = []
        var widgetdata = await databasehelper.getwidget(nav_widgetid);///this.props.navigation.state.params.widgetdata;// 
        widgetdata = widgetdata.dataObj;
        // alert(JSON.stringify(widgetdata));

        var selected_applist_fromdb_map = {};
        var selectedapps = widgetdata.applist;
        var widgetname = widgetdata.widgetname;
        if (widgetdata.mostusedwidget == 1 || widgetdata.mostusedwidget == 3) {
            this.setState({ appmenucollapseddisplay: 'flex', MF_SS_flag: false });
        }
        var headercolor = "#006BBD";
        if (widgetdata.hasOwnProperty("headercolor") && widgetdata["headercolor"] != null && widgetdata["headercolor"] != "" && widgetdata["headercolor"] != "undefined" && widgetdata["headercolor"] != "null")
            headercolor = widgetdata.headercolor;

        var backgroundcolor = "#ffffff"
        if (widgetdata.hasOwnProperty("backgroundcolor") && widgetdata["backgroundcolor"] != null && widgetdata["backgroundcolor"] != "" && widgetdata["backgroundcolor"] != "undefined" && widgetdata["backgroundcolor"] != "null")
            backgroundcolor = widgetdata.backgroundcolor;

        var transperancy = 0;
        if (widgetdata.hasOwnProperty("transperancy") && widgetdata["transperancy"] != null && widgetdata["transperancy"] != "" && widgetdata["transperancy"] != "undefined" && widgetdata["transperancy"] != "null")
            transperancy = parseFloat(widgetdata.transperancy);


        var backgroundpicture = 'data:image/png;base64';
        if (commons.isimagevalid(widgetdata)) {
            this.setState({ curfileid: widgetdata.fileid });
            var uri = await commons.getfile_uri(widgetdata.fileid, '.jpg');
            backgroundpicture = uri;// + "?time=" + commons.gettimestamp();
        }

        var fontcolor = "black";
        if (widgetdata.hasOwnProperty("fontcolor") && widgetdata["fontcolor"] != null && widgetdata["fontcolor"] != "" && widgetdata["fontcolor"] != "undefined" && widgetdata["fontcolor"] != "null")
            fontcolor = widgetdata.fontcolor;

        var sel_app_index_mapping = {}
        var selc_app_arr = [];

        for (let i = 0; i < selectedapps.length; i++) {

            var sel_app_obj = {};
            //let icon = "data:image/png;base64,";//temp base 64 icon update with generic icon
            let icon = commons.getIconUnavailable();
            let appname = selectedapps[i].appname;
            let apppackage = selectedapps[i].package;


            sel_app_obj["key"] = apppackage + "";
            sel_app_obj["icon"] = icon;
            sel_app_obj["package"] = apppackage;
            sel_app_obj["applabel"] = appname; //applabel;
            sel_app_obj["bgcolor"] = "white"
            sel_app_obj["checked"] = true;
            sel_app_obj["usage"] = 0;
            sel_app_obj["installed"] = true;

            selected_applist_fromdb_map[selectedapps[i].package] = sel_app_obj

            if (!applist_fromdevice.hasOwnProperty(apppackage)) {
                sel_app_obj["installed"] = false;
                applist_fromdevice[apppackage] = sel_app_obj;
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
            if (selected_applist_fromdb_map.hasOwnProperty(packagename)) {
                appobj["checked"] = true;
                selc_app_arr.push(appobj)
                sel_app_index_mapping[k + ""] = "selected"
                delete selected_applist_fromdb_map[packagename];
            }


            applist_modified.push(appobj);
            k++;
        }

        k = 0;
        for (var key in selected_applist_fromdb_map) {
            selc_app_arr.push(selected_applist_fromdb_map[key]);

        }
        //show checked apps on top

        applist_modified.sort(function (a, b) {
            var prop = "checked";
            if (a[prop] > b[prop]) {
                return -1;
            } else if (a[prop] < b[prop]) {
                return 1;
            }
            return 0;
        })

        this.setState({
            applist: applist_modified,
            applist_back: applist_modified,

            selectedapplist: selc_app_arr,
            selectedappsmap: sel_app_index_mapping,

            widgetname: widgetname,
            widgetnewname: widgetname,
            widgetid: nav_widgetid,

            headerbackgroundcolor: headercolor,
            transperancyvalue: transperancy,
            widgetbackground: backgroundcolor,
            backgroundpicture: backgroundpicture,
            apptextcolor: fontcolor

        });
        this.refs.loaderRef.hide();
    }
    _dialog_box() {
        // console.log("successfully");
    }
    _password() {
        this.setState({ dialogWidget_password: false });
        this.setState({ dialogWidget_delete: true })
    }
    onscroll() {
        // console.log(key);

    }
    _back_page() {
        const { goBack } = navigation;
        goBack();
    }
    _prev_page() {
        var item = nav_item;
        commons.replaceScreen(this, 'widgets', user = { nav_deviceid, item });
    }

    async componentWillUnmount() {
    }
    search(event) {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Apps Search");
            });
        } catch (err) {

        }
        searchText = event;
        data = this.state.applist_back;
        searchText = searchText.trim().toLowerCase();
        data = data.filter(l => {
            return l.applabel.toLowerCase().match(searchText);
        });


        var selectedapps = this.state.selectedappsmap

        for (var i = 0; i < data.length; i++) {
            if (selectedapps.hasOwnProperty(data[i].key)) {
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
    GetSortOrder(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }
    onselect_sorttype(selectedsort) {
        try {
            var MixPanl_tocken = aws_data11.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Apps Sort");
            });
        } catch (err) {

        }

        if (selectedsort == "Alphabetical") {
            var applisttemp = this.state.applist;
            applisttemp.sort(function (a, b) {
                var prop = "applabel";
                if (a[prop] > b[prop]) {
                    return 1;
                } else if (a[prop] < b[prop]) {
                    return -1;
                }
                return 0;
            })
            this.setState({
                applist: applisttemp
            });

        }

        if (selectedsort == "Usage") {
            var applisttemp = this.state.applist;
            applisttemp.sort(function (a, b) {
                var prop = "usage";
                if (a[prop] > b[prop]) {
                    return -1;
                } else if (a[prop] < b[prop]) {
                    return 1;
                }
                return 0;
            })
            this.setState({
                applist: applisttemp
            });
        }
    }

    setwidgetbackgroundcolor(color) {
        this.setState({
            widgetbackground: color
        })

    }

    settextcolor(color) {
        // alert('a'+color);
        this.setState({
            apptextcolor: color
        })
    }

    setheaderbackgroundcolor(color) {
        this.setState({
            headerbackgroundcolor: color
        })
    }
    saveChanges() {
        alert("");
    }

    async chooseeditproperty(key) {

        var MixPanl_tocken = aws_data11.mixpanel_token;
        switch (key) {
            case "cancel":

                var bacupeditor = this.state.editorbackup;
                this.setState({
                    currentbottompanel: "default",
                    headerbackgroundcolor: bacupeditor["headerbackgroundcolor"],
                    transperancyvalue: bacupeditor["transperancyvalue"],
                    widgetbackground: bacupeditor["widgetbackground"],
                    backgroundpicture: bacupeditor["backgroundpicture"],
                    apptextcolor: bacupeditor["fontcolor"]
                })
                break;
            case "apply":
                this.setState({
                    editorbackup: {},
                    currentbottompanel: "default"
                })
                break;
            case "transperancy":
                this._updateEditorProperty("Transparency", "transperancy");
                break;
            case "Headercolor":
                this._updateEditorProperty("Heading Color", "Headercolor");
                break;
            case "widgetbackground":
                this._updateEditorProperty("Background Color", "widgetbackground");
                break;
            case "backgroundpicture":
                this._updateEditorProperty("Background Image", "backgroundpicture");
                break;
            case "textcolor":
                this._updateEditorProperty("Font Color", "textcolorPanel");
                break;
            default:
                break;
        }
    }
    _updateEditorProperty(track, bottomPanel) {
        this.backupcurrentdesign();
        try {
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track(track);
            });
        } catch (err) {
        }
        this.setState({
            currentbottompanel: bottomPanel
        })
    }

    backupcurrentdesign() {
        var backp = {};
        backp["headerbackgroundcolor"] = this.state.headerbackgroundcolor;
        backp["widgetbackground"] = this.state.widgetbackground;
        backp["transperancyvalue"] = this.state.transperancyvalue
        backp["backgroundpicture"] = this.state.backgroundpicture;
        backp["fontcolor"] = this.state.apptextcolor;


        this.setState({
            editorbackup: backp
        })
    }

    selectedImage(response) {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        }
        else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
        }
        else {
            this.setState({
                backgroundpicture: 'file://' + response.path
            });
        }
    }

    setimagefrommysource(source) {
        const options = {
            quality: 1.0,
            maxWidth: 1080,
            maxHeight: 1920,
            noData: true,
            storageOptions: {
                skipBackup: true
            }
        };

        // Launch Camera:

        if (source == "camera") {
            ImagePicker.launchCamera(options, (response) => {
                this.selectedImage(response);
            });
        }
        if (source == "gallery") {
            ImagePicker.launchImageLibrary(options, (response) => {
                this.selectedImage(response);
            });
        }
    }

    transperancychange(value) {
        var tempval = 255 - value;
        var current_background = this.state.widgetbackground;
        if (current_background.length > 6)
            current_background = current_background.substring(0, 7)

        var bg_in_hex = commons.componentToHex(tempval);

        console.log("treansperancy>>>>> " + bg_in_hex);
        current_background += bg_in_hex;

        this.setState(() => {
            return {
                transperancyvalue: parseFloat(value),
                widgetbackground: current_background
            };
        });
    }


    _adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = '35%';
        style.height = '15%';


        return style;
    }
    offlineFunc() {
        this.setState({ offlineFlag: false });
    }

    renderTabItem(text, editorProperty, imgSrc) {
        return (
            <TouchableOpacity style={editor.bottom_view_touch} onPress={() => this.chooseeditproperty(editorProperty)}>
                <View style={editor.bottom_view_sub}>
                    <Image style={editor.bottom_view_img} source={imgSrc} />
                    <Text allowFontScaling={false} style={editor.bottom_view_text}>{text}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        var windowProp = Dimensions.get('window');
        var winheight = windowProp.height;
        var winwidth = windowProp.width;
        const { transperancyvalue } = this.state;
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

                            <Image source={require('../assets/icon_info_blue_small.png')} style={{ alignSelf: 'center', alignSelf: 'flex-end', width: 35, height: 35 }} />
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>Apps in this Stax are defined  </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>automatically based on your  </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>usage and cannot be edited. </Text>
                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}></Text>

                        <Text allowFontScaling={false} style={{ fontSize: 18, marginBottom: 5, textAlign: 'left' }}>You can personalize the Stax appearance</Text>
                    </View>
                </Dialog>
                <Dialog visible={this.state.offlineFlag}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={require('../assets/icon_offline_grey_40px.png')} style={{ alignSelf: 'center' }} />
                        <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>YOU ARE OFFLINE</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>This feature is only</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>available online</Text>


                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>

                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                {uicommons.loginFlowDialog}

                <View style={{ flex: 1, marginTop: 20 }}>
                    <View style={{ width: '100%', height: '80%' }}>

                        <View style={[widgets_style.box_view1, { backgroundColor: this.state.widgetbackground, height: this.state.istab == true ? winheight * .60 : winheight * .55, width: this.state.istab == true ? '72%' : '68%' }]}>
                            <View style={[widgets_style.box_view_bar1, { backgroundColor: this.state.headerbackgroundcolor, height: '8%' }]}>
                                <View style={{ width: '10%', marginTop: 1, justifyContent: 'center' }}>
                                    <Image style={widgets_style.box_view_bar_icon} source={require("../assets/sharp-logo_square_orange.png")} />
                                </View>
                                <View style={{ width: '80%', justifyContent: 'center' }}>
                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{this.state.widgetname}</Text>
                                </View>
                                <View style={{ width: '10%' }}>
                                </View>
                            </View>

                            <ImageBackground style={{ width: '100%', height: '100%' }}
                                source={{ uri: this.state.backgroundpicture }}
                                imageStyle={{ resizeMode: 'cover' }
                                }>
                                <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 3 }}
                                    data={this.state.selectedapplist}
                                    extraData={this.state}
                                    renderItem={({ item }) =>
                                        <View style={{ flexDirection: 'column', marginTop: '1%', flex: .25, alignItems: 'center' }}>
                                            <Image style={{ height: 40, width: 40, }} source={{ uri: item.icon }} />
                                            <Text allowFontScaling={false} style={{ width: 50, fontSize: 11, textAlign: 'center', color: this.state.apptextcolor }} >{item.applabel}</Text>{/*numberOfLines={2}*/}
                                        </View>
                                    }
                                    numColumns={4}
                                />
                            </ImageBackground>
                        </View>
                        <TouchableWithoutFeedback onPress={() => this.setState({ expandapppanel: false })}>
                            <Modal
                                isVisible={this.state.expandapppanel}
                                style={[device_style.bottomModal, { marginTop: 75 }]}
                                onBackdropPress={async () => { await this.setState({ expandapppanel: false }) }}
                                swipeDirection="right"
                                animationIn='slideInRight'
                                animationOut='slideOutRight'
                            >
                                {commons.renderIf(this.state.expandapppanel,
                                    < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-300} style={{ flex: 1 }}>
                                        <View style={[widgets_style.box_view2, { width: this.state.istab == true ? '60%' : '50%' }]}>
                                            <TouchableOpacity onPress={() => this.colapseapplistpanel()} style={[widgets_style.box_view_bar2, { borderTopLeftRadius: 0 }]}>
                                                <View >
                                                    <Image style={widgets_style.box_view_bar_icon1} source={require("../assets/arrow_double.png")} />
                                                </View>
                                                <View style={{ alignItems: 'center', justifyContent: 'center', alignContent: 'center', paddingLeft: '18%' }}>
                                                    <Text allowFontScaling={false} style={[widgets_style.box_view_bar_text1]}>Apps</Text>
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
                                                    <TouchableOpacity onPress={() => this.hidesearch()}>

                                                        <Image
                                                            style={{
                                                                padding: 10,
                                                                margin: 5,
                                                                height: 25,
                                                                width: 25,
                                                                resizeMode: 'stretch',
                                                                alignItems: 'center'
                                                            }}
                                                            source={require("../assets/tmp_search.png")}
                                                        />
                                                    </TouchableOpacity>

                                                    <TextInput
                                                        underlineColorAndroid="transparent"
                                                        style={{ width: '80%', backgroundColor: "white", padding: 5 }}
                                                        placeholder="Search"
                                                        onChangeText={this.search.bind(this)}
                                                    />
                                                </View>
                                            )}

                                            {commons.renderIf(!this.state.showsearch,
                                                <TouchableOpacity onPress={() => this.showsearch()}>
                                                    <View style={widgets_style.box_view_bar3}>
                                                        <Image style={widgets_style.box_view_bar_icon2} source={require("../assets/icon_search_white.png")} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                            <View style={widgets_style.box_view_line}></View>
                                            <TouchableOpacity style={widgets_style.box_view_bar3}>
                                                <ModalDropdown options={['Usage', 'Alphabetical']}
                                                    textStyle={{ color: "#ffff", fontSize: 15, fontFamily: 'Roboto' }}
                                                    allowFontScaling={false}
                                                    defaultValue="Sorting by"
                                                    adjustFrame={style => this._adjustFrame(style)}
                                                    onSelect={(idx, value) => this.onselect_sorttype(value)}
                                                    onDropdownWillShow={() => this.hidesearch()}
                                                    dropdownTextStyle={{ fontSize: 15, color: "black" }}
                                                    dropdownStyle={{ flex: 1, borderColor: "black", borderRadius: 5, alignItems: "center" }}
                                                />
                                                <View style={{ paddingLeft: '10%' }}>
                                                    <Image source={require("../assets/arrow_down.png")} style={{ height: 6, width: 9 }} />
                                                </View>
                                            </TouchableOpacity>
                                            <View style={widgets_style.box_view_line}></View >
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
                                                                checkedImage={<Image source={require("../assets/checked.png")} style={{ width: 23, height: 23 }} />}
                                                                unCheckedImage={<Image source={require("../assets/unchecked.png")} style={{ width: 23, height: 23 }} />}
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
                        {commons.renderIf(!this.state.expandapppanel,
                            <View style={[widgets_style.box_view2_colapsed, { display: this.state.appmenucollapseddisplay, width: this.state.istab == true ? '40%' : '28%' }]}>
                                <TouchableOpacity onPress={() => this.expandapplistpanel()} style={[widgets_style.box_view_bar2, { width: 90, borderTopLeftRadius: 0 }]}>
                                    <View >
                                        <Image style={widgets_style.box_view_bar_icon1_colapsed} source={require("../assets/arrow_double.png")} />
                                    </View>
                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text1_colaspsed}>Apps</Text>
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
                                        <TouchableOpacity onPress={() => this.hidesearch()}>
                                            <Image
                                                style={{
                                                    padding: 10,
                                                    margin: 5,
                                                    height: 25,
                                                    width: 25,
                                                    resizeMode: 'stretch',
                                                    alignItems: 'center'
                                                }}
                                                source={require("../assets/tmp_search.png")}
                                            />
                                        </TouchableOpacity>
                                        <TextInput
                                            underlineColorAndroid="transparent"
                                            style={{ width: '80%', backgroundColor: "white", padding: 5 }}
                                            placeholder="Search"
                                            onChangeText={this.search.bind(this)}
                                        />
                                    </View>
                                )}
                                {commons.renderIf(!this.state.showsearch,
                                    <TouchableOpacity onPress={() => this.showsearch()}>
                                        <View style={[widgets_style.box_view_bar3, { width: 90 }]}>
                                            <Image style={{ width: 30, height: 30, marginRight: 5 }} source={require("../assets/icon_search_white.png")} />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <View style={[widgets_style.box_view_line, { width: 90 }]}>
                                </View>
                                <View style={[widgets_style.box_view_bar3, { width: 90 }]}>
                                    <ModalDropdown options={['Usage', 'Alphabetical']}
                                        allowFontScaling={false}
                                        textStyle={{ color: "#ffff", fontSize: 12, fontFamily: 'Roboto' }}
                                        defaultValue="Sorting by"
                                        adjustFrame={style => this._adjustFrame(style)}
                                        onSelect={(idx, value) => this.onselect_sorttype(value)}
                                        onDropdownWillShow={() => this.hidesearch()}
                                        dropdownTextStyle={{ fontSize: 15, color: "black" }}
                                        dropdownStyle={{ flex: 1, borderColor: "black", borderRadius: 5, alignItems: "center" }}
                                    />
                                    <View style={{ paddingLeft: '10%' }}>
                                        <Image source={require("../assets/arrow_down.png")} style={{ height: 6, width: 9 }} />
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
                                                    checkedImage={<Image source={require("../assets/checked.png")} style={{ height: 19, width: 19 }} />}
                                                    unCheckedImage={<Image source={require("../assets/unchecked.png")} style={{ height: 19, width: 19 }} />}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    }
                                />
                            </View>
                        )}
                        {commons.renderIf(this.state.MF_SS_flag,
                            <View style={{ alignItems: 'flex-end', position: 'absolute', right: '9%', marginTop: '6%', height: '92%', width: "50%", backgroundColor: 'transparent', display: 'flex' }}>
                                <TouchableOpacity onPress={() => { this.setState({ infoFlag: true }) }}>
                                    <Image source={require("../assets/icon_info_blue_small.png")} style={{ height: 35, width: 35 }} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {commons.renderIf(this.state.currentbottompanel == "default",
                        <View style={{ flex: 1 }}>
                            <View style={[editor.bottom_view_main, { height: winheight * .15 }]}>
                                <View style={{ flexDirection: 'row', height: '50%', alignItems: 'center' }}>
                                    {this.renderTabItem("Heading", "Headercolor", require("../assets/icon_heading.png"))}
                                    {this.renderTabItem("Background", "widgetbackground", require("../assets/icon_background.png"))}
                                    {this.renderTabItem("Picture", "backgroundpicture", require("../assets/icon_picture.png"))}
                                    {this.renderTabItem("Transparency", "transperancy", require("../assets/icon_transparency.png"))}
                                    {this.renderTabItem("Font", "textcolor", require("../assets/icon_font.png"))}
                                </View>
                                <View style={{ height: '50%', width: '100%', backgroundColor: '#006BBD', justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ height: '50%', width: '100%', backgroundColor: '#006BBD', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.save_DoneBtn()}>
                                        <Text allowFontScaling={false} style={{ fontSize: 18, color: '#ffffff', fontFamily: 'Roboto-Bold' }}>DONE</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    {commons.renderIf(this.state.currentbottompanel == "transperancy",
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
                                }}>{String((Math.round((transperancyvalue / 255) * 100)))}</Text>
                                <Slider
                                    step={1}
                                    minimumValue={0}
                                    maximumValue={255}
                                    onValueChange={this.transperancychange.bind(this)}
                                    value={transperancyvalue}
                                />
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    marginTop: 15
                                }}>
                                    <View style={{ alignItems: "center", flexDirection: "row" }}>
                                        <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("cancel")} style={{ color: "black", marginLeft: '35%' }}>CANCEL</Text>
                                        <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("apply")} style={{ color: "blue", marginLeft: '25%' }}>APPLY</Text>
                                    </View>
                                </View>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentbottompanel == "Headercolor",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity activeOpacity={5} onPress={() => this.setheaderbackgroundcolor(item.key)}>
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
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("cancel")} style={{ color: "black", marginLeft: 0 }}>CANCEL</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("apply")} style={{ color: "blue", marginLeft: 80 }}>APPLY</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentbottompanel == "widgetbackground",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity onPress={() => this.setwidgetbackgroundcolor(item.key)}>
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
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("cancel")} style={{ color: "black", marginLeft: 10 }}>CANCEL</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("apply")} style={{ color: "blue", marginLeft: 70 }}>APPLY</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentbottompanel == "textcolorPanel",
                        <View style={[editor.bottom_popup, { height: '26%', paddingBottom: 0 }]}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                <View style={{ width: '100%', height: '85%', alignItems: "center" }}>
                                    <FlatList style={{ flex: 1 }}
                                        data={colorvalues}
                                        renderItem={({ item }) =>
                                            <TouchableOpacity onPress={() => this.settextcolor(item.key)}>
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
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("cancel")} style={{ color: "black", marginLeft: 10 }}>CANCEL</Text>
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("apply")} style={{ color: "blue", marginLeft: 70 }}>APPLY</Text>
                            </View>
                        </View>)}
                    {commons.renderIf(this.state.currentbottompanel == "backgroundpicture",
                        <View style={[editor.bottom_popup]}>
                            <View style={{ flex: 1, flexDirection: "row", width: '100%', alignItems: "center", alignSelf: "center" }}>
                                <Text allowFontScaling={false} onPress={() => this.imagePickerFromGallery()} style={{ fontSize: 15, marginTop: 20, color: "green", alignContent: "center", marginLeft: '13%' }}>GALLERY</Text>
                                <Text allowFontScaling={false} onPress={() => this.imagePickerFromCamera()} style={{ fontSize: 15, marginTop: 20, color: "green", alignContent: "center", marginLeft: '13%' }}>CAMERA</Text>
                                <Text allowFontScaling={false} onPress={() => this.setState({ backgroundpicture: 'data:image/png;base64' })} style={{ fontSize: 15, marginTop: 20, color: "green", marginLeft: '13%' }}>REMOVE</Text>

                            </View>
                            <View style={{ flex: .5, flexDirection: "row" }}>
                                <Text allowFontScaling={false} onPress={() => this.chooseeditproperty("cancel")} style={{ fontSize: 15, color: "blue", marginLeft: '15%' }}>CANCEL</Text>
                                <Text allowFontScaling={false} onPress={() => {
                                    this.setchangedbgpic();
                                    this.chooseeditproperty("apply")
                                }

                                } style={{ fontSize: 15, color: "blue", marginLeft: '15%' }}>APPLY</Text>
                            </View>
                        </View>
                    )}
                </View>
                {/* </Modal>*/}
                <Dialog
                    visible={this.state.dialogWidget_back}
                    onTouchOutside={() => this.setState({ dialogWidget_rename: false })}
                    animation='fade'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontFamily: 'Roboto', textAlign: 'center' }]}>Do you want to save</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontFamily: 'Roboto', textAlign: 'center' }]}>your changes?</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.go_without_save() }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>NO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.save_DoneBtn()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>YES</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    visible={this.state.dialogWidget_rename}
                    onTouchOutside={() => this.setState({ dialogWidget_rename: false })}
                    animation='fade'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, color: 'black', fontWeight: '300', textAlign: 'center' }]}>Enter STAX name</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            underlineColorAndroid="transparent"
                            value={this.state.widgetnewname}
                            maxLength={15}
                            onChangeText={(widgetnewname) => this.setState({ widgetnewname })} />
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: '#5D89F6', fontSize: 12 }]}>Max 15 Characters</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidget_rename: false }) }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.renamewidget()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>RENAME</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    visible={this.state.dialogWidget_password}
                    onTouchOutside={() => this.setState({ dialogWidget_password: false })}
                    animation='fade'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>APPROW Password</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            value={this.state.password}
                            Password={true}
                            underlineColorAndroid="transparent"
                            onChangeText={(password) => this.setState({ password })}/>

                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_password: false }) }}>CANCEL</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this._password()}>OK</Text>
                        </View>
                    </View>
                </Dialog>
                <Dialog
                    visible={this.state.dialogWidget_delete}
                    onTouchOutside={() => this.setState({ dialogWidget_delete: false })}
                    animation='fade'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 5, fontWeight: '300', textAlign: 'center' }]}>Confirm delete STAX</Text>
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { color: 'black', marginBottom: 10, fontFamily: 'Roboto-Bold', textAlign: 'center' }]}>{this.state.widgetname} ?</Text>

                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '45%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.deletewidget()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>DELETE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>

            </View>
        );
    }
}