import {StyleSheet} from 'react-native';


export default StyleSheet.create({
    header_icon:{
        height:25,
        width:25

    },
    header_title:{
        color:'white',
        fontWeight:'bold',
        fontSize:18,
        marginLeft:10,
        
    },
    bottom_image_view:
    {
        position:'absolute',
        bottom:0,
    },
    bottom_image:{
        height:70,
        width:70,
        alignItems:'center',
        
        

    },box_view:{
        alignItems:'center',
        marginTop:20,
     //  borderRadius:10,
        marginRight:30,
        marginLeft:30,
        height:'80%',
        width:'85%',
        backgroundColor:'white'
    },
    box_view1:{
        alignItems:'center',
        marginTop:10,
    //   borderRadius:20,
        marginRight:30,
        marginLeft:10,
       // height:'80%',
        //width:'68%',
        backgroundColor:'white'
    },
    
    box_view2:{
        alignItems:'flex-end',
        position:'absolute',
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        right:0,
         margin:8,
        marginTop:10,
        marginRight:5,
        height:'73%',
        //width:'50%',
        backgroundColor:'transparent'
    },
   
    box_view2_colapsed:{
        alignItems:'flex-end',
        position:'absolute',
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        right:0,
        marginTop:10,
        marginLeft:15,
        height:'92%',
       // width:"28%",
        backgroundColor:'transparent'
    },
   
   
   
   
    box_view_bar:{
        backgroundColor:'#006BBD',
       // borderTopLeftRadius:10,
      //  borderTopRightRadius:10,
        height:'5%',
        flexDirection:'row',
        width:'100%'

    },
    box_view_bar1:{
        backgroundColor:'#1b4076',
      //  borderTopLeftRadius:10,
     //   borderTopRightRadius:10,
        height:10,
        flexDirection:'row',
        width:'100%'
        

    },
    box_view_bar2:{
        backgroundColor:'#0065B2',
        borderTopLeftRadius:10,
        height:40,
        flexDirection:'row',
        width:150

    },

    box_view_bar2_colapsed:{
        backgroundColor:'#0e6fcb',
        borderTopLeftRadius:10,
        height:40,
        flexDirection:'row',
        width:"20%"

    },

    box_view_bar3:{
        backgroundColor:'#3F97DC',
        height:30,
        flexDirection:'row',
        width:150,
        alignItems:'center',
      //  paddingleft:2
        justifyContent:'center',

    },
    box_view_line:{
        backgroundColor:'black',
        height:1,
        width:150,
    },
    box_view_bar_icon:{
        height:15,
        width:15,
        marginLeft:5,
        
        marginTop:2
    },
    box_view_bar_icon1:{
        height:10,
        width:10,
        marginLeft:10,
        marginTop:15,
        transform: [{ rotate: '180deg'}]
    },
    
    box_view_bar_icon1_colapsed:{
        height:10,
        width:10,
        marginLeft:5,
        marginTop:15
    },
    
    
    
    
    box_view_bar_icon2:{
        height:30,
        width:30,
    },
    box_view_bar_text:{
        marginLeft:10,
        marginTop:2,
        fontWeight:'300',
        color:'white',
        textAlign:'center',
    },
    box_view_bar_text1:{
        marginLeft:10,
        marginTop:10,
        fontFamily:'Roboto-Bold',
        color:'white'
    },

    box_view_bar_text1_colaspsed:{
        marginLeft:10,
        marginTop:10,
        fontFamily:'Roboto-Bold',
        color:'white'
    },
    box_view_bar_sort:{
        marginTop:3,
        fontSize:12,
        fontWeight:'500',
        color:'white'
    },
    box_view_bar_sorticon:{
        height:5,
        width:10,
        marginLeft:3,
        marginTop:10
    }




});