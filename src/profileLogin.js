import React from 'react';
import { BackHandler,Linking,AsyncStorage,CheckBox, StyleSheet,Animated, Text, View, TextInput, Button, ScrollView, ToastAndroid, Image,KeyboardAvoidingView,AppRegistry,ToolbarAndroid,SectionList, TouchableOpacity,TouchableHighlight,Dimensions } from 'react-native';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
import { Dropdown } from 'react-native-material-dropdown';
import databasehelper from './utils/databasehelper.js';
import commons from './commons';
import Modal from 'react-native-modal';
import Touch from 'react-native-touch';
import device_style from './styles/device.style';
import Strings from './utils/strings.js';
import FBSDK, {
    LoginManager
  } from "react-native-fbsdk";
import ToastExample from './nativemodules/Toast';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");

const HEADER_MAX_HEIGHT = 90;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default class profile extends React.Component {
    scroll = new Animated.Value(0);
    headerY;
    static navigationOptions = {
        title: 'ProfileLogin',
        headerStyle: { backgroundColor: '#006BBD' },
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
    this.offset= 0;
    this.headerY = Animated.multiply(Animated.diffClamp(this.scroll, 0, 90), -1);
    this.state = {
      dialogVisible: false,
      avatarSource:require('./assets/icon_perfil_sign_in_65px.png'),     
      H1Name:'Sign in for a better APRROW experience',
      HName:Strings.profilelogin_login,
      FollowArray:{Facebook:0,Instagram:0,Twitter:0,Youtube:0},
      username:"",
      showlogout: false,
      login_logoutlabel:Strings.profilelogin_logout,
      offlineFlag:false,
      gotologinflow:false,
      backend_Down_Popup:false,
      animation:new Animated.Value(0),
      scroll:new Animated.ValueXY(0),
      scrollY: new Animated.Value(0),
      viewHeight:200,
      currentScroll:0
    };
    navigation = this.props.navigation;
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    // this.state.scroll.setValue({x:0,y:70})
    // this._animatedValue=new Animated.ValueXY();
    // this._animatedValue.setValue({x:0,y:0});
   
  }

  async componentWillUnmount()
    {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
  async handleBackButtonClick() 
    {
          
                this.props.handleBackButtonClick("Logout");
                return true;
            
    }
  componentDidMount() {
      this.isBackendDown();
    this.mixpanelTrack("Account Profile");
      
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    this.setAccount();     
  }
  async isBackendDown(){
    var aws_data = require("./config/AWSConfig.json");
    var resp_flag=false;
    var request = new XMLHttpRequest();  
   await request.open('GET', aws_data.WebsitePath, true);
   request.onreadystatechange = function(){
       if (request.readyState === 4){
       // alert("r"+request.status);

           if (request.status === 0) { 
           resp_flag=true;
               //alert("Oh no, it does not exist!");
           }  
       }
       else{
  
       //  alert("T1");
       }
   };
   await request.send();
   //return resp_flag;
  
   await setTimeout(() => {
    { 
      if(resp_flag){
        this.setState({backend_Down_Popup:true});
       }
      else
    {
      this.setState({backend_Down_Popup:false});
   
    } }
   }, 2000);
  }

  async setAccount()
  {
         var imagereturnD=await databasehelper.getProfileImage();
         var imageData=imagereturnD.res;
         var imageBase64=imageData[0].profileimage;
         var username = await AsyncStorage.getItem("username");
        

          if(username==commons.guestuserkey())
          {
            this.setState({login_logoutlabel:"Login"})
          }

       
       
         this.setState({                
          username:username
        });
        
        if(imageBase64!='0' && imageBase64!='' && imageBase64!=null && imageBase64!='fgdfhdfhhgfgh' )
        {
           //avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
           this.setState({                
            avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
          });
        }
       /* else{
          this.setState({                
            avatarSource:require('./assets/icon_login_grey_px24.png')
          });          
        }
        */
        var userData=await databasehelper.getuser();

        this.setState({                
          HName:"Hi, "+ userData.res[0].firstname,
          H1Name: userData.res[0].username
         });
  }
  async mixpanelTrack(event)
  {
    try{
        var Mixpannel_tocken=aws_data11.mixpanel_token;
        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
            Mixpanel.default.track(event);
            });
      }catch(err){

      }
  }
  async followRewards(type)
  {
   // alert("type====>>"+type);
    var username=await AsyncStorage.getItem("username");
    if(username==null || username==commons.guestuserkey())
    {
              return;
    }

    var isconnected = await commons.isconnected();   
    if (isconnected) 
    {
       
       var FollowArray=this.state.FollowArray;
       if(!FollowArray.hasOwnProperty(type))
       {           FollowArrayy[type]=0;
       }
        //alert("FollowArray====>>"+JSON.stringify(FollowArray));
       if(FollowArray[type]==0)
       {
         //-------------------------------------------------------------
         var createtime=await commons.gettimestamp();
                var aws_data=require("./config/AWSConfig.json");
                var aws_lamda = require("./config/AWSLamdaConfig.json");
                var acceestoken=await commons.get_token();
                    fetch(''+aws_data.path+aws_data.stage+aws_lamda.profilemgnt, {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                      'Authorization':acceestoken
                        },
                      body: JSON.stringify({
                        "operation":"followedAPRROWRewd",                        
                          "username":this.state.username,
                          "followType":type,
                          "createdate":createtime
                       
                      }),
                  }).then((response) => response.json())
                  .then(async (responseJson) => {               
                      if(responseJson.status=="SUCCESS")
                      {                      
                         
                         this.setState({                
                            FollowArray:responseJson.FollowArray
                           });
                      }
                      else
                      {
                        ToastAndroid.show(JSON.stringify(responseJson),500);
                      }
                      

                  })
                  .catch((error) => {
                      console.error(error);
                  });
                  
      //--------------------------------------------------------------------------
       }
    }
    else
    { 
        ToastAndroid.show(Strings.network_toast_msg1,500);
    }

  }
  async logoutfn()
  {
    this.mixpanelTrack("Logout");
    this.setState({showlogout: false});
    var isconnected = await commons.isconnected();   
    if (isconnected) 
    {
        var result=await commons.syncdatatobackend(); 
     
        if(result== "SUCCESS")
        {   
            //ToastExample.clearWidget();
            await commons.SNSNotification();
            await commons.onGoogleSignOut();
            await commons.CognitoLogout();
            await commons.stopallservice();  
            var lan=await AsyncStorage.getItem("lan");
            await AsyncStorage.clear(); 
            try{
                if(lan!=null&&lan!=undefined)
                await AsyncStorage.setItem("lan",lan);

            }catch(err)
            {
                
            }
            await databasehelper.AllTableDelete();   

            await AsyncStorage.setItem("firstrun", "1"); 

            commons.reset(this,"login",{});
            LoginManager.logOut();    
           await ToastExample.updateHomeScreenWidgets();
      
        }
        else
        {
          ToastAndroid.show(JSON.stringify(result),500);                         
         }
     }
    else
    { 
    ToastAndroid.show(Strings.network_toast_msg1,500);
    }
  }
  async facebookClick()
  {
    Linking.openURL('https://www.facebook.com/aprrow/'); 
    this.followRewards('Facebook');
    this.mixpanelTrack("Open Facebook");
  }
  async instagramClick()
  {
    Linking.openURL('https://www.instagram.com/aprrow/');
    this.followRewards('Instagram');
    this.mixpanelTrack("Open Instagram");
  }
  async twitterClick()
  {
    Linking.openURL('https://twitter.com/_aprrow'); 
    this.followRewards('Twitter');
    this.mixpanelTrack("Open Twitter");
  }
  offlineFunc()
  {
   this.setState({offlineFlag:false,backend_Down_Popup:false});
   this.props.setNavigation('Home');

 //  commons.replaceScreen(this,'bottom_menu',{}); 
  }
