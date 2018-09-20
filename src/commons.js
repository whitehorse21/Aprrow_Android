import Moment from 'moment';
import nativefucntions from './nativemodules/Toast';
import { NetInfo, AsyncStorage, Dimensions ,NativeModules} from 'react-native';
import { NavigationActions } from 'react-navigation';
import FBSDK, { LoginManager, LoginButton, AccessToken, GraphRequest, GraphRequestManager } from "react-native-fbsdk";
import appusageservice from './appusageupdatingservice.js';
import syncingservice from './backgroundservices.js';
import loactiontrackingservice from './locationtracking.js';
import smartstaxservice from './smartstaxservice.js';

import smartstaxAppUpdateservice from './smartstaxAppUpdateservice.js';
import databasehelper from './utils/databasehelper.js';
var DeviceInfo = require('react-native-device-info');
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import { CognitoIdToken, CognitoAccessToken, CognitoUserSession, CognitoRefreshToken, CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'react-native-aws-cognito-js';
import RNFetchBlob from 'react-native-fetch-blob';
import Strings from './utils/strings.js';
import {
    Config,
    CognitoIdentityCredentials
} from 'aws-sdk/dist/aws-sdk-react-native';

const AWS = require('aws-sdk')
var enable_logging = false;
var smart_stax_flag = true;
var binaryToBase64 = require('binaryToBase64');
var utf8 = require('utf8');


var aws_data12 = require("./config/AWSConfig.json");
/* const awsCognitoSettings = {
     UserPoolId: 'us-west-2_wf8naaz4L',
     ClientId: '274mf2e9pblfadhb1ssfccg8ba'
 };
*/
 const awsCognitoSettings = {
     UserPoolId:aws_data12.UserPoolId,
     ClientId: aws_data12.ClientId
 };



const commons = {


    //You might need to install the utf8 package, 
    //since it was removed from React Native on version 0.54:
    async get_token() {

        var username = await AsyncStorage.getItem("username");
        if (username != null && username != this.guestuserkey()) {
            var bytes_username = utf8.encode(username);
            var encoded_username = binaryToBase64(bytes_username);

            //update when upgrading authentication flow
            var securityversion = "1";

            var tokenobj = {};
            tokenobj["token"] = encoded_username;
            tokenobj["securityversion"] = securityversion;

            var token = JSON.stringify(tokenobj);
            var bytes = utf8.encode(token);
            var encoded = binaryToBase64(bytes);
            return encoded;
        }
        else {
            var token = "4B0053744852ED7C2705E668C43982928978B74BBB7F21A0F9B4E43914E49A6F";
            var bytes = utf8.encode(token);
            var encoded = binaryToBase64(bytes);
            return encoded;
        }

    },

    async update_creds(acceestoken, idtoken, refreshtoken) {
        await AsyncStorage.setItem("acceestoken", acceestoken);
        await AsyncStorage.setItem("idtoken", idtoken);
        await AsyncStorage.setItem("refreshtoken", refreshtoken);

    },


    async checkSmartFlag() {
        return smart_stax_flag;
    },
    async get_access_token() {

        const username = await AsyncStorage.getItem("username")
        const userPool = new CognitoUserPool(awsCognitoSettings);

        var reftoken = await AsyncStorage.getItem("refreshtoken");
        var idtoken = await AsyncStorage.getItem("idtoken");
        var acceestoken = await AsyncStorage.getItem("acceestoken");

        const refresh_token = new CognitoRefreshToken({ RefreshToken: reftoken });
        const AccessToken = new CognitoAccessToken({ AccessToken: acceestoken });
        const IdToken = new CognitoIdToken({ IdToken: idtoken });



        const sessionData = {
            IdToken: IdToken,
            AccessToken: AccessToken,
            RefreshToken: refresh_token
        };

        const cachedSession = new CognitoUserSession(sessionData);

        return new Promise((resolve, reject) => {
            if (cachedSession.isValid()) {
                resolve({ idtoken });
            }
            else {
                const cognitoUser = new CognitoUser({
                    Username: username,
                    Pool: userPool
                });
                cognitoUser.refreshSession(refresh_token, (err, result) => {
                    if (err) {
                        resolve({ idtoken });
                    }
                    else {

                        var refreshtoken = result.refreshToken.token;
                        var id_token = result.idToken.jwtToken;
                        var accesstoken = result.accessToken.jwtToken;
                        this.update_creds(accesstoken, id_token, refreshtoken);
                        resolve({ id_token });
                    }
                });
            }
        });


    },



    guestuserkey() {
        return "Guestuser";
    },
    async onGoogleSignOut() {
        var google = await AsyncStorage.getItem("google");
        if (google == "1" || google == 1) {
            try {
                await GoogleSignin.hasPlayServices({ autoResolve: true });
                await GoogleSignin.configure({
                    webClientId: aws_data12.webClientId,
                    offlineAccess: false
                });
               // webClientId: "503074132222-vgq3t3nh2kg34jgf99srp41rhplbf2mp.apps.googleusercontent.com",              
                const user = await GoogleSignin.currentUserAsync();
                console.log("userDetais", user);
                // this.setState({user});
            }
            catch (err) {
                console.log("There are any error", err.message);
            }
            GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
                //this.setState({user: null});
            })
                .done();
        }
    },
    stopallservice() {
        appusageservice.stopservice();
        syncingservice.stopsyncingservice();
        loactiontrackingservice.stopservice();
        smartstaxservice.stopservice();
        smartstaxAppUpdateservice.stopservice();
    },

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    gettimestamp() {

        var dt = new Date();
        var formatteddate = Moment(dt).format('YYYYMMDDHHmmss');
        return formatteddate;
    },

    gettimestamp_log() {

        var dt = new Date();
        var formatteddate = Moment(dt).format('YYYY:MM:DD:HH:mm:ss:SSS');
        return formatteddate;
    },
    format_string_date(instring, informat, outformat) {
        var date = Moment(instring, informat).toDate();
        var formatteddate = Moment(date).format(outformat);
        return formatteddate;
    },

    gettimestamp_readable() {

        var dt = new Date();
        var formatteddate = Moment(dt).format('YYYY-MM-DD HH:mm:ss');
        return formatteddate;
    },
    async syncdatatobackend() {

        var username = await AsyncStorage.getItem("username");
        var curdevice = await AsyncStorage.getItem("currentdeviceid");

        //sync applist to server 

        /////////app syncing started////////////

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


                //opload new apps to s3.
                //for(var i=0;i<newapps.length;i++)
                //{


                // var filename= newapps[i].package;
                // var filepaths= newapps[i].icon;

                // await uploadicon()

                // }                          
                //sync apps  in apps to synsc on success update following

                if (newapps.length > 0 || deletedapps.length > 0 || prevdevice == null || prevdevice != curdevice) {
                    var acceestoken = await commons.get_token();
                    var aws_data = require("./config/AWSConfig.json");
                    var aws_lamda = require("./config/AWSLamdaConfig.json"); 
                    const response = await fetch('' + aws_data.path + aws_data.stage + aws_lamda.deviceappoperations, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': acceestoken
                        },
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

        ////////////////////////////////////////////end////////////////////////////////////////////////////////////////////////////


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
        // console.log("widget_sync>>> " + widget_sync);
        //alert("widget_sync>>> " +JSON.stringify({widget_sync}));
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



        //uploading images to s3
        var fileidstosync = await databasehelper.getfile_ids_tosync();
        fileidstosync = fileidstosync.fileids;
        // alert(fileidstosync.length);
        var stattus = true;
        for (var i = 0; i < fileidstosync.length; i++) {
            var file_id = fileidstosync[i];
            var res = await commons.upload_file_toS3(file_id, '.jpg');
            //  alert(res);
            if (res) {
                await databasehelper.update_filesync_status(file_id);
            }
            else {
                stattus = false;
            }
        }


        if (!stattus)
            return false;

        //     console.log("Requestdata>>>>>>>>>>>>>>>"+JSON.stringify(request_obj));
        // alert("Requestdata>>>>>>>>>>>>>>>"+JSON.stringify(request_obj));
        if (request_obj.widget.length > 0 || request_obj.device.length > 0) {


            return new Promise(async (resolve, reject) => {
                var aws_data = require("./config/AWSConfig.json");
                var aws_lamda = require("./config/AWSLamdaConfig.json");
                var acceestoken = await this.get_token();
                await fetch('' + aws_data.path + aws_data.stage + aws_lamda.bulkupdate, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': acceestoken
                    },
                    body: JSON.stringify(request_obj),
                }).then((response) => response.json())
                    .then(async (responseJson) => {
                        if (responseJson == "SUCCESS") {
                            await databasehelper.updatesynctime(commons.gettimestamp());
                            resolve("SUCCESS");
                        }
                        else {
                            resolve(responseJson);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        resolve(error);
                    });
            });
        }
        else {
            // console.log("everything is uptodate");
            return ("SUCCESS");
        }
    },

    async getuuid() {
        var uuid = await nativefucntions.uuid();
        return uuid;
    },
    renderIf(condition, content) {
        if (condition) {
            return content;
        } else {
            return null;
        }

    },
    isconnected() {
        return new Promise((resolve, reject) => {

            NetInfo.isConnected.fetch().then(isConnected => {

                if (isConnected)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },

    //navigate without stack history
    replaceScreen(ref, pagename, paramdata) {
        ref.props.navigation.replace(pagename, paramdata, []);
    },
    reset(ref, pagename, paramdata) {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: pagename })],
        });
        ref.props.navigation.dispatch(resetAction);
    },
    replacewithhomeandcurrent(ref, pagename, paramdata) {
        const resetAction = NavigationActions.reset({
            index: 1,
            actions: [NavigationActions.navigate({ routeName: "welcome" }),
            NavigationActions.navigate({ routeName: pagename })],
        });
        ref.props.navigation.dispatch(resetAction);
    },
    getIconUnavailable() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAACXBIWXMAABcSAAAXEgFnn9JSAAAKW2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMS0yMlQxODozNToyOS0wMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0xMS0yM1QyMjoxNTo1NS0wMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMTEtMjNUMjI6MTU6NTUtMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmY5NTY2YTRiLTUwZWItM2U0MC05OWU3LTVhMWI1YWE0N2U0NiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMDBiNTgxLWMyZDUtM2U0Mi04YjRlLWVkYTYzMzVkMzE2NiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iMTUwMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iMTUwMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjcwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNzAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgc3RFdnQ6d2hlbj0iMjAxNy0xMS0yMlQxODozNToyOS0wMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjI2Nzc2ZDQtYzYyMi0yYTQ3LTlkOWItZjY1NjZmODE3ODkzIiBzdEV2dDp3aGVuPSIyMDE3LTExLTIyVDIwOjE5OjMxLTAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYWIwMDUzOC1kMGRkLWQzNDktOTE5MS1jNjBkOTVkNzE0YWYiIHN0RXZ0OndoZW49IjIwMTctMTEtMjNUMjI6MTU6NTUtMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY5NTY2YTRiLTUwZWItM2U0MC05OWU3LTVhMWI1YWE0N2U0NiIgc3RFdnQ6d2hlbj0iMjAxNy0xMS0yM1QyMjoxNTo1NS0wMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YmFiMDA1MzgtZDBkZC1kMzQ5LTkxOTEtYzYwZDk1ZDcxNGFmIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsC+Yl8AAAS8SURBVHja7ZxraBRXFIB3FRWNhphI0ihqHpqCpRSFQiv2V3+Jsb5K6lujpjEBFW3qGtQ01Af4W6H4RzAaoQoKBR/U+IrPEOojaktFG426IZhkZzJJdt2dzfGcO7MZNzNqcGe2szt34GOXZfbOzrf3zj1z77nj6irNcxmQhVQgfyLPEB8iqK+JTOQcWpA6ZCuSbeTASMoOpBsBh9CLVH9IzFkHCRkI1SC3kZjzDpYS4cpAMVu5lH5+iYhJ5TJ0ZJCYn7gIHdtJzGUuQscNEuPlInR4XWrQw2VE00liOi09yI+5SE4M5BpjrZgOEtNhesHlBSCuGAfCXBcI85D56uvH8N07wLLFlePYsSwQ026+mPJPQVgwFLrWTQT/kUoIXqqBYP2xAdRC8PLRQfEav6+j7hD4azx4jEl4rCFWyDFZTNlUEBYOA2nzDAi3/QdWb+G2ZpAqvlT+iLIC+4oRi7NBXJwKfa9aIF5bn88L4tI0EFd/Yl8xdE3o3V8M8d56fytl1x37ipnjAn/tzriLCRzfxY5tXzHYU/hrtsVdjP/YThAK7S7msCf6VwcDEO54ideCVlOgsqjMKDG1OxJPjPzwKl6QRyvBWtmU2CjNBaFoFITuXUgCMU0XWftnPQcGfTGxbCz4ZrsgdPtcMtSYehCLRrJgLOZjlEwG4fsRWGPquBguhovhYriYjxazPh+ZAuKSVLYPA98rn+c7WAwNOJXkQHflLOiu+lah8httgMqxYtZMAHF5OsjPHmhDCd5HeKecxe7UnS0Ggzb55b/aMEJbM4rJ5GJYjWm+q9WY53/zGsPFcDFcDBdjmpgSZQKNBXOLxygsGsZOSH7cqIl52gTCAjcIC4dq+1HQR9+n8ZhkEyOuzgZp42fQs28RSNtmguT5GqQtM0DaMA3klodRcYy0+QtkurKPZ6bynU2fs1qUfGJWZbGYJdT4hxqwhNGCrAB9b0+IaJ/TPriF7pzDJpeBZWQmZ1MSl6WDUJQC8j/XBj3QLT9qUJoTSk3KpsQuvjSn/cNoNgcU+uvMB6WE7p1nc1Vi0Sg29ZvcvVJETiGN3Z59t5SmC0xgvxRHdNckB5sH7W9Uc+jElZqSoklxTBwT1axOa1LuUvNxR9cUxwV4ETlYO+giKz+5zdI6DKU4bmiT5GCPI64Zrw5DpBlLceSYb9lUlsZBtwL0no/58sFwLoaLGbSY+5eUDMvl6exeJyZWZIBvjovdOyW+mAdX2PBCV/F4pdbEAvZalIhIsU7Ci4HXvRBufcwyLE0By+oL9CSgGJ5qZiCm8P9JTvT//qvNkxMpnfXA2vinsx4sZ7XVvgnQFL0uTWNJhHFLgJbalTQ07LXsnTKPvYb081cQ7vRaL0VoA6lyFgjzTV9PYMUiiwL8oW6WxhHAth+8fgKCt04hJ03iFCszcGK3dizbL7J4+44ZAzq2LEedCqHhBFNgZbmVoJHGgZmUfEvEWLyQK0eZEzITKjMOC7n40j89PhLTykUYLxat5yJ03CQxHi5CRzWJGctF6MiMPPSiisvoZ+/Ax6Rc5VLyGoyeHzPE4c95uI4Mf9+jmPYgIQcJCSP7BvOMKmKyet2hrvy5GgR2JQl0Li+Qa+qzqfKMHLwB/D7/D1Y6wT4AAAAASUVORK5CYII='
    },
    async  SNSNotification(user) {
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        var Notificationid = await AsyncStorage.getItem("username");
        var emailId = Notificationid;
        var DhId = DeviceInfo.getUniqueID();


        var Ndata = {
            "userid": Notificationid,
            "emailid": emailId,
            "device": [{
                "id": DhId + "#android",
                "token": " "
            }]
        }

        var acceestoken = await this.get_token();
        await fetch('' + aws_data.path + aws_data.stage + aws_lamda.snspushnotification, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': acceestoken
            },
            body: JSON.stringify(Ndata),
        }).then((response) => response.json())
            .then((responseJson) => {


            })
            .catch((error) => {
                console.error(error);
            });
    },

    async  getsignedurl(bucketname, path, type) {
        /* AWS.config.update({
             accessKeyId: 'AKIAI6CRBBBWLMHSOYUA', secretAccessKey: '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'
         });
         var s3config = require("./config/AWSConfig.json");
 
         var s3 = new AWS.S3({ region: "us-west-2" });
         var params = { Bucket:bucketname , Key:path , ACL: 'public-read', ContentType: 'image/jpg', Expires:300 };
         var url = s3.getSignedUrl('putObject', params);*/
        var acceestoken = await this.get_token();
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        const response = await fetch('' + aws_data.path + aws_data.stage + aws_lamda.getPreSignedURL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization': acceestoken
            },
            body: JSON.stringify({ "path": path, "s3bucketname": bucketname, "type": type }),
        });
        const json = await response.json();
        return json.url;
    },


    //function to upload images to s3 -- handle single image
    async upload_file_toS3(filename, extension) {
        try {

            var username = await AsyncStorage.getItem("username");
            var s3config = require("./config/AWSConfig.json");
            var signedurl = await this.getsignedurl(s3config.s3bucketname, s3config.s3folder + "/" + username + "/" + filename + extension, "put");



            let dirs = RNFetchBlob.fs.dirs;

            const result = await RNFetchBlob.fetch('PUT', signedurl, {
                'Content-Type': 'image/jpg',
            }, RNFetchBlob.wrap(dirs.DocumentDir + s3config.localimagestore + filename + extension));

            //alert(result.respInfo.status);
            if (result.respInfo.status == 200)
                return true;
            else
                return false;

        }
        catch (error) {
            return false;
            //alert(error.message);
        }

    },


        //download image of shared stax
        async download_sharedimage_tocache(filename_remote,filename_local,username, extension) {

            var s3config = require("./config/AWSConfig.json");
            //var username = await AsyncStorage.getItem("username");
    
            let dirs = RNFetchBlob.fs.dirs;
            try {
                var exist = await RNFetchBlob.fs.exists(dirs.DocumentDir + s3config.localimagestore);
                if (!exist)
                    await RNFetchBlob.fs.mkdir(dirs.DocumentDir + s3config.localimagestore);
    
                const path = '' + s3config.s3path + '/' + s3config.s3bucketname + '/' + s3config.s3folder + '/' + username + '/' + filename_remote + extension;
                await RNFetchBlob.fs.unlink(dirs.DocumentDir + s3config.localimagestore + filename_local + extension);
    
                var result = await RNFetchBlob.config({
                    // response data will be saved to this path if it has access right.
                    fileCache: true,
                    path: dirs.DocumentDir + s3config.localimagestore + filename_local + extension
                }).fetch('GET', path, {});
    
                //   var bs64 = await result.base64();
                //  alert(result.path() + ">>>size>>>" + bs64.length);
                return true;
            }
            catch (error) {
                //alert(error.message);
                return false;
            }
    
        },



    //download files from s3
    async download_file_tocache(filename, extension) {

        var s3config = require("./config/AWSConfig.json");
        var username = await AsyncStorage.getItem("username");

        let dirs = RNFetchBlob.fs.dirs;
        try {
            var exist = await RNFetchBlob.fs.exists(dirs.DocumentDir + s3config.localimagestore);
            if (!exist)
                await RNFetchBlob.fs.mkdir(dirs.DocumentDir + s3config.localimagestore);

            const path = '' + s3config.s3path + '/' + s3config.s3bucketname + '/' + s3config.s3folder + '/' + username + '/' + filename + extension;
            await RNFetchBlob.fs.unlink(dirs.DocumentDir + s3config.localimagestore + filename + extension);

            var result = await RNFetchBlob.config({
                // response data will be saved to this path if it has access right.
                fileCache: true,
                path: dirs.DocumentDir + s3config.localimagestore + filename + extension
            }).fetch('GET', path, {});

            //   var bs64 = await result.base64();
            //  alert(result.path() + ">>>size>>>" + bs64.length);
            return true;
        }
        catch (error) {
            //alert(error.message);
            return false;
        }

    },
    //download files from s3
    async store_download_file_tocache(storeimage_path, filename, extension) {

        var s3config = require("./config/AWSConfig.json");
        //  var username = await AsyncStorage.getItem("username");

        let dirs = RNFetchBlob.fs.dirs;
        try {
            var exist = await RNFetchBlob.fs.exists(dirs.DocumentDir + s3config.localimagestore);
            if (!exist)
                await RNFetchBlob.fs.mkdir(dirs.DocumentDir + s3config.localimagestore);

            const path_down = storeimage_path; //'' + s3config.s3path + '/' + s3config.s3bucketname + '/' + s3config.s3storefolder + '/' + filename + extension;
            await RNFetchBlob.fs.unlink(dirs.DocumentDir + s3config.localimagestore + filename + extension);

            var result = await RNFetchBlob.config({
                // response data will be saved to this path if it has access right.
                fileCache: true,
                path: dirs.DocumentDir + s3config.localimagestore + filename + extension
            }).fetch('GET', path_down, {});

            var bs64 = await result.base64();
            console.log(result.path() + ">>>size>>>" + bs64.length);
            return true;
        }
        catch (error) {
            //alert(error.message);
            return false;
        }

    },
    //download language files from s3 for multilanguage
    async download_language_file_tocache(storeimage_path, filename, extension) {

        
        var s3config = require("./config/AWSConfig.json");
        //  var username = await AsyncStorage.getItem("username");

        let dirs = RNFetchBlob.fs.dirs;
        //alert(dirs.DocumentDir);
        try {
            var exist = await RNFetchBlob.fs.exists(dirs.DocumentDir + s3config.locallanguagestore);
            if (!exist)
                await RNFetchBlob.fs.mkdir(dirs.DocumentDir + s3config.locallanguagestore);

            const path_down = storeimage_path+filename + extension; //'' + s3config.s3path + '/' + s3config.s3bucketname + '/' + s3config.s3storefolder + '/' + filename + extension;
            await RNFetchBlob.fs.unlink(dirs.DocumentDir + s3config.locallanguagestore + filename + extension);
            console.log("path"+dirs.DocumentDir + s3config.locallanguagestore + filename + extension);
            var result = await RNFetchBlob.config({
                // response data will be saved to this path if it has access right.
                fileCache: true,
                path: dirs.DocumentDir + s3config.locallanguagestore + filename + extension
            }).fetch('GET', path_down, {});
            //alert(JSON.stringify(result));
            var bs64 = await result.base64();
            //alert(result.path() + ">>>size>>>" + bs64.length);
            return true;
        }
        catch (error) {
            //alert(error.message);
            return false;
        }

    },
    async CognitoLogout() {
        var aws_data11 = await require("./config/AWSConfig.json");
       /* const awsCognitoSettings = {
            UserPoolId: 'us-west-2_wf8naaz4L',
            ClientId: '274mf2e9pblfadhb1ssfccg8ba'
        };
*/
        const awsCognitoSettings = {
            UserPoolId:aws_data11.UserPoolId,
            ClientId: aws_data11.ClientId
        };

        var cognitoParams = {
            IdentityPoolId:aws_data11.IdentityPoolId,// "us-west-2:2ab8f260-0d64-4bed-9dcc-f9566abacd25"
        };
        var credentials = new AWS.CognitoIdentityCredentials(cognitoParams);
        credentials.clearCachedId();
        /*const awsCognitoSettings = {
            UserPoolId: 'us-west-2_wf8naaz4L',
            ClientId: '274mf2e9pblfadhb1ssfccg8ba'
        };
        const userPool = new CognitoUserPool(awsCognitoSettings);
        var username=await AsyncStorage.getItem("username");
        var userData = {
                            Username : username,
                            Pool : userPool
                         };
        const cognitoUser = new CognitoUser(userData);
        if (cognitoUser != null) {
            cognitoUser.signOut();
          } */
    },
    async writelog(screen, operation, time, ) {
        if (enable_logging) {
            var username = await AsyncStorage.getItem("username");
            var content = screen + "," + operation + "," + time;
            if (username == null)
                username = await this.getuuid();
            var res = await nativefucntions.write_logs(content, username);
            return res;
        }

    },


    async getfile_uri(widgetid, extension) {
        var s3config = require("./config/AWSConfig.json");
        var username = await AsyncStorage.getItem("username");
        let dirs = RNFetchBlob.fs.dirs;
        if (widgetid != null && widgetid.contains("#"))
            widgetid = widgetid.split("#")[0];
        try {
            var filepath = dirs.DocumentDir + s3config.localimagestore + widgetid + extension;
            var exist = await RNFetchBlob.fs.exists(filepath);
            if (exist) {

                return 'file://' + filepath;
            }
            else {
                return '' + s3config.s3path + '/' + s3config.s3bucketname + '/' + s3config.s3folder + '/' + username + '/' + widgetid + extension;
            }
        }
        catch (err) {
            // alert(err.message);
            return 'data:image/png;base64';
        }
    },

    isimagevalid(widgetdata) {
        if (widgetdata.hasOwnProperty("backgroundpicture") && widgetdata["backgroundpicture"] != null && widgetdata["backgroundpicture"] != "" && widgetdata["backgroundpicture"] != "undefined" && widgetdata["backgroundpicture"] != "null" && widgetdata["backgroundpicture"].startsWith("file") && widgetdata.hasOwnProperty("fileid") && widgetdata.fileid != null && widgetdata.fileid != "")
            return true;
        else
            return false;
    },
    isremoteurl(url) {

        if (url.startsWith("file"))
            return false;
        else
            return true;
    },
    async deletefile(filename, extension) {
        var s3config = require("./config/AWSConfig.json");
        let dirs = RNFetchBlob.fs.dirs;
        var DEST_PATH = dirs.DocumentDir + s3config.localimagestore + filename + extension;
        await RNFetchBlob.fs.unlink(DEST_PATH);
    },

    async savefile(SRC_PATH, filename, extension) {
        var s3config = require("./config/AWSConfig.json");
        let dirs = RNFetchBlob.fs.dirs;
        try {
            var exist = await RNFetchBlob.fs.exists(dirs.DocumentDir + s3config.localimagestore);
            if (!exist)
                await RNFetchBlob.fs.mkdir(dirs.DocumentDir + s3config.localimagestore);

            var DEST_PATH = dirs.DocumentDir + s3config.localimagestore + filename + extension;
            await RNFetchBlob.fs.unlink(DEST_PATH);
            await RNFetchBlob.fs.cp(SRC_PATH, DEST_PATH)
            return true;
        }
        catch (err) {
            // alert(err.message);
            return false;
        }


    },
    gettime_diff_withrecord(recordedtime) {
        var recorded_time = parseFloat(recordedtime);
        var curr_time = parseFloat(this.gettimestamp());
        return curr_time - recorded_time;
    },

    getDateDifference(days) {
        console.log("days:" + days);
        var dt = new Date();
        var formatteddate = Moment(dt, 'YYYY-MM-DD HH:mm:ss.SSS');
        var resultDate = Moment(formatteddate).subtract(days, 'day').format('YYYYMMDDHHmmssSSS');
        return resultDate;
    },
    getDateDifference1() {// console.log("days:"+days);
        var dt = new Date();
        var formatteddate = Moment(dt, 'YYYY').format('YYYY');
        return formatteddate + "0101000000000";
    },
    getDateDifference2() {// console.log("days:"+days);
        var dt = new Date();
        var formatteddate = Moment(dt, 'YYYY');
        var resultDate = Moment(formatteddate).subtract(1, 'year').format('YYYY');

        return resultDate + "0101000000000";
    },
    getFullHTML(facebook, medium) {
        var height = Dimensions.get('window').height;
        var width = Dimensions.get('window').width;
        height = Math.round(height) + "px";
        width = (Math.round(width) - 5) + "px";

        if (medium == 'facebook') {
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple todo with React</title>

      <style>
      .not-active {
        pointer-events: none;
        cursor: default;
        text-decoration: none;
        color: black;
        
      }
        </style>
  </head>
  <body>
  
  <div id="fb-root"></div>
        <script src="//connect.facebook.net/en_US/all.js"></script>
        <script>(function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&autoLogAppEvents=1&version=v3.0&appId=760632257475072';
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));</script>
        
        <div class="fb-page" data-href="`+ facebook + `" data-tabs="timeline" data-width="` + width + `" data-height="` + height + `"   data-small-header="true" data-adapt-container-width="true" data-hide-cover="true" data-show-facepile="false"><blockquote cite="` + facebook + `" class="fb-xfbml-parse-ignore"></blockquote></div>
        
  </body>
  </html>
    `



    );
        }
        else if (medium == 'instagram')
            return (`
            <html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
    height:100%;
    width:100%;
    margin:0;
}
.h_iframe iframe {
    width:100%;
    height:100%;
}
.h_iframe {
    height: 100%;
    width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
    `); else if (medium == 'twitter')
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple todo with React</title>
      <style>
      .not-active {
        pointer-events: none;
        cursor: default;
        text-decoration: none;
        color: black;
      }
        </style>
  </head>
  <body>
  
 
        <a class="twitter-timeline" href="`+ facebook + `"> </a>
       
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
       
        
        
  </body>
  </html>
    `); else if (medium == 'youtube')
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple todo with React</title>
      <style>
      .not-active {
        pointer-events: none;
        cursor: default;
        text-decoration: none;
        color: black;
      }
      html, body {
        height:100%;
        width:100%;
        margin:0;
    }
    .h_iframe iframe {
        width:100%;
        height:100%;
    }
    .h_iframe {
        height: 100%;
        width:100%;
    }
    </style>
    </head>
    <body>
    <div class="h_iframe">    
  <iframe src="https://www.youtube.com/embed/+lastest?list=`+facebook+`" frameborder="0" ></iframe><br/>
  </div>     
        
  </body>
  </html>
    `); else if (medium == 'pinterest')
            return (`
            <html lang="en">
            <head>
            <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Simple todo with React</title>
            <style>
            .not-active {
            
            cursor: default;
            text-decoration: none;
            color: black;
            }
            html, body {
                height:100%;
                width:100%;
                margin:0;
            }
            .h_iframe iframe {
                width:100%;
                height:100%;
            }
            .h_iframe {
                height: 100%;
                width:100%;
            }
            </style>
            </head>
            <body>
            <div class="h_iframe">   
            <iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
            </div>     
            
            </body>
            </html>
    `);else if (medium == 'website')
    return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
    height:100%;
    width:100%;
    margin:0;
}
.h_iframe iframe {
    width:100%;
    height:100%;
}
.h_iframe {
    height: 100%;
    width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`);else if (medium == 'donate')
