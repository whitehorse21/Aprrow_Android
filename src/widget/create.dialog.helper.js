import React from 'react';
import {
    Text, View, TextInput, TouchableOpacity} from 'react-native';
import device_style from '../styles/device.style';
import { Dialog } from 'react-native-simple-dialogs';

module.exports = {
    renderDialog: (p) => {
        return (<Dialog
            visible={p.state.dialogWidget_name}
            onTouchOutside={() => p.setState({ dialogWidget_name: false })}
            animation='fade'>
            <View >
                <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, color: 'black', fontWeight: '300', textAlign: 'center' }]}>Enter STAX name</Text>
                <TextInput
                    style={device_style.dialog_textinput}
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                    value={p.state.Widget_name}
                    maxLength={15}
                    onChangeText={(Widget_name) => p.setState({ Widget_name })} />
                <Text allowFontScaling={false} style={[device_style.dialog_text, { color: '#5D89F6', fontSize: 12 }]}>Max 15 Characters</Text>
                <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <TouchableOpacity style={{ marginRight: '10%', height: 45, width: '40%', backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => { p.setState({ dialogWidget_name: false }) }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 10, height: 45, width: '40%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={p.create_widgets.bind(p)}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Dialog>)
    }
};