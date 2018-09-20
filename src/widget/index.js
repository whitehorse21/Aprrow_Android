import React, { Component } from 'react';
import {
    AsyncStorage, AppState, Animated, Easing, BackHandler,
    Platform, Text, Image, View, TextInput, ToastAndroid, TouchableOpacity} from 'react-native';
import device_style from '../styles/device.style';
import { Dialog } from 'react-native-simple-dialogs';
import widgets_style from '../styles/widgets_style';
import databasehelper from '../utils/databasehelper.js';
import ToastExample from '../nativemodules/Toast';
import commons from '../commons';
import uicommons from '../ui.commons';
import LoaderNew from '../utils/LoaderNew';
import Modal from 'react-native-modal';
import Touch from 'react-native-touch';
import Share from "react-native-share";

import { styles } from './index.style'

var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require("../config/AWSConfig.json");
var DeviceInfo = require('react-native-device-info');
var screen = "staxviewer"
var uiHelper = require('./ui.helper');
var orgDialogHelper = require('./organize.helper');
var searchDialogHelper = require('./search.helper');
var replicateHelper = require('./replicate.helper');
var selectDeviceHelper = require('./selectdevice.helper');
var selectStaxHelper = require('./selectstax.helper');
var slider = require('./slider.helper');
var devicesHelper = require('./devices.helper');
var renameDeviceDialog = require('./rename.device.dialog');
var createWidgetHelper = require('./create.dialog.helper');

