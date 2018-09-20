import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text,FlatList } from "react-native";
import CheckBox from 'react-native-check-box';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
var DeviceInfo = require('react-native-device-info');
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
        <TouchableOpacity onPress={() => goBack()}>
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
      dlist:[]
    };
  }
  async device_list(show) {
        //alert(">>>>>>>>>>>"+JSON.stringify(AsyncStorage.getItem("currentdeviceid")));
        var widgetid=this.props.navigation.state.params.widgetid;
        widgetdata = await databasehelper.getwidget(widgetid);
        var datas = " ";
        this.setState({ dlist: [] });
        var result = await databasehelper.getAlldevice();
        
        var devicehardid = DeviceInfo.getUniqueID();
        this.state.len = result.dataArray.length;
        var len = this.state.len;
        var device_list = [];
        
        
        if (len > 0)
            for (var i = 0; i < len; i++) {
              if(widgetdata.dataObj["deviceid"]!=result.dataArray[i].deviceid)
                {
                var deviceObj = {};
                var dataObj = result.dataArray[i];
                deviceObj["key"] = i + "";
                deviceObj["name"] = dataObj.devicename;
                deviceObj["model"] = dataObj.devicemodel;
                deviceObj["id"] = dataObj.deviceid;
                deviceObj["hardid"] = dataObj.devicehardid;
                deviceObj["checked"]=show;

                if ((dataObj.devicehardid) == devicehardid)
                    {
                    deviceObj["thisdevice"] = "(this device)";
                    deviceObj["currentdevice"]=0;
                    }
                else {
                    deviceObj["currentdevice"]=1;
                    deviceObj["thisdevice"] = "             ";
                
                  
                }
               
                device_list.push(deviceObj);
            }
        else this.setState({ remote: 'flex' });
        this.setState({ dlist: device_list });

            } 
    }
  
  componentDidMount() {
   // this.props.navigation.setParams({ goBack: this._prev_page.bind(this)});
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this)});
    var show=false;
    this.device_list();
  }
  allSelect()
  {

    var show=true;
    this.device_list(show);
  
  }
   async onClick(item) {
     if(item.checked==true)
      {
        item.checked=false;
      }
      else item.checked=true;
  
   }
   async share_widget() {
        let d_list=this.state.dlist;
        let newwidget=[];
        let widgetid=this.props.navigation.state.params.widgetid;

      


        widgetdata = await databasehelper.getwidget(widgetid);
        var temp=JSON.stringify(widgetdata.dataObj);
        for(let i=0;i<d_list.length;i++)
        {   
            if(d_list[i]["checked"]==true)
              {   
                let dataObj=JSON.parse(temp);;
                  let createtime=commons.gettimestamp();
                  let guid=await commons.getuuid();
                  let deviceid=d_list[i]["id"];
                  dataObj.widgetid=guid;
                  dataObj.deviceid=deviceid;
                  dataObj.createtime=createtime;
               
                  newwidget.push(dataObj);
                 
              }
        }
     
          var result=await databasehelper.shareinsertwidget(newwidget);
          var item=this.props.navigation.state.params.item;
          var nav_deviceid=item.id;
          console(">>>>>>>>deviceid"+nav_deviceid+">>>><<<<<<"+JSON.stringify(item));
          const { navigate } = this.props.navigation;
          commons.replacewithhomeandcurrent(this,'widgets',user={nav_deviceid,item});
        
       }


  render() {
    return (
      
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <Text
          style={{
            marginLeft: 20,
            marginTop: 20,
            color: "#FF4500",
            fontWeight: "bold"
          }}
        >
          Select Devices
        </Text>
        
       
        <View style={{ flexDirection: "row", marginTop: 10,marginLeft: 20 }}>
       
                      <FlatList style={{ flex: 1 }}
                           extraData={this.state}
                            data={this.state.dlist}                     
                            renderItem={({ item }) =>
                            <View style={{flexDirection:'row'}}>
                                      <View style={{width:'20%',flexDirection:'row' }}>
                                      <Image style={{  width: 45, height: 45 }} source={require("./assets/icon_devices_blue.png")}/>
                                      </View>
                                      <View style={{width:'50%',flexDirection:'row',marginTop:10 }}>
                                      <Text style={{textAlign:'left',marginLeft: 10,color: "black",fontWeight: "500",fontSize:16}} onPress={()=>{}}>{item.name}</Text>
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
        <View style={{marginBottom:20,position:'absolute',left:0,bottom:0,right:0,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
        <TouchableOpacity onPress={()=>this.share_widget()}>
        <View style={{bottom:0,backgroundColor:'#006BBD',height:40,width:80,justifyContent:'center',alignContent:'center'}}>
              <Text style={{color:'white',fontWeight:'bold',textAlign:'center'}}>SHARE</Text>
        </View>
        </TouchableOpacity>
        </View>
        </View>
        
    );
  }
}
