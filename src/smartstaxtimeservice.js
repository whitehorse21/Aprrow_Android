import {AsyncStorage, ToastAndroid} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import nativefucntions from './nativemodules/Toast.js';
import databasehelper from './utils/databasehelper.js';
import commons from './commons.js';
var DeviceInfo = require('react-native-device-info');

const intervalId = {};
const smartStaxTimeGap=6;
const smartstaxtimeservice = {

starservice() {
  intervalId = BackgroundTimer.setInterval(async () => {

   var SmartFlag1 = await commons.checkSmartFlag();   
   var connected  = await commons.isconnected();  
   var enabled_app_usage_permission = await nativefucntions.checkappusagepermission();
   var userName   = await AsyncStorage.getItem("username");
   var deviceid   = await AsyncStorage.getItem("currentdeviceid");

   if(SmartFlag1==true)
   {     
    if(userName == null || userName == commons.guestuserkey()) 
        return;
        
    if (deviceid != null && enabled_app_usage_permission) 
    {        
          
        var lastusedDtls  =await databasehelper.getSmartLastUsedApps(deviceid,type);                
        var rApps         =await nativefucntions.getappsusedinlastfiveminutes();
        var recent_apps   = JSON.parse(rApps);                 

        var appList={};
        var appNameList={};
        var allappTotalTimeInForeground={};        
        var currentTimegroupid="";

        if(recent_apps.length>0)
        {
            for(var i=0;i<recent_apps.length;i++)
            { 
                appList[recent_apps[i]["packagename"]]="1";
                appNameList[recent_apps[i]["packagename"]]=recent_apps[i]["appname"];
                allappTotalTimeInForeground[recent_apps[i]["packagename"]]=recent_apps[i]["time"];
            }
        }

        if(lastusedDtls.hasOwnProperty("deviceid"))
        {
            var filterdAppData= await getAppList(lastusedDtls.appList,lastusedDtls.appNameList,lastusedDtls.timeTotalTimeInForeground,appList,appNameList,allappTotalTimeInForeground);
            
            appList=filterdAppData.appList;
            appNameList=filterdAppData.appNameList;
            allappTotalTimeInForeground=filterdAppData.allappTotalTimeInForeground;

            lastusedDtls.appList=filterdAppData.latestappList;
            lastusedDtls.appNameList=filterdAppData.latestappNameList;
            lastusedDtls.timeTotalTimeInForeground=filterdAppData.allappTotalTimeInForeground;                  
        }
             
        var time    = await commons.gettimestamp_readable();
        var timeDtl = await commons.gettimegroupid_UTC();        
        var result  = await databasehelper.getSmartTimeApps(timeDtl.timegroupid,deviceid);

            currentTimegroupid=timeDtl.timegroupid;

        var existingtimegroupid="";
        if(result.hasOwnProperty(data))
        {
            var mergedAppList= setAppsPriority(result.data.appList,result.data.appNameList,appList,appNameList);
            appList=mergedAppList.appList;
            appNameList=mergedAppList.appNameList;
            existingtimegroupid=currentTimegroupid;
        }    

        var smartObj = {};
            smartObj["dateTime"]     = time;
            smartObj["userid"]       = userName;
            smartObj["deviceid"]     = deviceid;
            smartObj["timegroupid"]  = currentTimegroupid;
            smartObj["dayNo"]        = timeDtl.dayNo;
            smartObj["hourNo"]       = timeDtl.hourNo;                
            smartObj["appList"]      = appList;
            smartObj["appNameList"]  = appNameList;

        if(existingtimegroupid!="")
        {
            await databasehelper.updateSmartTimeApps(smartObj,existingtimegroupid);                       
        }
        else
        {
            await databasehelper.insertSmartTimeApps(smartObj);
        }
               
            lastusedDtls.dateTime=time;                   
        if(lastusedDtls.hasOwnProperty("deviceid"))   
        {  
            await databasehelper.updateSmartLastUsedApps(lastusedDtls,deviceid,type);
        }
        else
        { 
            lastusedDtls.deviceid=deviceid;
            lastusedDtls.locationTotalTimeInForeground={};
            lastusedDtls.timeLastUpdatedTime="";
            lastusedDtls.locationLastUpdatedTime="";
            lastusedDtls.appNameList=appNameList;
            lastusedDtls.appList=appList;
            lastusedDtls.timeTotalTimeInForeground=allappTotalTimeInForeground;
            lastusedDtls.timeBasedUpdatedArray=[];

            await databasehelper.insertSmartLastUsedApps(lastusedDtls);   
        }

        var res = lastusedDtls["timeBasedUpdatedArray"];
                    console.log("\n=connected===>>"+connected);
        if(connected)
        {
            if(res.length>0)
            {                        
                for(var index=0;index<res.length;index++)
                {
                    var updateTime=res[index]; //{"date":"","dayNo":"","hourNo":"","timeGroupId":""}
                        console.log("updateTime====>>>"+updateTime+"=time==>>"+time);
                        lastusedDtls.timeLastUpdatedTime=updateTime.date;
                           
                    var timeIdAppsList=await databasehelper.getPreviousTimePeriodApps(updateTime.dayNo,updateTime.hourNo,deviceid,smartStaxTimeGap);
                        console.log("\n=result===>>"+JSON.stringify(timeIdAppsList));
                                       
                    var sInput={};
                        sInput["operation"]   =  "insertAndFetchTimeApps";  
                        sInput["userid"]      =  userName;
                        sInput["deviceid"]    =  deviceid;
                        sInput["payload"]     =  smartObj;
                        sInput["timeApps"]    =  timeIdAppsList; 
                        sInput["timeGroupId"] =  updateTime.timeGroupId;
                        sInput["dayNo"]       =  updateTime.dayNo;
                        sInput["hourNo"]      =  updateTime.hourNo;         
                    
                    var aws_data = require("./config/AWSConfig.json");
                    var aws_lamda = require("./config/AWSLamdaConfig.json");                       
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
                        .then(async(responseJson) => 
                    {  
                        if(responseJson.hasOwnProperty("data"))
                        {
                            if(responseJson.data.length>0)
                            {
                                var nextDynamoApps=responseJson.data;
                                var nextSqlitApps=await databasehelper.getNextTimePeriodApps(updateTime.dayNo,updateTime.hourNo,deviceid,smartStaxTimeGap);
                                var enterObj={"insertList":[],"updateList":[]};
                                
                                if(nextSqlitApps.datalength==0)
                                    enterObj.insertList=nextDynamoApps;
                                else
                                {
                                    for(count==0;count<nextDynamoApps.length;count++)
                                    {
                                        var nextDynamoObj=nextDynamoApps[count];
                                        if(nextSqlitApps.hasOwnProperty(nextDynamoObj.timeGroupId))
                                        {   
                                            var nextSqlitAppsData=nextSqlitApps[nextDynamoObj.timeGroupId];                                                          
                                            var mergedList= setAppsPriority(nextSqlitAppsData.appList,nextSqlitAppsData.appNameList,nextDynamoObj.appList,nextDynamoObj.appNameList);
                                            nextDynamoObj.appList=mergedList.appList;
                                            nextDynamoObj.appNameList=mergedList.appNameList;                                                                       
                                            enterObj.updateList.push(nextDynamoObj);                                                                                                               
                                        } 
                                        else
                                        {
                                            enterObj.insertList.push(nextDynamoObj);
                                        }                                                                      
                                    }
                                } 

                                console.log("DynamoObj to Sqlite===>>>"+JSON.stringify(enterObj));                                                        
                                await databasehelper.timeStaxDbIntagration(enterObj.insertList,enterObj.updateList);
                            
                                console.log("currentTimegroupid===>>"+currentTimegroupid);
                                if(timeIdAppsList.length>0)
                                {   
                                   await databasehelper.deletePreviousTimeApps(timeIdAppsList,currentTimegroupid); 
                                }                                                         
                            }
                        }                        
                                               
                    })
                    .catch((error) => {
                        console.log(error);
                    }); 
                                                
                }

                lastusedDtls.timeBasedUpdatedArray=[];
                await databasehelper.updateSmartLastUsedApps(lastusedDtls,deviceid,"time"); 
                                                            
            }
        } 
        //-------------------------------connected ending-------------------------------------------------- 

        var lastUpdatedTime=lastusedDtls["timeLastUpdatedTime"];
            if(res.length>0)
            { 
                lastUpdatedTime=res[res.length-1].date;
            }  

        var timeDiff=getDiffTime(lastUpdatedTime,time);
        console.log("\ntimeDiff=====>>>"+timeDiff);
            if(timeDiff>=smartStaxTimeGap)
            {
                var resObj={"date":time,"dayNo":timeDtl.dayNo,"hourNo":timeDtl.hourNo,"timeGroupId":""+currentTimegroupid};
                lastusedDtls.timeBasedUpdatedArray.push(resObj);
                await databasehelper.updateSmartLastUsedApps(lastusedDtls,deviceid,"time"); 
            }                      
                                
     }
   }
 },5000);// 1 minutes //300000//60000
},


    stopservice() {
        BackgroundTimer.clearInterval(intervalId);
    }
}

