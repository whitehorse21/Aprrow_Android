import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View ,
  Linking,
  TouchableOpacity,
  Image,
  FlatList,
  BackHandler,
  Alert         // Container component
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import PopupDialog from 'react-native-popup-dialog';
import commons from './commons';
import Tabs from './utils/tabs';
import databasehelper from './utils/databasehelper.js';
import Strings from './utils/strings.js';

var aws_data11 = require("./config/AWSConfig.json");
var Mixpanel = require('react-native-mixpanel');
export default class sharedApprow extends Component {

  
  static navigationOptions = ({ navigation }) => {
    const { navigate } = navigation
    const { params = {} } = navigation.state;
    let title= Strings.sharedaprrow_page_head;
    let headerStyle= { backgroundColor: "#006BBD" };
    let headerTitleStyle= { color: 'white',fontFamily: 'Roboto-Bold',fontWeight:'200' };
    let headerTitleAllowFontScaling = false;
    let headerTintColor= 'white'; 
    let headerRight = (
      <View style={{flexDirection:'row'}}>
       <TouchableOpacity  onPress={params.handleSave ? params.handleSave : () => null}>
          <Image source={require('./assets/icon_check.png')}
            style={{
          height: 40,
          width: 40,
          marginTop: 1,
          marginBottom: 1
        }}   
        /> 
        </TouchableOpacity>  
    
    </View>
    );
    
    return {title,headerStyle,headerTitleStyle,headerTintColor,headerTitleAllowFontScaling };
  }; 
  constructor(props)
  {
    super(props);
    this.state={
      dlist : [],
      dlist2 : [],
      ref:false,
      last_key_val_mapping_from:{},
      last_key_val_mapping_to:{}
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink=this.openLink.bind(this);
    this.openLink1=this.openLink1.bind(this);
  }
  async openLink1()
  {

  }

  async componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);  
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() 
    {
    commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});
  
    return true;
    }
    
        
      
    async openLink(url)
    {
            
            const { navigate } = this.props.navigation;
            var username = await AsyncStorage.getItem("username");
            var isfirstrun=await AsyncStorage.getItem("firstrun");
            setTimeout(() => {
            if (username != null) {
                //navigate("welcome", { screen: "welcome" }); 
                var urldata = "";
                //console.log(url);
                if(url!=null)
                if (url.url != null&&username!=commons.guestuserkey()) {
                urldata = (url.url).split("#");
                //alert(JSON.stringify(url));
                //console.log("urls>>>>>>>>>>>>"+JSON.stringify(url));
                //alert(urldata[1]);
                commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
    
                }
                else {
                //commons.replaceScreen(this, 'bottom_menu', {});
                }
            }
            else {
                // navigate("login", { screen: "login" }); 
                if(isfirstrun==null)
                commons.replaceScreen(this, 'userypeselector', {});
                else
                commons.replaceScreen(this, 'login', {});
    
    
            }
            }, 2000); 
    
        
    }

  async  componentDidMount() {
    this.mixpanelTrack("Shared APRROW STAX View");

      Linking.getInitialURL().then(async (url) => {
        if(url)  
        this.openLink(url);
        else Linking.addEventListener('url', this.openLink1);
      });
      
  BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  this.list_from();
  this.list_to();
  try{
  var param=this.props.navigation.state.params.val;
  if(param!=undefined)
  {
    this.refs.Tabss.setVal();
  }
  }
  catch(err)
  {
    
  }
}

