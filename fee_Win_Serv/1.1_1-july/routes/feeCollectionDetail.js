var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var mssql = require('mssql');
var request = require('request');
var logging = require('../createLog');



/* FeePayment Module
 * Payal Vishwakarma - 20/04/2016
 * Method to dump  data into middleware database
 * Request:                 
 * Response:If new records resent then msg "Data synced successfully"
 */
router.get('/data', function (req, res, next) {
    var startDate = new Date();
    var startTime = startDate.getMilliseconds();

    request.post({
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        url: req.protocol + '://' + "54.169.111.15:3005" + "/fee/details",
    }, function (error, response, body) {

        if (error) {
            /*For logging API response*/
            var endDate = new Date();
            var endTime = endDate.getMilliseconds();
            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
            logging.getLog("Dump data into middleware database API(Fetch data):", completePath, '', startTime, 'Internal server error', endTime);
            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
        } else if (body == undefined) {
            /*For logging API response*/
            var endDate = new Date();
            var endTime = endDate.getMilliseconds();
            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
            logging.getLog("Dump data into middleware database API(Fetch data):", completePath, '', startTime, 'Something went wrong.Try Again!', endTime);
            apiResponse.getData(res, 1001, 'Something went wrong.Try Again!', [{}]);
        } else {
            var newLedgers1 = JSON.parse(body);
            if (newLedgers1.statusCode == 1005) {
                /*For logging API response*/
                var endDate = new Date();
                var endTime = endDate.getMilliseconds();
                var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                logging.getLog("Dump data into middleware database API(Fetch data):", completePath, '', startTime, 'No new data found', endTime);
                apiResponse.getData(res, 1002, 'No new data found', [{}]);
            } else if (newLedgers1.statusCode == 1001) {
                /*For logging API response*/
                var endDate = new Date();
                var endTime = endDate.getMilliseconds();
                var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                logging.getLog("Dump data into middleware database API(Fetch data):", completePath, '', startTime, 'Internal server error', endTime);
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            } else if (newLedgers1.statusCode == 1006 && newLedgers1.feeDetails.length > 0) {
                var newLedgers = newLedgers1.feeDetails;
                var ledgerStr = '';
                for (var i = 0; i < newLedgers.length; i++) {
                    if(newLedgers[i].Fliplearn_Insert_Date == null){
                       /*For logging API response*/
                var endDate = new Date();
                var endTime = endDate.getMilliseconds();
                var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                logging.getLog("Dump data into middleware database API(insert data):", completePath, '', startTime, 'Null values cant be inserted', endTime);
                apiResponse.getData(res, 1001, 'Null values can not be inserted', [{}]);  
                    }
                    var thedate = newLedgers[i].Fliplearn_Insert_Date.substring(0, 10);
                    ledgerStr += "('" + newLedgers[i].Journal_Template_Name + "','" + newLedgers[i].Journal_Batch_Name + "'," + newLedgers[i].Line_No + ",'" + newLedgers[i].Posting_Date + "'," + newLedgers[i].Document_Type + ",'" + newLedgers[i].Document_No + "'," + newLedgers[i].Account_Type + ",'" + newLedgers[i].Account_No + "','" + newLedgers[i].Description + "'," + newLedgers[i].Amount + "," + newLedgers[i].Bal_Account_Type + ",'" + newLedgers[i].Bal_Account_No + "','" + newLedgers[i].Cheque_No + "','" + newLedgers[i].External_Document_No + "','" + newLedgers[i].Cheque_Date + "','" + newLedgers[i].Class + "'," + newLedgers[i].Insert_Status + ",'" + thedate + "','" + newLedgers[i].Source_Code + "','" + newLedgers[i].Company_Name + "','" + newLedgers[i].System_Generated_No + "'),"
                };
                ledgerStr = ledgerStr.substring(0, ledgerStr.length - 1);
                var id = newLedgers[(newLedgers.length) - 1].Journal_AutoId;
                var query1 = 'INSERT INTO [Tbl_Gen_ Journal Line] ([Journal Template Name],[Journal Batch Name],[Line No_] ,[Posting Date] ,[Document Type],[Document No_],[Account Type],[Account No_],[Description],[Amount],[Bal_ Account Type],[Bal_ Account No_],[Cheque No_],[External Document No_],[Cheque Date],[Class],[InsertStatus],[FliplernInsertDate],[Source Code],[Company Name],[System Generated No_]) values ' + ledgerStr;
               
                pool.connection2.then(function (recordset) {
                    var request_connection2 = new mssql.Request();

                    request_connection2.query(query1, function (err, recordset, affected) {
                        if (affected != undefined && affected == newLedgers.length) {
                            request.post({
                                headers: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                url: req.protocol + '://' + "54.169.111.15:3005" + "/fee/delete",
                                form: {
                                    'id': id
                                }
                            }, function (error, response, body) {
                                if (!error) {
                                    var result = JSON.parse(body);

                                    if (result.statusCode == 1001) {
                                        /*For logging API response*/
                                        var endDate = new Date();
                                        var endTime = endDate.getMilliseconds();
                                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                        logging.getLog("Dump data into middleware database API(Delete data):", completePath, '', startTime, 'Data dumped but deletion failed', endTime);
                                        apiResponse.getData(res, 1001, 'Data dumped but deletion failed', [{}]);
                                    } else if (result.statusCode == 1006) {
                                        /*For logging API response*/
                                        var endDate = new Date();
                                        var endTime = endDate.getMilliseconds();
                                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                        logging.getLog("Dump data into middleware database API:", completePath, '', startTime, 'Data synced successfully' + '  Affected rows:' + affected, endTime);
                                        apiResponse.getData(res, 1006, 'Data synced successfully.' + '  Affected rows:' + affected, [{}]);
                                    } else if (result.statusCode == 1005) {
                                        /*For logging API response*/
                                        var endDate = new Date();
                                        var endTime = endDate.getMilliseconds();
                                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                        logging.getLog("Dump data into middleware database API(Delete data):", completePath, '', startTime, 'No record deleted', endTime);
                                        apiResponse.getData(res, 1006, 'No record deleted', [{}]);
                                    }

                                } else if (body == undefined) {
                                    /*For logging API response*/
                                    var endDate = new Date();
                                    var endTime = endDate.getMilliseconds();
                                    var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                    logging.getLog("Dump data into middleware database API(Delete data):", completePath, '', startTime, 'Something went wrong.Try Again!', endTime);
                                    apiResponse.getData(res, 1001, 'Something went wrong.Try Again!', [{}]);
                                } else {
                                    /*For logging API response*/
                                    var endDate = new Date();
                                    var endTime = endDate.getMilliseconds();
                                    var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                    logging.getLog("Dump data into middleware database API(Delete data):", completePath, '', startTime, 'Deletion Failed', endTime);
                                    apiResponse.getData(res, 1001, 'Deletion Failed', [{}]);
                                }
                            });

                        } else {
                            /*For logging API response*/
                            var endDate = new Date();
                            var endTime = endDate.getMilliseconds();
                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                            logging.getLog("Dump data into middleware database API(Insert data):", completePath, '', startTime, 'Insertion Failed', endTime);
                            apiResponse.getData(res, 1001, 'Something went wrong.Try Again', [{}]);
                        }
                    });
                }).catch(function (err) {
                    /*For logging API response*/
                    var endDate = new Date();
                    var endTime = endDate.getMilliseconds();
                    var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                    logging.getLog("Dump data into middleware database API:", completePath, '', startTime, 'Internal server error', endTime);

                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                });
            }
        }

    });
});


module.exports = router;