'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
var crypto = require('crypto');
//var cryptoPass =require('crypto-password-helper');
var dynamodb = new AWS.DynamoDB();


exports.handler = function(event, context, callback) 
{
console.log("Request received:\n", JSON.stringify(event));
console.log("Context received:\n", JSON.stringify(context));

const operation =event.operation;
const payload = {};
const searchload = {};
const returndata = {};
var iterations = 1000;

     
          
        

switch (operation) {
    case 'updateProfile':
          
         searchload.TableName = event.TableName;
     var key = {'username': {'S':event.payload.username}};
         searchload.Key = key;
     
         payload.TableName =event.TableName; 
          
           var profDataObj={};
           var profiledata=event.payload.profile;
           var keys = Object.keys(profiledata);
           var profileimageFlag=0;
           for (var x in keys) 
           {
                  var pkey=keys[x];
                   var pvalue=profiledata[pkey];
                  if(pkey=="FirstName")
                  {
                   pkey="firstname";
                  }
                  else if(pkey=="LastName")
                  {
                   pkey="lastname";
                  }
                  else if(pkey=="profileimage")
                  {
                   profileimageFlag=1
                  }
                  
                  if(pvalue!="")
                  {
                    profDataObj[pkey]={"S": ""+pvalue}
                  }
           }
           
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
                         if(profileimageFlag==0)
                          {
                          
                           if(data.Item.profile.M.profileimage!=undefined)
                           { 
                            profDataObj["profileimage"]=data.Item.profile.M.profileimage
                           }
                          }
         
                         payload.Item=data.Item;
                         payload.Item.profile={"M":profDataObj};
                         payload.Item.firstname={"S":profDataObj.firstname.S+""};
                         payload.Item.lastname={"S":profDataObj.lastname.S+""};

                         //console.log("\npayload=====>>"+JSON.stringify(payload));
                         
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
                    else {
                          returndata.status = "400"
                          returndata.messageText = "Service Unavailable";
                          context.fail(new Error(returndata.status + " " + returndata.messageText));
                    }
                }
         });
       break;
       case 'setProfile':
           searchload.TableName = event.TableName;
            var key = {'username': {'S':event.payload.username}};
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
                        context.succeed(data.Item);
                    }
                    else {
                        
                          returndata.status = "400"
                        returndata.messageText = "Service Unavailable";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                        
                         
                    }
                }
         });
       break;
        case 'getDropdownList':
               searchload.TableName = event.TableName;
           var key = {'fieldtype':{'S':'dropdown'}};
               searchload.Key = key;
        dynamodb.getItem()
         console.log("\nsearchload===>>>"+searchload);
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
                        context.succeed(data.Item);
                    }
                    else {
                        
                          returndata.status = "400"
                        returndata.messageText = "Service Unavailable";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                        
                         
                    }
                }
         });
       break;
       case 'getQnList':
               searchload.TableName = event.TableName;
           var key = {'Key':{'S':'Question'}};
               searchload.Key = key;
       
         console.log("\nsearchload===>>>"+JSON.stringify(searchload));
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
                     console.log("data.Item==>>"+JSON.stringify(data.Item));
                     var returnObj=[];
                      if(data.Item.QuestionList.L.length>0)
                      {
                        for(var di=0;di<data.Item.QuestionList.L.length;di++)
                        {
                          var ddbdecObj=data.Item.QuestionList.L[di].M;
                          var divobj={};
                          divobj.DisplayQn=ddbdecObj.DisplayQn.S;
                          divobj.KeyQn=ddbdecObj.KeyQn.S;
                          divobj.orderNo=ddbdecObj.orderNo.S;
                          divobj.QnType=ddbdecObj.QnType.S;
                          divobj.QnDropdownList=[];
                           if(ddbdecObj.QnDropdownList.L.length>0)
                            {
                              for(var i=0;i<ddbdecObj.QnDropdownList.L.length;i++)
                              {
                                divobj.QnDropdownList.push(ddbdecObj.QnDropdownList.L[i].S)
                              }
                            }
                          returnObj.push(divobj);
                        }
                      }
                        context.succeed(returnObj);
                    }
                    else 
                    {
                        returndata.status = "400"
                        returndata.messageText = "Service Unavailable";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                    }
                }
         });
       break;
     case 'changePassword':
      
         payload.TableName =event.TableName; 
         var salt = crypto.randomBytes(256).toString('base64');
         var oldpasswordHash = new Buffer(crypto.pbkdf2Sync(event.payload.CurrentPassword, salt, iterations, 256, 'sha256'), 'binary').toString('base64');
  
     // console.log("oldpasswordHash==>"+oldpasswordHash);
      console.log("\ndata.old.password==>"+oldpasswordHash);
       
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
                       console.log("\ndata.Item.password==>"+data.Item.password.S);
                       crypto.compare(oldpasswordHash, data.Item.password.S).then(isMatch => {
                        if(isMatch) {                                      
                           console.log("Match====>>>>");
                        } else {
                             console.log("Not Match====>>>>");
                        }});
                     // if(data.Item.password.S==oldpasswordHash)
                      //{
                         var passwordHash = new Buffer(crypto.pbkdf2Sync(event.payload.newPassword, salt, iterations, 256, 'sha256'), 'binary').toString('base64');
                         payload.Item=data.Item;
                         payload.Item.password={"S":passwordHash};
                        
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
                  /*   }
                    else {
                        
                          returndata.status = "402"
                        returndata.messageText = "Current Password invalid.";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                    }*/
                  }
                    else {
                        
                          returndata.status = "400"
                        returndata.messageText = "Service Unavailable";
                        context.fail(new Error(returndata.status + " " + returndata.messageText));
                        
                         
                    }
                }
         });
       break;
        
        default:
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
}