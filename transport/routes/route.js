var express = require('express');
var router = express.Router();
var pool = require('../model/pool');
var apiResponse = require('../response');
var schoolActive = require('../function/schoolActive');
var auth = require('../authuser');


/* Transport Module
 * Payal Vishwakarma - 19/04/2016
 * Method to add route 
 * Request: sesion_token,uuid in header and  start_location,end_location and route_no in body
 * Response:  route_id,route_no,start_location,end_location ,driver_id,vehicle_id
 */
router.post('/addRoute', auth.user, function (req, res, next) {
    if (!req.body.start_location || !req.body.end_location || !req.body.route_no) {
        if (!req.body.start_location || req.body.start_location == '') {
            apiResponse.getData(res, 1007, "start_location required", [{}]);
        } else if (!req.body.end_location || req.body.end_location == '') {
            apiResponse.getData(res, 1007, "end_location required", [{}]);
        } else {
            apiResponse.getData(res, 1007, "route_no required", [{}]);
        }
    } else {
        var loc_pattern=/^(?![0-9]*$)[a-zA-Z0-9\-\_.,/()&${}'"\[\] ]{3,100}$/;
        
          if (req.body.start_location .match(loc_pattern) && req.body.end_location .match(loc_pattern) ) {
                     schoolActive.checkActive(req.params.school_id, function (data) {
            if (data == true) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                    } else {
                        connection.query("select school_id,route_no  from transport_route_info where school_id=? and route_no=? and deleted !=1", [req.params.school_id, req.body.route_no], function (err, rows) {
                            if (!err) {
                                if (rows.length) {
                                    connection.release();
                                    apiResponse.getData(res, 1002, "Route already exists", [{}]);
                                } else {
                                    var today = new Date();
                                    var dataToInsert = {
                                        'route_no': req.body.route_no,
                                        'school_id': req.params.school_id,
                                        'driver_id': null,
                                        'vehicle_id': null,
                                        'licence': null,
                                        'route_name': null,
                                        'start_location': req.body.start_location,
                                        'end_location': req.body.end_location,
                                        'created_on': today.toJSON(),
                                        'created_by': req.headers.uuid,
                                        'modified_by': null,
                                        'deleted': 0,
                                        'status': 1,
                                        'modified_on': null
                                    }

                                    connection.query("insert into transport_route_info SET ?", dataToInsert, function (err, rows) {
                                        if (!err) {
                                            var query2 = "select id,route_no,start_location,end_location,driver_id,vehicle_id from transport_route_info where id=" + rows.insertId;
                                            connection.query(query2, function (err, addedRouteInfo) {
                                                if (!err) {
                                                    var response = {
                                                        route_id: addedRouteInfo[0].id,
                                                        route_no: addedRouteInfo[0].route_no,
                                                        start_location: addedRouteInfo[0].start_location,
                                                        end_location: addedRouteInfo[0].end_location,
                                                        driver_id: addedRouteInfo[0].driver_id,
                                                        vehicle_id: addedRouteInfo[0].vehicle_id,
														seats: null,
														student_count:null
                                                    }
                                                    connection.release();
                                                    apiResponse.getData(res, 1006, 'Route added Successfully', [response]);
                                                } else {
                                                    connection.release();
                                                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                                                }
                                            });

                                        } else {
                                            connection.release();
                                            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                                        }
                                    });
                                }
                            }

                        });
                    }
                });

            } else {
                apiResponse.getData(res, 1005, 'School Inactive', [{}]);
            }
        }); 
              
          }
        else{
             apiResponse.getData(res, 1007, 'Invalid Data', [{}]);
        }


    }
});



/* Transport Module
 * Payal Vishwakarma - 19/04/2016
 * Method to delete route 
 * Request: sesion_token,uuid in header and route_no in body
 * Response:Status message
 */
