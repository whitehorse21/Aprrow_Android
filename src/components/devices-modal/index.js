import React, { Component } from 'react';
import {
    Text, Image, View, FlatList, TouchableOpacity
} from 'react-native'
import { styles } from '../../widget/index.style';
import Modal from 'react-native-modal';
import commons from '../../commons';
class DevicesModal extends Component {
    Getdeviceicon(dataObj) {
        if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Google") {
            if (this.props.choosendeviceid == dataObj.id)
                return require('../../assets/icon_tablet_android_blue_36px.png');
            else
                return require('../../assets/icon_tablet_android_grey_36px.png');
        } else if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Apple") {
            if (this.props.choosendeviceid == dataObj.id)
                return require('../../assets/icon_ipad_blue_36px.png');
            else
                return require('../../assets/icon_ipad_grey_36px.png');

        } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Google") {
            if (this.props.choosendeviceid == dataObj.id)
                return require('../../assets/icon_phone_android_blue_30px.png');
            else
                return require('../../assets/icon_phone_android_grey_30px.png');
        } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Apple") {
            if (this.props.choosendeviceid == dataObj.id)
                return require('../../assets/icon_iphone_blue_30px.png');
            else
                return require('../../assets/icon_iphone_grey_30px.png');
        } else {
            if (this.props.choosendeviceid == dataObj.id)
                return require('../../assets/icon_phone_android_blue_30px.png');
            else
                return require('../../assets/icon_phone_android_grey_30px.png');
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

        //this.props.navigation.setParams({ devicename: current_devicelist[index].name });
        this.props.setHeader(current_devicelist[index].name);
        //this.setState({ load_visible: false });
        this.refs.loaderRef.hide();
        await commons.writelog(screen, "16_doneswitching", commons.gettimestamp_log())
    }


    render() {
        return (
            <Modal
                isVisible={this.props.showdeviceoptions}
                style={{ flex: 1 }}
                swipeDirection="right"
                animationIn="fadeIn"
                animationOut="fadeOut">
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                        <TouchableOpacity onPress={() => { this.setState({ showdeviceoptions: false }) }} style={{ width: '40%' }}>
                            <Image style={{ marginLeft: 10 }} source={require("../../assets/icon_back_white.png")} />
                        </TouchableOpacity>
                        <View style={{ width: "60%" }}>
                            <Text allowFontScaling={false} style={[styles.title, { fontFamily: 'Roboto-Bold', color: "white" }]}>Devices</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1, width: '100%', backgroundColor: "#EEEEEE" }}>
                        <FlatList
                            style={{ flex: 1, marginTop: 2 }}
                            data={this.props.devices}
                            extraData={this.state}
                            renderItem={({ item, index }) =>
                                commons.renderIf(!item.deleted,
                                    <TouchableOpacity onPress={() => this.deviceseselected(index)} style={{ borderRadius: 5, backgroundColor: "#FFFFFF", marginLeft: 8, marginRight: 8, marginTop: 8, flexDirection: "row", justifyContent: "space-between", padding: 15 }}>
                                        <View style={{ flexDirection: "row", width: "50%", alignItems: "center" }}>
                                            <View>
                                                <Image source={this.Getdeviceicon(item)} />
                                            </View>
                                            <View style={{ flexDirection: "column", marginLeft: 2 }}>
                                                <Text allowFontScaling={false} style={{ fontSize: 17, fontFamily: 'Roboto-Bold', color: item.fontcolor }}>{item.name}</Text>
                                                <View style={{ flexDirection: "row" }}>
                                                    <Text allowFontScaling={false} style={{ fontSize: 12 }} numberOfLines={1}>{item.model}  </Text>
                                                    <View style={{ display: item.currentdevice }}>
                                                        <Image style={{ marginLeft: 1, marginTop: 2 }} source={require('../../assets/icon_check_circle_green.png')} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        {commons.renderIf(!item.add_device,
                                            <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "row", width: "25%" }}>
                                                <TouchableOpacity onPress={async () => {
                                                    var connectionstatus = await commons.isconnected();
                                                    if (!connectionstatus && this.state.devices[index].currentdevice != 'flex') {
                                                        this.setState({ offlineFlag: true });
                                                        return;
                                                    }
                                                    this.setState({ showdeviceoptions: false, replicatemodel: true, editing_device_index: index });
                                                }}>
                                                    <Image source={require('../../assets/icon_replicate_blue_30x19px.png')} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={async () => {
                                                    var connectionstatus = await commons.isconnected();
                                                    if (!connectionstatus && this.state.devices[index].currentdevice != 'flex') {
                                                        this.setState({ offlineFlag: true });
                                                        return;
                                                    }
                                                    this.setState({ renamemodel: true, editing_device_index: index, editing_device_name: item.name })
                                                }}>
                                                    <Image style={{ marginLeft: 10 }} source={require('../../assets/icon_rename_blue_21px.png')} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={async () => {
                                                    var connectionstatus = await commons.isconnected();
                                                    if (!connectionstatus && this.state.devices[index].currentdevice != 'flex') {
                                                        this.setState({ offlineFlag: true });
                                                        return;
                                                    }
                                                    this.setState({ editing_device_index: index, editing_device_name: item.name, deletemodel: true })
                                                }}>
                                                    <Image style={{ marginLeft: 10 }} source={require('../../assets/icon_delete_blue_21px.png')} />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {commons.renderIf(item.add_device,
                                            <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "column", width: "30%" }}>
                                                <Image source={require('../../assets/icon_add_circle_blue_24px.png')} />
                                                <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: "#2699FB", marginTop: 8 }}>ADD this device</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>)
                            } />
                    </View>
                </View>
            </Modal>
        );
    }
}

export default DevicesModal;