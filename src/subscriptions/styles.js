export const styles = {
    // App container
    container: {
        flex: 1,                            // Take up all screen
        backgroundColor: '#ffffff',         // Darker background for content area
        // backgroundColor: '#E9163',         // Background color
    },
    // Tab content container
    content: {
        flex: 1,                            // Take up all available space
        justifyContent: 'center',           // Center vertically
        alignItems: 'center',               // Center horizontally
        backgroundColor: '#ffffff',         // Darker background for content area
    },
    // Content header
    header: {
        margin: 10,                         // Add margin
        color: '#2c66b7',                   // White color
        fontFamily: 'Avenir',               // Change font family
        fontSize: 26,                       // Bigger font size
    },
    // Content text
    text: {
        marginHorizontal: 20,               // Add horizontal margin
        color: 'rgba(255, 255, 255, 0.75)', // Semi-transparent text
        textAlign: 'center',                // Center
        fontFamily: 'Avenir',
        fontSize: 18,
    },
    box_view_sortby: {
        flex: 1,
        flexDirection: 'row',

        // textAlign: 'left',
        paddingLeft: 36,
        alignItems: 'center',
        paddingBottom: 20         // Center horizontally

    },
    dropdown_2_dropdown:
    {
        //   color: 'green',
        //  fontSize: 15
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)'
    },
    dialog_text1: {
        paddingLeft: 20,
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: '#006BBC'
    },
    dialog_text2: {
        paddingLeft: 20,
        fontSize: 12,
        fontFamily: 'Roboto-Bold',
        color: '#a4abb5'
    },
    dialog_text3: {

        fontSize: 13,
        fontFamily: 'Roboto-Bold',
        color: '#006BBC'
    },
    dialog_text4: {
        paddingLeft: 20,
        fontSize: 11,
        fontFamily: 'Roboto',
        //fontWeight: 'bold', 
        color: '#212326'
    },
    dialog_text5: {
        paddingLeft: 5,
        fontSize: 11,
        fontFamily: 'Roboto',
        //fontWeight: 'bold', 
        color: '#212326'
    }
}

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
        fontFamily: 'Roboto',
        color: "#1569C7"
    },
    dialog_textinput: {
        padding: 5,
        height: 40,
        borderWidth: 1,
        borderColor: "#1569C7",
        marginTop: 10,
    }
};