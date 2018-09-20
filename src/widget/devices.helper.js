import React from 'react';
import {
    Text, Image, View, FlatList, TouchableOpacity} from 'react-native';
import commons from '../commons';
import Modal from 'react-native-modal';

import { styles } from './index.style'

var deviceUIHelper = require('./devices.ui.helper');
var uiHelper = require('./ui.helper');

module.exports = {
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.showdeviceoptions}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => { p.setState({ showdeviceoptions: false }) }} style={{ width: '40%' }}>
                        <Image style={{ marginLeft: 10 }} source={require("../assets/icon_back_white.png")} />
                    </TouchableOpacity>
                    <View style={{ width: "60%" }}>
                        <Text allowFontScaling={false} style={[styles.title, { fontFamily: 'Roboto-Bold', color: "white" }]}>Devices</Text>
                    </View>
                </View>
                <View style={{ flex: 1, width: '100%', backgroundColor: "#EEEEEE" }}>
                    <FlatList
                        style={{ flex: 1, marginTop: 2 }}
                        data={p.state.devices}
                        extraData={p.state}
                        renderItem={({ item, index }) =>
                            commons.renderIf(!item.deleted,
                                <TouchableOpacity onPress={() => p.deviceseselected(index)} style={{ borderRadius: 5, backgroundColor: "#FFFFFF", marginLeft: 8, marginRight: 8, marginTop: 8, flexDirection: "row", justifyContent: "space-between", padding: 15 }}>
                                    <View style={{ flexDirection: "row", width: "50%", alignItems: "center" }}>
                                        <View>
                                            <Image source={deviceUIHelper.getDeviceIcon(item, p.state.choosendeviceid)} />
                                        </View>
                                        <View style={{ flexDirection: "column", marginLeft: 2 }}>
                                            <Text allowFontScaling={false} style={{ fontSize: 17, fontFamily: 'Roboto-Bold', color: item.fontcolor }}>{item.name}</Text>
                                            <View style={{ flexDirection: "row" }}>
                                                <Text allowFontScaling={false} style={{ fontSize: 12 }} numberOfLines={1}>{item.model}  </Text>
                                                <View style={{ display: item.currentdevice }}>
                                                    <Image style={{ marginLeft: 1, marginTop: 2 }} source={require('../assets/icon_check_circle_green.png')} />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    {commons.renderIf(!item.add_device,
                                        <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "row", width: "25%" }}>
                                            {uiHelper.renderExceptAddDeviceIcon(p, require('../assets/icon_replicate_blue_30x19px.png'), { showdeviceoptions: false, replicatemodel: true, editing_device_index: index })}
                                            {uiHelper.renderExceptAddDeviceIcon(p, require('../assets/icon_rename_blue_21px.png'), { renamemodel: true, editing_device_index: index, editing_device_name: item.name })}
                                            {uiHelper.renderExceptAddDeviceIcon(p, require('../assets/icon_delete_blue_21px.png'), { editing_device_index: index, editing_device_name: item.name, deletemodel: true })}
                                        </View>
                                    )}
                                    {commons.renderIf(item.add_device,
                                        <View style={{ marginLeft: 5, alignItems: "center", justifyContent: "center", flexDirection: "column", width: "30%" }}>
                                            <Image source={require('../assets/icon_add_circle_blue_24px.png')} />
                                            <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: "#2699FB", marginTop: 8 }}>ADD this device</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>)
                        } />
                </View>
            </View>
        </Modal>);
    }
};