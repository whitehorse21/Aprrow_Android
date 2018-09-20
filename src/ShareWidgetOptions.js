import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text,FlatList,ToastAndroid } from "react-native";
import databasehelper from './utils/databasehelper.js';
import commons from './commons';

export default class ShareOptions extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;

    let title = "Share with";
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

    return {
      title,
      headerStyle,
      headerTitleStyle,
      headerTintColor,
      headerLeft
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      wlist:[],
      display:'none',
      display1:'none',
      paramsDisabledValue:false
    };
  }

  componentDidMount() {
    
     //this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
     var flag=this.props.navigation.state.params.flag;
     var temp=this.props.navigation.state.params.widgetArray;
     if(flag==0)
      {
          this.widgetlist(temp);
      }else if(flag==1){
           this.applist(temp);
      }
  }
  
  async applist(temp)
  {
      this.setState(await{wlist:temp,display1:'flex',display:'none'});
      console.log(">>>>>>>>>>>>>>>>>"+JSON.stringify(this.state.wlist));
  }
  async widgetlist(temp)
  {
     
      this.setState(await{wlist:temp,display:'flex',display1:'none'});
      console.log(">>>>>>>>>>>>>>>>>"+JSON.stringify(this.state.wlist));
  
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

        <View style={{flex:.1,alignItems:'center',display:this.state.display}}>
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
      <View style={{flex:.1,alignItems:'center',display:this.state.display1}}>
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
          Share with:
        </Text>
       
        <View style={{ flexDirection: "row", marginTop: 10,marginLeft: 20 }}>
       
          <Image
            style={{  width: 30, height: 30 }}
            source={require("./assets/icon_devices_blue.png")}
          />
           <TouchableOpacity disabled={this.state.paramsDisabledValue} onPress={async ()=>{
             
            await this.setState({paramsDisabledValue:true})
            //alert("hello"+this.state.paramsDisabledValue);
            const { navigate } = this.props.navigation;
            var widgetArray=this.state.wlist;
            var item=this.props.navigation.state.params.item;
            var flag=this.props.navigation.state.params.flag;
           // alert(JSON.stringify(widgetArray));
           if(widgetArray.length>0)
           {
            if(this.state.paramsDisabledValue==true)
            {
            navigate('ShareWidgetAnotherDevice',user={widgetArray,flag,item});
            setTimeout(() => {this.setState({paramsDisabledValue:false})}, 1000);
            }
           }else{
            ToastAndroid.show("You Dont have Stax or App.Please Choose Stax / App",3000);
           }
          }}>
          <Text
            style={{
              marginLeft: 10,
             
              color: "black",
              fontWeight: "bold"
            }} >
            Another device
          </Text>
        </TouchableOpacity>
          
        </View>
     
        <View style={{ flexDirection: "row", marginTop: 10,marginLeft: 20 }} >
       
          <Image
            style={{  width: 30, height: 30 }}
            source={require("./assets/icon_devices_blue.png")}
          />
          
          <TouchableOpacity disabled={this.state.paramsDisabledValue} 
            onPress={async ()=>{
           await this.setState({paramsDisabledValue:true})
           var widgetArray=[];
           var flag=this.props.navigation.state.params.flag;
           var temp=this.state.wlist;
           var len=temp.length;
           if(len>0)
           {
           if(flag==0)
           {
           //var temp=this.props.navigation.state.params.widgetArray;
          
           var temp_len=temp.length;
           var widgetid="";
           //alert(JSON.stringify(temp));
           for(var i=0;i<temp_len;i++)
            {   if(i<(temp_len-1))
                widgetid=widgetid+"'"+temp[i].widgetid+"',";
                else 
                  widgetid=widgetid+"'"+temp[i].widgetid+"'";
            }
            var result=await databasehelper.getAllwidgetShare(widgetid);
          
            widgetArray=result.dataArray;
            
          
          } else if(flag==1)
          {
              var applist=[];
              //var temp=this.props.navigation.state.params.widgetArray;
              for(var i=0;i<temp.length;i++)
              {
                  var dataObj={};
                  dataObj["appname"]=temp[i]["appname"];
                  dataObj["package"]=temp[i]["package"];
                  applist.push(dataObj);
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
                    dataObj.applist=applist;
                    dataObj.mostusedwidget=1;
                    dataObj.headercolor="";
                    dataObj.backgroundcolor="";
                    dataObj.transperancy="";
                    dataObj.backgroundpicture="";
               
                    newwidget.push(dataObj);
                 
               
            widgetArray=newwidget;
                 
          }
        }
        else{
          widgetArray=temp;
        }
        
          if(widgetArray.length>0)
            {
            var item=this.props.navigation.state.params.item;
            var flag=this.props.navigation.state.params.flag;
            const { navigate } = this.props.navigation;
            if(this.state.paramsDisabledValue==true)
            {
            navigate("Friends",user={widgetArray,item,flag});
            setTimeout(() => {this.setState({paramsDisabledValue:false})}, 1000);
            }
            }
            else{
              ToastAndroid.show("You Dont have Stax or App.Please Choose Stax / App",3000);
            } 
          }
          }
          >
          <Text
            style={{
              marginLeft: 10,
             
              color: "black",
              fontWeight: "bold"
            }}>
            Friends
          </Text>
        </TouchableOpacity>
         
        </View> 
        </View>
    );
  }
}
