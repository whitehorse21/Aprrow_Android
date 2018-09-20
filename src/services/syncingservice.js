import {
    DeviceEventEmitter,
    NativeAppEventEmitter,
    Platform,
} from 'react-native';

import BackgroundTimer from 'react-native-background-timer';
import ToastExample from './nativemodules/Toast';

const intervalId={};
const backgroundservice = {
    starservice() {
        intervalId  = BackgroundTimer.setInterval(() => {
            var curtime=new Date().toLocaleString();
            ToastExample.show('curr time :: '+curtime, ToastExample.SHORT);

        }, 5000);
    },
    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default backgroundservice;
