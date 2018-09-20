'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();


exports.handler =function(event, context, callback) 
{

console.log("Request received:\n", JSON.stringify(event));
console.log("Context received:\n", JSON.stringify(context));

const payload = {};
const searchload = {};
const returndata = {};

const baseTable="Users";
const appStatisticsTable="AppStatistics";
const locationDataTable="LocationData";

       payload.TableName =baseTable; // "UserTable";
       
       var newdeviceList=event.device;
       var newwidget=event.widget;
          
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
					      
					                var rewardcount=0;
					       payload.Item=data.Item;
                           var deviceList={"L":[]};
                           var existDeviceObj={};
                           if(payload.Item.device!=undefined)
                           {
                               if(payload.Item.device.L.length>0)
                        						   {
                        						       deviceList.L=payload.Item.device.L;
                             							  for(var i=0;i<deviceList.L.length;i++)
                             							  {
                             							      var deviceid=deviceList.L[i].M.deviceid.S;
                             							          existDeviceObj[deviceid]=i;
                             							  }
                        						   }
                           } 
                         
                           if(newdeviceList.length>0)
                           {
                              for(var j=0;j<newdeviceList.length;j++) 
                              {
                                 var newdeviceObj= newdeviceList[j];
                                 var newDevid= newdeviceObj.deviceid;
                                 if(existDeviceObj[""+newDevid]!=undefined)
                                    {
                                       var count=existDeviceObj[""+newDevid];
                                        deviceList.L[count].M.devicename.S=newdeviceObj.devicename;
                                        deviceList.L[count].M.deleteflag.S=newdeviceObj.deleteflag;
                                         
                                    }
                                 else{
                                       var dObj={};
                                           dObj.deleteflag={"S":""+newdeviceObj.deleteflag};
                                           dObj.deviceid={"S":""+newdeviceObj.deviceid};
                                           dObj.devicemodel={"S":""+newdeviceObj.devicemodel};
                                           dObj.devicename={"S":""+newdeviceObj.devicename};
                                           dObj.devicehardwareid={"S":""+newdeviceObj.devicehardwareid};
                                           dObj.createtime={"S":""+newdeviceObj.createtime};
                                           dObj.widgets={"L":[]};
                                         //  var devobj={"M":dObj};
                                    
                                         deviceList.L.push({"M":dObj});
                                     }
                                 }
                                }
                                //------end device intagration---------------------
                             
                               //widjet mapping 
                                var eDeviceObj={};
                               if(deviceList.L.length>0)
                      						   {
                               							  for(var i=0;i<deviceList.L.length;i++)
                               							  {
                               							      var deviceid=deviceList.L[i].M.deviceid.S;
                               							          eDeviceObj[deviceid]=i;
                               							  }
                      						   }
                             //console.log("eDeviceObj===>>>"+JSON.stringify(eDeviceObj));
                                //newwidget data from phone;
                             if(newwidget.length>0)  
                             {
                                 for(var di=0;di<newwidget.length;di++)
                                 {
                                    
                                     var divId=newwidget[di]["deviceid"];
                                     var phoneWidget=newwidget[di]["widgets"];
                                     var dposition=eDeviceObj[""+divId];
                                     var dynamowidjetList= deviceList.L[dposition].M.widgets.L; 
                                       
                                               var ewidjetObj={};
                                               if(dynamowidjetList.length>0)
                            						        {
                                       							  for(var wi=0;wi<dynamowidjetList.length;wi++)
                                       							  {
                                       							      var widjetid=dynamowidjetList[wi].M.widgetid.S;
                                       							          ewidjetObj[widjetid]=wi;
                                       							  }
                    						             }
                                              //console.log("\newidjetObj===>>>"+JSON.stringify(ewidjetObj)); 
                                              
                                              if(phoneWidget.length>0)
                                              {
                                                  for(var pwi=0;pwi<phoneWidget.length;pwi++)
                                                  {
                                                      var phoneWidgetObj=phoneWidget[pwi];
                                                      var phoneWidgetId=phoneWidgetObj["widgetid"];
                                                      
                                                    
                                                       if(ewidjetObj[""+phoneWidgetId]!=undefined)
                                                        {
                                                             var widjetPosition=ewidjetObj[""+phoneWidgetId] ;
                                                              dynamowidjetList[widjetPosition].M.widgetname.S=phoneWidgetObj.widgetname;
                                                              dynamowidjetList[widjetPosition].M.deleteflag.S=phoneWidgetObj.deleteflag;
                                                              dynamowidjetList[widjetPosition].M.createtime.S=phoneWidgetObj.createtime;                                                                                                                                  dynamowidjetList[widjetPosition].M.createtime.S=phoneWidgetObj.createtime;
                                                              dynamowidjetList[widjetPosition].M.mostusedwidget.S=phoneWidgetObj.mostusedwidget;
                                                              
                                                               dynamowidjetList[widjetPosition].M["transperancy"]={"S":"0"};
                                                               dynamowidjetList[widjetPosition].M["backgroundpicture"]={"S":"data:image/png;base64"};
                                                               
                                                               console.log("\nheadercolor==>>"+JSON.stringify(phoneWidgetObj));
                                                               if(phoneWidgetObj.hasOwnProperty("headercolor") && phoneWidgetObj.headercolor!="")
                                                                 dynamowidjetList[widjetPosition].M["headercolor"]={"S":""+phoneWidgetObj.headercolor};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundcolor") && phoneWidgetObj.backgroundcolor!="")
                                                                dynamowidjetList[widjetPosition].M["backgroundcolor"]={"S":""+phoneWidgetObj.backgroundcolor};
                                                                
                                                               if(phoneWidgetObj.hasOwnProperty("transperancy") && phoneWidgetObj.transperancy!="") 
                                                                 dynamowidjetList[widjetPosition].M["transperancy"]={"S":""+phoneWidgetObj.transperancy};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundpicture") && phoneWidgetObj.backgroundpicture!="")
                                                                 dynamowidjetList[widjetPosition].M["backgroundpicture"]={"S":""+phoneWidgetObj.backgroundpicture};

                                                           
                                                              var applist=phoneWidgetObj.applist;
                                                             // console.log("applist=====>>"+JSON.stringify(applist));
                                                              var appArray={"L": []};
                                                              for(var appi=0;appi<applist.length;appi++)
                                                              {
                                                                  var appobj={};
                                                                 
                                                                  appobj.appname= {"S": ""+applist[appi].appname};
                                                                  appobj.package= {"S": ""+applist[appi].package};
                                                                  
                                                                   var appobj_mdfied={"M":appobj};
                                                                  
                                                                  appArray.L.push(appobj_mdfied)
                                                              }
                                                             dynamowidjetList[widjetPosition].M.applist=appArray;
                                                           
                                                             
                                                        }
                                                     else{
                                                            rewardcount=rewardcount+1;
                                                           var wObj={};
                                                               wObj.widgetid={"S":""+phoneWidgetObj.widgetid};
                                                               wObj.widgetname={"S":""+phoneWidgetObj.widgetname};
                                                               wObj.deleteflag={"S":""+phoneWidgetObj.deleteflag};
                                                               wObj.createtime={"S":""+phoneWidgetObj.createtime};
                                                               wObj.mostusedwidget={"S":""+phoneWidgetObj.mostusedwidget};
                                                               
                                                               wObj.transperancy={"S":"0"};
                                                               wObj.backgroundpicture={"S":"data:image/png;base64"};
                                                               
                                                                if(phoneWidgetObj.hasOwnProperty("headercolor") && phoneWidgetObj.headercolor!="")
                                                                 wObj.headercolor={"S":""+phoneWidgetObj.headercolor};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundcolor") && phoneWidgetObj.backgroundcolor!="")
                                                                wObj.backgroundcolor={"S":""+phoneWidgetObj.backgroundcolor};
                                                                
                                                               if(phoneWidgetObj.hasOwnProperty("transperancy") && phoneWidgetObj.transperancy!="") 
                                                                 wObj.transperancy={"S":""+phoneWidgetObj.transperancy};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundpicture") && phoneWidgetObj.backgroundpicture!="")
                                                                 wObj.backgroundpicture={"S":""+phoneWidgetObj.backgroundpicture};

                                                             
                                                               var aplist=phoneWidgetObj.applist;
                                                              var appArray={"L": []};
                                                              console.log(aplist);
                                                              for(var appi=0;appi<aplist.length;appi++)
                                                              {
                                                                  var appobj={};
                                                                 
                                                                  appobj.appname= {"S": ""+aplist[appi].appname};
                                                                  appobj.package= {"S": ""+aplist[appi].package};
                                                                  
                                                                   var appobj_mdfied={"M":appobj};
                                                                  
                                                                  appArray.L.push(appobj_mdfied)
                                                              }
                                                              wObj.applist=appArray;
                                                              
                                                               var widobj={"M":wObj};
                                                             dynamowidjetList.push(widobj);
                                                         }
                                                      
                                                  }
                                                  
                                              }
                                             
                                             deviceList.L[dposition].M.widgets.L=dynamowidjetList;
                                            
                                              
                                 }
                                 
                             }
                              payload.Item.device=deviceList;  
                                console.log("\npayload=======>>"+JSON.stringify(payload));   
                         dynamodb.putItem(payload, function(err, data) {
                            if (err) 
                            {
                             context.fail('ERROR: Dynamo failed: ' + err);
                            } 
                            else 
                            {
                             
                                 if(rewardcount>0)
                                 {
                                    //-----------------------------------------------------------------------------------
                                        var userid=event.username;
                                                var reCount=rewardcount;
                                                var tcreatetime=""+newdeviceList[0].createtime;
                                                
                                                var Rewardsearchload={};
                                                Rewardsearchload.TableName = "Reward";
                                                var key = {'userid':{'S':userid}};
                                                Rewardsearchload.Key = key;  
                                                
                                           dynamodb.getItem(Rewardsearchload, function(err, data) {
                                               if (err) 
                                               {
                                                   returndata.status = "503"
                                                   returndata.messageText = "Service Unavailable"
                                                   context.fail(new Error(returndata.status + " " + returndata.messageText));
                                               } 
                                               else 
                                               {  
                                                       var rewardload={};
                                                       rewardload.TableName='Reward';
                                                       
                                                       console.log("\n\n\n data.Item=======>>"+JSON.stringify(data.Item));
                                                   
                                                   if(data.Item)
                                                   {
                                                      rewardload.Item=data.Item;
                                                   }
                                                   else 
                                                   {
                                                     rewardload.Item={ 
                                                                         "Coins": {"S": "0"},
                                                                         "Task_Progress": {"L": []},
                                                                         "Activity_Progress":{"L": []},
                                                                         "Updatedon": {"S": ""+tcreatetime},
                                                                         "Badge": {"S": "none"},
                                                                         "userid": {"S": ""+userid}
                                                                      };
                                                   }
                                                   var tparams = {
                                                       TableName: "TaskList",
                                                       ExpressionAttributeNames:{"#from": "keyword"},
                                                       ExpressionAttributeValues:{":fm":{"S":"CS"}},
                                                       FilterExpression: "#from =:fm"
                                                 };
                                             dynamodb.scan(tparams,function(err, data) {
                                              if (err)
                                              {
                                                context.fail('ERROR: Dynamo failed: ' + err);
                                              } 
                                              else
                                              {    
                               			     var sdata=data.Items;
                               			     var utaskid=sdata[0]["taskid"]["S"];
                                                var taskpoint=parseInt(sdata[0]["coinstocomplete"]["S"]);
                                                 
                                                   var ddbTaskProgressArray=rewardload.Item.Task_Progress.L;
                                                   var flag=0;
                                                   var addcoins=0;
                                                   var addpoints=0;
                                                   var uniqueid =0;
                                                           for(var count=0;count<ddbTaskProgressArray.length;count++)
                                                           {
                                                               if(utaskid==ddbTaskProgressArray[count].M.taskid.S)
                                                               {
                                                                   flag=1;
                                                                  reCount= parseInt(ddbTaskProgressArray[count].M.coins_pending_to_collect.S)+reCount;
                                                                  addcoins=~~(reCount/taskpoint);
                                                                  addpoints=reCount%taskpoint;
                                                                  addcoins=parseInt(rewardload.Item.Task_Progress.L[count].M.numberofcoins.S)+addcoins;
                                                                  
                                                                  rewardload.Item.Task_Progress.L[count].M.numberofcoins.S=""+addcoins;
                                                                  rewardload.Item.Task_Progress.L[count].M.coins_pending_to_collect.S=""+addpoints;
                                                                 rewardload.Item.Task_Progress.L[count].M.points_collected.S=""+addpoints;
                                                                 
                                                                  var ln=rewardload.Item.Activity_Progress.L.length;
                                                                  if(ln>0)
                                                                      uniqueid =parseInt(rewardload.Item.Activity_Progress.L[ln-1].M.uniqueid.S)+1;
                                                                   
                                                                   count=ddbTaskProgressArray.length;
                                                               }
                                                           }
                                                           
                                                           if(flag==0)
                                                           {
                                                                addcoins=~~(reCount/taskpoint);
                                                                addpoints=reCount%taskpoint;
                                                                var mObj={"M": {
                                                                         "numberofcoins": { "S": ""+addcoins},
                                                                         "points_collected": {"S": ""+addpoints},
                                                                         "coins_pending_to_collect": {"S": ""+addpoints},
                                                                         "taskid": {"S": ""+utaskid}
                                                                       }};
                                                               rewardload.Item.Task_Progress.L.push(mObj);        
                                                           }
                                                           
                                                           var activityObj={
                                                                       "uniqueid":{"S":""+uniqueid},
                                                                       "taskheading":{"S":""+sdata[0]["taskname"]["S"]},
                                                                       "timestmap":{"S":""+tcreatetime}
                                                                   };
                                                             rewardload.Item.Activity_Progress.L.push({"M":activityObj});
                                                            console.log("\n\n\nrewardload.Item.===>>"+JSON.stringify(rewardload));
                                                            dynamodb.putItem(rewardload, function(err, data) 
                                                            {
                                                               if (err) 
                                                               {
                                                                context.fail('ERROR: Dynamo failed: ' + err);
                                                               } 
                                                               else 
                                                               {   console.log('Dynamo Success: ' + JSON.stringify(data, null, '  '));
                                                                   context.succeed('SUCCESS');
                                                               }
                                                           });
                                                           
                                                     }
                                              
                                                 });
                                               }
                                          }); 
                                    //----------------------------------------------------------------------------------
                                 }
                                 else
                                 {
                                     console.log('Dynamo Success: ' + JSON.stringify(data, null, '  '));
                                    //returndata.devStatus='SUCCESS';
                                    context.succeed('SUCCESS');
                                 }
                             }
                         });
                                
                                
                               
                        }
                     }
          
         });
         
     
           
}