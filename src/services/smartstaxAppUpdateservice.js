import { AsyncStorage, ToastAndroid } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import nativefucntions from '../nativemodules/Toast.js';
import databasehelper from '../utils/databasehelper.js';
import commons from '../commons.js';

const intervalId = {};
const smartstaxAppUpdateservice = {

    starservice() {
        //ToastAndroid.show("App update Service====>>",500);  
        intervalId = BackgroundTimer.setInterval(async () => {

            var SmartFlag1 = await commons.checkSmartFlag();

            if (SmartFlag1 == true) {
                //console.log("running appstatistics service");
                const username = await AsyncStorage.getItem("username");
                const deviceid = await AsyncStorage.getItem("currentdeviceid");
                const smartstaxid = await AsyncStorage.getItem("smartstaxid");
                var lastlocation1 = await AsyncStorage.getItem("lastlocation");
                var lastlocation = {};

                if (lastlocation1 != null) { lastlocation = JSON.parse(lastlocation1); }


                var llat = "";
                var llong = "";

                if (lastlocation.hasOwnProperty("lat"));
                llat = lastlocation.lat;

                if (lastlocation.hasOwnProperty("long"));
                llong = lastlocation.long;

                var enabled_app_usage_permission = await nativefucntions.checkappusagepermission()
                var connected = await commons.isconnected();

                //console.log("<username>"+username+"<deviceid>"+deviceid+"<connected>"+connected+"<enabled_app_usage_permission>"+enabled_app_usage_permission);

                if (username == null || username == commons.guestuserkey()) {
                    return;
                }
                if (deviceid != null && enabled_app_usage_permission && smartstaxid != null && smartstaxid != undefined) {

                    var sInput = {};
                    sInput["operation"] = "getAppsList";
                    sInput["userid"] = username;
                    sInput["deviceid"] = deviceid;
                    sInput["lat"] = "" + llat;
                    sInput["long"] = "" + llong;


                    var aws_data = require("../config/AWSConfig.json");
                    var acceestoken = await commons.get_token();
                    fetch('' + aws_data.path + aws_data.stage + 'smartstaxmgmt', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': acceestoken
                        },
                        body: JSON.stringify(sInput)
                    }).then((response) => response.json())
                        .then(async (responseJson) => {
                            // alert("smart responseJson=>"+JSON.stringify(responseJson));
                            var smart_applists = [];
                            if (responseJson.length > 0) {
                                for (let i = 0; i < responseJson.length; i++) {
                                    var appobj = responseJson[i];
                                    var dbApp = {};
                                    dbApp["package"] = appobj.package; // appobj.applabel;
                                    dbApp["appname"] = appobj.appname;
                                    smart_applists.push(dbApp);
                                }

                                var createtime = commons.gettimestamp();
                                var result = await databasehelper.updatewidget_applist(smartstaxid, JSON.stringify(smart_applists), createtime);
                                //ToastAndroid.show("smart_applists====>>"+JSON.stringify(smart_applists),500);  
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                        });

                }
            }
        }, 300000);// 5 minutes //300000//60000
    },

    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default smartstaxAppUpdateservice;
