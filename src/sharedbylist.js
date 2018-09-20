import React, { Component } from 'react';
import {
  StyleSheet,
  BackHandler,   // CSS-like styles
  Text,         // Renders text
  View ,
  TouchableHighlight,
  Image,
  FlatList         // Container component
} from 'react-native';
import device_style from './styles/device.style';
import commons from './commons';
import { NavigationActions } from 'react-navigation';
import Strings from './utils/strings.js';
import assetsConfig from "./config/assets.js";
var  statusFlag=0;
export default class sharedbylist extends Component{
  static navigationOptions = ({ navigation }) => {
    const { navigate } = navigation
    const { params = {} } = navigation.state;
    let title=Strings.sharelist_page_head;
    let headerStyle= { backgroundColor: "#006BBD" };
    let headerTitleStyle = { color: 'white',fontFamily:'Roboto-Bold', fontWeight: '100', marginLeft: 0, fontSize: 18 };
    let headerTintColor= 'white'; 
    let headerTitleAllowFontScaling = false;
    let headerRight = (
      <View style={{flexDirection:'row'}}>
       <TouchableHighlight  onPress={params.handleSave ? params.handleSave : () => null}>
          <Image source={assetsConfig.iconCheck}
            style={{
          height: 40,
          width: 40,
          marginTop: 1,
          marginBottom: 1  
        }}   
        /> 
        </TouchableHighlight>  
    </View>
    );
    return {title,headerStyle,headerTitleStyle,headerTintColor,headerTitleAllowFontScaling };
  }; 
  constructor(props)
  {
    super(props);
    this.state={
      dlist : [],
      dlist2 : [],
      isLoggedIn: false,
      name:''  
    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
componentDidMount()
{
  BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  this.list();
}
componentWillUnmount() {
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
}
/** 
  * (Navigate to previos page)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     
    
async handleBackButtonClick() {
  const { goBack } = this.props.navigation;
    goBack();
  return true;
}
/** 
  * (put shared datails in the object)
  * @param  :nil     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
 */     
   
async list()
{
  device_list=[];
  device_list2=[];
  this.setState({ dlist: [] });
  var tlist=this.props.navigation.state.params.list;
  this.setState({name:tlist.widget});
  var tolist=tlist.to;
var index=0;
var len=tolist.length;
if (len > 0)
for (var i = 0; i < len; i++) {
    var deviceObj = {};  
    if(tolist[i]["toname"]!=undefined)
    {deviceObj["key"] = (index++) + "";
    deviceObj["name"] = tolist[i]["toname"];
    deviceObj["date"] =commons.format_string_date(tlist["statusdate"],'YYYYMMDDHHmmss','DD/MM/YYYY');
    deviceObj["tcolor"] = 'red';      
    if(tolist[i].status=='Declined')
    {
      deviceObj["tcolor"] = 'red';
      deviceObj["timage"] =assetsConfig.iconDeclinedRed;
    }
    else if(tolist[i].status=='pending')
    {
      deviceObj["tcolor"] = 'orange';
      deviceObj["timage"] =assetsConfig.iconWaitingOrange;
    }
    else{
      deviceObj["tcolor"] = 'green';
      deviceObj["timage"] =assetsConfig.iconAcceptedGreen;
    }
    statusFlag
    var status="";
    if(tolist[i]["status"]!=undefined)
        {
        status=tolist[i]["status"];
        if(status=="Accepted")
        status=Strings.sharedlist_event_accept;
        else if(status=="Declined")
        status=Strings.sharedlist_event_decline;
        else status=Strings.sharedlist_event_pending;
        }
        deviceObj["slist"] =status; 
    device_list.push(deviceObj);
  }
}
else this.setState({ remote: 'flex' });
this.setState({ dlist: device_list });
if (len > 0)
for (var i = 0; i < len; i++) {
    var deviceObj = {};
    deviceObj["key"] = i + "";
    deviceObj["name"] = 'Name User';
  deviceObj["date"] = 'Email Or Phone #';
   deviceObj["slist"] = 'Pending';
   deviceObj["tcolor"] = 'red';   
    device_list2.push(deviceObj);
}
else this.setState({ remote: 'flex' });
await this.setState({ dlist2: device_list2 });
}
  render() {
    const { navigate } = this.props.navigation;
    const {isLoggedIn} = this.state.isLoggedIn;
    return (
        <View style={styles.container}>  
      <View style={[{justifyContent:'center',alignItems:'center', borderBottomWidth: 1,borderBottomColor:'#c3cbdb'},{marginTop: 20}]}>
          <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily:'Roboto-Bold', color: '#2b52c6' }}>{this.state.name}</Text>
       </View>
       <View style={styles.container1}>   
       <FlatList style={{ flex: 1 }}
                            data={this.state.dlist}
                            extraData={this.state}
                            renderItem={({ item }) =>
                                <View style={{ flex: 1, flexDirection: 'row', width: '100%',alignItems:'center',justifyContent:'space-between',paddingTop:20,borderBottomWidth:1,borderBottomColor:'#c3cbdb' }}>
                                    <View style={{ width: '20%' }}>
                                        <TouchableHighlight >
                                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 30, height: 30 }} source={item.timage} />                                                                              
                                            </View>
                                        </TouchableHighlight>
                                    </View>
                                    <View style={{ width: '80%' }}>
                                        <TouchableHighlight >
                                            <View style={{ flexDirection: 'column'}}>
                                                <Text allowFontScaling={false} style={{ fontSize: 18, fontFamily:'Roboto-Bold', color: 'black' }}>{item.name}</Text>
                                                <Text allowFontScaling={false} style={{ fontSize: 16,  color: '#006faf' }}>{item.date}</Text>                                                                                          
                                                 <Text allowFontScaling={false}  style={{ fontSize: 15,  color:item.tcolor}}>{item.slist}</Text>                                               
                                                   </View>
                                        </TouchableHighlight>
                                    </View>                                  
                                </View>
                            }
                        />       
    </View>     
  </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,                           
    backgroundColor: '#ffffff',       
  },
  container1: {
    flex: 1,                            
    backgroundColor: '#ffffff'        
  },
  content: {
    flex: 1,                            
    justifyContent: 'center',          
    alignItems: 'center',              
    backgroundColor: '#ffffff',         
  },
  header: {
    margin: 10,                        
    color: '#2c66b7',                   
    fontFamily: 'Avenir',              
    fontSize: 26,                     
  },
  text: {
    marginHorizontal: 20,              
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',               
    fontFamily: 'Avenir',
    fontSize: 18,
  },
});