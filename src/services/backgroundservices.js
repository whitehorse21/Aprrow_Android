
import BackgroundTimer from 'react-native-background-timer';
import commons from '../commons.js';
import databasehelper from '../utils/databasehelper.js';
import { AsyncStorage } from 'react-native';

const bacgroundservice = {

    async startsyncingservice() {
        await AsyncStorage.removeItem("running");
        BackgroundTimer.runBackgroundTimer(async () => {
            var username_temp = await AsyncStorage.getItem("username");
            if (username_temp == null || username_temp == commons.guestuserkey()) {
                return;
            }
            var status = await AsyncStorage.getItem("running")
            if (status != null && status == "true")
                return;
            try {
                await AsyncStorage.setItem("running", "true");
                var isconnected = await commons.isconnected();
                var username = await AsyncStorage.getItem("username");
                var curdevice = await AsyncStorage.getItem("currentdeviceid");

                if (isconnected) {
                    var apps = await AsyncStorage.getItem("appdata");

                    if (curdevice != null && apps != null) {
                        var last_synctime = await AsyncStorage.getItem("lastappsync");

                        //increase time to 900 seconds after testing
                        if ((last_synctime == null) || (commons.gettime_diff_withrecord(last_synctime) > 15)) {

                            //uncomment for storing icons to s3
                            var apps_old_temp = await AsyncStorage.getItem("oldapps");
                            var apps_old = {};
                            if (apps_old_temp != null)
                                apps_old = JSON.parse(apps_old_temp);

                            var curapps = JSON.parse(apps);

                            var newapps = [];
                            var appstosync = [];
                            var deletedapps = [];
                            var prevdevice = await AsyncStorage.getItem("prevdevice");

                            for (key in curapps) {
                                appstosync.push(curapps[key]);

                                if (!apps_old.hasOwnProperty(key))
                                    newapps.push(curapps[key]);
                            }

                            for (key in apps_old) {
                                if (!curapps.hasOwnProperty(key))
                                    deletedapps.push(curapps[key]);
                            }

                            //sync apps  in apps to synsc on success update following

                            if (newapps.length > 0 || deletedapps.length > 0 || prevdevice == null || prevdevice != curdevice) {
                                var acceestoken = await commons.get_token();
                                var aws_data = require("../config/AWSConfig.json");
                                const response = await fetch('' + aws_data.path + aws_data.stage + 'deviceappoperations', {
                                    method: 'POST',
                                    headers: commons.getHeader(),
                                    body: JSON.stringify({ "operation": "insertorupdateapps", "deviceid": curdevice, "applist": appstosync, "userid": username }),
                                });
                                const json = await response.json();
                                var result = JSON.stringify(json)

                                if (result == '"SUCCESS"') {
                                    // alert(result);
                                    await AsyncStorage.setItem("lastappsync", commons.gettimestamp());
                                    await AsyncStorage.setItem("oldapps", apps);
                                    await AsyncStorage.setItem("prevdevice", curdevice);
                                }
                            }
                        }
                    }

                    var lastsynctime = await databasehelper.getsynctime();
                    var request_obj = {};

                    request_obj["TableName"] = "Users";//read from config
                    request_obj["username"] = username;
                    request_obj["device"] = [];
                    request_obj["widget"] = [];

                    //alert(lastsynctime.synctime);
                    //device data
                    var device_sync = await databasehelper.getdevice_tosync(lastsynctime.synctime);
                    device_sync = device_sync.dataArray;
                    for (var i = 0; i < device_sync.length; i++) {
                        request_obj["device"].push(device_sync[i]);
                    }
                    //widget data
                    var widget_sync = await databasehelper.getwidget_tosync(lastsynctime.synctime);
                    widget_sync = widget_sync.dataArray;

                    //grouping widgets by device id
                    var widgetdatahash = {};
                    for (var i = 0; i < widget_sync.length; i++) {
                        var widgetobj = widget_sync[i];
                        var deviceid = widgetobj.deviceid;

                        if (widgetdatahash.hasOwnProperty(deviceid)) {
                            widgetdatahash[deviceid]["widgetdata"].push(widgetobj);
                        }
                        else {
                            widgetdatahash[deviceid] = {};
                            widgetdatahash[deviceid]["widgetdata"] = [];
                            widgetdatahash[deviceid]["widgetdata"].push(widgetobj);
                        }
                    }


                    for (var key in widgetdatahash) {
                        var widgetobj = {};
                        widgetobj["deviceid"] = key;
                        widgetobj["widgets"] = widgetdatahash[key]["widgetdata"];
                        request_obj["widget"].push(widgetobj);
                    }

                    if (request_obj.widget.length > 0 || request_obj.device.length > 0) {

                        // console.log("Requestdata>>" + JSON.stringify(request_obj));
                        var updatetime = commons.gettimestamp();
                        var aws_data = require("../config/AWSConfig.json");
                        var acceestoken = await commons.get_token();
                        const response = await fetch('' + aws_data.path + aws_data.stage + 'bulkupdate', {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': acceestoken
                            },
                            body: JSON.stringify(request_obj),
                        });

                        const responseJson = await response.json();
                        if (responseJson == "SUCCESS") {
                            await databasehelper.updatesynctime(updatetime);
                            console.log("done upload");
                        }
                    }
                    else {
                        //console.log("everything is uptodate");
                    }
                    //uploading images to s3
                    var fileidstosync = await databasehelper.getfile_ids_tosync();
                    fileidstosync = fileidstosync.fileids

                    for (var i = 0; i < fileidstosync.length; i++) {
                        var file_id = fileidstosync[i];
                        var res = await databasehelper.is_need_to_upload_file(file_id);
                        if (res == "1") {
                            var res = await commons.upload_file_toS3(file_id, '.jpg');
                            if (res) {
                                await databasehelper.update_filesync_status(file_id);
                            }
                        }
                        else {
                            await databasehelper.update_filesync_status(file_id);
                        }
                    }
                }
            }
            catch (err) {
                console.log(err.message);
            }
            finally {
                await AsyncStorage.setItem("running", "false");
            }
        }, 5000) //five seconds;
    },

    stopsyncingservice() {
        BackgroundTimer.stopBackgroundTimer();
        // ToastExample.show("service end", ToastExample.SHORT);
    }
}

export default bacgroundservice;