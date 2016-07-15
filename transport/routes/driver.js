var express = require('express');
var router = express.Router();
var pool = require('../model/pool');
var apiResponse = require('../response');
var auth = require('../authuser');
var config = require('../config');
var md5 = require('md5-node');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var schoolActive = require('../function/schoolActive');




/* Transport Module
 * Neeraj Kumar Mourya - 20/04/2016
 * Method to add driver 
 * Request: session_token,uuid,driver_name,mobile_no,licence,
 * Response:  driver_id,driver_name,mobile_no,licence,route_id,route_no,vehicle_id,vehicle_no
 */
function checkDriverUniqueId(schoolid,driverName, cb) {
    if (!schoolid) {

    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

            } else {
                var query1 = 'select count(UUID) as driverCount from user_master where role_id=20 and school_id=' + schoolid;

                connection.query(query1, function (err1, driverCount) {
                    var count = parseInt(JSON.parse(JSON.stringify(driverCount))[0].driverCount);
                    var dateObj = new Date();
                    var month = dateObj.getUTCMonth() + 1;
                    var year = dateObj.getUTCFullYear();
                    var totalDriver = parseInt(count) + parseInt(1);
                    var fullName = driverName.split(' ');
                    var firstName = fullName[0];
                    var randomNumber = firstName+"."+schoolid + "" + year.toString().substr(2, 2) + "" + month + "" + totalDriver;
                    cb(randomNumber);
                });
            }
        });
    }
};

