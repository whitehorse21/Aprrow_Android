import React, { Component } from 'react';
import {
  StyleSheet,
  BackHandler,   // CSS-like styles
  Text,         // Renders text
  View,
  TouchableHighlight,
  Image,
  FlatList         // Container component
} from 'react-native';
import commons from '../commons';
var statusFlag = 0;
export default class sharedbylist extends Component {
  static navigationOptions = ({ navigation }) => {

    const { params = {} } = navigation.state;
    let title = 'Shared List';
    let headerStyle = { backgroundColor: "#006BBD" };
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '100', marginLeft: 0, fontSize: 18 };
    let headerTintColor = 'white';
    let headerTitleAllowFontScaling = false;

    return { title, headerStyle, headerTitleStyle, headerTintColor, headerTitleAllowFontScaling };
  };

  constructor(props) {
    super(props);
    this.state = {
      dlist: [],
      dlist2: [],
      isLoggedIn: false,
      name: ''

    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.list();
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() {
    const { goBack } = this.props.navigation;
    goBack();
    return true;
  }
  async list() {
    device_list = [];
    device_list2 = [];

    this.setState({ dlist: [] });
    var tlist = this.props.navigation.state.params.list;

    this.setState({ name: tlist.widget });
    var tolist = tlist.to;

    var index = 0;
    var len = tolist.length;
    if (len > 0)
      for (var i = 0; i < len; i++) {
        var deviceObj = {};
        if (tolist[i]["toname"] != undefined) {
          deviceObj["key"] = (index++) + "";
          deviceObj["name"] = tolist[i]["toname"];//'Name User';

          deviceObj["date"] = commons.format_string_date(tlist["statusdate"], 'YYYYMMDDHHmmss', 'DD/MM/YYYY');//Email Or Phone #

          deviceObj["slist"] = tolist[i]["status"];//'Status';
          deviceObj["tcolor"] = 'red';

          if (tolist[i].status == 'Declined') {
            deviceObj["tcolor"] = 'red';
            deviceObj["timage"] = require('../assets/icon_declined_red.png');
          }
          else if (tolist[i].status == 'pending') {
            deviceObj["tcolor"] = 'orange';
            deviceObj["timage"] = require('../assets/icon_waiting_orange.png');
          }
          else {
            deviceObj["tcolor"] = 'green';
            deviceObj["timage"] = require('../assets/icon_accepted_green.png');
          }
          //deviceObj["slist"] = 'Status';
          statusFlag
          device_list.push(deviceObj);
        }
      }
    else this.setState({ remote: 'flex' });
    this.setState({ dlist: device_list });

    if (len > 0)
      for (var i = 0; i < len; i++) {
        var deviceObj = {};
        //  var dataObj = result.dataArray[i];
        deviceObj["key"] = i + "";
        deviceObj["name"] = 'Name User';
        deviceObj["date"] = 'Email Or Phone #';
        deviceObj["slist"] = 'Pending';
        deviceObj["tcolor"] = 'red';

        device_list2.push(deviceObj);
      }
    else this.setState({ remote: 'flex' });
    await this.setState({ dlist2: device_list2 });
  }


  render() {
    return (
      <View style={styles.container}>
        <View style={[{ justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#c3cbdb' }, { marginTop: 20 }]}>
          <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: '#2b52c6' }}>{this.state.name}</Text>
        </View>
        <View style={styles.container1}>
          <FlatList style={{ flex: 1 }}
            data={this.state.dlist}
            extraData={this.state}
            renderItem={({ item }) =>
              <View style={{ flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#c3cbdb' }}>
                <View style={{ width: '20%' }}>
                  <TouchableHighlight >
                    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Image style={{ width: 30, height: 30 }} source={item.timage} />
                    </View>
                  </TouchableHighlight>
                </View>
                <View style={{ width: '80%' }}>
                  <TouchableHighlight >
                    <View style={{ flexDirection: 'column' }}>
                      <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily: 'Roboto-Bold', color: 'black' }}>{item.name}</Text>
                      <Text allowFontScaling={false} style={{ fontSize: 16, color: '#006faf' }}>{item.date}</Text>
                      <Text allowFontScaling={false} style={{ fontSize: 15, color: item.tcolor }}>{item.slist}</Text>
                    </View>
                  </TouchableHighlight>
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
    // backgroundColor: '#E9163',         // Background color
  },
  container1: {
    flex: 1,                            // Take up all screen
    // backgroundColor: '#ffffff',         // Darker background for content area
    backgroundColor: '#ffffff'        // Background color
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