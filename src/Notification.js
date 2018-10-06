import React, { Component } from 'react';
import {
  AsyncStorage,
  BackHandler,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View ,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  TextInput,
  Dimensions,
  Alert,ToastAndroid,ScrollView         // Container component
} from 'react-native';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import Tabs from './utils/tabs_Notification';
import { Dialog } from 'react-native-simple-dialogs';
import device_style from './styles/device.style';
import LoaderNew from './utils/LoaderNew';
import Modal from 'react-native-modal';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");
var {height, width} = Dimensions.get('window');

export default class NotificationClass extends React.Component {
  scroll = new Animated.Value(0);
  headerY;
  constructor(props)
  {
    super(props);
    this.headerY = Animated.multiply(Animated.diffClamp(this.scroll, 0, 60), -1);
    this.state={
      dlist : [],
      dlist2 : [],
      ref:false,
      refresh:false,
      refreshUnread:false,
      lastKeyValMapping:{},
      NoNotification:'none',
      yesNotifications:'flex',
      NoNotification1:'none',
      yesNotifications1:'flex',
      searchquery:'',
      offlineFlag:false,
      notificationRefresh:false,
      MountTime:0,
      gotologinflow:false,
      backendDownPopup:false
    }
    this.setVal=this.setVal.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  handleSave = () => {
    this.setState({ isOpen: !this.state.isOpen, });
  }
  async componentWillUnmount()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    async handleBackButtonClick() 
      {
                this.props.handleBackButtonClick("Notification");
                return true;      
      }
/** 
  * (It checks the web portal health
  *   >>Based on response code])
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/      
      async isBackendDown(){
        var aws_data = require("./config/AWSConfig.json");
        var resp_flag=false;
        var request = new XMLHttpRequest();  
       await request.open('GET', aws_data.WebsitePath, true);
       request.onreadystatechange = function(){
           if (request.readyState === 4){
               if (request.status === 0) { 
               resp_flag=true;
               }  
           }
           else{
           }
       };
       await request.send();
       await setTimeout(() => {
        { 
          if(resp_flag){
            this.setState({backendDownPopup:true});
           }
          else
        {
          this.setState({backendDownPopup:false});
        } }
       }, 3000);
      }
async componentDidMount()
{
  this.mixpanelTrack("Notification View");
  BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  const Username = await AsyncStorage.getItem("username");      
  if(Username==null || Username==commons.guestuserkey())
        {
            this.setState({gotologinflow:true});
            return;
        }
  var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
      await this.isBackendDown();
  this.list();
  this.unRead_list();
    }
    else{
      this.setState({offlineFlag:true});
    }
    await this.setState({MountTime:1});
}  
async RecomponentDidMount()
{ 
  const Username = await AsyncStorage.getItem("username");      
  if(Username==null || Username==commons.guestuserkey())
        {
            this.setState({gotologinflow:true});
            return;
        }
  if(this.state.MountTime==1)
  {
    await this.setState({MountTime:2});
    return;
  }
  var connectionstatus = await commons.isconnected();
    if (connectionstatus) {
      await this.isBackendDown();
      await this.setState({searchquery:''});
  this.list();
  this.unRead_list();
    }
    else{
      this.setState({offlineFlag:true});
    }
}
/** 
  * (Search for text in notifications)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async search(loadmore) {
  this.mixpanelTrack("Notification Search");
this.list();
this.unRead_list();
}
/** 
  * (Set the search text state varible)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async setval(value) {
  await this.setState({ searchquery: value});
}
/** 
  * (Set the refresh state to true)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
onRefresh() {
  this.setState({ refresh: true }, function() { this.list() });
}
/** 
  * (Set the refresh unread state to true)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
onRefresh_unRead() {
  this.setState({ refreshUnread: true }, function() { this.unRead_list() });
}
/** 
  * (Accept the stax shared)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
acceptRec(item)
{
  this.StatusUpdate(item);
  Alert.alert(
    '',
    Strings.notification_toast_popuphead+item.widgetName+Strings.notification_toast_popuphead1,
    [
    {text: Strings.notification_toast_popupaskme, onPress: () => console.log('Ask me later pressed')},
      {text: Strings.notification_toast_popupdecline, onPress: () => this.decline(item), style: 'cancel'},
      {text: Strings.notification_toast_popupaccept, onPress: () => this.accept(item)},
    ],
    { cancelable: false }
  )
}
/** 
  * (Accept the widget and fetch data from backend)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async accept(item)
{
  item.recStatus="Accepted";
  item.rcolor='#2CAE1C';
  var modified_widgets = [];
  const deviceid = await AsyncStorage.getItem("currentdeviceid");
  if (deviceid == null) {
    ToastAndroid.show(Strings.notification_toast_device,500);
    return;
  }
  this.getWidgetFromBackend(item);
}
/** 
  * (Accept widget from back end)
  * @param  :notification     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async getWidgetFromBackend(item)
{
  var acceestoken=await commons.get_token();
  var aws_data = require("./config/AWSConfig.json");
  var aws_lamda = require("./config/AWSLamdaConfig.json");
    await fetch('' + aws_data.path + aws_data.stage + aws_lamda.sharingfunction, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization':acceestoken
      },
      body: JSON.stringify({
        "operation": "getSharedList",
        "sharingid": item.sharingid
      }),
    }).then(async (response) =>await response.json())
      .then(async (responseJson) => {
        var id="";
    try{
        if(responseJson.widget[0].mostusedwidget==2)
        { 
          var splitted=responseJson.widget[0].widgetid.split('#');
          var storeid=splitted[0];
          var category="";
          if(splitted.length>=1)
              category=splitted[1];
          commons.replaceScreen(this, 'store_purchase', { "staxid": storeid,"category":category });
        }
        else if(responseJson.widget[0].storeid==undefined||responseJson.widget[0].storeid=='undefined')
        { 
        if(responseJson.medium=='socialmedia')
        {
          var modified_widgets = [];
          const deviceid = await AsyncStorage.getItem("currentdeviceid");
          var widgetdata=responseJson.widget;
          for (var i = 0; i < widgetdata.length; i++) {
            var uuid = await commons.getuuid();
            id=uuid;
            widgetdata[i]["widgetid"] = uuid;
            widgetdata[i]["deviceid"] = deviceid;
            widgetdata[i]["mostusedwidget"]=3;
            widgetdata[i]["createtime"] = commons.gettimestamp();
           if(commons.isimagevalid(widgetdata[i]))
           {
            this.refs.loaderRef.show();
            var old_fileid=widgetdata[i].fileid;
            widgetdata[i]["fileid"]=await commons.getuuid();
            await commons.download_sharedimage_tocache(old_fileid,widgetdata[i].fileid,responseJson.from,".jpg");
            this.refs.loaderRef.hide();
          }
            modified_widgets.push(widgetdata[i]);
          }
          console.log(">>>>>>>>>>Accept"+JSON.stringify(modified_widgets));
          var result=await databasehelper.shareinsertwidget(modified_widgets);
          var passdata={
            "sharingid":item.sharingid,
            "status":"Accepted",
            "date":date,
            "Timestamp":item.Timestamp
          }
          this.backendwrite(passdata);
          this.props.setNavigation('STAX',id);
        }
        else if(responseJson.status=='pending'&&responseJson.medium=='Email')
        {
          var modified_widgets = [];
          const deviceid = await AsyncStorage.getItem("currentdeviceid");
          var widgetdata=responseJson.widget;
          for (var i = 0; i < widgetdata.length; i++) {
            var uuid = await commons.getuuid();
            widgetdata[i]["widgetid"] = uuid;
            widgetdata[i]["deviceid"] = deviceid;
            widgetdata[i]["mostusedwidget"] = "1";
            widgetdata[i]["createtime"] = commons.gettimestamp();
            modified_widgets.push(widgetdata[i]);
          } 
          var result=await databasehelper.shareinsertwidget(modified_widgets);
          var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
          var passdata={
                          "sharingid":item.sharingid,
                          "status":"Accepted",
                          "date":date,
                          "Timestamp":item.Timestamp
                        }
          this.setState({ref:false});
          this.backendwrite(passdata);
          var dlist=this.state.dlist2;
          var key=parseInt(item.key)
          dlist[key]["recStatus"]="Accepted";
          dlist[key]["rcolor"]='green';
          this.setState({dlist2:dlist}); 
        }
        else if(responseJson.status!='pending'&&responseJson.medium=='Email')
        {
        ToastAndroid.show(Strings.notification_toast_linkexpired,3000);
        commons.replaceScreen(this, 'welcome',{});
        }
      }
        else{  
       var splitted=responseJson.widget[0].storeid.split('#'); 
       var storeid=splitted[0];
       var category="";
       if(splitted.length>=1)
         category=splitted[1];
        commons.replaceScreen(this, 'store_purchase', { "staxid": storeid,"category":category });
      }
    }catch(error)
    {
      alert(error);
    } 
      })
      .catch((error) => {
        console.error(error);
      });
}
/** 
  * (Trigger mixpanel track event)
  * @param  :event     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async mixpanelTrack(events)
  {
     try{
         var Mixpannel_tocken=aws_data11.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
             Mixpanel.default.track(events);
             });
        }catch(err){
       }
  }
/** 
  * (Update decline state and write to backend)
  * @param  :item     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
decline(item)
{
var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
  item.recStatus='Declined';
  item.rcolor='#CC0000';
 var passdata={
  "sharingid":item.sharingid,
   "status":"Declined",
   "date":date,
   "Timestamp":item.Timestamp
}
 this.setState({ref:false});
 this.backendwrite(passdata);
}
/** 
  * (Write data to back end)
  * @param  :passdata     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async backendwrite(passdata)
{ 
    var aws_data=require("./config/AWSConfig.json");   
    var uuid=await commons.getuuid();
    var username=await AsyncStorage.getItem("username");
    var userData=await databasehelper.getuser();
    var date=await commons.gettimestamp();
    var aws_data=require("./config/AWSConfig.json"); 
    var aws_lamda = require("./config/AWSLamdaConfig.json"); 
    var acceestoken=await commons.get_token();
  fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
    method: 'POST',
    headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Authorization':acceestoken
    },
    body: JSON.stringify({
    "operation":"updatestatus_Temp",
    "sharingid":passdata.sharingid, //username
    "status":passdata.status,
    "statusdate":date,
    "Timestamp":passdata.Timestamp,
    "username":username,
    "name":userData.res[0].firstname+" "+userData.res[0].lastname,
    "uuid":uuid
    }),
    }).then((response) => response.json())
    .then((responseJson) => {
    });
}
/** 
  * (Notification selected All)
  * @param  :item     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async expand(item)
{ 
  var serchVal=this.state.searchquery;
  if(serchVal=="")
  {
    var trkDta="Notification selected All"
    this.mixpanelTrack(trkDta);
  }
  else
  {
    var dta="Search result selected All"
    this.mixpanelTrack(dta);
  }
  this.StatusUpdate(item);
  var dlist=this.state.dlist2;
  var key=parseInt(item.key)
  dlist[key]["display"]="none";
  dlist[key]["displayexpand"]="flex";
  dlist[key]["ReadFlagColor"]="#ffffff";
  await this.setState({dlist2:dlist}); 
}
/** 
  * (Change state variable for compress screen)
  * @param  :item     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async compress(item)
{
  var dlist=this.state.dlist2;
  var key=parseInt(item.key)
  dlist[key]["display"]="flex";
  dlist[key]["displayexpand"]="none";
  this.setState({dlist2:dlist});
}
/** 
  * (Change state variable for expand screen)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async expand_unread(item)
{ 
  var serchVal=this.state.searchquery;
  if(serchVal=="")
  {
    var trkDta="Notification selected Unread";
    this.mixpanelTrack(trkDta);
  }
  else
  {
    var dta="Search result selected Unread";
    this.mixpanelTrack(dta);
  }
  var dlist=this.state.dlist;
  var key=parseInt(item.key)
  dlist[key]["display"]="none";
  dlist[key]["displayexpand"]="flex";
  dlist[key]["ReadFlagColor"]="#ffffff";
  this.setState({dlist:dlist});
  this.StatusUpdate(item);
}
/** 
  * (Changes the state variable for compress screen unread tab)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async compress_unread(item)
{
  var dlist=this.state.dlist;
  var key=parseInt(item.key)
  dlist[key]["display"]="flex";
  dlist[key]["displayexpand"]="none";
  this.setState({dlist:dlist});
}
/** 
  * (Update the status of notification in the backend)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
async StatusUpdate(item)
{
  if(item.ReadFlag==true)
  return
  var sharingid=item.sharingid; 
  var key=parseInt(item.key)
  var dlist=this.state.dlist2;
  dlist[key]["ReadFlagColor"]="#ffffff";
  this.setState({dlist2:dlist});
  var username=await AsyncStorage.getItem("username");
  console.log(JSON.stringify({
    "operation":"UpdateStatus",
    "username":username, //username
    "Timestamp":item.Timestamp
    }));
  var aws_data=require("./config/AWSConfig.json");  
  var aws_lamda = require("./config/AWSLamdaConfig.json"); 
  var acceestoken=await commons.get_token();
 await fetch(''+aws_data.path+aws_data.stage+aws_lamda.notificationcountsstyle, {
    method: 'POST',
    headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Authorization':acceestoken
    },
    body: JSON.stringify({
    "operation":"UpdateStatus",
    "username":username, //username
    "Timestamp":item.Timestamp
    }),
    }).then(async (response) =>await response.json())
    .then(async(responseJson) => {
    }); 
}
/** 
  * (It fetches the next set of data from backend using last evaluated key)
  * @param  :key     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async loadmore(key)
{ 
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");   
    var aws_lamda = require("./config/AWSLamdaConfig.json");           
   if (key.hasOwnProperty("Timestamp"))
   {
    if(this.state.searchquery!='')
   { request=JSON.stringify({
      "operation":"getNotificationListofUser",
      "username":username, //username
      "from":this.state.searchquery,
      "LastEvaluatedKey":key
      });
    }else{
      request=JSON.stringify({
        "operation":"getNotificationListofUser",
        "username":username, //username
        "LastEvaluatedKey":key
        });
    }
    var acceestoken=await commons.get_token();
    await fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body:request ,
                    }).then(async (response) =>await response.json())
                    .then(async (responseJson) => {
     if (responseJson.hasOwnProperty("LastEvaluatedKey"))
     {
       this.setState({lastKeyValMapping:responseJson.LastEvaluatedKey});
     }else this.setState({lastKeyValMapping:{}});
     var tolist=responseJson.to;
     device_list=[];
     device_list2=[];
   if (tolist.length > 0)
   {   var dlist_copy=this.state.dlist2;
       var dlist_length=dlist_copy.length;
       var index=0;
      for (var i = 0; i < tolist.length; i++) {
        var deviceObj = {};
        if(tolist[i]["type"]=="reward")
        {
           deviceObj["key"] = (index++) + dlist_length + "";
           deviceObj["badge"]=tolist[i]["badge"];
           deviceObj["Timestamp"]=tolist[i]["Timestamp"];
           deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
           deviceObj["display"] = 'flex';
            deviceObj["displayexpand"] = 'none';
            if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
            {
            deviceObj["ReadFlagColor"]="#EEF4FA";
            }
            else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
            {
            deviceObj["ReadFlagColor"]="#ffffff";
            }
            else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
            { 
              deviceObj["ReadFlagColor"]="#ffffff";
            }
           deviceObj["type_reward"] = "flex";
           deviceObj["type_from"] = "none";
           deviceObj["type_to"] = "none";
           deviceObj["type_CollectReward"]="none";
           dlist_copy.push(deviceObj);
        }
        if(tolist[i]["type"]=="CollectReward")
       {
          deviceObj["key"] = (index++) + "";
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
            deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "none";
          deviceObj["type_CollectReward"]="flex";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          dlist_copy.push(deviceObj);
       }
      if(tolist[i]["type"]=="from" && tolist[i]["to"]!=undefined && tolist[i]["status"]!="pending")
      {
       deviceObj["key"] =(index++) + dlist_length + "";
       deviceObj["name"] = "APRROW Stax";
       deviceObj["from"] = tolist[i]["from"];
       var dformat=commons.format_string_date(tolist[i]["senddate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
       deviceObj["Date"] = dformat;
       deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
       deviceObj["Timestamp"] = tolist[i]["Timestamp"];
       deviceObj["fromName"] = tolist[i]["fromName"];
       deviceObj["widgetName"] = tolist[i]["widget"];
       deviceObj["display"] = 'flex';
       deviceObj["displayexpand"] = 'none';
       if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
       {
       deviceObj["ReadFlagColor"]="#EEF4FA";
       }
       else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
       {
       deviceObj["ReadFlagColor"]="#ffffff";
       }
       else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
       { 
        deviceObj["ReadFlagColor"]="#ffffff";
       }
       deviceObj["slist"] = 'Shared By Name';
       deviceObj["sharingid"] =tolist[i]["sharingid"]; 
       deviceObj["widget"] =tolist[i]["widget"];
        if(tolist[i].status=='Declined')
        {
          deviceObj["recStatus"] = 'Declined';
          deviceObj["rcolor"] = '#CC0000';
        }
        else if(tolist[i].status=='pending')
        {
          deviceObj["recStatus"] = 'Accept or Decline';
          deviceObj["rcolor"] = '#006BCC';
        }
        else
        {
          deviceObj["recStatus"] = 'Accepted';
          deviceObj["rcolor"] = '#2CAE1C';        
        }  
       dlist_copy.push(deviceObj);
        }
        else if(tolist[i]["type"]=="to")
      {
        deviceObj["key"] = (index++) + dlist_length + "";
         deviceObj["Timestamp"]=tolist[i]["Timestamp"];
         deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
         deviceObj["type_reward"] = "none";
         deviceObj["type_from"] = "none";
         deviceObj["type_to"] = "flex";
         deviceObj["type_CollectReward"]="none";
         var dformat=commons.format_string_date(tolist[i]["statusdate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
         deviceObj["Date"] = dformat;
         deviceObj["FromName"] = tolist[i]["fromName"];
         deviceObj["widgetName"] = tolist[i]["widget"];
         deviceObj["display"] = 'flex';
         deviceObj["displayexpand"] = 'none';
         if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
         {
         deviceObj["ReadFlagColor"]="#EEF4FA";
         }
         else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
         {
         deviceObj["ReadFlagColor"]="#ffffff";
         }
         else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
         { 
         deviceObj["ReadFlagColor"]="#ffffff";
         }
         deviceObj["sharingid"] =tolist[i]["sharingid"];
         if(tolist[i].status=='Declined')
         {
           deviceObj["recStatus"] = Strings.notification_event_decline;
           deviceObj["rcolor"] = '#CC0000';
         }
         else if(tolist[i].status=='pending')
         {
           deviceObj["recStatus"] = Strings.notification_event_pending;
           deviceObj["rcolor"] = '#006BCC';
         }
         else
         {
           deviceObj["recStatus"] = Strings.notification_event_accept;
           deviceObj["rcolor"] = '#2CAE1C';        
         }
         dlist_copy.push(deviceObj);
      }
   }
   this.setState({ dlist2: dlist_copy });
  }else this.setState({ remote: 'flex' });
  })
  .catch((error) => {
  });        
  this.setState({ refresh: false });
}
}
/** 
  * (Fetches the notifications from backend)
  * @param  :key     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async list()
{  this.refs.loaderRef.show();
    this.setState({notificationRefresh:true});
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");    
    var aws_lamda = require("./config/AWSLamdaConfig.json");      
   var request=JSON.stringify({
    "operation":"getNotificationListofUser",
    "username":username //username
    });
    if(this.state.searchquery!='')
   { request=JSON.stringify({
      "operation":"getNotificationListofUser",
      "username":username, //username
      "from":this.state.searchquery
      });
    }else{
      request=JSON.stringify({
        "operation":"getNotificationListofUser",
        "username":username //username
        });
    }
    var acceestoken=await commons.get_token();
   await fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken 
                    },
                    body:request ,
                    }).then(async (response) =>await response.json())
                    .then(async (responseJson) => {
     if (responseJson.hasOwnProperty("LastEvaluatedKey"))
     { 
       var last_E_key=responseJson.LastEvaluatedKey;
       await this.setState({lastKeyValMapping:last_E_key});
     }else await this.setState({lastKeyValMapping:{}});
     var tolist=responseJson.to;
     device_list=[];
     device_list2=[];
   var index=0;
   if (tolist.length > 0)
   {   
      for (var i = 0; i < tolist.length; i++) {
        var deviceObj = {};
       if(tolist[i]["type"]=="reward")
       {
          deviceObj["key"] = (index++) + "";
          deviceObj["badge"]=tolist[i]["badge"];
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
            deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["type_reward"] = "flex";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "none";
          deviceObj["type_CollectReward"]="none";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          device_list2.push(deviceObj);
       }
       if(tolist[i]["type"]=="CollectReward")
       { 
          deviceObj["key"] = (index++) + "";
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";  
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
            deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "none";
          deviceObj["type_CollectReward"]="flex";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          device_list2.push(deviceObj);
       }
       if(tolist[i]["type"]=="from" && tolist[i]["to"]!=undefined && tolist[i]["status"]!="pending")
       { 
        deviceObj["key"] = (index++) + "";
        deviceObj["name"] = "APRROW Stax";
        deviceObj["type_from"] = "flex";
        deviceObj["type_to"] = "none";
        deviceObj["type_reward"] = "none";
        deviceObj["type_CollectReward"]="none";
        deviceObj["from"] = tolist[i]["from"];
        deviceObj["Timestamp"]=tolist[i]["Timestamp"];
        var dformat=commons.format_string_date(tolist[i]["senddate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
        deviceObj["Date"] = dformat;
        deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
        deviceObj["Timestamp"] = tolist[i]["Timestamp"];
        deviceObj["toName"] = tolist[i]["toName"];
        deviceObj["widgetName"] = tolist[i]["widget"];
        deviceObj["display"] = 'flex';
        deviceObj["displayexpand"] = 'none';
        if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
        {
        deviceObj["ReadFlagColor"]="#EEF4FA";
        }
        else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
        {
        deviceObj["ReadFlagColor"]="#ffffff";
        }
        else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
        { 
         deviceObj["ReadFlagColor"]="#ffffff";
        }
        deviceObj["slist"] = 'Shared By Name';
        deviceObj["sharingid"] =tolist[i]["sharingid"]; 
        deviceObj["widget"] =tolist[i]["widget"];
         if(tolist[i].status=='Declined')
         {
           deviceObj["recStatus"] = 'Declined';
           deviceObj["rcolor"] = '#CC0000';
         }
         else
         {
           deviceObj["recStatus"] = 'Accepted';
           deviceObj["rcolor"] = '#2CAE1C';        
         }
         device_list2.push(deviceObj);
       }
       else if(tolist[i]["type"]=="to")
       {
        deviceObj["key"] = (index++) + "";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "flex";
          deviceObj["type_CollectReward"]="none";
          var dformat=commons.format_string_date(tolist[i]["statusdate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
          deviceObj["Date"] = dformat;
          deviceObj["FromName"] = tolist[i]["fromName"];
          deviceObj["widgetName"] = tolist[i]["widget"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["sharingid"] =tolist[i]["sharingid"];
          if(tolist[i].status=='Declined')
          {
            deviceObj["recStatus"] = Strings.notification_event_decline;
            deviceObj["rcolor"] = '#CC0000';
          }
          else if(tolist[i].status=='pending')
          {
            deviceObj["recStatus"] = Strings.notification_event_pending;
            deviceObj["rcolor"] = '#006BCC';
          }
          else
          {
            deviceObj["recStatus"] =Strings.notification_event_accept;
            deviceObj["rcolor"] = '#2CAE1C';        
          }
          device_list2.push(deviceObj);
       }
   }
  }else
  { this.setState({ remote: 'flex' });
}
   if(device_list2.length==0)
   {
     this.setState({yesNotifications:'none',NoNotification:'flex'});
   }else
   {
   this.setState({ dlist2: device_list2,yesNotifications:'flex',NoNotification:'none' });
  }
  this.refs.loaderRef.hide();
  })
  .catch((error) => {
  console.error(error);
  this.refs.loaderRef.hide();
  });        
  this.setState({ refresh: false });
}
/** 
  * (loads the data from backend using last evaluted key)
  * @param  :key     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async unRead_loadmore(key)
{ 
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json"); 
    var aws_lamda = require("./config/AWSLamdaConfig.json");            
   if (key.hasOwnProperty("Timestamp"))
   {
    if(this.state.searchquery!='')
   { request=JSON.stringify({
      "operation":"getToNotificationStaxUnreadUser",
      "username":username, //username
      "from":this.state.searchquery,
      "LastEvaluatedKey":key
      });
    }else{
      request=JSON.stringify({
        "operation":"getToNotificationStaxUnreadUser",
        "username":username, //username
        "LastEvaluatedKey":key
        });
    }
    var acceestoken=await commons.get_token();
    await fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body:request ,
                    }).then(async (response) =>await response.json())
                    .then(async (responseJson) => {
     if (responseJson.hasOwnProperty("LastEvaluatedKey"))
     {
       this.setState({lastKeyValMapping:responseJson.LastEvaluatedKey});
     }else this.setState({lastKeyValMapping:{}});
     var tolist=responseJson.to;
     device_list=[];
     device_list2=[];
   var index=0;
   if (tolist.length > 0)
   {   var dlist_copy=this.state.dlist;
       var dlist_length=dlist_copy.length;
      for (var i = 0; i < tolist.length; i++) {
        var deviceObj = {};
        if(tolist[i]["type"]=="reward")
        {
           deviceObj["key"] = (index++) + dlist_length + "";
           deviceObj["Timestamp"]=tolist[i]["Timestamp"];
           deviceObj["badge"]=tolist[i]["badge"];
           deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
           deviceObj["display"] = 'flex';
            deviceObj["displayexpand"] = 'none';
            if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
            {
            deviceObj["ReadFlagColor"]="#EEF4FA";
            }
            else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
            {
            deviceObj["ReadFlagColor"]="#ffffff";
            }
            else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
            { 
              deviceObj["ReadFlagColor"]="#ffffff";
            }
           deviceObj["type_reward"] = "flex";
           deviceObj["type_from"] = "none";
           deviceObj["type_to"] = "none";
           deviceObj["type_CollectReward"]="none";
          dlist_copy.push(deviceObj);
        }
        if(tolist[i]["type"]=="CollectReward")
       {
          deviceObj["key"] = (index++) + "";
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
            deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "none";
          deviceObj["type_CollectReward"]="flex";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          dlist_copy.push(deviceObj);
       }
        if(tolist[i]["type"]=="from" && tolist[i]["to"]!=undefined && tolist[i]["status"]!="pending")
        {
       deviceObj["key"] = (index++) + dlist_length + "";
       deviceObj["name"] = "APRROW Stax";
       deviceObj["from"] = tolist[i]["from"];
       var dformat=commons.format_string_date(tolist[i]["senddate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
       deviceObj["Date"] = dformat;
       deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
       deviceObj["Timestamp"] = tolist[i]["Timestamp"];
       deviceObj["fromName"] = tolist[i]["fromName"];
       deviceObj["widgetName"] = tolist[i]["widget"];
       deviceObj["display"] = 'flex';
       deviceObj["displayexpand"] = 'none';
       if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
       {
       deviceObj["ReadFlagColor"]="#EEF4FA";
       }
       else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
       {
       deviceObj["ReadFlagColor"]="#ffffff";
       }
       else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
       { 
        deviceObj["ReadFlagColor"]="#ffffff";
       }
       deviceObj["slist"] = 'Shared By Name';
       deviceObj["sharingid"] =tolist[i]["sharingid"]; 
       deviceObj["widget"] =tolist[i]["widget"];
        if(tolist[i].status=='Declined')
        {
          deviceObj["recStatus"] = 'Declined';
          deviceObj["rcolor"] = '#CC0000';
        }
        else if(tolist[i].status=='pending')
        {
          deviceObj["recStatus"] = 'Accept or Decline';
          deviceObj["rcolor"] = '#006BCC';
        }
        else
        {
          deviceObj["recStatus"] = 'Accepted';
          deviceObj["rcolor"] = '#2CAE1C';        
        }  
       dlist_copy.push(deviceObj);
   }else if(tolist[i]["type"]=="to")
   {
      deviceObj["key"] = (index++) + dlist_length + "";
      deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
      deviceObj["type_reward"] = "none";
      deviceObj["type_from"] = "none";
      deviceObj["type_to"] = "flex";
      deviceObj["type_CollectReward"]="none";
      deviceObj["Timestamp"]=tolist[i]["Timestamp"];
      var dformat=commons.format_string_date(tolist[i]["statusdate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
      deviceObj["Date"] = dformat;
      deviceObj["FromName"] = tolist[i]["fromName"];
      deviceObj["widgetName"] = tolist[i]["widget"];
      deviceObj["display"] = 'flex';
      deviceObj["displayexpand"] = 'none';
      if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
      {
      deviceObj["ReadFlagColor"]="#EEF4FA";
      }
      else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
      {
      deviceObj["ReadFlagColor"]="#ffffff";
      }
      else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
      { 
      deviceObj["ReadFlagColor"]="#ffffff";
      }
      deviceObj["sharingid"] =tolist[i]["sharingid"];
      if(tolist[i].status=='Declined')
      {
        deviceObj["recStatus"] = Strings.notification_event_decline;
        deviceObj["rcolor"] = '#CC0000';
      }
      else if(tolist[i].status=='pending')
      {
        deviceObj["recStatus"] = Strings.notification_event_pending;
        deviceObj["rcolor"] = '#006BCC';
      }
      else
      {
        deviceObj["recStatus"] = Strings.notification_event_accept;
        deviceObj["rcolor"] = '#2CAE1C';        
      }
      dlist_copy.push(deviceObj);
   }
  }
   this.setState({ dlist: dlist_copy });
  }else this.setState({ remote: 'flex' });
  })
  .catch((error) => {
  });        
  this.setState({ refresh: false });
}
}
/** 
  * (Fetches the unread notifications from backend)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async unRead_list()
{
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");  
    var aws_lamda = require("./config/AWSLamdaConfig.json");      
   var request=JSON.stringify({
    "operation":"getToNotificationStaxUnreadUser",
    "username":username //username
    });  
    if(this.state.searchquery!='')
   { request=JSON.stringify({
      "operation":"getToNotificationStaxUnreadUser",
      "username":username, //username
      "from":this.state.searchquery
      });
    }else{
      request=JSON.stringify({
        "operation":"getToNotificationStaxUnreadUser",
        "username":username //username
        });
    }
    var acceestoken=await commons.get_token();
   await fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body:request ,
                    }).then(async (response) =>await response.json())
                    .then(async (responseJson) => {
     if (responseJson.hasOwnProperty("LastEvaluatedKey"))
     { 
       var last_E_key=responseJson.LastEvaluatedKey;
       await this.setState({lastKeyValMapping:last_E_key});
     }else await this.setState({lastKeyValMapping:{}});
     var tolist=responseJson.to;
     device_list=[];
     device_list2=[];
  var index=0;
   if (tolist.length > 0)
   {   
      for (var i = 0; i < tolist.length; i++) {
        var deviceObj = {};
        if(tolist[i]["type"]=="reward")
        {
           deviceObj["key"] = (index++) + "";
           deviceObj["badge"]=tolist[i]["badge"];
           deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
           deviceObj["display"] = 'flex';
            deviceObj["displayexpand"] = 'none';
            if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
            {
            deviceObj["ReadFlagColor"]="#EEF4FA";
            }
            else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
            {
            deviceObj["ReadFlagColor"]="#ffffff";
            }
            else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
            { 
              deviceObj["ReadFlagColor"]="#ffffff";
            }
           deviceObj["type_reward"] = "flex";
           deviceObj["type_from"] = "none";
           deviceObj["type_to"] = "none";
           deviceObj["type_CollectReward"]="none";
           deviceObj["Timestamp"]=tolist[i]["Timestamp"];
           device_list2.push(deviceObj);
        }
        if(tolist[i]["type"]=="CollectReward")
       {  
          deviceObj["key"] = (index++) + "";
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
            deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "none";
          deviceObj["type_CollectReward"]="flex";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          device_list2.push(deviceObj);
       }
        if(tolist[i]["type"]=="from" && tolist[i]["to"]!=undefined && tolist[i]["status"]!="pending")
       {
        deviceObj["key"] = (index++) + "";
        deviceObj["name"] = "APRROW Stax";
        deviceObj["type_from"] = "flex";
        deviceObj["type_to"] = "none";
        deviceObj["type_reward"] = "none";
        deviceObj["type_CollectReward"]="none";
        deviceObj["from"] = tolist[i]["from"];
        deviceObj["Timestamp"]=tolist[i]["Timestamp"];
        var dformat=commons.format_string_date(tolist[i]["senddate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
        deviceObj["Date"] = dformat;
        deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
        deviceObj["Timestamp"] = tolist[i]["Timestamp"];
        deviceObj["toName"] = tolist[i]["toName"];
        deviceObj["widgetName"] = tolist[i]["widget"];
        deviceObj["display"] = 'flex';
        deviceObj["displayexpand"] = 'none';
        if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
        {
        deviceObj["ReadFlagColor"]="#EEF4FA";
        }
        else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
        {
        deviceObj["ReadFlagColor"]="#ffffff";
        }
        else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
        { 
         deviceObj["ReadFlagColor"]="#ffffff";
        }
        deviceObj["slist"] = 'Shared By Name';
        deviceObj["sharingid"] =tolist[i]["sharingid"]; 
        deviceObj["widget"] =tolist[i]["widget"];
         if(tolist[i].status=='Declined')
         {
           deviceObj["recStatus"] = 'Declined';
           deviceObj["rcolor"] = '#CC0000';
         }
         else
         {
           deviceObj["recStatus"] = 'Accepted';
           deviceObj["rcolor"] = '#2CAE1C';        
         }
         device_list2.push(deviceObj);
       }else if(tolist[i]["type"]=="to")
       {
          deviceObj["key"] = (index++) + "";
          deviceObj["Timestamp"]=tolist[i]["Timestamp"];
          deviceObj["ReadFlag"] = tolist[i]["ReadFlag"];
          deviceObj["type_reward"] = "none";
          deviceObj["type_from"] = "none";
          deviceObj["type_to"] = "flex";
          deviceObj["type_CollectReward"]="none";
          var dformat=commons.format_string_date(tolist[i]["statusdate"],'YYYYMMDDHHmmss','DD/MM/YYYY HH:mm');
          deviceObj["Date"] = dformat;
          deviceObj["FromName"] = tolist[i]["fromName"]; 
          deviceObj["widgetName"] = tolist[i]["widget"];
          deviceObj["display"] = 'flex';
          deviceObj["displayexpand"] = 'none';
          if(deviceObj["ReadFlag"]=='false'||deviceObj["ReadFlag"]==false)
          {
          deviceObj["ReadFlagColor"]="#EEF4FA";
          }
          else if(deviceObj["ReadFlag"]=='true'||deviceObj["ReadFlag"]==true)
          {
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          else if(deviceObj["ReadFlag"]=='undefined'||deviceObj["ReadFlag"]==undefined)
          { 
          deviceObj["ReadFlagColor"]="#ffffff";
          }
          deviceObj["sharingid"] =tolist[i]["sharingid"];
          if(tolist[i].status=='Declined')
          {
            deviceObj["recStatus"] = Strings.notification_event_decline;
            deviceObj["rcolor"] = '#CC0000';
          }
          else if(tolist[i].status=='pending')
          {
            deviceObj["recStatus"] = Strings.notification_event_pending;
            deviceObj["rcolor"] = '#006BCC';
          }
          else
          {
            deviceObj["recStatus"] = Strings.notification_event_accept;
            deviceObj["rcolor"] = '#2CAE1C';        
          }
          device_list2.push(deviceObj);
       }   
   }
  }else this.setState({ remote: 'flex' });
   if(device_list2.length==0)
   { 
     await this.setState({yesNotifications1:'none',NoNotification1:'flex'});
   }else
   await this.setState({ dlist: device_list2,yesNotifications1:'flex',NoNotification1:'none' });
  })
  .catch((error) => {
  console.error(error);
  });        
  this.setState({ refresh: false });
}
/** 
  * (Change the offline flag and navigate to Home page)
  * @param  :key     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
offlineFunc()
{
 this.setState({offlineFlag:false,backendDownPopup:false});
 this.props.setNav('Home');
}
/** 
  * (Calls list and unread list functions)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
async setVal()
{ 
  this.list();
  this.unRead_list();
}
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
      <Dialog visible={this.state.backendDownPopup}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{alignSelf:'center'}} />
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>Sorry! It seems that our platform is experiencing some problems.</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5,  fontWeight: 'bold',textAlign: 'center' }}>You can continue working in Offline Mode.</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>  We will switch you back to full services as soon as possible.</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
              <Dialog visible={this.state.offlineFlag}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={assetsConfig.iconOfflineGrey40px} style={{ alignSelf: 'center' }} />
                        <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.offline_head}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title1}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title2}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.offline_common_okbutton}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Dialog>
                <Animated.View style={[{position:'absolute',
                    zIndex:1,
                    elevation:0,
                    flex:1,
                    transform : [{
                    translateY:this.headerY
                    }],
                    backgroundColor:'#006BBD'
                    }]}>
                    <View
                    style={{
                        alignItems: "center",
                        width: width,
                        height: 50,
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                    <View
                        style={{
                            borderColor: "#006BBD",
                            borderWidth: 1,
                            borderRadius: 30,
                            alignItems: "center",
                            width: width,
                            marginRight: -18,
                            // width:width,
                            height:40,
                            flexDirection: "row",
                            alignItems: "center"
                        }}>
                        <Image
                            style={{ width: 25, height: 25, marginLeft: 15, marginRight: 5 }}
                            source={require("./assets/icon_search_white.png")}
                        />
                        
                        <TextInput
                            style={{ width: "80%", borderWidth: 0,color:'#FFFFFF',fontFamily:'Roboto'}}
                            allowFontScaling={false}
                            placeholder={Strings.menu_search}
                            placeholderTextColor="white"
                            onChangeText={(value) =>{this.setval(value)}}
                            onSubmitEditing={() => {this.search(false)}}
                            underlineColorAndroid="white"
                        />
                    </View>
                    </View>
                </Animated.View>
                <Animated.ScrollView
          scrollEventThrottle={1}
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={{zIndex: 0, height: "100%", elevation: -1}}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: this.scroll}}}],
            {useNativeDriver: true},
          )}
          overScrollMode="never">
              <View style={{marginTop:50}}/>
          <Tabs setVal={this.setVal}>
            <View title={Strings.notification_tab_head1} style={{backgroundColor:'white',flex: 1,alignItems: 'center',backgroundColor: '#ffffff'}}>
                <View style={{backgroundColor:'white',flex: 1,display:this.state.YesNotification}}>
                <LoaderNew ref={"loaderRef"} />
                <FlatList style={{ flex: 1 }}
                            data={this.state.dlist2}
                            extraData={this.state}
                            style={{backgroundColor:'white'}}
                            refreshing={this.state.refresh}
                            onRefresh={()=>this.onRefresh()}
                            onEndReachedThreshold={0.5}
                            onEndReached={({ distanceFromEnd }) => {
                                                                this.loadmore(this.state.lastKeyValMapping);
                                          }}
                            renderItem={({ item }) =>
                                            <View style={{ flex: 1}}>
                                              <View style={{display:this.state.yesNotifications, flex: 1, flexDirection: 'row', width: '100%',alignItems:'center',justifyContent:'center',paddingTop:10,backgroundColor:item.ReadFlagColor }}>
                                                <View style={{display:item.type_from}}>
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>
                                                          <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>{this.mixpanelTrack("Notification Opened :"+Strings.notification_from_title);this.expand(item)}}>
                                                           <View style={{flexDirection:'row'}} >
                                                                <View style={{width:'90%'}}>
                                                                      <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_from_title}</Text>
                                                                </View>
                                                                <View>
                                                                      <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                                                </View>
                                                          </View>      
                                                                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                                <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} >{Strings.notification_from_message1} {item.widgetName} {Strings.notification_from_message2}</Text>
                                                          </TouchableOpacity>
                                                          <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                          </View>
                                                    </View>
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>
                                                         <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.compress(item)}>
                                                          <View style={{flexDirection:'row'}} >
                                                            <View style={{width:'90%'}}>
                                                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: 'bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_from_title}</Text>
                                                            </View>
                                                            <View>
                                                            <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                                            </View>
                                                        </View>
                                                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                            <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:8 }} numberOfLines={2}>{Strings.notification_from_message1} {item.widgetName} {Strings.notification_from_message3} {item.toName}</Text>
                                                            <View style={{width:'90%'}}>
                                                                      {item.recStatus == 'Accept or Decline'? <Text allowFontScaling={false} onPress={() => this.acceptRec(item) } style={{ fontSize: 18,  color:item.rcolor ,textAlign:'right',fontWeight:'500'}}>{item.recStatus}</Text>:<Text allowFontScaling={false} onPress={()=>{const{navigate}=this.props.navigation
                                                                      navigate("sharedApprow",{screen:"sharedApprow"})}} style={{ fontSize: 18,  color:'#2699FB', textAlign:'right',fontWeight:'500',textDecorationLine:'underline'}}>{Strings.notification_view}</Text> }
                                                            </View>
                                                      </TouchableOpacity>                                                              
                                                        <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                        </View>
                                                        </View>
                                                </View>
                                                <View style={{display:item.type_reward}}>   
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>
                                                           <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.expand(item)}>
                                                              <View style={{flexDirection:'row'}}>
                                                                <View style={{width:'90%'}}>
                                                                      <Text allowFontScaling={false} style={{ fontSize: 16,fontFamily:'Roboto-Bold',color: '#000000',paddingBottom:5 }}>{Strings.notification_reward_congrats}</Text>
                                                                </View>
                                                                <View>
                                                                      <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                                                </View>
                                                                </View>
                                                                <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} >{Strings.notification_reward_message1}</Text>
                                                          </TouchableOpacity>
                                                          <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                          </View>
                                                    </View>
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>
                                                        <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.compress(item)}>
                                                        <View style={{flexDirection:'row'}}>
                                                            <View style={{width:'90%'}}>
                                                            <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: 'bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_reward_congrats}</Text>
                                                            </View>
                                                            <View>
                                                            <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                                            </View>
                                                        </View>
                                                        <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:8 }} numberOfLines={2}></Text>
                                                            <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:8 }} numberOfLines={2}>{Strings.notification_reward_message2} {item.badge} {Strings.notification_reward_message3}</Text>
                                                        </TouchableOpacity>    
                                                        <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                        </View>
                                                        </View>
                                                </View>
                                      <View style={{display:item.type_to}}>        
                                        <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>
                                            <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.expand(item)}>
                                            <View style={{flexDirection:'row'}} >
                                                <View style={{width:'90%'}}>
                                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_to_title}</Text>
                                                </View>
                                                <View>
                                                <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                                </View>
                                            </View>
                                                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} >{Strings.notification_to_message1} {item.widgetName} {Strings.notification_to_message2} </Text>
                                           </TouchableOpacity>    
                                        <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}> 
                                        </View>                            
                                    </View>
                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                        
                                        <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.compress(item)}>
                                          <View style={{flexDirection:'row'}} >
                                                <View style={{width:'90%'}}>
                                                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_to_title}</Text>
                                                </View>
                                                <View>
                                                <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                                </View>
                                          </View>
                                                <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} numberOfLines={2}>{Strings.notification_to_message1} {item.widgetName} {Strings.notification_to_message3} {item.FromName}</Text>
                                                <View style={{width:'90%'}}>
                                                {item.recStatus ==Strings.notification_event_pending ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item) } style={{ fontSize: 18,  color:item.rcolor ,textAlign:'right',fontWeight:'500'}}>{item.recStatus}</Text>:<Text allowFontScaling={false} onPress={()=>{const{navigate}=this.props.navigation
                                                                      navigate("sharedApprow",{"val":"1"})
                                                                     }} style={{ fontSize: 18,  color:'#2699FB', textAlign:'right',fontWeight:'500',textDecorationLine:'underline'}}>{Strings.notification_view}</Text> }
                                                </View>
                                            </TouchableOpacity>                                                        
                                        <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>  
                                        </View>
                                    </View>          
                                </View>
                                 <View style={{display:item.type_CollectReward}}>
                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>                                      
                                      <TouchableOpacity  style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.expand(item)}>
                                        <View style={{flexDirection:'row'}}>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_collect_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                          </View>
                                        </View>    
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} numberOfLines={2}>{Strings.notification_collect_message} </Text>
                                      </TouchableOpacity>                                          
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                 
                                  </View>                                                              
                              </View>
                              <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                 
                                <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.compress(item)}>
                                    <View style={{flexDirection:'row'}} >
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_collect_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                          </View>
                                    </View>                                    
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }}>{Strings.notification_collect_message}</Text>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} onPress={()=>this.props.setNav("Rewards")} style={{ fontSize: 18,  color:item.rcolor, textAlign:'right',fontWeight:'500',textDecorationLine:'underline'}}>{Strings.notification_collect}</Text> 
                                          </View>
                                </TouchableOpacity>                                                                                                    
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                 
                                  </View>                          
                              </View>
                              </View>                                               
                                              </View>
                                            </View>
                                        } />
                </View>
                <View style={{display:this.state.NoNotification,width:'100%',height:'100%',backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
                          <Text allowFontScaling={false} style={{fontSize:18}}>{Strings.notification_read_alert}</Text>
                          </View> 
            </View>
            <View  title={Strings.notification_tab_head2} style={{flex: 1,backgroundColor:'white',flex: 1,alignItems: 'center',backgroundColor: '#ffffff',}}>
                    <View style={{backgroundColor:'white',flex: 1,display:this.state.yesNotifications1}}>
                    <LoaderNew ref={"loaderRef"} />
                        <FlatList style={{ flex: 1 }}
                                    data={this.state.dlist}
                                    extraData={this.state}
                                    style={{backgroundColor:'white'}}
                                    refreshing={this.state.refresh}
                                    onRefresh={()=>this.onRefresh()}
                                    onEndReachedThreshold={0.5}
                                    onEndReached={({ distanceFromEnd }) => {
                                                                        this.loadmore(this.state.lastKeyValMapping);
                                                  }}
                                    renderItem={({ item }) =>
                                                    <View style={{ flex: 1}}>
                                                      <View style={{display:this.state.yesNotifications1, flex: 1, flexDirection: 'row', width: '100%',alignItems:'center',justifyContent:'center',paddingTop:10,backgroundColor:item.ReadFlagColor }}>
                                                        <View style={{display:item.type_from}}>                                                           
                                                            <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>                                                                 
                                                                  <TouchableOpacity  style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>{this.mixpanelTrack("Notification Opened :"+Strings.notification_from_title);this.expand_unread(item)}}>
                                                                      <View style={{flexDirection:'row'}} >
                                                                        <View style={{width:'90%'}}>
                                                                              <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_from_title}</Text>
                                                                        </View>
                                                                        <View>
                                                                              <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                                                        </View>
                                                                      </View>  
                                                                        <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                                        <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} >{Strings.notification_from_message1} {item.widgetName} {Strings.notification_from_message2}</Text>
                                                                  </TouchableOpacity>
                                                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                                
                                                                  </View>
                                                            </View>
                                                            <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                                
                                                                <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.compress_unread(item)}>
                                                                <View style={{flexDirection:'row'}} >
                                                                    <View style={{width:'90%'}}>
                                                                    <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_from_title}</Text>
                                                                    </View>
                                                                    <View>
                                                                    <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                                                    </View>
                                                                </View>
                                                                    <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                                                    <Text allowFontScaling={false}  style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }}>{Strings.notification_from_message1} {item.widgetName} {Strings.notification_from_message3} {item.toName}</Text>
                                                                    <View style={{width:'90%'}}>
                                                                              {item.recStatus == 'Accept or Decline'? <Text allowFontScaling={false} onPress={() => this.acceptRec(item) } style={{ fontSize: 18,  color:item.rcolor ,textAlign:'right',fontFamily:'Roboto-Bold'}}>{item.recStatus}</Text>:<Text onPress={()=>{const{navigate}=this.props.navigation
                                                                              navigate("sharedApprow",{screen:"sharedApprow"})}} allowFontScaling={false} style={{ fontSize: 18,  color:'#2699FB', textAlign:'right',fontFamily:'Roboto-Bold',textDecorationLine:'underline'}}>{Strings.notification_view}</Text> }
                                                                    </View>
                                                                </TouchableOpacity>                                                              
                                                                <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                                </View>
                                                                </View>                                                     
                                                        </View>
                                                   <View style={{display:item.type_reward}}>                                                   
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>                                                         
                                                          <TouchableOpacity  style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}}  onPress={()=>this.expand_unread(item)}>
                                                              <View style={{flexDirection:'row'}}>
                                                                <View style={{width:'90%'}}>
                                                                      <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_reward_congrats}</Text>
                                                                </View>
                                                                <View>
                                                                      <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                                                </View>
                                                              </View>
                                                                <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} >{Strings.notification_reward_message1}</Text>
                                                          </TouchableOpacity>
                                                          <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                       
                                                          </View>
                                                    </View>
                                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                       
                                                      <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}}  onPress={()=>this.compress_unread(item)}>
                                                        <View style={{flexDirection:'row'}}>
                                                            <View style={{width:'90%'}}>
                                                            <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_reward_congrats}</Text>
                                                            </View>
                                                            <View>
                                                            <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                                            </View>
                                                      </View>                                                       
                                                            <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:8 }} numberOfLines={2}>{Strings.notification_reward_message2} {item.badge} {Strings.notification_reward_message3}</Text>                                                         
                                                      </TouchableOpacity>                                                       
                                                        <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                                        </View>
                                                       </View>                                              
                                                </View>  
                                    <View style={{display:item.type_to}}>
                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>                                     
                                    <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}} onPress={()=>this.expand_unread(item)}>
                                        <View style={{flexDirection:'row'}} >
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_to_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                          </View>
                                        </View>  
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} numberOfLines={2}>{Strings.notification_to_message1} {item.widgetName} {Strings.notification_to_message2} </Text>
                                    </TouchableOpacity>                                                              
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>
                                  </View>                                                              
                              </View>
                              <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                
                                  <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}}  onPress={()=>this.compress_unread(item)}>
                                      <View  style={{flexDirection:'row'}}>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_to_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                          </View>
                                      </View>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontWeight: '200', color: '#A7A9AC',paddingBottom:5 }}>{item.Date}</Text>  
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }}>{Strings.notification_to_message1} {item.widgetName} {Strings.notification_to_message3} {item.FromName}</Text>
                                          <View style={{width:'90%'}}>
                                          {item.recStatus == Strings.notification_event_pending? <Text allowFontScaling={false} onPress={() => this.acceptRec(item) } style={{ fontSize: 18,  color:item.rcolor ,textAlign:'right',fontFamily:'Roboto-Bold'}}>{item.recStatus}</Text>:<Text allowFontScaling={false} style={{ fontSize: 18,  color:item.rcolor, textAlign:'right',fontFamily:'Roboto-Bold'}}>{item.recStatus}</Text> }
                                          </View>
                                  </TouchableOpacity>                                                                                         
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                               
                                  </View>                              
                              </View>
                              </View>      
                              <View style={{display:item.type_CollectReward}}>
                                    <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.display}}>                                    
                                    <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}}  onPress={()=>this.expand_unread(item)}>
                                      <View style={{flexDirection:'row'}}>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_collect_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandMoreBlack} />
                                          </View>
                                      </View>                                       
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }} numberOfLines={2}>{Strings.notification_collect_message} </Text>
                                    </TouchableOpacity>                              
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                 
                                  </View>                             
                              </View>
                              <View style={{ width: '100%' ,paddingLeft:20,paddingRight:20,display:item.displayexpand}}>                                
                                  <TouchableOpacity style={{ flexDirection: 'column',paddingBottom:5,width:'100%'}}  onPress={()=>this.compress_unread(item)}>
                                      <View  style={{flexDirection:'row'}}>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} style={{ fontSize: 16,fontFamily:'Roboto-Bold', color: '#000000',paddingBottom:5 }}>{Strings.notification_collect_title}</Text>
                                          </View>
                                          <View>
                                          <Image  style={{ height: 25, width: 25,right:0,marginTop:-4}} source={assetsConfig.iconExpandLessBlack} />
                                          </View>
                                      </View>                                    
                                          <Text allowFontScaling={false} style={{ fontSize: 15,  color: '#2699FB',paddingBottom:5 }}>{Strings.notification_collect_message}</Text>
                                          <View style={{width:'90%'}}>
                                          <Text allowFontScaling={false} onPress={()=>this.props.setNav("Rewards")} style={{ fontSize: 18,  color:item.rcolor, textAlign:'right',fontWeight:'500',textDecorationLine:'underline'}}>{Strings.notification_collect}</Text> 
                                          </View>
                                  </TouchableOpacity>                                                                                              
                                  <View style={{marginTop:10,height:1,backgroundColor:"#b2babb",paddingRight:20,width:'95%'}}>                                
                                  </View>                 
                              </View>
                              </View>                    
                              </View>
                              </View>
                   } />
                        </View>
                        <View style={{display:this.state.NoNotification1,width:'100%',height:'100%',backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
                          <Text allowFontScaling={false} style={{fontSize:18}}>{Strings.notification_read_alert}</Text>
                        </View> 
            </View>
          </Tabs>  
          </Animated.ScrollView>        
          <Modal
                        isVisible={this.state.gotologinflow}
                        onBackButtonPress={() => this.setState({ gotologinflow: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" }}>
                            <View style={{ backgroundColor: "#006BBD", height: '18%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                                <Text allowFontScaling={false} style={[{ fontSize: 18, fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.guestuser_create}</Text>
                            </View>
                            <View style={{ height: "30%", alignItems: "center", justifyContent: "center", marginTop: "8%" }}>
                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title1}</Text>
                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title2}</Text>
                            </View>
                            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "10%" }}>
                                <TouchableOpacity onPress={() => { this.setState({ gotologinflow: false }) }}
                                    style={{ marginRight: 10, height: 42, width: 125, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_nobtn}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ gotologinflow: false })
                                        const { navigate } = this.props.navigation;
                                        navigate("login", {});
                                    }}
                                    style={{ marginLeft: 10, height: 42, width: 125, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_loginbtn}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  // App container
  container: {
    flex: 1,                            // Take up all screen
    backgroundColor: '#ffffff',         // Darker background for content area
  },
  // Tab content container
  content: {
    flex: 1,                            // Take up all available space
    justifyContent: 'center',           // Center vertically
    alignItems: 'center',               // Center horizontally
    backgroundColor: '#ffffff',         // Darker background for content area
  },
  // Content header
  header: {
    margin: 10,                         // Add margin
    color: '#2c66b7',                   // White color
    fontFamily: 'Avenir',               // Change font family
    fontSize: 26,                       // Bigger font size
  },
  // Content text
  text: {
    marginHorizontal: 20,               // Add horizontal margin
    color: 'rgba(255, 255, 255, 0.75)', // Semi-transparent text
    textAlign: 'center',                // Center
    fontFamily: 'Avenir',
    fontSize: 18,
  },
});