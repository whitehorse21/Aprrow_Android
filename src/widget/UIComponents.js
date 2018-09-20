import React from 'react';
import {
    Dimensions, Text, View, TouchableOpacity, Platform
} from 'react-native';
import Modal from 'react-native-modal';
import SortableList from 'react-native-sortable-list';

exports.renderOrganize = function (showorganiser,orders,items,o) {
    debugger;
    return (
        <Modal
            isVisible={showorganiser}
            style={{ flex: 1 }}
            swipeDirection="right"
            animationIn="fadeIn"
            animationOut="fadeOut">
            <View style={[styles.container, { borderRadius: 3 }]}>
                <View style={{ backgroundColor: "#006BBD", height: '10%', width: '100%', alignItems: "center", justifyContent: "center" }}>
                    <Text allowFontScaling={false} style={[styles.title, { color: "white", fontFamily: 'Roboto-Bold' }]}>Organize</Text>
                </View>
                <SortableList
                    onChangeOrder={(nexorder) => this.change_stqx_order(nexorder)}
                    order={orders}
                    rowActivationTime={150}
                    style={[styles.list]}
                    contentContainerStyle={styles.contentContainer}
                    data={items}
                    renderRow={o} />
                <TouchableOpacity onPress={() => this.savestaxorder()} style={{ backgroundColor: "#006BBD", height: 36, width: '35%', alignItems: "center", marginBottom: 8, borderRadius: 3 }}>
                    <Text allowFontScaling={false} style={{ fontSize: 18, paddingTop: 5, color: "white" }}>Done</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

var styles = {
    wrapper: {
    },
    slide1: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent'
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