return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
height:100%;
width:100%;
margin:0;
}
.h_iframe iframe {
width:100%;
height:100%;
}
.h_iframe {
height: 100%;
width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`); 
    },
    getHTML(facebook, medium) {
        var height = Dimensions.get('window').height;
        var width = Dimensions.get('window').width;
        height = Math.round(height) + "px";
        width = (Math.round(width) - 5) + "px";

        if (medium == 'facebook') {
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" >
      <title>Simple todo with React</title>

      <style>
      .not-active {
        //pointer-events: none;
        cursor: default;
        text-decoration: none;
        color: black;
        
      }
        </style>
  </head>
  <body>
  
  <div id="fb-root"></div>
        <script src="//connect.facebook.net/en_US/all.js"></script>
        <script>(function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&autoLogAppEvents=1&version=v3.0&appId=760632257475072';
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));</script>
        <div class="not-active">   
        <div class="fb-page" data-href="`+ facebook + `" data-tabs="timeline" data-width="` + width + `" data-height="` + height + `"   data-small-header="true" data-adapt-container-width="true" data-hide-cover="true" data-show-facepile="false"><blockquote cite="` + facebook + `" class="fb-xfbml-parse-ignore"></blockquote></div>
        </div>
  </body>
  </html>
    `);
        }
        else if (medium == 'instagram')
            return (`
            <html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
    height:100%;
    width:100%;
    margin:0;
}
.h_iframe iframe {
    width:100%;
    height:100%;
}
.h_iframe {
    height: 100%;
    width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
    `); else if (medium == 'twitter')
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple todo with React</title>
      <style>
      .not-active {
        
        cursor: default;
        text-decoration: none;
        color: black;
      }
        </style>
  </head>
  <body>
  
        <div class="not-active">   
        <a class="twitter-timeline" href="`+ facebook + `"> </a>
        </div>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
       
        
        
  </body>
  </html>
    `); else if (medium == 'youtube')
            return (`
  <html lang="en">
  <head>
      <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple todo with React</title>
      <style>
      .not-active {
       
        cursor: default;
        text-decoration: none;
        color: black;
      }
      html, body {
        height:100%;
        width:100%;
        margin:0;
    }
    .h_iframe iframe {
        width:100%;
        height:100%;
    }
    .h_iframe {
        height: 100%;
        width:100%;
    }
    </style>
    </head>
    <body>
    <div class="h_iframe">   
    <iframe src="https://www.youtube.com/embed/+lastest?list=`+facebook+`" frameborder="0" ></iframe><br/>
  </div>     
        
  </body>
  </html>
    `); else if (medium == 'pinterest')
            return (`
            <html lang="en">
            <head>
            <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>Simple todo with React</title>
            <style>
            .not-active {
            
            cursor: default;
            text-decoration: none;
            color: black;
            }
            html, body {
                height:100%;
                width:100%;
                margin:0;
            }
            .h_iframe iframe {
                width:100%;
                height:100%;
            }
            .h_iframe {
                height: 100%;
                width:100%;
            }
            </style>
            </head>
            <body>
            <div class="h_iframe">   
            <iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
            </div>     
            
            </body>
            </html>
    `);else if (medium == 'donate')
    return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
    height:100%;
    width:100%;
    margin:0;
}
.h_iframe iframe {
    width:100%;
    height:100%;
}
.h_iframe {
    height: 100%;
    width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`);else if (medium == 'website')
