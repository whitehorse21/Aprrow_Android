import LocalizedStrings from 'react-native-localization';
var lang=require("./en.json");
let Strings = new LocalizedStrings(lang);
//Strings.setLanguage('ml');

module.exports = Strings;