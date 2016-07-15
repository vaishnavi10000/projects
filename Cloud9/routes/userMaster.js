var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var MysqlConnection = require('../model/MysqlConnection')
var apiResponse = require('../response');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var request = require('request');

/**
 * @Author: Himanshu Bhatti
 * @description:Api to dump user_master data to mongo db
 * Return:JSON
 * Params:null
 */

router.get('/userMaster', function (req, res, next) {
    MysqlConnection.getConnection(function (err, connection) {

        if (err) {
            apiResponse.getData(res, 1001, 'Internal server error(Cannot connect to host)', [{}]);
        } else {
            fs.readFile('public/user_modified_date.txt', 'utf8', function (err, date) {
                if (!date) {
                    var query = "SELECT  * FROM user_master ORDER BY modified_date desc limit 1";

                    connection.query(query, function (err, users) {
                        fs.writeFile('public/user_modified_date.txt', users[0].modified_date, function (err) {
                            if (err) {
                                apiResponse.getData(res, 1001, 'Something went wrong(cannot write to file1)', [{}]);
                            } else {
                                apiResponse.getData(res, 1002, 'Successfully Synced(1st Sync)', [{}]);
                            }
                        });

                    });

                } else {
                    fs.readFile('public/user_modified_date.txt', 'utf8', function (err, date) {
                        if (date) {
                            function dateFormat(date) {

                                var TempfromDate = new Date(date);
                                var month = TempfromDate.getMonth() + 1;
                                return TempfromDate.getFullYear() + '-' + month + '-' + TempfromDate.getDate() + ' ' + TempfromDate.getHours() + ':' + TempfromDate.getMinutes() + ':' + TempfromDate.getSeconds();

                            }
                            var modifiedDate = dateFormat(date);
                            var query = "select um.uuid,CONCAT_WS('',um.first_name,um.middle_name,um.last_name)as name,um.role_id,up.gender,up.date_of_birth,up.email_id,up.mobile_number,CONCAT_WS('',am.address_line_1,am.address_line_2) as address,cm.city_name,sm.state_name,coum.country_name,ucm.UUID as child_id,ums.first_name as child_name,usrmstr.UUID as parent_id,usrmstr.first_name as Parent_name,um.modified_date from user_master um left join user_profile up on um.UUID=up.UUID left join user_address ua on um.UUID=ua.UUID left join address_master am on ua.address_id=am.address_id left join city_master cm on am.city_id=cm.city_id left join state_master sm on am.state_id=sm.state_id left join country_master coum on am.country_id=coum.country_id left join user_contacts uc on um.UUID=uc.UUID left join user_contacts_map ucm on uc.contact_id=ucm.contact_id left join user_master as ums  on ums.UUID=ucm.UUID left join user_contacts_map usrcm on um.UUID=usrcm.UUID left join user_contacts usrcon on usrcm.contact_id=usrcon.contact_id left join user_master usrmstr on usrmstr.UUID=usrcon.UUID where um.active=1 and um.modified_date>'" + modifiedDate + "' order by um.modified_date desc"

                            connection.query(query, function (err, users) {
                                if (err) {
                                    apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);

                                } else {
                                    if (users.length > 0) {
                                        var modified_date = users[0].modified_date;
                                        MongoClient.connect(pool.MongoUrl, function (err, db) {
                                            if (err) {
                                                apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);
                                            } else {
                                                insertUsers(db, users, function (err, data) {
                                                    if (err) {
                                                        apiResponse.getData(res, 1001, 'Internal Server Error-1', [{}]);
                                                    } else {
                                                        db.close();
                                                        fs.writeFile('public/user_modified_date.txt', modified_date, function (err) {
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
                                    } else {
                                        apiResponse.getData(res, 1006, 'No data to sync', [{}]);
                                    }
                                }

                            });
                        } else {
                            apiResponse.getData(res, 1006, 'Something Went Wrong', [{}]);
                        }
                    });
                }
            });
        }
    })

})

var insertUsers = function (db, users, callback) {
    var resultArr = [];
    for (var i = 0; i < users.length; i++) {
        db.collection('user_master').update({
            "uuid": users[i].uuid
        }, {
            $set: {
                "name": users[i].name
                , "role_id": users[i].role_id
                , "gender": users[i].gender
                , "date_of_birth": users[i].date_of_birth
                , "email_id": users[i].email_id
                , "mobile_number": users[i].mobile_number
                , "address": users[i].address
                , "city_name": users[i].v
                , "state_name": users[i].state_name
                , "country_name": users[i].country_name
                , "child_id": users[i].child_id
                , "child_name": users[i].child_name
                , "parent_id": users[i].parent_id
                , "parent_name": users[i].parent_name
            }
            , $currentDate: {
                "last_modified": true
            }
        }, {
            upsert: true
        }, function (err, result) {
            if (err) {
                errArr.push(err);
                if (errArr.length == users.length) {
                    callback(err, null);
                }
            } else {
                resultArr.push(result.result);
                if (resultArr.length == users.length) {
                    callback(null, resultArr);

                }
            }
        });
    }
};


module.exports = router;