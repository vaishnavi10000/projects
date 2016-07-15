var express = require('express');
var router = express.Router();
var pool = require('../model/pool')
var apiResponse = require('../response');
var auth = require('../authuser');


/**
 * @Author: vaishnavi
 * @ngdoc function
 * @description:Api to add route stoppage
 * Return:returns stop added to a route
 * Params:null
 */


router.post('/add', auth.user, function (req, res, next) {
    if (!req.body.route_id ||
        !req.body.stoppage_name || !req.body.lat ||
        !req.body.long) {

        apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
    } else if (isNaN(req.body.long) || req.body.long == null || isNaN(req.body.lat) || req.body.lat == null) {
        apiResponse.getData(res, 1007, 'Only valid numbers allowed for latitude and longitude', [{}]);
    } else {
        pool.getConnection(function (err1, connection) {
            if (err1) {
                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            } else {
                var data = {
                    'route_id': req.body.route_id,
                    'stoppage_name': req.body.stoppage_name,
                    'lat': req.body.lat,
                    'long': req.body.long,
                    'created_on': new Date(),
                    'created_by': req.body.created_by,
                    'modified_on': req.body.modified_on,
                    'modified_by': req.body.modified_by,
                    'deleted': 0,
                    'status': 1
                }
                var stoppageData = function () {
                    connection.query("insert into transport_route_stoppage SET ?", data, function (err, rows) {
                       
                        if (!err) {
                            connection.query("select id,order_no,stoppage_name,lat,`long`,route_id from transport_route_stoppage where id =" + rows.insertId, function (err, rows) {

                                var response = {
                                    'stoppage_id': rows[0].id,
                                    'order_no': rows[0].order_no,
                                    'stoppage_name': rows[0].stoppage_name,
                                    'lat': rows[0].lat,
                                    'route_id': rows[0].route_id,
                                    'long': rows[0].long
                                }
                                connection.release();
                                apiResponse.getData(res, 1006, 'Stoppage added succesfully', [response]);
                            });
                        }
                        if (err) {
                            connection.release();
                            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                        }
                    });
                }
                connection.query("select max(order_no) as order_no from  transport_route_stoppage where route_id=?", [data.route_id], function (err, rows) {
                    if (rows[0].order_no == null) {
                        data.order_no = 1;
                        stoppageData();
                    } else {
                        data.order_no = rows[0].order_no + 1;
                        stoppageData();
                    } 
                });

            }
        });
    } //else
})


/**
 * @Author: vaishnavi
 * @ngdoc function
 * @description:Api for deleting stoppage
 * Return:success message
 * Params:null
 */
router.post('/delete', function (req, res, next) {
    if (!req.body.stop_id) {
        apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
    } else {
        var result = [];
        var afterUpdated, errors = [];
pool.getConnection(function (err, connection) {
    if (err) {
        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
    } else {
          connection.query("select student_id from transport_route_stop_users where stoppage_id=" + req.body.stop_id + " AND deleted=0",
         function (err, rows) {
             if (err) {

             } else if (rows.length > 0) {
                  connection.release();
                 apiResponse.getData(res, 1002, 'Students exists in this stoppage', [{}]);
             } else {
                connection.query("UPDATE transport_route_stoppage SET deleted=1, status=0 WHERE id=" + req.body.stop_id,
                     function (err, rows) {
                         if (err) {
                             connection.release();
                             apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                         } else if (rows.changedRows == 1) {
                            connection.release();
                             apiResponse.getData(res, 1006, 'Stoppage Deleted', [{}]);
                         } else {
                             connection.release();
                             apiResponse.getData(res, 1007, 'invalid input', [{}]);
                         }
                     });
                }
            });
        }
    });
  } //else

});

/**
 * @Author: vaishnavi
 * @ngdoc function
 * @description:Api to get stoppages in a route
 * Return:list of stoppages in a route
 * Params:route_id
 */
router.get('/get/:route_id', auth.user, function (req, res, next) {

    if (!req.params.route_id) {
        apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            } else {
                var data = {
                    'route_id': req.params.route_id,
                }
                connection.query("select id,route_id,stoppage_name,lat,`long` from transport_route_stoppage where route_id =? AND deleted!=1", [data.route_id], function (err, rows) {
                    if (err) {
                        connection.release();
                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else {

                        if (!rows.length == 0) {
                            var response = {
                                stopage: rows
                            }
                            connection.release();
                            apiResponse.getData(res, 1002, 'Success', [response]);
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1005, 'No stoppages', [{}]);
                        }
                    }
                });
            }
        });
    } //else
});

/* Transport Module
 * Vaishnavi
 * Method to edit stoppage 
 * Request: sesion_token,uuid in header and  start_location,end_location and route id in body
 * Response:  route_id,route_no,start_location,end_location ,driver_id,vehicle_id
 */
router.post('/edit', auth.user, function (req, res, next) {
if (!req.body.id ||
        !req.body.stoppage_name || !req.body.lat ||
        !req.body.long) {
 apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
    } else if (isNaN(req.body.long) || req.body.long == null || isNaN(req.body.lat) || req.body.lat == null) {
        apiResponse.getData(res, 1007, 'Only valid numbers allowed for latitude and longitude', [{}]);
    }else{
         pool.getConnection(function (err, connection) {
              if (err) {
                    apiResponse.getData(res, 1001, "Internal server error", [{}]);
                } else{
                    var query="UPDATE transport_route_stoppage SET stoppage_name='" + req.body.stoppage_name + "',lat=" + req.body.lat + ",`long`=" + req.body.long + " WHERE id=" + req.body.id;
                  
                     connection.query(query, function (err, rows) {
                          if (err) {
                              connection.release();
                            apiResponse.getData(res, 1001, "Internal server error", [{}]);
                        } else if (rows.changedRows == 1) {
                            connection.release();
                             editdata={
                                "stoppage_name":req.body.stoppage_name,
                                "lat":req.body.lat,
                                "long":req.body.long,
                                 "id":req.body.id
                            }
                            apiResponse.getData(res, 1006, "Stoppage successfully updated", [{editdata}]);
                        } else {
                            connection.release();
                           
                            apiResponse.getData(res, 1002, "Stoppage already updated", [{}]);
                        }
                         
                     });
                   }
             
         });
        
    } 
});
module.exports = router;