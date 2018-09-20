import React, { Component } from 'react';
import ToastExample from './nativemodules/Toast';
import {
  AsyncStorage,
  BackHandler,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View,
  TouchableHighlight,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  ToastAndroid         // Container component
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Share, { ShareSheet } from "react-native-share";
import commons from './commons';
import databasehelper from './utils/databasehelper.js';
import CheckBox from 'react-native-check-box';
import { Item } from 'native-base';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var item={};
var deviceName='';
var applimit=0;
var paramsDisabledValue=false;
export default class sharedApprow extends Component {
  static navigationOptions = ({ navigation }) => {
    const { navigate } = navigation
    const { params = {} } = navigation.state;
    const deviceName = Strings.applist_page_head;
    let title = deviceName;
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white',fontFamily: 'Roboto-Bold',fontWeight:'200'  };
    let headerTintColor = 'white';
    let headerTitleAllowFontScaling=false;
    let headerRight = (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity disabled={params.disabledValue} onPress={() => params._ShareFunc()}>
          <Image style={{ height: 25, width: 25, marginTop: 1, marginRight: 15, marginBottom: 1 }} source={assetsConfig.iconShareWhite} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => params.allSelect()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginRight:10
            }}
            source={assetsConfig.iconDoneAllWhite}
          />
        </TouchableOpacity>
      </View>
    );
    return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight,headerTitleAllowFontScaling };
  };
  constructor(props) {
    super(props);
    this.state = {
      appListFromDevice: [],
      deviceAppList: [],
      show:false,
      ref: false,
      deviceName:'',
      loading:false,
      appUninstallDesign:'none'
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() 
  {
    const { goBack } = this.props.navigation;
    goBack(); 
    return true;
  }
    async componentDidMount()
    {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.props.navigation.setParams({ _ShareFunc: this._ShareFunc.bind(this)  });
    this.props.navigation.setParams({disabledValue:false});
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this) });
    this.props.navigation.setParams({ deSelect: this.deSelect.bind(this)  });
    paramsDisabledValue=false;
    this.appList();
    item=this.props.navigation.state.params.item;
    deviceName=item.name;
  }
