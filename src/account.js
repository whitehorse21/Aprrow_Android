import React from 'react';
import { Text, View, ScrollView, Image, KeyboardAvoidingView, TouchableOpacity } from 'react-native';

import { styles } from './styles/account.style'
import databasehelper from './utils/databasehelper.js';

export default class profile extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let title = 'Account';
    let headerStyle = { backgroundColor: '#006BBD' };
    let headerTitleStyle = { color: 'white', fontWeight: '500', marginLeft: 0, fontSize: 18 };
    let headerTintColor = 'white';
    let headerLeft = (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => params.opendrawer()}>
          <Image style={{ height: 25, width: 25, marginTop: 1, marginBottom: 1, marginLeft: 5 }} source={require("./assets/ic_menu_white_48px.png")} />
        </TouchableOpacity>
      </View>

    );
    return { title, headerStyle, headerTitleStyle, headerTintColor, headerLeft };
  };


  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      UserName: "Test 1",
      avatarSource: require('./assets/icon_perfil.png'),
      appsdisplay: false
    };

  }

  componentDidMount() {
    // We can only set the function after the component has been initialized
    this.setAccount();
  }
  async setAccount() {
    var imagereturnD = await databasehelper.getProfileImage();
    var imageData = imagereturnD.res;
    var imageBase64 = imageData[0].profileimage;

    if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
      this.setState({
        avatarSource: { uri: `data:image/gif;base64,${imageBase64}` }
      });
    }

    var userData = await databasehelper.getuser();
    this.setState({
      UserName: userData.res[0].username
    });
  }

  renderTitleRow(navKey,navScreen,rowTitle) {
    return (
      <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () => {
        await this.setState({ appsdisplay: true })
        navigate(navKey, navScreen)
        setTimeout(() => { this.setState({ appsdisplay: false }) }, 1000);}}>
        <View style={styles.accountBox}>
          <Text style={styles.accountStyle}>{rowTitle}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.outerCircle}>
              <Image source={this.state.avatarSource}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.accountStyle}>{this.state.UserName}</Text>
          </View>
          {this.renderTitleRow("loginandsecurites",{ screen: "loginandsecurites" },"LOGIN & SECURITY")}
          {this.renderTitleRow("profile",user = { 'from': 'account' },"PROFILE")}
          {this.renderTitleRow("sharedApprow",{ screen: "sharedApprow" },"SHARED APRROW STAX")}
          {this.renderTitleRow("PurchaseSub",{ screen: "PurchaseSub" },"PURCHASE & SUBSCRIPTION")}
        </ScrollView >
      </ KeyboardAvoidingView>
    );
  }
}