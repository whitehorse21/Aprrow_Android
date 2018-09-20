
import React from 'react';
import {
    Dimensions, Platform, Text, View, TouchableOpacity,Image,TextInput,FlatList
} from 'react-native';
import Modal from 'react-native-modal';
const window = Dimensions.get('window');
import commons from '../commons';
module.exports = {

    serach_widget_gotoindex (p,tg_index) {
        var curr_index = p.state.curindex;
        var curwidgetlist = p.state.widget_search_source;
        for (var i = 0; i < curwidgetlist.length; i++)
            curwidgetlist[i].render = true;

        p.setState({ showsearchdialogue: false, widget_search_source: curwidgetlist, searchtext: "" })
        p.refs.slidermain.scrollBy(tg_index - curr_index);
    },
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.showsearchdialogue}
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={{ backgroundColor: "white", alignItems: "center", flex: 1 }}>
                <View style={{ backgroundColor: "#006BBD", height: '13%', width: '100%', alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                    <TouchableOpacity style={{ marginLeft: 10, marginRight: 5 }} onPress={() => {
                        var curwidgetlist = p.state.widget_search_source;
                        for (var i = 0; i < curwidgetlist.length; i++)
                            curwidgetlist[i].render = true;

                        p.setState({ showsearchdialogue: false, widget_search_source: curwidgetlist, searchtext: "" })
                    }}>
                        <Image style={{ marginLeft: 5 }} source={require("../assets/icon_back_white.png")} />
                    </TouchableOpacity>
                    <TextInput
                        style={{ width: "75%", borderWidth: 0, color: "white", fontSize: 14, marginLeft: 10, fontFamily: 'Roboto' }}
                        placeholder="Search STAX"
                        allowFontScaling={false}
                        value={p.state.searchtext}
                        autoCapitalize="none"
                        placeholderTextColor="#CBCBCB"
                        underlineColorAndroid="#CBCBCB"
                        onChangeText={(value) => p.search(value)} />
                    <TouchableOpacity style={{ marginLeft: 10, marginRight: 5 }} onPress={() => {
                        var curwidgetlist = p.state.widget_search_source;
                        for (var i = 0; i < curwidgetlist.length; i++)
                            curwidgetlist[i].render = true;

                        p.setState({ widget_search_source: curwidgetlist, searchtext: "" })
                    }}>
                        <Image source={require("../assets/icon_close_white_21px.png")} />
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 15, marginLeft: 20, flex: 1 }}>
                    <FlatList style={{ flex: 1 }}
                        data={p.state.widget_search_source}
                        extraData={p.state}
                        renderItem={({ item }) =>
                            commons.renderIf(item.render,
                                <View>
                                    <TouchableOpacity onPress={() => serach_widget_gotoindex(p,item.index)} style={{ flexDirection: "column", marginTop: 15, marginLeft: 10 }}>
                                        <Text allowFontScaling={false} style={{ fontSize: 16, color: "black", fontWeight: "200" }}>{item.widgetname}</Text>
                                        <Image style={{ marginTop: 12 }} source={require('../assets/line_popup_228.png')} />
                                    </TouchableOpacity>
                                </View>)
                        } />
                </View>
            </View>
        </Modal>);
    }
};