async list_from()
{   
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");      
    var acceestoken=await commons.get_token();            
   await fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                    "operation":"getFromListofUser",
                    "username":username //username
                    }),
                    }).then(async(response) =>await response.json())
                    .then(async(responseJson) => {
    // console.log("responseJson=====>>>"+JSON.stringify(responseJson));
   // alert(JSON.stringify(responseJson));
    if (responseJson.hasOwnProperty("LastEvaluatedKey"))
    {
      this.setState({last_key_val_mapping_from:responseJson.LastEvaluatedKey});
    }else this.setState({last_key_val_mapping_from:{}});
     var fromlist=responseJson.from;
    /* fromlist.sort(function (a, b) {
      return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
      });  */
      
    

     device_list=[];
     device_list2=[];

     this.setState({ dlist: [] });


     var deviceObj = {};
   
     //var toList={};

     if (fromlist.length > 0)
     { 
     for (var i = 0; i < fromlist.length; i++) 
     {  var dformat=commons.format_string_date(fromlist[i].senddate,'YYYYMMDDHHmmss','DD/MM/YYYY')
        fromlist[i].senddate=dformat;
      /*  var status="";
        
        if(fromlist[i]["status"]!=undefined)
        {
        status=fromlist[i]["status"];
      
        if(status=="Accepted")
        fromlist[i]["status"]=Strings.sharedlist_event_accept;
        else if(status=="Declined")
        fromlist[i]["status"]=Strings.sharedlist_event_decline;
        else fromlist[i]["status"]=Strings.sharedlist_event_pending;

        //alert(fromlist[i]["status"]);
        }*/
        if(fromlist[i]["transactionid"]==undefined ||fromlist[i]["transactionid"]=='undefined')
          {          
            
          }
          else if(deviceObj[fromlist[i]["transactionid"]]!=undefined) 
          {             
           
            var toObj={"toname":fromlist[i]["toName"],"status":fromlist[i]["status"],"statusdate":fromlist[i]["statusdate"]};           
            deviceObj[fromlist[i]["transactionid"]]["to"].push(toObj);
           
            //alert(JSON.stringify(toObj)); 
          }
          else
          {
            var fObj=fromlist[i];
            fObj["to"]=[{"toname":fromlist[i]["toName"],"status":fromlist[i]["status"],"statusdate":fromlist[i]["statusdate"]}];
            
            var widgetNameString="";
            var widgetList= fromlist[i]["widget"];
           

         /*   for(var index=0;index<widgetList.length;index++)
            {
              if(index==0)
                 widgetNameString=widgetNameString+fromlist[i]["widget"][index]["widgetname"];
             else 
                widgetNameString=widgetNameString+","+fromlist[i]["widget"][index]["widgetname"];
            } */
            fObj["widget"]=fromlist[i]["widget"];
            fObj["slist"]=Strings.sharedlist_event_slist;
            deviceObj[fromlist[i]["transactionid"]]=fObj;
      
          }       
     }
  
     
     
    
     var keys = Object.keys(deviceObj);   
             
             for (var x in keys) 
             {
                    var pkey=keys[x];
                    var pvalue=deviceObj[pkey];                    
                    device_list.push(pvalue);
             } 
        
    }
   
    

     //--------------------------------------------------------------------------------------
  /*   var deviceObj = {};
   if (fromlist.length > 0)
   { 
   for (var i = 0; i < fromlist.length; i++) {
       
     //  var dataObj = result.dataArri];

     if(fromlist[i]["transactionid"]==undefined ||fromlist[i]["transactionid"]=='undefined')
     {
      //console.log(">>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<"+fromlist[i]["transactionid"]);
     }
      else if(deviceObj[fromlist[i]["transactionid"]]!=undefined) 
      { 
       deviceObj[fromlist[i]["transactionid"]].push(fromlist[i]);
      }
       else{
        deviceObj[fromlist[i]["transactionid"]]=[];
        deviceObj[fromlist[i]["transactionid"]].push(fromlist[i]);
       }
     //  console.log(JSON.stringify(deviceObj));
     //  device_list.push(deviceObj);
      






 

    //   console.log("createtime=="+fromlist[i].createtime);
   }
   
   console.log("ObJ>>>>>>>>>>>>>>>"+JSON.stringify(deviceObj));
   var device_Array=[]
   
   var keys = Object.keys(deviceObj);
           
           for (var x in keys) 
           {
                  var pkey=keys[x];
                  var pvalue=deviceObj[pkey];

                  var widget=pvalue;
                  for(var i=0;i<pvalue.length;i++)
                  {
                
                   var obj={};
                   obj["to"]=widget[i]["to"];
                   pvalue.push(obj);   
                  }

           } 
      console.log("value>>>>>>>>"+JSON.stringify(pvalue));

   
  }*/
   else this.setState({ remote: 'flex' });
   await this.setState({ dlist: device_list });
   
  
  //alert(JSON.stringify(this.state.dlist));

  })
  .catch((error) => {
  console.error(error);
  });
           

}




