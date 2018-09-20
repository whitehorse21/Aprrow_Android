import React from 'react';
import {Linking, BackHandler,CheckBox, StyleSheet, Text, View, TextInput, Button, ScrollView,FlatList, ToastAndroid,Dimensions,TouchableOpacity, Image,KeyboardAvoidingView,AppRegistry,shadow,ToolbarAndroid,SectionList,PixelRatio,NativeModules, ImageBackground,AsyncStorage} from 'react-native';
import LoaderNew from './utils/LoaderNew';
import { Dialog } from 'react-native-simple-dialogs';
import { NavigationActions } from 'react-navigation';
//import { Dropdown } from 'react-native-material-dropdown';
import { Picker } from 'react-native-picker-dropdown';
import ModalDropdown from 'react-native-modal-dropdown';
import ImagePicker from 'react-native-image-picker';
import databasehelper from './utils/databasehelper.js';
import commons from './commons.js';
import { handler } from '../lamdafunctions/userDataMgnt';
import Strings from './utils/strings.js';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./config/AWSConfig.json");
export default class profile extends React.Component {


  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let title= Strings.profile_page_head;
    let headerStyle= { backgroundColor: '#006BBC'};
    let headerTitleStyle= { color: 'white',fontFamily: 'Roboto-Bold',fontWeight:'200' };
    let headerTintColor= 'white'; 
    let headerTitleAllowFontScaling=false;
    let headerRight = (
      <View style={{flexDirection:'row'}}>
     {/*  <TouchableOpacity  onPress={params.saveprofile ? params.saveprofile : () => null}>
          <Image source={require('./assets/icon_check.png')}
            style={{
          height: 40,
          width: 40,
          marginTop: 1,
          marginBottom: 1
        }}   
        /> 
        </TouchableOpacity>  */}
    </View>
    );
    
