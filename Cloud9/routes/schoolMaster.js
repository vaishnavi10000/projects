var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var MysqlConnection = require('../model/MysqlConnection')
var apiResponse = require('../response');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var request = require('request');

/**
 * @Author: Vaishnavi
 * @description:Api to dump school_master data to mongo db
 * Return:JSON
 * Params:null
 */

router.get('/schoolMaster', function(req, res, next) {
    MysqlConnection.getConnection(function(err, connection) {

        if (err) {
            apiResponse.getData(res, 1001, 'Internal server error(Cannot connect to host)', [{}]);
        } else {
            fs.readFile('public/school_modified_date.txt', 'utf8', function(err, date) {
                if (!date) {
                    var query = "SELECT  modified_date FROM school_master ORDER BY modified_date desc limit 1";

                    connection.query(query, function(err, schools) {
                        if(err){
                              apiResponse.getData(res, 1001, 'Internal server error(1st sync)', [{}]);
                        }else{
                               fs.writeFile('public/school_modified_date.txt', schools[0].modified_date, function(err) {
                            if (err) {
                                apiResponse.getData(res, 1001, 'Something went wrong(cannot write to file1)', [{}]);
                            } else {
                                apiResponse.getData(res, 1002, 'Successfully Synced(1st Sync)', [{}]);
                            }
                           });
                        }
                     

                    });

                } else {
                    fs.readFile('public/school_modified_date.txt', 'utf8', function(err, date) {
                        if (date) {
                            function dateFormat(date) {
                                var TempfromDate = new Date(date);
                                var month = TempfromDate.getMonth() + 1;
                                return TempfromDate.getFullYear() + '-' + month + '-' + TempfromDate.getDate() + ' ' + TempfromDate.getHours() + ':' + TempfromDate.getMinutes() + ':' + TempfromDate.getSeconds();

                            }

                            var modifiedDate = dateFormat(date);
                            var query = "SELECT sm.school_id,sm.school_name,sum(CASE WHEN um.role_id=1 THEN 1 ELSE 0 END) AS teacher_count,sum(CASE WHEN um.role_id=2 THEN 1 ELSE 0 END) AS student_count,sm.erp_code,sm.category_id,concat(COALESCE(am.address_line_1,''),' ',COALESCE(am.address_line_2,''),' ',COALESCE(stm.state_name,''),' ',COALESCE(ctm.country_name,'')) as address,sm.modified_date FROM school_master sm left JOIN user_master um on sm.school_id = um.school_id left JOIN address_master am on sm.address_id=am.address_id left JOIN state_master stm on am.state_id=stm.state_id left JOIN country_master ctm on am.country_id=ctm.country_id where sm.modified_date>'" + modifiedDate + "' GROUP BY sm.school_id  order by sm.modified_date desc"

                            connection.query(query, function(err, schools) {
                                if (err) {
                                    apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);

                                } else {

                                    if (schools.length > 0) {
                                        var modified_date = schools[0].modified_date;
                                        MongoClient.connect(pool.MongoUrl, function(err, db) {
                                            if (err) {
                                                apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);
                                            } else {
                                                insertSchools(db, schools, function(err, data) {

                                                    if (err) {
                                                        apiResponse.getData(res, 1001, 'Internal Server Error-1', [err]);
                                                    } else {
                                                        db.close();
                                                        fs.writeFile('public/school_modified_date.txt', modified_date, function(err) {
                                                            if (err) {
                                                                apiResponse.getData(res, 1001, 'Something Went Wrong(Cannot write to file)', [{}]);
                                                            } else {

                                                                var result = {
                                                                    "result": data
                                                                }
                                                                apiResponse.getData(res, 1006, 'Successfully Synced', [result]);
                                                            }
                                                        });

                                                    }
                                                });
                                            }
                                        });
                                    }else if(schools==undefined){
                                        apiResponse.getData(res, 1003, 'Schools undefined', [{}]);
                                    } else {
                                        apiResponse.getData(res, 1006, 'No data to sync', [{}]);
                                    }
                                }
                            });
                        } else {
                                apiResponse.getData(res, 1002, 'Something went wrong(Cannot Read date2)', [err]);
                            }
                    });
                }
            });
        }
    })

})

var insertSchools = function(db, schools, callback) {
    var resultArr = [];
    var errArr = [];
    if (schools != null) {
        for (var i = 0; i < schools.length; i++) {
            db.collection('school_master').update({
                "school_id": schools[i].school_id
            }, {
                $set: {
                    "school_id": schools[i].school_id,
                    "school_name": schools[i].school_name,
                    "teacher_count": schools[i].teacher_count,
                    "student_count": schools[i].student_count,
                    "erp_code": schools[i].erp_code,
                    "category_id": schools[i].category_id,
                    "address": schools[i].address
                },
                $currentDate: {
                    "last_modified": true
                }
            }, {
                upsert: true
            }, function(err, result) {
                if (err) {
                    errArr.push(err);
                    if (errArr.length == schools.length) {
                        callback(err, null);
                    }
                  } else {

                    resultArr.push(result.result);
                    if (resultArr.length == schools.length) {
                        callback(null, resultArr);
                    }
                }
            });
        }
    } else {
        callback(err, null);
    }
};


module.exports = router;