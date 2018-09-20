'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context, callback) 
{

console.log("Request received:\n", JSON.stringify(event));
console.log("Context received:\n", JSON.stringify(context));

const operation =event.operation;
const payload = {};
const searchload = {};
const returndata = {};

         searchload.TableName = event.TableName;
            var key = {'eulaId': {'S':event.eulaId}};
         searchload.Key = key;

switch (operation) {
    case 'CreateNewEula':
        
         payload.TableName =event.TableName;
     var insertItem={
                    "eulaText": {
                        "S": event.eulaText
                    },
                     "eulaId": {
                        "S": event.eulaId
                    }
                };
             
          payload.Item = insertItem;
         
          dynamodb.getItem(searchload, function(err, data) {
                if (err) 
                {
                    returndata.status = "503"
                    returndata.messageText = "Service Unavailable"
                    context.fail(new Error(returndata.status + " " + returndata.messageText));
                } 
                else 
                {
                    if(data.Item)
                    {                                           
                        returndata.status = "400"
                        returndata.messageText = "Username already exists";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                    }
                    else {
                         dynamodb.putItem(payload, function(err, data) {
                            if (err) 
                            {
                             context.fail('ERROR: Dynamo failed: ' + err);
                            } 
                            else 
                            {
                                console.log('Dynamo Success: ' + JSON.stringify(data, null, '  '));
                                context.succeed('SUCCESS');
                             }
                         });
                    }
                }
         });
       break;
         case 'updateEulaText':
               payload.TableName =event.TableName;
               var updateItem={
                    "eulaText": {
                        "S": event.eulaText
                    },
                     "eulaId": {
                        "S": event.eulaId
                    }
                };
             
             payload.Item = updateItem;
             dynamodb.putItem(payload, function(err, data) {
                            if (err) 
                            {
                             context.fail('ERROR: Dynamo failed: ' + err);
                            } 
                            else 
                            {
                                console.log('Data successfully updated.');
                                context.succeed('SUCCESS');
                             }
                         });
        break;
         case 'getEulatext':
            searchload.TableName = event.TableName;
            var key = {'eulaId': {'S':event.eulaId}};
             searchload.Key = key;
             
            dynamodb.getItem(searchload, function(err, data) {
                if (err) 
                {
                    returndata.status = "503"
                    returndata.messageText = "Service Unavailable"
                    context.fail(new Error(returndata.status + " " + returndata.messageText));
                } 
                else 
                {
                    if(data.Item)
                    {  
                     data.status='SUCCESS';
                     context.succeed(JSON.stringify(data));
                    }
                }
         });
       break;
        default:
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
}