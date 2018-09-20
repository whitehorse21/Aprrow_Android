import React, { Component } from 'react';
import { TouchableOpacity,  } from 'react-native';

export default class Touch extends Component {
    constructor(props){
        super(props);
        this.state= {
            isTouch: true,
        }
    }

    onPress = () => {
        if(this.state.isTouch) this.props.onPress();
        this.setState({isTouch: false})
        setTimeout(()=>{
            this.setState({
                isTouch : true,
            })
        }, this.props.timeout)        
    }
    render() {
        return (
            <TouchableOpacity
                {...this.props}
                pointerEvents = {this.props.pointerEvents}
                style={this.props.style}
                activeOpacity={this.props.activeOpacity}
                onPress= {this.onPress}
                focusedOpacity={this.props.focusedOpacity}
                disabled={this.props.disabled}
            >
                {this.props.children}
            </TouchableOpacity>
        );
    }
}
Touch.defaultProps = {
  timeout : 1500,
  activeOpacity: 0.2,
  disabled: false,
  pointerEvents: 'auto',
}