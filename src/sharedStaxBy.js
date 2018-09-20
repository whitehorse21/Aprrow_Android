import React from 'react';
import { CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AppRegistry,ToolbarAndroid,SectionList, TouchableOpacity  } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown';


export default class profile extends React.Component {
    static navigationOptions = {
        title: 'Shared APPROW Stax',
        headerStyle: { backgroundColor: "#006BBD" },
        headerTitleStyle: { color: 'white' },
        headerTintColor: 'white',
        headerRight:<Image source={require('./assets/icon_check.png')}
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
   const{navigate}=this.props.navigation;
   
    return (
      
     < KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>  
             
     

     </ KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  }

});
