import React from 'react';
import { BackHandler, WebView, Image, TouchableOpacity } from 'react-native';
import commons from './commons';

export default class Tutorial extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    let title = "Tutorial";
    let headerStyle = { backgroundColor: "#006BBD" };
    let headerTitleAllowFontScaling = false;
    let headerTitleStyle = {
      alignItems: 'center',
      color: "white",
      fontFamily: 'Roboto-Bold', fontWeight: '200',
      marginLeft: 0,
      fontSize: 18
    };
    let headerTintColor = "white";
    let headerLeft = (
      <TouchableOpacity onPress={() => params.handleSave()}>
        <Image source={require("./assets/icon_arrow_back.png")} style={{ marginBottom: 1, marginLeft: 5 }} />
      </TouchableOpacity>
    );

    return {
      title,
      headerStyle,
      headerTitleStyle,
      headerTintColor,
      headerLeft,
      headerTitleAllowFontScaling
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,

    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  handleSave = () => {
    commons.replaceScreen(this, "bottom_menu", { "page": "Home" });
  }

  componentWillMount() {
    this.props.navigation.setParams({ handleSave: this.handleSave.bind(this) });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  async handleBackButtonClick() {
    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
      return true;
    } else {
      commons.replaceScreen(this, "bottom_menu", { "page": "Home" });
      return true;
    }
  }
  webView = {
    canGoBack: false,
    ref: null,
  }
  onNavigationStateChange = (navState) => {
    this.setState({
      backButtonEnabled: navState.canGoBack,
    });
  };

  render() {
    return (
      <WebView
        source={{ uri: 'https://help.aprrow.com/category/using/tutorials/' }}
        style={{}}
        javaScriptEnabled={true}
        ref={(webView) => { this.webView.ref = webView; }}
        onNavigationStateChange={(navState) => { this.webView.canGoBack = navState.canGoBack; }}
      />
    );
  }
}