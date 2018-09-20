import { Image } from 'react-native';

export const styles = {
    outer: {
        flex: 1,
        backgroundColor: "#FFFFFF"
      },
      container1: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        maxHeight: 200,
        marginTop: 10,
        marginLeft: 10
      },
      container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        marginTop: 2,
        marginLeft: 10,
        marginBottom: 1
      },
      viewImage: {
        width: 75,
        height: 75,
        margin: 10,
        resizeMode: Image.resizeMode.stretch
      },
      viewImage1: {
        width: 100,
        height: 150,
        margin: 10,
        resizeMode: Image.resizeMode.stretch
      },
      text: {
        marginLeft: 0,
        marginTop: 2,
        fontSize:16,
        fontFamily:'Roboto-Bold',
        color: "#2699FB",
       
      //  fontFamily:'Roboto'
      },
      text1: {
        marginLeft: 10,
        marginTop: 10,
        color: "#6F9BE1",
        fontSize: 16,
        fontWeight: 'bold',
      },
      text2: {
        marginLeft: 10,
        marginTop: 12,
        fontSize: 14,
        color: "#6F9BE1",
        fontWeight: '500',
      }
};
export const dialogbox = {
    dialog_content: {
      justifyContent: 'center',
      alignItems: 'center'  
    },
    dialog_view:
      {
        margin: 0,
        height: 300
      },
    dialog_view_ti: {
      marginBottom: 25
    },
    dialog_welcome: {
      fontWeight: '500',
      fontSize: 25,
      color: "#F88017",
      marginBottom: 10  
    },
    dialog_text: {
      fontSize: 16,
      color: "#2699FB"
    },
    dialog_textinput: {
      padding: 5,
      height: 40,
      borderWidth: 1,
      borderColor: "#000000",
      marginTop: 10,
    }
  };