import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    device_head: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20
    },
    device_text: {
        color: "#b2babb",
        fontWeight: "500"
    },
    device_manage: {
        justifyContent: 'center',
        alignItems: 'center',


    },
    device_approw_text: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginTop: 10,
        marginBottom: '5%'

    },
    dialog_text: {
        fontSize: 19,
        color: "#1569C7"
    },
    dialog_textinput: {
        padding: 5,
        height: 40,
        borderWidth: 1,
        borderColor: "#0065B2",
        marginTop: 10,

    },
    dialog_btn_cancel: {
        color: "#b2babb",
        marginRight: 50
    },
    dialog_btn_ok: {
        color: "#1569C7",
        marginLeft: 50
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)'

    }
});