async loadmore_from(key)
{   if(!key.hasOwnProperty("Timestamp"))
    return
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");      
    var acceestoken=await commons.get_token();                
   await fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                    "operation":"getFromListofUser",
                    "username":username, //username
                    "LastEvaluatedKey":key
                    }),
                    }).then(async(response) =>await response.json())
                    .then(async(responseJson) => {
    // console.log("responseJson=====>>>"+JSON.stringify(responseJson));
    if (responseJson.hasOwnProperty("LastEvaluatedKey"))
    {
      this.setState({last_key_val_mapping_from:responseJson.LastEvaluatedKey});
    }else this.setState({last_key_val_mapping_from:{}});
     var fromlist=responseJson.from;
     fromlist.sort(function (a, b) {
      return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
      }); 
      
    

     device_list=[];
     device_list2=[];

     //this.setState({ dlist: [] });


     var deviceObj = {};
   
     //var toList={};

     if (fromlist.length > 0)
     { 
     for (var i = 0; i < fromlist.length; i++) 
     {  var dformat=commons.format_string_date(fromlist[i].senddate,'YYYYMMDDHHmmss','DD/MM/YYYY')
        fromlist[i].senddate=dformat;
        if(fromlist[i]["transactionid"]==undefined ||fromlist[i]["transactionid"]=='undefined')
          {          
            
          }
          else if(deviceObj[fromlist[i]["transactionid"]]!=undefined) 
          {             
           
            var toObj={"toname":fromlist[i]["toName"],"status":fromlist[i]["status"]};           
            deviceObj[fromlist[i]["transactionid"]]["to"].push(toObj);
           
             
          }
          else
          {
            var fObj=fromlist[i];
            fObj["to"]=[{"toname":fromlist[i]["toName"],"status":fromlist[i]["status"]}];
            var widgetNameString="";
            var widgetList= fromlist[i]["widget"];
           

         
            fObj["widget"]=fromlist[i]["widget"];
            fObj["slist"]=Strings.sharedlist_event_slist;
            deviceObj[fromlist[i]["transactionid"]]=fObj;
      
          }       
     }
  
     
     
     var dtestfrom=this.state.dlist;
     
     var keys = Object.keys(deviceObj);   
             
             for (var x in keys) 
             {
                    var pkey=keys[x];
                    var pvalue=deviceObj[pkey];   
                    // alert(">>>pvalue"+JSON.stringify(pvalue));               
                    dtestfrom.push(pvalue);
             } 
        //console.log("value>>>>>>>>"+JSON.stringify(device_list));     
        
        this.setState({ dlist: dtestfrom });  
    }
   
   
   else this.setState({ remote: 'flex' });
   
   
  
  
  //alert(JSON.stringify(this.state.dlist));

  })
  .catch((error) => {
  console.error(error);
  });
           

}

///////////////////////////////from////////////////////////////



////////////////////////////////to/////////////////////////////
async list_to()
{   
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");      
    var acceestoken=await commons.get_token();            
    await fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                    "operation":"gettoListofUser",
                    "username":username //username
                    }),
                    }).then(async(response) =>await response.json())
                    .then(async(responseJson) => {
    // console.log("responseJson=====>>>"+JSON.stringify(responseJson));
    if (responseJson.hasOwnProperty("LastEvaluatedKey"))
    {
      this.setState({last_key_val_mapping_to:responseJson.LastEvaluatedKey});
    }else this.setState({last_key_val_mapping_to:{}});
     
      
     var tolist=responseJson.to;
    // alert(JSON.stringify(responseJson));
     tolist.sort(function (a, b) {
      return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
      });

     device_list=[];
     device_list2=[];

     

   
  
  //  alert(JSON.stringify(tolist));
   if (tolist.length > 0)
   {   
      for (var i = 0; i < tolist.length; i++) {
       var deviceObj = {};
       deviceObj["key"] = i + "";
     //  var wid=tolist[i]["widget"];
       var widgetname=tolist[i]["widget"];
   
      deviceObj["name"] = widgetname; 
       deviceObj["slist"] = Strings.sharedlist_event_slist;
       deviceObj["sharingid"] =tolist[i]["sharingid"]; 
       deviceObj["widget"] =tolist[i]["widget"];
       deviceObj["Timestamp"] =tolist[i]["Timestamp"];
        if(tolist[i].hasOwnProperty('to'))
        {
          deviceObj["slist"]=tolist[i]["fromName"];
        }

        if(tolist[i].status=='Declined')
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_decline;
          deviceObj["rcolor"] = 'red';
        }
        else if(tolist[i].status=='pending')
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_pending;
          deviceObj["rcolor"] = 'orange';
        }
        else
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_accept;
          deviceObj["rcolor"] = 'green';        
        }  
       device_list2.push(deviceObj);
   }
  } 
   else this.setState({ remote: 'flex' });
   this.setState({ dlist2: device_list2 });
  

  })
  .catch((error) => {
  console.error(error);
  });
           

}




