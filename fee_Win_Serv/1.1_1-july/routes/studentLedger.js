var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var mssql = require('mssql');
var request = require('request');
var fs = require('fs');

/**
 * @Author: vaishnavi
 * @description:Api to retrive student data from MSsql ledger table(Temp Det_ Cust_ Ledg_ Entry)
 * Return:JSON
 * Params:null
 */
router.get('/getLedger', function(req, res, next) {
    fs.readFile('public/date.txt','utf8',function(err, date) {
        if (!date) {
            var query = "SELECT TOP 10 * FROM [Temp Det_ Cust_ Ledg_ Entry] ORDER BY [Posting Date] desc";
            pool.connection2.then(function(recordset) {
                var request_connection = new mssql.Request();
                request_connection.query(query).then(function(postingDate) {
                    var lastUpdatedDate = new Date(postingDate[0]["Posting Date"]);
                    fs.writeFile('public/date.txt', postingDate[0]["Posting Date"], function(err) {
                        if (err) {
                            apiResponse.getData(res, 1001, 'Something went wrong(cannot write to file1)', [{}]);
                        } else {
                            apiResponse.getData(res, 1002, 'Successfully Synced(1st Sync)', [{}]);
                        }
                    });

                }).catch(function(err) {
                    apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);

                });
            }).catch(function(err) {
                apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);

            });
        } else {
            fs.readFile('public/date.txt','utf8',function(err, date) {
			

                if (err) throw err;
                else {
                    var TempfromDate = new Date(date);
                    var fromDate = TempfromDate.toISOString();
                    var query = "select * from  [Temp Det_ Cust_ Ledg_ Entry] where [Posting Date]>'" + fromDate + "'" + "ORDER BY [Posting Date] desc";
                    pool.connection2.then(function(recordset) {
                        var requestConnection = pool.request;
                        requestConnection.query(query).then(function(ledgerRecord) {
						
					
                            if (ledgerRecord.length > 0) {
                                requestConnection.cancel();
                               
                                        request.post({
                                            headers: {
                                                'content-type': 'application/x-www-form-urlencoded'
                                            },
                                            url: req.protocol + '://' + "54.169.111.15:3005" + "/student/dumpLedger",
                                            form: {
                                                'ledgers': JSON.stringify(ledgerRecord)
                                            }
                                        }, function(error, response, body) {
										
                                            if (error) {
                                                apiResponse.getData(res, 1001, 'Something went wrong(Cannot connect to API)', [{}]);
                                            }else if(body==undefined){
                                                 apiResponse.getData(res, 1006, 'Something went wrong(Body not defined)', [{}]);
                                            } else {
											
                                                 var newBody = JSON.parse(body);
                                                if (newBody.statusCode == 1006) {
                                                        fs.writeFile('public/date.txt', ledgerRecord[0]['Posting Date'], function(err) {
                                                if (err) {
                                                apiResponse.getData(res, 1001, 'Something Went Wrong(Cannot write to file)', [{}]);
                                                } else {
                                                      apiResponse.getData(res, 1006, 'Successfully Synced', [{
                                                        "affectedRows": newBody.affectedRows }]);
                                                }
                                                });
                                                } else if (newBody.statusCode == 1007) {
                                                    apiResponse.getData(res, 1007, 'Input Date Missing for getLedge API', [{}]);
                                                } else if (newBody.statusCode == 1001) {
                                                    apiResponse.getData(res, 1001, 'Internal Server Error(MySql database error)', [{}]);
                                                } else {
                                                    apiResponse.getData(res, 1002, 'Something went wrong(My sql error)', [{}]);
                                                }
                                            }
                                        });
                                  
                            } else {
                                requestConnection.cancel();
                                apiResponse.getData(res, 1002, 'No New data to sync', [{}]);
                            }
                        }).catch(function(err) {
                            requestConnection.cancel();
                            apiResponse.getData(res, 1001, 'Internal Server Error-2', [{}]);
                        });
                    }).catch(function(err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error-2', [{}]);
                    });
                }

            });
        }
    }); //check file exists
})


module.exports = router;