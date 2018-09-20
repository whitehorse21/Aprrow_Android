import {AsyncStorage, ToastAndroid} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import nativefucntions from './nativemodules/Toast.js';
import databasehelper from './utils/databasehelper.js';
import commons from './commons.js';

const intervalId = {};
const smartstaxservice = {

    starservice() {
          intervalId = BackgroundTimer.setInterval(async () => {
    var SmartFlag1 =await commons.checkSmartFlag();
   
    if(SmartFlag1==true)
    {   
           
         //   ToastAndroid.show("Enter in service",500); 
           //console.log("running appstatistics service");
            const username = await AsyncStorage.getItem("username");
            const deviceid = await AsyncStorage.getItem("currentdeviceid");
            const lastlocation1 = await AsyncStorage.getItem("lastlocation");
            
            var   enabled_app_usage_permission = await nativefucntions.checkappusagepermission()
            var   connected = await commons.isconnected();
         //   ToastAndroid.show("App list====>>"+JSON.stringify(enabled_app_usage_permission),500); 
            //console.log("<username>"+username+"<deviceid>"+deviceid+"<connected>"+connected+"<enabled_app_usage_permission>"+enabled_app_usage_permission);
            // alert("<lastlocation>"+JSON.stringify(lastlocation));

            if (username == null || username == commons.guestuserkey()) {              
                return;
            }
           if (deviceid != null && enabled_app_usage_permission) 
           {
          //  ToastAndroid.show("in app usage permission====>>",500); 
                 var rApps=await nativefucntions.getappsusedinlastfiveminutes();
                  var recent_apps       = JSON.parse(rApps);

          ///  ToastAndroid.show("recent_apps====>>"+recent_apps.length,500);   
                  var appList={}
                  var appNameList={}
                  var allappTotalTimeInForeground={}
                  if(recent_apps.length>0)
                  {
                      for(var i=0;i<recent_apps.length;i++)
                      { 
                          appList[recent_apps[i]["packagename"]]="1";
                          appNameList[recent_apps[i]["packagename"]]=recent_apps[i]["appname"];
                          allappTotalTimeInForeground[recent_apps[i]["packagename"]]=recent_apps[i]["time"];
                      }
                  }

               // alert("allappTotalTimeInForeground===========>>>>"+JSON.stringify(allappTotalTimeInForeground));
                /*recent_apps="[{\"packagename\":\"com.google.android.gm\",\"time\":3941611,\"lasttimeused\":1526967909551},
                {\"packagename\":\"com.approw\",\"time\":342976566,\"lasttimeused\":1526967907628}]"*/
               // var lastknowllocation = await AsyncStorage.getItem("lastlocation");   
               // console.log("recent_apps=============>>>>"+JSON.stringify(recent_apps));
               // console.log("appList=============>>>>"+JSON.stringify(appList));
               
                var uuid = await commons.getuuid();
                var time = await commons.gettimestamp_readable();
   
            navigator.geolocation.getCurrentPosition(async (position) => { 

                var locationobj = {};
                locationobj["lat"]      = ""+position.coords.latitude;
                locationobj["long"]     = ""+position.coords.longitude;                                     
                locationobj["speed"]    = ""+position.coords.speed;
                locationobj["accuracy"] = ""+position.coords.accuracy;
                locationobj["provider"] = "NA";                  
                await AsyncStorage.setItem("lastlocation",JSON.stringify(locationobj));  
            });

          //  var lastlocation1 = await AsyncStorage.getItem("lastlocation");
            var lastlocation ={};

            if(lastlocation1!=null)
            { lastlocation=JSON.parse(lastlocation1); }

           
            var llat="";
            var llong="";
            var lspeed="0";
            var laccuracy="0";

            if(lastlocation.hasOwnProperty("lat"));
                llat=lastlocation.lat; 

            if(lastlocation.hasOwnProperty("long") );
                llong=lastlocation.long;

            if(lastlocation.hasOwnProperty("speed") );
            lspeed=lastlocation.speed;
            
            if(lastlocation.hasOwnProperty("accuracy") );
            laccuracy=lastlocation.accuracy;

                var smartObj = {};
                    smartObj["lat"]      = ""+llat;
                    smartObj["long"]     = ""+llong;                                     
                    smartObj["speed"]    = ""+lspeed;
                    smartObj["accuracy"] = ""+laccuracy;
                    smartObj["provider"] = "NA";

                    smartObj["dateTime"]  = time;
                    smartObj["appList"]   = appList;
                    smartObj["appNameList"]   = appNameList;
                    smartObj["allappTotalTimeInForeground"]=allappTotalTimeInForeground;
                    smartObj["historyid"] = uuid;                      

                   var sInput={};
                       sInput["userid"]   =username;
                       sInput["deviceid"] =deviceid;
                       sInput["payload"]  =smartObj;
                       sInput["operation"]="insertAppsListnew";
                     

                      // ToastAndroid.show("sInput====>>"+JSON.stringify(sInput),500);   
                       var aws_data = require("./config/AWSConfig.json");
                       var aws_lamda = require("./config/AWSLamdaConfig.json");
                       //https://oieq9ievn2.execute-api.us-west-2.amazonaws.com/beta/smartstaxmgmt
                       //https://oieq9ievn2.execute-api.us-west-2.amazonaws.com/beta/smartStaxMgmt
                     //  alert("yyy=====>>>"+JSON.stringify(sInput));
                      // console.log("===>>"+'' + aws_data.path + aws_data.stage + 'smartStaxMgmt');
                      var acceestoken=await commons.get_token();
                        fetch(''+aws_data.path+aws_data.stage+aws_lamda.smartstaxmgmt, {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization':acceestoken
                            },
                            body:JSON.stringify(sInput)
                        }).then((response) => response.json())
                            .then((responseJson) => 
                            {                            
                                console.log("smart responseJson=>"+JSON.stringify(responseJson));  
                               // alert("smart responseJson=>"+JSON.stringify(responseJson));   
                              //  ToastAndroid.show("responseJson====>>"+JSON.stringify(responseJson),500);                                
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                   
            }

        }
        },300000);// 1 minutes //300000//60000
    },

    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default smartstaxservice;
