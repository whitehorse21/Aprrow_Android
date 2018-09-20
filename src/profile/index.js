import React from 'react';
import { Linking, BackHandler, CheckBox, Text, View, TextInput, Button, ScrollView, FlatList, ToastAndroid, Dimensions, TouchableOpacity, Image, KeyboardAvoidingView, NativeModules, AsyncStorage } from 'react-native';
import LoaderNew from '../utils/LoaderNew';
import { Dialog } from 'react-native-simple-dialogs';
//import { Dropdown } from 'react-native-material-dropdown';
import { Picker } from 'react-native-picker-dropdown';
import ImagePicker from 'react-native-image-picker';
import databasehelper from '../utils/databasehelper.js';
import commons from '../commons.js';
import { styles } from './styles';
var AWSConfig = require("../config/AWSConfig.json");

export default class profile extends React.Component {

  static navigationOptions = () => {
    let title = 'Edit Profile';
    let headerStyle = { backgroundColor: '#006BBC' };
    let headerTitleStyle = { color: 'white', fontFamily: 'Roboto-Bold', fontWeight: '200' };
    let headerTintColor = 'white';
    let headerTitleAllowFontScaling = false;
    let headerRight = (<View style={{ flexDirection: 'row' }}></View>);
    return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerTitleAllowFontScaling };
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,

      avatarSource: require('../assets/icon_perfil.png'),
      avatarBase64: "",
      username: "",
      avatarFlag: 0,