//   componentWillMount(){
//       Animated.timing(this.state.scroll,{
//           toValue:{x:0,y:-100},
//           duration:1000,
//           delay:1000
//       }).start();
//   }
  render() {
    //   const miniValue=(100+this.state.scrollY.y)
   const{navigate}=this.props.navigation;
   var window=Dimensions.get('window').height;
   var h=(window*.13);
   let currentHeight =90;
   let hideHeight = 0 ;
//    const headerHeight = this.state.animation.interpolate({
//     inputRange: [0,1],
//     outputRange: [currentHeight,hideHeight],
// 
  
    return (
     < KeyboardAvoidingView behavior='padding' style={{ paddingBottom:30, flex: 1,backgroundColor:'#ffffff' }}>
        <View style={{flex:1}}>

        <Animated.View style={[{position:'absolute',
                    zIndex:1,
                    elevation:0,
                    flex:1,
                    transform : [{
                    translateY:this.headerY
                    }],
                    backgroundColor:'#006BBD'
                    }]}>
            <View style={{backgroundColor:'#006BBD',justifyContent:'center',flexDirection:'row',height:90}}>
                <View style={{ width: '25%', justifyContent:'center',alignItems:'center'}}> 
   {/* <View style={{    headerHeight
               width: h,
               height: h,
               borderRadius: h/2,
               borderWidth: 2,
               borderColor:'#ffffff',
               justifyContent:'center',
               alignItems:'center'
               }}>      */}
                <TouchableOpacity onPress={async()=>{
                 var username=await AsyncStorage.getItem("username");
                 if(username==null||username==commons.guestuserkey())
                 {
                     this.setState({gotologinflow:true});
                     return;
                 }
                
                   navigate("profile");
                 
                 
                 }}>         
                    <Image style={{borderRadius: h/2,width: h,height: h,marginLeft:5}} source={this.state.avatarSource} /> 
                    </TouchableOpacity>          
                    {/*</View>*/}
                    </View>
                    <View style={{marginLeft:2, width: '62%',justifyContent:'center',}}>
                        <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily:'Roboto-Bold', color: 'white',justifyContent:'center',textDecorationLine:'underline' }}>{this.state.HName}</Text>
                        <Text allowFontScaling={false} style={styles.textH}>{this.state.H1Name}</Text>     
                    </View>
                    <TouchableOpacity onPress={async () =>{
                    var username=await AsyncStorage.getItem("username");
                    if(username==null||username==commons.guestuserkey())
                    {
                        const { navigate } = this.props.navigation;
                        navigate("login",{});
                        return;
                    }
                    this.setState({showlogout: true});          
                    
                    }} style={{width: '13%',justifyContent:'center',marginRight:10}}>
                        <Image source={require('./assets/icon_logout_white_30px.png')} style={styles.imageS}/>
                        <Text allowFontScaling={false} style={styles.textH}>{this.state.login_logoutlabel}</Text> 
                </TouchableOpacity> 
            </View>
                     
    </Animated.View>  
     <View style={{ paddingBottom:6 }}>  

     <Dialog visible={this.state.backend_Down_Popup}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    
                    <View >
                        <Image source={require('./assets/icon_offline_grey_40px.png')} style={{alignSelf:'center'}} />
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>{Strings.serverdown_popup_msg1}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5,  fontWeight: 'bold',textAlign: 'center' }}>{Strings.serverdown_popup_msg2}</Text>
                        <Text allowFontScaling={false} style={ { fontSize:20, marginBottom: 5, fontWeight: 'bold', textAlign: 'center' }}>{Strings.serverdown_popup_msg3}</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.serverdown_popup_btn}</Text>
                            </TouchableOpacity>
                            {/*<Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>CANCEL</Text>

                <Text style={device_style.dialog_btn_ok} onPress={() => this.deletewidget()}>DELETE</Text>*/}
                        </View>
                    </View>
                </Dialog>
     <Dialog visible={this.state.offlineFlag}
                    onTouchOutside={() => this.setState({ offlineFlag: false })}
                    animation='fade'
                >
                    <View >
                        <Image source={require('./assets/icon_offline_grey_40px.png')} style={{ alignSelf: 'center' }} />
                        <Text allowFontScaling={false} style={{ fontSize: 28, marginBottom: 15, marginTop: 10, fontWeight: 'bold', textAlign: 'center' }}>{Strings.offline_head}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, fontWeight: '300', textAlign: 'center' }}></Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title1}</Text>
                        <Text allowFontScaling={false} style={{ fontSize: 20, marginBottom: 5, textAlign: 'center' }}>{Strings.offline_common_title2}</Text>


                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>

                            <TouchableOpacity style={{ marginRight: 10, height: 45, width: '45%', backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }} onPress={() => this.offlineFunc()}>
                                <Text allowFontScaling={false} style={{ color: "white", fontWeight: "500" }}>{Strings.offline_common_okbutton}</Text>
                            </TouchableOpacity>
                            {/*<Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_delete: false }) }}>CANCEL</Text>

                <Text style={device_style.dialog_btn_ok} onPress={() => this.deletewidget()}>DELETE</Text>*/}
                        </View>
                    </View>
                </Dialog>
     <Animated.ScrollView
     onScroll={Animated.event(
        [{nativeEvent: 
        {contentOffset: {y: this.state.scrollY}}}]
       )}
       style={{zIndex: 0, height: "100%", elevation: -1}}
       onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: this.scroll}}}],
            {useNativeDriver: true},
       )}
       bounces={false}
       overScrollMode="never"
       scrollEventThrottle={1}
    //  onScrollEndDrag={this.onScrollEndDrag}
     >
     <View style={{marginTop:90}}/>
      <Touch pointerEvents = {'auto'} disabled={false} activeOpacity={0.7}  onPress={() =>{navigate('Settings');}} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_settings_blue_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_setting}</Text>
                  </View>
      </Touch>
     

   {/*} <Touch pointerEvents = {'auto'} disabled={false} activeOpacity={0.7} onPress={() =>navigate('sharedApprow')} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_share_blue_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>Shared STAXs</Text>
                  </View>
          </Touch>*/}
    <Touch pointerEvents = {'auto'} disabled={false} activeOpacity={0.7} onPress={async() =>{
                  var username = await AsyncStorage.getItem("username");               
                  
                    if (username == null || username == commons.guestuserkey()) {     
                      this.setState({gotologinflow:true});
                    }
                    else
                    {
                        var Mixpannel_tocken=aws_data11.mixpanel_token;
                        Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
                            Mixpanel.default.track("Account Shared Stax");
                            });
                      navigate('sharedApprow');
                    } 
       }} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_share_blue_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_shared}</Text>
                  </View>
    </Touch>

    <Touch pointerEvents = {'auto'} disabled={false} activeOpacity={0.7} onPress={async()=>{
                        var connectionstatus = await commons.isconnected();
                        this.mixpanelTrack("Open Help Center");
                        // alert(connectionstatus);
                     if(connectionstatus) {
      navigate('help');
    }
      else{
        this.setState({offlineFlag:true});
      }  }} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_help_blue_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_help}</Text>
                  </View>
    </Touch>

    <Touch pointerEvents = {'auto'} disabled={false} activeOpacity={0.7} onPress={async()=>{

                        var connectionstatus = await commons.isconnected();
                        this.mixpanelTrack("Open EULA");
                        // alert(connectionstatus);
                     if(connectionstatus) {
      navigate('eula');
    }
      else{
        this.setState({offlineFlag:true});
      }  }} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_eula_blue_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_eula}</Text>
                  </View>
      </Touch>
     {/* <Touch
                pointerEvents = {'auto'}
                style={{padding: 10, color: 'red'}}
                activeOpacity={0.7}
                onPress= {this.onPress}
                disabled={false}
     >*/}
      <Touch timeout={2000} pointerEvents = {'auto'} disabled={false} activeOpacity={0.7} onPress={async()=>{
                     var connectionstatus = await commons.isconnected();
                     this.mixpanelTrack("Open About");
                        // alert(connectionstatus);
                     if(connectionstatus) {
      navigate('About');
    }
      else{
        this.setState({offlineFlag:true});
      }  }} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_aprrow_24px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_about}</Text>
                  </View>
      </Touch>
      
              <View style={{height:1,backgroundColor:'grey'}}></View>
              <View style={styles.headView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_follow}</Text></View>
                  
              <TouchableOpacity onPress={()=>this.facebookClick()}  style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_facebook_28px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_facebook}</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>this.instagramClick()} style={styles.outerView}> 
 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_instagram_28px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_instagram}</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>this.twitterClick()} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_twitter_28px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_twitter}</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>{Linking.openURL('https://www.youtube.com/channel/UCUrj8HTm150rAdlrEAhlxkA'); this.followRewards('Youtube')}} style={styles.outerView}> 
                  <View style={styles.imageView}>
                      <Image source={require('./assets/icon_youtube_28px.png')}
                        style={styles.imageS}  /> 
                  </View>
                  <View style={styles.textView}><Text allowFontScaling={false} style={styles.textS}>{Strings.profilelogin_youtube}</Text>
                  </View>
              </TouchableOpacity>
              <Text allowFontScaling={false} style={{fontSize: (Dimensions.get("window").width)*0.040,  color: 'black',alignSelf:'center'}}>{Strings.profilelogin_copy}</Text>
              {/* <View style={{marginBottom:90, borderWidth:4}}/> */}
     </Animated.ScrollView>

              <Modal
                        isVisible={this.state.showlogout}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={[{height: '50%',justifyContent: 'center',alignItems: 'center',backgroundColor: '#eee', borderRadius: 3 }]}>
                            <View style={{  height: '10%', width: '100%', alignItems: "center"}}>
                                <Text allowFontScaling={false} style={[styles.title, { color: "#006BBD",fontSize:20 }]}>{Strings.profilelogin_pop_title}</Text>
                            </View>                           
                            <View style={{  height: '20%', width: '100%', alignItems: "center"}}>
                            </View>
                        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                            <TouchableOpacity onPress={async () =>{
                                        var username=await AsyncStorage.getItem("username");
                                        if(username==null||username==commons.guestuserkey())
                                        {
                                            const { navigate } = this.props.navigation;
                                            navigate("login",{});
                                            return;
                                        }
                                        this.logoutfn();}} 
                                        style={{ backgroundColor: "#006BBD", height: 36, width: '40%', alignItems: "center", marginBottom: 8, borderRadius: 3,alignSelf:'center' }}>
                                 <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>{Strings.profilelogin_pop_yes}</Text>
                            </TouchableOpacity> 
                            <View style={{  width: '10%', }}>
                            </View>  
                            <TouchableOpacity onPress={async () => {this.setState({showlogout: false});}} style={{ backgroundColor: "#006BBD", height: 36, width: '40%', alignItems: "center", marginBottom: 8, borderRadius: 3,alignSelf:'center' }}>
                                <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>{Strings.profilelogin_pop_no}</Text>
                            </TouchableOpacity>
                            </View>
                        </View>

                    </Modal>

                    <Modal
                        isVisible={this.state.gotologinflow}
                        onBackButtonPress={() => this.setState({ gotologinflow: false })}
                        style={{ flex: 1 }}
                        swipeDirection="right"
                        animationIn="fadeIn"
                        animationOut="fadeOut">
                        <View style={{ backgroundColor: "white", borderRadius: 5, height: "40%" }}>
                            <View style={{ backgroundColor: "#006BBD", height: '18%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>

                                <Text allowFontScaling={false} style={[{ fontSize: 18, fontFamily:'Roboto-Bold', color: "white" }]}>{Strings.guestuser_create}</Text>

                            </View>

                            <View style={{ height: "30%", alignItems: "center", justifyContent: "center", marginTop: "8%" }}>

                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title1}</Text>
                                <Text allowFontScaling={false} style={{ textAlign: "center", fontSize: 16,  fontWeight: "100", color: "black" }}>{Strings.guestuser_title2}</Text>
                            </View>


                            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: "10%" }}>
                                <TouchableOpacity onPress={() => { this.setState({ gotologinflow: false }) }}


                                    style={{ marginRight: 10, height: 42, width: 125, backgroundColor: "#0065B2", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_nobtn}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({ gotologinflow: false })
                                        const { navigate } = this.props.navigation;
                                        navigate("login", {});

                                    }}

                                    style={{ marginLeft: 10, height: 42, width: 125, backgroundColor: "#F16822", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                                    <Text allowFontScaling={false} style={{ color: "white", fontFamily:'Roboto-Bold', fontSize: 16 }}>{Strings.guestuser_loginbtn}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </Modal>
    </View>
    </View>
     </ KeyboardAvoidingView>
       
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfcfc"
  },
 
 outerView: {height:'6%',flexDirection: 'row',backgroundColor:'#ffffff',alignItems:'center'},
 imageView: {width:'30%',height:70,backgroundColor:'#ffffff',marginTop: 2,justifyContent:'center'},
 imageS:{  alignSelf:'center',  marginTop: 1,  marginBottom: 1 },
 textView: {width:'70%',backgroundColor:'#ffffff',marginTop: 2},
 headView: {width:'100%',backgroundColor:'#ffffff',marginTop: 2},
 textS:{ fontSize: 16,  color: 'black',marginLeft: 5,marginTop: 2 },
 textH:{ fontSize: 14,fontFamily:'Roboto-Bold', color: 'white',justifyContent:'center' },
 avatar: {borderRadius: 200/2,width: 200,height: 200}
});
