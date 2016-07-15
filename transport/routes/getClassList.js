var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var schoolActive = require('../function/schoolActive');
var auth = require('../authuser');
/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of classes for a school
 * Request: sesion_token and uuid  in header
 * Response:List of classes
 */
router.get('/classList', auth.user, function (req, res, next) {
    schoolActive.checkActive(req.params.school_id, function (data) {
        if (data == true) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                } else {
                    connection.query("select a.group_id as class_id, a.group_name as class_name from user_group_master as a where a.school_id=? and a.category_id=9 and a.active=1;", [req.params.school_id], function (err, rows) {
                        if (!err) {
                            if (rows.length == 0) {
                                connection.release();
                                apiResponse.getData(res, 1005, "No classes found for this school", [{}]);
                            } else {
                                var response = {
                                    classList: rows
                                }
                                connection.release();
                                apiResponse.getData(res, 1002, 'Ok', [response]);
                            }
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                        }
                    });
                    connection.on('error', function (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                    });
                }
            });

        } else {
            apiResponse.getData(res, 1005, 'School Inactive', [{}]);
        }
    });
})
module.exports = router;