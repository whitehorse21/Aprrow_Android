'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
//var crypto = require('crypto');
var dynamodb = new AWS.DynamoDB();
const widgetTable="widgetList";
var documentClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

exports.handler = function(event, context, callback) 
{
 //var iterations = 1000;
console.log("Request received:\n", JSON.stringify(event));
console.log("Context received:\n", JSON.stringify(context));

const operation =event.operation;//'create';
console.log("operation===>>>"+operation);
const payload = {};
const profile={};
const searchload = {};
const returndata = {};
     payload.TableName =event.TableName; // "UserTable";
    //  var salt = crypto.randomBytes(256).toString('base64');
     // var passwordHash = new Buffer(crypto.pbkdf2Sync(event.payload.password, salt, iterations, 256, 'sha256'), 'binary').toString('base64');
      

switch (operation) {
    case 'CreateNewUser':
            var insertItem={
                      "username": {
                        "S": event.payload.username
                       },
                        "firstname": {
                        "S": event.payload.firstname
                       },
                        "lastname": {
                        "S": event.payload.lastname
                       },
                       "eulaid": {
                        "S":event.payload.eulaid
                       },
                       "loginfrom": {
                        "S":"app"
                       },
                       "profile":{
                           "M":{
                           "firstname":{
                               "S":event.payload.firstname
                           },
                           "lastname":{
                               "S":event.payload.lastname
                           }
                        }
                       }
                };
                if(event.payload.federatedId!=undefined && event.payload.federatedId!='undefined')
                {
                  insertItem["federatedId"]={"S": event.payload.federatedId};
                }
                if(event.payload.facebookId!=undefined && event.payload.facebookId!='undefined')
                {
                  insertItem["facebookId"]={"S": event.payload.facebookId};
                }
                if(event.payload.loginfrom!=undefined && event.payload.loginfrom!='undefined')
                {
                  insertItem["loginfrom"]={"S": event.payload.loginfrom};
                }
                
                if(event.payload.email!=undefined && event.payload.email!='undefined')
                {
                   insertItem["email"]={"S": event.payload.email};
                }
                else if(insertItem["loginfrom"]["S"]!="app")
                {
                  insertItem["email"]={"S": event.payload.username};
                }
                 payload.Item = insertItem;
                 
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
                        console.log("insertItem==>>"+insertItem["loginfrom"]["S"]);
                        if(insertItem["loginfrom"]["S"]=="facebook" || insertItem["loginfrom"]["S"]=="google")
                        {
                               var fbpayload={};
                               fbpayload.TableName =event.TableName; 
                               fbpayload.Item=data.Item;
                               fbpayload.Item.firstname={"S":event.payload.firstname+""};
                               fbpayload.Item.lastname={"S":event.payload.lastname+""};
                               
                                dynamodb.putItem(fbpayload, function(err, data) {
                                  if (err) 
                                  {
                                   context.fail('ERROR: Dynamo failed: ' + err);
                                  } 
                                  else 
                                  {
                                      console.log('Dynamo Success: ' + JSON.stringify(data, null, '  '));
                                      context.succeed('Already_exists');
                                   }
                                });
                        }
                        else
                        {
                            returndata.status = "400"
                            returndata.messageText = "Username already exists";
                            context.fail(new Error(returndata.status + " " + returndata.messageText));
                        }
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
         case 'updateUser':
             
             var insertItem={
       
                      "username": {
                        "S": event.payload.username
                       },
                        "firstname": {
                        "S": event.payload.firstname
                       },
                        "lastname": {
                        "S": event.payload.lastname
                       },
                        "eulaid": {
                        "S":event.payload.eulaid
                       },
                       "profile":{
                           "M":{
                           "firstname":{
                               "S":event.payload.firstname
                           },
                           "lastname":{
                               "S":event.payload.lastname
                           }
                        }
                       }
                };
             
          payload.Item = insertItem;
          
         searchload.TableName = event.TableName;
            var key = {'username': {'S':event.payload.username}};
         searchload.Key = key;
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
        case 'getUsernew':
            
             searchload.TableName = event.TableName;
            var key = {'username': {'S':event.username}};
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
                        
                        
                   //  data.status='SUCCESS';
                    // console.log("\n\n\ndata.Item===>>>"+JSON.stringify(data.Item));
                      var returnObj={};
                      returnObj.firstname=data.Item.firstname.S;
                      returnObj.lastname=data.Item.lastname.S;
                      returnObj.eulaid=data.Item.eulaid.S;
                      returnObj.username=data.Item.username.S;
                      returnObj.loginfrom="app";
                      if(data.Item.loginfrom!=undefined && data.Item.loginfrom!='undefined')
                      {
                        returnObj.loginfrom=data.Item.loginfrom.S;
                      }
                      returnObj.email="";
                      if(data.Item.email!=undefined && data.Item.email!='undefined')
                      {
                        returnObj.email=data.Item.email.S;
                      }
                      
                      returnObj.device=[];
                      returnObj.widgets=[];
                      returnObj.profile={};
                           
                     /* returnObj.profile={
                          firstname:data.Item.profile.M.firstname.S,
                          lastname:data.Item.profile.M.lastname.S
                      };*/
                      //------------------------------profile-----------------------
                         var profileObj=data.Item.profile.M;
                         var keys = Object.keys(profileObj);
                         for (var x in keys) 
                         {
                                 var pkey=keys[x];
                                 var pvalue=profileObj[pkey].S;
                                returnObj.profile[pkey]=pvalue
                         }
                        // console.log("returnObj==>>"+JSON.stringify(returnObj));
                      //-------------------------------end profile-------------------------------
                    /*  if(data.Item.profile.M.createtime!=undefined &&data.Item.profile.M.createtime!='undefined')
                      {returnObj.createtime=data.Item.profile.M.createtime.S;}
                     if(data.Item.profile.M.Telephone!=undefined && data.Item.profile.M.Telephone!='undefined')
                         { returnObj.Telephone = data.Item.profile.M.Telephone.S;}
                    if(data.Item.profile.M.State!=undefined && data.Item.profile.M.State!='undefined')
                         { returnObj.State     =data.Item.profile.M.State.S;}
                       if(data.Item.profile.M.Country!=undefined && data.Item.profile.M.Country!='undefined')
                        {  returnObj.Country   =data.Item.profile.M.Country.S;}
                        if(data.Item.profile.M.Age!=undefined && data.Item.profile.M.Age!='undefined')
                          {returnObj.Age       =data.Item.profile.M.Age.S;}
                         if(data.Item.profile.M.Genre!=undefined && data.Item.profile.M.Genre!='undefined')
                          {returnObj.Genre     =data.Item.profile.M.Genre.S;}
                        if(data.Item.profile.M.Profession!=undefined && data.Item.profile.M.Profession!='undefined')
                          {returnObj.Profession=data.Item.profile.M.Profession.S;}
                         if(data.Item.profile.M.Industry!=undefined && data.Item.profile.M.Industry!='undefined')
                          {returnObj.Industry  =data.Item.profile.M.Industry.S;}
                         if(data.Item.profile.M.Hobby!=undefined && data.Item.profile.M.Hobby!='undefined')
                          {returnObj.Hobby     =data.Item.profile.M.Hobby.S;}
                         if(data.Item.profile.M.username!=undefined && data.Item.profile.M.username!='undefined')
                          {returnObj.username  =data.Item.profile.M.username.S;}
                         if(data.Item.profile.M.profileimage!=undefined &&data.Item.profile.M.profileimage!='undefined')
                         {  returnObj.profileimage=data.Item.profile.M.profileimage.S;}
                          */
                       // console.log("\n===returnObj==>>"+JSON.stringify(data.Item));
                       
                       console.log("\n===ddddddd==>>"+data.Item.device);
                     if(data.Item.device!=undefined && data.Item.device!='undefined')
                     {
                      if(data.Item.device.L.length>0)
                      {
                        for(var di=0;di<data.Item.device.L.length;di++)
                        {
                          var ddbdecObj=data.Item.device.L[di].M;
                         if(ddbdecObj.deleteflag.S=="0" ||ddbdecObj.deleteflag.S==0) 
                         {
                          var divobj={};
                          divobj.deleteflag=ddbdecObj.deleteflag.S;
                          divobj.createtime=ddbdecObj.createtime.S;
                          divobj.devicename=ddbdecObj.devicename.S;
                          divobj.deviceid=ddbdecObj.deviceid.S;
                          divobj.devicehardwareid=ddbdecObj.devicehardwareid.S;
                          divobj.devicemodel=ddbdecObj.devicemodel.S;
                          
                          returnObj.device.push(divobj);
                          
                         
                        /*  if(ddbdecObj.widgets.L.length>0)
                          {
                            var widgetArray=ddbdecObj.widgets.L;
                           for(var wi=0;wi<widgetArray.length;wi++)
                            {
                              var ddbwobj=widgetArray[wi].M;
                             if(ddbwobj.deleteflag.S=="0" ||ddbwobj.deleteflag.S==0) 
                             { 
                              var wobj={};
                              console.log(JSON.stringify((ddbwobj)));
                              
                              wobj.deviceid=ddbdecObj.deviceid.S;
                              wobj.deleteflag=ddbwobj.deleteflag.S;
                              wobj.createtime=ddbwobj.createtime.S;
                              wobj.widgetname=ddbwobj.widgetname.S;
                              wobj.widgetid=ddbwobj.widgetid.S;
                              wobj.mostusedwidget=ddbwobj.mostusedwidget.S;
                              
                              wobj.headercolor      ="";
                              wobj.backgroundcolor  ="";
                              wobj.transperancy     ="0";
                              wobj.backgroundpicture="data:image/png;base64";
                              
                              if(ddbwobj.hasOwnProperty("headercolor"))
                                wobj.headercolor=ddbwobj.headercolor.S;
                              
                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                wobj.backgroundcolor=ddbwobj.backgroundcolor.S;
                               
                              if(ddbwobj.hasOwnProperty("transperancy"))
                                 wobj.transperancy=ddbwobj.transperancy.S;
                                
                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                 wobj.backgroundpicture=ddbwobj.backgroundpicture.S;
                              
                              wobj.applist=[];
                              
                              //wobj.applist=ddbwobj.applist.S;
                              if(ddbwobj.applist.L.length>0)
                              {
                               for(var ai=0;ai<ddbwobj.applist.L.length;ai++)
                               {
                                  var ddbappobj=ddbwobj.applist.L[ai].M;
                                  var appobj={};
                                      appobj.package=ddbappobj.package.S;
                                      appobj.appname=ddbappobj.appname.S
                                      wobj.applist.push(appobj);
                               }
                              }
                               returnObj.widgets.push(wobj);
                             }
                            }
                          }
                          */
                           
                         }     
                        }
                         
                      }
                       var params = {
                                TableName: "widgetList",
                                ExpressionAttributeNames:{"#from": "userid"},
                                ExpressionAttributeValues:{":fm":{"S":""+event.username}},
                                FilterExpression: "#from =:fm"
                        };
                   dynamodb.scan(params,function(err, data) {
        				   if (err)
        				   {
        					        context.fail('ERROR: Dynamo failed: ' + err);
        				   } 
        				   else
        				   { 
        				         console.log("\n\n\ndata.Items====>>>"+JSON.stringify());
        				          var widgetArray=data.Items;
                        			   if(widgetArray.length>0)
                                          {
                                           
                                           for(var wi=0;wi<widgetArray.length;wi++)
                                            {
                                              var ddbwobj=widgetArray[wi];
                                             if(ddbwobj.deleteflag.S=="0" ||ddbwobj.deleteflag.S==0) 
                                             { 
                                              var wobj={};
                                              console.log(JSON.stringify((ddbwobj)));
                                              
                                              wobj.deviceid=ddbwobj.deviceid.S;
                                              wobj.deleteflag=ddbwobj.deleteflag.S;
                                              wobj.createtime=ddbwobj.createtime.S;
                                              wobj.widgetname=ddbwobj.widgetname.S;
                                              wobj.widgetid=ddbwobj.widgetid.S;
                                              wobj.mostusedwidget=ddbwobj.mostusedwidget.S;
                                              
                                              wobj.headercolor      ="";
                                              wobj.backgroundcolor  ="";
                                              wobj.transperancy     ="0";
                                              wobj.backgroundpicture="data:image/png;base64";
                                              
                                              if(ddbwobj.hasOwnProperty("headercolor"))
                                                wobj.headercolor=ddbwobj.headercolor.S;
                                              
                                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                                wobj.backgroundcolor=ddbwobj.backgroundcolor.S;
                                               
                                              if(ddbwobj.hasOwnProperty("transperancy"))
                                                 wobj.transperancy=ddbwobj.transperancy.S;
                                                
                                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                                wobj.backgroundpicture=ddbwobj.backgroundpicture.S;
                                              
                                              wobj.applist=[];
                                              
                                              //wobj.applist=ddbwobj.applist.S;
                                              if(ddbwobj.applist.L.length>0)
                                              {
                                               for(var ai=0;ai<ddbwobj.applist.L.length;ai++)
                                               {
                                                  var ddbappobj=ddbwobj.applist.L[ai].M;
                                                  var appobj={};
                                                      appobj.package=ddbappobj.package.S;
                                                      appobj.appname=ddbappobj.appname.S
                                                      wobj.applist.push(appobj);
                                               }
                                              }
                                               returnObj.widgets.push(wobj);
                                             }
                                            }
                                          }
        				       
        				          
                				    console.log("\n\n\ndata=====$$$$$======>>"+JSON.stringify(data));
                                    context.succeed(returnObj);
				           }
			        });
                      //----
                    }
                    else
                    {
                        context.succeed(returnObj);
                    }
                     // JSON.stringify(returnObj);
                      
                      //context.succeed(returnObj);
                    }
                }
         });
       break;
        
        case 'getUser':
            
             searchload.TableName = event.TableName;
            var key = {'username': {'S':event.username}};
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
                        
                        
                   //  data.status='SUCCESS';
                    // console.log("\n\n\ndata.Item===>>>"+JSON.stringify(data.Item));
                      var returnObj={};
                      returnObj.firstname=data.Item.firstname.S;
                      returnObj.lastname=data.Item.lastname.S;
                      returnObj.eulaid=data.Item.eulaid.S;
                      returnObj.username=data.Item.username.S;
                      returnObj.loginfrom="app";
                      if(data.Item.loginfrom!=undefined && data.Item.loginfrom!='undefined')
                      {
                        returnObj.loginfrom=data.Item.loginfrom.S;
                      }
                      returnObj.email="";
                      if(data.Item.email!=undefined && data.Item.email!='undefined')
                      {
                        returnObj.email=data.Item.email.S;
                      }
                      
                      returnObj.device=[];
                      returnObj.widgets=[];
                      returnObj.profile={};
                           
                     /* returnObj.profile={
                          firstname:data.Item.profile.M.firstname.S,
                          lastname:data.Item.profile.M.lastname.S
                      };*/
                      //------------------------------profile-----------------------
                         var profileObj=data.Item.profile.M;
                         var keys = Object.keys(profileObj);
                         for (var x in keys) 
                         {
                                 var pkey=keys[x];
                                 var pvalue=profileObj[pkey].S;
                                returnObj.profile[pkey]=pvalue
                         }
                        // console.log("returnObj==>>"+JSON.stringify(returnObj));
                      //-------------------------------end profile-------------------------------
                    /*  if(data.Item.profile.M.createtime!=undefined &&data.Item.profile.M.createtime!='undefined')
                      {returnObj.createtime=data.Item.profile.M.createtime.S;}
                     if(data.Item.profile.M.Telephone!=undefined && data.Item.profile.M.Telephone!='undefined')
                         { returnObj.Telephone = data.Item.profile.M.Telephone.S;}
                    if(data.Item.profile.M.State!=undefined && data.Item.profile.M.State!='undefined')
                         { returnObj.State     =data.Item.profile.M.State.S;}
                       if(data.Item.profile.M.Country!=undefined && data.Item.profile.M.Country!='undefined')
                        {  returnObj.Country   =data.Item.profile.M.Country.S;}
                        if(data.Item.profile.M.Age!=undefined && data.Item.profile.M.Age!='undefined')
                          {returnObj.Age       =data.Item.profile.M.Age.S;}
                         if(data.Item.profile.M.Genre!=undefined && data.Item.profile.M.Genre!='undefined')
                          {returnObj.Genre     =data.Item.profile.M.Genre.S;}
                        if(data.Item.profile.M.Profession!=undefined && data.Item.profile.M.Profession!='undefined')
                          {returnObj.Profession=data.Item.profile.M.Profession.S;}
                         if(data.Item.profile.M.Industry!=undefined && data.Item.profile.M.Industry!='undefined')
                          {returnObj.Industry  =data.Item.profile.M.Industry.S;}
                         if(data.Item.profile.M.Hobby!=undefined && data.Item.profile.M.Hobby!='undefined')
                          {returnObj.Hobby     =data.Item.profile.M.Hobby.S;}
                         if(data.Item.profile.M.username!=undefined && data.Item.profile.M.username!='undefined')
                          {returnObj.username  =data.Item.profile.M.username.S;}
                         if(data.Item.profile.M.profileimage!=undefined &&data.Item.profile.M.profileimage!='undefined')
                         {  returnObj.profileimage=data.Item.profile.M.profileimage.S;}
                          */
                       // console.log("\n===returnObj==>>"+JSON.stringify(data.Item));
                       
                       console.log("\n===ddddddd==>>"+data.Item.device);
                     if(data.Item.device!=undefined && data.Item.device!='undefined')
                     {
                      if(data.Item.device.L.length>0)
                      {
                        for(var di=0;di<data.Item.device.L.length;di++)
                        {
                          var ddbdecObj=data.Item.device.L[di].M;
                         if(ddbdecObj.deleteflag.S=="0" ||ddbdecObj.deleteflag.S==0) 
                         {
                          var divobj={};
                          divobj.deleteflag=ddbdecObj.deleteflag.S;
                          divobj.createtime=ddbdecObj.createtime.S;
                          divobj.devicename=ddbdecObj.devicename.S;
                          divobj.deviceid=ddbdecObj.deviceid.S;
                          divobj.devicehardwareid=ddbdecObj.devicehardwareid.S;
                          divobj.devicemodel=ddbdecObj.devicemodel.S;
                          
                          returnObj.device.push(divobj);
                          
                         
                        /*  if(ddbdecObj.widgets.L.length>0)
                          {
                            var widgetArray=ddbdecObj.widgets.L;
                           for(var wi=0;wi<widgetArray.length;wi++)
                            {
                              var ddbwobj=widgetArray[wi].M;
                             if(ddbwobj.deleteflag.S=="0" ||ddbwobj.deleteflag.S==0) 
                             { 
                              var wobj={};
                              console.log(JSON.stringify((ddbwobj)));
                              
                              wobj.deviceid=ddbdecObj.deviceid.S;
                              wobj.deleteflag=ddbwobj.deleteflag.S;
                              wobj.createtime=ddbwobj.createtime.S;
                              wobj.widgetname=ddbwobj.widgetname.S;
                              wobj.widgetid=ddbwobj.widgetid.S;
                              wobj.mostusedwidget=ddbwobj.mostusedwidget.S;
                              
                              wobj.headercolor      ="";
                              wobj.backgroundcolor  ="";
                              wobj.transperancy     ="0";
                              wobj.backgroundpicture="data:image/png;base64";
                              
                              if(ddbwobj.hasOwnProperty("headercolor"))
                                wobj.headercolor=ddbwobj.headercolor.S;
                              
                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                wobj.backgroundcolor=ddbwobj.backgroundcolor.S;
                               
                              if(ddbwobj.hasOwnProperty("transperancy"))
                                 wobj.transperancy=ddbwobj.transperancy.S;
                                
                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                 wobj.backgroundpicture=ddbwobj.backgroundpicture.S;
                              
                              wobj.applist=[];
                              
                              //wobj.applist=ddbwobj.applist.S;
                              if(ddbwobj.applist.L.length>0)
                              {
                               for(var ai=0;ai<ddbwobj.applist.L.length;ai++)
                               {
                                  var ddbappobj=ddbwobj.applist.L[ai].M;
                                  var appobj={};
                                      appobj.package=ddbappobj.package.S;
                                      appobj.appname=ddbappobj.appname.S
                                      wobj.applist.push(appobj);
                               }
                              }
                               returnObj.widgets.push(wobj);
                             }
                            }
                          }
                          */
                           
                         }     
                        }
                         
                      }
                      
                      var Mparams = {
		                                TableName : ""+widgetTable,
	    	                            KeyConditionExpression: "#uid = :userid",
		                                ExpressionAttributeNames:{
                                                        "#uid": "userid"
                                                        },
                                        ExpressionAttributeValues: {
                                                        ":userid":event.username
                                                        }
	                       };
	                       console.log("\n\ndata=========Mparams========>>>"+JSON.stringify(Mparams));
	                                    documentClient.query(Mparams, function(err, data) {
                       /*var params = {
                                TableName: ""+widgetTable,
                                ExpressionAttributeNames:{"#from": "userid"},
                                ExpressionAttributeValues:{":fm":{"S":""+event.username}},
                                FilterExpression: "#from =:fm"
                        };
                   dynamodb.scan(params,function(err, data) {
        				*/   if (err)
        				   {
        					        context.fail('ERROR: Dynamo failed: ' + err);
        				   } 
        				   else
        				   { 
        				         console.log("\n\ndata=========544564========>>>"+JSON.stringify(data));
        				          var widgetArray=data.Items;
        				          console.log("\n\nwidgetArray.length====>>>"+widgetArray.length);
                        			   if(widgetArray.length>0)
                                          {
                                           
                                           for(var wi=0;wi<widgetArray.length;wi++)
                                            {
                                                
                                              var ddbwobj=widgetArray[wi];
                                             if(ddbwobj.deleteflag=="0" ||ddbwobj.deleteflag==0) 
                                             { 
                                              var wobj={};
                                              console.log("\n\n\nddbwobj===>>"+JSON.stringify((ddbwobj)));
                                              
                                              wobj.deviceid=ddbwobj.deviceid;
                                              wobj.deleteflag=ddbwobj.deleteflag;
                                              wobj.createtime=ddbwobj.createtime;
                                              wobj.widgetname=ddbwobj.widgetname;
                                              wobj.widgetid=ddbwobj.widgetid;
                                              wobj.mostusedwidget=ddbwobj.mostusedwidget;
                                              
                                              wobj.headercolor      ="";
                                              wobj.backgroundcolor  ="";
                                              wobj.transperancy     ="0";
                                             // wobj.backgroundpicture="data:image/png;base64";
                                              wobj.diplayorder="0";
                                              
                                              if(ddbwobj.hasOwnProperty("headercolor"))
                                                wobj.headercolor=ddbwobj.headercolor;
                                                
                                              if(ddbwobj.hasOwnProperty("diplayorder"))
                                                wobj.diplayorder=ddbwobj.diplayorder;    
                                              
                                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                                wobj.backgroundcolor=ddbwobj.backgroundcolor;
                                               
                                              if(ddbwobj.hasOwnProperty("transperancy"))
                                                 wobj.transperancy=ddbwobj.transperancy;
                                                
                                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                                 wobj.backgroundpicture=ddbwobj.backgroundpicture;
                                               
                                              /*  if(ddbwobj.hasOwnProperty("backgroundpictureflag")) 
                                                {
                                                  if(ddbwobj["backgroundpictureflag"] =="1") 
                                                  {
                                                       console.log("\n\n==wi==============>>"+wi);
                                                       var filePath = "stax/" + ddbwobj.widgetid + ".txt"
                                                        var params1 = {
                                                          "Bucket": "aprrowsource",
                                                          "Key":filePath  
                                                            };
                                                            s3.getObject(params1, function(err, datas3){
                                                               if(err) 
                                                               {context.succeed(data.Item);}
                                                               else 
                                                               { 
                                                                    let objectData = datas3.Body.toString('utf-8');
                                                                    console.log("\n\nobjectData==wi==>>"+wi+JSON.stringify(objectData));
                                                                    wobj.backgroundpicture=objectData;
                                                                    
                                                                   // data.Item.profile.M["profileimage"]={"S":""+objectData};
                                                                    //context.succeed(data.Item);
                                                               }
                                                            });
                                                  }
                                                }
                                                 
                                              */
                                              wobj.applist=[];
                                              
                                              //wobj.applist=ddbwobj.applist.S;
                                              console.log("\n\n\nddbwobj===>>"+JSON.stringify((ddbwobj.applist)));
                                              
                                              if(ddbwobj.applist.length>0)
                                              {
                                                   for(var ai=0;ai<ddbwobj.applist.length;ai++)
                                                   {
                                                      var ddbappobj=ddbwobj.applist[ai];
                                                      var appobj={};
                                                          appobj.package=ddbappobj.package;
                                                          appobj.appname=ddbappobj.appname
                                                          wobj.applist.push(appobj);
                                                   }
                                              }
                                               returnObj.widgets.push(wobj);
                                         }
                                        }
                                      }
        				       
        				          
                				    console.log("\n\n\ndata=====$$$$$======>>"+JSON.stringify(data));
                                    context.succeed(returnObj);
				           }
			        });
                      //----
                    }
                    else
                    {
                        context.succeed(returnObj);
                    }
                     // JSON.stringify(returnObj);
                      
                      //context.succeed(returnObj);
                    }
                }
         });
       break;
       case 'getUserDeviceList':
            
             console.log("\n\n<<<==================enter=====>>>");
             console.log("\n\n<<<==================event.TableName=====>>>"+event.TableName);
             console.log("\n\n<<<==================event.username=====>>>"+event.username);
              console.log("\n\n<<<==================documentClient=====>>>"+event.maxtime);
            var maxtime=event.maxtime;
             searchload.TableName = event.TableName;
            var key = {'username': {'S':event.username}};
             searchload.Key = key;
             console.log("\n\nsearchload=====>>>"+JSON.stringify(searchload))
            dynamodb.getItem(searchload, function(err, data) {
                
                if (err) 
                {
                    returndata.status = "503"
                    returndata.messageText = "Service Unavailable"
                    context.fail(new Error(returndata.status + " " + returndata.messageText));
                } 
                else 
                {
                    console.log("\n\n\n\n==>>");
                    var returnObj={};
                    if(data.Item)
                    {  
                   //  data.status='SUCCESS';
                      returnObj.device=[];
                     
                        console.log("\n===returnObj==>>"+JSON.stringify(data.Item.device));
                    if(data.Item.device!=undefined && data.Item.device!='undefined')
                     {
                         
                      if(data.Item.device.L.length>0)
                      {
                        for(var di=0;di<data.Item.device.L.length;di++)
                        {
                          var ddbdecObj=data.Item.device.L[di].M;
                         
                         if(maxtime<ddbdecObj.createtime.S)
                         {
                          
                          var divobj={};
                          divobj.deleteflag=ddbdecObj.deleteflag.S;
                          divobj.createtime=ddbdecObj.createtime.S;
                          divobj.devicename=ddbdecObj.devicename.S;
                          divobj.deviceid=ddbdecObj.deviceid.S;
                          divobj.devicehardwareid=ddbdecObj.devicehardwareid.S;
                          divobj.devicemodel=ddbdecObj.devicemodel.S;
                          
                          returnObj.device.push(divobj);
                         }
                        }
                         context.succeed(returnObj);
                         
                      }
                      else{
                          context.succeed(returnObj);
                      }
                      
                     
                    }
                    else{
                         context.succeed(returnObj);
                       }
                        
                    }
                    else{
                         context.succeed(returnObj);
                    }
                    
                   
                }
                 
         });
       break;
       case 'getUserWidgetList':
            
                var maxtime=event.maxtime;
              var returnObj={};
                   returnObj.widgets=[];
           /* var params = {
                                TableName: "widgetList",
                                ExpressionAttributeNames:{"#from": "userid","#deviceid": "deviceid"},
                                ExpressionAttributeValues:{":fm":{"S":""+event.username},":deviceid":{"S":""+event.deviceid}},
                                FilterExpression: "#from =:fm and #deviceid =:deviceid"
                        };
                   dynamodb.scan(params,function(err, data) {*/
                   var Mparams = {
		                                TableName : ""+widgetTable,
	    	                            KeyConditionExpression: "#uid = :userid",
		                                ExpressionAttributeNames:{
                                                        "#uid": "userid",
                                                        "#deviceid": "deviceid"
                                                        },
                                        ExpressionAttributeValues: {
                                                        ":userid":event.username,
                                                        ":deviceid":""+event.deviceid
                                                        },
                                FilterExpression: "#deviceid =:deviceid"
	                       };
	                      
	                   documentClient.query(Mparams, function(err, data) {
        				   if (err)
        				   {
        					        context.fail('ERROR: Dynamo failed: ' + err);
        				   } 
        				   else
        				   { 
        				         console.log("\n\ndata.Items====>>>"+JSON.stringify(data));
        				          var widgetArray=data.Items;
                        			   if(widgetArray.length>0)
                                          {
                                           
                                           for(var wi=0;wi<widgetArray.length;wi++)
                                            {
                                              var ddbwobj=widgetArray[wi];
                                             if(maxtime<ddbwobj.createtime) 
                                             { 
                                              var wobj={};
                                              console.log(JSON.stringify((ddbwobj)));
                                              
                                              wobj.deviceid=ddbwobj.deviceid;
                                              wobj.deleteflag=ddbwobj.deleteflag;
                                              wobj.createtime=ddbwobj.createtime;
                                              wobj.widgetname=ddbwobj.widgetname;
                                              wobj.widgetid=ddbwobj.widgetid;
                                              wobj.mostusedwidget=ddbwobj.mostusedwidget;
                                              
                                              wobj.headercolor      ="";
                                              wobj.backgroundcolor  ="";
                                              wobj.transperancy     ="0";
                                              wobj.backgroundpicture="data:image/png;base64";
                                              
                                              if(ddbwobj.hasOwnProperty("headercolor"))
                                                wobj.headercolor=ddbwobj.headercolor;
                                              
                                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                                wobj.backgroundcolor=ddbwobj.backgroundcolor;
                                               
                                              if(ddbwobj.hasOwnProperty("transperancy"))
                                                 wobj.transperancy=ddbwobj.transperancy;
                                                
                                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                                 wobj.backgroundpicture=ddbwobj.backgroundpicture;
                                              
                                              wobj.applist=[];
                                              
                                              //wobj.applist=ddbwobj.applist.S;
                                              if(ddbwobj.applist.length>0)
                                              {
                                               for(var ai=0;ai<ddbwobj.applist.length;ai++)
                                               {
                                                  var ddbappobj=ddbwobj.applist[ai];
                                                  var appobj={};
                                                      appobj.package=ddbappobj.package;
                                                      appobj.appname=ddbappobj.appname
                                                      wobj.applist.push(appobj);
                                               }
                                              }
                                               returnObj.widgets.push(wobj);
                                             }
                                            }
                                          }
        				       
        				          
                				    console.log("\n\n\ndata=====$$$$$======>>"+JSON.stringify(data));
                                    context.succeed(returnObj);
				           }
			        });
       break;
       case 'getUserWidgetListnew':
            
              var maxtime=event.maxtime;
              var returnObj={};
                   returnObj.widgets=[];
            var params = {
                                TableName: "widgetList",
                                ExpressionAttributeNames:{"#from": "userid","#deviceid": "deviceid"},
                                ExpressionAttributeValues:{":fm":{"S":""+event.username},":deviceid":{"S":""+event.deviceid}},
                                FilterExpression: "#from =:fm and #deviceid =:deviceid"
                        };
                   dynamodb.scan(params,function(err, data) {
        				   if (err)
        				   {
        					        context.fail('ERROR: Dynamo failed: ' + err);
        				   } 
        				   else
        				   { 
        				         console.log("data.Items====>>>"+JSON.stringify());
        				          var widgetArray=data.Items;
                        			   if(widgetArray.length>0)
                                          {
                                           
                                           for(var wi=0;wi<widgetArray.length;wi++)
                                            {
                                              var ddbwobj=widgetArray[wi];
                                             if(maxtime<ddbwobj.createtime.S) 
                                             { 
                                              var wobj={};
                                              console.log(JSON.stringify((ddbwobj)));
                                              
                                              wobj.deviceid=ddbwobj.deviceid.S;
                                              wobj.deleteflag=ddbwobj.deleteflag.S;
                                              wobj.createtime=ddbwobj.createtime.S;
                                              wobj.widgetname=ddbwobj.widgetname.S;
                                              wobj.widgetid=ddbwobj.widgetid.S;
                                              wobj.mostusedwidget=ddbwobj.mostusedwidget.S;
                                              
                                              wobj.headercolor      ="";
                                              wobj.backgroundcolor  ="";
                                              wobj.transperancy     ="0";
                                              wobj.backgroundpicture="data:image/png;base64";
                                              
                                              if(ddbwobj.hasOwnProperty("headercolor"))
                                                wobj.headercolor=ddbwobj.headercolor.S;
                                              
                                              if(ddbwobj.hasOwnProperty("backgroundcolor"))
                                                wobj.backgroundcolor=ddbwobj.backgroundcolor.S;
                                               
                                              if(ddbwobj.hasOwnProperty("transperancy"))
                                                 wobj.transperancy=ddbwobj.transperancy.S;
                                                
                                              if(ddbwobj.hasOwnProperty("backgroundpicture"))
                                                 wobj.backgroundpicture=ddbwobj.backgroundpicture.S;
                                              
                                              wobj.applist=[];
                                              
                                              //wobj.applist=ddbwobj.applist.S;
                                              if(ddbwobj.applist.L.length>0)
                                              {
                                               for(var ai=0;ai<ddbwobj.applist.L.length;ai++)
                                               {
                                                  var ddbappobj=ddbwobj.applist.L[ai].M;
                                                  var appobj={};
                                                      appobj.package=ddbappobj.package.S;
                                                      appobj.appname=ddbappobj.appname.S
                                                      wobj.applist.push(appobj);
                                               }
                                              }
                                               returnObj.widgets.push(wobj);
                                             }
                                            }
                                          }
        				       
        				          
                				    console.log("\n\n\ndata=====$$$$$======>>"+JSON.stringify(data));
                                    context.succeed(returnObj);
				           }
			        });
       break;
        default:
            callback(new Error(`Unrecognized operation "${operation}"`));
    }
}