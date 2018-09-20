
import React from 'react';
import {
    Dimensions, Image, TouchableOpacity,Text
} from 'react-native';
import commons from '../commons';
module.exports = {
    renderExceptAddDeviceIcon: function (p, icPath, statusObj) {
        return (
            <TouchableOpacity onPress={async () => {
                var connectionstatus = await commons.isconnected();
                if (!connectionstatus && p.state.devices[index].currentdevice != 'flex') {
                    p.setState({ offlineFlag: true });
                    return;
                }
                p.setState(statusObj);
            }}>
                <Image source={icPath} />
            </TouchableOpacity>
        )
    },
    resetWebViewToInitialUrl: async (widget) => {
        await widget.setState({
            key: widget.state.key + 1,
        });
    },
    renderOpenLink: (p, icPath, socialLink, socialView) => {
        return (
            <TouchableOpacity onPress={async () => {
                await p.setState({ feed: socialLink, openLink: socialLink });
                await uiHelper.resetWebViewToInitialUrl(p);
            }} style={{ flex: 0.1, display: socialView, justifyContent: 'center' }}>
                <Image source={icPath} />
            </TouchableOpacity>
        )
    },
    renderCancelButton: function(pressCallback) {
        return (
            <TouchableOpacity onPress={pressCallback} style={{ marginRight: 10, height: 45, width: 120, backgroundColor: "#757575", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                <Text allowFontScaling={false} style={{ color: "white", fontFamily: 'Roboto-Bold' }}>CANCEL</Text>
            </TouchableOpacity>
        )
    }
};  