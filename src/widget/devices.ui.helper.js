

exports.getDeviceIcon = function (dataObj, choosendeviceid) {
    if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Google") {
        if (choosendeviceid == dataObj.id)
            return require('../assets/icon_tablet_android_blue_36px.png');
        else
            return require('../assets/icon_tablet_android_grey_36px.png');
    } else if ((dataObj.device_type == "true" || dataObj.device_type == true) && dataObj.device_platform == "Apple") {
        if (choosendeviceid == dataObj.id)
            return require('../assets/icon_ipad_blue_36px.png');
        else
            return require('../assets/icon_ipad_grey_36px.png');

    } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Google") {
        if (choosendeviceid == dataObj.id)
            return require('../assets/icon_phone_android_blue_30px.png');
        else
            return require('../assets/icon_phone_android_grey_30px.png');
    } else if ((dataObj.device_type == "false" || dataObj.device_type == false) && dataObj.device_platform == "Apple") {
        if (choosendeviceid == dataObj.id)
            return require('../assets/icon_iphone_blue_30px.png');
        else
            return require('../assets/icon_iphone_grey_30px.png');
    } else {
        if (choosendeviceid == dataObj.id)
            return require('../assets/icon_phone_android_blue_30px.png');
        else
            return require('../assets/icon_phone_android_grey_30px.png');
    }
};
