var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var auth = require('../authuser');

/**
 * @Author: vaishnavi
 * @ngdoc function
 * @name transportApp.controller:AddvehiclesCtrl
 * @description:Api to retrive current position of a user
 * Return:success
 * Params:null
 */
router.post('/location', auth.user, function (req, res, next) {
    var uuids = req.body.uuids;
    var result = [],
        errors = [];

    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
        } else {
            var idStr='';
            for (var i = 0; i < uuids.length; i++) {
                idStr+=uuids[i]+',';
            }
                
            idStr = idStr.substring(0, idStr.length - 1);
            var query="select uuid,lattitude,longitude from (select uc.* from user_coordinates as uc where uc.uuid in ("+idStr+") order by uc.current_date_time desc) as t group by t.uuid";
                connection.query(query, function (err, rows) {
                    if (err) {
                             connection.release();
                            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                        
                    } else if (rows.length > 0) {
                       
                            var data = {
                                location: rows
                            }
                             connection.release();
                            apiResponse.getData(res, 1006, 'Success', [data]);
                        
                    } else {
                         connection.release();
                        apiResponse.getData(res, 1004, 'No data found', [{}]);
                            }
                });
        }
    });

});
module.exports = router;