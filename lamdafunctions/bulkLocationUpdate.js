'use strict';
console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();
exports.handler =function(event, context, callback) 
{

console.log(Request receivedn, JSON.stringify(event));
console.log(Context receivedn, JSON.stringify(context));

const payload = {};
const searchload = {};
const returndata = {};


const locationDataTable=LocationData;

        
          const locpayload = {};
          const locsearchload = {};
		  
		        var locListFromDDb =[];
          var locListFromMob =event.locationdata.locationdata;          
          var newDevid= event.locationdata.deviceid;
          
          locpayload.TableName =locationDataTable;
          locsearchload.TableName =locationDataTable;
          
          var key = {'username' {'S'event.username}};
          locsearchload.Key = key;
			 
           dynamodb.getItem(locsearchload, function(err, data) {
                if (err) 
                {
                    returndata.status = 503
                    returndata.messageText = Service Unavailable
                    context.fail(new Error(returndata.status +   + returndata.messageText));
                } 
                else 
                {
                    if(data.Item)
                    {
                        locpayload.Item=data.Item;
                        var locStaArray=locpayload.Item.devicelist.L;
                        
                    }
                    else
                    {
                      locpayload.Item={devicelist{L[{M{deviceid{S+event.locationdata.deviceid},locationdata{L[]}}}]  },username {S +event.username}};
                    }
                    var divFlag=0;
                    var divCount=0
                        locListFromDDb=locpayload.Item.devicelist.L;
                     for(var i=0;ilocListFromDDb.length;i++)
    							            {
    							               if(newDevid==locListFromDDb[i].M.deviceid.S)
    							               {
    							                divFlag=1;
    							                divCount=i;
    							                break;
    							               }
    							            }
    							            if(divFlag==0)
    							            {
    							              locListFromDDb.push({M {deviceid {S +newDevid},locationdata {L []}}});
    							              divCount=locListFromDDb.length-1;
    							            }
    							            for(var lock=0;locklocListFromMob.length;lock++)
    							            {
                  							    var locObj={
                              M {
                                lat {S +locListFromMob[lock].lat},
                                lng {S +locListFromMob[lock].lng},
                                time{S +locListFromMob[lock].time},
                                speed{S +locListFromMob[lock].speed},
                                provider {S +locListFromMob[lock].provider},
                                accuracy {S +locListFromMob[lock].accuracy}
                              }
                            };
    							              locListFromDDb[divCount].M.locationdata.L.push(locObj);
    							            }
    							              locpayload.Item.devicelist.L=locListFromDDb;
    							              console.log(nlocpayload=======+JSON.stringify(locpayload));
                         dynamodb.putItem(locpayload, function(err, data) {
                            if (err) 
                            {
                             context.fail('ERROR Dynamo failed ' + err);
                            } 
                            else 
                            {
                                console.log('App  Success ' + JSON.stringify(data, null, '  '));
                               returndata.locStatus='SUCCESS';
                                context.succeed('LOC SUCCESS');
                             }
                         });
                }
           });
           
}