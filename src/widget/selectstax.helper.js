import React from 'react';
import {
    Text, View, TouchableOpacity, Image,FlatList,ToastAndroid
} from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './index.style';
var uiHelper = require('./ui.helper');
module.exports = {
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.select_stax_model}
            onBackButtonPress={() => p.setState({ select_stax_model: false })}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={{ backgroundColor: "white", borderRadius: 3 }}>
                <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                    <Text allowFontScaling={false} style={[styles.title, { fontFamily: 'Roboto-Bold', color: "white" }]}>Select Stax</Text>
                </View>
                <View style={{ height: "75%" }}>
                    <FlatList style={{ flex: 1, padding: 15 }}
                        extraData={p.state}
                        data={p.state.Stax_replicate}
                        renderItem={({ item, index }) =>
                            <View style={{ marginTop: 25 }}>
                                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
                                    <Text allowFontScaling={false} style={{ marginLeft: 10, color: "#3F97DC", fontFamily: 'Roboto-Bold', fontSize: 16 }} >{item.widgetname}</Text>
                                    <CheckBox
                                        onClick={() => p.onClick(index)}
                                        isChecked={item.checked}
                                        checkedImage={<Image source={require("../assets/icon_checkbox_on_lightblue_24px.png")} />}
                                        unCheckedImage={<Image source={require("../assets/icon_checkbox_off_grey_24px.png")} />}
                                    />
                                </View>
                                <Image style={{ marginTop: 10, width: "100%" }} source={require('../assets/line_popup_228.png')} />
                            </View>
                        }
                    />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 25, alignItems: "center", justifyContent: "center" }}>
                    {uiHelper.renderCancelButton(() => p.setState({ select_stax_model: false, replicatemodel: true }))}
                    <TouchableOpacity onPress={() => {
                        var cur_Data = p.state.Stax_replicate;
                        var donext = false;
                        for (var i = 0; i < cur_Data.length; i++) {
                            if (cur_Data[i].checked) {
                                donext = true;
                                break;
                            }
                        }
                        if (donext) {
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
                            p.setState({ select_stax_model: false, select_device_model: true, devices_temp_to_replicate: devicetep });
                        }
                        else
                            ToastAndroid.show("Please Select STAX to continue", 500);
                    }} style={{ marginLeft: 10, height: 45, width: 120, backgroundColor: "#006BBD", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }} >NEXT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);
    }
};