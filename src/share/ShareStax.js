import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text, FlatList, ToastAndroid } from "react-native";
import CheckBox from 'react-native-check-box';
import databasehelper from '../utils/databasehelper.js';
import  uicommons from '../ui.commons.js';
export default class AnotherDevice extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { goBack } = navigation;

    let title = "Share APRROW Stax";
    let headerStyle = { backgroundColor: "#006BBD" };
    let headerTitleStyle = {
      color: "white",
      fontWeight: "500",
      marginLeft: 0,
      fontSize: 18
    };
    let headerTintColor = "white";
    let headerLeft = uicommons.headerLeft(goBack);
    let headerRight = (
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity onPress={() => params.allSelect()}>
          <Image
            style={{
              height: 25,
              width: 25,
              marginTop: 1,
              marginBottom: 1,
              marginRight: 5
            }}
            source={require("../assets/icon_done_all_white.png")}
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

            }}
            source={require("../assets/icon_expand_close.png")}
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
      len: 0,
      dlist: []
    };
  }
  async device_list(show) {

    var deviceid = this.props.navigation.state.params.item.id;

    this.setState({ dlist: [] });
    var result = await databasehelper.getAllwidget(deviceid);

    this.state.len = result.dataArray.length;
    var len = this.state.len;
    var device_list = [];

    for (var i = 0; i < len; i++) {
      var deviceObj = {};
      var dataObj = result.dataArray[i];
      deviceObj["key"] = i + "";
      deviceObj["widgetname"] = dataObj.widgetname;
      deviceObj["widgetid"] = dataObj.widgetid;
      deviceObj["deviceid"] = dataObj.deviceid;
      deviceObj["checked"] = show;

      device_list.push(deviceObj);
    }

    this.setState({ dlist: device_list });


  }

  componentDidMount() {
    // this.props.navigation.setParams({ goBack: this._prev_page.bind(this)});
    this.props.navigation.setParams({ allSelect: this.allSelect.bind(this) });
    this.props.navigation.setParams({ deSelect: this.deSelect.bind(this) });
    var show = false;
    this.device_list(show);
  }
  deSelect() {
    var show = false;
    this.device_list(show);
  }
  allSelect() {

    var show = true;
    this.device_list(show);

  }
  async onClick(item) {
    if (item.checked == true) {
      item.checked = false;
    }
    else item.checked = true;

  }
  async share_widget() {
    var widget = this.state.dlist;

    var flag = 0;

    var widgetArray = [];
    var temp = JSON.stringify(widget);
    var len = widget.length;


    for (var i = 0; i < len; i++) {
      var deviceObj = {};
      var tempArray = JSON.parse(temp);
      var dataObj = tempArray[i];

      if (dataObj["checked"] == true) {

        deviceObj["key"] = i + "";
        deviceObj["widgetname"] = dataObj.widgetname;
        deviceObj["widgetid"] = dataObj.widgetid;
        deviceObj["deviceid"] = dataObj.deviceid;
        widgetArray.push(deviceObj);
      }

    }

    if (widgetArray.length > 0) {
      var item = this.props.navigation.state.params.item;
      //  console.log(">>>>>>>>>>>>> sharewidgetoptions"+JSON.stringify(item));
      const { navigate } = this.props.navigation;
      navigate("ShareWidgetOptions", user = { widgetArray, flag, item });
      //commons.replaceScreen(this, "ShareWidgetOptions", user={widgetArray,flag});
    }
    else {
      ToastAndroid.show("Please Choose Widget", 3000);
    }

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
          Select Stax
        </Text>


        <View style={{ height: '80%', flexDirection: "row", marginTop: 10, marginLeft: 20 }}>

          <FlatList style={{ flex: 1 }}
            extraData={this.state}
            data={this.state.dlist}
            renderItem={({ item }) =>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '20%', flexDirection: 'row' }}>
                  <Image style={{ width: 45, height: 45 }} source={require("../assets/icon_widget_blue.png")} />
                </View>
                <View style={{ width: '50%', flexDirection: 'row', marginTop: 10 }}>
                  <Text allowFontScaling={false} style={{ textAlign: 'left', marginLeft: 10, color: "black", fontWeight: "500", fontSize: 16 }} onPress={() => { }}>{item.widgetname}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <CheckBox
                    onClick={() => this.onClick(item)}
                    isChecked={item.checked} />
                </View>
              </View>
            }
          />


        </View>
        <View style={{ marginBottom: 20, position: 'absolute', left: 0, bottom: 0, right: 0, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => this.share_widget()}>
            <View style={{ bottom: 0, backgroundColor: '#006BBD', height: 40, width: 80, justifyContent: 'center', alignContent: 'center' }}>
              <Text allowFontScaling={false} style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>NEXT</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>


    );
  }
}
