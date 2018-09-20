import React, { Component } from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import databasehelper from '../utils/databasehelper.js';
import { uicommons } from '../ui.commons';
export default class ShareOptions extends Component {
  static navigationOptions = ({ navigation }) => {
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

    };
  }

  componentDidMount() {

    //this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
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
          Share with:
        </Text>

        <View style={{ flexDirection: "row", marginTop: 10, marginLeft: 20 }}>

          <Image
            style={{ width: 30, height: 30 }}
            source={require("../assets/icon_devices_blue.png")}
          />
          <Text
            style={{
              marginLeft: 10,

              color: "black",
              fontWeight: "bold"
            }} onPress={() => {
              console.log("another device");
              const { navigate } = this.props.navigation;
              var widgetid = this.props.navigation.state.params.widgetid;
              var item = this.props.navigation.state.params.item;
              navigate("AnotherDevice", user = { widgetid, item });
            }}
          >
            Another device
          </Text>

        </View>

        <View style={{ flexDirection: "row", marginTop: 10, marginLeft: 20 }} >

          <Image
            style={{ width: 30, height: 30 }}
            source={require("../assets/icon_devices_blue.png")}
          />
          <Text
            style={{
              marginLeft: 10,

              color: "black",
              fontWeight: "bold"
            }}
            onPress={async () => {
              console.log("friends");
              var widgetid = this.props.navigation.state.params.widgetid;
              var result = await databasehelper.getwidget(widgetid);
              var widgetArray = [];
              var item = this.props.navigation.state.params.item;
              widgetArray.push(result.dataObj);
              const { navigate } = this.props.navigation;
              navigate("Friends", user = { widgetArray, item });
            }}
          >
            Friends
          </Text>

        </View>
      </View>
    );
  }
}