async loadmore_to(key)
{   if(!key.hasOwnProperty("Timestamp"))
    return;
    var username = await AsyncStorage.getItem("username");
    var aws_data=require("./config/AWSConfig.json");      
    var acceestoken=await commons.get_token();                
   await fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':acceestoken
                    },
                    body: JSON.stringify({
                    "operation":"gettoListofUser",
                    "username":username, //username
                    "LastEvaluatedKey":key
                    }),
                    }).then(async(response) =>await response.json())
                    .then(async(responseJson) => {
    // console.log("responseJson=====>>>"+JSON.stringify(responseJson));
    if (responseJson.hasOwnProperty("LastEvaluatedKey"))
    {
      this.setState({last_key_val_mapping_to:responseJson.LastEvaluatedKey});
    }else this.setState({last_key_val_mapping_to:{}});
     
     var tolist=responseJson.to;
     tolist.sort(function (a, b) {
      return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
      });

     device_list=[];
     device_list2=[];

  
   
   
  
  //  alert(JSON.stringify(tolist));
   if (tolist.length > 0)
   {  var dlist_copy=this.state.dlist2;
      var dlist_length=dlist_copy.length;
      for (var i = 0; i < tolist.length; i++) {
       var deviceObj = {};
       deviceObj["key"] = i + dlist_length+ "";
     //  var wid=tolist[i]["widget"];
       var widgetname=tolist[i]["widget"];
   
      deviceObj["name"] = widgetname; 
       deviceObj["slist"] = 'Shared By Name';
       deviceObj["sharingid"] =tolist[i]["sharingid"]; 
       deviceObj["widget"] =tolist[i]["widget"];
       deviceObj["Timestamp"] =tolist[i]["Timestamp"];
        if(tolist[i].hasOwnProperty('to'))
        {
          deviceObj["slist"]=tolist[i]["fromName"];
        }

        if(tolist[i].status=='Declined')
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_decline;
          deviceObj["rcolor"] = 'red';
        }
        else if(tolist[i].status=='pending')
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_pending;
          deviceObj["rcolor"] = 'orange';
        }
        else
        {
          deviceObj["recStatus"] = Strings.sharedlist_event_accept;
          deviceObj["rcolor"] = 'green';        
        }  
       dlist_copy.push(deviceObj);
   }
   this.setState({ dlist2: dlist_copy});
  } 
   else this.setState({ remote: 'flex' });
   
  

  })
  .catch((error) => {
  console.error(error);
  });
           

}
///////////////////////////////to/////////////////////////////



