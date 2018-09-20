'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
var documentClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

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
const widgetTable="widgetList";
const RewardTable="Reward";
const TaskListTable="TaskList";

       payload.TableName =baseTable; // "UserTable";
      
       var newdeviceList=event.device;
       var newwidget=event.widget;
       var rewardcreatetime="";
       var rewardactarray=[];
          
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
                         console.log("\n\nEnter==========================>>>>")
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
                                         deviceList.L[count].M.createtime.S=newdeviceObj.createtime;
                                         
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
                                           dObj.widgetList={"M":{}};
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
                             console.log("eDeviceObj===>>>"+JSON.stringify(eDeviceObj));
                                //newwidget data from phone;
                                console.log("newwidget.length=====>>>"+newwidget.length);
                             if(newwidget.length>0)  
                             {
                                 for(var di=0;di<newwidget.length;di++)
                                 {
                                    
                                     var divId=newwidget[di]["deviceid"];
                                     var phoneWidget=newwidget[di]["widgets"];
                                     var dposition=eDeviceObj[""+divId];
                                     console.log("\n\ndeviceList.L[dposition].M.widgets.L===>>>"+JSON.stringify(deviceList));
                                     
                                     console.log("\n\ndpositionL===>>>"+dposition);
                                     var dynamowidjetList= deviceList.L[dposition].M.widgets.L; 
                                     
                                      var newdynamowidjetList=[];
                                    var newdynamowidjetList1={"1":[],"2":[],"3":[],"4":[],"5":[],"6":[]}; 
                                    var ewidjetObj={};
                                     if(deviceList.L[dposition].M.widgetList==undefined || deviceList.L[dposition].M.widgetList=="undefined")                   
                                       { 
                                                deviceList.L[dposition].M["widgetList"]={"M":{}};
                                                var ewidjetObj= deviceList.L[dposition].M.widgetList.M; 
                                       }
                                       else{
                                           var ewidjetObj= deviceList.L[dposition].M.widgetList.M;  
                                       }
                                
                                //console.log("\n\newidjetObj====>>"+JSON.stringify(ewidjetObj));
                                               
                                           /* ####    if(dynamowidjetList.length>0)
                            						        {
                                       							  for(var wi=0;wi<dynamowidjetList.length;wi++)
                                       							  {
                                       							      var widjetid=dynamowidjetList[wi].M.widgetid.S;
                                       							          ewidjetObj[widjetid]=wi;
                                       							  }
                    						              } ### */
                                              //console.log("\newidjetObj===>>>"+JSON.stringify(ewidjetObj)); 
                                              
                                              if(phoneWidget.length>0)
                                              {
                                                  for(let pwi=0;pwi<phoneWidget.length;pwi++)
                                                  {
                                                      var phoneWidgetObj=phoneWidget[pwi];
                                                      var phoneWidgetId=phoneWidgetObj["widgetid"];
                                                      var userid=event.username;
                                                      
                                                   // console.log("\n\n\newidjetObphoneWidgetId======>>>>"+JSON.stringify(ewidjetObj[""+phoneWidgetId]));
                                                    // console.log("\n\n\n hasonproperty=====>>>>"+ewidjetObj.hasOwnProperty(phoneWidgetId));
                                                     if(ewidjetObj.hasOwnProperty(phoneWidgetId))
                                                       {
                                                          
                                                            //var deviceWidgetidc=""+divId+phoneWidgetId;
                                                           // widgetListNew,userid,widgetid
                                                          //  Key : {'deviceWidgetid' :deviceWidgetidc},
                                                             var uparam={  
                                                                        TableName :""+widgetTable,
                                                                         Key : {'userid' :userid,"widgetid":phoneWidgetId},
                                                                         UpdateExpression : "SET ",
                                                                         ExpressionAttributeNames : {},
                                                                         ExpressionAttributeValues : {}
                                                                };
                                                       // "SET device.#attrName =:attrValue",
                                                       //{"#attrName" : deviceid},
                                                       // {  ":attrValue"  : devicetoken }
                                                             //var widjetPosition=ewidjetObj[""+phoneWidgetId] ;
                                                             
                                                             uparam.UpdateExpression=uparam.UpdateExpression+" #widgetname=:widgetname";
                                                             uparam.ExpressionAttributeNames["#widgetname"]="widgetname";
                                                             uparam.ExpressionAttributeValues[":widgetname"]=""+phoneWidgetObj.widgetname;
                                                             
                                                              //dynamowidjetList[widjetPosition].M.widgetname.S=phoneWidgetObj.widgetname;
                                                              
                                                               uparam.UpdateExpression=uparam.UpdateExpression+", #deleteflag=:deleteflag";
                                                               uparam.ExpressionAttributeNames["#deleteflag"]="deleteflag";
                                                               uparam.ExpressionAttributeValues[":deleteflag"]=""+phoneWidgetObj.deleteflag;
                                                             
                                                             // dynamowidjetList[widjetPosition].M.deleteflag.S=phoneWidgetObj.deleteflag;
                                                             
                                                              uparam.UpdateExpression=uparam.UpdateExpression+", #createtime=:createtime";
                                                               uparam.ExpressionAttributeNames["#createtime"]="createtime";
                                                               uparam.ExpressionAttributeValues[":createtime"]=""+phoneWidgetObj.createtime;
                                                              
                                                             // dynamowidjetList[widjetPosition].M.createtime.S=phoneWidgetObj.createtime;                                                                                                                                  dynamowidjetList[widjetPosition].M.createtime.S=phoneWidgetObj.createtime;
                                                             
                                                               uparam.UpdateExpression=uparam.UpdateExpression+", #mostusedwidget=:mostusedwidget";
                                                               uparam.ExpressionAttributeNames["#mostusedwidget"]="mostusedwidget";
                                                               uparam.ExpressionAttributeValues[":mostusedwidget"]=""+phoneWidgetObj.mostusedwidget;
                                                               
                                                               uparam.UpdateExpression=uparam.UpdateExpression+", #deviceid=:deviceid";
                                                               uparam.ExpressionAttributeNames["#deviceid"]="deviceid";
                                                               uparam.ExpressionAttributeValues[":deviceid"]=""+divId;
                                                               
                                                               
                                                              //dynamowidjetList[widjetPosition].M.mostusedwidget.S=phoneWidgetObj.mostusedwidget;
                                                              // dynamowidjetList[widjetPosition].M["transperancy"]={"S":"0"};
                                                             //  dynamowidjetList[widjetPosition].M["backgroundpicture"]={"S":"data:image/png;base64"};
                                                               
                                                               
                                                               console.log("\nheadercolor==>>"+JSON.stringify(phoneWidgetObj));
                                                               if(phoneWidgetObj.hasOwnProperty("headercolor") && phoneWidgetObj.headercolor!="")
                                                               {
                                                                // dynamowidjetList[widjetPosition].M["headercolor"]={"S":""+phoneWidgetObj.headercolor};
                                                               
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #headercolor=:headercolor";
                                                                    uparam.ExpressionAttributeNames["#headercolor"]="headercolor";
                                                                    uparam.ExpressionAttributeValues[":headercolor"]=""+phoneWidgetObj.headercolor;
                                                               }
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundcolor") && phoneWidgetObj.backgroundcolor!="")
                                                               {
                                                               // dynamowidjetList[widjetPosition].M["backgroundcolor"]={"S":""+phoneWidgetObj.backgroundcolor};
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #backgroundcolor=:backgroundcolor";
                                                                    uparam.ExpressionAttributeNames["#backgroundcolor"]="backgroundcolor";
                                                                    uparam.ExpressionAttributeValues[":backgroundcolor"]=""+phoneWidgetObj.backgroundcolor;
                                                               }
                                                                
                                                               if(phoneWidgetObj.hasOwnProperty("transperancy") && phoneWidgetObj.transperancy!="")
                                                               {
                                                                 //dynamowidjetList[widjetPosition].M["transperancy"]={"S":""+phoneWidgetObj.transperancy};
                                                                 
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #transperancy=:transperancy";
                                                                    uparam.ExpressionAttributeNames["#transperancy"]="transperancy";
                                                                    uparam.ExpressionAttributeValues[":transperancy"]=""+phoneWidgetObj.transperancy;
                                                              
                                                               }
                                                               if(phoneWidgetObj.hasOwnProperty("pricecategory") && phoneWidgetObj.pricecategory!="")
                                                               {
                                                                
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #pricecategory=:pricecategory";
                                                                    uparam.ExpressionAttributeNames["#pricecategory"]="pricecategory";
                                                                    uparam.ExpressionAttributeValues[":pricecategory"]=""+phoneWidgetObj.pricecategory;
                                                              
                                                               }
                                                               
                                                               
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundpicture") && phoneWidgetObj.backgroundpicture!="")
                                                               {
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #backgroundpictureflag=:backgroundpictureflag";
                                                                    uparam.ExpressionAttributeNames["#backgroundpictureflag"]="backgroundpictureflag";
                                                                    uparam.ExpressionAttributeValues[":backgroundpictureflag"]=""+1;
                                                                   
                                                                   
                                                                    uparam.UpdateExpression=uparam.UpdateExpression+", #backgroundpicture=:backgroundpicture";
                                                                    uparam.ExpressionAttributeNames["#backgroundpicture"]="backgroundpicture";
                                                                    uparam.ExpressionAttributeValues[":backgroundpicture"]=""+phoneWidgetObj.backgroundpicture;
                                                                   
                                                               } 
                                                           
                                                              var applist=phoneWidgetObj.applist;
                                                               var appArray={"L": []};
                                                              for(var appi=0;appi<applist.length;appi++)
                                                              {
                                                                  var appobj={};
                                                                 
                                                                  appobj.appname= {"S": ""+applist[appi].appname};
                                                                  appobj.package= {"S": ""+applist[appi].package};
                                                                  
                                                                   var appobj_mdfied={"M":appobj};
                                                                  
                                                                  appArray.L.push(appobj_mdfied)
                                                              }
                                                            
                                                             uparam.UpdateExpression=uparam.UpdateExpression+", #applist=:applist";
                                                             uparam.ExpressionAttributeNames["#applist"]="applist";
                                                             uparam.ExpressionAttributeValues[":applist"]=applist;
                                                            
                                                             deviceList.L[dposition].M.widgetList.M[""+phoneWidgetObj.widgetid]={"S":""+phoneWidgetObj.deleteflag};
                                                           
                                                             documentClient.update(uparam,function(err, result) {
                                                                    if (err) { console.log('function returned error: ' + err + '') } 
                                                                    else { 
                                                                       
                                                                        console.log("\n\n=wwwww=======>>>>"+result) 
                                                                        
                                                                    }
                                                                });
                                                                
                                                                 //-----------------------------------------------------------------------
                                                                    /*     if(phoneWidgetObj.hasOwnProperty("backgroundpicture") && phoneWidgetObj.backgroundpicture!="")
                                                                           {
                                                                                  //console.log("\npwi=================>>>>"+pwi);
                                                                                  let encodedImage =phoneWidgetObj.backgroundpicture;
                                                                                  var filePath = "stax/"+phoneWidgetId+".txt";
                                                                                  var params = {
                                                                                       "Body": encodedImage,
                                                                                       "Bucket": "aprrowsource",
                                                                                       "Key": filePath  
                                                                                    };
                                                                                    s3.upload(params, function(err, data2){
                                                                                       if(err){ context.fail('ERROR: s3 failed: ' + err); }
                                                                                       else { console.log("\n\n=wwwww=======>>>>"+data2) }
                                                                                    });
                                                                           }
                                                                           */
                                                                        //-----------------------------------------------------------------------
                                                             
                                                        }
                                                    else{
                                                              rewardcreatetime=phoneWidgetObj.createtime;
                                                              rewardactarray.push({"timestmap":{"S":""+phoneWidgetObj.createtime}});
                                                        console.log("\n\n\ndivId======>>>"+divId);      
                                                            rewardcount=rewardcount+1;
                                                           var wObj={};
                                                               wObj.widgetid={"S":""+phoneWidgetObj.widgetid};
                                                               wObj.widgetname={"S":""+phoneWidgetObj.widgetname};
                                                               wObj.deleteflag={"S":""+phoneWidgetObj.deleteflag};
                                                               wObj.createtime={"S":""+phoneWidgetObj.createtime};
                                                               wObj.mostusedwidget={"S":""+phoneWidgetObj.mostusedwidget};
                                                               wObj.deviceid={"S":""+divId};
                                                               wObj.userid={"S":""+event.username};
                                                               
                                                               var deviceWidgetid=""+divId+phoneWidgetObj.widgetid;
                                                                wObj.deviceWidgetid={"S":""+deviceWidgetid};
                                                                
                                                               wObj.transperancy={"S":"0"};
                                                               wObj.backgroundpicture={"S":"data:image/png;base64"};
                                                               
                                                                if(phoneWidgetObj.hasOwnProperty("headercolor") && phoneWidgetObj.headercolor!="")
                                                                 wObj.headercolor={"S":""+phoneWidgetObj.headercolor};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundcolor") && phoneWidgetObj.backgroundcolor!="")
                                                                wObj.backgroundcolor={"S":""+phoneWidgetObj.backgroundcolor};
                                                                
                                                               if(phoneWidgetObj.hasOwnProperty("transperancy") && phoneWidgetObj.transperancy!="") 
                                                                 wObj.transperancy={"S":""+phoneWidgetObj.transperancy};
                                                                 
                                                                 if(phoneWidgetObj.hasOwnProperty("pricecategory") && phoneWidgetObj.pricecategory!="") 
                                                                 wObj.pricecategory={"S":""+phoneWidgetObj.pricecategory};
                                                                 
                                                               if(phoneWidgetObj.hasOwnProperty("backgroundpicture") && phoneWidgetObj.backgroundpicture!="" && phoneWidgetObj.backgroundpicture!=null && phoneWidgetObj.backgroundpicture!="null")
                                                                { 
                                                                     wObj["backgroundpictureflag"]={"S":"1"};
                                                                     //wObj["backgroundpicturefile"]={"S":""};
                                                                     wObj.backgroundpicture={"S":""+phoneWidgetObj.backgroundpicture};
                                                                      let encodedImage =phoneWidgetObj.backgroundpicture;
                                                                      var filePath = "stax/" + phoneWidgetObj.widgetid + ".txt";
                                                                      var params = {
                                                                           "Body": encodedImage,
                                                                           "Bucket": "aprrowsource",
                                                                           "Key": filePath  
                                                                        };
                                                                        s3.upload(params, function(err, data1){
                                                                           if(err){ context.fail('ERROR: s3 failed: ' + err); }
                                                                           else { console.log("\n\n=wwwww=======>>>>"+data1) }
                                                                        });
                                                                }
                                                             
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
                                                         console.log("\n\n\nwObj==========>>>"+JSON.stringify(wObj));           
                                                              // var widobj={"M":wObj};
                                                               var widobj={"PutRequest": {"Item": wObj}};
                                                            // dynamowidjetList.push(widobj);
                                                            for(var ii=1;ii<7;ii++)
                                                            {
                                                                if(newdynamowidjetList.length<=24)
                                                                {
                                                                    newdynamowidjetList.push(widobj);
                                                                     break;
                                                                }
                                                               else if (newdynamowidjetList1[""+ii].length<=24)
                                                                 {
                                                                     newdynamowidjetList1[""+ii].push(widobj);
                                                                    break;
                                                                 }
                                                               
                                                            }
                                                               //newdynamowidjetList.push(widobj);
                                                               console.log("\n\ndeviceList.L[dposition].M.widgetList.M===>>"+JSON.stringify(deviceList.L[dposition].M.widgetList));
                                                               deviceList.L[dposition].M.widgetList.M[phoneWidgetObj.widgetid]={"S":""+phoneWidgetObj.deleteflag};
                                                               
                                                               
                                                         }
                                                      
                                                  }
                                                  
                                              }
                                            // console.log("newdynamowidjetList=====>>>"+JSON.stringify(newdynamowidjetList));
                                             deviceList.L[dposition].M.widgets.L=dynamowidjetList;
                                 }
                                 
                             }
                              payload.Item.device=deviceList;  
                                //console.log("\npayload=======>>"+JSON.stringify(payload));   
                         dynamodb.putItem(payload, function(err, data) {
                            if (err) 
                            {
                             context.fail('ERROR: Dynamo failed: ' + err);
                            } 
                            else 
                            {
                             
                                 if(rewardcount>0)
                                 {
                                     var params1 = { "RequestItems": {"widgetList": newdynamowidjetList}};
                                     console.log("\n\n\nparams===>>"+JSON.stringify(params1));     
                                    dynamodb.batchWriteItem(params1, function(err, data)
                                    {
                                     if (err) 
                        			   {
                        				context.fail('ERROR: Dynamo failed: ' + err);
                        			   } 
                        			   else 
                        			   {           for(var ii=1;ii<7;ii++)
                                                    {
                                                        if(newdynamowidjetList1[""+ii].length>0)
                                                        {
                                                			var paramsnew = { "RequestItems": {"widgetList": newdynamowidjetList1[""+ii]}};
                                                             console.log("\n\n\nparams===>>"+JSON.stringify(paramsnew));     
                                                            dynamodb.batchWriteItem(paramsnew, function(err, data)
                                                            {
                                                             if (err) 
                                                			   {
                                                				context.fail('ERROR: Dynamo failed: ' + err);
                                                			   } 
                                                			   else 
                                                			   { 
                                                			       console.log("data=="+JSON.stringify(data));
                                                			   }
                                                            });
                                                        }
                                                    }
                                    //-----------------------------------------------------------------------------------
                                                var userid=event.username;
                                                var reCount=rewardcount;
                                                var tcreatetime=""+rewardcreatetime;
                                                
                                                var Rewardsearchload={};
                                                Rewardsearchload.TableName = ""+RewardTable;
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
                                                       rewardload.TableName=""+RewardTable;
                                                       
                                                      // console.log("\n\n\n data.Item=======>>"+JSON.stringify(data.Item));
                                                   
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
                                                       TableName: ""+TaskListTable,
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
                                                                      uniqueid =parseInt(rewardload.Item.Activity_Progress.L[ln-1].M.uniqueid.S);
                                                                   
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
                                                          // rewardactarray
                                                             for(var k=0;k<rewardactarray.length;k++)
                                                             {
                                                                 uniqueid=uniqueid+1;
                                                                 var robj=rewardactarray[k];
                                                                 robj["uniqueid"]={"S":""+uniqueid};
                                                                 robj["taskheading"]={"S":""+sdata[0]["taskname"]["S"]};
                                                                 rewardload.Item.Activity_Progress.L.push({"M":robj});
                                                             }
                                                           
                                                         /*  var activityObj={
                                                                       "uniqueid":{"S":""+uniqueid},
                                                                       "taskheading":{"S":""+sdata[0]["taskname"]["S"]},
                                                                       "timestmap":{"S":""+tcreatetime}
                                                                   };*/
                                                            // rewardload.Item.Activity_Progress.L.push({"M":activityObj});
                                                            //console.log("\n\n\nrewardload.Item.===>>"+JSON.stringify(rewardload));
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
                                    });
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
                        else{
                             context.succeed('No user exists.');
                        }
                     }
          
         });
         
     
           
}