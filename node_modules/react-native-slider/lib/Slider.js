'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _jsxFileName="src/Slider.js";var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _react=require("react");var _react2=_interopRequireDefault(_react);



var _reactNative=require("react-native");









var _propTypes=require("prop-types");var _propTypes2=_interopRequireDefault(_propTypes);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _objectWithoutProperties(obj,keys){var target={};for(var i in obj){if(keys.indexOf(i)>=0)continue;if(!Object.prototype.hasOwnProperty.call(obj,i))continue;target[i]=obj[i];}return target;}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var TRACK_SIZE=4;
var THUMB_SIZE=20;

function Rect(x,y,width,height){
this.x=x;
this.y=y;
this.width=width;
this.height=height;}


Rect.prototype.containsPoint=function(x,y){
return x>=this.x&&
y>=this.y&&
x<=this.x+this.width&&
y<=this.y+this.height;};


var DEFAULT_ANIMATION_CONFIGS={
spring:{
friction:7,
tension:100},

timing:{
duration:150,
easing:_reactNative.Easing.inOut(_reactNative.Easing.ease),
delay:0}};

// decay : { // This has a serious bug
//   velocity     : 1,
//   deceleration : 0.997
// }
var 

Slider=function(_PureComponent){_inherits(Slider,_PureComponent);function Slider(){var _Object$getPrototypeO;var _temp,_this,_ret;_classCallCheck(this,Slider);for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}return _ret=(_temp=(_this=_possibleConstructorReturn(this,(_Object$getPrototypeO=Object.getPrototypeOf(Slider)).call.apply(_Object$getPrototypeO,[this].concat(args))),_this),_this.




































































































































state={
containerSize:{width:0,height:0},
trackSize:{width:0,height:0},
thumbSize:{width:0,height:0},
allMeasured:false,
value:new _reactNative.Animated.Value(_this.props.value)},_this.


















































































































_handleStartShouldSetPanResponder=function(e){
// Should we become active when the user presses down on the thumb?
return _this._thumbHitTest(e);},_this.







_handlePanResponderGrant=function() /*e: Object, gestureState: Object*/{
_this._previousLeft=_this._getThumbLeft(_this._getCurrentValue());
_this._fireChangeEvent('onSlidingStart');},_this.


_handlePanResponderMove=function(e,gestureState){
if(_this.props.disabled){
return;}


_this._setCurrentValue(_this._getValue(gestureState));
_this._fireChangeEvent('onValueChange');},_this.







_handlePanResponderEnd=function(e,gestureState){
if(_this.props.disabled){
return;}


_this._setCurrentValue(_this._getValue(gestureState));
_this._fireChangeEvent('onSlidingComplete');},_this.


_measureContainer=function(x){
_this._handleMeasure('containerSize',x);},_this.


_measureTrack=function(x){
_this._handleMeasure('trackSize',x);},_this.


_measureThumb=function(x){
_this._handleMeasure('thumbSize',x);},_this.


_handleMeasure=function(name,x){var _x$nativeEvent$layout=
x.nativeEvent.layout;var width=_x$nativeEvent$layout.width;var height=_x$nativeEvent$layout.height;
var size={width:width,height:height};

var storeName="_"+name;
var currentSize=_this[storeName];
if(currentSize&&width===currentSize.width&&height===currentSize.height){
return;}

_this[storeName]=size;

if(_this._containerSize&&_this._trackSize&&_this._thumbSize){
_this.setState({
containerSize:_this._containerSize,
trackSize:_this._trackSize,
thumbSize:_this._thumbSize,
allMeasured:true});}},_this.




_getRatio=function(value){
return (value-_this.props.minimumValue)/(_this.props.maximumValue-_this.props.minimumValue);},_this.


_getThumbLeft=function(value){
var ratio=_this._getRatio(value);
return ratio*(_this.state.containerSize.width-_this.state.thumbSize.width);},_this.


_getValue=function(gestureState){
var length=_this.state.containerSize.width-_this.state.thumbSize.width;
var thumbLeft=_this._previousLeft+gestureState.dx;

var ratio=thumbLeft/length;

if(_this.props.step){
return Math.max(_this.props.minimumValue,
Math.min(_this.props.maximumValue,
_this.props.minimumValue+Math.round(ratio*(_this.props.maximumValue-_this.props.minimumValue)/_this.props.step)*_this.props.step));}else 


{
return Math.max(_this.props.minimumValue,
Math.min(_this.props.maximumValue,
ratio*(_this.props.maximumValue-_this.props.minimumValue)+_this.props.minimumValue));}},_this.





_getCurrentValue=function(){
return _this.state.value.__getValue();},_this.


_setCurrentValue=function(value){
_this.state.value.setValue(value);},_this.


_setCurrentValueAnimated=function(value){
var animationType=_this.props.animationType;
var animationConfig=_extends(
{},
DEFAULT_ANIMATION_CONFIGS[animationType],
_this.props.animationConfig,
{toValue:value});


_reactNative.Animated[animationType](_this.state.value,animationConfig).start();},_this.


_fireChangeEvent=function(event){
if(_this.props[event]){
_this.props[event](_this._getCurrentValue());}},_this.



_getTouchOverflowSize=function(){
var state=_this.state;
var props=_this.props;

var size={};
if(state.allMeasured===true){
size.width=Math.max(0,props.thumbTouchSize.width-state.thumbSize.width);
size.height=Math.max(0,props.thumbTouchSize.height-state.containerSize.height);}


return size;},_this.


_getTouchOverflowStyle=function(){var _this$_getTouchOverfl=
_this._getTouchOverflowSize();var width=_this$_getTouchOverfl.width;var height=_this$_getTouchOverfl.height;

var touchOverflowStyle={};
if(width!==undefined&&height!==undefined){
var verticalMargin=-height/2;
touchOverflowStyle.marginTop=verticalMargin;
touchOverflowStyle.marginBottom=verticalMargin;

var horizontalMargin=-width/2;
touchOverflowStyle.marginLeft=horizontalMargin;
touchOverflowStyle.marginRight=horizontalMargin;}


if(_this.props.debugTouchArea===true){
touchOverflowStyle.backgroundColor='orange';
touchOverflowStyle.opacity=0.5;}


return touchOverflowStyle;},_this.


_thumbHitTest=function(e){
var nativeEvent=e.nativeEvent;
var thumbTouchRect=_this._getThumbTouchRect();
return thumbTouchRect.containsPoint(nativeEvent.locationX,nativeEvent.locationY);},_this.


_getThumbTouchRect=function(){
var state=_this.state;
var props=_this.props;
var touchOverflowSize=_this._getTouchOverflowSize();

return new Rect(
touchOverflowSize.width/2+_this._getThumbLeft(_this._getCurrentValue())+(state.thumbSize.width-props.thumbTouchSize.width)/2,
touchOverflowSize.height/2+(state.containerSize.height-props.thumbTouchSize.height)/2,
props.thumbTouchSize.width,
props.thumbTouchSize.height);},_this.



_renderDebugThumbTouchRect=function(thumbLeft){
var thumbTouchRect=_this._getThumbTouchRect();
var positionStyle={
left:thumbLeft,
top:thumbTouchRect.y,
width:thumbTouchRect.width,
height:thumbTouchRect.height};


return (
_react2.default.createElement(_reactNative.Animated.View,{
style:[defaultStyles.debugThumbTouchArea,positionStyle],
pointerEvents:"none",__source:{fileName:_jsxFileName,lineNumber:496}}));},_this.




_renderThumbImage=function(){var 
thumbImage=_this.props.thumbImage;

if(!thumbImage)return;

return _react2.default.createElement(_reactNative.Image,{source:thumbImage,__source:{fileName:_jsxFileName,lineNumber:508}});},_temp),_possibleConstructorReturn(_this,_ret);}_createClass(Slider,[{key:"componentWillMount",value:function componentWillMount(){this._panResponder=_reactNative.PanResponder.create({onStartShouldSetPanResponder:this._handleStartShouldSetPanResponder,onMoveShouldSetPanResponder:this._handleMoveShouldSetPanResponder,onPanResponderGrant:this._handlePanResponderGrant,onPanResponderMove:this._handlePanResponderMove,onPanResponderRelease:this._handlePanResponderEnd,onPanResponderTerminationRequest:this._handlePanResponderRequestEnd,onPanResponderTerminate:this._handlePanResponderEnd});}},{key:"componentWillReceiveProps",value:function componentWillReceiveProps(nextProps){var newValue=nextProps.value;if(this.props.value!==newValue){if(this.props.animateTransitions){this._setCurrentValueAnimated(newValue);}else {this._setCurrentValue(newValue);}}}},{key:"render",value:function render(){var _props=this.props;var minimumValue=_props.minimumValue;var maximumValue=_props.maximumValue;var minimumTrackTintColor=_props.minimumTrackTintColor;var maximumTrackTintColor=_props.maximumTrackTintColor;var thumbTintColor=_props.thumbTintColor;var thumbImage=_props.thumbImage;var styles=_props.styles;var style=_props.style;var trackStyle=_props.trackStyle;var thumbStyle=_props.thumbStyle;var debugTouchArea=_props.debugTouchArea;var other=_objectWithoutProperties(_props,["minimumValue","maximumValue","minimumTrackTintColor","maximumTrackTintColor","thumbTintColor","thumbImage","styles","style","trackStyle","thumbStyle","debugTouchArea"]);var _state=this.state;var value=_state.value;var containerSize=_state.containerSize;var trackSize=_state.trackSize;var thumbSize=_state.thumbSize;var allMeasured=_state.allMeasured;var mainStyles=styles||defaultStyles;var thumbLeft=value.interpolate({inputRange:[minimumValue,maximumValue],outputRange:[0,containerSize.width-thumbSize.width]}); //extrapolate: 'clamp',
var valueVisibleStyle={};if(!allMeasured){valueVisibleStyle.opacity=0;}var minimumTrackStyle=_extends({position:'absolute',width:_reactNative.Animated.add(thumbLeft,thumbSize.width/2),backgroundColor:minimumTrackTintColor},valueVisibleStyle);var touchOverflowStyle=this._getTouchOverflowStyle();return _react2.default.createElement(_reactNative.View,_extends({},other,{style:[mainStyles.container,style],onLayout:this._measureContainer,__source:{fileName:_jsxFileName,lineNumber:255}}),_react2.default.createElement(_reactNative.View,{style:[{backgroundColor:maximumTrackTintColor},mainStyles.track,trackStyle],renderToHardwareTextureAndroid:true,onLayout:this._measureTrack,__source:{fileName:_jsxFileName,lineNumber:256}}),_react2.default.createElement(_reactNative.Animated.View,{renderToHardwareTextureAndroid:true,style:[mainStyles.track,trackStyle,minimumTrackStyle],__source:{fileName:_jsxFileName,lineNumber:260}}),_react2.default.createElement(_reactNative.Animated.View,{onLayout:this._measureThumb,renderToHardwareTextureAndroid:true,style:[{backgroundColor:thumbTintColor},mainStyles.thumb,thumbStyle,_extends({transform:[{translateX:thumbLeft},{translateY:0}]},valueVisibleStyle)],__source:{fileName:_jsxFileName,lineNumber:263}},this._renderThumbImage()),_react2.default.createElement(_reactNative.View,_extends({renderToHardwareTextureAndroid:true,style:[defaultStyles.touchArea,touchOverflowStyle]},this._panResponder.panHandlers,{__source:{fileName:_jsxFileName,lineNumber:280}}),debugTouchArea===true&&this._renderDebugThumbTouchRect(thumbLeft)));}},{key:"_getPropsForComponentUpdate",value:function _getPropsForComponentUpdate(props){var value=props.value;var onValueChange=props.onValueChange;var onSlidingStart=props.onSlidingStart;var onSlidingComplete=props.onSlidingComplete;var style=props.style;var trackStyle=props.trackStyle;var thumbStyle=props.thumbStyle;var otherProps=_objectWithoutProperties(props,["value","onValueChange","onSlidingStart","onSlidingComplete","style","trackStyle","thumbStyle"]);return otherProps;}},{key:"_handleMoveShouldSetPanResponder",value:function _handleMoveShouldSetPanResponder(){ // Should we become active when the user moves a touch over the thumb?
return false;}},{key:"_handlePanResponderRequestEnd",value:function _handlePanResponderRequestEnd(e,gestureState){ // Should we allow another component to take over this pan?
return false;}}]);return Slider;}(_react.PureComponent);Slider.propTypes={ /**
     * Initial value of the slider. The value should be between minimumValue
     * and maximumValue, which default to 0 and 1 respectively.
     * Default value is 0.
     *
     * *This is not a controlled component*, e.g. if you don't update
     * the value, the component won't be reset to its inital value.
     */value:_propTypes2.default.number, /**
     * If true the user won't be able to move the slider.
     * Default value is false.
     */disabled:_propTypes2.default.bool, /**
     * Initial minimum value of the slider. Default value is 0.
     */minimumValue:_propTypes2.default.number, /**
     * Initial maximum value of the slider. Default value is 1.
     */maximumValue:_propTypes2.default.number, /**
     * Step value of the slider. The value should be between 0 and
     * (maximumValue - minimumValue). Default value is 0.
     */step:_propTypes2.default.number, /**
     * The color used for the track to the left of the button. Overrides the
     * default blue gradient image.
     */minimumTrackTintColor:_propTypes2.default.string, /**
     * The color used for the track to the right of the button. Overrides the
     * default blue gradient image.
     */maximumTrackTintColor:_propTypes2.default.string, /**
     * The color used for the thumb.
     */thumbTintColor:_propTypes2.default.string, /**
     * The size of the touch area that allows moving the thumb.
     * The touch area has the same center has the visible thumb.
     * This allows to have a visually small thumb while still allowing the user
     * to move it easily.
     * The default is {width: 40, height: 40}.
     */thumbTouchSize:_propTypes2.default.shape({width:_propTypes2.default.number,height:_propTypes2.default.number}), /**
     * Callback continuously called while the user is dragging the slider.
     */onValueChange:_propTypes2.default.func, /**
     * Callback called when the user starts changing the value (e.g. when
     * the slider is pressed).
     */onSlidingStart:_propTypes2.default.func, /**
     * Callback called when the user finishes changing the value (e.g. when
     * the slider is released).
     */onSlidingComplete:_propTypes2.default.func, /**
     * The style applied to the slider container.
     */style:_reactNative.ViewPropTypes.style, /**
     * The style applied to the track.
     */trackStyle:_reactNative.ViewPropTypes.style, /**
     * The style applied to the thumb.
     */thumbStyle:_reactNative.ViewPropTypes.style, /**
     * Sets an image for the thumb.
     */thumbImage:_reactNative.Image.propTypes.source, /**
     * Set this to true to visually see the thumb touch rect in green.
     */debugTouchArea:_propTypes2.default.bool, /**
     * Set to true to animate values with default 'timing' animation type
     */animateTransitions:_propTypes2.default.bool, /**
     * Custom Animation type. 'spring' or 'timing'.
     */animationType:_propTypes2.default.oneOf(['spring','timing']), /**
     * Used to configure the animation parameters.  These are the same parameters in the Animated library.
     */animationConfig:_propTypes2.default.object};Slider.defaultProps={value:0,minimumValue:0,maximumValue:1,step:0,minimumTrackTintColor:'#3f3f3f',maximumTrackTintColor:'#b3b3b3',thumbTintColor:'#343434',thumbTouchSize:{width:40,height:40},debugTouchArea:false,animationType:'timing'};exports.default=Slider;var defaultStyles=_reactNative.StyleSheet.create({container:{height:40,justifyContent:'center'},track:{height:TRACK_SIZE,borderRadius:TRACK_SIZE/2},thumb:{position:'absolute',width:THUMB_SIZE,height:THUMB_SIZE,borderRadius:THUMB_SIZE/2},touchArea:{position:'absolute',backgroundColor:'transparent',top:0,left:0,right:0,bottom:0},debugThumbTouchArea:{position:'absolute',backgroundColor:'green',opacity:0.5}});