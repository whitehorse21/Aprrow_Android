import React from 'react';
import { Image, KeyboardAvoidingView } from 'react-native';


export default class profile extends React.Component {
  static navigationOptions = {
    title: 'Purchase & Subscription',
    headerStyle: { backgroundColor: '#006BBD' },
    headerTitleStyle: { color: 'white' },
    headerTintColor: 'white',
    headerRight: <Image source={require('../assets/icon_check.png')}
      style={{
        height: 40,
        width: 40,
        marginTop: 1,
        marginBottom: 1
      }} />
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
    };
  }
  render() {
    return (
      < KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      </ KeyboardAvoidingView>
    );
  }
}