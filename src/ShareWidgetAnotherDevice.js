import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text,FlatList,ToastAndroid } from "react-native";
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
      display:'none',
      display1:'none',
      show:false,
      dlist:[],
      wlist:[]
    };
  }
  async deSelect()
  {
    this.setState(await{show:false});
    this.device_list();
  }
  async device_list() {
        //alert(">>>>>>>>>>>"+JSON.stringify(AsyncStorage.getItem("currentdeviceid")));
        var widgetdata=this.props.navigation.state.params.widgetArray;
        //alert(">>>>>>>>>>>"+widgetdata[0]["deviceid"]);
        this.setState({dlist: []});
        var result = await databasehelper.getAlldevice();

        this.state.len = result.dataArray.length;
        var len = this.state.len;
        var device_list = [];        
        if (len > 0)
            for (var i = 0; i < len; i++) {
              if(widgetdata[0]["deviceid"]!=result.dataArray[i].deviceid)
                {  
                var deviceObj = {};
                var dataObj = result.dataArray[i];
                deviceObj["key"] = i + "";
                deviceObj["name"] = dataObj.devicename;
                deviceObj["model"] = dataObj.devicemodel;
                deviceObj["id"] = dataObj.deviceid;
                deviceObj["hardid"] = dataObj.devicehardid;
                deviceObj["checked"]=this.state.show;

         /*       if ((dataObj.devicehardid) == devicehardid)
                    {
                    deviceObj["thisdevice"] = "(this device)";
                    deviceObj["currentdevice"]=0;
                    }
                else {
                    deviceObj["currentdevice"]=1;
                    deviceObj["thisdevice"] = "             ";
                
                  
                } */
               
                device_list.push(deviceObj);
            }
        //else this.setState({ remote: 'flex' });
        this.setState({ dlist: device_list });

            } 
    }
  
  componentDidMount() {
    //this.props.navigation.setParams({ goBack: this._prev_page.bind(this)});
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this)});
    this.props.navigation.setParams({ deSelect: this.deSelect.bind(this)});
    var show=false;
    var temp=this.props.navigation.state.params.widgetArray;
    var flag=this.props.navigation.state.params.flag;

    if(flag==0)
    {
          this.widgetlist(temp);
    }else if(flag==1){
           this.applist(temp);
    }
    this.device_list();
  }
  async applist(temp)
  {
      this.setState(await{wlist:temp,display1:'flex',display:'none'});
  
  }
  async widgetlist(temp)
  {
      
      this.setState(await{wlist:temp,display:'flex',display1:'none'});

  }
  async allSelect()
  {
    this.setState(await{show:true});
    this.device_list();
  }
   async onClick(item) {
     if(item.checked==true)
      {
        item.checked=false;
      }
      else item.checked=true;
  
   }
   async share_widget() {
           var flag=this.props.navigation.state.params.flag;
           let newwidget=[];
           if(flag==0)
           {
           var temp=this.props.navigation.state.params.widgetArray;
           var temp_len=temp.length;
           var widgetid="";
           for(var i=0;i<temp_len;i++)
            {   if(i<(temp_len-1))
                widgetid=widgetid+"'"+temp[i].widgetid+"',";
                else 
                  widgetid=widgetid+"'"+temp[i].widgetid+"'";
            }
            var result=await databasehelper.getAllwidgetShare(widgetid);
          //alert(">>>>>>>>>>>>>>"+JSON.stringify(result.dataArray));
            


        let d_list=this.state.dlist;
        
        
        var wlen=result.dataArray.length;
        for(let j=0;j<wlen;j++)
        {     var temp=JSON.stringify(result.dataArray[j]);
              
        for(let i=0;i<d_list.length;i++)
        {   
            if(d_list[i]["checked"]==true)
              {   
                  let dataObj=JSON.parse(temp);
                  let createtime=commons.gettimestamp();
                  let guid=await commons.getuuid();
                  let deviceid=d_list[i]["id"];
                  dataObj.widgetid=guid;
                  dataObj.deviceid=deviceid;
                  dataObj.createtime=createtime;
               
                  newwidget.push(dataObj);
                 
              }
        }
        }
        }else if(flag==1)
         { var applist=[];
           var temp=this.props.navigation.state.params.widgetArray;
           for(var i=0;i<temp.length;i++)
            {
              var dataObj={};
              dataObj["appname"]=temp[i]["appname"];
              dataObj["package"]=temp[i]["package"];
              applist.push(dataObj);
            }
              let d_list=this.state.dlist;

            for(let i=0;i<d_list.length;i++)
            {   
              if(d_list[i]["checked"]==true)
                {   
                  let dataObj={};
                  let createtime=commons.gettimestamp();
                  let guid=await commons.getuuid();
                  let deviceid=d_list[i]["id"];
                  dataObj.widgetid=guid;
                  dataObj.deviceid=deviceid;
                  dataObj.createtime=createtime;
                  dataObj.widgetname="Share Apps";
                  dataObj.deleteflag=0;
                  dataObj.applist=applist;
                  dataObj.mostusedwidget=1;
                  dataObj.headercolor="";
                  dataObj.backgroundcolor="";
                  dataObj.transperancy="";
                  dataObj.backgroundpicture="";
               
                  newwidget.push(dataObj);
                 
                }
            }
                  

         }
     //     alert(JSON.stringify(newwidget));
         if(newwidget.length>0)
         {
          var result=await databasehelper.shareinsertwidget(newwidget);
          
          var item=this.props.navigation.state.params.item;
          var nav_deviceid=item.id
          const { navigate } = this.props.navigation;
         
          commons.replaceScreen(this, 'widgets', user = { nav_deviceid, item });
         }else{
           ToastAndroid.show("Please Choose Options",3000);
         }
        
       }
    removeWidget(key)
    {
     var flag=this.props.navigation.state.params.flag;
      var wlist=this.state.wlist;
      var temp=JSON.stringify(wlist);
      var nwlist=[];
      var count=0;
       if(flag==0){
      for(var i=0;i<wlist.length;i++)
        {
          if(wlist[i].key!=key)
          {     
                var deviceObj = {};
                
                deviceObj["key"] = count + "";
                deviceObj["widgetname"] = wlist[i].widgetname;
                deviceObj["widgetid"] = wlist[i].widgetid;
                deviceObj["deviceid"] = wlist[i].deviceid;
                count=count+1;
               
                nwlist.push(deviceObj);

          }
        }
        this.widgetlist(nwlist);
       }else if(flag==1)
      {
         for(var i=0;i<wlist.length;i++)
        {
          if(wlist[i].key!=key)
          {     
                var deviceObj = {};
                
                deviceObj["key"] = count + "";
                deviceObj["appname"] = wlist[i].appname;
                deviceObj["package"] = wlist[i].package;
                deviceObj["deviceid"] = wlist[i].deviceid;
                count=count+1;
               
                nwlist.push(deviceObj);

          }
        }
        this.applist(nwlist);
      }
       
        
    
  }



  render() {
    return (
      
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{flex:.3,alignItems:'center',display:this.state.display}}>
          <FlatList style={{ flex: 1 }}
                           extraData={this.state}
                            data={this.state.wlist} 
                            numColumns={4}                    
                            renderItem={({ item }) =>
                                    <View style={{backgroundColor: "#006BBD",margin:5, borderRadius:5}}>
                                        <View style={{flexDirection:'row',margin:3}}>
                                          <Text style={{color:'white',marginRight:5,fontWeight:'500',fontSize:18}}>{item.widgetname}</Text>
                                          <Text onPress={()=>this.removeWidget(item.key)} style={{color:'white',marginRight:5,fontWeight:'500',fontSize:18}}>X</Text>
                                        </View>
                                    </View>
                            } />
        <View style={{height:1,width:'100%',backgroundColor:'#C0C0C0'}}>
        </View>
      </View>
      <View style={{flex:.3,alignItems:'center',display:this.state.display1}}>
          <FlatList style={{ flex: 1 }}
                           extraData={this.state}
                            data={this.state.wlist} 
                            numColumns={4}                    
                            renderItem={({ item }) =>
                                    <View style={{backgroundColor: "#006BBD",margin:5, borderRadius:5}}>
                                        <View style={{flexDirection:'row',margin:3}}>
                                          <Text style={{color:'white',marginRight:5,fontWeight:'500',fontSize:18}}>{item.appname}</Text>
                                          <Text onPress={()=>this.removeWidget(item.key)} style={{color:'white',marginRight:5,fontWeight:'500',fontSize:18}}>X</Text>
                                        </View>
                                    </View>
                            } />
        <View style={{height:1,width:'100%',backgroundColor:'#C0C0C0'}}>
        </View>
      </View>
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
        
       
        <View style={{height:'60%',flexDirection: "row", marginTop: 10,marginLeft: 20 }}>
       
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
