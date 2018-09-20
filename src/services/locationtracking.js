import {
    AsyncStorage
} from 'react-native';

import BackgroundTimer from 'react-native-background-timer';
import commons from '../commons.js';

const intervalId = {};
const Locationtracker = {
    async  starservice() {

        var username_temp = await AsyncStorage.getItem("username");
        if (username_temp == null || username_temp == commons.guestuserkey()) {

            return;
        }
        intervalId = BackgroundTimer.setInterval(async () => {
            //console.log("tracking service running");
            const username = await AsyncStorage.getItem("username");
            const deviceid = await AsyncStorage.getItem("currentdeviceid");;
            const connected = commons.isconnected();

            if (username != null && deviceid != null && connected) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        var request_obj = {}
                        request_obj["username"] = username;
                        request_obj["locationdata"] = {};
                        request_obj["locationdata"]["locationdata"] = [];
                        request_obj["locationdata"]["deviceid"] = deviceid;

                        var locationdata = [];
                        ///need to looped from collection of locationdata



                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        var time = commons.gettimestamp_readable();
                        var speed = position.coords.speed;
                        var provider = "NA";
                        var accuracy = position.coords.accuracy;

                        var locationobj = {};
                        locationobj["lat"] = lat;
                        locationobj["lng"] = lng;
                        locationobj["time"] = time;
                        locationobj["provider"] = provider;
                        locationobj["speed"] = speed;
                        locationobj["accuracy"] = accuracy;

                        // console.log("locationobj=========>>>"+JSON.stringify(locationobj));
                        AsyncStorage.setItem("lastlocation", JSON.stringify(locationobj));
                        locationdata.push(locationobj);
                        request_obj["locationdata"]["locationdata"] = locationdata;

                        //send location data to server
                        var aws_data = require("../config/AWSConfig.json");
                        var acceestoken = await commons.get_token();
                        fetch('' + aws_data.path + aws_data.stage + 'bulklocationupdation', {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': acceestoken
                            },
                            body: JSON.stringify(request_obj),
                        }).then((response) => response.json())
                            .then((responseJson) => {
                                if (responseJson == "LOC SUCCESS") {
                                    console.log("location data uploaded");
                                    //    nativefucntions.show(" usernme : " + username + "deviceid : " + deviceid + "done uploading", nativefucntions.SHORT);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    },
                    (error) => console.log(error.message),
                    { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
                );
            }
        }, 300000);//300000   ///interval time is five minutes
    },

    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default Locationtracker;
