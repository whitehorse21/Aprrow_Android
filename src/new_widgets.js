import React,{Component} from 'react';
import {Text,Image,View,KeyboardAvoidingView,StatusBar,Dimensions,ScrollView,StyleSheet,TouchableOpacity,TextInput,Button,ActivityIndicator,AsyncStorage} from 'react-native';
import device_style from './styles/device.style';
import widgets_style from './styles/widgets_style';
import { Dialog,ConfirmDialog } from 'react-native-simple-dialogs';
import commons from './commons';
import databasehelper from './utils/databasehelper.js';
import ToastExample from './nativemodules/Toast';
import Loader from './utils/Loader';
var DeviceInfo = require('react-native-device-info');
export default class widgets_new extends Component{
     static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const { navigate } = navigation
    let title= 'Create new widget';
    let headerStyle= { backgroundColor: '#006BBD' };
    let headerTitleStyle= { color: 'white' };
    let headerTintColor= 'white'; 
    let headerLeft = (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => params.goBack()}>
                    <Image style={{ height: 25, width: 25, marginTop: 1, marginBottom: 1, marginLeft: 5 }} source={require("./assets/icon_arrow_back.png")} />
                </TouchableOpacity>
            </View>

        );
    let headerRight = (
      <View style={{flexDirection:'row',margin:10}}>
                    <TouchableOpacity onPress={() => params.back()}>
                        <Image style={{height: 30,width: 30,marginTop: 1,marginLeft:5,marginBottom: 1}}  source={require("./assets/icon_expand_close.png")} />
                    </TouchableOpacity>
    </View>
    );
    
    return { title,headerStyle,headerTitleStyle,headerTintColor,headerRight,headerLeft };
  }; 

  _handleSave = () => {    
    alert("Test========>>>"+JSON.stringify(this.state));     
  }
    _WidgetRenameenable()
    {
        this.setState({dialogWidget_rename:true});
    }
  _dialogWidgetenable = () => {  
      this.setState({dialogWidget_password:true});
  }
  
  componentDidMount() {
    this.props.navigation.setParams({ _dialogWidgetenable: this._dialogWidgetenable.bind(this) });
    this.props.navigation.setParams({ _WidgetRenameenable: this._WidgetRenameenable.bind(this) });
    this.props.navigation.setParams({ back: this._back_page.bind(this) });
    this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
    this.MostFrequentWidgetFinder();
   
    
  }
    constructor(props)
    {
        super(props)
        this.state={
            Widget_name:" ",
            button_disp:'none',
            loading:false,
            mostFrequent_style:'flex',
        }
    }
    _back_page()
    {
             var item=this.props.navigation.state.params.item;
             const { navigate } = this.props.navigation;
             //navigate("widgets", user={item});
             commons.replaceScreen(this,"widgets", user={item})
    }
    async create_widgets()
    {   this.setState({dialogWidget_name:false,loading:true});
        //alert(this.props.navigation.state.params.item.id);
        var widget_id=await commons.getuuid();
        var time=commons.gettimestamp();
        var widget_name=this.state.Widget_name;
        var deviceid=this.props.navigation.state.params.item.id;
        
        var applistArr=[];

        var applist=JSON.stringify(applistArr);
        var mostusedwidget=1;
        
        if (widget_name.length <= 15 && widget_name.length > 0) {
            var result=await databasehelper.insertwidget(widget_id,widget_name,applist,time,mostusedwidget,deviceid);
            this.setState({loading:false});
            if (result.results.rowsAffected > 0) {
            this.setState({dialogWidget_name:false,
            Widget_name:""
            });
            var item=this.props.navigation.state.params.item;
            const{navigate}=this.props.navigation;
            commons.replaceScreen(this,"widgetseditor",user={widget_id,deviceid,item});
            }
            else{
                this.setState({dialogWidget_name:true});
            }
        }else
        {
            this.setState({loading:false});
            this.setState({dialogWidget_name:true});
        } 
        
    }
    async MostFrequentWidgetFinder()
    {   this.setState({loading:true});
        var currentdevice=this.props.navigation.state.params.item.currentdevice;
        if(currentdevice==0)
        {
        this.setState({mostFrequent_style:'flex'});
        var device_id=this.props.navigation.state.params.item.id;
        var result=await databasehelper.getMostFrequentwidget(device_id);
        if(result.dataArray.length>0)
        this.setState({mostFrequent_style:'none'});
        }
        else this.setState({mostFrequent_style:'none'});
        this.setState({loading:false});
        
    }
    async MostFrequentWidget()
    {

            var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
            if (!enabled_app_usage_permission) {
                ToastExample.askpermission();
                //alert("user denied permmission");
                return;
                }
            else {
                  this.setState({loading:true});
                  var appsString=await ToastExample.getmostusedapps();
                  var apps=JSON.parse(appsString);
                   var applists=[];
                   this.setState({loading:false});
                  for (let i = 0; i < apps.length; i++) {
                   var appobj=apps[i];
                   var dbApp={};
                   dbApp["appname"]=appobj.applabel;
                   dbApp["package"]=appobj.package;
                   applists.push(dbApp); 
                   }
                    this.setState({loading:true});
                    time=commons.gettimestamp();
                    var device_id=this.props.navigation.state.params.item.id;
                    var widget_id=await commons.getuuid();
                    var widget_name="Most Frequent";
                    var mostusedwidget=0;
                    var result=await databasehelper.insertwidget(widget_id,widget_name,JSON.stringify(applists),time,mostusedwidget,device_id);
                    this.setState({loading:false});
                    this.setState({loading:true});
                    await AsyncStorage.setItem('mostusedwidgetid', widget_id);
                    
                    var item=this.props.navigation.state.params.item;
                    this.setState({loading:false});
                    const { navigate } = this.props.navigation;
                    commons.replaceScreen(this,"widgets", user={item})
                    }
        
                            
                
    }
    _prev_page()
    {   //alert("back clicked>>>>>>>>>>>");
         var item=this.props.navigation.state.params.item;
         commons.replaceScreen(this,"widgets", user={item});
    }

    render()
    {   
      
        const { navigate } = this.props.navigation
        var windowProp = Dimensions.get('window');
        var winheight=windowProp.height;
        var winwidth=windowProp.width;
        return(
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
            <View style={{top:0,marginTop:0,backgroundColor:'white',flex:1}}>
         {/*        <Image style={{width:winwidth,height:23,position:'absolute',top:0}} source={require("./assets/notification_bar.png")} /> 
                <Image style={{width:winwidth,height:60,position:'absolute'}} source={require("./assets/appbar.png")} />
                <View style={{flexDirection:'row',marginTop:15}}>
                    <TouchableOpacity onPress={()=>this._back_page()}>
                    <Image style={[widgets_style.header_icon,{marginLeft:10}]} source={require("./assets/icon_arrow_back.png")} />
                    </TouchableOpacity>
                    <Text style={widgets_style.header_title}>Create new widget</Text>
                    <View style={{position:'absolute',right:0}}>
                    <TouchableOpacity onPress={console.log("share")}>
                        <Image style={[widgets_style.header_icon,{marginRight:10}]}  source={require("./assets/icon_expand_close.png")} />
                    </TouchableOpacity>
                    </View>
                </View> */}
                <Loader
                loading={this.state.loading} />
                
                

                <View style={{marginLeft:20,marginTop:20}}>
                    <View style={{margin:20}}>
                            <View style={{marginBottom:20}}>
                                <Text style={{fontWeight:'bold',color:"#f16822"}}>Create Widget</Text>
                            </View>
                            <TouchableOpacity onPress={this.MostFrequentWidget.bind(this)}>
                            <View style={{flexDirection:'row',marginBottom:10,display:this.state.mostFrequent_style}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_most_frequent.png")} /> 
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Most Frequent</Text> 
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({button_disp:'flex',dialogWidget_name: true})}>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_customized.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Customized</Text> 
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate("create", { screen: "create" })}>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_autocreate.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Auto Create</Text> 
                            </View>
                            </TouchableOpacity>
                    </View>                
                </View>


               
                <View style={{display:this.state.button_disp,bottom:0,justifyContent:'center',alignItems:'center',position:'absolute',right:0,left:0,marginBottom:30}}>
             {/*   <Button
                title="NEXT"
                color="#1569C7"
                onPress={console.log("hello")}
                /> */}
            </View>
            </View>
            <Dialog 
                        visible={this.state.dialogWidget_name} 
                        onTouchOutside={() => this.setState({dialogWidget_name: false})} 
                        animation='fade'
                        >
                        <View >
                            <Text style={[device_style.dialog_text,{marginBottom:20,fontWeight:'300',textAlign:'center'}]}>Enter widget name</Text>
                            <TextInput
                                        style={device_style.dialog_textinput}
                                        value={this.state.Widget_name}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(Widget_name) => this.setState({ Widget_name })}
                                        ></TextInput>
                                        <Text style={[device_style.dialog_text,{fontSize:10}]}>Max 15 Characters</Text>
                            <View style={[{flexDirection:'row',marginTop:50},device_style.device_manage]}>
                                <Text style={device_style.dialog_btn_cancel} onPress={()=>{this.setState({dialogWidget_name:false})}}>CANCEL</Text>

                                <Text style={device_style.dialog_btn_ok} onPress={this.create_widgets.bind(this)}>OK</Text>
                            </View>
                        </View>
            </Dialog>

            </KeyboardAvoidingView>
        );
    }
}
const loader = StyleSheet.create({
 
  MainContainer :{
 
    justifyContent: 'center',
    flex:1,
    margin: 10
  },
 
});