import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text,FlatList,ToastAndroid } from "react-native";
import CheckBox from 'react-native-check-box';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import ToastExample from './nativemodules/Toast';
var DeviceInfo = require('react-native-device-info');
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");

var dname = [];
var did = [];
var dmodel = [];
var len = 0;
var widgetdata = [];
export default class AnotherDevice extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;

    let title = "Share Another Device";
    let headerStyle = { backgroundColor: "#006BBD" };
    let headerTitleStyle = {
      color: "white",
      fontWeight: "500",
      marginLeft: 0,
      fontSize: 18
    };
    let headerTintColor = "white";
    let headerLeft = (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => goBack()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginLeft: 5
            }}
            source={require("./assets/icon_arrow_back.png")}
          />
        </TouchableOpacity>
      </View>
    );
let headerRight = (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={()=>params._ShareFunc()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginLeft: 5, marginRight: 5, marginBottom: 1 }} source={require("./assets/icon_share_white.png")} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>params.allSelect()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginLeft: 5
            }}
            source={require("./assets/icon_done_all_white.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => params.deSelect()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginLeft: 5,
              marginLeft: 20
            }}
            source={require("./assets/icon_expand_close.png")}
          />
        </TouchableOpacity>
      </View>
    );


    return {
      title,
      headerStyle,
      headerTitleStyle,
      headerTintColor,
      headerLeft,
      headerRight
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      len:0,
      widgetName:' ',
      wlist:[],
      dlist:[],
      show:false
      
    };
  }
  async device_list() {
         ToastExample.getapps(
            (msg) => {
                console.log(msg);
            },
            async (applist) => {
                this.setState({ loading: true });
                var applist_fromdevice;
                var applist_modified;
                applist_fromdevice = JSON.parse(applist);
                var applist_obj = {};

                for (var k = 0; k < applist_fromdevice.length; k++) {
                    applist_obj[applist_fromdevice[k].package] = "data:image/png;base64," + applist_fromdevice[k].icon;

                }
                var widgetid=this.props.navigation.state.params.widgetid;
                var flag=this.props.navigation.state.params.flag;
                var result = await databasehelper.getwidget(widgetid);
                var widgetName=result.dataObj["widgetname"];
                this.setState({widgetName});
                
                var dataloop2 = [];

                    var dataobj = result.dataObj.applist;
                    
                    let w_alen = dataobj.length;
                  
     
                    for (var j = 0; j < w_alen; j++) {
                        dataobj[j]["deviceid"]=result.dataObj["deviceid"];
                        dataobj[j]["checked"]=this.state.show;
                        if (applist_obj.hasOwnProperty(dataobj[j].package))
                            dataobj[j]["icon"] = applist_obj[dataobj[j].package];
                        else
                            dataobj[j]["icon"] = commons.getIconUnavailable();  //dataobj.applist[j]["icon"]="data:image/png;base64,"

                        dataobj[j]["key"] = j + "";

                    }
                    //dataloop2.push(dataobj);
                   // alert(JSON.stringify(data));
                    this.setState({wlist:dataobj});
                    this.setState({dlist:dataobj}); 
            }  
        )
  }
    
  
  componentDidMount() {
    var MixPannel_tocken=aws_data11.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(MixPannel_tocken).then(() => {
      Mixpanel.default.track("Device Applist");
      });
    this.props.navigation.setParams({ _ShareFunc: this._ShareFunc.bind(this)});
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this)});
    this.props.navigation.setParams({ deSelect: this.deSelect.bind(this)});
    
    this.device_list();
  
  }
 
  deSelect()
  {
    var dlist=[];
    this.setState({show:false,dlist:dlist});
    this.device_list();
     
  }
  allSelect()
  {
    var dlist=[];
    this.setState({show:true,dlist:dlist});
    

    this.device_list();
   
  }
   async onClick(item) {
     if(item.checked==true)
      {

        item.checked=false;
      }
      else item.checked=true;
  
   }
   async _ShareFunc() {
    var MixPannel_tocken=aws_data11.mixpanel_token;
    Mixpanel.default.sharedInstanceWithToken(MixPannel_tocken).then(() => {
      Mixpanel.default.track("Stax Share");
      });
        let d_list=this.state.dlist;
        let temp=JSON.stringify(d_list);
        let applist=[];
       for(let i=0;i<d_list.length;i++)
        {   
            if(d_list[i]["checked"]==true)
              {  
                let dataObj=JSON.parse(temp);;
                let applistObj=dataObj[i];
                applist.push(applistObj); 
              }
        } 
          var widgetArray=applist;
          var flag=1;		      
          const { navigate } = this.props.navigation;  	
          var item=this.props.navigation.state.params.item;
          if(widgetArray.length>0)
          navigate("ShareWidgetOptions",user={widgetArray,flag,item});
          else ToastAndroid.show("You dont have any apps",3000);
        
        
        
       }


  render() {
    return (
      
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Text
          style={{
            marginLeft: 20,
            marginTop: 20,
            fontSize:18,
            color: "black",
            fontWeight: "bold",textAlign:'center'
          }}
        >
        {this.state.widgetName}
        </Text>
        
       
        <View style={{flex:1,flexDirection: "row", marginTop: 10,marginLeft: 20 }}>
       
                      <FlatList style={{ flex: 1 }}
                           extraData={this.state}
                            data={this.state.dlist}                     
                            renderItem={({ item }) =>
                            <View style={{flexDirection:'row',backgroundColor:'white',marginTop:10,marginBottom:10}}>
                                      <View style={{width:'20%',flexDirection:'row' }}>
                                      <Image style={{  width: 45, height: 45 }} source={{ uri:item.icon }}/>
                                      </View>
                                      <View style={{width:'50%',flexDirection:'row',marginTop:10 }}>
                                      <Text style={{textAlign:'left',marginLeft: 10,color: "black",fontWeight: "500",fontSize:16}} onPress={()=>{}}>{item.appname}</Text>
                                      </View>
                                      <View style={{width:'30%' }}>
                                      <CheckBox
                                                onClick={() => this.onClick(item)}
                                                isChecked={item.checked} />
                                      </View>
                            </View>
                            }
                        />
          
          
        </View>
      
        </View>
        
    );
  }
}
