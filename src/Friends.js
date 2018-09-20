import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text, FlatList, AsyncStorage,ToastAndroid } from "react-native";
import Share, { ShareSheet } from "react-native-share";
import commons from './commons';
import Loader from './utils/Loader';
import databasehelper from './utils/databasehelper.js';
var Contacts = require("react-native-contacts");

export default class Friends extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation;
    const { goBack } = navigation;

    let title = "Share with Friends";
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
      selectedwidgets_master: [],
      loading: false,
      friends: []
    };
  }
  async componentDidMount() {


    var selectedwidgets = this.props.navigation.state.params.widgetArray;
   
    var widgetdata = [];
    for (var i = 0; i < selectedwidgets.length; i++) {
      selectedwidgets[i]["key"] = i + "";
    }


    //reading friends
  /*  Contacts.checkPermission((err, permission) => {
      // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
      if (permission === "undefined") {
        Contacts.requestPermission((err, permission) => {
          // ...
          console.log("checking");
        });
      }
      if (permission === "authorized") {
        // yay!

        console.log("authorized");
      }
      if (permission === "denied") {
        console.log("denied");
        // x.x
      }
    });

    var contacts_final = [];
    Contacts.getAll((err, contacts) => {
      // console.log(contacts);
      for (i = 0; i < contacts.length; i++) {
        var contactobj = contacts[i];
        var contactobj_filtered = {};
        contactobj_filtered["mailids"] = [];
        contactobj_filtered["displayname"] = contactobj.givenName;
        contactobj_filtered["hasThumbnail"] = contactobj.hasThumbnail;
        contactobj_filtered["thumbnailPath"] = contactobj.thumbnailPath;

        var mail_ids = contactobj["emailAddresses"];
        for (var i = 0; i < mail_ids.length; i++) {
          contactobj_filtered["mailids"].push(mail_ids[i]["email"]);
        }


        if (contactobj_filtered["mailids"].length > 0)
          contacts_final.push(contactobj_filtered);


      }

      //do the netwrok call with current data and filter friends and send data back
      //now return data only contains friends
      //mail id have replace with registered id
      this.setState({
        friends: contacts_final
      });

    });*/

    this.setState({
      selectedwidgets_master: selectedwidgets,
    });


  }

  removewidget(item) {

    var currentlist = this.state.selectedwidgets_master;
    // alert(JSON.stringify(currentlist));
    var updatedwidgetlist = [];
    for (var i = 0; i < currentlist.length; i++) {
      if (currentlist[i].key != item.key)
        updatedwidgetlist.push(currentlist[i]);
    }


    this.setState({
      selectedwidgets_master: updatedwidgetlist
    })
  }


  showfriends()
  {
    
    var widgetArray=this.state.selectedwidgets_master;
    var item=this.props.navigation.state.params.item;
    var flag=this.props.navigation.state.params.flag;
    const { navigate } = this.props.navigation;
    if(this.state.paramsDisabledValue==true)
    {
    navigate("Approwfriends",{widgetArray,item,flag});
    //const { navigate } = this.props.navigation;
   // navigate("Approwfriends", { screen: "Approwfriends" })
   setTimeout(() => {this.setState({paramsDisabledValue:false})}, 1000);
     }

  }


  async share_widget() {
    
    this.setState({ loading: true });
    var userData=await databasehelper.getuser();
   var firstname="";
   var lastname="";
   if(userData.res!=null&&userData.res.length>0)
   {
   firstname=userData.res[0].firstname;
   lastname=userData.res[0].lastname;
   }
    var req_obj = {};
    req_obj["operation"] = "insertSharedList";
   // var date=new Date().getDate() + "/"+ parseInt(new Date().getMonth()+1) +"/"+ new Date().getFullYear();
   var date=commons.gettimestamp();
   var uuid = await commons.getuuid()
    var username = await AsyncStorage.getItem("username");
    var tranid = await commons.getuuid();
    var payload = {};
    payload["sharingid"] = uuid;
    payload["from"] = username;
    payload["to"] = "";
    payload["status"] = "pending";
    payload["medium"] = "socialmedia";
    payload["transactionid"]=tranid;
    payload["senddate"]=date;
    payload["widget"] = this.state.selectedwidgets_master;
    payload["fromName"]=firstname+" "+lastname;
    req_obj["payload"] = payload;

    var aws_data = require("./config/AWSConfig.json");
    var aws_lamda = require("./config/AWSLamdaConfig.json");   
    await fetch('' + aws_data.path + aws_data.stage + aws_lamda.sharingfunction, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req_obj),
    }).then((response) => response.json())
      .then(async (responseJson) => {

        //alert(responseJson);
        this.setState({ loading: false });

        var options = shareOptions = {
          title: "share widget",
          message: "please click link to get your widget",
          url: "http://aprrow.net/#" + uuid,
          subject: "Shared widget" //  for email
        };

        Share.open(options);
        var item=this.props.navigation.state.params.item;
        var flag=this.props.navigation.state.params.flag;
        if(flag==0)
        commons.replaceScreen(this, 'widgets', { item });
        else if(flag==1)
        commons.replaceScreen(this, 'welcome', {});
        else
        commons.replaceScreen(this, 'store_home', {});


      })
      .catch((error) => {

        console.error(error);
      });
    

  }

  render() {


    return (
      <View style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
        <Loader
          loading={this.state.loading} />
        <View style={{ height: 60 }}>
          <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 20, marginTop: 15 }}
            data={this.state.selectedwidgets_master}
            extraData={this.state}
            horizontal={true}
            renderItem={({ item }) =>
              <View style={{ backgroundColor: "#006BBD", margin: 5, borderRadius: 5 }}>
                <View style={{ flexDirection: 'row', margin: 3 }}>
                  <Text style={{ color: 'white', marginRight: 5, fontWeight: '500', fontSize: 18 }} numberOfLines={2}>{item.widgetname}</Text>
                  <Text onPress={() => this.removewidget(item)} style={{ color: 'white', marginRight: 5, fontWeight: '500', fontSize: 18 }} numberOfLines={1}>X</Text>
                </View>
              </View>

            }
          />
        </View>

        <View style={{ marginTop: 5, flexDirection: "row", marginBottom: 20 }}>
          <Text style={{ fontSize: 10, color: "#d7d7d7" }}>______________________________________________________________________________________</Text>
          
        </View>


        <Text style={{
          marginTop: 10,
          color: "#FF4500",
          fontWeight: "bold",
          fontSize: 20
        }}>APRROW Friends</Text>



        
          <View style={{ height: 100 }}>
          
            <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 20, marginTop: 15 }}
              data={[1,2,3,4]}
              extraData={this.state}
              horizontal={true}
              renderItem={({ item }) =>
      
                <View style={{

                  left: 10,

                  marginLeft: -25

                }}>
                <TouchableOpacity disabled={this.state.paramsDisabledValue} onPress={async ()=>{await this.setState({paramsDisabledValue:true}); this.showfriends()}}>
                  <Image atyle={{
                    flex: 1
                  }}
                    source={require("./assets/photo_mini_perfil.png")}
                  />
                  <Text>{item.thumbnailPath}</Text>
                  </TouchableOpacity>

                </View>
              }
            />
              
          </View>

            <Text style={{
              marginTop: 50,
              color: "#006BBD",
              fontWeight: "bold"
            }}
            >Please select your APRROW friend</Text>
            <View style={{ marginTop: 50, flexDirection: "row", marginBottom: 20 }}>
              <Text style={{ fontSize: 10, color: "#d7d7d7" }}>___________________      </Text>
              <Text style={{ fontSize: 15, color: "#d7d7d7" }}>or</Text>
              <Text style={{ fontSize: 10, color: "#d7d7d7" }}>      ___________________</Text>
            </View>
            <View style={{ marginLeft: 20, marginRight: 20, marginTop: 50 }}>
              <Button

                onPress={() => this.share_widget()}
                title="Choose how you'd like to share"
              />
            </View>
      </View>
          );
        }
      }
