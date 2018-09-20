import React from 'react';
import {
    Dimensions, Text, View, TouchableOpacity, Image,FlatList
} from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './index.style';
var uiHelper = require('./ui.helper');

module.exports = {
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.select_device_model}
            onBackButtonPress={() => p.setState({ select_device_model: false })}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={{ backgroundColor: "white", borderRadius: 3 }}>
                <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                    <Text allowFontScaling={false} style={[styles.title, { fontFamily: 'Roboto-Bold', color: "white" }]}>Select Device</Text>
                </View>
                <View style={{ height: "75%" }}>
                    <FlatList style={{ flex: 1 }}
                        extraData={p.state}
                        data={p.state.devices_temp_to_replicate}
                        renderItem={({ item, index }) =>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", padding: 15 }}>
                                    <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                                        <Image source={require("../assets/icon_devices_blue.png")} />
                                        <Text allowFontScaling={false} style={{ marginLeft: 12, color: item.source ? "#3F97DC" : "black", fontFamily: 'Roboto-Bold', fontSize: 16 }} onPress={() => { }}>{item.name}</Text>
                                    </View>
                                    {commons.renderIf(!item.source,
                                        <View >
                                            <CheckBox
                                                onClick={() => p.onClick_device(index)}
                                                isChecked={item.checked}
                                                checkedImage={<Image source={require("../assets/icon_checkbox_on_lightblue_24px.png")} />}
                                                unCheckedImage={<Image source={require("../assets/icon_checkbox_off_grey_24px.png")} />}
                                            />
                                        </View>
                                    )}
                                </View>
                                <Image style={{ marginTop: 10, width: "100%" }} source={require('../assets/line_popup_228.png')} />
                            </View>
                        }
                    />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 25, alignItems: "center", justifyContent: "center" }}>
                    {uiHelper.renderCancelButton(() => p.setState({ select_device_model: false, select_stax_model: true }))}
                    <TouchableOpacity onPress={() => p.replicate_device()} style={{ marginLeft: 10, height: 45, width: 120, backgroundColor: "#006BBD", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>REPLICATE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);
    }
};