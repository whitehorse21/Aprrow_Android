import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,   // CSS-like styles
  Text,         // Renders text
  View,
  Linking,
  TouchableOpacity,
  Image,
  FlatList,
  BackHandler,
  Alert         // Container component
} from 'react-native';
import commons from '../commons';
import Tabs from '../utils/tabs';
import databasehelper from '../utils/databasehelper';
var aws_data = require("../config/AWSConfig.json");
export default class sharedApprow extends Component {


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let title = 'Shared APRROW Stax';
    let headerStyle = { backgroundColor: "#006BBD" };
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '200' };
    let headerTitleAllowFontScaling = false;
    let headerTintColor = 'white';

    return { title, headerStyle, headerTitleStyle, headerTintColor, headerTitleAllowFontScaling };
  };
  constructor(props) {
    super(props);
    this.state = {
      dlist: [],
      dlist2: [],
      ref: false,
      last_key_val_mapping_from: {},
      last_key_val_mapping_to: {}
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);
  }
  async openLink1() {

  }

  async componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() {
    commons.replaceScreen(this, "bottom_menu", { "page": "Logout" });
    return true;
  }
  async openLink(url) {
    var username = await AsyncStorage.getItem("username");
    var isfirstrun = await AsyncStorage.getItem("firstrun");
    setTimeout(() => {
      if (username != null) {
        var urldata = "";
        if (url != null)
          if (url.url != null && username != commons.guestuserkey()) {
            urldata = (url.url).split("#");
            commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
          }
          else {
            //commons.replaceScreen(this, 'bottom_menu', {});
          }
      }
      else {
        if (isfirstrun == null)
          commons.replaceScreen(this, 'userypeselector', {});
        else
          commons.replaceScreen(this, 'login', {});
      }
    }, 2000);
  }

  async  componentDidMount() {

    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.list_from();
    this.list_to();
    try {
      var param = this.props.navigation.state.params.val;
      if (param != undefined) {
        this.refs.Tabss.setVal();
      }
    }
    catch (err) {
    }
  }

  async list_from() {
    var username = await AsyncStorage.getItem("username");

    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getFromListofUser",
        "username": username //username
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          this.setState({ last_key_val_mapping_from: responseJson.LastEvaluatedKey });
        } else this.setState({ last_key_val_mapping_from: {} });
        var fromlist = responseJson.from;
        device_list = [];
        device_list2 = [];
        this.setState({ dlist: [] });
        var deviceObj = {};

        if (fromlist.length > 0) {
          for (var i = 0; i < fromlist.length; i++) {
            var dformat = commons.format_string_date(fromlist[i].senddate, 'YYYYMMDDHHmmss', 'DD/MM/YYYY')
            fromlist[i].senddate = dformat;
            if (fromlist[i]["transactionid"] == undefined || fromlist[i]["transactionid"] == 'undefined') {

            }
            else if (deviceObj[fromlist[i]["transactionid"]] != undefined) {

              var toObj = { "toname": fromlist[i]["toName"], "status": fromlist[i]["status"], "statusdate": fromlist[i]["statusdate"] };
              deviceObj[fromlist[i]["transactionid"]]["to"].push(toObj);
            }
            else {
              var fObj = fromlist[i];
              fObj["to"] = [{ "toname": fromlist[i]["toName"], "status": fromlist[i]["status"], "statusdate": fromlist[i]["statusdate"] }];

              fObj["widget"] = fromlist[i]["widget"];
              fObj["slist"] = "Shared List";
              deviceObj[fromlist[i]["transactionid"]] = fObj;

            }
          }
          var keys = Object.keys(deviceObj);

          for (var x in keys) {
            var pkey = keys[x];
            var pvalue = deviceObj[pkey];
            device_list.push(pvalue);
          }

        }
        else this.setState({ remote: 'flex' });
        await this.setState({ dlist: device_list });

      })
      .catch((error) => {
        console.error(error);
      });
  }

  async loadmore_from(key) {
    if (!key.hasOwnProperty("Timestamp"))
      return
    var username = await AsyncStorage.getItem("username");
    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getFromListofUser",
        "username": username, //username
        "LastEvaluatedKey": key
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          this.setState({ last_key_val_mapping_from: responseJson.LastEvaluatedKey });
        } else this.setState({ last_key_val_mapping_from: {} });
        var fromlist = responseJson.from;
        fromlist.sort(function (a, b) {
          return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
        });

        device_list = [];
        device_list2 = [];

        var deviceObj = {};
        if (fromlist.length > 0) {
          for (var i = 0; i < fromlist.length; i++) {
            var dformat = commons.format_string_date(fromlist[i].senddate, 'YYYYMMDDHHmmss', 'DD/MM/YYYY')
            fromlist[i].senddate = dformat;
            if (fromlist[i]["transactionid"] == undefined || fromlist[i]["transactionid"] == 'undefined') {

            }
            else if (deviceObj[fromlist[i]["transactionid"]] != undefined) {
              var toObj = { "toname": fromlist[i]["toName"], "status": fromlist[i]["status"] };
              deviceObj[fromlist[i]["transactionid"]]["to"].push(toObj);
            }
            else {
              var fObj = fromlist[i];
              fObj["to"] = [{ "toname": fromlist[i]["toName"], "status": fromlist[i]["status"] }];
              fObj["widget"] = fromlist[i]["widget"];
              fObj["slist"] = "Shared List";
              deviceObj[fromlist[i]["transactionid"]] = fObj;

            }
          }
          var dtestfrom = this.state.dlist;
          var keys = Object.keys(deviceObj);

          for (var x in keys) {
            var pkey = keys[x];
            var pvalue = deviceObj[pkey];
            dtestfrom.push(pvalue);
          }

          this.setState({ dlist: dtestfrom });
        } else this.setState({ remote: 'flex' });
      })
      .catch((error) => {
        console.error(error);
      });


  }

  async list_to() {
    var username = await AsyncStorage.getItem("username");
    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "gettoListofUser",
        "username": username //username
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          this.setState({ last_key_val_mapping_to: responseJson.LastEvaluatedKey });
        } else this.setState({ last_key_val_mapping_to: {} });


        var tolist = responseJson.to;
        tolist.sort(function (a, b) {
          return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
        });

        device_list = [];
        device_list2 = [];
        if (tolist.length > 0) {
          for (var i = 0; i < tolist.length; i++) {
            var deviceObj = {};
            deviceObj["key"] = i + "";
            var widgetname = tolist[i]["widget"];
            deviceObj["name"] = widgetname;
            deviceObj["slist"] = 'Shared By Name';
            deviceObj["sharingid"] = tolist[i]["sharingid"];
            deviceObj["widget"] = tolist[i]["widget"];
            deviceObj["Timestamp"] = tolist[i]["Timestamp"];
            if (tolist[i].hasOwnProperty('to')) {
              deviceObj["slist"] = tolist[i]["fromName"];
            }

            if (tolist[i].status == 'Declined') {
              deviceObj["recStatus"] = 'Declined';
              deviceObj["rcolor"] = 'red';
            }
            else if (tolist[i].status == 'pending') {
              deviceObj["recStatus"] = 'pending';
              deviceObj["rcolor"] = 'orange';
            }
            else {
              deviceObj["recStatus"] = "Accepted";
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

  async loadmore_to(key) {
    if (!key.hasOwnProperty("Timestamp"))
      return;
    var username = await AsyncStorage.getItem("username");
    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "gettoListofUser",
        "username": username, //username
        "LastEvaluatedKey": key
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {
        if (responseJson.hasOwnProperty("LastEvaluatedKey")) {
          this.setState({ last_key_val_mapping_to: responseJson.LastEvaluatedKey });
        } else this.setState({ last_key_val_mapping_to: {} });

        var tolist = responseJson.to;
        tolist.sort(function (a, b) {
          return parseFloat(b.Timestamp) - parseFloat(a.Timestamp);
        });

        device_list = [];
        device_list2 = [];
        if (tolist.length > 0) {
          var dlist_copy = this.state.dlist2;
          var dlist_length = dlist_copy.length;
          for (var i = 0; i < tolist.length; i++) {
            var deviceObj = {};
            deviceObj["key"] = i + dlist_length + "";
            //  var wid=tolist[i]["widget"];
            var widgetname = tolist[i]["widget"];

            deviceObj["name"] = widgetname;
            deviceObj["slist"] = 'Shared By Name';
            deviceObj["sharingid"] = tolist[i]["sharingid"];
            deviceObj["widget"] = tolist[i]["widget"];
            deviceObj["Timestamp"] = tolist[i]["Timestamp"];
            if (tolist[i].hasOwnProperty('to')) {
              deviceObj["slist"] = tolist[i]["fromName"];
            }

            if (tolist[i].status == 'Declined') {
              deviceObj["recStatus"] = 'Declined';
              deviceObj["rcolor"] = 'red';
            }
            else if (tolist[i].status == 'pending') {
              deviceObj["recStatus"] = 'pending';
              deviceObj["rcolor"] = 'orange';
            }
            else {
              deviceObj["recStatus"] = "Accepted";
              deviceObj["rcolor"] = 'green';
            }
            dlist_copy.push(deviceObj);
          }
          this.setState({ dlist2: dlist_copy });
        }
        else this.setState({ remote: 'flex' });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  acceptRec(item) {
    Alert.alert(
      '',
      'Do You want to accept APPROW Stax ' + item.name + ' by name?',
      [
        { text: 'Ask me later', onPress: () => console.log('Ask me later pressed') },
        { text: 'DECLINE', onPress: () => this.decline(item), style: 'cancel' },
        { text: 'ACCEPT', onPress: () => this.accept(item) },
      ],
      { cancelable: false }
    )
  }
  async accept(item) {



    const deviceid = await AsyncStorage.getItem("currentdeviceid");

    if (deviceid == null) {
      commons.replaceScreen(this, 'welcome', {});
      ToastAndroid.show("Please Add Your Device to Recieve this widget", 500);
      return;
    }
    //alert("widget to insert>>>>"+widgetdata.length)
    this.getWidgetFromBackend(item);
  }
  decline(item) {

    var date = new Date().getDate() + "/" + parseInt(new Date().getMonth() + 1) + "/" + new Date().getFullYear();

    var passdata = {
      "sharingid": item.sharingid,
      "status": "Declined",
      "date": date,
      "Timestamp": item.Timestamp
    }
    item.recStatus = 'Declined';
    item.rcolor = 'red'
    this.setState({ ref: false });
    this.backendwrite(passdata);
  }

  async backendwrite(passdata) {
    var uuid = await commons.getuuid();
    var username = await AsyncStorage.getItem("username");
    var userData = await databasehelper.getuser();
    var date = await commons.gettimestamp();

    var acceestoken = await commons.get_token();
    fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "updatestatus_Temp",
        "sharingid": passdata.sharingid, //username
        "status": passdata.status,
        "statusdate": date,
        "Timestamp": passdata.Timestamp,
        "username": username,
        "name": userData.res[0].firstname + " " + userData.res[0].lastname,
        "uuid": uuid
      }),
    }).then((response) => response.json())
      .then(() => {
      });

  }
  async getWidgetFromBackend(item) {
    var acceestoken = await commons.get_token();
    await fetch('' + aws_data.path + aws_data.stage + 'sharingfunction', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': acceestoken
      },
      body: JSON.stringify({
        "operation": "getSharedList",
        "sharingid": item.sharingid
      }),
    }).then(async (response) => await response.json())
      .then(async (responseJson) => {

        try {
          //alert(JSON.stringify(responseJson));
          if (responseJson.widget[0].mostusedwidget == 2) {
            var splitted = responseJson.widget[0].widgetid.split('#');

            var storeid = splitted[0];
            var category = "";
            if (splitted.length >= 1)
              category = splitted[1];

            commons.replaceScreen(this, 'store_purchase', { "staxid": storeid, "category": category });
          }
          else if (responseJson.widget[0].storeid == undefined || responseJson.widget[0].storeid == 'undefined') {
            if (responseJson.medium == 'socialmedia') {
              var modified_widgets = [];
              const deviceid = await AsyncStorage.getItem("currentdeviceid");
              var widgetdata = responseJson.widget;
              for (var i = 0; i < widgetdata.length; i++) {

                var uuid = await commons.getuuid();
                widgetdata[i]["widgetid"] = uuid;
                widgetdata[i]["deviceid"] = deviceid;
                widgetdata[i]["mostusedwidget"] = 3;
                widgetdata[i]["createtime"] = commons.gettimestamp();
                widgetdata[i]["backgroundpicture"] = "";

                modified_widgets.push(widgetdata[i]);

              }

              var passdata = {
                "sharingid": item.sharingid,
                "status": "Accepted",
                "date": date,
                "Timestamp": item.Timestamp
              }


              //this.setState({ref:false});
              this.backendwrite(passdata);
            }
            else if (responseJson.status == 'pending' && responseJson.medium == 'Email') {
              var modified_widgets = [];
              const deviceid = await AsyncStorage.getItem("currentdeviceid");
              var widgetdata = responseJson.widget;
              for (var i = 0; i < widgetdata.length; i++) {

                var uuid = await commons.getuuid();
                widgetdata[i]["widgetid"] = uuid;
                widgetdata[i]["deviceid"] = deviceid;
                widgetdata[i]["mostusedwidget"] = "1";
                widgetdata[i]["createtime"] = commons.gettimestamp();
                modified_widgets.push(widgetdata[i]);

              }


              var date = new Date().getDate() + "/" + parseInt(new Date().getMonth() + 1) + "/" + new Date().getFullYear();

              var passdata = {
                "sharingid": item.sharingid,
                "status": "Accepted",
                "date": date,
                "Timestamp": item.Timestamp
              }


              this.setState({ ref: false });
              this.backendwrite(passdata);
              var dlist = this.state.dlist2;
              var key = parseInt(item.key)
              dlist[key]["recStatus"] = "Accepted";
              dlist[key]["rcolor"] = 'green';
              this.setState({ dlist2: dlist });

            }
            else if (responseJson.status != 'pending' && responseJson.medium == 'Email') {
              ToastAndroid.show("Link Expired", 3000);
              commons.replaceScreen(this, 'welcome', {});
            }
          }
          else {

            var splitted = responseJson.widget[0].storeid.split('#');

            var storeid = splitted[0];
            var category = "";
            if (splitted.length >= 1)
              category = splitted[1];

            commons.replaceScreen(this, 'store_purchase', { "staxid": storeid, "category": category });
          }

        } catch (error) {
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
          <View title="Shared BY You" style={styles.content}>

            <FlatList style={{ flex: 1 }}
              data={this.state.dlist}
              extraData={this.state}
              // ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping_from.hasOwnProperty("Timestamp"),<TouchableOpacity style={{alignItems:'center',justifyContent:'center'}} onPress={()=>this.loadmore_from(this.state.last_key_val_mapping_from)}><Text allowFontScaling={false}  style={{fontSize:18,fontWeight:'500',textAlign:'center'}}>Load More</Text></TouchableOpacity>)}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                this.loadmore_from(this.state.last_key_val_mapping_from);
              }}

              renderItem={({ item }) =>

                <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
                  <View style={{ width: '20%' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Image style={{ width: 50, height: 70 }} source={require('../assets/Tumbnail_stax.png')} />
                    </View>
                  </View>
                  <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'column' }}>
                      <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: 'black' }}>{item.widget}</Text>
                      <Text allowFontScaling={false} style={{ fontSize: 16, color: '#9297a0' }}>{item.senddate}</Text>
                      <TouchableOpacity onPress={() => {
                        navigate("sharedbylist", user = { 'list': item })
                      }}>
                        <Text allowFontScaling={false} style={{ fontSize: 16, color: '#006BBC', textDecorationLine: 'underline', fontWeight: '300' }} >{item.slist}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              }
            />
          </View>
          {/* Second tab */}
          <View title="Shared With You" style={styles.content}>

            <FlatList style={{ flex: 1 }}
              data={this.state.dlist2}
              extraData={this.state}
              //  ListFooterComponent={commons.renderIf(this.state.last_key_val_mapping_to.hasOwnProperty("Timestamp"),<TouchableOpacity style={{alignItems:'center',justifyContent:'center',marginHorizontal:'2%'}} onPress={()=>this.loadmore_to(this.state.last_key_val_mapping_to)}><Text allowFontScaling={false}  style={{fontSize:18,fontWeight:'500',textAlign:'center'}}>Load More</Text></TouchableOpacity>)}

              onEndReachedThreshold={0.5}
              onEndReached={() => {
                this.loadmore_to(this.state.last_key_val_mapping_from);
              }}
              renderItem={({ item }) =>

                <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 }}>
                  <View style={{ width: '20%' }}>
                    <TouchableOpacity >
                      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ width: 50, height: 70 }} source={require('../assets/Tumbnail_stax.png')} />

                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: '80%' }}>
                    <TouchableOpacity >
                      <View style={{ flexDirection: 'column' }}>

                        <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: 'black' }}>{item.name}</Text>
                        {item.recStatus == 'Waiting Acceptanc' ? <Text allowFontScaling={false} onPress={() => this.acceptRec(item)} style={{ fontSize: 16, color: item.rcolor }}>{item.recStatus}</Text> : <Text allowFontScaling={false} style={{ fontSize: 16, color: item.rcolor }}>{item.recStatus}</Text>}
                        <Text allowFontScaling={false} style={{ fontSize: 16, color: '#2159b2' }}>{item.slist}</Text>
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