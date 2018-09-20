import React, { Component } from "react";
import {BackHandler,View,ToastAndroid, Button, TouchableOpacity, Image, Text, FlatList, TextInput, StyleSheet, AsyncStorage } from "react-native";
import commons from './commons';
import Loader from './utils/Loader';
import { Dialog } from 'react-native-simple-dialogs';
import device from "./device";
import { NavigationActions } from 'react-navigation';
import databasehelper from './utils/databasehelper.js';
import LoaderNew from './utils/LoaderNew';


export default class Friends extends Component {
/*  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;

    let title = "Recieved New Stax";
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
  }; */
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      widgetrecieved: false,
      loading: false,
      recievedwidgetdata: [],
      sharingid:'',
      sharing:'0'
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  async handleBackButtonClick() 
  {
    ToastAndroid.show("hello",500);
    BackHandler.exitApp();
    return false;
  }
  async componentWillMount()
  {
    
  }
  async componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    
  }
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    
    this.setState({loading:true});
    ///get widget with id
    var uuid = this.props.navigation.state.params.launchurl
    //alert(uuid);
    console.log("uuid"+uuid);
    console.log("uuid>>>>>>>>>",this.props.navigation.state.params.intial);
    var aws_data = require("./config/AWSConfig.json");
    var aws_lamda = require("./config/AWSLamdaConfig.json");
    this.refs.loaderRef.show();
    var token=await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + aws_lamda.sharingfunction, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization':token
      },
      body: JSON.stringify({
        "operation": "getSharedList",
        "sharingid": uuid
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {
      //  console.log("uuid>>>>>>>>>",responseJson);
      console.log(">>>>>>>>>>>>>>>>>>>Widget Beta<<<<<<<<<<<<<<<<<<"+this.state.sharing);
      var ti=2;
      await this.setState({sharing:ti});
      this.refs.loaderRef.hide();
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
        { this.refs.loaderRef.show();
          //  this.setState({widgetrecieved: true});
          var Nuuid=await commons.getuuid();
          var username=await AsyncStorage.getItem("username");
          var userData=await databasehelper.getuser();
          var date=await commons.gettimestamp();
        var aws_data = require("./config/AWSConfig.json");
        var aws_lamda = require("./config/AWSLamdaConfig.json");
        await fetch('' + aws_data.path + aws_data.stage + aws_lamda.sharingfunction, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization':token
          },
          body: JSON.stringify({
            "operation":"NotificationUpdates",
            "sharingid":uuid, //username
            "status":"pending",
            "statusdate":date,
            "username":username,
            "name":userData.res[0].firstname+" "+userData.res[0].lastname,
            "uuid":Nuuid
            
           
            }),
        }).then((response) => response.json())
          .then(async (responseJson) => {
                  this.refs.loaderRef.hide();
                  //console.log(">>>>>>>>>>>>>>>>Start");
                  //commons.replaceScreen(this,"bottom_menu",{"page":"Notification"});
                  const{navigate}=this.props.navigation;
                  navigate("bottom_menu",{"page":"Notification"});
            });
  
        }
        else if(responseJson.status=='pending'&&responseJson.medium=='Email')
        this.setState({widgetrecieved: true});
        else if(responseJson.status!='pending'&&responseJson.medium=='Email')
        {
        ToastAndroid.show("Link Expired",3000);
        commons.replaceScreen(this, 'bottom_menu',{"page":"STAX"});
        }
        else this.setState({widgetrecieved: false});
        this.setState({
          recievedwidgetdata: responseJson.widget,
          sharingid:responseJson.sharingid,
          loading:false,
          fromName:responseJson.fromName
          //widgetrecieved: true
        })
      }else{
       var splitted=responseJson.widget[0].storeid.split('#');
      // alert(splitted);
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

  async acceptwidget() {

    var widgetdata = this.state.recievedwidgetdata
    var modified_widgets = [];
    const deviceid = await AsyncStorage.getItem("currentdeviceid");
    if (deviceid == null) {
      commons.replaceScreen(this, 'bottom_menu', {"page":"STAX"});
      ToastAndroid.show("Please Add Your Device to Recieve this STAX",500);
      return;
    }
    for (var i = 0; i < widgetdata.length; i++) {

      var uuid = await commons.getuuid();
      widgetdata[i]["widgetid"] = uuid;
      widgetdata[i]["deviceid"] = deviceid;
    //  widgetdata[i]["mostusedwidget"] = "1";
      widgetdata[i]["createtime"] = commons.gettimestamp();
      widgetdata[i]["backgroundpicture"]="";
      widgetdata[i]["mostusedwidget"]=3;
      modified_widgets.push(widgetdata[i]);

    }
    //console.log("widget to insert>>>>"+JSON.stringify(modified_widgets))
    var result=await databasehelper.shareinsertwidget(modified_widgets);    

  var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();

  var passdata={
                "sharingid":this.state.sharingid,
                "status":"Accepted",
                "date":date,
              }
  this.backendwrite(passdata);
    
    this.setState({
      widgetrecieved: false,
      recievedwidgetdata:[]
    })
    ToastAndroid.show("STAX Added",500);
    //commons.replaceScreen(this, 'welcome', {});
    commons.replaceScreen(this, 'bottom_menu', {"page":"STAX"});
  }

  decline() {
    var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();

    var passdata={
     "sharingid":this.state.sharingid,
      "status":"Declined",
      "date":date,
   }
   this.backendwrite(passdata);
    ToastAndroid.show("You Declined STAX",500);
    this.setState({
      widgetrecieved: false,
      recievedwidgetdata:[]
    })

    commons.replaceScreen(this, 'bottom_menu', {"page":"STAX"});
  }
  async backendwrite(passdata)
  { 
    var aws_data=require("./config/AWSConfig.json");
    var aws_lamda = require("./config/AWSLamdaConfig.json");   
    var uuid=await commons.getuuid();
    var username=await AsyncStorage.getItem("username");
    var userData=await databasehelper.getuser();
    var date=await commons.gettimestamp();
  /*  alert(JSON.stringify({
      "operation":"updatestatus",
      "sharingid":passdata.sharingid, //username
      "status":passdata.status,
      "statusdate":passdata.date,
      "username":username,
      "name":userData.res[0].firstname+" "+userData.res[0].lastname


      "operation": "updatestatus_Temp",
  "sharingid": "7f2bf925-80c3-4643-a361-6f72d6a78d24",
  "status": "Accepted",
  "statusdate": "20/2/2018",
  "username": "s1@gmail.com",
  "name": "Soju Abraham",
  "Timestamp": "20180530112754229"
      })); */
    
      var token=await commons.get_token();
      fetch(''+aws_data.path+aws_data.stage+aws_lamda.sharingfunction, {
      method: 'POST',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization':token
      },
      body: JSON.stringify({
      "operation":"updatestatus",
      "sharingid":passdata.sharingid, //username
      "status":passdata.status,
      "statusdate":date,
      "username":username,
      "name":userData.res[0].firstname+" "+userData.res[0].lastname,
      "uuid":uuid
      
     
      }),
      }).then((response) => response.json())
      .then((responseJson) => {
  
       //alert(JSON.stringify(responseJson));
      });
  
  }
 


  render() {


    return (
      <View style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
      <LoaderNew ref={"loaderRef"} />
         <Loader loading={this.state.loading} />
        <Dialog visible={this.state.widgetrecieved}
          onTouchOutside={() => this.setState({widgetrecieved:true})}
          contentStyle={dialogbox.dialog_content}
          animationType="fade">

          <View style={[dialogbox.dialog_view, dialogbox.dialog_content]}>
            
            <Text style={[dialogbox.dialog_welcome]}>APRROW Stax Received</Text>
            
            <Text style={[dialogbox.dialog_text, { marginTop:10,fontWeight: '300', textAlign:'left' }]}>{this.state.fromName} has shared an APRROW Stax with you!</Text>
            <Text style={[dialogbox.dialog_text, { marginBottom:50 ,fontWeight: '300', textAlign:'left' }]}>Click below to Accept or Decline.</Text>
            <View style={{ flex: 1, flexDirection: "row", marginTop: 50,alignItems:'center',bottom:0,position:'absolute' }}>
             <TouchableOpacity style={{ width:'50%',alignItems:'center' }} onPress={this.decline.bind(this)}>

              <View >
              {/*  <Button
                  color="#1569C7"
                  title="Decline"
                  onPress={this.decline.bind(this)}
              /> */}
              <Text style={{fontSize:18,fontWeight:'500',color:"#1569C7"}} onPress={this.decline.bind(this)}>Decline</Text>
              </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ width:'50%', alignItems:'center' }} onPress={this.acceptwidget.bind(this)}>
              <View >
               {/* <Button
                  color="#1569C7"
                  title="Accept"
                  onPress={this.acceptwidget.bind(this)}
               /> */}
               <Text style={{fontSize:18,fontWeight:'500',color:"#1569C7"}} onPress={this.acceptwidget.bind(this)}>Accept</Text>
              </View>
              </TouchableOpacity>
            </View>

          </View>
        </Dialog>



      </View>
    );

  }
}
const dialogbox = StyleSheet.create({
  dialog_content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog_view:
    {
      margin: 0,
      
      
    },
  dialog_view_ti: {

    marginBottom: 25
  },
  dialog_welcome: {
    fontWeight: '500',
    fontSize: 20,
    color: "#1569C7",
    marginBottom: 10

  },
  dialog_text: {
    fontSize: 16,
    color: "black",
    padding:10
  },
  dialog_textinput: {
    padding: 5,
    height: 40,
    borderWidth: 1,
    borderColor: "black",
    marginTop: 20,

  }

});