      basicQuestionKey: {
        "FirstName": 1,
        "LastName": 2,
        "Telephone": 3,
        "City": 4,
        "State": 5,
        "Country": 6,
        "Age": 7,
        "Genre": 8
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
      CountryHeader: "Country",

      Age: "",
      Age_warningborder: "gray",
      Age_warning: "none",
      AgeHeader: "Age",

      Genre: "",
      Genre_warningborder: "gray",
      Genre_warning: "none",
      GenreHeader: "Genre",

      Profession: "",
      Industry: "",
      Hobby: "",

      checked: false,
      checked_warning: "none",
      loading: false,
      customQnData: "",

      Countrypickerdata: [],
      Agepickerdata: [],
      Genrepickerdata: [],
      Professionpickerdata: [],
      Industrypickerdata: [],
      Hobbypickerdata: [],

      basicList: [],
      pList: [],
      profileObj: {},
      dynamicProfData: [],


      eula_id: " ",
      eula_text: " ",
      euladialog: false,
      showDialog: false,
    };
    // this.eula.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.openLink = this.openLink.bind(this);
    this.openLink1 = this.openLink1.bind(this);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.removeEventListener('url', this.openLink1);
  }
  async handleBackButtonClick() {
    commons.replaceScreen(this, "bottom_menu", { "page": "Logout" });
    return true;
  }
  async openLink(url) {

    var username = await AsyncStorage.getItem("username");
    var isfirstrun = await AsyncStorage.getItem("firstrun");
    setTimeout(() => {
      if (username != null) {
        var urldata = "";
        if (url != null)
          if (url.url != null && username != commons.guestuserkey()) {
            urldata = (url.url).split("#");
            commons.replaceScreen(this, 'widgetrecievebeta', { "launchurl": urldata[1] });
          }
          else {
            //commons.replaceScreen(this, 'bottom_menu', {});
          }
      }
      else {
        if (isfirstrun == null)
          commons.replaceScreen(this, 'userypeselector', {});
        else
          commons.replaceScreen(this, 'login', {});


      }
    }, 2000);


  }
  async openLink1() {

  }
  async  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    Linking.getInitialURL().then(async (url) => {
      if (url)
        this.openLink(url);
      else Linking.addEventListener('url', this.openLink1);
    });

    // We can only set the function after the component has been initialized
    this.props.navigation.setParams({ saveprofile: this._saveprofile });
    var from = "account";
    //this.props.navigation.state.params.from;//"facebooksignup";
    if (from == "facebooksignup")
      this.facebookgoogleVal();

    this.setFieldList();
    this.setprofile();
    //this.setDropdownList();


  }
  facebookgoogleVal() {
    this.eula();
    this.setState({ euladialog: true });

  }


  async eula() {
    await fetch('' + AWSConfig.path + AWSConfig.stage + 'eulaDataMgnt', {
      method: 'POST',
      headers: commons.getHeader(),
      body: JSON.stringify({
        "operation": "getEulatext",
        "TableName": "EulaDetails",
        "eulaId": "1"
      }),
    }).then((response) => response.json())
      .then((responseJson) => {
        var result = JSON.parse(responseJson);
        this.state.eula_id = result.Item.eulaId.S;
        this.state.eula_text = result.Item.eulaText.S;
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
          avatarFlag: 1
        });

        NativeModules.RNImageToBase64.getBase64String(this.state.avatarSource.uri, (err, base64) => {
          this.setState({
            avatarBase64: base64
          });
        });
      }
    });
  }

  async facebookNavigate() {
    const { navigate } = this.props.navigation;
    navigate("bottom_menu");
  }

  changeText(item, keyval) {
    var pt = this.state.pList;
    pt[item.key].keyVal = keyval;
    this.setState({ pList: pt });
  }
  async setDynamicProf(KeyQn, value) {
    var pData = this.state.profileObj;
    pData[KeyQn] = value;
    this.setState({ profileObj: pData });
  }
  async setFieldList() {

    await fetch('' + AWSConfig.path + AWSConfig.stage + 'profilemgnt', {
      method: 'POST',
      headers: commons.getHeader(),
      body: JSON.stringify({
        "operation": "getQnListnew",
        "TableName": "ProfileQtnList"
      }),
    }).then((response) => response.json())
      .then((responseJson) => {

        if (responseJson.length > 0) {
          var pqList = [];
          // var bqList=[];
          var customQuestionsData = this.state.customQnData;
          var qtcount = 0;
          for (let qtni = 0; qtni < responseJson.length; qtni++) {
            let KeyQn = responseJson[qtni].KeyQn;

            // responseJson[qtni]["key"]=qtni;
            responseJson[qtni]["keyVal"] = "";
            if (customQuestionsData[KeyQn] != undefined || customQuestionsData[KeyQn] != 'undefined') {
              responseJson[qtni]["keyVal"] = customQuestionsData[KeyQn];
            }
            let DisplayQn = responseJson[qtni].DisplayQn;
            let QnType = responseJson[qtni].QnType;
            let QnDropdownList = responseJson[qtni].QnDropdownList;

            if (QnType == "text") {
            }
            else {
              var dropdownList = [];
              for (var di = 0; di < QnDropdownList.length; di++) {
                dropdownList.push(<Picker.Item key={QnDropdownList[di]} label={QnDropdownList[di]} value={QnDropdownList[di]} />);
              }

              responseJson[qtni]["dropList"] = dropdownList;
            }

            if (this.state.basicQuestionKey.hasOwnProperty(responseJson[qtni].KeyQn)) {  // bqList.push(responseJson[qtni]);
              if (responseJson[qtni].KeyQn == "Country") {
                this.setState({
                  Countrypickerdata: responseJson[qtni]["dropList"],
                  CountryHeader: DisplayQn
                });
              }
              if (responseJson[qtni].KeyQn == "Genre") {
                this.setState({
                  Genrepickerdata: responseJson[qtni]["dropList"],
                  GenreHeader: DisplayQn
                });
              }
              if (responseJson[qtni].KeyQn == "Age") {
                this.setState({
                  Agepickerdata: responseJson[qtni]["dropList"],
                  AgeHeader: DisplayQn
                });
              }
            }
            else {
              responseJson[qtni]["key"] = qtcount;
              qtcount = qtcount + 1;
              pqList.push(responseJson[qtni]);
            }
          }
          this.setState({ pList: pqList });

        }

      })
      .catch((error) => {
        console.error(error);
      });
  }
  async  setprofile() {

    var Username1 = await AsyncStorage.getItem("username");
    var returnD = await databasehelper.getProfile();
    var returnData = returnD.res;

    if (returnData.length > 0) {
      this.setState({
        FirstName: returnData[0].FirstName,
        LastName: returnData[0].LastName,
        Telephone: returnData[0].Telephone,
        City: returnData[0].City,
        State: returnData[0].State,
        Country: returnData[0].Country,
        Age: returnData[0].Age,
        Genre: returnData[0].Genre,
        Profession: returnData[0].Profession,
        Industry: returnData[0].Industry,
        Hobby: returnData[0].Hobby,
        username: returnData[0].Username1
      });

      if (returnData[0].customQuestions != undefined && returnData[0].customQuestions != 'undefined' && returnData[0].customQuestions != "") {

        var customQuestionsData = JSON.parse(returnData[0].customQuestions);
        this.setState({ customQnData: customQuestionsData });
        var pQnList = this.state.pList;
        for (var pi = 0; pi < pQnList.length; pi++) {
          if (customQuestionsData[pQnList[pi]["KeyQn"]] != undefined || customQuestionsData[pQnList[pi]["KeyQn"]] != 'undefined') {
            pQnList[pi].keyVal = customQuestionsData[pQnList[pi]["KeyQn"]];
          }
        }
        this.setState({ pList: pQnList });
      }
    }

    var imagereturnD = await databasehelper.getProfileImage();
    var imageData = imagereturnD.res;
    var imageBase64 = imageData[0].profileimage;

    if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
      this.setState({
        avatarSource: { uri: `data:image/gif;base64,${imageBase64}` }
      });

    }
    await fetch('' + AWSConfig.path + AWSConfig.stage + 'profilemgnt', {
      method: 'POST',
      headers: commons.getHeader(),
      body: JSON.stringify({
        "operation": "setProfile",
        "TableName": "Users",
        "payload": {
          "username": "" + Username1
        }
      }),
    }).then((response) => response.json())
      .then(() => {
        })
      .catch((error) => {
        console.error(error);
      });


  }
  _saveprofile = async () => {

    if (this.state.username == undefined || this.state.username == 'undefined' || this.state.username == "") {

      var userbackup = await AsyncStorage.getItem("username");
      this.setState({ username: userbackup });
    }
    this.saveprofiletodb();


  }
  async saveprofiletodb() {
    this.refs.loaderRef.show();
    var from = this.props.navigation.state.params.from;
    var pListArray = this.state.pList;
    if (pListArray.length > 0) {
      var proObject = {};
      for (let pi = 0; pi < pListArray.length; pi++) {
        if (pListArray[pi]["keyVal"] != "") {
          proObject[pListArray[pi]["KeyQn"]] = pListArray[pi]["keyVal"];
        }
      }
    }

    if (this.state.FirstName == "") {
      ToastAndroid.show('Please Enter First name', 500);
      this.refs.loaderRef.hide();
      return;
    }
    else if (this.state.LastName == "") {
      ToastAndroid.show('Please Enter Last name', 500);
      this.refs.loaderRef.hide();
      return;
    }
    var createtime = await commons.gettimestamp();

    var profileData = {
      FirstName: "" + this.state.FirstName,
      LastName: "" + this.state.LastName,
      Telephone: "" + this.state.Telephone,
      City: "" + this.state.City,
      State: "" + this.state.State,
      Country: "" + this.state.Country,
      Age: "" + this.state.Age,
      Genre: "" + this.state.Genre,
      Profession: "" + this.state.Profession,
      Industry: "" + this.state.Industry,
      Hobby: "" + this.state.Hobby,
      username: "" + this.state.username,
      createtime: "" + createtime,
      customQuestions: "" + JSON.stringify(proObject)
    };
    var proObj = {};
    proObj.username = this.state.username;
    proObj.createtime = "" + createtime;
    if (this.state.avatarFlag == 1) {
      proObj.profileimage = this.state.avatarBase64;
      profileData.profileimage = this.state.avatarBase64;
    }

    fetch('' + AWSConfig.path + AWSConfig.stage + 'profilemgnt', {
      method: 'POST',
      headers: commons.getHeader(),
      body: JSON.stringify({
        "operation": "updateProfile",
        "TableName": AWSConfig.usertable,
        "payload": {
          "username": '' + profileData.username,
          "profile": profileData
        }
      }),
    }).then((response) => response.json())
      .then(async (responseJson) => {
        if (responseJson == "SUCCESS") {
          var returnData = await databasehelper.updateprofile(profileData);
          if (this.state.avatarFlag == 1) {
          }

          if (returnData.results.rowsAffected > 0) {
            ToastAndroid.show('Saved', 500);
            if (from == "account") {
              this.setState({ page: '' });
              const { navigate } = this.props.navigation;
              navigate("account", { screen: "account" });
            }
            else if (from == "facebooksignup") {
              this.setState({ page: '' });
              const { navigate } = this.props.navigation;
              navigate("bottom_menu");
            }
            else {
              this.setState({ page: '' });
              commons.replaceScreen(this, "bottom_menu", { "page": "Logout" });
            }
          }
        }
        else {
          ToastAndroid.show(JSON.stringify(responseJson), 500);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    this.refs.loaderRef.hide();
  }

  _next = (value) => {
    if (value == 'fname')
      this._lname && this._lname.focus();
    if (value == 'lname')
      this._telephone && this._telephone.focus();
    if (value == 'telephone')
      this._city && this._city.focus();
    if (value == 'city')
      this._state && this._state.focus();
    if (value == 'state')
      this._nation && this._nation.focus();

  }

  render() {
    //temporary comment due to error  --sajin
    //  this.setprofile();
    var window = Dimensions.get('window').width;
    var h = (window * .45);

    return (
      <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={-170} style={{ flex: 1 }}>
        <LoaderNew ref={"loaderRef"} />
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <View style={[{ justifyContent: 'center', alignItems: 'center' }, { marginTop: 20 }]}>
                <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
                  <View style={[styles.outerCircle, { width: h, height: h, borderRadius: h / 2 }]}>
                    {this.state.avatarSource === null ? <Text>Select a photo</Text> :
                      <Image style={{ borderRadius: h / 2, width: h, height: h }} source={this.state.avatarSource} />
                    }
                  </View>
                </TouchableOpacity>
                <Text allowFontScaling={false} style={[styles.photoTextStyle, { marginTop: 5 }]}>Change photo</Text>
              </View>
              <View style={{ justifyContent: 'center', width: '80%' }}>
                <View>
                  <Text allowFontScaling={false} style={styles.headStyle}>First Name</Text>
                  <TextInput
                    allowFontScaling={false}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    style={[styles.textInputStyle, { borderColor: this.state.FirstName_warningborder }]}
                    onChangeText={(FirstName) => this.setState({ FirstName })}
                    value={this.state.FirstName}
                    ref={ref => { this._fname = ref }}
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => this._next("fname")} />
                  <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.FirstName_warning }]}>This information is required</Text>
                </View>

                <Text allowFontScaling={false} style={styles.headStyle}>Last Name</Text>
                <TextInput
                  allowFontScaling={false}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  style={[styles.textInputStyle, { borderColor: this.state.LastName_warningborder }]}
                  onChangeText={(LastName) => this.setState({ LastName })}
                  value={this.state.LastName}
                  ref={ref => { this._lname = ref }}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => this._next("lname")} />
                <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.LastName_warning }]}>This information is required</Text>

                <Text allowFontScaling={false} style={styles.headStyle}>Telephone</Text>
                <TextInput
                  allowFontScaling={false}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  style={[styles.textInputStyle, { borderColor: this.state.Telephone_warningborder }]}
                  onChangeText={(Telephone) => this.setState({ Telephone })}
                  value={this.state.Telephone}
                  ref={ref => { this._telephone = ref }}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => this._next("telephone")} />
                <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.Telephone_warning }]}>This information is required</Text>

                <Text allowFontScaling={false} style={styles.headStyle}>City</Text>
                <TextInput
                  allowFontScaling={false}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  style={[styles.textInputStyle, { borderColor: this.state.City_warningborder }]}
                  onChangeText={(City) => this.setState({ City })}
                  value={this.state.City}
                  ref={ref => { this._city = ref }}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => this._next("city")} />
                <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.City_warning }]}>This information is required</Text>

                <Text allowFontScaling={false} style={styles.headStyle}>State</Text>
                <TextInput
                  allowFontScaling={false}
                  underlineColorAndroid="transparent"
                  autoCapitalize="none"
                  style={[styles.textInputStyle, { borderColor: this.state.state_warningborder }]}
                  onChangeText={(State) => this.setState({ State })}
                  value={this.state.State}
                  ref={ref => { this._state = ref }}
                  keyboardType="default"
                  returnKeyType="next"
                  onSubmitEditing={() => this._next("state")} />
                <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.state_warning }]}>This information is required</Text>

                <Text allowFontScaling={false} style={styles.headStyle}>{this.state.CountryHeader}</Text>
                <View style={[styles.dropdownStyle, styles.textInputStylewithborderColor]}>
                  <Picker
                    selectedValue={this.state.Country}
                    onValueChange={(Country) => this.setState({ Country })}
                    mode="dialog"
                    textStyle={[styles.CountrydropdownText]}
                    style={{}}>
                    {this.state.Countrypickerdata}
                  </Picker>
                </View>

                <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.Country_warning }]}>This information is required</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: '49%' }}>
                    <Text allowFontScaling={false} style={styles.headStyle}>{this.state.AgeHeader}</Text>
                    <View style={[styles.dropdownStyle, styles.textInputStylewithborderColor]}>
                      <Picker
                        selectedValue={this.state.Age}
                        onValueChange={(Age) => this.setState({ Age })}
                        mode="dialog"
                        textStyle={styles.dropdownText}>
                        {this.state.Agepickerdata}
                      </Picker>
                    </View>
                    <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.Age_warning }]}>This information is required</Text>
                  </View>
                  <View style={{ width: '49%' }}>
                    <Text allowFontScaling={false} style={styles.headStyle}>{this.state.GenreHeader}</Text>
                    <View style={[styles.dropdownStyle, styles.textInputStylewithborderColor]}>
                      <Picker
                        selectedValue={this.state.Genre}
                        onValueChange={(Genre) => this.setState({ Genre })}
                        mode="dialog"
                        textStyle={styles.dropdownText}>
                        {this.state.Genrepickerdata}
                      </Picker>
                    </View>
                    <Text allowFontScaling={false} style={[styles.warningText, { display: this.state.Genre_warning }]}>This information is required</Text>
                  </View>
                </View>

                <Text allowFontScaling={false} style={[styles.photoTextStyle, { marginTop: 40 }]}>Best way to define yourself:</Text>
                <FlatList
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
                            style={[styles.textInputStyle, { borderColor: this.state.state_warningborder }]}
                            onChangeText={(test1) => this.changeText(item, test1)}
                            //onValueChange={this.changeText(item)}
                            value={item.keyVal}
                          />
                        </View>
                      )}
                      {commons.renderIf(item.QnType == 'dropdown',
                        <View>
                          <Text allowFontScaling={false} style={styles.headStyle}>{item.DisplayQn}</Text>
                          <View style={[styles.dropdownStyle, styles.textInputStylewithborderColor]}>
                            <Picker
                              selectedValue={item.keyVal}
                              onValueChange={(test1) => this.changeText(item, test1)}
                              mode="dialog"
                              textStyle={styles.dropdownText}>
                              {item.dropList}
                            </Picker>
                          </View>
                        </View>
                      )}
                    </View>
                  } />
                <View style={[styles.dropdownStyle, {
                  height: 45, borderWidth: 1, marginTop: 4, marginLeft: 10, marginRight: 10, borderRadius: 5,
                  borderColor: 'white' }, { display: 'flex' }]}>
                </View>
              </View>
            </View>
          </ScrollView >
          <TouchableOpacity onPress={() => this._saveprofile()} style={[{ backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, {
            height: '9%', borderWidth: 0, marginTop: 4, borderRadius: 0, borderColor: 'white', backgroundColor: "#2699FB" }, { display: 'flex' }]}>
            <Text allowFontScaling={false} style={{ color: "white" }}>DONE</Text>
          </TouchableOpacity>
        </View>

        <Dialog
          visible={this.state.euladialog}
          onTouchOutside={() => this.setState({ euladialog: true })}
          contentStyle={{ justifyContent: 'center', alignItems: 'center' }}
          animationType="fade">
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10 }}>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center' }} >MOBILEUX TECHNOLOGIES</Text>
            <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2, marginBottom: 10, textAlign: 'center' }} >END USER LICENCE AGREEMENT</Text>

            <View style={{ flexDirection: 'row' }}>
              <CheckBox style={{ marginTop: 20, marginLeft: 5 }}
                checked={this.state.checked}
                onPress={() => this.setState({ checked: true })}
              />
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <Text allowFontScaling={false} style={{ color: "#004d99", marginTop: 20, marginLeft: 10 }}>I confirm that i have read and agree to the</Text>
                <Text allowFontScaling={false} onPress={() => this.setState({ showDialog: true })} style={{ color: "#004d99", marginTop: 1, marginLeft: 10, textDecorationLine: 'underline' }}>end user licence agreement</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: 20 }}>
              <View style={{ width: 80, height: 50, }}>
                <Button onPress={() => this.onPress()} color='grey' style={{ marginTop: 10 }} title="CANCEL" />
              </View>
              <View style={{ width: 80, height: 50, marginLeft: 15 }}>
                <Button onPress={() => this.setState({ euladialog: false })} style={{ marginTop: 10 }} color='blue' title="NEXT" />
              </View>
            </View>
          </View>
        </Dialog>
        <Dialog
          visible={this.state.showDialog}
          onTouchOutside={() => this.setState({ showDialog: true })}
          contentStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#006BBD' }}
          animationType="fade">
          <View style={{ height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 10 }}>
            <Image source={require('../assets/logo_mobileux.png')} style={{ marginTop: 10, marginLeft: 30 }} />
            <ScrollView >
              <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center' }} >MOBILEUX TECHNOLOGIES</Text>
              <Text allowFontScaling={false} style={{ fontSize: 14, fontWeight: 'bold', marginTop: 2, marginBottom: 10, textAlign: 'center' }} >END USER LICENCE AGREEMENT</Text>
              <Text allowFontScaling={false} style={{ fontSize: 10, marginTop: 5, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>{this.state.eula_text}</Text>
            </ScrollView>
            <Button onPress={() => this.setState({ showDialog: false })} style={{ marginTop: 10 }} title="CLOSE" />
          </View>
        </Dialog>
      </ KeyboardAvoidingView>
    );
  }
}