function insertDriverInfo(res, req, uuid, driver_name, mobile_no, actual_path) {
    if (!req.headers.driver_name || !req.headers.mobile_no) {

        //if (!req.body.driver_name || !req.body.mobile_no || !req.body.licence){
        if (!req.headers.driver_name || req.headers.driver_name === '') {
            apiResponse.getData(res, 1005, "driver_name required", [{}]);
        } else if (!req.headers.mobile_no || req.headers.mobile_no === '') {
            apiResponse.getData(res, 1005, "mobile_no required", [{}]);
        }
        /*else if(req.body.licence || req.body.licence==''){
        			apiResponse.getData(res, 1005, "licence file required",null);		
        		}*/
    } else {
        var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        var name = /^(?![0-9\-\_/() {}<>])[a-zA-Z0-9\-\_/() {}<>]{3,50}[a-zA-Z0-9]+$/;
        if (req.headers.driver_name.match(name)) {


            if (req.headers.mobile_no.match(phoneno)) {

                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                    } else {
                        var query1 = 'select school_id from user_master where UUID=' + req.headers.uuid;

                        connection.query(query1, function (err1, schoolId) {

                            if (!err1) {
                                if (schoolId.length === 0) {
                                    connection.release();
                                    apiResponse.getData(res, 1005, "No school_id found ", [{}]);
                                } else {

                                    //check if driver exist in a school
                                    var sqlQuery = 'select um.UUID as id, um.first_name, um.middle_name, um.last_name, up.mobile_number, tri.id as route_id, tri.route_no, tri.licence, tri.vehicle_id, tv.vehicle_no from user_master as um left join user_profile as up on um.UUID = up.UUID left join transport_route_info as tri on um.UUID=tri.driver_id left join transport_vehicle as tv on tri.vehicle_id=tv.id where um.active=1 and up.mobile_number="' + req.headers.mobile_no + '"';

                                    connection.query(sqlQuery, function (sqlErr, driverInfo) {

                                        if (!sqlErr) {
                                            if (driverInfo.length > 0) {
                                                var response = {
                                                    driver_id: driverInfo[0].id,
                                                    first_name: driverInfo[0].first_name,
                                                    mobile_number: driverInfo[0].mobile_number,
                                                    licence: driverInfo[0].licence,
                                                    route_id: driverInfo[0].route_id,
                                                    route_no: driverInfo[0].route_no,
                                                    vehicle_id: driverInfo[0].vehicle_id,
                                                    vehicle_no: driverInfo[0].vehicle_no,
                                                };
                                                connection.release();
                                                apiResponse.getData(res, 1002, 'Mobile Number already exists', [response]);
                                            } else {
                                                //console.log(req.params.school_id)
                                                
                                                //add driver
                                                var today = new Date();

                                                checkDriverUniqueId(req.params.school_id,req.headers.driver_name, function (newId) {


                                                    if (!newId) {
                                                        connection.release();
                                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                    } else {
                                                        var dataToInsert = {
                                                            'login_id': newId,
                                                            'password': md5('123456'),
                                                            'first_name': req.headers.driver_name,
                                                            'middle_name': null,
                                                            'last_name': null,
                                                            'school_id': schoolId[0].school_id,
                                                            'role_id': 20,
                                                            'active': 1,
                                                            'updated_by': req.headers.uuid,
                                                            'created_date': today.toJSON(),
                                                            'modified_date': null,
                                                            'last_login': null,
                                                            'flag': 2,
                                                            'is_trial_registration': 0,
                                                            'receive_smartclassonline_alerts': 0,
                                                            'current_active_session_id': null,
                                                            'device_type': null,
                                                        };

                                                        connection.query("insert into user_master SET ?", dataToInsert, function (err, data) {
                                                           /* console.log(err);*/
                                                            var today = new Date();
                                                            var driver_info = {
                                                                'driver_id': data.insertId,
                                                                'licence': actual_path,
                                                                'created_on': today.toJSON(),
                                                                'created_by': req.headers.uuid,
                                                                'modified_on': null,
                                                                'modified_by': req.headers.uuid,
                                                                'deleted': 0,
                                                                'status': 1
                                                            };

                                                            if (!err) {
                                                                connection.query("insert into transport_driver_info SET ?", driver_info, function (err, data) {
                                                                    //console.log(err);
                                                                    var driver_info = {
                                                                        'driver_id': data.insertId,
                                                                        'licence': actual_path
                                                                    };

                                                                    if (!err) {} else {
                                                                        connection.release();
                                                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                                    }

                                                                });
                                                                var response = {
                                                                    UUID: data.insertId,
                                                                    first_name: req.headers.driver_name,
                                                                    mobile_number: req.headers.mobile_no,
                                                                    licence: actual_path
                                                                        //route_id:driverInfo[0].route_id,
                                                                        //route_no:driverInfo[0].route_no,
                                                                        //vehicle_id:driverInfo[0].vehicle_id,
                                                                        //vehicle_no:driverInfo[0].vehicle_no,								
                                                                };
                                                                // apiResponse.getData(res, 1002, 'success',[response]);
                                                                var insertData = {

                                                                    'UUID': data.insertId,
                                                                    'old_login_id': null,
                                                                    'first_password': null,
                                                                    'gender': 'male',
                                                                    'nickname': null,
                                                                    'email_id': null,
                                                                    'mobile_number': req.headers.mobile_no,
                                                                    'profile_picture': null,
                                                                    'is_email_verified': null,
                                                                    'is_mobile_verified': null,
                                                                    //'h_category_id':null,
                                                                    //'h_answer':null,
                                                                    'date_of_birth': null,
                                                                    'ews': null,
                                                                    'erp_code': null,
                                                                    'admission_number': null,
                                                                    'old_UUID': null,
                                                                    'active': 1,
                                                                    'updated_by': 1,
                                                                    'created_date': today.toJSON(),
                                                                    'modified_date': null,
                                                                    'roll_no': 0,
                                                                    'smscode': null,
                                                                    'is_email_invalid': null,
                                                                    'is_mobile_invalid': null,
                                                                    'email_code': null,
                                                                }

                                                                connection.query("insert into user_profile SET ?", insertData, function (err, rowsInserted) {

                                                                    if (!err) {

                                                                        var resp = {
                                                                            UUID: data.insertId,
                                                                            first_name: req.headers.driver_name,
                                                                            mobile_number: req.headers.mobile_no,
                                                                            licence: actual_path,
                                                                            login_id:newId
                                                                        };
                                                                        connection.release();
                                                                        apiResponse.getData(res, 1006, 'Driver Added', [resp]);

                                                                    } else {
                                                                        connection.release();
                                                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                                    }
                                                                });


                                                            } else {
                                                                connection.release();
                                                                apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                            }

                                                        });

                                                    }
                                                });


                                            }
                                        } else {
                                            connection.release();
                                            apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                        }
                                        //end


                                    });
                                }



                            }

                        });

                    }

                });

            } else {
                apiResponse.getData(res, 1005, "Mobile no. not valid", [{}]);
            }
        } else {
            apiResponse.getData(res, 1005, "Driver name should be aplhanumaric with 3 to 50 character limit", [{}]);
        }
    }
}


