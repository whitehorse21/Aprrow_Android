import {
    AsyncStorage
} from 'react-native';

import BackgroundTimer from 'react-native-background-timer';
import nativefucntions from '../nativemodules/Toast.js';
import databasehelper from '../utils/databasehelper.js';
import commons from '../commons.js';

const intervalId = {};
const usageupdateservice = {
    starservice() {
        intervalId = BackgroundTimer.setInterval(async () => {
            //console.log("running appstatistics service");
            var username_temp = await AsyncStorage.getItem("username");
            if (username_temp == null || username_temp == commons.guestuserkey()) {
                return;
            }
            const username = await AsyncStorage.getItem("username");
            const deviceid = await AsyncStorage.getItem("currentdeviceid");
            const mostusedwidget_id = await AsyncStorage.getItem("mostusedwidgetid");

            var enabled_app_usage_permission = await nativefucntions.checkappusagepermission()
            var connected = await commons.isconnected();
            if (mostusedwidget_id != null && enabled_app_usage_permission) {
                var apps = await nativefucntions.getmostusedapps();
                apps = JSON.parse(apps);
                var apps_modified = [];
                for (var i = 0; i < apps.length; i++) {
                    var apptempobj = {};
                    apptempobj["appname"] = apps[i].applabel;
                    apptempobj["package"] = apps[i].package;
                    apps_modified.push(apptempobj);
                }

                await databasehelper.updatewidget_applist(mostusedwidget_id, JSON.stringify(apps_modified), commons.gettimestamp());
                if (connected && username != null && deviceid != null) {

                    var request_obj = {}
                    request_obj["username"] = username;
                    request_obj["appstatistics"] = {};
                    request_obj["appstatistics"]["appdata"] = [];
                    request_obj["appstatistics"]["deviceid"] = deviceid;

                    var appdata = [];
                    var appdata_m = [];

                    var appdata_fromdevice = await nativefucntions.getappstatistics();

                    appdata_m = JSON.parse(appdata_fromdevice);

                    for (var i = 0; i < appdata_m.length; i++) {
                        var appobj = {};
                        appobj["createtime"] = commons.gettimestamp() + "";
                        appobj["packagename"] = appdata_m[i].package + "";
                        appobj["lastused"] = appdata_m[i].lastimeused + "";
                        appobj["totalusetime"] = appdata_m[i].usage + "";
                        appobj["lasusedloaction"] = "NA";
                        appobj["installedon"] = "NA";


                        appdata.push(appobj);
                    }
                    request_obj["appstatistics"]["appdata"] = appdata;

                    //send location data to server
                    var aws_data = require("../config/AWSConfig.json");
                    fetch('' + aws_data.path + aws_data.stage + 'bulkappstatistics', {
                        method: 'POST',
                        headers: commons.getHeader(),
                        body: JSON.stringify(request_obj),
                    }).then((response) => response.json())
                        .then((responseJson) => {
                            //console.log(responseJson);
                            if (responseJson == "APP SUCCESS") {
                                console.log("uploaded appstatistics");
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            }
        }, 900000);// 15 minutes
    },

    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default usageupdateservice;