import React, { Component } from 'react';
import {
  StyleSheet,         // CSS-like styles
  Text,               // Renders text
  TouchableOpacity,   // Pressable container
  View                // Container component
} from 'react-native';
var Mixpanel = require('react-native-mixpanel');
var aws_data11 = require("./../config/AWSConfig.json");
export default class Tabs extends Component {
  // Initialize State
  state = {
    // First tab is active by default
    activeTab: 0
  }
/** 
  * (Trigger the track event of mixpanel)
  * @param  :event     
  * @return :nil
  * @created by    :dhi
  * @modified by   :dhi
  * @modified date :05/09/18
*/   
  async mixpanelTrack(events)
  {
    try{
         var Mixpannel_tocken=aws_data11.mixpanel_token;
         Mixpanel.default.sharedInstanceWithToken(Mixpannel_tocken).then(() => {
             Mixpanel.default.track(events);
             });
       }catch(err){
       }
   }
  async setVal()
  {
    await this.setState({activeTab:1});
  }
  // Pull children out of props passed from App component
  render({ children } = this.props) {
    return (
      <View style={styles.container}>
        {/* Tabs row */}
        <View style={styles.tabsContainer}>
          {
            /* Pull props out of children, and pull title out of props */}
          {children.map(({ props: { title } }, index) =>
            <TouchableOpacity
              style={[
                // Default style for every tab
                styles.tabContainer,
                // Merge default style with styles.tabContainerActive for active tab
                index === this.state.activeTab ? styles.tabContainerActive : []
              ]}
              // Change active tab
              onPress={() => {this.setState({ activeTab: index });this.mixpanelTrack(title)}}
              // Required key prop for components generated returned by map iterator
              key={index}
            >
              <Text allowFontScaling={false} style={styles.tabText}>
                {title}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Content */}
        <View style={styles.contentContainer}>
          {children[this.state.activeTab]}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  // Component container
  container: {
    flex: 1,
    backgroundColor: "#006BBD" 
                            // Take up all available space
  },
  // Tabs row container
  tabsContainer: {
    flexDirection: 'row',               // Arrange tabs in a row
    paddingTop: 5,                     // Top padding
  },
  // Individual tab container
  tabContainer: {
    flex: 1,                            // Take up equal amount of space for each tab
    paddingVertical: 15,                // Vertical padding
    borderBottomWidth: 3,               // Add thick border at the bottom
    borderBottomColor: "#006BBD",
  },
  // Active tab container
  tabContainerActive: {
    borderBottomColor: '#FFFFFF',       // White bottom border for active tabs
  },
  // Tab text
  tabText: {
    color: 'white',
    fontFamily:'Roboto-Bold',
    textAlign: 'center',
  },
  inactabText: {
    color: '#2699FB',
    fontFamily:'Roboto-Bold',
    textAlign: 'center',
  },
  // Content container
  contentContainer: {
    flex: 1                             // Take up all available space
  }
});