router.post('/addDriver', auth.user, function (req, res, next) {
    var actual_path = null;

    var upload = multer({
        dest: config.AssetTempUploadDir,
        limits: {
            fileSize: config.UploadFileSize //in byte
        },
        onFileUploadStart: function (file) {
            console.log(file.name + ' uploading is ended ...');
        }
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            uploadStatus = false;
            // An error occurred when uploading 
            //fs.unlink(file.path); // delete the partially written file
            //return res.status("Upload file failed");
            //apiResponse.getData(res, 1008, 'File upload failed!', '');
        } else {
            if (req.file) {

                if (req.file != undefined) {
                    var fileInfo = req.file;
                    var extension = req.file.originalname.slice(-3);
                    var name = (fileInfo.filename).replace(/[^a-z0-9-_@#%=+{};.,!~`())\s]/gi, '').replace(/[\s]/g, '-');
                    var file_path = fileInfo.path.replace(/\\/g, "/");
                    actual_path = file_path + "." + extension;
                    fs.rename(file_path, actual_path, function (err) {
                        if (err) console.log('ERROR: ' + err);
                    });
                }
                insertDriverInfo(res, req, req.headers.uuid, req.headers.driver_name, req.headers.mobile_no, actual_path);
            } else {
                insertDriverInfo(res, req, req.headers.uuid, req.headers.driver_name, req.headers.mobile_no, null);
            }
        }
    });

});

/* Transport Module
 * Payal Vishwakarma - 19/04/2016
 * Method to delete driver and update entry in user_master 
 * Request: sesion_token,uuid in header  and driver_id in body
 * Response:Status message
 */
router.post('/deleteDriver', auth.user, function (req, res, next) {
    if (!req.body.driver_id) {
        apiResponse.getData(res, 1005, "driver_id required", [{}]);

    } else {
        schoolActive.checkActive(req.params.school_id, function (data) {
            if (data == true) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                    }
                    var queryUpdateMaster = "update user_master SET active=0, updated_by='" + req.headers.uuid + "' WHERE UUID='" + req.body.driver_id + "'";
                    connection.query(queryUpdateMaster, function (err, rows) {
                        if (!err) {
                            if (rows.changedRows == 0 || rows.length == 0) { // if driver already inactive or updation failed
                                connection.release();
                                apiResponse.getData(res, 1005, "Deletion not successful", [{}]);
                            } else {
                                var queryUpDriverProf = "update user_profile SET active=0 WHERE UUID='" +req.body.driver_id + "'";
                                connection.query(queryUpDriverProf, function (err, rows) {
                                    if (!err) {
                                        if (rows.changedRows == 0 || rows.length == 0) { // if driver already inactive or updation failed
                                            connection.release();
                                            apiResponse.getData(res, 1005, "Deletion not successful", [{}]);
                                        } else {
                                            var queryUpTpDriver = "update transport_driver_info SET deleted=1, modified_by='" + req.headers.uuid + "' WHERE driver_id='" + req.body.driver_id + "'";
                                            connection.query(queryUpTpDriver, function (err, rows) {
                                                if (!err) {

                                                }
                                            });
                                            connection.release();
                                            apiResponse.getData(res, 1006, 'Driver deleted', [{}]);
                                        };
                                    } else {
                                        connection.release();
                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);

                                    }
                                });
                            }


                        } else {
                            apiResponse.getData(res, 1005, 'School Inactive', [{}]);
                        }
                    });
                }); //else
            }

        });
    }
});

