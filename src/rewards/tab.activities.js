import React from "react";
import { View, Image, Text, FlatList } from "react-native";


module.exports = {
    renderTab: (p) => {
        return (<View title="ACTIVITIES" style={{ flex: 1, backgroundColor: "white" }}>
            <FlatList data={p.state.timeline} style={{ flex: 1, marginTop: 35 }} renderItem={({ item }) => <View style={{ marginLeft: 25, flexDirection: "row" }}>
                <View style={{ flexDirection: "column" }}>
                    <Image style={{ marginLeft: p.getmargin(item.reachednewlevel) }} source={p.getimagefortimeline(item.badge, item.reachednewlevel, false)} />
                    <Image style={{ marginLeft: 21 }} source={p.getimagefortimeline(item.badge, item.reachednewlevel, true)} />
                </View>
                <View style={{ flexDirection: "column", marginLeft: '2%' }}>
                    <Text allowFontScaling={false} style={{ fontSize: item.taskheading.length > 15 ? 17 : 18 }} numberOfLines={2}>{item.taskheading}</Text>
                    <Text allowFontScaling={false}>{item.date}</Text>
                </View>
            </View>}>
            </FlatList>
        </View>);
    }
};