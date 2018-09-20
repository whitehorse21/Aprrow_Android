import React, { Component } from 'react';
import { Text, TextInput, Image, View, TouchableOpacity, ToastAndroid, FlatList, AsyncStorage } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import Modal from 'react-native-modal';
import device_style from '../styles/device.style';
import SideMenu from 'react-native-side-menu';
import Menu from '../menu';
import databasehelper from '../utils/databasehelper';
import commons from '../commons';
import Loader from '../utils/Loader';
import { LoginManager } from 'react-native-fbsdk';
var DeviceInfo = require('react-native-device-info');

export default class device extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let title = 'Device';
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
        let headerTintColor = 'white';
        let headerLeft = (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => params.opendrawer()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginBottom: 1, marginLeft: 5 }} source={require("../assets/ic_menu_white_48px.png")} />
                </TouchableOpacity>
            </View>
        );

        return { title, headerStyle, headerTitleStyle, headerTintColor, headerLeft };
    };

    constructor(props) {
        super(props);
        this.state = {
            device_name: "",
            device_model: "",
            dialogVisible: false,
            dialogVisible_add: false,
            valid: '#1569C7',
            flag: -1,
            time: '',
            add: 'none',
            dlist: [],
            id: "",
            thisdevice: "",
            remote: 'flex',
            isOpen: false,
            loading: false,
        }
        debugger;
    }
    openDialog_d3(show) {
        this.setState({ showDialog_d3: show });
    }

    async componentDidMount() {
        // We can only set the function after the component has been initialized
        await this.updateLocaldb();
        this.props.navigation.setParams({ opendrawer: this.opendrawer.bind(this) });
        this.device_display();
    }

    opendrawer = () => {
        this.setState({ isOpen: !this.state.isOpen, });
    }

    //new functions to add swipemenu

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen });
    }

    onMenuItemSelected = async item => {
        this.setState({
            isOpen: false,
            selectedItem: item,
        });
        switch (item) {

            case "Home":
                // navigate("welcome", { screen: "welcome" });
                commons.reset(this, "welcome", {})
                break;
            case "Account":
                //navigate("account", { screen: "account" });
                commons.replacewithhomeandcurrent(this, 'account', {});
                break;

            case "Store":
                commons.replacewithhomeandcurrent(this, 'store_home', {});
                break;

            case "Notifications":
                commons.replacewithhomeandcurrent(this, 'Notifications', {});
                await AsyncStorage.removeItem("BadgeNo");
                break;

            case "Rewards":
                commons.replacewithhomeandcurrent(this, 'Rewards', {});
                break;

            case "logout":
                var isconnected = await commons.isconnected();
                if (isconnected) {
                    var result = await commons.syncdatatobackend();
                    if (result == "SUCCESS") {
                        commons.SNSNotification();
                        AsyncStorage.clear();
                        commons.stopallservice();
                        databasehelper.AllTableDelete();
                        commons.reset(this, "login", {});
                        LoginManager.logOut();
                    }
                    else {
                        ToastAndroid.show(JSON.stringify(result), 500);
                    }
                }
                else {
                    ToastAndroid.show("No network available.", 500);
                }
                break;

            default:
                break;

        }
    }

    async updateLocaldb() {
        //fetch device data for user
        //get current devices
        //check new devices and new devices to update
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
                    }
                }
            }
            var username = await AsyncStorage.getItem("username");
            fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'userdatamgnt', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
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
                    this.setState({ loading: false });
                    console.error(error);
                });
        }
    }

    async device_display() {
        this.welcomebox();
        this.setState({ loading: true });
        this.setState({ dlist: [] });
        var result = await databasehelper.getAlldevice();
        this.setState({ loading: false });
        var devicehardid = DeviceInfo.getUniqueID();
        this.state.len = result.dataArray.length;
        var len = this.state.len;
        var device_list = [];
        var count = 0;

        if (len > 0)
            for (var i = 0; i < len; i++) {
                var deviceObj = {};
                var dataObj = result.dataArray[i];
                deviceObj["key"] = i + "";
                deviceObj["name"] = dataObj.devicename;
                deviceObj["model"] = dataObj.devicemodel;
                deviceObj["id"] = dataObj.deviceid;
                deviceObj["hardid"] = dataObj.devicehardid;

                if ((dataObj.devicehardid) == devicehardid) {
                    deviceObj["thisdevice"] = "(this device)";
                    deviceObj["currentdevice"] = 0;
                }
                else {
                    deviceObj["currentdevice"] = 1;
                    deviceObj["thisdevice"] = "             ";
                    this.setState({ remote: 'none' });
                    count++;
                }
                if (count == 0)
                    this.setState({ remote: 'flex' });
                device_list.push(deviceObj);
            }
        else this.setState({ remote: 'flex' });
        this.setState({ dlist: device_list });
    }

    async device_insert() {
        this.setState({ loading: true });
        var devicehardid = DeviceInfo.getUniqueID();
        var model = DeviceInfo.getBrand() + " " + DeviceInfo.getModel();
        var device = this.state.device_name;
        if (device.length <= 15 && device.length > 0) {
            var device_id = await commons.getuuid();
            var time = commons.gettimestamp();

            var res = await databasehelper.insertdevice(device, device_id, time, devicehardid, model);
            await AsyncStorage.setItem("currentdeviceid", device_id);
            this.setState({ loading: false });
            if (res.results.rowsAffected > 0) {
                this.device_display();
                this.setState({ dialogVisible_add: false });
            }
        } else {
            this.setState({ valid: 'red' });
        }
    }
    async rename_click() {
        this.setState({ dialogVisible_rename: false, loading: true });
        if (this.state.device_name.length <= 15) {
            var time = commons.gettimestamp();
            var result = await databasehelper.updatedevice(this.state.device_name, this.state.flag, time);
            this.setState({ loading: false });
            if (result.results.rowsAffected > 0) {
                this.device_display();
            }
            else this.setState({ dialogVisible_delete: true });
        }
        else {

            this.setState({ valid: 'red', dialogVisible_delete: true });
        }

    }
    async devicedelete() {
        this.setState({ dialogVisible_delete: false });
        this.setState({ loading: true });
        var time = commons.gettimestamp();

        var result = await databasehelper.deletedevice(this.state.flag, time);
        await AsyncStorage.removeItem("currentdeviceid");
        this.setState({ loading: false });
        if (result.results.rowsAffected > 0) {
            this.device_display();
            //this.setState({ dialogVisible_delete: false });
        }
        else this.setState({ dialogVisible_delete: false });
    }

    async welcomebox() {
        this.setState({ loading: true });
        var devicehardid = DeviceInfo.getUniqueID();
        var result = await databasehelper.getdevice(devicehardid);

        var len = result.dataArray.length;
        this.setState({ loading: false });
        if (len <= 0) {
            this.setState({ add: 'flex' });
        }
        else this.setState({ add: 'none' });

        this.setState({ loading: false });
    }
    widget_flow(item) {
        this.setState({ loading: true });
        const { navigate } = this.props.navigation;
        navigate("widgets", user = { item });
        this.setState({ loading: false });
    }
    render() {
        const menu = <Menu onItemSelected={this.onMenuItemSelected} />;
        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={isOpen => this.updateMenuState(isOpen)}
            >

                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <Loader
                        loading={this.state.loading} />
                    <View pointerEvents="box-none" style={{ width: '100%', maxHeight: 50, justifyContent: 'center', alignItems: 'center', display: this.state.add }}>
                        <Image style={{ maxHeight: 50, left: 0 }} source={require("../assets/background_add_device.png")} />

                        <View style={{ flexDirection: 'row', position: 'absolute', top: 0, marginTop: 10 }}>
                            <TouchableOpacity onPress={() => this.setState({ dialogVisible_add: true, device_name: "" })}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image style={{ height: 50, width: 50 }} source={require("../assets/bt_add.png")} />
                                    <Text style={{ margin: 10, color: 'white', fontWeight: 'bold' }}>Add this device</Text>
                                    <Image style={{ height: 30, width: 15, marginTop: 5 }} source={require("../assets/icon_smartphone_white.png")} />
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                    <View style={device_style.device_head}>
                        <Text style={device_style.device_text}>Connected Devices</Text>
                        <View style={{ height: 1, width: '90%', marginRight: 20, marginLeft: 20, marginTop: 10, backgroundColor: "#b2babb" }}></View>
                    </View>
                    <View style={[device_style.device_manage, { marginTop: 10 }]}>
                        <Text style={{ color: "#b2babb", fontSize: 12, fontWeight: 'bold' }}>Select the device you want to manage</Text>
                    </View>
                    <View style={{ marginTop: 30, height: '60%' }}>

                        <FlatList style={{ flex: 1 }}
                            data={this.state.dlist}
                            extraData={this.state}
                            renderItem={({ item }) =>

                                <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ width: '20%' }}>
                                        <TouchableOpacity onPress={() => this.widget_flow(item)}>
                                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 25, height: 45 }} source={require('../assets/smartphone_android.png')} />
                                                <Text numberOfLines={1} style={{ fontSize: 14, color: "#6F9BE1", fontWeight: '300' }} >{item.thisdevice}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '60%' }}>
                                        <TouchableOpacity onPress={() => this.widget_flow(item)}>
                                            <View style={{ flexDirection: 'column' }}>
                                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{item.name}</Text>
                                                <Text style={[{ fontSize: 12 }, device_style.device_text]}>{item.model}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '20%' }}>
                                        <View style={{ flexDirection: 'row', marginTop: 10 }} >
                                            <Image style={{ width: 15, height: 20 }} source={require('../assets/icon_android_green.png')} />
                                            <TouchableOpacity onPress={() => this.setState({ flag: item.id, device_name: item.name, dialogVisible: true, device_model: item.model })}>
                                                <Image style={{ width: 10, height: 20, marginLeft: 10 }} source={require('../assets/icon_more_vert.png')} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                    <View style={[device_style.device_approw_text, device_style.device_manage, { width: '100%' }]}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: "#FF4500", textAlign: 'center', display: this.state.remote }}>Install Approw in other devices to manage them remotely</Text>
                    </View>

                    <Modal
                        isVisible={this.state.dialogVisible}
                        style={device_style.bottomModal}
                        onBackdropPress={() => this.setState({ dialogVisible: false })}
                    >
                        <View style={{ backgroundColor: 'white' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image style={{ margin: 10, width: 25, height: 50 }} source={require('../assets/smartphone_android.png')} />
                                <View style={{ flexDirection: 'column', marginLeft: 10, marginRight: 30, marginTop: 15 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '300' }}>{this.state.device_name}</Text>
                                    <Text style={[{ fontSize: 10 }, device_style.device_text]}>{this.state.device_model}</Text>
                                    <Text style={device_style.device_text}>
                                        ___________________________________
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <Image style={{ margin: 10, width: 15, height: 20 }} source={require('../assets/icon_edit.png')} />
                                <Text onPress={() => this.setState({ dialogVisible_rename: true, dialogVisible: false })} style={[device_style.device_text, { marginTop: 10, marginLeft: 20 }]}>Rename</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <Image style={{ margin: 10, width: 15, height: 20 }} source={require('../assets/icon_delete.png')} />
                                <Text onPress={() => this.setState({ dialogVisible_delete: true, dialogVisible: false })} style={[device_style.device_text, { marginTop: 10, marginLeft: 20 }]}>Delete</Text>
                            </View>
                        </View>
                    </Modal>

                    <Dialog
                        visible={this.state.dialogVisible_rename}
                        onTouchOutside={() => this.setState({ dialogVisible_rename: false })}
                        animation='bottom'
                    >
                        <View >
                            <Text style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>Rename Device</Text>
                            <TextInput
                                style={device_style.dialog_textinput}
                                onChangeText={(device_name) => this.setState({ device_name })}
                                underlineColorAndroid="transparent"
                                value={this.state.device_name}
                            ></TextInput>
                            <Text style={[device_style.dialog_text, { fontSize: 10, color: this.state.valid }]}>Max 15 Characters</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogVisible_rename: false }) }}>CANCEL</Text>
                                <Text style={device_style.dialog_btn_ok} onPress={this.rename_click.bind(this)}>OK</Text>
                            </View>
                        </View>
                    </Dialog>
                    <Dialog
                        visible={this.state.dialogVisible_delete}
                        onTouchOutside={() => this.setState({ dialogVisible_delete: false })}
                    >
                        <View>
                            <Text style={[device_style.dialog_text, { marginBottom: 30 }]}>{this.state.device_name}</Text>
                            <Text style={{ color: "#b2babb", fontSize: 16 }}>Are you sure you want to delete this device?</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogVisible_delete: false }) }}>CANCEL</Text>
                                <Text style={device_style.dialog_btn_ok} onPress={this.devicedelete.bind(this)}>DELETE</Text>
                            </View>
                        </View>
                    </Dialog>

                    <Dialog visible={this.state.dialogVisible_add}
                        onTouchOutside={() => this.setState({ dialogVisible_add: false })}
                        animation='bottom' >
                        <View >
                            <Text style={{ marginBottom: 20, fontWeight: '300', textAlign: 'center', fontWeight: 'bold' }}>Enter the device name</Text>
                            <TextInput
                                style={device_style.dialog_textinput}
                                onChangeText={(device_name) => this.setState({ device_name })}
                                underlineColorAndroid="transparent"
                                value={this.state.device_name}
                            ></TextInput>
                            <Text style={[device_style.dialog_text, { fontSize: 10, color: this.state.valid }]}>Max 15 Characters</Text>
                            <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                                <Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogVisible_add: false }) }}>CANCEL</Text>
                                <Text style={device_style.dialog_btn_ok} onPress={this.device_insert.bind(this)}>OK</Text>
                            </View>
                        </View>
                    </Dialog>
                </View>
            </SideMenu>
        );
    }
}