/*API to Update Driver*/

function updateDriverInfo(res, req, uuid, driver_name, mobile_no, actual_path) {
    if (!req.headers.driver_name || !req.headers.mobile_no) {
        //if (!req.body.driver_name || !req.body.mobile_no || !req.body.licence){
        if (!req.headers.driver_name || req.headers.driver_name === '') {
            apiResponse.getData(res, 1005, "driver_name required", [{}]);
        } else if (!req.headers.mobile_no || req.headers.mobile_no === '') {
            apiResponse.getData(res, 1005, "mobile_no required", [{}]);
        }
    } else {

        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

            } else {
                var query1 = 'select school_id from user_master where UUID=' + req.headers.uuid;

                connection.query(query1, function (err1, schoolId) {
                    if (!err1) {
                        if (schoolId.length === 0) {
                            connection.release();
                            apiResponse.getData(res, 1005, "No school_id found ", [{}]);
                        } else {

                            //check if driver exist in a school
                            var sqlQuery = 'select um.UUID as id, um.first_name, um.middle_name, um.last_name, up.mobile_number, tri.id as route_id, tri.route_no, tri.licence, tri.vehicle_id, tv.vehicle_no from user_master as um left join user_profile as up on um.UUID = up.UUID left join transport_route_info as tri on um.UUID=tri.driver_id left join transport_vehicle as tv on tri.vehicle_id=tv.id where um.role_id=20 and um.active=1 and up.mobile_number="' + req.headers.mobile_no + '" and up.UUID!=' + req.headers.driver_id;

                            connection.query(sqlQuery, function (sqlErr, driverInfo) {

                                if (!sqlErr) {
                                    if (driverInfo.length > 0) {
                                        var response = {
                                            driver_id: driverInfo[0].id,
                                            first_name: driverInfo[0].first_name,
                                            mobile_number: driverInfo[0].mobile_number,
                                            licence: driverInfo[0].licence,
                                            route_id: driverInfo[0].route_id,
                                            route_no: driverInfo[0].route_no,
                                            vehicle_id: driverInfo[0].vehicle_id,
                                            vehicle_no: driverInfo[0].vehicle_no,
                                        };
                                        connection.release();
                                        apiResponse.getData(res, 1002, 'Mobile Number already exists', [response]);
                                    } else {
                                        //add driver
                                        var today = new Date();
                                        var dataToInsert = {
                                            //'login_id': req.headers.mobile_no,
                                            //'password': md5('123456'),
                                            'first_name': req.headers.driver_name,
                                            'middle_name': null,
                                            'last_name': null,
                                            //'school_id': schoolId[0].school_id,
                                            //'role_id': 20,
                                            //'active': 1,
                                            'updated_by': req.headers.uuid,
                                            //'created_date': today.toJSON(),
                                            'modified_date': today.toJSON()
                                                //'last_login': null,
                                                //'flag': 2,
                                                //'is_trial_registration': 0,
                                                //'receive_smartclassonline_alerts': 0,
                                                //'current_active_session_id': null,
                                                //'device_type': null,
                                        };

                                        connection.query('update user_master SET ? where UUID=' + req.headers.driver_id + ' and school_id=' + schoolId[0].school_id + ' and role_id=' + 20 + ' and active=' + 1, dataToInsert, function (err, data) {
                                            var today = new Date();
                                            var driver_info = {
                                                'licence': actual_path,
                                                //'created_on': today.toJSON(),
                                                //'created_by':req.headers.uuid,
                                                'modified_on': today.toJSON(),
                                                'modified_by': req.headers.uuid,

                                                'deleted': 0,
                                                'status': 1
                                            };

                                            if (!err) {
                                                connection.query('update transport_driver_info SET ? where driver_id=' + req.headers.driver_id + ' and deleted=' + 0 + ' and status=' + 1, driver_info, function (err, data) {
                                                    var driver_info = {
                                                        'driver_id': req.headers.driver_id,
                                                        'licence': actual_path
                                                    };

                                                    if (!err) {} else {
                                                        connection.release();
                                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                    }

                                                });
                                                var response = {
                                                    UUID: req.headers.driver_id,
                                                    first_name: req.headers.driver_name,
                                                    mobile_number: req.headers.mobile_no,
                                                    licence: actual_path
                                                };
                                                var insertData = {

                                                    //'UUID': data.insertId,
                                                    //'old_login_id': null,
                                                    //'first_password': null,
                                                    //'gender': 'male',
                                                    //'nickname': null,
                                                    //'email_id': null,
                                                    'mobile_number': req.headers.mobile_no,
                                                    //'profile_picture': null,
                                                    //'is_email_verified': null,
                                                    //'is_mobile_verified': null,
                                                    //'h_category_id':null,
                                                    //'h_answer':null,
                                                    //'date_of_birth': null,
                                                    //'ews': null,
                                                    //'erp_code': null,
                                                    //'admission_number': null,
                                                    //'old_UUID': null,

                                                    //'active': 1,

                                                    'updated_by': req.headers.uuid,
                                                    //'created_date': today.toJSON(),
                                                    'modified_date': today.toJSON(),
                                                    //'roll_no': 0,
                                                    /*'smscode': null,
                                                    'is_email_invalid': null,
                                                    'is_mobile_invalid': null,
                                                    'email_code': null,*/
                                                }

                                                connection.query('update user_profile SET ? where UUID=' + req.headers.driver_id + ' and active=' + 1, insertData, function (err, rowsInserted) {

                                                    if (!err) {

                                                        var resp = {
                                                            UUID: req.headers.driver_id,
                                                            first_name: req.headers.driver_name,
                                                            mobile_number: req.headers.mobile_no,
                                                            licence: actual_path,
                                                            route_no: req.headers.route_no,
                                                            login_id:req.headers.login_id
                                                        };
                                                        connection.release();
                                                        apiResponse.getData(res, 1006, 'Driver Updated', [resp]);

                                                    } else {
                                                        connection.release();
                                                        apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                                    }
                                                });


                                            } else {
                                                connection.release();
                                                apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                            }

                                        });


                                    }
                                } else {
                                    connection.release();
                                    apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                                }
                                //end


                            });
                        }



                    }

                });
            }

        });
    }
}


