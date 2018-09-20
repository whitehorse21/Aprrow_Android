import React from "react";
import { View, Text,TouchableOpacity,Image } from "react-native";
import { Dialog } from 'react-native-simple-dialogs';
import device_style from '../styles/device.style';
module.exports = {
    renderStatusDialog: (p) => {
        return (<Dialog
            visible={p.state.statusinfo1}
            onTouchOutside={() => p.setState({ statusinfo: false })}
            animation='fade'>
            <View style={{ alignItems: "flex-start" }} >
                <Text allowFontScaling={false} style={{ fontSize: 26, fontWeight: 'bold', color: "#005CA1", alignSelf: 'center' }}>Status Level</Text>
                <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>

                <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#D99679", fontWeight: 'bold' }}>Bronze</Text>
                <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#D99679" }}>Earned 10+ points in a year</Text>
                <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>
                <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#BFBFBF", fontWeight: 'bold' }}>Silver </Text>
                <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#BFBFBF" }}>Earned 25+ points in a year</Text>
                <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>

                <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#FFBB00", fontWeight: 'bold' }}>Gold </Text>
                <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#FFBB00" }}>Earned 50+ points in a year</Text>
                <View style={{ width: '100%', height: '0.5%', backgroundColor: '#c6cad1', marginTop: '4%' }}></View>

                <Text allowFontScaling={false} style={{ fontSize: 18, marginTop: 20, color: "#444444", fontWeight: 'bold' }}  >Platinum </Text>
                <Text allowFontScaling={false} style={{ fontSize: 16, marginTop: 5, color: "#444444" }}>Earned 100+ points in a year</Text>
            </View>
        </Dialog>)
    }
};