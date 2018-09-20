import React from 'react';
import {
    Dimensions, Text, View, TouchableOpacity, Image
} from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './index.style';
module.exports = {
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.replicatemodel}
            onBackButtonPress={() => p.setState({ replicatemodel: false })}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={{ backgroundColor: "white", borderRadius: 3, flex: 0.3 }}>
                <View style={{ backgroundColor: "#006BBD", height: '30%', width: '100%', alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => p.setState({ replicatemodel: false, showdeviceoptions: true })} style={{ width: '40%' }}>
                        <Image style={{ marginLeft: 10 }} source={require("../assets/icon_back_white.png")} />
                    </TouchableOpacity>
                    <View style={{ width: "60%" }}>
                        <Text allowFontScaling={false} style={[styles.title, { fontFamily: 'Roboto-Bold', color: "white" }]}>Replicate</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'column', marginTop: 15, alignItems: "center", justifyContent: "center" }}>
                    <TouchableOpacity onPress={async () => {
                        await p.device_list_to_replicate();
                        var cur_Staxs = p.state.Stax_replicate;
                        if (cur_Staxs.length > 0) {
                            for (var i = 0; i < cur_Staxs.length; i++) {
                                cur_Staxs[i].checked = true;
                            }
                            await p.setState({ Stax_replicate: cur_Staxs });
                            var device_master = p.state.devices;
                            var editing_id = device_master[p.state.editing_device_index].id;
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
                            await p.setState({ replicatemodel: false, devices_temp_to_replicate: devicetep, select_device_model: true })
                        }
                        else {
                            ToastAndroid.show("Device Don't Have Any Stax", 500);
                        }
                    }}>
                        <Text allowFontScaling={false} style={{ color: "#3F97DC", fontSize: 18, fontFamily: 'Roboto-Bold' }} >All Stax</Text>
                    </TouchableOpacity>
                    <Image style={{ marginTop: 10 }} source={require('../assets/line_popup_228.png')} />
                    <TouchableOpacity onPress={async () => {
                        await p.device_list_to_replicate();
                        p.setState({ select_stax_model: true, replicatemodel: false })
                    }}>
                        <Text allowFontScaling={false} style={{ color: "#3F97DC", fontSize: 18, fontFamily: 'Roboto-Bold', marginTop: 15 }} >Selected Stax</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);
    }
};