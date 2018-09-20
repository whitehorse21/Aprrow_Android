import React from 'react';
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Dialog } from 'react-native-simple-dialogs';
import device_style from './styles/device.style';
import Modal from 'react-native-modal';


module.exports = {
    offlineDialog: (p) => {
        return (<Dialog visible={p.state.offlineFlag}
            onTouchOutside={() => p.setState({ offlineFlag: false })}
            animation='fade' >
            <View >
                <Image source={require('./assets/icon_offline_grey_40px.png')} style={{ alignSelf: 'center' }} />
                <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>YOU ARE OFFLINE</Text>
                <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>This feature is only</Text>
                <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>available online</Text>
                <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                    <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => p.offlineFunc()}>
                        <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Dialog>)
    },
    headerLeft: (goBack) => {
        return (<View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => goBack()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginLeft: 5
            }}
            source={require("./assets/icon_arrow_back.png")}
          />
        </TouchableOpacity>
      </View>)
    },
    loginFlowDialog: (p) => {
        return (<Modal
            isVisible={p.state.gotologinflow} onBackButtonPress={() => p.setState({ gotologinflow: false })}
            style={{ flex: 1 }} swipeDirection="right" animationIn="fadeIn" animationOut="fadeOut">
            <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" }}>
                <View style={{ backgroundColor: "#006BBD", height: '18%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                    <Text allowFontScaling={false} style={[{ fontSize: 18, fontFamily: 'Roboto-Bold', color: "white" }]}>Create Account</Text>
                </View>
                <View style={{ height: "30%", alignItems: "center", justifyContent: "center", marginTop: "8%" }}>
                    <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16, fontWeight: "100", color: "black" }}>Signup With APRROW to get access to</Text>
                    <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16, fontWeight: "100", color: "black" }}>All features</Text>
                </View>
                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "10%" }}>
                    <TouchableOpacity
                        onPress={() => { p.setState({ gotologinflow: false }); }}
                        style={{ marginRight: 10, height: 42, width: 125, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold', fontSize: 16 }}>No,Thanks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        p.setState({ gotologinflow: false });
                        const { navigate } = p.props.navigation;
                        navigate("login", {});
                    }} style={{ marginLeft: 10, height: 42, width: 125, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold', fontSize: 16 }}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>);
    }
};