export default class widgets extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dialogWidget_rename: false,
            device_name: "",
            position: 1,
            group_name: ["Most Frequent", "Most Frequent1", "Most Frequent2"],
            widgetdata: [],
            widgetid: "",
            Swiperbutton: true,
            swiperindex: 0,
            configstyle: 'flex',
            mostusedid: 0,
            loading: false,
            widgetVisible: false,
            mostFrequent_style: 'flex',
            dialogWidget_name: false,
            currentWidget: [],
            showorganiser: false,
            data: {},
            offlineFlag: false,

            order: [],
            needreload: false,
            curindex: 0,
            dialogWidget_delete: false,
            widget_to_delete: {},
            fullscreen: false,
            showsearchdialogue: false,
            widget_search_source: [],
            fullscrrenview: [],
            widgetName: '',
            devices: [],
            showdeviceoptions: false,
            choosendeviceid: "",
            choosen_device: {},
            replicatemodel: false,
            renamemodel: false,
            deletemodel: false,
            editing_device_index: "",
            editing_device_name: "",
            render_swiper: false,
            showaddoption: 'flex',
            valid: '#2699FB',
            insertmodel: false,
            searchtext: "",
            load_visible: false,
            select_stax_model: false,
            select_device_model: false,
            Stax_replicate: [],
            devices_temp_to_replicate: [],
            widget_index: 0,
            //devices_temp_to_replicate: [],
            appsdisplay: true,
            gotologinflow: false,
            feedWebView: '',
            openLink: '',
            feed: '1',
            WebViewHeight: '60%',
            FlatViewHeight: '40%',
            expandFeed: 'flex',
            compressFeed: 'none',
            loadedonce: false,
            setcurrentdevice: false,
            StaxNav: null,
            uri: '',
            appState: AppState.currentState,
            feedUrl: '',
            key: 1


        }
        this.delete_stax = this.delete_stax.bind(this)
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    OrganizeStax() {
        try {
            var tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Stax Organizer");
            });
        }
        catch (err) {
        }
        this.setState({ showorganiser: true });

    }
    serach_widget() {
        this.setState({ showsearchdialogue: true })
    }
    async device_list_to_replicate() {
        var deviceid = this.state.devices[this.state.editing_device_index].id;
        this.setState({ Stax_replicate: [] });
        var result = await databasehelper.getAllwidget(deviceid);

        var len = result.dataArray.length;
        var device_list = [];

        for (var i = 0; i < len; i++) {
            if (result.dataArray[i].mostusedwidget == 0 || result.dataArray[i].mostusedwidget == 4)
                continue;

            var dataObj = JSON.parse(JSON.stringify(result.dataArray[i]));
            dataObj["key"] = i + "";
            dataObj["checked"] = false;

            device_list.push(dataObj);
        }
        await this.setState({ Stax_replicate: device_list });
    }

    onClick_device(index) {

        var cur_to_rep = this.state.devices_temp_to_replicate;
        var status = cur_to_rep[index].checked;
        cur_to_rep[index].checked = !status;

        this.setState({ devices_temp_to_replicate: cur_to_rep });
    }

    onClick(index) {
        var cur_to_rep = this.state.Stax_replicate;
        var status = cur_to_rep[index].checked;
        cur_to_rep[index].checked = !status;

        this.setState({ Stax_replicate: cur_to_rep });

    }

    async updateLocaldb() {
        await commons.writelog(screen, "checking device updates start", commons.gettimestamp_log())
        var connectionstatus = await commons.isconnected();
        var username = await AsyncStorage.getItem("username");
        if (connectionstatus && username != commons.guestuserkey()) {

            let dObj = {};

            await commons.writelog(screen, "00_reading_lastup_time_device_sqllite", commons.gettimestamp_log())
            var maxtimeObj = await databasehelper.maxDeviceUpdatetime();
            var maxtime = maxtimeObj.updatetime;
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
                        // wObj[deviceList[i][deviceid]]={};
                    }
                }
            }
            await commons.writelog(screen, "02_done_devicelist_arrangement", commons.gettimestamp_log())

            var username = await AsyncStorage.getItem("username");
            await commons.writelog(screen, "03_fetching_updates_device", commons.gettimestamp_log())

            const resp = await fetch('' + AWSConfig.path + AWSConfig.stage + 'userdatamgnt', {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getUserDeviceList",
                    "TableName": "Users",
                    "username": username,
                    "maxtime": maxtime
                }),
            });

            try {
                responseJson = await resp.json();
                await commons.writelog(screen, "03_got response device", commons.gettimestamp_log())

                var devicedata = responseJson.device;
                var curdevice = await AsyncStorage.getItem("currentdeviceid");

                await commons.writelog(screen, "04_reading device response", commons.gettimestamp_log())
                var newdeviceArray = [];
                var updatedeviceArray = [];
                if (devicedata != null && devicedata.length > 0) {

                    for (let i = 0; i < devicedata.length; i++) {
                        var deviceid = devicedata[i].deviceid;
                        var createtime = devicedata[i].createtime;
                        if (dObj.hasOwnProperty(deviceid)) {
                            if (dObj[deviceid] < createtime) {
                                updatedeviceArray.push(devicedata[i])
                                if (devicedata[i].deleteflag == "1" && curdevice != null && curdevice == devicedata[i].deviceid)
                                    await AsyncStorage.removeItem("currentdeviceid");
                            }
                        }
                        else {
                            newdeviceArray.push(devicedata[i])
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

    async device_display() {

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


            if (this.state.choosendeviceid == "")
                await this.setState({ choosendeviceid: m.id, choosen_device: m });
        }

        if (len > 0)
            for (var i = 0; i < len; i++) {
                var deviceObj = {};
                var dataObj = result.dataArray[i];
                // deviceObj["key"] = i + "";
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
                    if (this.state.choosendeviceid == "") {
                        await this.setState({ choosendeviceid: dataObj.deviceid, choosen_device: dataObj });
                        this.props.setHeader(dataObj.devicename)
                    }
                }

                if (this.state.choosendeviceid == deviceObj.id)
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

        var deviceobj = this.state.choosen_device;
        if (deviceobj.hasOwnProperty("name")) {
            this.props.setHeader(deviceobj.name)
        }
        else if (deviceobj.hasOwnProperty("devicename")) {
            this.props.setHeader(deviceobj.devicename)

        }

        await this.setState({ devices: device_list });
        await commons.writelog(screen, "06_device_rendering_completed", commons.gettimestamp_log())

    }

    search(event) {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Search Stax");
            });
        } catch (err) {

        }

        var searchText = event;
        var data = this.state.widget_search_source;
        searchText = searchText.trim().toLowerCase();
        data = data.filter(l => {
            if (l.widgetname.toLowerCase().match(searchText))
                l["render"] = true;
            else
                l["render"] = false

            return true;
        });

        this.setState({
            widget_search_source: data,
            searchtext: event
        });
    }

    async scrollto(tg_index, feed, openLink) {
        var curr_index = this.state.curindex;
        this.refs.slidermain.scrollBy(tg_index - curr_index);
        try {
            if (feed != undefined) {
                await this.setState({ feed: feed });
            }
            if (openLink != undefined) {
                await this.setState({ openLink: openLink });
            }
        } catch (err) {
        }
    }
    componentWillMount() {
        AppState.addEventListener('change', () => this._handleAppStateChange());
    }
    webView = {
        canGoBack: false,
        ref: null,
    }
    async webViewGoBackRecursion() {
        if (this.state.feedUrl == this.state.openLink) {
            return true;
        } else {
            if (this.webView.canGoBack && this.webView) {
                this.webView.goBack();
                await this.webViewGoBackRecursion();
            }
        }
    }
    async handleBackButtonClick() {
        if (this.webView.canGoBack && this.webView) {
            if (this.state.feedUrl == this.state.openLink) {
                this.props.handleBackButtonClick("Stax");
                await uiHelper.resetWebViewToInitialUrl(this);
                return true;
            } else {
                await uiHelper.resetWebViewToInitialUrl(this);
                return true;
            }

        } else {
            uiHelper.resetWebViewToInitialUrl(this);
            this.props.handleBackButtonClick("Stax");
            return true;
        }
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        AppState.removeEventListener('change', () => this._handleAppStateChange());
    }
    _handleAppStateChange() {
        // https://facebook.github.io/react-native/docs/appstate.html
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
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Stax Viewer");
            });

        } catch (err) {

        }

        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.setState({ loadedonce: true });
        await commons.writelog(screen, "start", commons.gettimestamp_log());
        this.refs.loaderRef.show();
        try {
            var deviceid = await AsyncStorage.getItem("currentdeviceid");
            // this.updateLocaldb();
            await this.device_display();

            if (deviceid != null) {
                this.updateWidgetLocaldb(deviceid);

                await this.widget_display(deviceid);
                await this.MostFrequentWidgetFinder(deviceid, true);

                //ask permission if user denied
                const mostusedwidget_id = await AsyncStorage.getItem("mostusedwidgetid");
                var hasstatspermission = await ToastExample.checkappusagepermission();
                if (mostusedwidget_id != null && !hasstatspermission) {
                    // ToastExample.askpermission();
                }
            }
            else {
                this.setState({ showaddoption: 'none', configstyle: 'none' });
            }
        }
        catch (error) {
        }
        finally {
            this.refs.loaderRef.hide();
            await commons.writelog(screen, "end", commons.gettimestamp_log())
        }
    }
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

                global.applist = packagename_icon_mapping;
                AsyncStorage.setItem("appdata", JSON.stringify(packagename_icon_mapping));

                await this.updateAppICons();
            });
    }
    async updateAppICons() {
        var MainAppADataOb = this.state.widgetdata;
        var applist_obj = global.applist;

        for (var i = 0; i < MainAppADataOb.length; i++) {
            var subDataob = MainAppADataOb[i];
            for (var j = 0; j < subDataob.applist.length; j++) {
                if (applist_obj.hasOwnProperty(subDataob.applist[j].package)) {
                    MainAppADataOb[i].applist[j]["appname"] = applist_obj[subDataob.applist[j].package].applabel;
                    MainAppADataOb[i].applist[j]["icon"] = applist_obj[subDataob.applist[j].package].icon;
                }
                else {
                    MainAppADataOb[i].applist[j]["icon"] = commons.getIconUnavailable();  //dataobj.applist[j]["icon"]="data:image/png;base64,"
                }
                MainAppADataOb[i].applist[j]["key"] = j + "";
            }
            this.setState({ widgetdata: MainAppADataOb });
        }
    }
    async Repeat_ComponentDidMount(params) {
        if (params != undefined)
            await this.setState({ StaxNav: params });
        var deviceid_temp = this.state.choosendeviceid;
        if (deviceid_temp == null || deviceid_temp == "")
            deviceid_temp = "0"

        var newwidgets = await databasehelper.getwidget_count_in_device(deviceid_temp);;
        var newsize = newwidgets.count;
        hasnewdata = newsize - this.state.widgetdata.length == 0 ? false : true;
        if (this.state.loadedonce && !hasnewdata) {
            this.updateLocaldb();
            this.device_display();
            return;
        }

        this.refs.loaderRef.show();

        try {
            var deviceid = await AsyncStorage.getItem("currentdeviceid");
            this.updateLocaldb();
            await this.device_display();

            if (deviceid != null) {
                this.updateWidgetLocaldb(deviceid);

                await this.widget_display(deviceid);
                await this.MostFrequentWidgetFinder(deviceid, true);

                //ask permission if user denied
                const mostusedwidget_id = await AsyncStorage.getItem("mostusedwidgetid");
                var hasstatspermission = await ToastExample.checkappusagepermission();
                if (mostusedwidget_id != null && !hasstatspermission) {
                    // ToastExample.askpermission();
                }

                this.setState({ showaddoption: 'flex', select_stax_model: false, select_device_model: false });
            }
            else {
                this.setState({ showaddoption: 'none', configstyle: 'none' });
            }
        }
        catch (error) {
        }
        finally {
            this.refs.loaderRef.hide();
        }
    }

    luanchapp(packagename) {
        ToastExample.launchapp(packagename);
    }

    async delete_stax(item) {
        if (item.mostusedwidget == "0") {
            ToastAndroid.show("Can't delete Most Frequent Stax.", 3000);
        }
        else if (item.mostusedwidget == "4") {
            ToastAndroid.show("Can't delete Smart APRROW.", 3000);
        }
        else {
            await this.setState({ dialogWidget_delete: true, widget_to_delete: item })
        }
        // await this.setState({ dialogWidget_delete: true, widget_to_delete: item })
    }

    async delete_stax_execute(item) {
        //delete stax
        var sorkey_todelete = item.sorcekey;
        var currorder = this.state.order;

        var neworder = [];
        var MFW = await AsyncStorage.getItem("mostusedwidgetid");
        if (MFW == item.staxid) {
            await AsyncStorage.removeItem("mostusedwidgetid");
            this.setState({ mostFrequent_style: 'flex' });

        }

        var smartstaxid = await AsyncStorage.getItem("smartstaxid");
        if (smartstaxid == item.staxid) {
            await AsyncStorage.removeItem("smartstaxid");

        }
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Stax Organizer Delete");
            });
        } catch (err) {

        }
        for (var i = 0; i < currorder.length; i++) {
            if (currorder[i] != sorkey_todelete) {
                neworder.push(currorder[i]);
            }
        }

        if (this.state.widgetdata.length == 0) {
            this.setState({ configstyle: 'none', mostFrequent_style: 'flex' });
        }
        else {
            this.setState({ configstyle: 'flex' });
        }

        await this.setState({ order: neworder, needreload: true, dialogWidget_delete: false });
    }

    async  delete_device() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Delete Device");
            });
        } catch (err) {
        }
        this.refs.loaderRef.show();
        var currdevices = this.state.devices;
        var editing_index = this.state.editing_device_index;

        var choosendevice = this.state.choosendeviceid;
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
                this.setState({ showaddoption: 'none' });
            else
                this.setState({ showaddoption: 'flex' });


            await this.setState({ choosendeviceid: currdeviceid, choosen_device: device });
            await this.updateWidgetLocaldb(currdeviceid);
            await this.widget_display(currdeviceid);
            this.props.setHeader(name);

        }
        this.setState({ devices: currdevices, load_visible: false, deletemodel: false });
        this.refs.loaderRef.hide();
    }

    async device_insert() {

        //this.openDialog_d3(false);
        var curr_index = this.state.editing_device_index;
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
            var device = this.state.device_name;
            if (device.length <= 15 && device.length > 0) {
                // this.setState({ load_visible: true });
                this.refs.loaderRef.show();
                var device_id = await commons.getuuid();

                await AsyncStorage.setItem("currentdeviceid", device_id);
                await this.setState({ choosendeviceid: device_id });


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
                await this.widget_display(device_id);
                await this.MostFrequentWidgetFinder(device_id, true);

                //this.props.navigation.setParams({ devicename: device });
                this.props.setHeader(device);
                this.setState({ devices: curr_devices, choosen_device: currdeviceobj, insertmodel: false, valid: "#2699FB", device_name: "", load_visible: false });

                this.refs.loaderRef.hide();


            } else {
                this.setState({ valid: 'red' });
                this.refs.loaderRef.hide();
            }
        }
    }

    async  Renamedevice() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Rename Device");
            });
        } catch (err) {

        }

        var curr_devicedata = this.state.devices;
        var choosendeviceid = this.state.choosendeviceid;
        if (this.state.device_name.length <= 15) {
            curr_devicedata[this.state.editing_device_index].name = this.state.device_name;

            if (choosendeviceid == curr_devicedata[this.state.editing_device_index].id) {
                this.props.setHeader(this.state.device_name)
            }

            await this.setState({ devices: curr_devicedata });
            await this.setState({ valid: '#2699FB', device_name: "", renamemodel: false })
        }
        else {

            this.setState({ valid: 'red' });
        }
    }

    async replicate_device() {
        try {
            var tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Share with Other Devices");
            });
        }
        catch (err) {
        }

        this.refs.loaderRef.show();
        var stax_selected = [];

        // reading all selected stax
        for (var i = 0; i < this.state.Stax_replicate.length; i++) {
            if (this.state.Stax_replicate[i].checked)
                stax_selected.push(this.state.Stax_replicate[i]);
        }
        // reading selected devices
        var devices_selected = [];
        for (var i = 0; i < this.state.devices_temp_to_replicate.length; i++) {
            if (this.state.devices_temp_to_replicate[i].checked)
                devices_selected.push(this.state.devices_temp_to_replicate[i]);
        }

        var widgets_to_insert = [];
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

        this.refs.loaderRef.hide();
        this.setState({ select_device_model: false });
        this.Repeat_ComponentDidMount();

    }

    async share_widget() {
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

        var widgetdata = await databasehelper.getAllwidgetShare("'" + this.state.widgetid + "'");
        widgetArray = widgetdata.dataArray;

        if (widgetArray.length > 0 && commons.isimagevalid(widgetArray[0])) {
            var staxobj = widgetArray[0];
            var fileid = staxobj.fileid;
            var isfileuploaded = await databasehelper.is_file_uploaded(fileid)

            if (isfileuploaded == "0") {

                var res = await commons.upload_file_toS3(fileid, ".jpg");
                if (res)
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

        await fetch('' + AWSConfig.path + AWSConfig.stage + 'sharingfunction', {
            method: 'POST',
            headers: commons.getHeader(),
            body: JSON.stringify(req_obj),
        }).then((response) => response.json())
            .then(async () => {
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
                this.refs.loaderRef.hide();
                console.error(error);
            });
    }

    async  sharewidget() {
        try {
            var tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(tocken).then(() => {
                Mixpanel.default.track("Share with Friends");
            });
        }
        catch (err) {
        }
        var connectionstatus = await commons.isconnected();
        if (connectionstatus) {
            var username = await AsyncStorage.getItem("username");
            if (username == null || username == commons.guestuserkey()) {
                this.setState({ gotologinflow: true });
                return;
            }

            if (this.state.widgetid != "") {
                this.share_widget();
            }
            else {
                ToastAndroid.show("No Widgets Found", 500);
            }
        }
        else {
            this.setState({ offlineFlag: true });
        }
    }

    async shareApplist() {

        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotologinflow: true });
            return;
        }

        var currentdeviceid = await AsyncStorage.getItem("currentdeviceid");
        if (!this.state.appsdisplay)
            return;

        await this.setState({ appsdisplay: false })

        if (currentdeviceid == null) {
            ToastAndroid.show("Please Add Your Device", 3000);
            await this.setState({ appsdisplay: true })
        }

        else {
            var item = {};
            var devices = this.state.devices;
            for (var i = 0; i < devices.length; i++) {
                if (devices[i].id == this.state.choosendeviceid) {
                    item = devices[i];
                    break;
                }
            }

            const { navigate } = this.props.navigation;
            uiHelper.resetWebViewToInitialUrl(this);
            await navigate("SharedWidgetApplist", user = { item });
            setTimeout(() => { this.setState({ appsdisplay: true }) }, 2000);
        }

    }

    async showdevicemanagment() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Device");
            });
        } catch (err) {

        }
        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotologinflow: true });
            return;
        }
        this.setState({ showdeviceoptions: true });
    }
    async syncdata() {

        var username = await AsyncStorage.getItem("username");
        if (username == null || username == commons.guestuserkey()) {
            this.setState({ gotologinflow: true });
            return;
        }

        var isconnected = await commons.isconnected();
        if (isconnected) {

            try {
                this.refs.loaderRef.show();
                await this.updateLocaldb();
                await this.updateWidgetLocaldb(this.state.choosendeviceid);
                var result = await commons.syncdatatobackend();

                if (result == "SUCCESS") {
                    ToastAndroid.show("Syncing Completed", 500);
                    await this.device_display();
                    var devicename = "";
                    var deviceid = "0";
                    for (var i = 0; i < this.state.devices.length; i++) {
                        if (this.state.devices[i].id == this.state.choosendeviceid) {
                            devicename = this.state.devices[i].name;
                            deviceid = this.state.choosendeviceid;
                        }
                    }

                    await this.widget_display(deviceid);
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
            ToastAndroid.show("No network available.", 500);
        }
    }
    async updateWidgetLocaldb(deviceid) {
        await commons.writelog(screen, "update_check_stax", commons.gettimestamp_log())

        var connectionstatus = await commons.isconnected();
        var username = await AsyncStorage.getItem("username");

        if (connectionstatus && username != commons.guestuserkey()) {

            await commons.writelog(screen, "07_reading_stax_last_update_fromsqllite", commons.gettimestamp_log())

            let dObj = {};
            var maxtimeObj = await databasehelper.maxwidgetUpdatetime(deviceid);
            var maxtime = maxtimeObj.updatetime;
            if (maxtime == null)
                maxtime = "0";

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


            const resp = await fetch('' + AWSConfig.path + AWSConfig.stage + 'userdatamgnt', {
                method: 'POST',
                headers: commons.getHeader(),
                body: JSON.stringify({
                    "operation": "getUserWidgetList",
                    "TableName": "Users",
                    "username": username,
                    "maxtime": maxtime,
                    "deviceid": deviceid
                }),
            });

            try {

                const responseJson = await resp.json();
                await commons.writelog(screen, "08_recieved stax update response", commons.gettimestamp_log())
                var widgetdata = responseJson.widgets;

                await commons.writelog(screen, "09_reading stax update response", commons.gettimestamp_log())

                var newwidgetArray = [];
                var updatewidgetArray = [];
                if (widgetdata != null && widgetdata.length > 0) {

                    for (var i = 0; i < widgetdata.length; i++) {
                        var widgetid = widgetdata[i].widgetid;
                        var createtime = widgetdata[i].createtime;
                        if (dObj.hasOwnProperty(widgetid)) {
                            if (parseInt(dObj[widgetid]) < parseInt(createtime))
                                updatewidgetArray.push(widgetdata[i])
                        }
                        else {
                            newwidgetArray.push(widgetdata[i])
                        }
                    }
                }

                if (newwidgetArray.length > 0 || updatewidgetArray.length > 0) {
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
            catch (error) {
            }
        }
    }

    async widget_display(id) {
        await commons.writelog(screen, "10_start reading apps", commons.gettimestamp_log())

        var dow_widget_id = this.props.navigation.state.params.widget_id1;//anandu
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
            await this.setState({ curindex: 0, widgetid: resultArray[0].widgetid, widgetName: resultArray[0].widgetname, configstyle: 'flex' });
        else {
            await this.setState({ Swiperbutton: false, configstyle: 'none' });
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
                this.setState({ mostusedid: dataobj.widgetid });
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
                                dataobj["facebookLink"] = feedsList[k].Link;
                                dataobj["facebookView"] = 'flex';
                                dataobj["feedView"] = dataobj["facebook"];
                            }
                            if (feedsList[k].FeedsName == "instagram") {
                                dataobj["instagram"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["instagramFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["instagramLink"] = feedsList[k].Link;
                                dataobj["instagramView"] = 'flex';
                            }
                            if (feedsList[k].FeedsName == "twitter") {
                                dataobj["twitter"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["twitterFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["twitterLink"] = feedsList[k].Link;
                                dataobj["twitterView"] = 'flex';
                                //  this.setState({openLink:dataobj["twitter"]});
                            }
                            if (feedsList[k].FeedsName == "youtube") {
                                dataobj["youtube"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["youtubeFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["youtubeLink"] = "https://www.youtube.com/embed/+lastest?list=" + feedsList[k].Link;
                                dataobj["youtubeView"] = 'flex';
                                //  this.setState({openLink:dataobj["twitter"]});
                            }
                            if (feedsList[k].FeedsName == "pinterest") {
                                dataobj["pinterest"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["pinterest"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["pinterestLink"] = feedsList[k].Link;
                                dataobj["pinterestView"] = 'flex';

                                //  this.setState({openLink:dataobj["twitter"]});
                            }
                            if (feedsList[k].FeedsName == "donate") {

                                dataobj["donate"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["donateFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["donateLink"] = feedsList[k].Link;
                                dataobj["donateView"] = 'flex';
                                //  this.setState({openLink:dataobj["twitter"]});
                            }
                            if (feedsList[k].FeedsName == "website") {

                                dataobj["website"] = commons.getHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["websiteFull"] = commons.getFullHTML(feedsList[k].Link, feedsList[k].FeedsName);
                                dataobj["websiteLink"] = feedsList[k].Link;
                                dataobj["websiteView"] = 'flex';
                                //  this.setState({openLink:dataobj["twitter"]});
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

                if (applist_obj.hasOwnProperty(dataobj.applist[j].package)) {
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
                dataobj.backgroundpicture = uri; //+ "?time=" + commons.gettimestamp();// 
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

            //widget search data
            var widget_obj = {};
            widget_obj["widgetname"] = dataobj.widgetname;
            widget_obj["index"] = i;
            widget_obj["key"] = i;
            widget_obj["render"] = true;

            widget_search.push(widget_obj);
            widget_display_order.push(i);


        }
        try {
            if (result.dataArray[0].website != undefined) {
                await this.setState({ openLink: result.dataArray[0].facebookLink, feed: result.dataArray[0].facebookLink });
            } else if (result.dataArray[0].donate != undefined) {
                await this.setState({ openLink: result.dataArray[0].donateLink, feed: result.dataArray[0].donateLink });
            } else if (result.dataArray[0].instagram != undefined) {
                await this.setState({ openLink: result.dataArray[0].instagramLink, feed: result.dataArray[0].instagramLink });
            } else if (result.dataArray[0].pinterest != undefined) {
                await this.setState({ openLink: result.dataArray[0].pinterestLink, feed: result.dataArray[0].pinterestLink });
            } else if (result.dataArray[0].twitter != undefined) {
                await this.setState({ openLink: result.dataArray[0].twitterLink, feed: result.dataArray[0].twitterLink });
            } else if (result.dataArray[0].facebook != undefined) {
                await this.setState({ openLink: result.dataArray[0].facebookLink, feed: result.dataArray[0].facebookLink });
            }
        } catch (err) {

        }

        await commons.writelog(screen, "13_done_formated_stax_data", commons.gettimestamp_log())
        await commons.writelog(screen, "14_rendering_stax_", commons.gettimestamp_log())


        await this.setState({ widgetdata: [] });
        if (dataloop2.length > 0)
            await this.setState({ widget_index: d_index });

        await this.setState({ widgetdata: dataloop2, data: widget_data_source, order: widget_display_order, widget_search_source: widget_search });

        await commons.writelog(screen, "14_rendering_stax_completed", commons.gettimestamp_log())

        if (dataloop2.length > 0)
            this._indexChange(d_index);
    }
    async _indexChange(index) {
        this.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' })
        if (this.state.widgetdata[index].website != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].websiteLink, feed: this.state.widgetdata[index].websiteLink });
            uiHelper.resetWebViewToInitialUrl(this);
        } else if (this.state.widgetdata[index].donate != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].donateLink, feed: this.state.widgetdata[index].donateLink });
            uiHelper.resetWebViewToInitialUrl(this);
        } else if (this.state.widgetdata[index].instagram != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].instagramLink, feed: this.state.widgetdata[index].instagramLink });
            uiHelper.resetWebViewToInitialUrl(this);
        } else if (this.state.widgetdata[index].pinterest != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].pinterestLink, feed: this.state.widgetdata[index].pinterestLink });
            uiHelper.resetWebViewToInitialUrl(this);
        } else if (this.state.widgetdata[index].twitter != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].twitterLink, feed: this.state.widgetdata[index].twitterLink });
            uiHelper.resetWebViewToInitialUrl(this);
        } else if (this.state.widgetdata[index].facebook != undefined) {
            await this.setState({ openLink: this.state.widgetdata[index].facebookLink, feed: this.state.widgetdata[index].facebookLink });
            uiHelper.resetWebViewToInitialUrl(this);
        }
        this.setState({ widgetid: this.state.widgetdata[index].widgetid, currentWidget: this.state.widgetdata[index], curindex: index, widgetName: this.state.widgetdata[index].widgetname });
    }
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
                curindex = this.state.widgetdata.length - 1;
            else
                curindex = this.state.curindex;

            var item = {};
            item["staxid"] = this.state.data[this.state.order[curindex]].staxid
            item["staxname"] = "";
            item["sorcekey"] = this.state.order[curindex];

            await this.delete_stax_execute(item);
            await this.savestaxorder();
            return;
        }

        if (data != null) {
            var obj = JSON.parse(data);
            var new_stax = await AsyncStorage.getItem("newstax");

            var curindex = 0;
            if (new_stax != null)
                curindex = this.state.widgetdata.length - 1;
            else
                curindex = this.state.curindex;

            this.state.data[this.state.order[curindex]].staxname = obj.widgetname;
            this.state.widget_search_source[curindex].widgetname = obj.widgetname;

            this.state.widgetdata[curindex].headercolor = obj.headerbackgroundcolor;
            this.state.widgetdata[curindex].backgroundcolor = obj.widgetbackground;

            this.state.widgetdata[curindex].transperancy = obj.transperancyvalue;

            this.state.widgetdata[curindex].fontcolor = obj.apptextcolor;


            if (commons.isimagevalid(obj)) {
                var uri = await commons.getfile_uri(obj.fileid, '.jpg');
                this.state.widgetdata[curindex].backgroundpicture = uri; //+ "?time=" + commons.gettimestamp();// 
            }
            else {
                this.state.widgetdata[curindex].backgroundpicture = 'data:image/png;base64';
            }

            this.state.widgetdata[curindex].widgetname = obj.widgetname;
            this.state.widgetdata[curindex].WebView == 'none';

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
                this.state.widgetdata[curindex].applist = newapplist;
            }
            await this.setState({ widgetdata: this.state.widgetdata, data: this.state.data, widget_search_source: this.state.widget_search_source });
            if (new_stax != null)
                this.refs.slidermain.scrollBy(curindex - this.state.curindex);

            await AsyncStorage.removeItem("newstax");
            await AsyncStorage.removeItem("updatedata");
        }
    }

    async  editor_click() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Stax Edit CLick");
            });
        } catch (err) {

        }
        await AsyncStorage.removeItem("newstax");

        this.setState({ loading: true });
        var MFWidget = await AsyncStorage.getItem("mostusedwidgetid");
        var SmartStId = await AsyncStorage.getItem("smartstaxid");

        if (this.state.currentWidget.mostusedwidget == 2) {
            this.setState({ loading: false });
            ToastAndroid.show('Purchased Stax cannot be edited', 1000);
        }
        else if (this.state.mostusedid == this.state.widgetid) {
            uiHelper.resetWebViewToInitialUrl(this);
            const { navigate } = this.props.navigation;
            navigate("widgetseditor", { "widget_id": this.state.widgetid, "deviceid": this.state.choosendeviceid, "item": this.state.choosen_device, "widgetdata": this.state.widgetdata[this.state.curindex], "MFWidget": MFWidget, "SmartStId": SmartStId, onGoBack: () => this.refresh() });
        }
        else {
            uiHelper.resetWebViewToInitialUrl(this);
            const { navigate } = this.props.navigation;
            navigate("widgetseditor", { "widget_id": this.state.widgetid, "deviceid": this.state.choosendeviceid, "item": this.state.choosen_device, "widgetdata": this.state.widgetdata[this.state.curindex], "MFWidget": MFWidget, "SmartStId": SmartStId, onGoBack: () => this.refresh() });
            this.setState({ loading: false });
        }
    }

    async create_widgets() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Create Stax");
            });
        } catch (err) {

        }
        this.setState({ dialogWidget_name: false, loading: true });
        var widget_id = await commons.getuuid();
        var time = commons.gettimestamp();
        var widget_name = this.state.Widget_name;
        var deviceid = this.state.choosendeviceid;

        var applistArr = [];

        var applist = JSON.stringify(applistArr);
        var mostusedwidget = 1;

        if (widget_name.length <= 15 && widget_name.length > 0) {
            var result = await databasehelper.insertwidget(widget_id, widget_name, applist, time, mostusedwidget, deviceid);
            this.setState({ loading: false });
            if (result.results.rowsAffected > 0) {
                this.setState({
                    dialogWidget_name: false,
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

                var newindex = this.state.widgetdata.length;

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
                this.state.widget_search_source.push(searchlist_obj);


                this.state.order.push(newindex);

                this.state.widgetdata.push(widgetobj);
                await this.setState({ widgetdata: this.state.widgetdata, order: this.state.order, data: this.state.data, widget_search_source: this.state.widget_search_source });
                await AsyncStorage.setItem("newstax", "1");

                const { navigate } = this.props.navigation;
                navigate("widgetseditor", { "widget_id": widget_id, "deviceid": deviceid, onGoBack: () => this.refresh(), "item": this.state.choosen_device });
            }
            else {
                this.setState({ dialogWidget_name: true });
            }
        } else {
            this.setState({ loading: false });
            this.setState({ dialogWidget_name: true });
        }

    }
    async MostFrequentWidgetFinder(device_id, iscurrentdevice) {
        await commons.writelog(screen, "15_checking most used widget status", commons.gettimestamp_log())

        if (iscurrentdevice) {
            this.setState({ mostFrequent_style: 'flex' });
            var result = await databasehelper.getMostFrequentwidget(device_id);
            if (result.dataArray.length > 0)
                this.setState({ mostFrequent_style: 'none' });
        }
        else
            this.setState({ mostFrequent_style: 'none' });

        await commons.writelog(screen, "15_donechecking most used widgets", commons.gettimestamp_log())
    }

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
            var device_id = this.state.choosendeviceid;
            var widget_id = await commons.getuuid();
            await AsyncStorage.setItem('mostusedwidgetid', widget_id);
            var SmartFlag = await commons.checkSmartFlag();

            if (SmartFlag == true) {
                //--------------------------------start smart stax------------------------------------------------------------
                var connectionstatus = await commons.isconnected();
                var username = await AsyncStorage.getItem("username");

                if (username == null || username == commons.guestuserkey()) {// && this.state.widgetdata.length >= 5          
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
                    var smart_widget_id = await commons.getuuid();
                    var smart_applists = [];
                    if (connectionstatus) {
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


                        fetch('' + AWSConfig.path + AWSConfig.stage + 'smartstaxmgmt', {
                            method: 'POST',
                            headers: commons.getHeader(),
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
                                await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                    else {
                        await AsyncStorage.setItem('smartstaxid', smart_widget_id);
                    }
                }
                //-------------------------------- end smart stax ------------------------------------------------------------
            }
            this.setState({ loading: false });
            this.Repeat_ComponentDidMount();
        }
    }

    _renderRow = ({ data, active }) => {
        return <Row data={data} active={active} delete_stax={this.delete_stax} />
    }

    async change_stqx_order(neworder) {
        await this.setState({ order: neworder, needreload: true })
    }

    async savestaxorder() {
        try {
            var MixPanl_tocken = AWSConfig.mixpanel_token;
            Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                Mixpanel.default.track("Organize Stax");
            });
        } catch (err) {
        }

        if (this.state.needreload) {
            var new_widgetorder = [];
            var new_search_data = [];
            var order_stax_data = [];

            var current_order = this.state.order;
            var widget_source = this.state.data;


            var index_id_map = {};
            for (var i = 0; i < this.state.widgetdata.length; i++) {
                index_id_map[this.state.widgetdata[i].widgetid] = i;
            }
            for (var i = 0; i < current_order.length; i++) {
                var obj = {};
                obj["widgetid"] = widget_source[current_order[i]].staxid;
                obj["createtime"] = commons.gettimestamp();
                obj["displayorder"] = i;
                new_widgetorder.push(obj);

                var staxobj = this.state.widgetdata[index_id_map[widget_source[current_order[i]].staxid]];
                order_stax_data.push(staxobj);

                var searchlist_obj = {};
                searchlist_obj["widgetname"] = staxobj.widgetname;
                searchlist_obj["index"] = i;
                searchlist_obj["key"] = i;
                searchlist_obj["render"] = true;
                new_search_data.push(searchlist_obj);

            }
            await databasehelper.update_widget_orders(new_widgetorder);
            await this.setState({ widgetdata: [] });
            if (order_stax_data.length > 0)
                await this.setState({ widget_index: 0 });

            await this.setState({ widgetdata: order_stax_data });
            await this.setState({ showorganiser: false, widget_search_source: new_search_data, needreload: false });

            if (order_stax_data.length > 0)
                await this._indexChange(0);

            if (this.state.widgetdata.length == 0) {
                this.setState({ configstyle: 'none', mostFrequent_style: 'flex' });
            }
            else {
                this.setState({ configstyle: 'flex' });
            }
        }
        else {
            this.setState({ showorganiser: false })
        }
    }
    async deviceseselected(index) {
        var connectionstatus = await commons.isconnected();
        if (!connectionstatus && this.state.devices[index].currentdevice != 'flex') {
            this.setState({ offlineFlag: true });
            return;
        }

        await commons.writelog(screen, "16_switching device", commons.gettimestamp_log())

        var current_devicelist = this.state.devices;
        var curr_device = this.state.choosendeviceid;
        for (var i = 0; i < current_devicelist.length; i++) {
            if (current_devicelist[i].id == curr_device) {

                current_devicelist[i].fontcolor = "#757575";
                break;
            }
        }
        current_devicelist[index].fontcolor = "#2699FB"

        await this.setState({ choosendeviceid: current_devicelist[index].id, devices: current_devicelist, choosen_device: current_devicelist[index] });
        this.refs.loaderRef.show();
        var iscurrentdevice = false;
        if (current_devicelist[index].currentdevice == 'flex' && !current_devicelist[index].add_device)
            iscurrentdevice = true;
        if (current_devicelist[index].add_device) {
            this.setState({ showaddoption: 'none' });
        }
        else {
            this.setState({ showaddoption: 'flex' });
        }

        if (!current_devicelist[index].add_device)
            await this.updateWidgetLocaldb(current_devicelist[index].id);

        await this.widget_display(current_devicelist[index].id);
        await this.MostFrequentWidgetFinder(current_devicelist[index].id, iscurrentdevice);


        if (!current_devicelist[index].add_device)
            await this.setState({ showdeviceoptions: false });
        else
            await this.setState({ insertmodel: true, editing_device_index: index });

        this.props.setHeader(current_devicelist[index].name);
        this.refs.loaderRef.hide();

        await commons.writelog(screen, "16_doneswitching", commons.gettimestamp_log())
    }
    offlineFunc() {
        this.setState({ offlineFlag: false });
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {uicommons.offlineDialog(this)}
                <LoaderNew ref={"loaderRef"} />
                <View style={{ flex: 1, backgroundColor: "#ebebe0" }}>
                    <Dialog
                        visible={this.state.dialogWidget_delete}
                        onTouchOutside={() => this.setState({ dialogWidget_delete: false })}
                        animation='fade'>
                        <View >
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 5, fontFamily: 'Roboto', textAlign: 'center' }]}>Confirm delete Stax</Text>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontFamily: 'Roboto-Bold', textAlign: 'center' }]}>{this.state.widget_to_delete.staxname}</Text>

                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>CANCEL</Text>
                                <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={() => this.delete_stax_execute(this.state.widget_to_delete)}>OK</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Dialog visible={this.state.deletemodel}>
                        <View>
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 20, marginBottom: 30, fontFamily: 'Roboto-Bold', color: "#2699FB", alignSelf: "center" }]}>{this.state.editing_device_name}</Text>
                            <Text allowFontScaling={false} style={{ color: "#757575", fontSize: 16 }}>Are you sure you want to delete this device?</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontFamily: 'Roboto-Bold' }]} onPress={() => { this.setState({ deletemodel: false }) }}>CANCEL</Text>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontFamily: 'Roboto-Bold' }]} onPress={() => this.delete_device()}>DELETE</Text>
                            </View>
                        </View>
                    </Dialog>
                    {renameDeviceDialog.renderDialog(this)}

                    <Dialog visible={this.state.insertmodel}>
                        <View >
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '500', textAlign: 'center', fontSize: 20, color: "black" }]}>Enter the device name</Text>
                            <TextInput
                                style={[device_style.dialog_textinput, { borderColor: "#2699FB" }]}
                                autoCapitalize="none"
                                onChangeText={(device_name) => this.setState({ device_name })}
                                underlineColorAndroid="transparent"
                                maxLength={15}
                                value={this.state.device_name} />
                            <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10, color: this.state.valid }]}>Max 15 Characters</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontWeight: "500" }]} onPress={() => { this.setState({ insertmodel: false, valid: '#2699FB', device_name: "" }) }}>CANCEL</Text>
                                <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontWeight: "500" }]} onPress={() => this.device_insert()}>OK</Text>
                            </View>
                        </View>
                    </Dialog>
                    {replicateHelper.renderDialog(this)}
                    {selectStaxHelper.renderDialog(this)}
                    {selectDeviceHelper.renderDialog(this)}
                   
                    {uicommons.loginFlowDialog(this)}


                    <Modal
                        isVisible={this.state.fullscreen}
                        style={{ flex: 1, margin: 0 }}
                        backdropColor="#ebebe0"
                        presentationStyle="fullScreen"
                        transparent={false}
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        {this.state.fullscrrenview}
                    </Modal>
                    {orgDialogHelper.renderDialog(this)}
                    {devicesHelper.renderDialog(this)}
                    {searchDialogHelper.renderDialog(this)}
                    {commons.renderIf(this.state.widgetdata.length > 0,slider.renderDialog(this))}

                    <View style={[widgets_style.bottom_image_view, { left: 0, display: this.state.configstyle }]}>
                        <Touch timeout={3500} pointerEvents={'auto'} disabled={false} activeOpacity={0.7} onPress={() => this.editor_click()}>
                            <Image style={widgets_style.bottom_image} source={require("../assets/config_button.png")} />
                        </Touch>
                    </View>

                    <View style={[widgets_style.bottom_image_view, { right: 0, display: this.state.showaddoption }]}>
                        <TouchableOpacity onPress={async () => {
                            uiHelper.resetWebViewToInitialUrl(this);
                            var username = await AsyncStorage.getItem("username");
                            if ((username == null || username == commons.guestuserkey()) && this.state.widgetdata.length >= 5) {
                                this.setState({ gotologinflow: true });
                                return;
                            }
                            this.setState({ dialogWidget_name: true });
                        }}>
                            <Image style={[widgets_style.bottom_image]} source={require("../assets/add_button.png")} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Dialog
                    visible={this.state.dialogWidget_rename}
                    onTouchOutside={() => this.setState({ dialogWidget_rename: false })}
                    animation='bottom'>
                    <View >
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>Enter widget name</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            autoCapitalize="none"
                            onChangeText={(device_name) => this.setState({ device_name })}
                            value={this.state.device_name}
                            maxLength={15}
                            underlineColorAndroid="transparent" />
                        <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10 }]}>Max 15 Characters</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_rename: false }) }}>CANCEL</Text>
                            <Text allowFontScaling={false} style={device_style.dialog_btn_ok} onPress={console.log("ok pressed")}>OK</Text>
                        </View>
                    </View>
                </Dialog>
                <Modal
                    isVisible={this.state.widgetVisible}
                    style={device_style.bottomModal}
                    onBackdropPress={() => this.setState({ widgetVisible: false })}>
                    <View style={{ flexDirection: 'row', position: 'absolute', bottom: 210, right: 0, display: this.state.mostFrequent_style }}>
                        <View style={{ backgroundColor: 'white', height: 30, width: 120, margin: 18, borderRadius: 5, alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ marginTop: 3, fontFamily: 'Roboto-Bold', color: '#84AACE' }}>Most Frequent</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={this.MostFrequentWidget.bind(this)}>
                                <Image style={[widgets_style.bottom_image]} source={require("../assets/bt_add_most_frequent.png")} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', position: 'absolute', bottom: 140, right: 0 }}>
                        <View style={{ backgroundColor: 'white', height: 30, width: 120, margin: 18, borderRadius: 5, alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{ marginTop: 3, fontFamily: 'Roboto-Bold', color: '#84AACE' }}>Customized</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => this.setState({ dialogWidget_name: true })}>
                                <Image style={[widgets_style.bottom_image]} source={require("../assets/bt_add_customized.png")} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[widgets_style.bottom_image_view, { right: 0, bottom: 50 }]}>
                        <TouchableOpacity onPress={() => { this.setState({ widgetVisible: false }); }}>
                            <Image style={[widgets_style.bottom_image]} source={require("../assets/add_button.png")} />
                        </TouchableOpacity>
                    </View>
                </Modal>
                {createWidgetHelper.renderDialog(this)}
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
        const { data } = this.props;
        return (
            <Animated.View style={[
                styles.row,
                this._style,
                { backgroundColor: "white" }
            ]}>
                <View style={{ flex: 1, flexDirection: 'row', marginRight: 5, marginTop: 5, width: '100%', justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", marginLeft: 5 }}>
                        <Image style={{ height: 40, width: 40, }} source={require('../assets/icon_reorder_grey_24px.png')} />
                        <Text allowFontScaling={false} style={{ fontWeight: "300", fontSize: 16, color: "black", textAlign: 'center', marginLeft: 12, marginTop: 8 }}>{data.staxname}</Text>
                    </View>

                    {commons.renderIf((data.mostusedwidget != 0 && data.mostusedwidget != 4),
                        <View>
                            <TouchableOpacity onPress={() => this.props.delete_stax(data)}>
                                <Image source={require('../assets/icon_delete_blue_24px.png')} />
                            </TouchableOpacity>

                        </View>
                    )}
                </View>
            </Animated.View>
        );
    }
}