import React from 'react';
import {
    Dimensions, Platform, Text, View, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import SortableList from 'react-native-sortable-list';
module.exports = {
    renderDialog: (p) => {
        return (<Modal
            isVisible={p.state.showorganiser}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={[styles.container, { borderRadius: 3 }]}>
                <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center" }}>
                    <Text allowFontScaling={false} style={[styles.title, { color: "white", fontFamily: 'Roboto-Bold' }]}>Organize</Text>
                </View>
                <SortableList
                    onChangeOrder={(nexorder) => p.change_stqx_order(nexorder)}
                    order={p.state.order}
                    rowActivationTime={150}
                    style={[styles.list]}
                    contentContainerStyle={styles.contentContainer}
                    data={p.state.data}
                    renderRow={p._renderRow} />
                <TouchableOpacity onPress={() => p.savestaxorder()} style={{ backgroundColor: "#006BBD", height: 36, width: '35%', alignItems: "center", marginBottom: 8, borderRadius: 3 }}>
                    <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>Done</Text>
                </TouchableOpacity>
            </View>
        </Modal>);
    }
};
var styles = {
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
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

    text: {
        fontSize: 18,
        color: '#222222',
    }
}