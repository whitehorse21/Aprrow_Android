'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();


exports.handler = function (event, context, callback) {

  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  const payload = {};
  const searchload = {};
  const returndata = {};


  const appStatisticsTable = "AppStatistics";

  const apppayload = {};
  const appsearchload = {};
  const appListFromMob = event.appstatistics.appdata;
  var appListFromDDb = [];
  var newDevid = event.appstatistics.deviceid;

  apppayload.TableName = appStatisticsTable;
  appsearchload.TableName = appStatisticsTable;
  var key = { 'username': { 'S': event.username } };
  appsearchload.Key = key;

  dynamodb.getItem(appsearchload, function (err, data) {
    if (err) {
      returndata.status = "503"
      returndata.messageText = "Service Unavailable"
      context.fail(new Error(returndata.status + " " + returndata.messageText));
    }
    else {
      if (data.Item) {
        apppayload.Item = data.Item;
        var appStaArray = apppayload.Item.devicestatistics.L;

      }
      else {
        apppayload.Item = { "devicestatistics": { "L": [{ "M": { "deviceid": { "S": "" + event.appstatistics.deviceid }, "appdata": { "L": [] } } }] }, "username": { "S": "" + event.username } };
      }
      var divFlag = 0;
      var divCount = 0
      appListFromDDb = apppayload.Item.devicestatistics.L;
      for (var i = 0; i < appListFromDDb.length; i++) {
        if (newDevid == appListFromDDb[i].M.deviceid.S) {
          divFlag = 1;
          divCount = i;
          break;
        }
      }
      if (divFlag == 0) {
        appListFromDDb.push({ "M": { "deviceid": { "S": "" + newDevid }, "appdata": { "L": [] } } });
        divCount = appListFromDDb.length - 1;
      }
      for (var appk = 0; appk < appListFromMob.length; appk++) {
        var appObj = {
          "M": {
            "packagename": {
              "S": "" + appListFromMob[appk].packagename
            },
            "totalusetime": {
              "S": "" + appListFromMob[appk].totalusetime
            },
            "lastused": {
              "S": "" + appListFromMob[appk].lastused
            },
            "createtime": {
              "S": "" + appListFromMob[appk].createtime
            },
            "installedon": {
              "S": "" + appListFromMob[appk].installedon
            },
            "lasusedloaction": {
              "S": "" + appListFromMob[appk].lasusedloaction
            }
          }
        };
        appListFromDDb[divCount].M.appdata.L.push(appObj);
      }
      apppayload.Item.devicestatistics.L = appListFromDDb;
      dynamodb.putItem(apppayload, function (err, data) {
        if (err) {
          context.fail('ERROR: Dynamo failed: ' + err);
        }
        else {
          console.log('App  Success: ' + JSON.stringify(data, null, '  '));
          // returndata.appStatus='SUCCESS';
          context.succeed('APP SUCCESS');
        }
      });
    }
  });
}