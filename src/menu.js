import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';
import databasehelper from './utils/databasehelper.js';

const window = Dimensions.get('window');
const uri = require('./assets/icon_perfil.png');
const firstname = "tom";
const UserName = "tom@gmail.com";
var count = 0;
var st = "none";

const styles = StyleSheet.create({

  menu: {
    flex: 1,
    backgroundColor: 'white',

  },
  avatarContainer: {
    justifyContent: 'center',
    width: window.width,
    height: '20%',
    backgroundColor: '#51A5FF',
    //backgroundcolor:"white",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 24,

  },
  name: {


  },
  item: {
    marginLeft: 10,
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
    paddingTop: 0,
  },
});
async function setprofiledata() {
  var imagereturnD = await databasehelper.getProfileImage();
  var imageData = imagereturnD.res;

  var imageBase64 = imageData[0]["profileimage"];

  if (imageBase64 != '0' && imageBase64 != '' && imageBase64 != null && imageBase64 != 'fgdfhdfhhgfgh') {
    uri = { uri: `data:image/gif;base64,${imageBase64}` };
  }

  var userData = await databasehelper.getuser();
  firstname = "";
  UserName = ";"
  if (userData.res != null && userData.res.length > 0) {
    firstname = userData.res[0].firstname;
    UserName = userData.res[0].username;
  }

  var Ncount = await AsyncStorage.getItem("BadgeNo");
  if (Ncount != null) {
    count = Ncount;
  }
  if (count > 0) {
    st = "flex";
  }
}
export default function Menu({ onItemSelected }) {

  setprofiledata();

  return (
    <View style={styles.menu}>
      <View style={styles.avatarContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: '20%' }}>
            <Image style={[styles.avatar, { alignSelf: 'center' }]} source={uri} />
          </View>
          <View style={{ width: '60%', marginRight: '2%' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '500', textAlign: 'left', fontSize: 16, }}>Hi,{firstname}</Text>
            <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '500', textAlign: 'left' }}>{UserName}</Text>
          </View>
        </View>
      </View>
      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => onItemSelected('Home')}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
            <Image source={require('./assets/icon_home_active_blue_px24.png')} style={{ marginBottom: 1, marginRight: 10 }} />
            <Text style={styles.item}>Home</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onItemSelected('STAX')}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 5, marginBottom: 10 }}>
            <Image source={require('./assets/icon_stax_active_blue_px24.png')} style={{ marginTop: 4, marginBottom: 1, marginRight: 10 }} />
            <Text style={styles.item}>STAX</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onItemSelected('Discover')}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
            <Image source={require('./assets/icon_discover_active_blue_px24.png')} style={{ marginTop: 4, marginBottom: 1, marginRight: 10 }} />
            <Text style={styles.item}>Discover</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onItemSelected('Rewards')}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
            <Image source={require('./assets/icon_rewards_active_blue_px24.png')} style={{ marginTop: 4, marginBottom: 1, marginRight: 10 }} />
            <Text style={styles.item}>Rewards</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onItemSelected('Notifications') }}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
            <Image source={require('./assets/icon_notifications_active_blue_px24.png')} style={{ marginTop: 4, marginBottom: 1, marginRight: 8 }} />
            <View style={{ justifyContent: 'flex-start', borderRadius: 10, marginRight: 10, display: st }}>
              <Text style={{ fontSize: 12, fontWeight: '500' }}>{count}</Text>
            </View>
            <Text style={styles.item}>Notifications</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', bottom: 0 }}>
        <View style={{ width: window.width, height: 1, backgroundColor: 'black' }} />
        <TouchableOpacity onPress={() => onItemSelected('logout')}>
          <View style={{ flexDirection: 'row', marginLeft: 20, marginTop: 5, marginBottom: 10 }}>
            <Image source={require('./assets/ic_exit_to_app_black.png')} style={{ height: 15, width: 15, marginTop: 4, marginBottom: 1, marginRight: 10 }} />
            <Text style={styles.item}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

Menu.propTypes = {
  onItemSelected: PropTypes.func.isRequired,
};