import React from 'react';
import {
    Text, View, TextInput} from 'react-native';
import device_style from '../styles/device.style';
import { Dialog } from 'react-native-simple-dialogs';

module.exports = {
    renderDialog: (p) => {
        return (<Dialog visible={p.state.renamemodel}>
            <View >
                <Text allowFontScaling={false} style={[device_style.dialog_text, { marginBottom: 20, fontFamily: 'Roboto-Bold', textAlign: 'center', fontSize: 20, color: "#2699FB" }]}>Rename Device</Text>
                <TextInput
                    style={[device_style.dialog_textinput, { borderColor: "#2699FB" }]}
                    autoCapitalize="none"
                    onChangeText={(device_name) => p.setState({ device_name })}
                    underlineColorAndroid="transparent"
                    maxLength={15}
                    value={p.state.device_name} />
                <Text allowFontScaling={false} style={[device_style.dialog_text, { fontSize: 10, color: p.state.valid }]}>Max 15 Characters</Text>
                <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <Text allowFontScaling={false} style={[device_style.dialog_btn_cancel, { color: "#757575", fontSize: 16, fontFamily: 'Roboto-Bold' }]} onPress={() => { p.setState({ renamemodel: false, valid: '#2699FB', device_name: "" }) }}>CANCEL</Text>
                    <Text allowFontScaling={false} style={[device_style.dialog_btn_ok, { color: "#2699FB", fontSize: 16, fontFamily: 'Roboto-Bold' }]} onPress={() => p.Renamedevice()}>OK</Text>
                </View>
            </View>
        </Dialog>);
    }
};