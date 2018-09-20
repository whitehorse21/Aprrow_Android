import React from 'react';
import {
    WebView, Dimensions, Text, Image, View, FlatList, TouchableOpacity, ImageBackground
} from 'react-native';
import widgets_style from '../styles/widgets_style';
import Swiper from 'react-native-swiper';
import commons from '../commons';

import { styles } from './index.style'

var Mixpanel = require('react-native-mixpanel');
var AWSConfig = require("../config/AWSConfig.json");
var uiHelper = require('./ui.helper');


module.exports = {
    renderDialog: (p) => {
        return (<Swiper style={{ flex: 1 }} ref={"slidermain"} removeClippedSubviews={false} index={p.state.widget_index} showsPagination={false} showsButtons={p.state.Swiperbutton} prevButton={<Image style={{ width: 15, height: 30 }} source={require("../assets/arrow_left.png")} />} nextButton={<Image style={{ width: 15, height: 30 }} source={require("../assets/arrow_right.png")} />} loop={false} containerStyle={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }} onIndexChanged={(index) => p._indexChange(index)}>

            {p.state.widgetdata.map((item_main, key) => {
                return (<View style={styles.slide1} key={key}>
                    <View style={[widgets_style.box_view, { backgroundColor: item_main.backgroundcolor }]}>
                        <View style={[widgets_style.box_view_bar, { backgroundColor: item_main.headercolor, justifyContent: "space-between" }]}>
                            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                                <View style={{ width: '10%' }}>
                                    <Image style={widgets_style.box_view_bar_icon} source={require("../assets/sharp-logo_square_orange.png")} />
                                </View>
                                <View style={{ width: '75%' }}>
                                    <Text allowFontScaling={false} style={widgets_style.box_view_bar_text}>{item_main.widgetname}</Text>
                                </View>
                                <TouchableOpacity style={{ width: '15%', alignSelf: 'center' }} onPress={async () => {
                                    try {
                                        var MixPanl_tocken = AWSConfig.mixpanel_token;
                                        Mixpanel.default.sharedInstanceWithToken(MixPanl_tocken).then(() => {
                                            Mixpanel.default.track("Stax Fullscreen");
                                        });
                                    }
                                    catch (err) {
                                    }
                                    var feed = p.state.feedUrl;
                                    uiHelper.resetWebViewToInitialUrl(p);
                                    navigate("widgetFullScreen", { "widgetdata": p.state.widgetdata, "feed": feed, "openLink": feed, "index": p.state.curindex, scrollto: p.scrollto.bind(p) });
                                } }>
                                    <Image style={[widgets_style.box_view_bar_icon, { height: 15, width: 15, marginLeft: '55%' }]} source={require("../assets/icon_fullscreen_white.png")} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {commons.renderIf(item_main.WebView == 'none', <ImageBackground style={{ width: '100%', height: '100%', flex: 1 }} source={{ uri: item_main.backgroundpicture }} imageStyle={{ resizeMode: 'cover' }}>
                            <FlatList style={{ flex: 1 }} data={item_main.applist} extraData={item_main} renderItem={({ item }) => <TouchableOpacity onPress={() => p.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .5 : .25, marginLeft: item.key % 2 == 0 && item_main.mostusedwidget == 2 ? '-22%' : 0, marginRight: item.key % 2 != 0 && item_main.mostusedwidget == 2 ? '-22%' : 0 }}>
                                <View key={item.key}>
                                    <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                    <Text allowFontScaling={false} style={{ marginTop: 1, marginLeft: 2, width: 60, fontFamily: 'Roboto', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }}>{item.appname}</Text>
                                </View>
                            </TouchableOpacity>} numColumns={item_main.mostusedwidget == 2 ? 2 : 4} /></ImageBackground>)}
                        {commons.renderIf(item_main.WebView == 'flex' && item_main.mostusedwidget == 2 && p.state.appState == 'active', <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
                            <View style={{ width: '100%', height: p.state.FlatViewHeight }}>
                                <ImageBackground style={{ width: '100%', height: '100%' }} source={{ uri: item_main.backgroundpicture }} imageStyle={{ resizeMode: 'cover' }}>
                                    <FlatList style={{ flex: 1 }} data={item_main.applist} extraData={item_main} renderItem={({ item }) => <TouchableOpacity onPress={() => p.luanchapp(item.package)} style={{ flexDirection: 'column', marginTop: '6%', alignItems: 'center', flex: item_main.mostusedwidget == 2 ? .18 : .09 }}>
                                        <View key={item.key}>
                                            <Image style={{ alignSelf: "center", width: 50, height: 50 }} source={{ uri: item.icon }} />
                                            <Text allowFontScaling={false} style={{ marginTop: 1, marginLeft: 2, width: 60, fontFamily: 'Roboto', fontSize: 12, textAlign: 'center', color: item_main.fontcolor }}>{item.appname}</Text>
                                        </View>
                                    </TouchableOpacity>} numColumns={item_main.mostusedwidget == 2 ? 2 : 4} />
                                </ImageBackground>
                            </View>
                            <View style={{ width: '100%', height: p.state.WebViewHeight }}>
                                <TouchableOpacity style={{ alignSelf: 'center', display: p.state.expandFeed }} onPress={async () => {
                                    await p.setState({ WebViewHeight: '95%', FlatViewHeight: '0%', expandFeed: 'none', compressFeed: 'flex' });
                                } }>
                                    <Image style={{}} source={require("../assets/icon_expand_less_black.png")} />
                                </TouchableOpacity>
                                <TouchableOpacity style={{ alignSelf: 'center', display: p.state.compressFeed }} onPress={async () => {
                                    await p.setState({ WebViewHeight: '48%', FlatViewHeight: '47%', expandFeed: 'flex', compressFeed: 'none' });
                                } }>
                                    <Image style={{}} source={require("../assets/icon_expand_more_black.png")} />
                                </TouchableOpacity>
                                <WebView key={p.state.key} source={{ uri: p.state.feed }} style={{ flex: 1, display: item_main.WebView, justifyContent: 'center' }} scalesPageToFit={true} bounces={false} scrollEnabled={false} javaScriptEnabled={true} domStorageEnabled={true} mixedContentMode='always' ref={(webView) => { p.webView = webView; } } onNavigationStateChange={(navState) => { p.webView.canGoBack = navState.canGoBack; p.setState({ feedUrl: navState.url }); } } />
                                <View style={{ height: '7%' }} />
                            </View>
                        </View>)}
                        <View style={{ position: 'absolute', flexDirection: 'row', bottom: 0, height: '8%', width: '100%', display: item_main.WebView, backgroundColor: 'white', justifyContent: 'center' }}>
                            {commons.renderIf(item_main.facebookView == "flex", uiHelper.renderOpenLink(p, require('../assets/icon_circle_facebook.png'), item_main.facebookLink, item_main.facebookView))}
                            {commons.renderIf(item_main.twitterView == "flex", uiHelper.renderOpenLink(p, require('../assets/icon_circle_twitter.png'), item_main.twitterLink, item_main.twitterView))}
                            {commons.renderIf(item_main.instagramView == "flex", uiHelper.renderOpenLink(p, require('../assets/icon_circle_instagram.png'), item_main.instagramLink, item_main.instagramView))}
                            {commons.renderIf(item_main.youtubeView == "flex", uiHelper.renderOpenLink(p, require('../assets/icon_circle_youtube.png'), item_main.youtubeLink, item_main.youtubeView))}
                            {commons.renderIf(item_main.pinterestView == "flex", uiHelper.renderOpenLink(p, require('../assets/icon_circle_pinterest.png'), item_main.pinterestLink, item_main.pinterestView))}
                        </View>

                        {commons.renderIf(item_main.websiteView == "flex", <TouchableOpacity onPress={async () => {
                            await p.setState({ feed: item_main.websiteLink, openLink: item_main.websiteLink });
                            uiHelper.resetWebViewToInitialUrl(p);
                        } } style={{ display: item_main.websiteView, left: 0, bottom: 0, position: 'absolute', marginLeft: 2, marginBottom: 3 }}>
                            <Image style={{}} source={require('../assets/Website.png')} />
                        </TouchableOpacity>)}
                        {commons.renderIf(item_main.donateView == "flex", <TouchableOpacity onPress={async () => {
                            await p.setState({ feed: item_main.donateLink, openLink: item_main.donateLink });
                            uiHelper.resetWebViewToInitialUrl(p);
                        } } style={{ display: item_main.donateView, right: 0, bottom: 0, position: 'absolute', marginRight: 3 }}>
                            <Image style={{}} source={require('../assets/Donate_Button.png')} />
                        </TouchableOpacity>)}
                    </View>
                </View>);
            })}
        </Swiper>);
    }
}