acceptRec(item)
{
 // alert(" hi  "+item.name);
  Alert.alert(
    '',
    'Do You want to accept APPROW Stax '+item.name+' by name?',
    [
    {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
    /// {text: 'CANCEL', onPress: () => this.decline(item), style: 'cancel'},
      {text: 'DECLINE', onPress: () => this.decline(item), style: 'cancel'},
      {text: 'ACCEPT', onPress: () => this.accept(item)},
    ],
    { cancelable: false }
  )
}
async accept(item)
{

 
 
  //var widgetdata = item.widget;
  var modified_widgets = [];
  const deviceid = await AsyncStorage.getItem("currentdeviceid");
 
  if (deviceid == null) {
    commons.replaceScreen(this, 'welcome', {});
    ToastAndroid.show(Strings.notification_toast_device,500);
    return;
  }
  //alert("widget to insert>>>>"+widgetdata.length)
  this.getWidgetFromBackend(item);
       
  
 

}
async mixpanelTrack(event)
  {
    try{
         var Mixpannel_tocken=aws_data11.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
             Mixpanel.default.track(event);
             });
       }catch(err){
 
       }
   }

decline(item)
{

var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();

 var passdata={
  "sharingid":item.sharingid,
   "status":"Declined",
   "date":date,
   "Timestamp":item.Timestamp
}
 item.recStatus='Declined';
 item.rcolor='red'
 this.setState({ref:false});
 this.backendwrite(passdata);
}
/*async backendwrite(passdata)
{ 
  var aws_data=require("./config/AWSConfig.json");   
 await fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
    method: 'POST',
    headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    "operation":"updatestatus",
    "sharingid":passdata.sharingid, //username
    "status":passdata.status,
    "statusdate":passdata.date,
    }),
    }).then((response) => response.json())
    .then((responseJson) => {

     //alert(JSON.stringify(responseJson));
    });

} */
async backendwrite(passdata)
{ 
    //alert(JSON.stringify(passdata));
    var aws_data=require("./config/AWSConfig.json");   
    var uuid=await commons.getuuid();
    var username=await AsyncStorage.getItem("username");
    var userData=await databasehelper.getuser();
    var date=await commons.gettimestamp();
 
  var aws_data=require("./config/AWSConfig.json");  
 /* console.log(JSON.stringify({
    "operation":"updatestatus_Temp",
    "sharingid":passdata.sharingid, //username
    "status":passdata.status,
    "statusdate":date,
    "Timestamp":passdata.Timestamp,
    "username":username,
    "name":userData.res[0].firstname+" "+userData.res[0].lastname,
    "uuid":uuid
    })); */
    var acceestoken=await commons.get_token();
  fetch(''+aws_data.path+aws_data.stage+'sharingfunction', {
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

    //  alert(JSON.stringify(responseJson));
    });

}
/*async getWidgetFromBackend(item)
{

  var aws_data = require("./config/AWSConfig.json");
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "operation": "getSharedList",
        "sharingid": item.sharingid
      }),
    }).then(async (response) =>await response.json())
      .then(async (responseJson) => {
      // alert(JSON.stringify(responseJson));
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
        if(responseJson.widget[0].storeid==undefined||responseJson.widget[0].storeid=='undefined')
        { 
        if(responseJson.medium=='socialmedia')
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
            widgetdata[i]["backgroundpicture"]="";
            modified_widgets.push(widgetdata[i]);
        
          }
          
          var result=await databasehelper.shareinsertwidget(modified_widgets);
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
        ToastAndroid.show("Link Expired",3000);
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
} */
async getWidgetFromBackend(item)
{
  //alert(JSON.stringify(item));
  var aws_data = require("./config/AWSConfig.json");
  var acceestoken=await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
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
      
    try{
        //alert(JSON.stringify(responseJson));
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
            widgetdata[i]["widgetid"] = uuid;
            widgetdata[i]["deviceid"] = deviceid;
            widgetdata[i]["mostusedwidget"]=3;
            widgetdata[i]["createtime"] = commons.gettimestamp();
            widgetdata[i]["backgroundpicture"]="";

            modified_widgets.push(widgetdata[i]);
        
          }
          
          var result=await databasehelper.shareinsertwidget(modified_widgets);
          var passdata={
            "sharingid":item.sharingid,
            "status":"Accepted",
            "date":date,
            "Timestamp":item.Timestamp
          }


          //this.setState({ref:false});
          this.backendwrite(passdata);
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
          dlist[key]["recStatus"]=Strings.sharedlist_event_accept;
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

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        <Tabs ref={"Tabss"}>
          {/* First tab */}
          <View title={Strings.sharedaprrow_page_tab_head1} style={styles.content}>
           
               <FlatList style={{ flex: 1 }}
                            data={this.state.dlist}
                            extraData={this.state}
                           // ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping_from.hasOwnProperty("Timestamp"),<TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={()=>this.loadmore_from(this.state.last_key_val_mapping_from)}><Text allowFontScaling={false}  style={{fontSize:18,fontWeight:'500',textAlign:'center'}}>Load More</Text></TouchableOpacity>)}
                           onEndReachedThreshold={0.5}
                            onEndReached={({ distanceFromEnd }) => {
                                                                this.loadmore_from(this.state.last_key_val_mapping_from);
                                          }} 
                           
                           renderItem={({ item }) =>

                                <View style={{ flex: 1, flexDirection: 'row', width: '100%',alignItems:'center',justifyContent:'space-between',paddingTop:10 }}>
                                    <View style={{ width: '20%' }}>
                                        
                                              <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 50, height: 70 }} source={require('./assets/Tumbnail_stax.png')} />
                                            
                                                </View>
                                    
                                    </View>
                                    <View style={{ width: '80%' }}>
                                       
                                            <View style={{ flexDirection: 'column'}}>

                                                <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily:'Roboto-Bold', color: 'black' }}>{item.widget}</Text>
                                                <Text allowFontScaling={false} style={{ fontSize: 16,  color: '#9297a0' }}>{item.senddate}</Text>
                        
                                                 <TouchableOpacity  onPress={() => {
                                                  // alert(">>>>>>>>>>>>>>>>>"+JSON.stringify(item)); 
                                                   navigate("sharedbylist",user={'list':item})
                                                   }}>    
                                                 <Text allowFontScaling={false}  style={{ fontSize: 16,  color: '#006BBC',textDecorationLine:'underline',fontWeight:'300' }} >{item.slist}</Text>
                                                 </TouchableOpacity>

                                               </View>
                                    
                                    </View>
                                   
                                </View>




                            }
                        />

                





          </View>
          {/* Second tab */}
          <View title={Strings.sharedaprrow_page_tab_head2} style={styles.content}>
         
          <FlatList style={{ flex: 1 }}
                            data={this.state.dlist2}
                            extraData={this.state}
                          //  ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping_to.hasOwnProperty("Timestamp"),<TouchableOpacity style={{alignItems:'center',justifyContent:'center',marginHorizontal:'2%'}} onPress={()=>this.loadmore_to(this.state.last_key_val_mapping_to)}><Text allowFontScaling={false}  style={{fontSize:18,fontWeight:'500',textAlign:'center'}}>Load More</Text></TouchableOpacity>)}
                           
                            onEndReachedThreshold={0.5}
                            onEndReached={({ distanceFromEnd }) => {
                                                              this.loadmore_to(this.state.last_key_val_mapping_from);
                                        }} 
                            renderItem={({ item }) =>

                                <View style={{ flex: 1, flexDirection: 'row', width: '100%',alignItems:'center',justifyContent:'space-between',paddingTop:10 }}>
                                    <View style={{ width: '20%' }}>
                                        <TouchableOpacity >
                                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 50, height: 70 }} source={require('./assets/Tumbnail_stax.png')} />
                                            
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '80%' }}>
                                        <TouchableOpacity >
                                            <View style={{ flexDirection: 'column'}}>

                                                <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily:'Roboto-Bold', color: 'black' }}>{item.name}</Text> 
                                                {item.recStatus == 'Waiting Acceptanc'? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 16,  color:item.rcolor }}>{item.recStatus}</Text>:<Text allowFontScaling={false} style={{ fontSize: 16,  color:item.rcolor }}>{item.recStatus}</Text> }

                                                 <Text allowFontScaling={false}  style={{ fontSize: 16,  color: '#2159b2' }}>{item.slist}</Text>
                                                
                                           </View>
                                        </TouchableOpacity>
                                    </View>
                                   
                                </View>




                            }
                        />
          </View>
         

        </Tabs>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // App container
  container: {
    flex: 1,                            // Take up all screen
    backgroundColor: '#ffffff',         // Darker background for content area
   // backgroundColor: '#E9163',         // Background color
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