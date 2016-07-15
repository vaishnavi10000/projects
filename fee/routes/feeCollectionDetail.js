var express = require('express');
var router = express.Router();
var apiResponse = require('../response');
var request = require('request');
var logging = require('../createLog');


/* FeePayment Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get data from fliplearn database
 * Request: 
 * Response: new records  if present
 */
var ConfigNames = '';
process.argv.forEach((val, index) => {
	console.log("----"+val+"----");
  if(index == 2 && val == 'stg'){
	  ConfigNames = '/pool-stg.js';
	  //var pool = require(__dirname+'/pool-stg.js');
  }else if(index == 2 && val == 'prod'){
	  ConfigNames = '/pool-live.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else if(index == 2 && val == 'int'){
	  ConfigNames = '/pool-int.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else if(index == 2 && val == 'dev'){
	  ConfigNames = '/pool-dev.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else{
	  //var pool = require(__dirname+'/pool-local.js');
	  ConfigNames = '/pool-local.js';
  } 
});
var pool = require('../model'+ConfigNames);
router.post('/details', function (req, res, next) {
    var startDate = new Date();
    var startTime = startDate.getMilliseconds();
    pool.getConnection(function (err, connection) {
        if (err) {
            /*For logging API response*/
            var endDate = new Date();
            var endTime = endDate.getMilliseconds();
            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
            logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
        } else {
            var query1 = "select max(last_inserted_id)  as maxId from Fee_Temp";
            connection.query(query1, function (err, max_id) {
                    if (!err) {
                        if (max_id[0].maxId == null) { // when no data present in Fee_Temp
                            var query2 = "select * from Tbl_Gen_Journal_Line";
                            connection.query(query2, function (err, data) {
                                    if (!err) {
                                        if (data.length == 0) {
                                            connection.release();
                                            /*For logging API response*/
                                            var endDate = new Date();
                                            var endTime = endDate.getMilliseconds();
                                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                            logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'No data found', endTime);
                                            apiResponse.getData(res, 1005, "No data found", [{}]);
                                        } else {
                                            var response = {
                                                feeDetails: data
                                            }
                                            connection.release();
                                            var endDate = new Date();
                                            var endTime = endDate.getMilliseconds();
                                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                            logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'Success', endTime);
                                                apiResponse.getData(res, 1006, 'Success', [response]);
                                            }
                                        } else {
                                            connection.release();
                                            /*For logging API response*/
                                            var endDate = new Date();
                                            var endTime = endDate.getMilliseconds();
                                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                            logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
                                            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                                        }
                                    });
                            } else if (max_id[0].maxId != null) {
                                var query3 = "select * from Tbl_Gen_Journal_Line where Journal_AutoId >" + max_id[0].maxId;
                                connection.query(query3, function (err, data) {
                                    if (!err) {
                                        if (data.length == 0) {
                                            connection.release();
                                            apiResponse.getData(res, 1005, "No data found", [{}]);
                                        } else {
                                            var response = {
                                                feeDetails: data
                                            }
                                            connection.release();
                                            apiResponse.getData(res, 1006, 'Success', [response]);
                                        }
                                    } else {
                                        connection.release();
                                        /*For logging API response*/
                                        var endDate = new Date();
                                        var endTime = endDate.getMilliseconds();
                                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                                        logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
                                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                                    }
                                });

                            }
                        } else {
                            connection.release();
                            /*For logging API response*/
                            var endDate = new Date();
                            var endTime = endDate.getMilliseconds();
                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                            logging.getLog("Fetch data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
                            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                        }
                    });
            }
        });
    });

/* FeePayment Module
 * Payal Vishwakarma - 20/04/2016
 * Method to delete records from fliplearn table
 * Request:id
 * Response: Inserts this id into Fee_Temp table in fliplearn and deletes all records till this id from Tbl_Gen_Journal_Line
 */
router.post('/delete', function (req, res, next) {
    var startDate = new Date();
    var startTime = startDate.getMilliseconds();
    if (!req.body.id) {
        apiResponse.getData(res, 1007, 'Input missing', [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                /*For logging API response*/
                var endDate = new Date();
                var endTime = endDate.getMilliseconds();
                var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                logging.getLog("Delete data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
            } else {
                var current_date = new Date();
                var month = current_date.getMonth() + 1;
                var dateToInsert = current_date.getFullYear() + '-' + month + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                var query1 = 'insert into Fee_Temp (last_inserted_id,insertion_date)values(' + req.body.id + ',' + '"' + dateToInsert + '")';
                connection.query(query1, function (err, rows) {
                    if (err) {
                        connection.release();
                        /*For logging API response*/
                        var endDate = new Date();
                        var endTime = endDate.getMilliseconds();
                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                        logging.getLog("Delete data from fliplearn API:", completePath, '', startTime, 'Insertion in Fee_Temp table failed', endTime);
                    }
                });
                var query2 = 'DELETE FROM Tbl_Gen_Journal_Line WHERE Journal_AutoId <=' + req.body.id;
                connection.query(query2, function (err, affectedRows) {
                    if (!err) {
                        if (affectedRows == 0) {
                            connection.release();
                            /*For logging API response*/
                            var endDate = new Date();
                            var endTime = endDate.getMilliseconds();
                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                            logging.getLog("Delete data from fliplearn API:", completePath, '', startTime, 'No record deleted', endTime);
                            apiResponse.getData(res, 1005, "No record deleted", [{}]);
                        } else {
                            var response = {
                                deletedRows: affectedRows
                            }
                            connection.release();
                            /*For logging API response*/
                            var endDate = new Date();
                            var endTime = endDate.getMilliseconds();
                            var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                            logging.getLog("Delete data from fliplearn API:", completePath, '', startTime, 'Success', endTime);
                            apiResponse.getData(res, 1006, 'Success', [response]);
                        }
                    } else {
                        connection.release();
                        /*For logging API response*/
                        var endDate = new Date();
                        var endTime = endDate.getMilliseconds();
                        var completePath = "http://" + req.headers.host + "" + req.originalUrl;
                        logging.getLog("Delete data from fliplearn API:", completePath, '', startTime, 'Internal server error', endTime);
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                    }
                });

            }
        });
    }

});

module.exports = router;