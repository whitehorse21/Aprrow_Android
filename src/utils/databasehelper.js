import commons from '../commons.js';
var SQLite = require("react-native-sqlite-storage");
var sqllit_Data = require("./sqllit.json");

const databasehelper = {

    /***user account operations ****/


    /**
     * account schema
     * CREATE TABLE `account` (
        `id`	INTEGER,
        `username`	TEXT,
        `firstname`	TEXT,
        `lastname`	TEXT,
        `eulaid`	TEXT,
        `accountid`	TEXT,
        'loginfrom' TEXT,
        'email' TEXT,
        PRIMARY KEY(`id`)
    );
     */

    //insert user details
    insertuser(dataObj) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql('Delete from account', []);
                    tx.executeSql("insert into account(firstname,lastname,username,eulaid,loginfrom,email,createtime) values " +
                        "(?,?,?,?,?,?,?)", [dataObj.firstname+"", dataObj.lastname+"", dataObj.username+"", dataObj.eulaid+"", dataObj.loginfrom+"", dataObj.email+"", dataObj.createtime], (tx, results) => {
                            if (typeof (results.insertId) == 'number') {
                                resolve({ results });
                            }
                            else {
                                console.error('transaction error: ', JSON.stringify(results));
                            }

                        });
                }, null, (err) => {
                    console.error('transaction error: ', err.message);
                });
        });
        db.close();
    },
    //get user details
    getuser() {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("select firstname,lastname,username,eulaid,loginfrom,email from account", [], (tx, results) => {


                        var res = [];
                        let len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            var rowObj = {};
                            rowObj.firstname = row.firstname;
                            rowObj.lastname = row.lastname;
                            rowObj.username = row.email;
                            rowObj.eulaid = row.eulaid;
                            //console.log("row.email====>>"+row.email); 
                            //alert("row.email====>>"+row.email);                                                
                            if (row.email == "" || row.email == undefined || row.email == 'undefined')
                                rowObj.username = rowObj.firstname + " " + rowObj.lastname;

                            // console.log("rowObj.username====>>"+JSON.stringify(rowObj)); 
                            //alert("rowObj.username====>>"+JSON.stringify(rowObj)); 

                            res.push(rowObj);
                        }

                        resolve({ res });


                    });
                }, null, null);
        });

        db.close();
    },

    /**profile operations */

    /**profile schema
     * 
     * CREATE TABLE `profile` (
    `id`	INTEGER,
    `firstname`	TEXT,
    `lastname`	TEXT,
    `Telephone' TEXT, 
    `city`	TEXT,
    `state` TEXT,
    `country`	TEXT,
    `age`	TEXT,
    `gender`	TEXT,
    `profession`	TEXT,
    `industry`	TEXT,
    `hobby`	TEXT,
    PRIMARY KEY(`id`)
);
     * 
     */
    insertprofile(dataObj) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        // console.log("dataObj===>>"+JSON.stringify(dataObj));
        return new Promise((resolve, reject) => {

            db.transaction(
                tx => {
                    var Telephone = '';
                    var City = '';                    
                    var State = '';
                    var Country = '';
                    var Age = '';
                    var Genre = '';
                    var Profession = '';
                    var Industry = '';
                    var Hobby = '';
                    var customQuestions = '';
                    var username="";
                   
                    if (dataObj.username != undefined && dataObj.username != 'undefined') username = dataObj.username;
                    if (dataObj.Telephone != undefined && dataObj.Telephone != 'undefined') Telephone = dataObj.Telephone;
                    if (dataObj.City != undefined && dataObj.City != 'undefined') City = dataObj.City;
                    if (dataObj.State != undefined && dataObj.State != 'undefined') State = dataObj.State;
                    if (dataObj.Country != undefined && dataObj.Country != 'undefined') Country = dataObj.Country;
                    if (dataObj.Age != undefined && dataObj.Age != 'undefined') Age = dataObj.Age;
                    if (dataObj.Genre != undefined && dataObj.Genre != 'undefined') Genre = dataObj.Genre;
                    if (dataObj.Profession != undefined && dataObj.Profession != 'undefined') Profession = dataObj.Profession;
                    if (dataObj.Industry != undefined && dataObj.Industry != 'undefined') Industry = dataObj.Industry;
                    if (dataObj.Hobby != undefined && dataObj.Hobby != 'undefined') Hobby = dataObj.Hobby;
                    if (dataObj.customQuestions != undefined && dataObj.customQuestions != 'undefined') customQuestions = dataObj.customQuestions;

                    tx.executeSql('Delete from profile', []);
                    tx.executeSql("insert into profile(createtime,username,firstname,lastname,Telephone,city,state," +
                        "country,age,gender,profession,industry,hobby,customQuestions) values " +
                        "(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
                        /*"'"+dataObj.State+"',"+
                        "'"+dataObj.Country+"',"+
                        "'"+dataObj.Age+"',"+
                        "'"+dataObj.Genre+"',"+
                        "'"+dataObj.Profession+"',"+
                        "'"+dataObj.Industry+"',"+                        
                        "'"+dataObj.Hobby+"')"*/
                        , [dataObj.createtime, username+"", dataObj.firstname+"", dataObj.lastname+"", Telephone+"",City+"", State+"", Country+"", Age+"", Genre+"", Profession+"", Industry+"", Hobby+"", customQuestions+""], (tx, results) => {

                            if (typeof (results.insertId) == 'number') {
                                resolve({ results });
                            }
                            else {
                                console.error('transaction error: ', JSON.stringify(results));
                            }

                        });
                }, null, (err) => {
                    console.error('transaction error: ', err.message);
                });
        });
        db.close();
    },
    insertProfileImage(dataObj) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    // alert("insert into profileimage(profileimage,username) values ('"+dataObj.profileimage+"','"+dataObj.username+"')"); 
                    tx.executeSql('Delete from profileimage', []);
                    tx.executeSql("insert into profileimage(profileimage,username,createtime) values " +
                        "('" + dataObj.profileimage + "','" + dataObj.username + "','" + dataObj.createtime + "')", [], (tx, results) => {

                            // alert("profileimage results===>>>>"+JSON.stringify(results));
                            if (typeof (results.insertId) == 'number') {
                                resolve({ results });
                            }
                            else {
                                console.error('transaction error: ', JSON.stringify(results));
                            }
                        });
                }, null, (err) => {
                    console.error('transaction error: ', err.message);
                });
        });
        db.close();
    },

    updateprofile(dataObj) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {

            db.transaction(
                tx => {

                    tx.executeSql(" UPDATE profile set " +
                        "firstname=?,lastname=? ,Telephone=?,city=?,state=?,country=?,age=?,gender=? ,profession=?,industry=?,createtime=?,customQuestions=?,hobby=?;", [dataObj.FirstName, dataObj.LastName, dataObj.Telephone,  dataObj.City,dataObj.State, dataObj.Country, dataObj.Age, dataObj.Genre, dataObj.Profession, dataObj.Industry, dataObj.createtime, dataObj.customQuestions, dataObj.Hobby], (tx, results) => {


                            if (results.rowsAffected > 0) {
                                resolve({ results });
                            }
                            /*    else
                                 {                           
                                    console.error('transaction error: ', JSON.stringify(results));
                                 }*/

                        });
                }, null, (err) => {
                    console.error('transaction error: ', err.message);
                });
        });
        db.close();
    },
    updateProfileImage(dataObj) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("UPDATE profileimage set " +
                        " profileimage='" + dataObj.profileimage + "'," +
                        " createtime='" + dataObj.createtime + "'" +
                        " ;", [], (tx, results) => {
                            //  alert("imagesaveed===>"+JSON.stringify(results))
                            if (results.rowsAffected > 0) {
                                resolve({ results });
                            }
                            else {
                                console.error('transaction error: ', JSON.stringify(results));
                            }
                        });
                }, null, (err) => {
                    console.error('transaction error: ', err.message);
                });
        });
        db.close();
    },

    getProfile(username) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("select firstname,lastname,Telephone,city,state,country,age,gender,profession,industry,hobby,username,customQuestions from profile ", [], (tx, results) => {

                        var res = [];
                        let len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            var rowObj = {};
                            rowObj.FirstName = row.firstname;
                            rowObj.LastName = row.lastname;
                            rowObj.Telephone = row.Telephone;
                            rowObj.City = row.city;
                            rowObj.State = row.state;
                            rowObj.Country = row.country;
                            rowObj.Age = row.age;
                            rowObj.Genre = row.gender;
                            rowObj.Profession = row.profession;
                            rowObj.Industry = row.industry;
                            rowObj.Hobby = row.hobby;
                            rowObj.customQuestions = row.customQuestions;
                            rowObj.username = row.username;

                            res.push(rowObj);
                        }
                        // alert("done==>>>"+JSON.stringify(res));
                        resolve({ res });
                    });
                }, null, null);
        });

        db.close();
    },

    getProfileImage(username) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var res = [];
                    var rowObj = {};
                    rowObj.profileimage = '0';
                    tx.executeSql("select profileimage from profileimage ", [], (tx, results) => {
                        //   alert("<<<<<<<results===>>"+JSON.stringify(results));


                        let len = results.rows.length;


                        if (len > 0) {
                            rowObj.profileimage = results.rows.item(0).profileimage;
                            /* for (let i = 0; i < len; i++) 
                             {
                                 let row = results.rows.item(i);
                                 var rowObj={};                              
                                 rowObj.profileimage=row.profileimage;                                
 
                                 res.push(rowObj);
                             }   */
                            // alert("done==>>>"+JSON.stringify(res));
                        }
                        res.push(rowObj);
                        // alert("#####========>>>"+JSON.stringify(rowObj));
                        resolve({ res });
                    });
                }, null, null);
        });

        db.close();
    },

    //insert profile
    //get profile 
    //update profile


    /**device operations */

    /**device schema
     * CREATE TABLE `device` (
        `id`	INTEGER,
        `deviceid`	TEXT,
        `device_hardid`	TEXT,
        `devicename`	TEXT,
        `deleteflag`	TEXT,
        `createtime`	TEXT,
        `updatetime`	TEXT,
        `device_model`  TEXT,
        `device_type`	TEXT,
        `device_platform`	TEXT
        PRIMARY KEY(`id`)
    );
     */



    //bulk insert device
    //bulk insert device
    //insert device
    insertdevice(device, device_id, time, hardid, model, device_type, device_platform) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("insert into device(deviceid,devicename,deleteflag,createtime,device_hardid,device_model,device_type,device_platform) values (?,?,?,?,?,?,?,?)", [device_id+"", device+"", '0', time, hardid+"", model+"", device_type+"", device_platform+""], (tx, results) => {

                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },
    //get device
    getdevice(id) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM device WHERE device_hardid='" + id + "' AND deleteflag='0'", [], (tx, results) => {

                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            var dataObj = {};
                            dataObj.devicename = row.devicename;
                            dataObj.deviceid = row.deviceid;
                            dataObj.devicehardid = row.devicehardid;
                            dataObj.devicemodel = row.device_model;
                            dataObj.device_type = row.device_type;
                            dataObj.device_platform = row.device_platform;
                            dataArray.push(dataObj);


                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },



    getAlldevice() {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM device WHERE deleteflag=?", ['0'], (tx, results) => {

                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.devicename = row.devicename;
                            dataObj.deviceid = row.deviceid;
                            dataObj.devicehardid = row.device_hardid;
                            dataObj.devicemodel = row.device_model;
                            dataObj.device_type = row.device_type;
                            dataObj.device_platform = row.device_platform;
                            dataArray.push(dataObj);


                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },
    getAlldeviceDeletedAlso() {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM device", [], (tx, results) => {

                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.devicename = row.devicename;
                            dataObj.deviceid = row.deviceid;
                            dataObj.devicehardid = row.device_hardid;
                            dataObj.devicemodel = row.device_model;
                            dataObj.createtime = row.createtime;
                            dataObj.device_type = row.device_type;
                            dataObj.device_platform = row.device_platform;
                            dataArray.push(dataObj);


                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },
    //get widget
    getAllwidgetDeletedAlso(deviceid) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM widget WHERE deviceid= " + "'" + deviceid + "'", [], (tx, results) => {


                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            //alert(JSON.stringify(row));
                            // alert(row);
                            //widgetname,widgetid,deleteflag,createtime,applist,deviceid,mostusedwidget
                            var dataObj = {};
                            dataObj.widgetname = row.widgetname;
                            dataObj.widgetid = row.widgetid;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.createtime = row.createtime;
                            dataObj.applist = JSON.parse(row.applist);
                            dataObj.deviceid = row.deviceid;
                            dataObj.mostusedwidget = row.mostusedwidget;
                            dataArray.push(dataObj);
                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },


    //new function to update stax display order
    update_widget_orders(updatewidgetdata) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });


        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {


                    var dataArray = [];
                    if (updatewidgetdata.length > 0) {
                        for (var i = 0; i < updatewidgetdata.length; i++) {
                            var upnewwidgetdata_obj = updatewidgetdata[i];
                            tx.executeSql("UPDATE widget SET displayorder='" + upnewwidgetdata_obj.displayorder + "',createtime='" + upnewwidgetdata_obj.createtime + "' WHERE widgetid='" + upnewwidgetdata_obj.widgetid + "';", [], (tx, results) => {
                                //console.log("update query console==>>>"+results);
                            });
                        }

                    }
                    resolve({ 'status': 'success' });

                }, null, null);
        });


    },


    bulkinsertAndUpdatewidget(widgetdata, updatewidgetdata) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        var query = "insert into widget(widgetname,widgetid,deleteflag,updatetime,createtime,applist,deviceid,mostusedwidget,headercolor,backgroundcolor,transperancy,backgroundpicture,fontcolor,feed,fileid,displayorder) values ";

        //need to fetch most used widget from server
        var parameters = [];
        for (var i = 0; i < widgetdata.length; i++) {

            var widgetdata_obj = widgetdata[i];
            var values_string = "";


            parameters.push(widgetdata_obj.widgetname+"");
            parameters.push(widgetdata_obj.widgetid+"");
            parameters.push(widgetdata_obj.deleteflag+"");
            parameters.push(widgetdata_obj.createtime);
            parameters.push(0);
            parameters.push(JSON.stringify(widgetdata_obj.applist));
            parameters.push(widgetdata_obj.deviceid+"");
            parameters.push(widgetdata_obj.mostusedwidget+"");
            parameters.push(widgetdata_obj.headercolor+"");
            parameters.push(widgetdata_obj.backgroundcolor+"");
            parameters.push(widgetdata_obj.transperancy+"");
            parameters.push(widgetdata_obj.backgroundpicture+"");
            parameters.push(widgetdata_obj.fontcolor+"");
            parameters.push(JSON.stringify(widgetdata_obj.feed));
            parameters.push(widgetdata_obj.fileid+"");
            parameters.push(widgetdata_obj.displayorder+"");

            

            if (i != widgetdata.length - 1) {
                values_string = " (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),";
            }
            else {
                values_string = " (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            }
            query += values_string;
        }

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {


                    var dataArray = [];
                    if (updatewidgetdata.length > 0) {
                        for (var i = 0; i < updatewidgetdata.length; i++) {
                            var upnewwidgetdata_obj = updatewidgetdata[i];
                            console.log("executing query new ");
                           
                            tx.executeSql("UPDATE widget SET widgetname=?,createtime='0',updatetime='" + upnewwidgetdata_obj.createtime + "',deleteflag='" + upnewwidgetdata_obj.deleteflag + "',applist='" + JSON.stringify(upnewwidgetdata_obj.applist) + "',headercolor='" + upnewwidgetdata_obj.headercolor + "',backgroundcolor='" + upnewwidgetdata_obj.backgroundcolor + "',transperancy='" + upnewwidgetdata_obj.transperancy + "',backgroundpicture='" + upnewwidgetdata_obj.backgroundpicture + "',fontcolor='" + upnewwidgetdata_obj.fontcolor+ "',displayorder='" + upnewwidgetdata_obj.displayorder+"',fileid='" + upnewwidgetdata_obj.fileid + "',feed='"+JSON.stringify(upnewwidgetdata_obj.feed)+"' WHERE widgetid='" + upnewwidgetdata_obj.widgetid + "';", [upnewwidgetdata_obj.widgetname], (tx, results) => {
                                console.log("update query console==>>>" + results);
                            });
                         }

                    }
                    if (widgetdata.length > 0) {
                        tx.executeSql(query, parameters, (tx, results) => {
                            resolve({ results });
                        });
                    }
                    else {
                        resolve({ 'status': 'success' });
                    }
                }, null, null);
        });

        db.close();

    },
    //get devices last updatetime

    maxDeviceUpdatetime() {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataObj = {};
                    dataObj["updatetime"] = "0";
                    tx.executeSql("SELECT MAX(updatetime) as updatetime FROM device;", [], (tx, results) => {

                        console.log("results.rows====>>>>>" + JSON.stringify(results.rows));
                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(0);
                            dataObj["updatetime"] = row.updatetime;
                        }

                        resolve(dataObj);
                    });
                }, null, null);
        });
        db.close();
    },
    //get last widget updatetime

    maxwidgetUpdatetime(deviceid) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataObj = {};
                    dataObj["updatetime"] = "0";
                    tx.executeSql("SELECT MAX(updatetime) as updatetime FROM widget WHERE deviceid='" + deviceid + "';", [], (tx, results) => {

                        console.log("results.rows====>>>>>" + JSON.stringify(results.rows));
                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(0);
                            dataObj["updatetime"] = row.updatetime;
                        }

                        resolve(dataObj);
                    });
                }, null, null);
        });
        db.close();
    },


    //update device
    updatedevice(device, deviceid, time) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("UPDATE device SET devicename=?,createtime=? WHERE deviceid=?;", [device, time, deviceid], (tx, results) => {
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    //delete device
    deletedevice(deviceid, time) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql("UPDATE device SET deleteflag='1',createtime='" + time + "' WHERE deviceid='" + deviceid + "'", [], (tx, results) => {
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    /**widget operations */
    /**
    * widget schema
 CREATE TABLE `widget` (
	`id`	INTEGER,
	`widgetname`	TEXT,
	`widgetid`	TEXT,
	`applist`	TEXT,
	`deviceid`	TEXT,
	`createtime`	TEXT,
	`updatetime`	TEXT,
	`deleteflag`	TEXT,
	`mostusedwidget`	TEXT,
	`headercolor`	TEXT,
	`backgroundcolor`	TEXT,
	`transperancy`	TEXT,
	`backgroundpicture`	TEXT,
	`displayorder`	TEXT,
	`fontcolor`	TEXT,
    `fileid`	TEXT,
    `feed`	TEXT,   
	PRIMARY KEY(`id`)
);
);**/


    //bulk insert widget

    //insert widget
    insertwidget(widgetid, widgetname, applist, createtime, ismostusedwidget, deviceid) {
        // alert("here");


        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    let query = "insert into widget(widgetname,widgetid,deleteflag,createtime,applist,deviceid,mostusedwidget,displayorder) values (?,?,?,?,?,?,?,?)"
                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [widgetname+"", widgetid+"", '0', createtime, applist, deviceid+"", ismostusedwidget+"", createtime], (tx, results) => {
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    //insert widget
    shareinsertwidget(widgetdata) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        var query = "insert into widget(widgetname,widgetid,deleteflag,createtime,applist,deviceid,mostusedwidget,headercolor,backgroundcolor,transperancy,fontcolor,backgroundpicture,displayorder,fileid,feed) values ";
        var parameters = [];
       // alert(JSON.stringify(widgetdata));
        //need to fetch most used widget from server
        for (var i = 0; i < widgetdata.length; i++) {
            var widgetdata_obj = widgetdata[i];
            

           

            if (!widgetdata_obj.hasOwnProperty("fileid") || widgetdata_obj.fileid == null)
                widgetdata_obj.fileid = "";

           

            var values_string = "";
            parameters.push(widgetdata_obj.widgetname+"");
            parameters.push(widgetdata_obj.widgetid+"");
            parameters.push(widgetdata_obj.deleteflag+"");
            parameters.push(widgetdata_obj.createtime);
            parameters.push(JSON.stringify(widgetdata_obj.applist));
            parameters.push(widgetdata_obj.deviceid+"");
            parameters.push(widgetdata_obj.mostusedwidget+"");
            parameters.push(widgetdata_obj.headercolor+"");
            parameters.push(widgetdata_obj.backgroundcolor+"");
            parameters.push(widgetdata_obj.transperancy+"");
            parameters.push(widgetdata_obj.fontcolor+"");
            parameters.push(widgetdata_obj.backgroundpicture+"");
            parameters.push(widgetdata_obj.createtime);
            parameters.push(widgetdata_obj.fileid+"");
            parameters.push(JSON.stringify(widgetdata_obj.feed)+"");



            if (i != widgetdata.length - 1)
                values_string = " (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?),";

            else
                values_string = " (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

            query += values_string;
        }


   


        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql(query, parameters, (tx, results) => {

                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    //get widget
    getwidget(widgetid) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM widget WHERE widgetid= " + "'" + widgetid + "'", [], (tx, results) => {


                        let row = results.rows.item(0);
                        
                        var dataObj = {};
                        dataObj.widgetname = row.widgetname;
                        dataObj.widgetid = row.widgetid;
                        dataObj.deleteflag = row.deleteflag;
                        dataObj.createtime = row.createtime;
                        dataObj.applist = JSON.parse(row.applist);
                        dataObj.deviceid = row.deviceid;
                        dataObj.mostusedwidget = row.mostusedwidget;

                        dataObj.headercolor = row.headercolor;
                        dataObj.backgroundcolor = row.backgroundcolor;
                        dataObj.transperancy = row.transperancy;
                        dataObj.backgroundpicture = row.backgroundpicture;
                        dataObj.fontcolor = row.fontcolor;
                        dataObj.fileid = row.fileid;



                        //  alert("bg>>>>>>>"+JSON.stringify(dataObj));

                        resolve({ dataObj });
                    });
                }, null, null);
        });

        db.close();

    },
    //get All widget
    getAllwidget(id) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            db.transaction(
                tx => {
                    var dataArray = [];

                    tx.executeSql("SELECT * FROM widget WHERE deleteflag='0' AND deviceid='" + id + "' order by displayorder+1", [], (tx, results) => {
                        var len = results.rows.length;

                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.widgetname = row.widgetname;
                            dataObj.widgetid = row.widgetid;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.createtime = row.createtime;
                            dataObj.applist = JSON.parse(row.applist);
                            dataObj.deviceid = row.deviceid;
                            dataObj.mostusedwidget = row.mostusedwidget;

                            //widget theme
                            dataObj.headercolor = row.headercolor;
                            dataObj.backgroundcolor = row.backgroundcolor;
                            dataObj.transperancy = row.transperancy;
                            dataObj.backgroundpicture = row.backgroundpicture;
                            dataObj.fontcolor = row.fontcolor;
                            dataObj.fileid = row.fileid;                         
                           
                            if(commons.isJsonstring(row.feed))
                            {
                                dataObj.feed =JSON.parse(row.feed);
                            }else {
                                dataObj.feed=[];
                            }

                            dataArray.push(dataObj);
                        }
                        // alert(JSON.stringify(dataArray));
                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },


    getwidget_count_in_device(id) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            db.transaction(
                tx => {
                    var dataArray = [];

                    tx.executeSql("SELECT count(id) as `count` FROM widget WHERE deleteflag='0' AND deviceid='" + id + "' ", [], (tx, results) => {

                        var count = 0;
                        var len = results.rows.length;
                        if (len > 0)
                            count = results.rows.item(0).count
                        resolve({ count });
                    });
                }, null, null);
        });

        db.close();

    },



    //GetAllWidgetShare

    getAllwidgetShare(id) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        var query = "SELECT * FROM widget WHERE deleteflag='0' AND widgetid IN (" + id + ")";
        // alert(">>>>>>>>>>>"+query);
        return new Promise((resolve, reject) => {

            db.transaction(
                tx => {
                    var dataArray = [];

                    tx.executeSql(query, [], (tx, results) => {
                        var len = results.rows.length;
                        // alert(len);
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.widgetname = row.widgetname;
                            dataObj.widgetid = row.widgetid;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.createtime = row.createtime;
                            dataObj.applist = JSON.parse(row.applist);
                            dataObj.deviceid = row.deviceid;
                            dataObj.mostusedwidget = row.mostusedwidget;

                            //widget theme
                            dataObj.headercolor = row.headercolor;
                            dataObj.backgroundcolor = row.backgroundcolor;
                            dataObj.transperancy = row.transperancy;
                            dataObj.backgroundpicture = row.backgroundpicture;
                            dataObj.fontcolor = row.fontcolor;
                            dataObj.fileid =row.fileid

                            //alert(commons.isJsonstring(row.feed)+">>>>>>>feed val"+row.feed+"tst>>"+commons.isJsonstring(JSON.stringify([])));
                            if(commons.isJsonstring(row.feed))
                            {
                                dataObj.feed =JSON.parse(row.feed);
                            }else {
                                dataObj.feed=[];
                            }


                            dataArray.push(dataObj);
                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },
    //MostFrequent Widget
    getMostFrequentwidget(id) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];

                    tx.executeSql("SELECT * FROM widget WHERE mostusedwidget=0 AND deleteflag='0' AND deviceid='" + id + "'", [], (tx, results) => {
                        
                        var len = results.rows.length;

                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.widgetname = row.widgetname;
                            dataObj.widgetid = row.widgetid;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.createtime = row.createtime;
                            dataObj.applist = JSON.parse(row.applist);
                            dataObj.deviceid = row.deviceid;
                            dataObj.mostusedwidget = row.mostusedwidget;
                            
                            //widget theme
                            dataObj.headercolor = row.headercolor;
                            dataObj.backgroundcolor = row.backgroundcolor;
                            dataObj.transperancy = row.transperancy;
                            dataObj.backgroundpicture = row.backgroundpicture;
                            dataObj.fontcolor = row.fontcolor;


                            dataArray.push(dataObj);
                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },



    //update widget
    updatewidget_applist(widgetid, applist, createtime) {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    let query = "update widget set applist='" + applist + "', createtime = '" + createtime + "' WHERE widgetid= " + "'" + widgetid + "'";
                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [], (tx, results) => {
                        //  alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    //rename widget
    updatewidget_rename(widgetid, widgetname, createtime) {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    let query = "update widget set widgetname=?, createtime = '" + createtime + "' WHERE widgetid='" + widgetid + "'";

                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [widgetname], (tx, results) => {
                        //  alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },

    //updatewidget theme
    updatewidget_theme(widgetid, headercolor, backgroundcolor, trnsperancyvalue, widgetbackgroundpic, fontcolor, createtime, fileid) {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    widgetid = "'" + widgetid + "'";
                    headercolor = "'" + headercolor + "'";
                    backgroundcolor = "'" + backgroundcolor + "'";
                    trnsperancyvalue = "'" + trnsperancyvalue + "'";
                    widgetbackgroundpic = "'" + widgetbackgroundpic + "'";
                    createtime = "'" + createtime + "'";
                    fontcolor = "'" + fontcolor + "'";
                    fileid = "'" + fileid + "'";



                    let query = "update widget set headercolor=" + headercolor + ", createtime = " + createtime + ",backgroundcolor=" + backgroundcolor
                        + ",transperancy=" + trnsperancyvalue + ",backgroundpicture=" + widgetbackgroundpic + ",fontcolor=" + fontcolor + ",fileid=" + fileid + " WHERE widgetid= " + widgetid;
                    //  alert("querygenerated>>>> " + query);
                    tx.executeSql(query, [], (tx, results) => {
                        //   alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },











    //delete widget
    updatewidget_delete(widgetid, createtime) {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    let query = "update widget set deleteflag='1', createtime ='" + createtime + "' WHERE widgetid= '" + widgetid + "'";
                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [], (tx, results) => {
                        // alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    hard_widget_delete() {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    let query = "Delete from widget";
                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [], (tx, results) => {
                        // alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    //get all widgets

    //delete widget



    /**sync table operations */


    /**
     * sync table schema
     * CREATE TABLE `synctable` (
      `id`	INTEGER,
      `name`	TEXT,
      `synctime`	TEXT,
      PRIMARY KEY(`id`)
  );
     * 
     */

    //intialise synctime
    //update synctime
    updatesynctime(sysnctime) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            var synctime = "";
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT synctime FROM synctable WHERE name='all'", [], (tx, results) => {

                        if (results.rows.length > 0) {
                            let row = results.rows.item(0);
                            synctime = row.synctime;
                        }

                        if (synctime == null || synctime == undefined || synctime == "") {

                            let query = "insert into synctable (synctime,name) values ('" + sysnctime + "','all')"
                            tx.executeSql(query, [], (tx, results) => {
                                resolve(results);
                            });
                        }
                        else {
                            let query = "update synctable set synctime = '" + sysnctime + "' where name= 'all'"
                            tx.executeSql(query, [], (tx, results) => {
                                resolve(results);
                            });
                        }

                    });



                }, null, null);
        });

        db.close();
    },

    //get synctime
    getsynctime() {


        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            var synctime = "0";
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT synctime FROM synctable WHERE name='all'", [], (tx, results) => {
                        //alert("here");
                        if (results.rows.length > 0) {
                            let row = results.rows.item(0);
                            synctime = row.synctime;

                            if (synctime == null || synctime == undefined || synctime == "")
                                synctime = "0";
                        }

                        resolve({ synctime });
                    });
                }, null, null);

        });

        db.close();

    },




    //read data for syncing

    //widget data

    //get widget to sync
    getwidget_tosync(lastsync_time) {
        // alert("intial");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            var widgetdata = [];

            db.transaction(

                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM widget WHERE createtime > " + lastsync_time, [], (tx, results) => {
                        //  alert("inside query");

                        let len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            //alert(JSON.stringify(row));
                            // alert(row);
                            //widgetname,widgetid,deleteflag,createtime,applist,deviceid,mostusedwidget
                            var dataObj = {};
                            dataObj.widgetname = row.widgetname;
                            dataObj.widgetid = row.widgetid;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.createtime = row.createtime;
                            dataObj.applist = JSON.parse(row.applist);
                            dataObj.deviceid = row.deviceid;
                            dataObj.mostusedwidget = row.mostusedwidget;



                            //widget theme
                            dataObj.headercolor = row.headercolor;
                            dataObj.backgroundcolor = row.backgroundcolor;
                            dataObj.transperancy = row.transperancy;
                            dataObj.backgroundpicture = row.backgroundpicture;
                            dataObj.fontcolor = row.fontcolor;

                            //widget Display Order
                            dataObj.displayorder = row.displayorder;
                            dataObj.fileid = row.fileid;
                            if(commons.isJsonstring(row.feed))
                            {
                                dataObj.feed =JSON.parse(row.feed);
                            }else {
                                dataObj.feed=[];
                            }





                            dataArray.push(dataObj);

                        }
                        // alert(JSON.stringify(dataArray));
                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },

    //get installed widget ids
    get_installed_widgetids() {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            var widgetid_map = {};
            db.transaction(
                tx => {


                    tx.executeSql("SELECT widgetid FROM widget WHERE deleteflag='0' ", [], (tx, results) => {
                        var len = results.rows.length;
                        // alert(len);
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            widgetid_map[row.widgetid] = row.widgetid;


                        }

                        resolve({ widgetid_map });
                    });
                }, null, null);
        });

        db.close();

    },


    //device data
    getdevice_tosync(synctime) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM device WHERE createtime > " + synctime, [], (tx, results) => {

                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {

                            let row = results.rows.item(i);

                            var dataObj = {};
                            dataObj.devicename = row.devicename;
                            dataObj.deviceid = row.deviceid;
                            dataObj.devicehardwareid = row.device_hardid;
                            dataObj.devicemodel = row.device_model;
                            dataObj.createtime = row.createtime;
                            dataObj.deleteflag = row.deleteflag;
                            dataObj.device_type = row.device_type;
                            dataObj.device_platform = row.device_platform;
                            dataArray.push(dataObj);


                        }

                        resolve({ dataArray });
                    });
                }, null, null);
        });

        db.close();

    },
    bulkinsertAndUpdatedevice(devicedata, updatedevicedata) {


        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        var query = "insert into device(deviceid,devicename,deleteflag,updatetime,createtime,device_hardid,device_model) values ";
        var params = [];
        /*device data format
        "deleteflag": "0",
            "createtime": "20184533233444",
            "devicename": "d1",
            "deviceid": "123",
            "devicehardwareid": "ffrtr2",
            "devicemodel": "ee"    
         */

        for (var i = 0; i < devicedata.length; i++) {
            var devicedata_obj = devicedata[i];
            var values_string = "";

            params.push(devicedata_obj.deviceid+"");
            params.push(devicedata_obj.devicename+"");
            params.push(devicedata_obj.deleteflag+"");
            params.push(devicedata_obj.createtime);
            params.push('0');
            params.push(devicedata_obj.devicehardwareid+"");
            params.push(devicedata_obj.devicemodel+"");



            if (i != devicedata.length - 1)
                values_string = " (?,?,?,?,?,?,?),";
            else
                values_string = " (?,?,?,?,?,?,?)";

            query += values_string;
        }
        /*
            var updatequery="";
             
            for (var i = 0; i < updatedevicedata.length; i++) {
                var updevicedata_obj = updatedevicedata[i];
                updatequery=updatequery+"UPDATE device SET devicename='"+updevicedata_obj.devicename+"',createtime='0',updatetime='"+updevicedata_obj.createtime+"' WHERE deviceid='"+updevicedata_obj.deviceid+"';"
            }*/
        // console.log("<<<<===========updatequery============>>>>"+updatequery);

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {


                    var dataArray = [];
                    if (updatedevicedata.length > 0) {
                        for (var i = 0; i < updatedevicedata.length; i++) {
                            var updevicedata_obj = updatedevicedata[i];
                            tx.executeSql("UPDATE device SET devicename=?,deleteflag=?,createtime='0',updatetime='" + updevicedata_obj.createtime + "' WHERE deviceid='" + updevicedata_obj.deviceid + "';", [updevicedata_obj.devicename,updevicedata_obj.deleteflag+""], (tx, results) => {
                                console.log("update query console==>>>" + results);
                            });
                        }

                    }
                    if (devicedata.length > 0) {
                        tx.executeSql(query, params, (tx, results) => {
                            resolve({ results });
                        });
                    }
                    else {
                        resolve({ 'status': 'success' });
                    }
                }, null, null);
        });

        db.close();

    },

    //bulk insert device,widget,profile
    bulkinsertdevice(devicedata) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        var query = "insert into device(deviceid,devicename,deleteflag,updatetime,createtime,device_hardid,device_model,device_type,device_platform) values ";
        var params = [];

        /*device data format
        "deleteflag": "0",
            "createtime": "20184533233444",
            "devicename": "d1",
            "deviceid": "123",
            "devicehardwareid": "ffrtr2",
            "devicemodel": "ee"    
         */

        for (var i = 0; i < devicedata.length; i++) {
            var devicedata_obj = devicedata[i];
            
            params.push(devicedata_obj.deviceid+"");
            params.push(devicedata_obj.devicename+"");
            params.push(devicedata_obj.deleteflag+"");
            params.push(devicedata_obj.createtime);
            params.push('0');
            params.push(devicedata_obj.devicehardwareid+"");
            params.push(devicedata_obj.devicemodel+"");
            params.push(devicedata_obj.device_type+"");
            params.push(devicedata_obj.device_platform+"");
            
            var values_string = "";
            if (i != devicedata.length - 1)
                values_string = " (?,?,?,?,?,?,?,?,?),";
            else
                values_string = " (?,?,?,?,?,?,?,?,?)";

            query += values_string;
        }




        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    tx.executeSql('Delete from device', []);
                    var dataArray = [];
                    tx.executeSql(query,params, (tx, results) => {
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },

    //bulk insert device,widget,profile
    bulkinsertwidget(widgetdata) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        
        
        var query = "insert into widget(widgetname,widgetid,deleteflag,updatetime,createtime,applist,deviceid,mostusedwidget,headercolor,backgroundcolor,transperancy,backgroundpicture,fontcolor,displayorder,fileid,feed) values ";
        var params=[];

        console.log("size>>>>"+widgetdata.length);
        //need to fetch most used widget from server
        for (var i = 0; i < widgetdata.length; i++) {
            var widgetdata_obj = widgetdata[i];
            
            params.push(widgetdata_obj.widgetname+"");
            params.push(JSON.stringify(widgetdata_obj.applist)+"");
            params.push(JSON.stringify(widgetdata_obj.feed)+"");

            
           // params.push(widgetdata_obj.widgetid+"");
           // params.push(widgetdata_obj.deleteflag+"");
           // params.push(widgetdata_obj.createtime);
            //params.push('0');
           // params.push(JSON.stringify(widgetdata_obj.applist));
           // params.push(widgetdata_obj.deviceid+"" );
            //params.push(widgetdata_obj.mostusedwidget+"");
           // params.push(widgetdata_obj.headercolor+"");
          //  params.push(widgetdata_obj.backgroundcolor+"");
           // params.push(widgetdata_obj.transperancy+"");
           // params.push(widgetdata_obj.backgroundpicture+"");
          //  params.push(widgetdata_obj.fontcolor+"");
          //  params.push(widgetdata_obj.displayorder+"");
           // params.push(widgetdata_obj.fileid+"");
            //params.push(JSON.stringify(widgetdata_obj.feed));
            //widgetdata_obj.applist=[];
          //console.log("applist>>>>"+JSON.stringify(widgetdata_obj.applist));
            

            

            
            var values_string = "";
            if (i != widgetdata.length - 1)
               values_string = " (?,'" + widgetdata_obj.widgetid + "','" + widgetdata_obj.deleteflag + "','" + widgetdata_obj.createtime + "','0',?,'" + widgetdata_obj.deviceid + "','" + widgetdata_obj.mostusedwidget + "','" + widgetdata_obj.headercolor + "','" + widgetdata_obj.backgroundcolor + "','" + widgetdata_obj.transperancy + "','" + widgetdata_obj.backgroundpicture + "','" + widgetdata_obj.fontcolor + "','" + widgetdata_obj.displayorder + "','"+widgetdata_obj.fileid+"',?),"; 
            else
               values_string = " (?,'" + widgetdata_obj.widgetid + "','" + widgetdata_obj.deleteflag + "','" + widgetdata_obj.createtime + "','0',? ,'" + widgetdata_obj.deviceid + "','" + widgetdata_obj.mostusedwidget + "','" + widgetdata_obj.headercolor + "','" + widgetdata_obj.backgroundcolor + "','" + widgetdata_obj.transperancy + "','" + widgetdata_obj.backgroundpicture + "','" + widgetdata_obj.fontcolor + "','" + widgetdata_obj.displayorder + "','"+widgetdata_obj.fileid+"',?)"; 

            query += values_string;
        }



        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    tx.executeSql('Delete from widget', []);
                    var dataArray = [];
                    tx.executeSql(query, params, (tx, results) => {
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();

    },


    AllTableDelete() {
        // alert("here");
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    tx.executeSql('Delete from device', []);
                    tx.executeSql('Delete from widget', []);
                    tx.executeSql('Delete from account', []);
                    tx.executeSql('Delete from profile', []);
                    tx.executeSql('Delete from profileimage', []);
                    tx.executeSql('Delete from synctable', []);
                    tx.executeSql('Delete from filesynctable', []);

                    resolve("done");

                }, null, null);
        });

        db.close();

    },


    //file sync table management
    //schema
    /*CREATE TABLE `filesynctable` (
        `id`	INTEGER,
        `fileid`	TEXT,
        `syncstatus`	TEXT
    );*/

    upsert_fileid(fileid) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            var synctime = "";
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT fileid FROM filesynctable WHERE fileid=" + "'" + fileid + "'", [], (tx, results) => {



                        if (results.rows.length <= 0) {

                            let query = "insert into filesynctable (fileid,syncstatus) values ('" + fileid + "','0')"
                            tx.executeSql(query, [], (tx, results) => {
                                resolve(results);
                            });
                        }
                        else {
                            let query = "update filesynctable set syncstatus ='0' where fileid='" + fileid + "'";
                            tx.executeSql(query, [], (tx, results) => {
                                resolve(results);
                            });
                        }

                    });



                }, null, null);
        });

        db.close();
    },

    //is upload file
    is_need_to_upload_file(fileid) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {

            var synctime = "";
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT fileid FROM widget WHERE deleteflag='0' AND fileid=" + "'" + fileid + "'", [], (tx, results) => {



                        if (results.rows.length > 0) {
                            resolve("1");

                        }
                        else {
                            resolve("0");

                        }

                    });



                }, null, null);
        });

        db.close();
    },









    update_filesync_status(fileid) {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });
        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {

                    let query = "update filesynctable set syncstatus='1' WHERE fileid= '" + fileid + "'";
                    //console.log("querygenerated>>>> "+query);
                    tx.executeSql(query, [], (tx, results) => {
                        // alert("done");
                        resolve({ results });
                    });
                }, null, null);
        });

        db.close();
    },

    getfile_ids_tosync() {
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            db.transaction(
                tx => {
                    var dataArray = [];
                    tx.executeSql("SELECT * FROM filesynctable WHERE syncstatus='0'", [], (tx, results) => {

                        var len = results.rows.length;
                        var fileids = [];
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            fileids.push(row.fileid);
                        }

                        resolve({ fileids });
                    });
                }, null, null);
        });

        db.close();
    },

 //check whether file is uploaded or not
 is_file_uploaded(fileid) {
    var db = SQLite.openDatabase({
        name: sqllit_Data.name,
        createFromLocation: sqllit_Data.createFromLocation
    });

    return new Promise((resolve, reject) => {
        db.transaction(
            tx => {
                var dataArray = [];
                tx.executeSql("SELECT * FROM filesynctable WHERE syncstatus='0' AND fileid= '" + fileid + "'", [], (tx, results) => {

                    var len = results.rows.length;
                    if(len>0)
                      resolve("0");
                    else
                      resolve("1");
                });
            }, null, null);
    });

    db.close();
},




    //get Purchased widget ids
    get_purchased_widgetids(deviceid) {

        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            var widgetid_map = {};
            db.transaction(
                tx => {


                    tx.executeSql("SELECT widgetid FROM widget where deviceid='" + deviceid + "' ", [], (tx, results) => {
                        var len = results.rows.length;
                        // alert(len);
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);

                            widgetid_map[row.widgetid] = row.widgetid;


                        }

                        resolve({ widgetid_map });
                    });
                }, null, null);
        });

        db.close();

    },
    tocheck_stax_installed(stax_id_param) {
        //alert(stax_id_param);
        var db = SQLite.openDatabase({
            name: sqllit_Data.name,
            createFromLocation: sqllit_Data.createFromLocation
        });

        return new Promise((resolve, reject) => {
            var widgetid_map = {};
            db.transaction(
                tx => {


                    tx.executeSql("SELECT deleteflag FROM widget WHERE widgetid='" + stax_id_param + "' ", [], (tx, results) => {
                        var len = results.rows.length;
                        //   alert(len);
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            //  alert(row.deleteflag);
                            widgetid_map[row.deleteflag] = row.deleteflag;


                        }

                        resolve({ widgetid_map });
                    });
                }, null, null);
        });

        db.close();

    }



}

export default databasehelper;