router.post('/', auth.user, function (req, res, next) {
    var actual_path = null;

    var upload = multer({
        dest: config.AssetTempUploadDir,
        limits: {
            fileSize: config.UploadFileSize //in byte
        },
        onFileUploadStart: function (file) {
            console.log(file.name + ' uploading is ended ...');
        }
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            uploadStatus = false;
        } else {
            if (req.file) {

                if (req.file != undefined) {
                    var fileInfo = req.file;
                    var extension = req.file.originalname.slice(-3);
                    var name = (fileInfo.filename).replace(/[^a-z0-9-_@#%=+{};.,!~`())\s]/gi, '').replace(/[\s]/g, '-');
                    var file_path = fileInfo.path.replace(/\\/g, "/");
                    actual_path = file_path + "." + extension;
                    fs.rename(file_path, actual_path, function (err) {
                        if (err) console.log('ERROR: ' + err);
                    });
                }
                updateDriverInfo(res, req, req.headers.uuid, req.headers.driver_name, req.headers.mobile_no, actual_path);
            } else {
                updateDriverInfo(res, req, req.headers.uuid, req.headers.driver_name, req.headers.mobile_no, req.headers.licence);
            }
        }
    });



});

/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of drivers
 * Request: sesion_token and uuid in header
 * Response:List of drivers
 */
router.get('/getList/:allDriver', auth.user, function (req, res, next) {
        var flag = parseInt(req.params.allDriver);
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
            } else {
                if (flag) {
                    connection.query("select um.UUID, um.first_name,um.middle_name,um.last_name,up.mobile_number,um.login_id,um.school_id, um.role_id,td.licence,tr.route_no from user_master as um left join transport_route_info as tr on um.UUID=tr.driver_id left join user_profile as up on um.UUID = up.UUID left join transport_driver_info as td on um.UUID=td.driver_id where um.school_id=? and um.active=1 and um.role_id=20 and td.deleted=0 and td.status=1", [req.params.school_id], function (err, rows) {

                        if (!err) {
                            if (rows.length == 0) {
                                connection.release();
                                apiResponse.getData(res, 1005, "No Driver currently added", [{}]);
                            } else {
                                var response = {
                                    driverList: rows
                                }
                                connection.release();
                                apiResponse.getData(res, 1002, 'Ok', [response]);
                            }
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                        }
                    });
                } else {
                    connection.query("select um.UUID, um.first_name,um.middle_name, um.last_name,up.mobile_number,um.login_id,um.school_id, um.role_id,td.licence,tr.route_no from user_master as um left join transport_route_info as tr on um.UUID=tr.driver_id left join user_profile as up on um.UUID = up.UUID left join transport_driver_info as td on um.UUID=td.driver_id where um.school_id=? and um.active=1 and um.role_id=20 and tr.route_no is null and td.deleted=0 and td.status=1", [req.params.school_id], function (err, rows) {

                        if (!err) {
                            if (rows.length == 0) {
                                connection.release();
                                apiResponse.getData(res, 1005, "No Driver currently added", [{}]);
                            } else {
                                var response = {
                                    driverList: rows
                                }
                                connection.release();
                                apiResponse.getData(res, 1002, 'Ok', [response]);
                            }
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                        }
                    });
                }
            }

        });
    })
