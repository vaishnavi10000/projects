var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var schoolActive = require('../function/schoolActive');
var auth = require('../authuser');

/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of sections for a class
 * Request: sesion_token and uuid in header and class_id in query string 
 * Response:List of sections in a class of a school
 */


router.get('/sectionList/:class_id', auth.user, function (req, res, next) {
    if (!req.params.class_id) {
        apiResponse.getData(res, 1005, "class_id required", [{}]);
    } else {
        schoolActive.checkActive(req.params.school_id, function (data) {
            if (data == true) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                    } else {
                        connection.query("select a.group_id as section_id,a.group_name as section_name from user_group_master as a where a.school_id=? and a.category_id=10 and a.parent_group_id=? and a.active=1;", [req.params.school_id, req.params.class_id], function (err, rows) {
                            if (!err) {
                                if (rows.length == 0) {
                                    connection.release();
                                    apiResponse.getData(res, 1005, "No section found for this school", [{}]);
                                } else {
                                    var response = {
                                        sectionList: rows
                                    }
                                    connection.release();
                                    apiResponse.getData(res, 1002, 'Ok', [response]);
                                }
                            } else {
                                connection.release();
                                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                            }
                        });
                    }
                });

            } else {
                apiResponse.getData(res, 1005, 'School Inactive', [{}]);
            }
        });
    } //else
})
module.exports = router;