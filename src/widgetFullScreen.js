import React, { Component } from 'react';
import {
    AsyncStorage, Animated,AppState, WebView, ActivityIndicator,
    Easing, Dimensions,BackHandler,
    Platform, Text, Image, View, StatusBar, ScrollView, StyleSheet, TextInput, ViewPagerAndroid, FlatList, ToastAndroid, TouchableOpacity, ImageBackground, Linking
} from 'react-native';
import device_style from './styles/device.style';
import { Dialog, ConfirmDialog } from 'react-native-simple-dialogs';
import widgets_style from './styles/widgets_style';
import databasehelper from './utils/databasehelper.js';
import ToastExample from './nativemodules/Toast';
import Swiper from 'react-native-swiper';
import commons from './commons';
import LoaderNew from './utils/LoaderNew';
import Strings from './utils/strings.js';
import Modal from 'react-native-modal';
import { LoginManager } from 'react-native-fbsdk';
import SortableList from 'react-native-sortable-list';
import Share, { ShareSheet } from "react-native-share";
import Button from 'react-native-share/components/Button';
import device from './device';
import CheckBox from 'react-native-check-box';
import assetsConfig from "./config/assets.js";
var itemMain = '';
export default class profile extends React.Component {
    static navigationOptions = {
        header: null,
    }
    constructor(props) {
        super(props);
        this.state = {
            itemMain: '',
            feedWebView: '',
            feed: '',
            openLink: '',
            WebViewHeight: '55%',
            FlatViewHeight: '40%',
            expandFeed: 'flex',
            compressFeed: 'none',
            widgetData: [],
            widgetIndex: 0,
            currentIndex:0,
            feedUrl:'',
            appState:'active',
            key: 1
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    webView = {
        canGoBack: false,
        ref: null,
      }
      resetWebViewToInitialUrl = () => {
        this.setState({
          key: this.state.key + 1,
        });
      };
    componentWillUnmount()
    {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    AppState.removeEventListener('change', this._handleAppStateChange);
    }
    _handleAppStateChange = (nextAppState) => {        
        this.setState({appState: nextAppState});
    }
/** 
*(Function Changes the stax
  >>displays stax based on index value)
*@param  :index(index value of stax)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
  async  _indexChange(index) {
        await this.setState({ WebViewHeight: '55%', FlatViewHeight: '40%', expandFeed: 'flex', compressFeed: 'none' })
        if (this.state.widgetData[index].website != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].websiteLink, feed: this.state.widgetData[index].websiteLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].donate != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].donateLink, feed: this.state.widgetData[index].donateLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].instagram != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].instagramLink, feed: this.state.widgetData[index].instagramLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].pinterest != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].pinterestLink, feed: this.state.widgetData[index].pinterestLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].twitter != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].twitterLink, feed: this.state.widgetData[index].twitterLink });
                        this.resetWebViewToInitialUrl();
                    }else if (this.state.widgetData[index].facebook != undefined)
                    {
                        await this.setState({ openLink: this.state.widgetData[index].facebookLink, feed: this.state.widgetData[index].facebookLink });
                        this.resetWebViewToInitialUrl();
                    }
        await this.setState({currentIndex: index });
    }
/** 
*(Launches the app 
  >>Using package name launches the app
  >>Calls the native function launch app)
*@param  :index(index value of stax)     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/    
    luanchapp(packagename) {
        ToastExample.launchapp(packagename);
    }
    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        AppState.addEventListener('change', this._handleAppStateChange);
        try{
        var data = this.props.navigation.state.params.widgetdata;
        var index = this.props.navigation.state.params.index;
        var feedUrl=this.props.navigation.state.params.feed;
        var openLink=this.props.navigation.state.params.openLink;
        if(feedUrl!=undefined && openLink!=undefined)
        await this.setState({feed:feedUrl,openLink:openLink});
       }
        catch(err)
        {
        }
        await this.setState({ widgetData: data, widgetIndex: index,currentIndex:index});
    }
/** 
*(On back click, Move to stax viewer screen )
*@param  :nil     
*@return :nil
*@created by    :dhi
*@modified by   :dhi
*@modified date :05/09/18
*/     
    async handleBackButtonClick()
    {
            if (this.webView.canGoBack && this.webView) {
            if(this.state.openLink==this.state.feedUrl)
            {
            this.props.navigation.state.params.scrollto(this.state.currentIndex,this.state.feedUrl,this.state.feedUrl);    
            this.props.navigation.goBack();
            return true;
            }
            else{
            this.resetWebViewToInitialUrl();
            return true;
            }
            }
    }
    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{ flex: 1, height: '100%', width: '100%' }}>
                {commons.renderIf(this.state.widgetData.length > 0,
                    <Swiper style={{ flex: 1 }}
                        ref={"slidermain"}
                        removeClippedSubviews={false}
                        index={this.state.widgetIndex}
                        showsButtons={this.state.Swiperbutton}
                        showsPagination={false}
                        prevButton={<Image style={{ width: 15, height: 30 }} source={assetsConfig.arrowLeft} />}
                        nextButton={<Image style={{ width: 15, height: 30 }} source={assetsConfig.arrowRight} />}
                        loop={false}
                        containerStyle={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                        onIndexChanged={(index) => this._indexChange(index)}>
                        {this.state.widgetData.map((itemMain, key) => {
                            return (
                                <View style={styles.slide1} key={key}>
                                    <View style={[widgets_style.box_view, { backgroundColor: itemMain.backgroundcolor, height: '100%', width: '100%', marginTop: 0, borderRadius: 0 }]}>
                                        <View style={[{ borderTopLeftRadius: 10, flexDirection: 'row', width: '100%', backgroundColor: itemMain.headercolor, height: '4%', width: '100%', borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, justifyContent: "space-between" }]}>
                                            < View style={{ flexDirection: "row" }}>
                                                <View style={{ width: '10%', marginTop: 3 }}>
                                                    <Image style={widgets_style.box_view_bar_icon} source={assetsConfig.sharpLogoSquareOrange} />
                                                </View>
                                                <View style={{ width: '75%' }}>
                                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{itemMain.widgetname=="Most Frequent"?Strings.mostfrequent_stax:itemMain.widgetname}</Text>
                                                </View>
                                                <TouchableOpacity style={{ width: '15%', alignSelf: 'center' }} onPress={() => {
                                                    this.props.navigation.state.params.scrollto(this.state.currentIndex,this.state.feedUrl,this.state.openLink);
                                                    this.props.navigation.goBack()
                                                }}>
                                                    <Image style={[widgets_style.box_view_bar_icon, {marginLeft: '55%'}]} source={assetsConfig.iconFullscreenExitWhite} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {commons.renderIf(itemMain.WebView == 'none',
                                            <ImageBackground style={{ width: '100%', height: '100%', flex: 1 }}
                                                source={{ uri: itemMain.backgroundpicture }}
                                                imageStyle={{ resizeMode: 'cover' }
                                                }>
                                                <FlatList style={{ flex: 1 }}
                                                    data={itemMain.applist}
                                                    extraData={itemMain}
                                                    renderItem={({ item }) =>
                                                        <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: itemMain.mostusedwidget == 2 ? .5 : .25 
                                                        ,marginLeft:((Object.keys(itemMain.applist).length)-1==item.key && item.key % 2 == 0 && itemMain.mostusedwidget == 2) ? '-15%' : item.key % 2 == 0 && itemMain.mostusedwidget == 2 ? '-22%':0,marginRight:item.key%2!=0&&itemMain.mostusedwidget == 2  ?'-22%':0}}>
                                                            <View key={item.key} >
                                                                <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                <Text allowFontScaling={false} style={{ marginTop: 5,marginLeft: 2,marginRight:2,width: 60, fontWeight: '300', fontSize: 12, textAlign: 'center', color: itemMain.fontcolor }}>{item.appname}</Text>{/* numberOfLines={2} */}
                                                            </View>
                                                        </ TouchableOpacity>
                                                    }
                                                    numColumns={itemMain.mostusedwidget == 2 ? 2 : 4}
                                                /></ImageBackground>)}
                                        { commons.renderIf(itemMain.WebView=='flex' && itemMain.mostusedwidget ==2 && this.state.appState=='active',// && this.state.appState=='active',
                                            <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
                                                <View style={{ width: '100%', height: this.state.FlatViewHeight }}>
                                                    <ImageBackground style={{ width: '100%', height: '100%' }}
                                                        source={{ uri: itemMain.backgroundpicture }}
                                                        imageStyle={{ resizeMode: 'cover' }
                                                        }>
                                                        <FlatList style={{ flex: 1 }}
                                                            data={itemMain.applist}
                                                            extraData={itemMain}
                                                            renderItem={({ item }) =>
                                                                <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: itemMain.mostusedwidget == 2 ? .18 : .09 }}>
                                                                    <View key={item.key} >
                                                                        <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                        <Text allowFontScaling={false} style={{ marginTop: 5,marginLeft: 2,marginRight: 2,width: 60, fontWeight: '300', fontSize: 12, textAlign: 'center', color: itemMain.fontcolor }}>{item.appname}</Text>{/* numberOfLines={2} */}
                                                                    </View>
                                                                </ TouchableOpacity>
                                                            }
                                                            numColumns={itemMain.mostusedwidget == 2 ? 2 : 4}
                                                        />
                                                    </ImageBackground>
                                                </View>
                                                <View style={{ width: '100%', height: this.state.WebViewHeight }}>
                                                    <TouchableOpacity style={{ alignSelf: 'center', display: this.state.expandFeed }} onPress={async () => {
                                                        await this.setState({ WebViewHeight: '95%', FlatViewHeight: '0%', expandFeed: 'none', compressFeed: 'flex' })
                                                    }}>
                                                        <Image style={{}} source={assetsConfig.iconExpandLessBlack} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ alignSelf: 'center', display: this.state.compressFeed }} onPress={async () => {
                                                        await this.setState({WebViewHeight: '55%', FlatViewHeight: '40%', expandFeed: 'flex', compressFeed: 'none' });
                                                    }}>
                                                        <Image style={{}} source={assetsConfig.iconExpandMoreBlack} />
                                                    </TouchableOpacity>
                                                     <WebView
                                                        key={ this.state.key }
                                                        source={{ uri: this.state.feed}}
                                                        style={{ flex: 1, display: itemMain.WebView, justifyContent: 'center' }}
                                                        scalesPageToFit={true}
                                                        bounces={false}
                                                        scrollEnabled={false}
                                                        javaScriptEnabled={true}
                                                        domStorageEnabled={true}
                                                        mixedContentMode='always'
                                                        allowsInlineMediaPlayback={true}
                                                        ref={(webView) => { this.webView = webView; }}
                                                        onNavigationStateChange={(navState) => {this.webView.canGoBack = navState.canGoBack;this.setState({feedUrl:navState.url}); }}
                                                            />
                                                            <View style={{height:'4.5%'}}>
                                                            </View> 
                                                </View>
                                            </View>
                                        )
                                        }
                                        <View style={{ position: 'absolute', flexDirection: 'row', bottom: 0, height:'5%', width: '100%', display: itemMain.WebView, backgroundColor: 'white', justifyContent: 'center' }}>
                                            {commons.renderIf(itemMain.facebookView == "flex",
                                                <TouchableOpacity onPress={async () =>{await this.setState({ feed: itemMain.facebookLink, openLink: itemMain.facebookLink }); this.resetWebViewToInitialUrl();}} style={{ flex: 0.1, display: itemMain.facebookView, justifyContent: 'center' }}>
                                                    <Image source={assetsConfig.iconCircleFacebook} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(itemMain.twitterView == "flex",
                                                <TouchableOpacity onPress={async () =>{await this.setState({ feed: itemMain.twitterLink, openLink: itemMain.twitterLink }); this.resetWebViewToInitialUrl();}} style={{ flex: 0.1, display: itemMain.twitterView, justifyContent: 'center' }}>
                                                    <Image source={assetsConfig.iconCircleTwitter} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(itemMain.instagramView == "flex",
                                                <TouchableOpacity onPress={async () =>{ this.setState({ feed: itemMain.instagramLink, openLink: itemMain.instagramLink }); this.resetWebViewToInitialUrl();}} style={{ flex: 0.1, display: itemMain.instagramView , justifyContent: 'center'}}>
                                                    <Image source={assetsConfig.iconCircleInstagram} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(itemMain.youtubeView == "flex",
                                                <TouchableOpacity onPress={async () =>{await this.setState({ feed: itemMain.youtubeLink, openLink: itemMain.youtubeLink }); this.resetWebViewToInitialUrl();}} style={{ flex: 0.1, display: itemMain.youtubeView , justifyContent: 'center'}}>
                                                    <Image style={{  }} source={assetsConfig.iconCircleYoutube} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(itemMain.pinterestView == "flex",
                                                <TouchableOpacity onPress={async () =>{await this.setState({ feed: itemMain.pinterestLink, openLink: itemMain.pinterestLink }); this.resetWebViewToInitialUrl();}} style={{ flex: 0.1, display: itemMain.pinterestView , justifyContent: 'center'}}>
                                                    <Image style={{ }} source={assetsConfig.iconCirclePinterest} />
                                                </TouchableOpacity>)}
                                        </View>
                                        {commons.renderIf(itemMain.websiteView == "flex",
                                                    <TouchableOpacity onPress={async () =>{ this.setState({ feed: itemMain.websiteLink, openLink: itemMain.websiteLink }); this.resetWebViewToInitialUrl();}} style={{ display: itemMain.websiteView,left:0,bottom:0,position:'absolute',alignSelf:'center',marginLeft:2,marginBottom:3}}>
                                                        <Image style={{ }} source={assetsConfig.webSite} />
                                                    </TouchableOpacity>)}
                                        {commons.renderIf(itemMain.donateView == "flex",
                                                <TouchableOpacity onPress={async () =>{ this.setState({ feed: itemMain.donateLink, openLink: itemMain.donateLink }); this.resetWebViewToInitialUrl();}} style={{ display: itemMain.donateView ,right:0,bottom:0,position:'absolute',alignSelf:'center'}}>
                                                    <Image style={{alignSelf:'center'  }} source={assetsConfig.donateButton} />
                                                </TouchableOpacity>)}
                                    </View>
                                </View>
                            )
                        })}
                    </Swiper>
                )}
            </View>
        );
    }
}
var styles = {
    wrapper: {
    },
    slide1: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#97CAE5'
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9'
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        ...Platform.select({
            ios: {
                paddingTop: 20,
            },
        }),
    },
    title: {
        fontSize: 20,
        paddingVertical: 20,
        color: '#000000',
    },
    list: {
        flex: 1,
        marginTop: 5,
        marginBottom: 8
    },
    contentContainer: {
        width: window.width,
        ...Platform.select({
            ios: {
                paddingHorizontal: 0,
            },
            android: {
                paddingHorizontal: 0,
            }
        })
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        flex: 1,
        marginTop: 5,
        borderRadius: 4,
        ...Platform.select({
            ios: {
                width: window.width - 30 * 2,
                shadowColor: 'rgba(0,0,0,0.2)',
                shadowOpacity: 1,
                shadowOffset: { height: 2, width: 2 },
                shadowRadius: 2,
            },
            android: {
                width: window.width - 30 * 2,
                elevation: 0,
                marginHorizontal: 10,
            },
        })
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 30,
        borderRadius: 25,
    },
    text: {
        fontSize: 18,
        color: '#222222',
    }
}