    return {title,headerStyle,headerTitleStyle,headerTintColor,headerRight,headerTitleAllowFontScaling};
  }; 
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
        
      avatarSource:require('./assets/icon_perfil.png'),
      avatarBase64:"",
      username:"",
      avatarFlag:0,
      basicQuestionKey:{
                        "FirstName":1,
                        "LastName":2,
                        "Telephone":3,
                        "City":4,
                        "State":5,
                        "Country":6,
                        "Age":7,
                        "Genre":8
                      },

      FirstName_warningborder: "gray",
      FirstName: "",
      FirstName_warning: "none",

      LastName: "",
      LastName_warningborder: "gray",
      LastName_warning: "none",

      Telephone: "",
      Telephone_warningborder: "gray",
      Telephone_warning: "none",   

      
      City: "",
      City_warningborder: "gray",
      City_warning: "none",   
      
      State: "",
      state_warningborder: "gray",
      state_warning: "none",

      Country: "",
      Country_warningborder: "gray",
      Country_warning: "none",
      CountryHeader:Strings.profile_page_country,

      Age: "",
      Age_warningborder: "gray",
      Age_warning: "none",
      AgeHeader:Strings.profile_page_age,

      Genre: "",
      Genre_warningborder: "gray",
      Genre_warning: "none",
      GenreHeader:Strings.profile_page_genr,

      Profession:"",
      Industry:"",
      Hobby:"",

      checked: false,
      checked_warning: "none",
      loading:false,
      customQnData:"",
      
      
     // dropDownData:[{value:'Painting'},{value:'Listen music'},{value:'Gardening'}],
      //dropDownData:['usage', 'alphabetical', 'category'],
     // pickerdata:[]
     Countrypickerdata:[],
     Agepickerdata:[],
     Genrepickerdata:[],
     Professionpickerdata:[],
     Industrypickerdata:[],
     Hobbypickerdata:[],
     
     basicList:[],
     pList:[],
     profileObj:{},
     dynamicProfData:[],
     
     
     eula_id:" ",
     eula_text:" ",
     euladialog:false,
     showDialog:false,
     Country_DropDown_Val:[],
     Genre_DropDown_Val:[],
     Age_DropDown_Val:[],
     Hobbies_DropDown_Val:[],
      Industry_DropDown_Val:[],
       Profession_DropDown_Val:[]

    };
   // this.eula.bind(this);
   this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
   this.openLink=this.openLink.bind(this);
   this.openLink1=this.openLink1.bind(this);
  }

  componentWillUnmount()
  {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() 
    {
    commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});
  /*  const { goBack } = this.props.navigation;
    goBack();
  */  
    return true;
    }
    async openLink(url)
    {
           
           const { navigate } = this.props.navigation;
           var username = await AsyncStorage.getItem("username");
           var isfirstrun=await AsyncStorage.getItem("firstrun");
           setTimeout(() => {
             if (username != null) {
               //navigate("welcome", { screen: "welcome" }); 
               var urldata = "";
               //console.log(url);
               if(url!=null)
               if (url.url != null&&username!=commons.guestuserkey()) {
                 urldata = (url.url).split("#");
                 //alert(JSON.stringify(url));
                 //console.log("urls>>>>>>>>>>>>"+JSON.stringify(url));
                 //alert(urldata[1]);
                 commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
     
               }
               else {
                 //commons.replaceScreen(this, 'bottom_menu', {});
               }
             }
             else {
              // navigate("login", { screen: "login" }); 
               if(isfirstrun==null)
                commons.replaceScreen(this, 'userypeselector', {});
               else
                commons.replaceScreen(this, 'login', {});
     
     
             }
           }, 2000); 
     
        
    }
    async openLink1()
    {

    }
    async  componentDidMount() {
      
        this.mixpanelTrack("Edit Profile View");
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        Linking.getInitialURL().then(async (url) => {
          if(url)
          this.openLink(url);
          else Linking.addEventListener('url', this.openLink1);
        });
        
    // We can only set the function after the component has been initialized
    this.props.navigation.setParams({ saveprofile: this._saveprofile });
     
      
    var from="account";
    //this.props.navigation.state.params.from;//"facebooksignup";
    if(from=="facebooksignup")
    this.facebookgoogleVal();
    
    this.setFieldList();   
    this.setprofile(); 
    //this.setDropdownList();
    

  }
  facebookgoogleVal()
  {
    this.eula();
    this.setState({euladialog:true});

  }

  
  async eula(){    
    var aws_data=require("./config/AWSConfig.json"); 
    var aws_lamda = require("./config/AWSLamdaConfig.json");     
  var acceestoken=await commons.get_token();             
  await fetch(''+aws_data.path+aws_data.stage+aws_lamda.eulaDataMgnt, {
  method: 'POST',
  headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization':acceestoken
              
            },
  body: JSON.stringify({
  "operation":"getEulatext",
  "TableName":"EulaDetails",
  "eulaId":"1"
                      }),
  }).then((response) => response.json())
  .then((responseJson) => {
  var result=JSON.parse(responseJson);
  this.state.eula_id=result.Item.eulaId.S;
  this.state.eula_text=result.Item.eulaText.S;
//alert(this.state.eula_text)
//  this.props.Text.value = result.Item.eulaText.S;

  })
  .catch((error) => {
  console.error(error);
  });
}


  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
          avatarFlag:1
        });

         NativeModules.RNImageToBase64.getBase64String(this.state.avatarSource.uri, (err, base64) =>
         {        
               //proObj.profileimage=base64;
              // profileData.profileimage=base64;
             //var imagereturnData= databasehelper.updateProfileImage(proObj); 
            // alert("imagereturnData===>>>"+JSON.stringify(imagereturnData));  
               this.setState({
                avatarBase64:base64
              });           
            });
        //alert('source======>>: ', source);
      }
    });
  }

  async facebookNavigate()
  {
       const{navigate}=this.props.navigation;
      // navigate("welcome",{ screen:"welcome"}); 
      navigate("bottom_menu"); 
  }

  changeText(item,keyval)
  {    
    var pt=this.state.pList;   
    pt[item.key].keyVal=keyval;
    this.setState({pList:pt});
    //alert("this.state.pList======>>>"+JSON.stringify(this.state.pList));
  }
 async setDynamicProf(KeyQn,value)
 { 
     var pData=this.state.profileObj;
         pData[KeyQn]=value;        
         this.setState({profileObj:pData});
         //alert(KeyQn+">>>this.state.profileObj====<<<>>>>"+JSON.stringify(this.state.profileObj));        
 } 
  
 /** 
(Initializes the profile Fields with dynamic options (Multi Language)) :
@param        : nil
@return       : nil
@created by   : DhiD3
@modified by  : DhiD7
@modified date: 04/09/18
*/
  async setFieldList()
  {
            var languageCode=await AsyncStorage.getItem("lan");
            if(languageCode==null||languageCode==undefined)
            languageCode='en'
            var languageSplit=languageCode.split("_");
            if(languageSplit.length>0)
            languageCode=languageSplit[0];
            var aws_data=require("./config/AWSConfig.json");    
            var aws_lamda = require("./config/AWSLamdaConfig.json");  
            var acceestoken=await commons.get_token();
            await fetch(''+aws_data.path+aws_data.stage+aws_lamda.profilemgnt, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
                  },
                body: JSON.stringify({
                "operation":"getProfileAllData",
                "languageCode":languageCode              
                }),
                }).then((response) => response.json())
                  .then((responseJson) => {  
                   console.log(JSON.stringify(JSON.stringify({
                    "operation":"getProfileAllData",
                    "languageCode":languageCode              
                    })));               
                   try{ 
                    if(responseJson.length>0)
                    {     
                      var Country_DropDown=[];
                      var Age_DropDown=[];
                      var Genre_DropDown=[];
                      var Hobbies_DropDown=[];
                      var Profession_DropDown=[];
                      var Industry_DropDown=[];


                      var pqList=[];
                    
                      var customQuestionsData=this.state.customQnData;
                      var qtcount=0;                                     
                      for(let qtni=0;qtni<responseJson.length;qtni++)
                      {
                        
                        if(responseJson[qtni].DisplayQn=="Country")
                        {
                        
                         Country_DropDown=responseJson[qtni].QnDropdownList;
                         this.setState({Country_DropDown_Val:Country_DropDown});

                        }
                        else if(responseJson[qtni].DisplayQn=="Age")
                        {
                          Age_DropDown=responseJson[qtni].QnDropdownList;
                          this.setState({Age_DropDown_Val:Age_DropDown});

                        }
                        else if(responseJson[qtni].DisplayQn=="Gender")
                        {
                         
                          Genre_DropDown=responseJson[qtni].QnDropdownList;
                          this.setState({Genre_DropDown_Val:Genre_DropDown});

                        }
                        else if(responseJson[qtni].DisplayQn=="Hobbies")
                        {
                          Hobbies_DropDown=responseJson[qtni].QnDropdownList;
                          this.setState({Hobbies_DropDown_Val:Hobbies_DropDown});    
                        }
                      else if(responseJson[qtni].DisplayQn=="Industry")
                        {
                          Industry_DropDown=responseJson[qtni].QnDropdownList;
                          this.setState({Industry_DropDown_Val:Industry_DropDown});
                      
                        }
                       else if(responseJson[qtni].DisplayQn=="Profession")
                       {
                        Profession_DropDown=responseJson[qtni].QnDropdownList;
                        this.setState({Profession_DropDown_Val:Profession_DropDown});
                       }
                      } 
                    }
                  }catch(err)
                  {
                    console.log("Page:Profile,setFieldList() error"+err);
                  }   
                    
        })
        .catch((error) => {
          console.error(error);
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
  /*
  async  setDropdownList(){

    var aws_data=require("./config/AWSConfig.json");      
    var acceestoken=await commons.get_token();
           await fetch(''+aws_data.path+aws_data.stage+'profilemgnt', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
                  },
                body: JSON.stringify({
                "operation":"getDropdownList",
                "TableName":"DropdownList"               
                }),
                }).then((response) => response.json())
                  .then((responseJson) => {              
              var dropArray= responseJson.list.L;
              for(var i=0;i<dropArray.length;i++)
              {
                var field=dropArray[i].M.field.S;
                var fieldList=dropArray[i].M.valuelist.L;
                var m=[];
                for(var k=0;k<fieldList.length;k++)
                {
                  m.push(<Picker.Item key={fieldList[k].S} label={fieldList[k].S} value={fieldList[k].S}/>);
                //  m=m+<Picker.Item label={fieldList[k].S} value={fieldList[k].S} />;
                }
                if(field=="Country")
                {
                  this.setState({
                    Countrypickerdata:m
                  });
                }
                if(field=="Genre")
                {
                  this.setState({                   
                    Genrepickerdata:m
                  });
                }
                if(field=="Age")
                {
                  this.setState({                   
                    Agepickerdata:m
                  });
                }
                if(field=="Profession")
                {
                  this.setState({                   
                    Professionpickerdata:m
                  });
                }
                if(field=="Industry")
                {
                  this.setState({                   
                    Industrypickerdata:m
                  });
                }
                if(field=="Hobby")
                {
                  this.setState({                   
                    Hobbypickerdata:m
                  });
                }              
                
              }
        })
        .catch((error) => {
          console.error(error);
        });

  
  
  }
*/
async  setprofile(){
  var Username1 = await AsyncStorage.getItem("username");
        var returnD=await databasehelper.getProfile();        
        var returnData=returnD.res;    
       
        if(returnData.length>0) 
         { 
        //customQuestions
          this.setState({            
            FirstName :returnData[0].FirstName,
            LastName  :returnData[0].LastName,
            Telephone :returnData[0].Telephone ,
            City      :returnData[0].City ,
            State     :returnData[0].State,
            Country   :returnData[0].Country, 
            Age       :returnData[0].Age, 
            Genre     :returnData[0].Genre, 
            Profession:returnData[0].Profession,
            Industry  :returnData[0].Industry,
            Hobby     :returnData[0].Hobby,
            username  :returnData[0].Username1
           // avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
          });
          
         if(returnData[0].customQuestions!=undefined && returnData[0].customQuestions!='undefined'&& returnData[0].customQuestions!="") 
              {
               
                var customQuestionsData=JSON.parse(returnData[0].customQuestions);
                this.setState({customQnData:customQuestionsData});
                var pQnList=this.state.pList;
              //console.log("customQuestionsData====>>>"+JSON.stringify(customQuestionsData));    
                  for(var pi=0;pi<pQnList.length;pi++)
                  {
                    if(customQuestionsData[pQnList[pi]["KeyQn"]]!=undefined || customQuestionsData[pQnList[pi]["KeyQn"]]!='undefined')
                    {
                      pQnList[pi].keyVal=customQuestionsData[pQnList[pi]["KeyQn"]];
                    }
                  }
                  this.setState({pList:pQnList});
           }
         }  
          
         var imagereturnD=await databasehelper.getProfileImage();
         var imageData=imagereturnD.res;
         var imageBase64=imageData[0].profileimage;
        
        if(imageBase64!='0' && imageBase64!='' && imageBase64!=null && imageBase64!='fgdfhdfhhgfgh')
        {
           this.setState({                
            avatarSource:{uri: `data:image/gif;base64,${imageBase64}`}
          });
         
        }            
            var aws_data=require("./config/AWSConfig.json"); 
            var aws_lamda = require("./config/AWSLamdaConfig.json");
            var acceestoken=await commons.get_token();     
           await fetch(''+aws_data.path+aws_data.stage+aws_lamda.profilemgnt, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
                  },
                body: JSON.stringify({
                "operation":"setProfile",
                "TableName": "Users",
                "payload": {
                  "username": ""+Username1}
                }),
                }).then((response) => response.json())
                  .then((responseJson) => {
		      // alert("responseJson===>>>"+JSON.stringify(responseJson));
          // var responseJson=JSON.parse(responsJson);
          // this.state.eula_id=result.Item.eulaId.S;
          // this.state.eula_text=result.Item.eulaText.S;
          //alert(this.state.eula_text);
          //this.props.Text.value = result.Item.eulaText.S;
          // alert("responseJson====>>>"+JSON.stringify(responseJson));
          //alert("responseJson====>>>"+JSON.stringify(responseJson.profile));
          //if(responseJson["profile"]["M"].hasOwnProperty(FirstName));  

        /*  this.setState({
          
            FirstName :responseJson.profile.M.FirstName.S,
            LastName  :responseJson.profile.M.LastName.S,  
            State     :responseJson.profile.M.State.S,
            Country   :responseJson.profile.M.Country.S, 
            Age       :responseJson.profile.M.Age.S, 
            Genre     :responseJson.profile.M.Genre.S, 
            Profession:responseJson.profile.M.Profession.S,
            Industry  :responseJson.profile.M.Industry.S,
            Hobby     :responseJson.profile.M.Hobby.S
          });*/
          
        })
        .catch((error) => {
          console.error(error);
        });
        

}
  _saveprofile=async () =>
{
  this.mixpanelTrack("Profile Updated");
  if(this.state.username==undefined || this.state.username=='undefined'|| this.state.username=="")
  { 
    
  var userbackup=await AsyncStorage.getItem("username");
  this.setState({username:userbackup});
  }
  this.saveprofiletodb();
              
}
async saveprofiletodb()
 {
  // alert("_Profession:"+this.state.Profession);
  // this.setState({loading:true});
  this.refs.loaderRef.show();
  var from=this.props.navigation.state.params.from;
  var pListArray=this.state.pList;
  if(pListArray.length>0)
  {
    var proObject={};
    for(let pi=0;pi<pListArray.length;pi++)
    {
      if(pListArray[pi]["keyVal"]!="")
      {
        proObject[pListArray[pi]["KeyQn"]]=pListArray[pi]["keyVal"];
      }
    }
  }
  
  if(this.state.FirstName=="")
  {
    ToastAndroid.show(Strings.profile_toast_firstname,500);
    this.refs.loaderRef.hide();
    return;
  }
  else  if(this.state.LastName=="")
  {
    ToastAndroid.show(Strings.profile_toast_lastname,500);
    this.refs.loaderRef.hide();
    return;
  }
  //alert("proObject===>>>>"+JSON.stringify(proObject));
  var createtime=await commons.gettimestamp();  
 
  var profileData= {    
    FirstName: ""+this.state.FirstName,
    LastName: ""+this.state.LastName, 
    Telephone:  ""+this.state.Telephone,
    City     : ""+this.state.City,
    State: ""+this.state.State,   
    Country: ""+this.state.Country,   
    Age: ""+this.state.Age,    
    Genre: ""+this.state.Genre,   
    Profession:""+this.state.Profession,
    Industry:""+this.state.Industry,
    Hobby:""+this.state.Hobby,
    username:""+this.state.username,
    createtime:""+createtime,
    customQuestions:""+JSON.stringify(proObject)
  };
  /*console.log("profileData===>>>>"+JSON.stringify(profileData)); */
        var proObj={};
        proObj.username=this.state.username;
        proObj.createtime=""+createtime;
      if(this.state.avatarFlag==1)
      { 
        proObj.profileimage=this.state.avatarBase64;
        profileData.profileimage=this.state.avatarBase64;
        /*
        await NativeModules.RNImageToBase64.getBase64String(this.state.avatarSource.uri, (err, base64) =>
         {        
                proObj.profileimage=base64;
                profileData.profileimage=base64;
             //   var imagereturnData= databasehelper.updateProfileImage(proObj); 
               // alert("imagereturnData===>>>"+JSON.stringify(imagereturnData));             
            });
            */
      }    
           
              var aws_data=require("./config/AWSConfig.json");  
              var aws_lamda = require("./config/AWSLamdaConfig.json");  

   /*           console.log("====>>>>"+JSON.stringify({
                "operation":"updateProfile",
                "TableName":aws_data.usertable,
                "payload":{
                  "username":''+profileData.username,
                  "profile":profileData
                }})
              ); */
            
              var acceestoken=await commons.get_token();     
              fetch(''+aws_data.path+aws_data.stage+aws_lamda.profilemgnt, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Authorization':acceestoken
                  },
                body: JSON.stringify({
                  "operation":"updateProfile",
                  "TableName":aws_data.usertable,
                  "payload":{
                    "username":''+profileData.username,
                    "profile":profileData
                  }
                }),
            }).then((response) => response.json())
             .then(async (responseJson) => {               
                 if(responseJson=="SUCCESS")
                 {
                        var returnData=await databasehelper.updateprofile(profileData);                          
                        // alert("responseJson====>>>"+JSON.stringify(responseJson)+"returnData===>>>"+JSON.stringify(returnData));
                         if(this.state.avatarFlag==1)
                          {                            
                            var imagereturnData=  databasehelper.updateProfileImage(proObj);                            
                          }
                        
                          if(returnData.results.rowsAffected>0)
                          {                                                   
                             ToastAndroid.show(Strings.profile_toast_save,500);
                             if(from=="account")
                             {
                              this.setState({ page: '' });
                              const{navigate}=this.props.navigation;
                              navigate("account",{ screen:"account"});
                             }
                             else if(from=="facebooksignup")
                             {
                              this.setState({ page: '' });
                              const{navigate}=this.props.navigation;
                             // navigate("welcome",{ screen:"welcome"});
                               navigate("bottom_menu"); 
                             }
                             else
                             {
                              this.setState({ page: '' });
                             // const{navigate}=this.props.navigation;
                             // navigate("Settings",{ screen:"Settings"});
                            /* const { goBack } = this.props.navigation;
                             goBack();*/
                             commons.replaceScreen(this,"bottom_menu",{"page":"Logout"});

                             }
                          }  
                        
                       //this.setState({page:''});
                       //const{navigate}=this.props.navigation;
                       //navigate("profile", {screen:"profile"});
                 }
                 else
                 {
                   ToastAndroid.show(JSON.stringify(responseJson),500);
                 }
                

            })
            .catch((error) => {
                 console.error(error);
            });
            this.refs.loaderRef.hide();

          //this.setState({loading:false});
 }
 _dropdown_2_renderRow(rowData, rowID, highlighted) {
//alert(rowData);
  //   let icon = this.getcaticon(rowData);
     return (
    

     <TouchableOpacity>
          <View style={{ width:'80%', marginTop: 12 ,alignSelf:'center'}}>
     <View style={{ flex: 1, flexDirection: "row", marginTop: 2,justifyContent:'center'}}>
    
     <Text allowFontScaling={false} style={{color:'#000000',textAlign:'center',justifyContent:'center', marginTop: 3 }}>
     {rowData}            </Text>
     </View>
   
     </View>
     </TouchableOpacity>
     );
     }
     _adjustFrame(style) {
      console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
      style.width = '80%'
      style.height = '40%';
    //  style.left = 0;
     
      return style;
      }
      Age_adjustFrame(style) {
        console.log(`frameStyle={width:${style.width}, height:${style.height}, top:${style.top}, left:${style.left}, right:${style.right}}`);
        style.width = '50%'
        style.height = 120;
      //  style.left = 0;
       
        return style;
        }
      setCountry(id,value)
      {
        //alert(value);
        ///alert(JSON.stringify(value.props.label));
       // var countryVal=value.key;
        //this.setState({Country:"countryVal"});
      }
 _next = (value) => {
  //alert(">>>>>>>>>");
  if(value=='fname')
  this._lname && this._lname.focus();
  if(value=='lname')
  this._telephone && this._telephone.focus();
  if(value=='telephone')
  this._city && this._city.focus();
  if(value=='city')
  this._state && this._state.focus();
  if(value=='state')
  this._nation && this._nation.focus();
  
  }

  render() {
   //temporary comment due to error  --sajin
 //  this.setprofile();
 var window=Dimensions.get('window').width;
   var h=(window*.45);
  
    return (
      
     <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1 }}>
         
      <LoaderNew ref={"loaderRef"}/>
      
    <View style={{flex:1}}>
             
     <ScrollView style={styles.container}>   

     
     <View style={{justifyContent:'center',alignItems: 'center'}}>

     

     <View style={[{justifyContent:'center',alignItems:'center'},{marginTop: 20}]}>
     <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
       <View style={[styles.outerCircle,{width: h,  height: h, borderRadius: h/2}]}>     
        {/*<Image source={require('./assets/icon_perfil.png')}
                style={{
                  height: 130,
                  width: 130                 
                }}
              />  */}
               
         {/* <View style={[styles.avatar, styles.avatarContainer, {marginBottom: 20}]}>*/}
          { this.state.avatarSource === null ? <Text>{Strings.profile_photo_caption}</Text> :
            <Image style={{borderRadius: h/2, width: h, height: h }} source={this.state.avatarSource} />
          }
         {/*</View>*/} 
       
           
         </View>
          </TouchableOpacity> 
         <Text allowFontScaling={false} style={[styles.photoTextStyle,{marginTop: 5}]}>{Strings.profile_photo_caption1}</Text>
      </View>
      

