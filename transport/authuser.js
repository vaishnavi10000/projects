var express = require('express');
var router = express.Router();
var config = require(__dirname + '/config');
var pool = require(__dirname + '/model/pool');
var apiResponse = require(__dirname + '/response');

var auth = function () {};

auth.user = function (req, res, next) {
    //user authentication

    pool.getConnection(function (err, connection) {
        if (err) {
             apiResponse.getData(res, 1001, 'Internal server error', [{}]);
        } else {
            if (!req.headers.session_token || !req.headers.uuid) {
               
                apiResponse.getData(res, 1006, 'Credentials missing', [{}]);
            } else {

                sqlQuery = 'select us.UUID as uuid, um.school_id,sc.school_name from user_api_session as us left join user_master as um on us.UUID=um.UUID left join school_master sc on um.school_id=sc.school_id where us.session_token ="' + (req.headers.session_token).replace(' ', '') + '" and us.UUID = "' + req.headers.uuid + '" and us.expiry_date > curdate()';

                connection.query(sqlQuery, function (err, results) {

                    if (err) {
                      apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else {
                        if (results.length === 0) {
                            apiResponse.getData(res, 1006, 'Invalid session token or user do not exist', [{}]);
                        } else {
                            req.params.school_id = results[0].school_id;
                            req.params.school_name = results[0].school_name;
                            return next();
                        }
                    }
                });
            }
            connection.release();

        }
    });

    //return true;
}

module.exports = auth;