import { PixelRatio } from 'react-native';

export const styles = {
    container: {
        width: '100%',
        height: '70%',
        backgroundColor: "white"
    },
    avatarContainer: {
        borderColor: '#9B9B9B',
        borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150
    },
    outerCircle: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonStyle: {
        color: 'red',
        marginTop: 20,
        padding: 20,
        backgroundColor: 'green'
    },
    photoTextStyle: {
        color: "#006BBC",
        fontSize: 14,
        fontFamily: 'Roboto-Bold',
        marginLeft: 10
    },
    headStyle: {
        color: "#2699FB",
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        marginTop: 29
    },
    textInputStyle: {
        padding: 5,
        height: 45,
        borderWidth: 1,
        marginTop: 4,
        fontFamily: 'Roboto',
        borderRadius: 0
    },
    textInputStylewithborderColor: {
        height: 45,
        borderWidth: 1,
        marginTop: 4,
        borderRadius: 0,
        borderColor: 'gray'
    },
    dropdownStyle: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dropdownText: {
        color: 'black',
    },
    warningText:
    {
        color: "red",
        fontSize: 10,
        fontFamily: 'Roboto-Bold',
        marginTop: 4,
        marginLeft: 12
    }
}