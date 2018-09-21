import { AppRegistry,Text } from 'react-native';
import App from './App';
import { Client, Configuration } from 'bugsnag-react-native';
const configuration = new Configuration(),
      bugsnag = new Client(configuration);
//bugsnag.notify("Test error");
Text.defaultProps.allowFontScaling=false;
AppRegistry.registerComponent('Approw', () => App);
