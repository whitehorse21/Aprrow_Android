import React from 'react';
import { AsyncStorage,CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AppRegistry,ToolbarAndroid,SectionList, TouchableOpacity } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown';

import databasehelper from './utils/databasehelper.js';
import commons from './commons.js';
import { LoginManager } from 'react-native-fbsdk' ;
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin';

export default class profile extends React.Component {
 
 /* static navigationOptions = {
    title: 'Account',
    headerStyle: { backgroundColor: '#2f6b9e' },
    headerTitleStyle: { color: 'white' },
    headerTintColor: 'white',
    headerLeft:<Image source={require('./assets/icon_menu_white.png')}
    style={{
      height: 40,
      width: 40,
      marginTop: 1,
      marginBottom: 1
    }} />
  };*/


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation
    let title= 'Account';
    let headerStyle= { backgroundColor: '#006BBD' };
    let headerTitleStyle= { color: 'white',fontWeight:'500',marginLeft:0,fontSize:18};
    let headerTintColor= 'white'; 
    let headerLeft=(
         <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={ () =>params.opendrawer() }>
                    <Image style={{ height: 25,width: 25,marginTop: 1,marginBottom: 1,marginLeft:5}}   source={require("./assets/ic_menu_white_48px.png")} />  
                    </TouchableOpacity>
        </View>

    );
        
    return { title,headerStyle,headerTitleStyle,headerTintColor,headerLeft };
  }; 


  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,     
      UserName: "Test 1" ,
      avatarSource:require('./assets/icon_perfil.png') ,
      appsdisplay:false     
    };
   
  }

  

  

  componentDidMount() {
    // We can only set the function after the component has been initialized
   
    this.setAccount();       
  }
  async setAccount()
  {
         var imagereturnD=await databasehelper.getProfileImage();
         var imageData=imagereturnD.res;
         var imageBase64=imageData[0].profileimage;
         
        if(imageBase64!='0' && imageBase64!='' && imageBase64!=null && imageBase64!='fgdfhdfhhgfgh' )
        {
           //avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
           this.setState({                
            avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
          });
        }    
          
        var userData=await databasehelper.getuser();
        this.setState({                
          UserName:userData.res[0].username
         });
            
       // alert("userData===>>"+JSON.stringify(userData));

  }

  render() {
  
    return (
      
     < KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1 }}>  
    


     <ScrollView style={styles.container}>       
     <View style={{justifyContent:'center',alignItems:'center'}}>
       <View style={styles.outerCircle}>     
        <Image source={this.state.avatarSource}
                style={styles.avatar}
              />  
           
         </View>
         <Text style={styles.accountStyle}>{this.state.UserName}</Text>
      </View>
    <TouchableOpacity disabled={this.state.appsdisplay} onPress={async () =>{await this.setState({appsdisplay:true})
                                                              navigate("loginandsecurites", { screen: "loginandsecurites" })
                                                              setTimeout(() => {this.setState({appsdisplay: false})}, 1000);}}>   
      <View style={styles.accountBox}>
        <Text style={styles.accountStyle}>LOGIN & SECURITY</Text>
      </View>
    </TouchableOpacity>  
  <TouchableOpacity disabled={this.state.appsdisplay}  onPress={async () =>{await this.setState({appsdisplay:true})
                                                       navigate("profile", user={'from':'account'})
                                                       setTimeout(() => {this.setState({appsdisplay: false})}, 1000);}}>   
      <View style={styles.accountBox}>
        <Text style={styles.accountStyle}>PROFILE</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity disabled={this.state.appsdisplay}  onPress={async () =>{await this.setState({appsdisplay:true})
                                       navigate("sharedApprow", { screen: "sharedApprow" })
                                       setTimeout(() => {this.setState({appsdisplay: false})}, 1000);}}>   
      <View style={styles.accountBox}>  
        <Text style={styles.accountStyle}>SHARED APRROW STAX</Text>
       </View>
       </TouchableOpacity> 
       <TouchableOpacity disabled={this.state.appsdisplay}  onPress={async () =>{await this.setState({appsdisplay:true}); navigate("PurchaseSub", { screen: "PurchaseSub" })
                                                                                  setTimeout(() => {this.setState({appsdisplay: false})}, 1000);}}>    
       <View style={styles.accountBox}> 
        <Text style={styles.accountStyle}>PURCHASE & SUBSCRIPTION</Text> 
       </View>    
       </TouchableOpacity>
      </ScrollView >

     </ KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  },
  accountStyle:{
    color: "dodgerblue",
    fontSize: 14, 
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom : 5,
    marginLeft:25
  },
  outerCircle:{
    backgroundColor: 'white',
    width: 200,
    height: 200,
    borderRadius: 200/2,
    borderWidth: 2,
    borderColor:'#e5e7e9',
    justifyContent:'center',
    alignItems:'center',
    marginTop:10,
    marginBottom:20,
    shadowColor: 'white',
    shadowOffset: { width: 200, height: 200 },
    shadowOpacity:  1.0,
    shadowRadius: 2
  },
  accountBox:{
    height:40,
    borderBottomWidth: 2,
    borderBottomColor: '#95a5a6',
    marginTop:10,
    backgroundColor: "#fdfefe"
  },
  avatar: {
    borderRadius: 200/2,
    width: 200,
    height: 200
  },
});
