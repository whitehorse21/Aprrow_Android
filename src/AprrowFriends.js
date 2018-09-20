import React, { Component } from "react";
import databasehelper from './utils/databasehelper.js';
import {
  View,
  Button,
  Image,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity, AsyncStorage, ToastAndroid
} from "react-native";
import Loader from './utils/Loader';
import CheckBox from 'react-native-check-box';
import commons from "./commons";
import uicommons from "./ui.commons";
import Permissions from 'react-native-permissions';
var Contacts = require("react-native-contacts");
export default class AprrowFriends extends Component {
  static navigationOptions = ({ navigation }) => {
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
    let headerLeft = uicommons.headerLeft(goBack);

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
      friends: [],
      friends_back: [],
      selectedwidgets_master: [],
      selcted_friends: {},
      loading: false,
      contactPermission: '',
      refresh: false
    };
  }
  onRefresh() {
    this.setState({ refresh: true }, function () { this._requestPermission() });
  }
  onClick(item) {
    var index = parseInt(item.key);
    var slectedfriends = this.state.selcted_friends

    if (slectedfriends.hasOwnProperty(item.key))
      delete slectedfriends[item.key];
    else
      slectedfriends[item.key] = item;

    this.state.friends[index].checked = !this.state.friends[index].checked;
    this.setState({
      friends: this.state.friends,
      selcted_friends: slectedfriends
    });
  }


  search(event) {

    var searchText = event;
    var data = this.state.friends;
    searchText = searchText.trim().toLowerCase();
    data = data.filter(l => {
      if (l.displayname.toLowerCase().match(searchText))
        l["render"] = true;
      else
        l["render"] = false

      return true;
    });
    this.setState({
      friends: data
    });

  }
  async share() {
    await this.setState({ loading: true });
    var isconnected = await commons.isconnected();
    if (isconnected) {

      var widgetArray = this.props.navigation.state.params.widgetArray;

      var selcted_friends = this.state.selcted_friends;
      var no = Object.keys(selcted_friends);

      //alert(no.length+"      "+widgetArray.length)
      if (no.length > 0 && widgetArray.length > 0) {


        var tomail = [];

        var keys = Object.keys(selcted_friends);
        var req_obj = {};
        var tranid = await commons.getuuid();
        for (var x in keys) {
          var mailids = {};
          var pkey = keys[x];
          mailids["email"] = selcted_friends[pkey]["mailids"][0];

          mailids["uuid"] = await commons.getuuid();
          tomail.push(mailids);
        }
        // req_obj["operation"] = "insertSharedList";
        var userData = await databasehelper.getuser();
        var firstname = "";
        var lastname = "";
        if (userData.res != null && userData.res.length > 0) {
          firstname = userData.res[0].firstname;
          lastname = userData.res[0].lastname;
        }


        var username = await AsyncStorage.getItem("username");
        var time = await commons.gettimestamp();
        var date = time;

        var payload = {};
        // payload["sharingid"] = uuids;
        payload["from"] = username;
        payload["to"] = tomail;
        payload["status"] = "pending";
        payload["medium"] = "Email";
        payload["widget"] = this.state.selectedwidgets_master;
        payload["transactionid"] = tranid;
        payload["senddate"] = date;
        payload["Timestamp"] = time;
        payload["ReadFlag"] = "false";
        payload["fromName"] = firstname + " " + lastname;
        req_obj["payload"] = payload;

        await fetch(commons.AWSConfig.path + commons.AWSConfig.stage + 'sentbulkemail', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req_obj),
        }).then((response) => response.json())
          .then(async () => {
            //      alert(JSON.stringify(responseJson));
            ToastAndroid.show("APRROW Stax Sended", 3000);
            var item = this.props.navigation.state.params.item;
            var flag = this.props.navigation.state.params.flag;
            if (flag == 0)
              commons.replaceScreen(this, 'widgets', { item });
            else if (flag == 1)
              commons.replaceScreen(this, 'welcome', {});
            else
              commons.replaceScreen(this, 'store_home', {});
          })
          .catch((error) => {

            console.error(error);
          });
      }
      else {
        if (no.length > 0)
          ToastAndroid.show("Please Choose a Friend", 3000);
        if (widgetArray.length > 0)
          ToastAndroid.show("APRROW Stax Not Selected", 3000);
      }
    } else {
      ToastAndroid.show("This Feature Works Only In Online Mode.So Please Check your Internet Connection", 3000);
    }
    await this.setState({ loading: false });
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

  async _requestPermission() {
    await Permissions.request('contacts').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      if (response == 'authorized') {
        this.contactRead();
        this.setState({ refresh: false });
      }
      this.setState({ contactPermission: response })
    })
  }
  async contactRead() {
    this.setState({ loading: true });
    var contacts_final = [];
    var index = 0;
    await Contacts.getAll((err, contacts) => {
      for (i = 0; i < contacts.length; i++) {
        var contactobj = contacts[i];
        var contactobj_filtered = {};
        contactobj_filtered["mailids"] = [];
        contactobj_filtered["displayname"] = contactobj.givenName;
        contactobj_filtered["hasThumbnail"] = contactobj.hasThumbnail;
        contactobj_filtered["thumbnailPath"] = contactobj.thumbnailPath;
        contactobj_filtered["checked"] = false;
        contactobj_filtered["render"] = true;


        var mail_ids = contactobj["emailAddresses"];
        for (var j = 0; j < mail_ids.length; j++) {
          contactobj_filtered["mailids"].push(mail_ids[j]["email"]);
        }


        if (contactobj_filtered["mailids"].length > 0) {
          contacts_final.push(contactobj_filtered);
          contactobj_filtered["key"] = index + "";
          index++;
        }
      }

      this.setState({ loading: false });
      this.setState({
        friends: contacts_final,
      });

    });

  }
  async componentDidMount() {
    await Permissions.check('contacts').then(response => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'

      this.setState({ contactPermission: response });
      if (response == 'denied' || response == 'undetermined' || response == 'restricted')
        this._requestPermission();
      if (response == 'authorized') {
        this.contactRead();
      }
    })


    //reading sharedwidgetdata
    var selectedwidgets = this.props.navigation.state.params.widgetArray;
    for (var i = 0; i < selectedwidgets.length; i++) {
      selectedwidgets[i]["key"] = i + "";
    }
    this.setState({ selectedwidgets_master: selectedwidgets, });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}>
        <Loader
          loading={this.state.loading} />

        <View style={{ height: 60 }}>
          <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 20, marginTop: 5 }}
            data={this.state.selectedwidgets_master}
            extraData={this.state}
            horizontal={true}
            refreshing={this.state.refresh}
            onRefresh={() => this.onRefresh()}
            renderItem={({ item }) =>
              <View style={{ backgroundColor: "#006BBD", margin: 5, borderRadius: 5, height: 26 }}>
                <View style={{ flexDirection: 'row', margin: 3 }}>
                  <Text style={{ color: 'white', marginRight: 5, fontWeight: '500', fontSize: 15 }} numberOfLines={2}>{item.widgetname}</Text>
                  <Text onPress={() => this.removewidget(item)} style={{ color: 'white', marginRight: 5, fontWeight: '500', fontSize: 18 }} numberOfLines={1}>X</Text>
                </View>
              </View>

            }
          />
        </View>
        <View style={{ marginTop: 5, flexDirection: "row", marginBottom: 20 }}>
          <View style={{ backgroundColor: "#d7d7d7", height: 1, width: '90%', justifyContent: 'center' }}>
          </View>
        </View>

        <View
          style={{
            borderColor: "#d7d7d7",
            borderWidth: 1,
            borderRadius: 30,
            borderColor: "grey",
            marginTop: 5,
            width: "90%",
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <Image
            style={{ width: 20, height: 20, marginLeft: 15, marginRight: 5 }}
            source={require("./assets/tmp_search.png")}
          />
          <TextInput
            style={{ width: "80%", borderWidth: 0 }}
            placeholder="Search"
            underlineColorAndroid="transparent"
            onChangeText={this.search.bind(this)}
          />
        </View>
        <Text
          style={{ color: "#FF4500", fontWeight: "bold", marginTop: 10 }}>
          Please select your Aprrow friend:
        </Text>

        <View style={{ marginTop: 15, alignItems: 'stretch', alignContent: "flex-start" }}>
          <FlatList style={{ flex: 1 }}
            data={this.state.friends}
            extraData={this.state}
            renderItem={({ item }) =>
              commons.renderIf(item.render,
                <View style={{ marginTop: 8, marginLeft: 3, flexDirection: "row", width: 350 }}>
                  <View style={{ flexDirection: "row" }}>
                    {commons.renderIf(item.hasThumbnail,
                      <Image style={{
                        height: 40,
                        width: 40,
                        borderRadius: 75
                      }}
                        source={{ uri: item.thumbnailPath }}
                      />
                    )}

                    {commons.renderIf(!item.hasThumbnail,
                      <Image style={{
                        height: 45,
                        width: 40,

                      }}
                        source={require("./assets/photo_mini_perfil.png")}
                      />
                    )}
                    <Text style={{ marginLeft: 13, marginTop: 10, width: 250 }} numberOfLines={1}>{item.displayname}</Text>
                  </View>
                  <CheckBox
                    style={{ alignContent: "flex-end", marginTop: 10 }}
                    onClick={() => this.onClick(item)}
                    isChecked={item.checked} />
                </View>)
            }
          />
        </View>
        <View style={{ width: '100%', position: 'absolute', bottom: 0, flex: 1 }}>
          <Button
            onPress={() => this.share()}
            title="SHARE WITH FRIENDS"
            color="#ff9800"
            style={{ flex: 1, fontSize: 20 }}
          >
          </Button>
        </View>

      </View>
    );
  }
}