<View style={{justifyContent:'center',width:'80%'}}>
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_first}</Text>
        <TextInput
          allowFontScaling={false} 
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          style={[styles.textInputStyle, {borderColor: this.state.FirstName_warningborder}]}
          onChangeText={(FirstName) => this.setState({ FirstName })}
          value={this.state.FirstName}
          ref={ref => {this._fname = ref}}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={()=>this._next("fname")}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.FirstName_warning}]}>{Strings.profile_page_warn}</Text>

        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_last}</Text>
        <TextInput
          allowFontScaling={false} 
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          style={[styles.textInputStyle,{borderColor: this.state.LastName_warningborder}]}
          onChangeText={(LastName) => this.setState({ LastName })}
          value={this.state.LastName}
          ref={ref => {this._lname = ref}}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={()=>this._next("lname")}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.LastName_warning}]}>{Strings.profile_page_warn}</Text>
        
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_telephone}</Text>
        <TextInput     
          allowFontScaling={false}  
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          style={[styles.textInputStyle,{borderColor: this.state.Telephone_warningborder}]}
          onChangeText={(Telephone) => this.setState({ Telephone })}
          value={this.state.Telephone}
          ref={ref => {this._telephone = ref}}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={()=>this._next("telephone")}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Telephone_warning}]}>{Strings.profile_page_warn}</Text>

        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_city}</Text>
        <TextInput
          allowFontScaling={false}       
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          style={[styles.textInputStyle,{borderColor: this.state.City_warningborder}]}
          onChangeText={(City) => this.setState({ City })}
          value={this.state.City}
          ref={ref => {this._city = ref}}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={()=>this._next("city")}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.City_warning}]}>{Strings.profile_page_warn}</Text>
        
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_state}</Text>
        <TextInput
          allowFontScaling={false} 
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          style={[styles.textInputStyle,{borderColor: this.state.state_warningborder}]}
		      onChangeText={(State) => this.setState({ State })}
          value={this.state.State}
          ref={ref => {this._state = ref}}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={()=>this._next("state")}
        />
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.state_warning}]}>{Strings.profile_page_warn}</Text>
        <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_country}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Country_DropDown_Val}
                                 style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%',color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}
                                defaultValue={this.state.Country}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Country:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
       {/* <Text allowFontScaling={false} style={styles.headStyle}>{this.state.CountryHeader}</Text>
           <View style={[styles.dropdownStyle,styles.textInputStylewithborderColor]}>
                    <Picker
                      selectedValue={this.state.Country}
                      onValueChange={(Country)=>this.setState({Country})}
                      mode="dialog"
                      textStyle={[styles.CountrydropdownText]}
                      style={{}}
                     
                      
                    >                      
                      {this.state.Countrypickerdata}                     
                    </Picker>
            </View>
        
            
            <Text allowFontScaling={false} style={styles.headStyle}>{"Genre"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Genre_DropDown_Val}
                               style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', fontSize: 18}}
                                defaultIndex={-1}
                                defaultValue={this.state.Genre}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Genre:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
            <Text allowFontScaling={false} style={styles.headStyle}>{"Age"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Age_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', fontSize: 18}}
                                defaultIndex={-1}
                                defaultValue={this.state.Age}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Age:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
           
            <Text allowFontScaling={false} style={styles.headStyle}>{"Hobbies"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Hobbies_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', fontSize: 18}}
                                defaultIndex={-1}
                                defaultValue={this.state.Hobby}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Hobby:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
            <Text allowFontScaling={false} style={styles.headStyle}>{"Industry"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Industry_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', fontSize: 18}}
                                defaultIndex={-1}
                                defaultValue={this.state.Industry}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Industry:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
            <Text allowFontScaling={false} style={styles.headStyle}>{"Profession"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Profession_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', fontSize: 18}}
                                defaultIndex={-1}

                                defaultValue={this.state.Profession}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Profession:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Country_warning}]}>{Strings.profile_page_warn}</Text>
         */}
  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
   <View style={{width:'49%'}}>
   <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_age}</Text>
   <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Age_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%', color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}
                                defaultValue={this.state.Age}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Age:value})}}
                                adjustFrame={style => this.Age_adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>

        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Age_warning}]}>{Strings.profile_page_warn}</Text>
	</View>
  <View style={{width:'49%'}}>
  <Text allowFontScaling={false} style={styles.headStyle}>{Strings.profile_page_genr}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Genre_DropDown_Val}
                               style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%',color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}
                                defaultValue={this.state.Genre}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                
                                onSelect={(idx, value) => {this.setState({Genre:value})}}
                                adjustFrame={style => this.Age_adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Genre_warning}]}>{Strings.profile_page_warn}</Text>
        </View>
   </View>
   
   {/*<View style={{flexDirection:'row',justifyContent:'space-between'}}>
   <View style={{width:'49%'}}>
        <Text allowFontScaling={false} style={styles.headStyle}>{this.state.AgeHeader}</Text>
             <View style={[styles.dropdownStyle,styles.textInputStylewithborderColor]}>
                    <Picker
                      selectedValue={this.state.Age}
                      onValueChange={(Age)=>this.setState({Age})}
                      mode="dialog"
                      textStyle={styles.dropdownText}
                    >                      
                      {this.state.Agepickerdata}                     
                    </Picker>
                    
    </View> 

        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Age_warning}]}>{Strings.profile_page_warn}</Text>
	</View>
  <View style={{width:'49%'}}>
        <Text allowFontScaling={false} style={styles.headStyle}>{this.state.GenreHeader}</Text>      
        <View style={[styles.dropdownStyle,styles.textInputStylewithborderColor]}>
                    <Picker
                      selectedValue={this.state.Genre}
                      onValueChange={(Genre)=>this.setState({Genre})}
                      mode="dialog"
                      textStyle={styles.dropdownText}
                    >                      
                      {this.state.Genrepickerdata}                     
                    </Picker>
            </View>
        <Text allowFontScaling={false} style={[styles.warningText,{display: this.state.Genre_warning}]}>{Strings.profile_page_warn}</Text>
        </View>
   </View>

        */}
        <Text allowFontScaling={false} style={[styles.photoTextStyle,{marginTop: 40}]}>{Strings.profile_page_best}</Text>

     <Text allowFontScaling={false} style={styles.headStyle}>{"Hobbies"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Hobbies_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%',color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}
                                defaultValue={this.state.Hobby}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Hobby:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
            <Text allowFontScaling={false} style={styles.headStyle}>{"Industry"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Industry_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%',color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}
                                defaultValue={this.state.Industry}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Industry:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
            <Text allowFontScaling={false} style={styles.headStyle}>{"Profession"}</Text>
            <View style={[styles.dropdownStyleModel,styles.textInputStylewithborderColor]}>
           <ModalDropdown options={this.state.Profession_DropDown_Val}
                                            style={{width:'100%'}}
                                textStyle={{ marginRight:'5%',marginLeft:'5%',color:'#000000',fontFamily:'Roboto',fontSize:13}}
                                defaultIndex={-1}

                                defaultValue={this.state.Profession}
                                dropdownStyle={styles.dropdown_2_dropdown}
                                onSelect={(idx, value) => {this.setState({Profession:value})}}
                                adjustFrame={style => this._adjustFrame(style)}

                                renderRow={this._dropdown_2_renderRow.bind(this)}
                               // onDropdownWillShow={() => this.hidesearch()}


                            />
                            <View style={{ paddingLeft: 5 }}>
                            </View>
            </View>
           {/*} <FlatList
                            data={this.state.pList}
                            extraData={this.state}
                            renderItem={({ item }) =>
                            <View>
                            {commons.renderIf(item.QnType == 'text',  
                                  <View>                              
                                    <Text allowFontScaling={false} style={styles.headStyle}>{item.DisplayQn}</Text>                                                                
                                    <TextInput
                                      allowFontScaling={false}
                                      underlineColorAndroid="transparent"
                                      autoCapitalize="none"
                                      style={[styles.textInputStyle,{borderColor: this.state.state_warningborder}]}
                                      onChangeText={(test1) => this.changeText(item,test1)}
                                      //onValueChange={this.changeText(item)}
                                      value={item.keyVal}
                                    />
                                  </View>
                            )}
                            {commons.renderIf(item.QnType == 'dropdown',  
                                  <View>                              
                                    <Text allowFontScaling={false} style={styles.headStyle}>{item.DisplayQn}</Text>                                                                
                                    <View style={[styles.dropdownStyle,styles.textInputStylewithborderColor]}>
                                              <Picker
                                                selectedValue={item.keyVal}
                                                onValueChange={(test1) => this.changeText(item,test1)}
                                                mode="dialog"
                                                textStyle={styles.dropdownText}>                      
                                                {item.dropList}                                         
                                              </Picker>
                                      </View>
                                  </View>
                          )}
                          </View>
                        }
                                />*/}


          <View style={[styles.dropdownStyle,{ height: 45,borderWidth: 1,marginTop: 4,marginLeft: 10,marginRight: 10,borderRadius: 5 ,
    borderColor:'white'},{display:'flex'}]}>
                  
            </View>
            </View>            
            </View>
            </ScrollView >       
    <TouchableOpacity  onPress={()=>this._saveprofile()} style={[{backgroundColor: '#fff',alignItems: 'center',justifyContent: 'center'},{ height:'9%',borderWidth: 0,marginTop: 4,borderRadius: 0 ,
          borderColor:'white',backgroundColor:"#2699FB"},{display:'flex'}]}>      
            
            <Text allowFontScaling={false} style={{color: "white"}}>{Strings.profile_button_done}</Text>
          
    </TouchableOpacity>
    </View>

     {/* 
      <Dialog
          visible={this.state.euladialog}
          onTouchOutside={() => this.setState({euladialog:true})}
          contentStyle={{ justifyContent: 'center', alignItems: 'center'}}
          animationType="fade">
          <View style={{height:300,justifyContent: 'center', alignItems: 'center',backgroundColor:'white',borderRadius:10}}>
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign:'center' }} >MOBILEUX TECHNOLOGIES</Text>
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2,  marginBottom: 10,textAlign:'center'}} >END USER LICENCE AGREEMENT</Text>
          
          <View style={{flexDirection: 'row' }}>

          <CheckBox style={{ marginTop: 20, marginLeft: 5 }}
           // onClick={()=>this.onClick(this.state.checked)}
            //Checked={this.state.checked}
           // onPress={() => this.setState({checked: true})}
          checked={this.state.checked}
          onPress={() => this.setState({checked: true})}
          />
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <Text allowFontScaling={false} style={{ color: "#004d99", marginTop: 20, marginLeft: 10 }}>I confirm that i have read and agree to the</Text>
            <Text allowFontScaling={false} onPress={()=>this.setState({showDialog:true})} style={{ color: "#004d99", marginTop: 1, marginLeft: 10, textDecorationLine: 'underline' }}>end user licence agreement</Text>

          </View>
          </View>
          <View style={{flexDirection:'row',justifyContent:'center',alignContent:'center',marginTop:20}}>
          <View style={{width:80,height:50,}}>
          <Button onPress={() => this.onPress()} color='grey' style={{ marginTop: 10 }} title="CANCEL" />
          </View>
          
          
          <View style={{width:80,height:50,marginLeft:15}}>
          <Button onPress={()=>this.setState({euladialog:false})} style={{ marginTop: 10 }} color='blue' title="NEXT" />
          </View>
          </View>
        </View>
     </Dialog> */}
    {/*  <Dialog
          visible={this.state.showDialog}
          onTouchOutside={() => this.setState({showDialog:true})}
          contentStyle={{ justifyContent: 'center', alignItems: 'center',backgroundColor:'#006BBD'}}
          animationType="fade">
          <View style={{height:400,justifyContent: 'center', alignItems: 'center',backgroundColor:'white',borderRadius:10}}>
          <Image source={require('./assets/logo_mobileux.png')} style={{ marginTop: 10, marginLeft: 30 }} />
        <ScrollView >
           
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign:'center' }} >MOBILEUX TECHNOLOGIES</Text>
          <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2,  marginBottom: 10,textAlign:'center'}} >END USER LICENCE AGREEMENT</Text>
          <Text allowFontScaling={false} style={{ fontSize: 10, marginTop: 5, marginBottom: 10, justifyContent:'center',alignItems:'center' }}>{this.state.eula_text}</Text>
           
            
        </ScrollView>
  
        <Button onPress={() => this.setState({showDialog:false})} style={{ marginTop: 10 }} title="CLOSE" />
        </View>
        </Dialog>
    */}
     </ KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width:'100%',
    height:'70%',
    backgroundColor: "white"
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 150/2,
    width: 150,
    height: 150
  },
  outerCircle:{
    backgroundColor: 'white',
   // width: 150,
    //height: 150,
    //borderRadius: 150/2,
    borderWidth: 1,
    borderColor:'gray',
   //pacity:0.8,
   // shadowColor: 'black',
   // shadowOffset: { width: 200, height: 200 },
   // shadowOpacity:  1.0,
   // shadowRadius: 2,
    justifyContent:'center',
    alignItems:'center'
  },
  buttonStyle: {
    color: 'red',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'green'
  },
  photoTextStyle:{
    color: "#006BBC",
    fontSize: 14, 
    fontFamily: 'Roboto-Bold',    
    marginLeft: 10   
   },
  headStyle:{
  color: "#2699FB",
  fontSize: 12, 
  fontFamily: 'Roboto-Bold',
  marginTop: 29,
  //marginLeft: 10
 },
  textInputStyle:{
  padding: 5,
	height: 45,	
	borderWidth: 1,
  marginTop: 4,
  fontFamily:'Roboto',
	//marginLeft: 10,
	//marginRight: 10,
	borderRadius: 0 
  },
  textInputStylewithborderColor:{
    //padding: 5,
    height: 45,	
    borderWidth: 1,
    marginTop: 4,
    //marginLeft: 10,
    //marginRight: 10,
    borderRadius: 0 ,
    borderColor:'gray'
    },
    dropdownStyle:{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dropdownStyleModel:{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    dropdownText:{
      color: 'black',
      
      
     
    },
  warningText:
  { 
   color: "red",
   fontSize: 10,
   fontFamily: 'Roboto-Bold',
   marginTop: 4,
   marginLeft: 12
  }  

});
