import React, { Component } from 'react';
import { Text, Image, View, KeyboardAvoidingView, Dimensions, TouchableOpacity, TextInput, AsyncStorage,StyleSheet } from 'react-native';
import device_style from '../styles/device.style';
import widgets_style from '../styles/widgets_style';
import { Dialog } from 'react-native-simple-dialogs';
import commons from '../commons';
import uicommons from '../ui.commons';
import databasehelper from '../utils/databasehelper.js';
import ToastExample from '../nativemodules/Toast';
import Loader from '../utils/Loader';
export default class widgets_new extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let title = 'Create new widget';
        let headerStyle = { backgroundColor: '#006BBD' };
        let headerTitleStyle = { color: 'white' };
        let headerTintColor = 'white';
        let headerLeft = uicommons.headerLeft(params.goBack());
        let headerRight = (
            <View style={{ flexDirection: 'row', margin: 10 }}>
                <TouchableOpacity onPress={() => params.back()}>
                    <Image style={{ height: 30, width: 30, marginTop: 1, marginLeft: 5, marginBottom: 1 }} source={require("../assets/icon_expand_close.png")} />
                </TouchableOpacity>
            </View>
        );

        return { title, headerStyle, headerTitleStyle, headerTintColor, headerRight, headerLeft };
    };

    _handleSave = () => {
        alert("Test========>>>" + JSON.stringify(this.state));
    }
    _WidgetRenameenable() {
        this.setState({ dialogWidget_rename: true });
    }
    _dialogWidgetenable = () => {
        this.setState({ dialogWidget_password: true });
    }

    componentDidMount() {
        this.props.navigation.setParams({ _dialogWidgetenable: this._dialogWidgetenable.bind(this) });
        this.props.navigation.setParams({ _WidgetRenameenable: this._WidgetRenameenable.bind(this) });
        this.props.navigation.setParams({ back: this._back_page.bind(this) });
        this.props.navigation.setParams({ goBack: this._prev_page.bind(this) });
        this.MostFrequentWidgetFinder();
    }
    constructor(props) {
        super(props)
        this.state = {
            Widget_name: " ",
            button_disp: 'none',
            loading: false,
            mostFrequent_style: 'flex',
        }
    }
    _back_page() {
        var item = this.props.navigation.state.params.item;
        commons.replaceScreen(this, "widgets", user = { item })
    }
    async create_widgets() {
        this.setState({ dialogWidget_name: false, loading: true });
        var widget_id = await commons.getuuid();
        var time = commons.gettimestamp();
        var widget_name = this.state.Widget_name;
        var deviceid = this.props.navigation.state.params.item.id;

        var applistArr = [];

        var applist = JSON.stringify(applistArr);
        var mostusedwidget = 1;

        if (widget_name.length <= 15 && widget_name.length > 0) {
            var result = await databasehelper.insertwidget(widget_id, widget_name, applist, time, mostusedwidget, deviceid);
            this.setState({ loading: false });
            if (result.results.rowsAffected > 0) {
                this.setState({
                    dialogWidget_name: false,
                    Widget_name: ""
                });
                var item = this.props.navigation.state.params.item;
                commons.replaceScreen(this, "widgetseditor", user = { widget_id, deviceid, item });
            }
            else {
                this.setState({ dialogWidget_name: true });
            }
        } else {
            this.setState({ loading: false });
            this.setState({ dialogWidget_name: true });
        }
    }
    async MostFrequentWidgetFinder() {
        this.setState({ loading: true });
        var currentdevice = this.props.navigation.state.params.item.currentdevice;
        if (currentdevice == 0) {
            this.setState({ mostFrequent_style: 'flex' });
            var device_id = this.props.navigation.state.params.item.id;
            var result = await databasehelper.getMostFrequentwidget(device_id);
            if (result.dataArray.length > 0)
                this.setState({ mostFrequent_style: 'none' });
        }
        else this.setState({ mostFrequent_style: 'none' });
        this.setState({ loading: false });

    }
    async MostFrequentWidget() {

        var enabled_app_usage_permission = await ToastExample.checkappusagepermission()
        if (!enabled_app_usage_permission) {
            ToastExample.askpermission();
            return;
        }
        else {
            this.setState({ loading: true });
            var appsString = await ToastExample.getmostusedapps();
            var apps = JSON.parse(appsString);
            var applists = [];
            this.setState({ loading: false });
            for (let i = 0; i < apps.length; i++) {
                var appobj = apps[i];
                var dbApp = {};
                dbApp["appname"] = appobj.applabel;
                dbApp["package"] = appobj.package;
                applists.push(dbApp);
            }
            this.setState({ loading: true });
            time = commons.gettimestamp();
            var widget_id = await commons.getuuid();
            this.setState({ loading: false });
            this.setState({ loading: true });
            await AsyncStorage.setItem('mostusedwidgetid', widget_id);

            var item = this.props.navigation.state.params.item;
            this.setState({ loading: false });
            commons.replaceScreen(this, "widgets", user = { item })
        }
    }
    _prev_page() {   //alert("back clicked>>>>>>>>>>>");
        var item = this.props.navigation.state.params.item;
        commons.replaceScreen(this, "widgets", user = { item });
    }

    render() {
        const { navigate } = this.props.navigation
        return (
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
                <View style={{ top: 0, marginTop: 0, backgroundColor: 'white', flex: 1 }}>
                    <Loader
                        loading={this.state.loading} />
                    <View style={{ marginLeft: 20, marginTop: 20 }}>
                        <View style={{ margin: 20 }}>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontWeight: 'bold', color: "#f16822" }}>Create Widget</Text>
                            </View>
                            <TouchableOpacity onPress={this.MostFrequentWidget.bind(this)}>
                                <View style={{ flexDirection: 'row', marginBottom: 10, display: this.state.mostFrequent_style }}>
                                    <Image style={widgets_style.header_icon} source={require("../assets/icon_most_frequent.png")} />
                                    <Text style={styles.HeaderTitle}>Most Frequent</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ button_disp: 'flex', dialogWidget_name: true })}>
                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Image style={widgets_style.header_icon} source={require("../assets/icon_customized.png")} />
                                    <Text style={styles.HeaderTitle}>Customized</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate("create", { screen: "create" })}>
                                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                    <Image style={widgets_style.header_icon} source={require("../assets/icon_autocreate.png")} />
                                    <Text style={styles.HeaderTitle}>Auto Create</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ display: this.state.button_disp, bottom: 0, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 0, left: 0, marginBottom: 30 }} />
                </View>
                <Dialog
                    visible={this.state.dialogWidget_name}
                    onTouchOutside={() => this.setState({ dialogWidget_name: false })}
                    animation='fade'>
                    <View >
                        <Text style={[device_style.dialog_text, { marginBottom: 20, fontWeight: '300', textAlign: 'center' }]}>Enter widget name</Text>
                        <TextInput
                            style={device_style.dialog_textinput}
                            value={this.state.Widget_name}
                            underlineColorAndroid="transparent"
                            onChangeText={(Widget_name) => this.setState({ Widget_name })}
                        ></TextInput>
                        <Text style={[device_style.dialog_text, { fontSize: 10 }]}>Max 15 Characters</Text>
                        <View style={[{ flexDirection: 'row', marginTop: 50 }, device_style.device_manage]}>
                            <Text style={device_style.dialog_btn_cancel} onPress={() => { this.setState({ dialogWidget_name: false }) }}>CANCEL</Text>
                            <Text style={device_style.dialog_btn_ok} onPress={this.create_widgets.bind(this)}>OK</Text>
                        </View>
                    </View>
                </Dialog>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    HeaderTitle: { marginLeft: 10, fontWeight: '400', color: '#000000' },
})