/** 
  * (Fetch the applist of remote device from dynamo db
     >> Calls the lambda function)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/
  async appList()
  {
    var choosedDevice=this.props.navigation.state.params.item;
    var navDeviceId = choosedDevice.id;
    var curDeviceId = await AsyncStorage.getItem("currentdeviceid");
        var appListFromDevice = {};
        if (curDeviceId != null && curDeviceId == navDeviceId) {
            this.setState({appUninstallDesign:'flex'});
            this.list();
        }
        else {
            var acceestoken = await commons.get_token();
            var awsData = require("./config/AWSConfig.json");
            var awsLamda = require("./config/AWSLamdaConfig.json");
            const response = await fetch('' + awsData.path + awsData.stage + awsLamda.deviceappoperations, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': acceestoken
                },
                body: JSON.stringify({ "operation": "getApplist", "deviceid": navDeviceId}),
            });
           const res = await response.json();
            var applist_Remotedevice=[];
            applimit=res.length;
            for (var i = 0; i < res.length; i++) {
                let applabel = res[i].applabel;
                let packagename = res[i].package;
                let usage = res[i].usage;
                let icon = "";
                if (global.applist.hasOwnProperty(packagename))
                    icon = "file://" + global.applist[packagename].icon
                else
                    icon = commons.getIconUnavailable();
                var appobj = {};
                appobj["key"] = i + "";
                appobj["icon"] = icon;
                appobj["package"] = packagename;
                appobj["appname"] = applabel;
                appobj["checked"] = this.state.show;
                applist_Remotedevice.push(appobj);
            }
            this.setState({deviceAppList:applist_Remotedevice});
        }
  }
  async deSelect()
  {
  }
  /** 
  * (share the applist as a widget through social media )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
  async share_widget(widgetArray) {
    this.setState({ load_visible: true });
    var userData = await databasehelper.getuser();
    var firstName = "";
    var lastName = "";
    if (userData.res != null && userData.res.length > 0) {
        firstName = userData.res[0].firstname;
        lastName = userData.res[0].lastname;
    }
    var req_obj = {};
    req_obj["operation"] = "insertSharedList";
    var date = commons.gettimestamp();
    var uuid = await commons.getuuid()
    var userName = await AsyncStorage.getItem("username");
    var tranId = await commons.getuuid();
    var payLoad = {};
    payLoad["sharingid"] = uuid;
    payLoad["from"] = userName;
    payLoad["to"] = "";
    payLoad["status"] = "pending";
    payLoad["medium"] = "socialmedia";
    payLoad["transactionid"] = tranId;
    payLoad["senddate"] = date;
    payLoad["widget"] = widgetArray;
    payLoad["fromName"] = firstName + " " + lastName;
    req_obj["payload"] = payLoad;
    var awsData = require("./config/AWSConfig.json");
    var awsLamda = require("./config/AWSLamdaConfig.json");
    var acceestoken=await commons.get_token();
    await fetch('' + awsData.path + awsData.stage + awsLamda.sharingfunction, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization':acceestoken
        },
        body: JSON.stringify(req_obj),
    }).then((response) => response.json())
        .then(async (responseJson) => {
            this.setState({ load_visible: false });
            var options = shareOptions = {
                title: Strings.share_title,//"Share By",
               // message: "Hello,\n\n"+firstName + " " + lastName+" has shared the "+ widgetArray[0].widgetname+" Stax with you. Please click on the link below to receive your APRROW Stax.\n\n https://www.aprrow.com/redirect.html?id=#" + uuid+"\n\nPlease note that you must have APRROW installed in your device to receive a Stax. Please click here  https://play.google.com/store/apps/details?id=com.aprrow to install APRROW.\n\nLife is a Journey! Where will APRROW take YOU?" ,
                message: Strings.share_message_line1+"\n\n"+firstName +" "+lastName+ Strings.share_message_line2 + widgetArray[0].widgetname+Strings.share_message_line3+"\n\n"+ Strings.share_message_line4 +uuid+"\n\n"+Strings.share_installation_link+"\n\n"+ Strings.share_message_line5,
                url: Strings.url,
                subject: firstName + " " + lastName+Strings.share_mail_subject //  for email
            };
            Share.open(options);
        })
        .catch((error) => {
            this.setState({ load_visible: false });
            console.error(error);
        });
}
/** 
  * (Collects all selected apps details as an object )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  async _ShareFunc() {
        this.props.navigation.setParams({disabledValue:true});
        paramsDisabledValue=true;
        let d_list=this.state.deviceAppList;      
        let temp=JSON.stringify(d_list);
        let applist=[];
       for(let i=0;i<d_list.length;i++)
        {   
            if(d_list[i]["checked"]==true)
              {  
                let dataObj=JSON.parse(temp);
                let applistObj=dataObj[i];
                applist.push(applistObj); 
              }
        } 
          var widgetArray=applist;
          var flag=1;		      
          const { navigate } = this.props.navigation;  	
          var item=this.props.navigation.state.params.item;
          if(widgetArray.length>0)
          {
           if(paramsDisabledValue==true)
            {
            var applist_temp=[];
            for(var i=0;i<widgetArray.length;i++)
            {
                var dataObj={};
                dataObj["appname"]=widgetArray[i]["appname"];
                dataObj["package"]=widgetArray[i]["package"];
                applist_temp.push(dataObj);
            }   
                  var newwidget=[];
                  let dataObj={};
                  let createtime=commons.gettimestamp();
                  let guid=await commons.getuuid();
                  let deviceid=temp[0]["id"];
                  dataObj.widgetid=guid;
                  dataObj.deviceid=deviceid;
                  dataObj.createtime=createtime;
                  dataObj.widgetname="Share Apps Friends";
                  dataObj.deleteflag=0;
                  dataObj.applist=applist_temp;
                  dataObj.mostusedwidget=1;
                  dataObj.headercolor="";
                  dataObj.backgroundcolor="";
                  dataObj.transperancy="";
                  dataObj.backgroundpicture="";
                  newwidget.push(dataObj);
                this.share_widget(newwidget);
            setTimeout(() => {this.props.navigation.setParams({disabledValue:false}); paramsDisabledValue=false}, 1000);
          }
          }
          else { ToastAndroid.show("Apps Not Found.Please add apps",3000);
          this.props.navigation.setParams({disabledValue:false});
          }
       }
 /** 
  * (Check all checkboxes)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/       
 async allSelect() {
    var trending_App_List =this.state.deviceAppList;
    for(var i=0;i<trending_App_List.length;i++)
    {
      trending_App_List[i]["checked"]=true;
    }
    await this.setState({deviceAppList:[]});
    await this.setState({deviceAppList:trending_App_List});

  }
 /** 
  * (Fetch the applist of local device 
     >> It access the app details from global variable
     >>Global var keeps the app data)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/ 
  async list() {
    this.setState({deviceAppList:[]});
        var appListFromDevice = global.applist;
        var trending_App_List = [];
        var recomended_App_List = [];
        var appCount=0;
        applimit=Object.keys(appListFromDevice).length;
        var k=0;
        for (var app in appListFromDevice) {
          let icon = "file://" + appListFromDevice[app].icon;
          let applabel = appListFromDevice[app].applabel;
          let packagename = appListFromDevice[app].package;
          let usage = appListFromDevice[app].usage;
          var appobj = {};
          appobj["key"] = k + "";
          appobj["icon"] = icon;
          appobj["package"] = packagename;
          appobj["appname"] = applabel;
          appobj["checked"] = this.state.show;
          trending_App_List.push(appobj);
          k++;
        }
        this.setState({ deviceAppList: trending_App_List });
  }
/** 
  * (Toggle betwwen check uncheck )
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async onClick(item) {
    if (item.checked == true) {
      item.checked = false;
    }
    else item.checked = true;
  }
/** 
  * (Uninstall app)
  * @param  :item(object)     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/  
  async UnInstallApps(item)
  {
    var arrayOfObjects=this.state.deviceAppList;
    var app_array=[];
    for(var i = 0; i < arrayOfObjects.length; i++) {
      var obj = arrayOfObjects[i];
      if(obj.key!==item.key)
      app_array.push(obj);
      else applimit=applimit-1;
    }
    this.setState({deviceAppList:app_array});
  }
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
    
          <View title="INSTALLED" style={styles.content}>
          <View style={{height:1,width:"100%",backgroundColor:"#b2babb"}}>
            </View>
          <View style={{width:'100%',height:'12%',alignItems:'center',justifyContent:'center',flexDirection:'row',backgroundColor:'#F5F5F5'}}>
          <Text allowFontScaling={false} style={{fontSize:16,fontFamily:'Roboto-Bold',color:"black"}}>{Strings.applist_page_device} "</Text>
            <Text allowFontScaling={false} style={{fontSize:18,fontFamily:'Roboto-Bold',color:"black"}}>{deviceName}</Text>
            <Text allowFontScaling={false} style={{fontSize:16,fontFamily:'Roboto-Bold',color:"black"}}>" {Strings.applist_page_device1} ({applimit})</Text>
          </View>
          <View style={{height:1,width:"100%",backgroundColor:"#b2babb"}}>
            </View>
            <FlatList style={{ flex: 1}}
              extraData={this.state}
              data={this.state.deviceAppList}
              renderItem={({ item }) =>
               <View style={{paddingLeft:5,paddingRight:5,justifyContent: 'center',alignItems:'center'}}>
                <View style={{ flexDirection: 'row', backgroundColor: 'white', paddingTop: 10, paddingBottom: 20,paddingLeft:10,paddingRight:10 }}>
                  <View style={{ width: '15%', flexDirection: 'row', justifyContent: 'center' }}>
                    <Image style={{ width: 55, height: 55 }} source={{ uri: item.icon }} />
                  </View>
                  <View style={{ width: '45%', flexDirection: 'row', paddingTop: 15 }}>
                    <Text allowFontScaling={false} style={{ textAlign: 'left', marginLeft: 10, color: "black", fontFamily:'Roboto-Bold', fontSize: 16 }} onPress={() => { }}>{item.appname}</Text>
                  </View>
                  <View style={{ marginLeft:"8%",width: '15%',justifyContent:'center'}}>
                    <CheckBox
                      style={{borderColor:'blue'}}
                      onClick={() => this.onClick(item)}
                      isChecked={item.checked} 
                      checkedImage={<Image source={assetsConfig.checkboxCheckedIcon} />}
                      unCheckedImage={<Image source={assetsConfig.checkbocUncheckedIcon} />}       
                      />
                  </View>
                  <TouchableOpacity style={{ width: '15%',justifyContent:'center',display:this.state.appUninstallDesign}}  onPress={async() =>{var as=await ToastExample.appUnInstaller(item.package);
                                                                                               if(as=='true')
                                                                                               await this.UnInstallApps(item);
                                                                                                   }} >
                  <Image style={{height: 30, width: 30 }}source={assetsConfig.iconDeleteBlue}/>
                  </TouchableOpacity>  
                </View>
                  <View style={{height:1,width:"85%",backgroundColor:"#b2babb",justifyContent: 'center'}}>
                  </View>
                </View>
              }
            />
          </View>
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
    alignItems: 'center',
    alignContent: 'center',            // Center horizontally
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