export default smartstaxtimeservice;

async function  getAppList(latestappList,latestappNameList,latestallappTotalTimeInForeground,appList,appNameList,allappTotalTimeInForeground)
{ 

    // [________________________filter backgroud apps and set latest apps list_____________________________________]
var maxAppCount=15;
var lappNameList={};  
var lastData={};
var newappList={};
var newappNameList={};

        var lpkeys = Object.keys(appList);
        var devLength=0;
            for (var y in lpkeys) 
            {
                 var pkey=lpkeys[y];
                 var dfor=0;
                 var lfor=0;
                  if(allappTotalTimeInForeground.hasOwnProperty(pkey))
                              dfor=parseFloat(allappTotalTimeInForeground[pkey]);                              
                  
                   if(latestallappTotalTimeInForeground.hasOwnProperty(pkey))
                               lfor=parseFloat(latestallappTotalTimeInForeground[pkey]);
                    else if(dfor!=0)
                       { 
                          newappList[pkey]=appList[pkey];
                          newappNameList[pkey]=appNameList[pkey];
                          latestallappTotalTimeInForeground[pkey]=dfor;
                          lastData[pkey]=1.00000;
                          devLength=y;
                        }        
                              
               if(dfor!=0 && dfor>lfor)
                { 
                  newappList[pkey]=appList[pkey];
                  newappNameList[pkey]=appNameList[pkey];
                  latestallappTotalTimeInForeground[pkey]=dfor;
                  lastData[pkey]=1.00000;
                  devLength=y;
                }
            }

      lappNameList=newappNameList;  
            if(devLength<maxAppCount)
            {             
              var lkeys = Object.keys(latestappList);
                    for (var k in lkeys) 
                    {
                         var pkey=lkeys[k];
                         if(!lastData.hasOwnProperty(pkey))
                         {
                           lastData[pkey]=0.50000;
                           lappNameList[pkey]=latestappNameList[pkey];
                           devLength=devLength+1;
                         }
                           if(devLength==maxAppCount)
                           break;
                    }
              
            }       
        return {
            "appList":newappList,
            "appNameList":newappNameList,
            "allappTotalTimeInForeground":latestallappTotalTimeInForeground,
            "latestappList":lastData,
            "latestappNameList":lappNameList
        }
}
async function setAppsPriority(sqlAppList,sqlAppNameList,appList,appNameList)
{
    // [__________________Calculate and merge apps priority values____________]                              
                            
                             var keys = Object.keys(sqlAppList);
                             for (var x in keys) 
                             {
                                     var pkey=keys[x];
                                     var pvalue=parseFloat(sqlAppList[pkey]);
                                         if(appList.hasOwnProperty(pkey))
                                         {   pvalue=pvalue+1.00000; }
                                         else
                                         {   pvalue=pvalue-0.14286;
                                            if(pvalue<0)
                                              pvalue=0.00000;
                                         }
                                         sqlAppList[pkey]=pvalue;
                             }
                              
                             var pkeys = Object.keys(appList);
                             for (var y in pkeys) 
                             {
                                  var pkey=pkeys[y];
                                  if(!sqlAppList.hasOwnProperty(pkey))
                                  {  sqlAppList[pkey]=1.00000;
                                     sqlAppNameList[pkey]=appNameList[pkey];
                                  }
                                    
                             }
         var returnObj={"appList":sqlAppList,"appNameList":sqlAppNameList};

         return returnObj; 
                           
}

async function getDiffTime(date1,date2)
{
    // [__________________Calculate and merge apps priority values____________]                              
    var a = new Date(date1).getTime(),
    b = new Date(date2).getTime(),
    diff = {};

diff.milliseconds = a > b ? a % b : b % a;
diff.seconds = diff.milliseconds / 1000;
diff.minutes = diff.seconds / 60;
diff.hours = diff.minutes / 60;
diff.days = diff.hours / 24;
diff.weeks = diff.days / 7;

return diff;    
                           
}