import React,{Component} from 'react';
import {CheckBox,Text,Image,View,KeyboardAvoidingView,StatusBar,Dimensions,ScrollView,StyleSheet,TouchableOpacity,TextInput,Button} from 'react-native';
import device_style from './styles/device.style';
import widgets_style from './styles/widgets_style';
import { Dialog,ConfirmDialog } from 'react-native-simple-dialogs';

export default class auto_create extends Component{
    static navigationOptions = ({ navigation }) => {
                const { params = {} } = navigation.state;
                const { navigate } = navigation
                let title= 'Auto Create';
                let headerStyle= { backgroundColor: '#014E82' };
                let headerTitleStyle= { color: 'white' };
                let headerTintColor= 'white'; 
    
                let headerRight = (
                                    <View style={{flexDirection:'row',margin:10}}>
                                        <TouchableOpacity onPress={ () => params._checkboxenable() }>
                                            <Image style={{height: 30,width: 30,marginTop: 1,marginLeft:5,marginBottom: 1}}  source={require("./assets/icon_done_all_white.png")} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={console.log("share")}>
                                            <Image style={{height: 30,width: 30,marginTop: 1,marginLeft:5,marginBottom: 1}}  source={require("./assets/icon_expand_close.png")} />
                                        </TouchableOpacity>
                                    </View>
                                );
    
                return { title,headerStyle,headerTitleStyle,headerTintColor,headerRight };
    }; 

    _checkboxenable=()=>{
            //this.setState({checked=true});
           // alert("checking");
           // this.setState({checked=true}); 
    }
  
  componentDidMount() {
      this.props.navigation.setParams({ _checkboxenable: this._checkboxenable.bind(this) });
  }
    constructor(props)
    {
        super(props)
        this.state={
            Widget_name:" ",
            button_disp:'none',
            checked:false
        }
    }
    _back_page()
    {
        const { goBack } = this.props.navigation;
        goBack();
    }

    render()
    {   const { navigate } = this.props.navigation
        var windowProp = Dimensions.get('window');
        var winheight=windowProp.height;
        var winwidth=windowProp.width;
        return(
            <KeyboardAvoidingView behavior='padding' style={{flex:1}}>
            <View style={{top:0,marginTop:0,backgroundColor:'white',flex:1}}>
                {/* <Image style={{width:winwidth,height:23,position:'absolute',top:0}} source={require("./assets/notification_bar.png")} /> 
                <Image style={{width:winwidth,height:60,position:'absolute'}} source={require("./assets/appbar.png")} />
                <View style={{flexDirection:'row',marginTop:15}}>
                    <TouchableOpacity onPress={()=>this._back_page()}>
                    <Image style={[widgets_style.header_icon,{marginLeft:10}]} source={require("./assets/icon_arrow_back.png")} />
                    </TouchableOpacity>
                    <Text style={widgets_style.header_title}>Auto Create</Text>
                    <View style={{position:'absolute',right:0}}>
                    <TouchableOpacity onPress={console.log("share")}>
                        <Image style={[widgets_style.header_icon,{marginRight:10}]}  source={require("./assets/icon_expand_close.png")} />
                    </TouchableOpacity>
                    </View>
                </View>*/}

                <View style={{marginLeft:20,marginTop:20}}>
                        <View style={{margin:20}}>
                            <View style={{marginBottom:20}}>
                                <Text style={{fontWeight:'bold',color:"#f16822"}}>Category</Text>
                            </View>
                            
                        
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Games</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                               // checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Utility</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                            //    checked={this.state.checked}
                            //    onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Entertainment</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                              //  checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Finance</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                              //  checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Sports</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                              //  checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Health and Fitness</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                              //  checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Tourism</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                              //  checked={this.state.checked}
                              //  onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>News and Magazines</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                             //   checked={this.state.checked}
                             //   onPress={() => this.setState({checked: true})}
                                />
                            </View>
                            <View style={{flexDirection:'row',marginBottom:10}}>
                                <Image style={widgets_style.header_icon}  source={require("./assets/icon_widget_blue.png")} />
                                <Text style={{marginLeft:10,fontWeight:'400',color:'#000000'}}>Music and Audio</Text> 
                                <CheckBox
                                style={{position:'absolute',right:0}}
                                
                                checked={this.state.checked}
                                onPress={() => this.setState({checked: true})}
                                />
                            </View>
                        
                            <View style={{justifyContent:'center',alignContent:'center',bottom:0}}>
                            <Button
                                title="Create"
                                color="#1569C7"
                                onPress={console.log("hello")}
                            />
                            </View>
                    </View>  
                                      
                </View>
                    
            </View>
            </KeyboardAvoidingView>
        );
    }
}