router.post('/deleteRoute', auth.user, function (req, res, next) {
    if (!req.body.route_id) {
        apiResponse.getData(res, 1005, "route id required", [{}]);
    } else {
        schoolActive.checkActive(req.params.school_id, function (data) {
            if (data == true) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                        } else {
          connection.query("select student_id from transport_route_stop_users where route_id=" + req.body.route_id+ " AND deleted=0",
             function (err, rows) {
                 if (err) {
                     connection.release();
                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                 } else if (rows.length > 0) {
                     connection.release();
                     apiResponse.getData(res, 1002, 'Students exists in this route', [{}]);
                 } else {
                     var query2="select vehicle_id from transport_route_info where id="+req.body.route_id+" AND vehicle_id!=0 AND school_id="+req.params.school_id +" AND deleted=0";
        
                     connection.query(query2, function (err, vehicleID) {
                  if (err) {
                      connection.release();
                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
                 } else if (vehicleID.length > 0) {
                     connection.query('update transport_route_info set driver_id = null,vehicle_id = null where id=' + req.body.route_id, function (err, rows) {
                                    if (err) {
                                        connection.release();
                                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                    } else {
                                        if (rows.affectedRows == 0) {
                                            connection.release();
                                            apiResponse.getData(res, 1006, 'Route deleted but vehicle not unassigned', [{}]);

                                        } else {
                                            connection.query('update transport_vehicle set assigned = 0 where id =' + vehicleID[0].vehicle_id, function (err, rowsaffected) {
                                                if (err) {
                                                    connection.release();
                                                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                } else {
                                                    if (rowsaffected.affectedRows == 0) {
                                                        connection.release();
                                                        apiResponse.getData(res, 1006, "Route deleted but vehicle not unassigned", [{}]);

                                                    } else {
                                                        connection.release();
                                                        apiResponse.getData(res, 1006, 'Route Deleted Successfully', [{}]);
                                                    }
                                                }
                                            })


                                        }
                                    }

                                });
                     
                     
                    // apiResponse.getData(res, 1002, 'Vehicle is assigned in this route', [{}]);
                 } else{
                            connection.query("update transport_route_info SET deleted=?,status=0? WHERE school_id=? and id=?", [1, 0, req.params.school_id, req.body.route_id], function (err, rows) {
                                if (!err) {
                                    if (rows.changedRows == 0 || rows.length == 0) { // if route is already inactive or updation fails
                                        connection.release();
                                        apiResponse.getData(res, 1001, "Route Deletion Failed", [{}]);
                                    } else {
                                        connection.release();
                                        apiResponse.getData(res, 1006, 'Route Deleted Successfully', [{}]);
                                    };
                                } else {
                                    connection.release();
                                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                                }
                            });
                        }
                         
                     })
                     
                    
                          
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

/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of routes
 * Request: sesion_token and uuid in header
 * Response:List of routes for a school_id
 */
router.get('/routeList', auth.user, function (req, res, next) {
    schoolActive.checkActive(req.params.school_id, function (data) {
        if (data == true) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                } else {
                
                    var query= "select tr.id,ur.total_student, tr.route_no,tr.route_name,tr.start_location,tr.end_location,tr.driver_id,tr.vehicle_id,tv.seats from  transport_route_info as tr  left join transport_vehicle as tv on  tv.id=tr.vehicle_id left join (select count(ru.student_id) as total_student, ru.route_id from transport_route_stop_users as ru where ru.deleted = 0 and ru.`status`=1 and ru.school_id="+req.params.school_id+" group by ru.route_id) as ur on ur.route_id=tr.id where tr.deleted=0 and tr.`status`=1 and tr.school_id="+req.params.school_id;
                    connection.query(query, function (err, routes) {
                        if (!err) {
                              var routeArr = [];
                            if (routes.length == 0) {
                                connection.release();
                                apiResponse.getData(res, 1005, "No route found", [{}]);
                            } else {
                                    connection.query("select route_id ,count(student_id) as student_count from transport_route_stop_users where school_id=? and status=1 and deleted=0 group by route_id", [req.params.school_id], function (err, rows) {
                                            if (!err) {
                                                if (rows.length == 0) {
                                                    for (var i = 0; i < routes.length; i++) {
                                                    var obj = {};
                                                    obj.id = routes[i].id;
                                                    obj.route_no = routes[i].route_no;
                                                    obj.route_name = routes[i].route_name;
                                                    obj.start_location = routes[i].start_location;
                                                    obj.end_location = routes[i].end_location;
                                                    obj.driver_id = routes[i].driver_id;
                                                    obj.vehicle_id = routes[i].vehicle_id;
                                                    obj.seats = routes[i].seats;
                                                    obj.student_count=0;
                                                    obj.total_student=routes[i].total_student;
                                                    routeArr.push(obj);
                                                    
                                                    }
                                                    var response = {
                                                        routeList: routeArr
                                                    }
                                                    connection.release();
                                                    apiResponse.getData(res, 1002, 'Ok', [response]);
                                                } else {
                                                     for (var i = 0; i < routes.length; i++) {
                                                    var obj = {};
                                                    obj.id = routes[i].id;
                                                    obj.route_no = routes[i].route_no;
                                                    obj.route_name = routes[i].route_name;
                                                    obj.start_location = routes[i].start_location;
                                                    obj.end_location = routes[i].end_location;
                                                    obj.driver_id = routes[i].driver_id;
                                                    obj.vehicle_id = routes[i].vehicle_id;
                                                    obj.seats = routes[i].seats;
                                                    obj.student_count=0;
                                                    obj.student_deleted=routes[i].student_deleted;

                                                    for (var j = 0; j < rows.length; j++) {
                                                        
                                                        if (routes[i].id == rows[j].route_id) {
                                                            obj.student_count=obj.student_count+rows[j].student_count;
                                                          }                                                    
                                                     }
                                                      routeArr.push(obj);
                                                   }
                                                    var response = {
                                                        routeList: routeArr
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
});

/* Transport Module
 * Vaishnavi
 * Method to edit route 
 * Request: sesion_token,uuid in header and  start_location,end_location and route id in body
 * Response:  route_id,route_no,start_location,end_location ,driver_id,vehicle_id
 */
router.post('/editRoute', auth.user, function (req, res, next) {
        if (!req.body.start_location || req.body.start_location == '') {
            apiResponse.getData(res, 1007, "start_location required", [{}]);
        } else if (!req.body.end_location || req.body.end_location == '') {
            apiResponse.getData(res, 1007, "end_location required", [{}]);
        } else if (!req.body.route_no || req.body.route_no == ''){
            apiResponse.getData(res, 1007, "route_no required", [{}]);
        }
     else if (!req.body.id || req.body.id == '') {
        apiResponse.getData(res, 1007, "id required", [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if(err){
                  apiResponse.getData(res, 1001, "Internal server error", [{}]);
            }else{
                    var query = "select route_no from transport_route_info where route_no='" + req.body.route_no + "' and deleted=0 and id!="+req.body.id;
            connection.query(query, function (err, rows) {
                if (rows.length > 0) {
                    connection.release();
                    apiResponse.getData(res, 1002, "Route_no already exists in database", [{}]);
                } else if (rows.length == 0) {
                    var query2 = "UPDATE transport_route_info SET start_location='" + req.body.start_location + "',end_location='" + req.body.end_location + "',route_no='" + req.body.route_no + "' WHERE id=" + req.body.id;
                    connection.query(query2, function (err, rows) {
                        if (err) {
                            connection.release();
                            apiResponse.getData(res, 1001, "Internal server error", [{}]);
                        } else if (rows.changedRows == 1) {
                            var updatedData={"route_no":req.body.route_no,"start_location":req.body.start_location,"end_location":req.body.end_location}
                            connection.release();
                            apiResponse.getData(res, 1006, "Route Updated Successfully", [updatedData]);
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1002, "Route already updated", [{}]);
                        }

                    });
                } else {
                    connection.release();
                    apiResponse.getData(res, 1001, "Internal server error", [{}]);
                }
             });
            }
        });
    }
});

module.exports = router;