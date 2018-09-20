import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text, FlatList, AsyncStorage, StyleSheet } from "react-native";
import Share from "react-native-share";
import commons from '../commons';
import uicommons from '../ui.commons';
import Loader from '../utils/Loader';
import databasehelper from '../utils/databasehelper.js';
export default class Friends extends Component {
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
    return { title, headerStyle, headerTitleStyle, headerTintColor, headerLeft };
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
    for (var i = 0; i < selectedwidgets.length; i++) {
      selectedwidgets[i]["key"] = i + "";
    }

    this.setState({
      selectedwidgets_master: selectedwidgets,
    });
  }

  removewidget(item) {
    var currentlist = this.state.selectedwidgets_master;
    var updatedwidgetlist = [];
    for (var i = 0; i < currentlist.length; i++) {
      if (currentlist[i].key != item.key)
        updatedwidgetlist.push(currentlist[i]);
    }

    this.setState({
      selectedwidgets_master: updatedwidgetlist
    })
  }

  showfriends() {
    var widgetArray = this.state.selectedwidgets_master;
    var item = this.props.navigation.state.params.item;
    var flag = this.props.navigation.state.params.flag;
    const { navigate } = this.props.navigation;
    if (this.state.paramsDisabledValue == true) {
      navigate("Approwfriends", { widgetArray, item, flag });
      setTimeout(() => { this.setState({ paramsDisabledValue: false }) }, 1000);
    }
  }


  async share_widget() {

    this.setState({ loading: true });
    var userData = await databasehelper.getuser();
    var firstname = "";
    var lastname = "";
    if (userData.res != null && userData.res.length > 0) {
      firstname = userData.res[0].firstname;
      lastname = userData.res[0].lastname;
    }
    var req_obj = {};
    req_obj["operation"] = "insertSharedList";
    var date = commons.gettimestamp();
    var uuid = await commons.getuuid()
    var username = await AsyncStorage.getItem("username");
    var tranid = await commons.getuuid();
    var payload = {};
    payload["sharingid"] = uuid;
    payload["from"] = username;
    payload["to"] = "";
    payload["status"] = "pending";
    payload["medium"] = "socialmedia";
    payload["transactionid"] = tranid;
    payload["senddate"] = date;
    payload["widget"] = this.state.selectedwidgets_master;
    payload["fromName"] = firstname + " " + lastname;
    req_obj["payload"] = payload;


    await fetch('' + commons.AWSConfig.path + commons.AWSConfig.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req_obj),
    }).then((response) => response.json())
      .then(async () => {
        this.setState({ loading: false });
        var options = shareOptions = {
          title: "share widget",
          message: "please click link to get your widget",
          url: "http://aprrow.net/#" + uuid,
          subject: "Shared widget" //  for email
        };
        Share.open(options);
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

        <Text style={styles.HeaderText}>APRROW Friends</Text>
        <View style={{ height: 100 }}>
          <FlatList style={{ flex: 1, alignContent: 'center', marginLeft: 20, marginTop: 15 }}
            data={[1, 2, 3, 4]}
            extraData={this.state}
            horizontal={true}
            renderItem={({ item }) =>
              <View style={{
                left: 10,
                marginLeft: -25
              }}>
                <TouchableOpacity disabled={this.state.paramsDisabledValue} onPress={async () => { await this.setState({ paramsDisabledValue: true }); this.showfriends() }}>
                  <Image atyle={{ flex: 1 }}
                    source={require("../assets/photo_mini_perfil.png")} />
                  <Text>{item.thumbnailPath}</Text>
                </TouchableOpacity>
              </View>
            } />
        </View>
        <Text style={styles.HeaderText}>Please select your APRROW friend</Text>
        <View style={{ marginTop: 50, flexDirection: "row", marginBottom: 20 }}>
          <Text style={{ fontSize: 10, color: "#d7d7d7" }}>___________________      </Text>
          <Text style={{ fontSize: 15, color: "#d7d7d7" }}>or</Text>
          <Text style={{ fontSize: 10, color: "#d7d7d7" }}>      ___________________</Text>
        </View>
        <View style={{ marginLeft: 20, marginRight: 20, marginTop: 50 }}>
          <Button onPress={() => this.share_widget()} title="Choose how you'd like to share" />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  HeaderText: {
    marginTop: 50,
    color: "#006BBD",
    fontWeight: "bold"
  },
})