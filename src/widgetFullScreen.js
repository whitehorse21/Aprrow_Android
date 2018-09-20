import React from 'react';
import {
    AppState, WebView, Dimensions, BackHandler,
    Platform, Text, Image, View, FlatList, TouchableOpacity, ImageBackground
} from 'react-native';
import widgets_style from './styles/widgets_style';
import ToastExample from './nativemodules/Toast';
import Swiper from 'react-native-swiper';
import commons from './commons';

export default class profile extends React.Component {
    static navigationOptions = {
        header: null,
    }
    constructor(props) {
        super(props);
        this.state = {
            dialogVisible: false,
            item_main: '',
            feedWebView: '',
            feed: '',
            openLink: '',
            WebViewHeight: '55%',
            FlatViewHeight: '40%',
            expandFeed: 'flex',
            compressFeed: 'none',
            widgetdata: [],
            widget_index: 0,
            curindex: 0,
            feedUrl: '',
            appState: 'active',
            key: 1

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }
    /* state = {
         appState: AppState.currentState
     } */
    webView = {
        canGoBack: false,
        ref: null,
    }
    resetWebViewToInitialUrl = () => {
        this.setState({
            key: this.state.key + 1,
            // feed:this.state.feed


        });
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    _handleAppStateChange = (nextAppState) => {
        this.setState({ appState: nextAppState });
    }
    async  _indexChange(index) {
        await this.setState({ WebViewHeight: '55%', FlatViewHeight: '40%', expandFeed: 'flex', compressFeed: 'none' })

        if (this.state.widgetdata[index].website != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].websiteLink, feed: this.state.widgetdata[index].websiteLink });
            this.resetWebViewToInitialUrl();
        } else if (this.state.widgetdata[index].donate != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].donateLink, feed: this.state.widgetdata[index].donateLink });
            this.resetWebViewToInitialUrl();
        } else if (this.state.widgetdata[index].instagram != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].instagramLink, feed: this.state.widgetdata[index].instagramLink });
            this.resetWebViewToInitialUrl();
        } else if (this.state.widgetdata[index].pinterest != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].pinterestLink, feed: this.state.widgetdata[index].pinterestLink });
            this.resetWebViewToInitialUrl();
        } else if (this.state.widgetdata[index].twitter != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].twitterLink, feed: this.state.widgetdata[index].twitterLink });
            this.resetWebViewToInitialUrl();
        } else if (this.state.widgetdata[index].facebook != undefined) {
            //await this.setState({feed:"https://www.google.com"});
            await this.setState({ openLink: this.state.widgetdata[index].facebookLink, feed: this.state.widgetdata[index].facebookLink });
            this.resetWebViewToInitialUrl();
        }
        // }
        //else this.setState({ feed: "https://www.google.com", openLink: "https://www.google.com" });    

        await this.setState({ curindex: index });

    }
    luanchapp(packagename) {
        ToastExample.launchapp(packagename);
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        AppState.addEventListener('change', this._handleAppStateChange);
        try {
            var data = this.props.navigation.state.params.widgetdata;
            var index = this.props.navigation.state.params.index;

            var feedUrl = this.props.navigation.state.params.feed;
            var openLink = this.props.navigation.state.params.openLink;
            if (feedUrl != undefined && openLink != undefined)
                await this.setState({ feed: feedUrl, openLink: openLink });
            /* if(openLink!=undefined)
             await this.setState({openLink:openLink});
             */
        }

        catch (err) {

        }


        await this.setState({ widgetdata: data, widget_index: index, curindex: index });
    }
    async handleBackButtonClick() {

        //if (this.webviewSma.canGoBack && this.webviewSma) {
        //alert(this.state.feedUrl+">>>>>>>>>>"+this.state.openLink);
        //alert(this.webView.canGoBack && this.webView)
        if (this.webView.canGoBack && this.webView) {

            if (this.state.openLink == this.state.feedUrl) {
                this.props.navigation.state.params.scrollto(this.state.curindex, this.state.feedUrl, this.state.feedUrl);
                this.props.navigation.goBack();
                return true;
            }
            else {
                //this.webviewSma.goBack();
                this.resetWebViewToInitialUrl();
                return true;
            }
        }/*else{
            this.props.navigation.state.params.scrollto(this.state.curindex,this.state.feedUrl,this.state.openLink);    
            this.props.navigation.goBack();
            return true;
            }  */

    }
    render() {

        return (

            <View style={{ flex: 1, height: '100%', width: '100%' }}>

                {commons.renderIf(this.state.widgetdata.length > 0,
                    <Swiper style={{ flex: 1 }}
                        ref={"slidermain"}
                        removeClippedSubviews={false}
                        index={this.state.widget_index}
                        showsButtons={this.state.Swiperbutton}
                        showsPagination={false}
                        prevButton={<Image style={{ width: 15, height: 30 }} source={require("./assets/arrow_left.png")} />}
                        nextButton={<Image style={{ width: 15, height: 30 }} source={require("./assets/arrow_right.png")} />}
                        loop={false}
                        containerStyle={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                        onIndexChanged={(index) => this._indexChange(index)}>





                        {this.state.widgetdata.map((item_main, key) => {
                            return (


                                <View style={styles.slide1} key={key}>

                                    <View style={[widgets_style.box_view, { backgroundColor: item_main.backgroundcolor, height: '100%', width: '100%', marginTop: 0, borderRadius: 0 }]}>

                                        <View style={[{ borderTopLeftRadius: 10, flexDirection: 'row', width: '100%', backgroundColor: item_main.headercolor, height: '4%', width: '100%', borderRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, justifyContent: "space-between" }]}>
                                            < View style={{ flexDirection: "row" }}>
                                                <View style={{ width: '10%', marginTop: 3 }}>
                                                    <Image style={widgets_style.box_view_bar_icon} source={require("./assets/sharp-logo_square_orange.png")} />
                                                </View>
                                                <View style={{ width: '75%' }}>
                                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{item_main.widgetname}</Text>
                                                </View>
                                                <TouchableOpacity style={{ width: '15%', alignSelf: 'center' }} onPress={() => {
                                                    //this.getsingleslideview()

                                                    this.props.navigation.state.params.scrollto(this.state.curindex, this.state.feedUrl, this.state.openLink);

                                                    this.props.navigation.goBack()


                                                }}>
                                                    <Image style={[widgets_style.box_view_bar_icon, { marginLeft: '55%' }]} source={require("./assets/icon_fullscreen_exit_white.png")} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {commons.renderIf(item_main.WebView == 'none',
                                            <ImageBackground style={{ width: '100%', height: '100%', flex: 1 }}
                                                source={{ uri: item_main.backgroundpicture }}

                                                imageStyle={{ resizeMode: 'cover' }

                                                }>

                                                <FlatList style={{ flex: 1 }}
                                                    data={item_main.applist}
                                                    extraData={item_main}
                                                    renderItem={({ item }) =>
                                                        <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{
                                                            flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .5 : .25
                                                            , marginLeft: item.key % 2 == 0 && item_main.mostusedwidget == 2 ? '-22%' : 0, marginRight: item.key % 2 != 0 && item_main.mostusedwidget == 2 ? '-22%' : 0
                                                        }}>

                                                            <View key={item.key} >
                                                                <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                <Text allowFontScaling={false} style={{ marginTop: 5, marginLeft: 2, marginRight: 2, width: 60, fontWeight: '300', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }}>{item.appname}</Text>{/* numberOfLines={2} */}
                                                            </View>
                                                        </ TouchableOpacity>
                                                    }
                                                    numColumns={item_main.mostusedwidget == 2 ? 2 : 4}

                                                /></ImageBackground>)}


                                        {commons.renderIf(item_main.WebView == 'flex' && item_main.mostusedwidget == 2 && this.state.appState == 'active',// && this.state.appState=='active',

                                            <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
                                                <View style={{ width: '100%', height: this.state.FlatViewHeight }}>
                                                    <ImageBackground style={{ width: '100%', height: '100%' }}
                                                        source={{ uri: item_main.backgroundpicture }}

                                                        imageStyle={{ resizeMode: 'cover' }

                                                        }>
                                                        <FlatList style={{ flex: 1 }}
                                                            data={item_main.applist}
                                                            extraData={item_main}
                                                            renderItem={({ item }) =>
                                                                <TouchableOpacity onPress={() => this.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .18 : .09 }}>
                                                                    <View key={item.key} >
                                                                        <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                                                        <Text allowFontScaling={false} style={{ marginTop: 5, marginLeft: 2, marginRight: 2, width: 60, fontWeight: '300', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }}>{item.appname}</Text>{/* numberOfLines={2} */}
                                                                    </View>
                                                                </ TouchableOpacity>
                                                            }

                                                            numColumns={item_main.mostusedwidget == 2 ? 2 : 4}

                                                        />
                                                    </ImageBackground>
                                                </View>
                                                <View style={{ width: '100%', height: this.state.WebViewHeight }}>
                                                    <TouchableOpacity style={{ alignSelf: 'center', display: this.state.expandFeed }} onPress={async () => {

                                                        await this.setState({ WebViewHeight: '95%', FlatViewHeight: '0%', expandFeed: 'none', compressFeed: 'flex' })


                                                    }}>
                                                        <Image style={{}} source={require("./assets/icon_expand_less_black.png")} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ alignSelf: 'center', display: this.state.compressFeed }} onPress={async () => {

                                                        await this.setState({ WebViewHeight: '55%', FlatViewHeight: '40%', expandFeed: 'flex', compressFeed: 'none' });

                                                    }}>
                                                        <Image style={{}} source={require("./assets/icon_expand_more_black.png")} />
                                                    </TouchableOpacity>
                                                    <WebView
                                                        key={this.state.key}
                                                        source={{ uri: this.state.feed }}
                                                        style={{ flex: 1, display: item_main.WebView, justifyContent: 'center' }}
                                                        scalesPageToFit={true}
                                                        bounces={false}
                                                        scrollEnabled={false}
                                                        javaScriptEnabled={true}
                                                        domStorageEnabled={true}
                                                        mixedContentMode='always'
                                                        allowsInlineMediaPlayback={true}
                                                        ref={(webView) => { this.webView = webView; }}
                                                        onNavigationStateChange={(navState) => { this.webView.canGoBack = navState.canGoBack; this.setState({ feedUrl: navState.url }); }}

                                                    />
                                                    <View style={{ height: '4.5%' }}>
                                                    </View>
                                                </View>
                                            </View>

                                        )
                                        }





                                        <View style={{ position: 'absolute', flexDirection: 'row', bottom: 0, height: '5%', width: '100%', display: item_main.WebView, backgroundColor: 'white', justifyContent: 'center' }}>

                                            {commons.renderIf(item_main.facebookView == "flex",
                                                <TouchableOpacity onPress={async () => { await this.setState({ feed: item_main.facebookLink, openLink: item_main.facebookLink }); this.resetWebViewToInitialUrl(); }} style={{ flex: 0.1, display: item_main.facebookView, justifyContent: 'center' }}>
                                                    <Image source={require('./assets/icon_circle_facebook.png')} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(item_main.twitterView == "flex",
                                                <TouchableOpacity onPress={async () => { await this.setState({ feed: item_main.twitterLink, openLink: item_main.twitterLink }); this.resetWebViewToInitialUrl(); }} style={{ flex: 0.1, display: item_main.twitterView, justifyContent: 'center' }}>
                                                    <Image source={require('./assets/icon_circle_twitter.png')} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(item_main.instagramView == "flex",
                                                <TouchableOpacity onPress={async () => { this.setState({ feed: item_main.instagramLink, openLink: item_main.instagramLink }); this.resetWebViewToInitialUrl(); }} style={{ flex: 0.1, display: item_main.instagramView, justifyContent: 'center' }}>
                                                    <Image source={require('./assets/icon_circle_instagram.png')} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(item_main.youtubeView == "flex",
                                                <TouchableOpacity onPress={async () => { await this.setState({ feed: item_main.youtubeLink, openLink: item_main.youtubeLink }); this.resetWebViewToInitialUrl(); }} style={{ flex: 0.1, display: item_main.youtubeView, justifyContent: 'center' }}>
                                                    <Image style={{}} source={require('./assets/icon_circle_youtube.png')} />
                                                </TouchableOpacity>)}
                                            {commons.renderIf(item_main.pinterestView == "flex",
                                                <TouchableOpacity onPress={async () => { await this.setState({ feed: item_main.pinterestLink, openLink: item_main.pinterestLink }); this.resetWebViewToInitialUrl(); }} style={{ flex: 0.1, display: item_main.pinterestView, justifyContent: 'center' }}>
                                                    <Image style={{}} source={require('./assets/icon_circle_pinterest.png')} />
                                                </TouchableOpacity>)}




                                        </View>

                                        {commons.renderIf(item_main.websiteView == "flex",
                                            <TouchableOpacity onPress={async () => { this.setState({ feed: item_main.websiteLink, openLink: item_main.websiteLink }); this.resetWebViewToInitialUrl(); }} style={{ display: item_main.websiteView, left: 0, bottom: 0, position: 'absolute', alignSelf: 'center', marginLeft: 2, marginBottom: 3 }}>
                                                <Image style={{}} source={require('./assets/Website.png')} />
                                            </TouchableOpacity>)}

                                        {commons.renderIf(item_main.donateView == "flex",
                                            <TouchableOpacity onPress={async () => { this.setState({ feed: item_main.donateLink, openLink: item_main.donateLink }); this.resetWebViewToInitialUrl(); }} style={{ display: item_main.donateView, right: 0, bottom: 0, position: 'absolute', alignSelf: 'center' }}>
                                                <Image style={{ alignSelf: 'center' }} source={require('./assets/Donate_Button.png')} />
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
