import React, { Component } from "react";
import { View, Button, TouchableOpacity, Image, Text } from "react-native";
import databasehelper from './utils/databasehelper.js';
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
       
        <View style={{ flexDirection: "row", marginTop: 10,marginLeft: 20 }}>
       
          <Image
            style={{  width: 30, height: 30 }}
            source={require("./assets/icon_devices_blue.png")}
          />
          <Text
            style={{
              marginLeft: 10,
             
              color: "black",
              fontWeight: "bold"
            }} onPress={()=>{console.log("another device");
            const { navigate } = this.props.navigation;
            var widgetid=this.props.navigation.state.params.widgetid;
            var item=this.props.navigation.state.params.item;
            navigate("AnotherDevice",user={widgetid,item});
          }}
          >
            Another device
          </Text>
          
        </View>
     
        <View style={{ flexDirection: "row", marginTop: 10,marginLeft: 20 }} >
       
          <Image
            style={{  width: 30, height: 30 }}
            source={require("./assets/icon_devices_blue.png")}
          />
          <Text
            style={{
              marginLeft: 10,
             
              color: "black",
              fontWeight: "bold"
            }}
            onPress={async()=>{console.log("friends");
            var widgetid=this.props.navigation.state.params.widgetid;
            var result=await databasehelper.getwidget(widgetid); 
            var widgetArray=[];
            var item=this.props.navigation.state.params.item;
            widgetArray.push(result.dataObj);
            const { navigate } = this.props.navigation;
            navigate("Friends",user={widgetArray,item});
          }}
          >
            Friends
          </Text>
         
        </View> 
        </View>
    );
  }
}