return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
height:100%;
width:100%;
margin:0;
}
.h_iframe iframe {
width:100%;
height:100%;
}
.h_iframe {
height: 100%;
width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`);else if (medium == 'google')
return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
height:100%;
width:100%;
margin:0;
}
.h_iframe iframe {
width:100%;
height:100%;
}
.h_iframe {
height: 100%;
width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="https://www.google.com" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`);else if (medium == 'common')
return (`
<html lang="en">
<head>
<meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Simple todo with React</title>
<style>
.not-active {

cursor: default;
text-decoration: none;
color: black;
}
html, body {
height:100%;
width:100%;
margin:0;
}
.h_iframe iframe {
width:100%;
height:100%;
}
.h_iframe {
height: 100%;
width:100%;
}
</style>
</head>
<body>
<div class="h_iframe">   
<iframe width="100%"  src="`+facebook+`" frameborder="0"></iframe><br/>
</div>     

</body>
</html>
`); 
    },
isJsonstring(str) {
        try {
           var m= JSON.parse(str);
           
           if(m==null || !m instanceof Array)
           return false;
         
        } catch (e) {
            return false;
        }
        return true;
    },
    //dynamic json file Reader for multi language file reading
async jsonReader(str)
{
  var s3config = require("./config/AWSConfig.json"); 
  //var json=require("/data/com.aprrow/files/cachedlanguage/language.json");
  let dirs = RNFetchBlob.fs.dirs;
  var path=dirs.DocumentDir + s3config.locallanguagestore + str+".json"
  //var path="/data/user/0/com.aprrow/files/cachedlanguage/"+str+".json";
  var lan=await AsyncStorage.getItem("lan");
  //console.log("read ok");
  if(str!=lan)
  {
  await RNFetchBlob.fs.readFile(path, 'utf8')
  .then(async (data) => {
    // handle the data ..
    //console.log(data);
    try{
    var data22={str:JSON.parse(data)};
    }catch(err)
    {
        //alert(err);
    }
    //  console.log("s3"+JSON.stringify(data22));
    //console.log(JSON.stringify(data22));
        await Strings.setContent(data22);
        
        await Strings.setLanguage(str);
        await AsyncStorage.setItem("lan",str);
    //  this.replaceScreen(this,"loading"); 
           

  })
  return true; 
    }
  else
  return false;
    

},
//setting the app language
async setLanguage()
{
  
  var lan=await AsyncStorage.getItem("lan");
  
  if(lan!=null)
  {
  var s3config = require("./config/AWSConfig.json"); 
  let dirs = RNFetchBlob.fs.dirs;
  var path=dirs.DocumentDir + s3config.locallanguagestore + lan+ ".json"
  RNFetchBlob.fs.readFile(path, 'utf8')
  .then(async (data) => {
    // handle the data ..
   
    var data22={lan:JSON.parse(data)};
   
    //    console.log("s3"+JSON.stringify(data22));
    
        Strings.setContent(data22);
        
        Strings.setLanguage(lan);
        await AsyncStorage.setItem("lan",lan);
    

  })
    
 }else{
    var locale = NativeModules.I18nManager.localeIdentifier;
    var localeArray=locale.split("_");
    if(localeArray.length>0)
    locale=localeArray[0];
    if(this.isconnected())
    {
            var username=await AsyncStorage.getItem("username");
            var aws_data=require("./config/AWSConfig.json"); 
            var aws_lamda = require("./config/AWSLamdaConfig.json");     
            var acceestoken=await this.get_token();
            var urlName="";
            if (username == null || username == commons.guestuserkey()) {     
                urlName=aws_lamda.commenapis;
              }
              else
              {
                urlName=aws_lamda.multilanguage;
              }   
              //alert(aws_data.path+aws_data.stage+urlName)
            await fetch(''+aws_data.path+aws_data.stage+urlName, {
                    method: 'POST',
                    headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization':acceestoken
                                
                                },
                    body: JSON.stringify({
                    "operation":"checkLanguageExists",
                    "languageCode":locale
                                        }),
                    }).then((response) => response.json())
                    .then(async (responseJson) => {
                        //alert(JSON.stringify(responseJson));
                        try{
                        if(responseJson.status)
                        {
                        var str=locale;
                        var aws_data11 = require("./config/AWSConfig.json");
                        var path=aws_data11.s3path+"/"+aws_data11.s3bucketname+"/"+aws_data11.s3languagefolder+"/"+aws_data11.s3languagesubfolder+"/";
                        
                        var connectionstatus = await this.isconnected();
                        if (connectionstatus)
                        { 
                        await this.download_language_file_tocache(path,str,".json");
                    
                        var data=await this.jsonReader(str);
                        
                        }
                        } 
                    }catch(err)
                    {

                    }
                    
                    })
                    .catch((error) => {
                    console.error(error);
                    });

    }else{
        if(locale=="pt")
        {   //alert(locale);
        var data22=require("./utils/pt-BR.json");
        Strings.setContent(data22);
        
        Strings.setLanguage("pt");
        await AsyncStorage.setItem("lan",locale);
        }

    }
   // alert(locale);

    
    console.log(locale);
 }
   
    
}

}
export default commons;