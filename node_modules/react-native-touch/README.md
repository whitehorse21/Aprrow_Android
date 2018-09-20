#react-native-touch

React Native Touch is component for React Native. Base from TouchableOpacity. Helps block the touch repeatedly and continuously for a short time. 


### Installation

```bash
$ npm i react-native-touch --save
```

### Properties

### Usage
```javascript
            import Touch from 'react-native-touch';
            
             <Touch
                pointerEvents = {'auto'}
                style={{padding: 10, color: 'red'}}
                activeOpacity={0.7}
                onPress= {this.onPress}
                disabled={false}
            >
                //Your view 
            </Touch>
    
```

#### PropsType

| Prop  | Default | Description |
| :------------ |:---------------:| :-----|
| pointerEvents | 'auto' |  enum('box-none', 'none', 'box-only', 'auto')  http://facebook.github.io/react-native/releases/0.48/docs/viewproptypes.html#pointerevents  |
| style | {}  | Style |
| activeOpacity | 0.2  | Determines what the opacity of the wrapped view should be when touch is active |
| onPress | undefined | Function when user press |
| disabled | false | true: disabled press |
| timeout | 1500 | miliseconds of block touch |