/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of drivers
 * Request: sesion_token and uuid in header
 * Response:List of drivers in a school which are assigned
 if value==true ,then all the stoppages along with the student count will be in response
 if value==false,then only those  stoppages which have students on them will be there in response
 */
router.get('/listAll/:value', auth.user, function (req, res, next) {
     if (!req.params.value) {
        apiResponse.getData(res, 1005, "true or false in params  required", [{}]);
    } 
    else{ 
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'error in connection', [{}]);
            } else {
                    connection.query("select um.UUID, um.first_name,um.middle_name, um.last_name,up.mobile_number,tr.driver_id,tr.vehicle_id,tv.seats,um.school_id,up.profile_picture, tr.id as route_id,tr.route_no,um.role_id,uc.lattitude,uc.longitude, uc.current_date_time from user_master as um left join transport_route_info as tr on um.UUID=tr.driver_id left join user_profile as up on um.UUID = up.UUID left join (select * from (select uc.* from user_coordinates as uc order by uc.current_date_time desc) as t group by t.uuid) as uc on uc.uuid =um.UUID left join transport_vehicle tv on tr.vehicle_id=tv.id where um.school_id=? and um.active=1 and tr.route_no is not null and tr.deleted=0 and tr.status=1 and um.role_id=20", [req.params.school_id], function (err, drivers) {
                        if (!err) {
                            var driverInfo = [];
                            if (drivers.length == 0) {
                                 connection.release();
                                var response = {
                                                "school_id" : req.params.school_id ,
                                               "school_name" :req.params.school_name
                                            }
                                apiResponse.getData(res, 1005, "No Driver Found", [response]);
                            } else {
                                var query="";
                                var getData=function(){
                                      connection.query(query, [req.params.school_id], function (err, stoppage) {
                                        if (!err) {
                                            if (stoppage.length == 0) {     // no stoppages found
                                                 connection.release();
                                                for (var i = 0; i < drivers.length; i++) {
                                                    var obj = {};
                                                    obj.UUID = drivers[i].UUID;
                                                    obj.first_name = drivers[i].first_name;
                                                    obj.middle_name = drivers[i].middle_name;
                                                    obj.last_name = drivers[i].last_name;
                                                    obj.mobile_number = drivers[i].mobile_number;
                                                    obj.driver_id = drivers[i].driver_id;
                                                    obj.vehicle_id = drivers[i].vehicle_id;
                                                    obj.seats = drivers[i].seats;
                                                    obj.profile_picture = drivers[i].profile_picture;
                                                    obj.route_id = drivers[i].route_id;
                                                    obj.route_no = drivers[i].route_no;
                                                    obj.lattitude = drivers[i].lattitude;
                                                    obj.longitude = drivers[i].longitude;
                                                    obj.role_id = drivers[i].role_id;
                                                    obj.stoppages = [];
                                                    obj.student_count=0;
                                                    
                                                    driverInfo.push(obj);
                                                }
                                                var response = {
                                                    "school_id"  : req.params.school_id ,
                                                   "school_name" :req.params.school_name,
                                                    "driverList" : driverInfo
                                                  }
                                                apiResponse.getData(res, 1002, 'Ok', [response]);
                                            } else {
                                                for (var i = 0; i < drivers.length; i++) {
                                                    var obj = {};
                                                    obj.UUID = drivers[i].UUID;
                                                    obj.first_name = drivers[i].first_name;
                                                    obj.middle_name = drivers[i].middle_name;
                                                    obj.last_name = drivers[i].last_name;
                                                    obj.mobile_number = drivers[i].mobile_number;
                                                    obj.driver_id = drivers[i].driver_id;
                                                    obj.vehicle_id = drivers[i].vehicle_id;
                                                    obj.seats = drivers[i].seats;
                                                    obj.profile_picture = drivers[i].profile_picture;
                                                    obj.route_id = drivers[i].route_id;
                                                    obj.route_no = drivers[i].route_no;
                                                    obj.lattitude = drivers[i].lattitude;
                                                    obj.longitude = drivers[i].longitude;
                                                    obj.role_id = drivers[i].role_id;
                                                    obj.stoppages = [];
                                                    obj.student_count=0;

                                                    for (var j = 0; j < stoppage.length; j++) {
                                                        
                                                        if (drivers[i].route_id == stoppage[j].route_id) {
                                                            var stoppageObj = {};
                                                            stoppageObj.stoppage_id = stoppage[j].stoppage_id;
                                                            stoppageObj.stoppage_name = stoppage[j].stoppage_name;
                                                            stoppageObj.students = stoppage[j].total_student;
                                                            obj.student_count=obj.student_count+stoppage[j].total_student;
                                                            obj.stoppages.push(stoppageObj);

                                                        };


                                                    }
                                                    driverInfo.push(obj);
                                                }
                                                
                                            }
                                            var response = {
                                                "school_id"  : req.params.school_id ,
                                                "school_name" :req.params.school_name,
                                                "driverList" : driverInfo
                                            }
                                             connection.release();
                                            apiResponse.getData(res, 1002, 'Ok', [response]);

                                        }
                                
                                    else {
                                         connection.release();
                                        apiResponse.getData(res, 1001, 'Internal server Error', [{}]);
                                    }
                                });
                                    
                                }
                                if(req.params.value=="true"){
                                     // to fetch records of all stoppages even when stoppage doesnot have any students assigned 
                                    query="select t.route_id, t.id as stoppage_id, t.stoppage_name, count(ts.student_id) as total_student from transport_route_stoppage as  t left join transport_route_stop_users as ts on ts.stoppage_id=t.id and ts.deleted=0 and ts.status=1 and ts.school_id=? where t.deleted=0 and t.status=1 group by t.route_id, t.id,t.stoppage_name";
                                    getData();
                                }else if(req.params.value=="false") {
                                    // to fetch records for those stoppages which have some studenets assigned
                                     query="select t.route_id,t.id as stoppage_id,t.stoppage_name,count(ts.student_id)as total_student from  transport_route_stoppage as  t right  join  transport_route_stop_users as ts on t.id= ts.stoppage_id where ts.school_id=? and t.deleted=0 and t.status=1 and ts.deleted=0 and ts.status=1 group by t.route_id, t.id,t.stoppage_name";
                                    getData();
                                    }
                                else{
                                     connection.release();
                                       apiResponse.getData(res, 1005, "Invalid input", [{}]); 
                                }
                            }
                    } else {
                         connection.release();
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                    }
                });
        }
    });
    }

});
module.exports = router;