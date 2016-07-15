var express = require('express');
var router = express.Router();
var apiResponse = require('../response');
var pool = require('../model/pool');
var auth = require('../authuser');

/*for adding vehicles*/
/*input JSON format*/
/*{vehicle_type_id":1,"vehicle_no":"UP 16 AS 5555","seats":55} */

router.post('/addVehicle', auth.user, function (req, res, next) {

    if (!req.body.vehicle_no) {
        apiResponse.getData(res, 1007, 'Vehicle number required', [{}]);
    } else if (!req.body.vehicle_type_id) {
        apiResponse.getData(res, 1007, 'Vehicle type required', [{}]);
    } else if (!req.body.seats) {
        apiResponse.getData(res, 1007, 'seats required', [{}]);
    } else {
        //var name = /^(?![0-9]*$)[a-zA-Z0-9_ ]{3,50}$/;
       
            pool.getConnection(function (err, connection) {
                if (err) {
                    apiResponse.getData(res, 1001, 'internal server error', [{}]);
                } else {
                    var str = req.body.vehicle_no;
                    str = str.replace(/[^a-z\d\s]+/gi, "");
                    str = str.replace(/\s/g, "");
                    var data = {
                        'vehicle_no': str
                        , 'vehicle_type_id': req.body.vehicle_type_id
                        , 'school_id': req.params.school_id
                        , 'seats': req.body.seats
                        , 'created_on': new Date()
                        , 'created_by': req.headers.uuid
                        , 'modified_on': new Date()
                        , 'modified_by': req.headers.uuid
                        , 'deleted': 0
                        , 'status': 1
                    };
                    connection.query("select id,vehicle_no,vehicle_type_id,school_id,seats from transport_vehicle where deleted = 0 and school_id=" + req.params.school_id + " and vehicle_no=" + "'" + str + "'", function (err, results) {
                        if (err) {
                            connection.release();
                            apiResponse.getData(res, 1001, 'internal server error', [{}]);
                        } else if (results.length > 0) {
                            connection.release();
                            apiResponse.getData(res, 1002, 'vehicle already exists', [{}]);
                        } else {
                            connection.query("insert into transport_vehicle SET ?", data, function (err, rows) {
                                if (!err) {
                                    connection.query("select tv.id,tv.vehicle_no,tv.vehicle_type_id,tv.school_id,tv.seats,tv.assigned,tt.vehicle_type from transport_vehicle as tv left join transport_vehicle_type as tt on tv.vehicle_type_id=tt.id where tv.id=" + rows.insertId, function (err, rows) {
                                        var response = {
                                            'id': rows[0].id
                                            , 'vehicle_type_id': rows[0].vehicle_type_id
                                            , 'vehicle_no': rows[0].vehicle_no
                                            , 'seats': rows[0].seats
                                            , 'assigned': rows[0].assigned
                                            , 'vehicle_type': rows[0].vehicle_type
                                        };
                                        connection.release();
                                        apiResponse.getData(res, 1006, 'vehicle added', [response]);
                                    });
                                }
                            });
                        }
                    });
                }
            }); 
    }
});

/*for assigning vehicles*/
/*input JSON format
{
    route_id: 1,
    driver_id: 1,
    vehicle_id: 1
}
*/
router.post('/assignVehicles', auth.user, function (req, res, next) {

    if (!req.params.school_id || !req.body.route_id || !req.body.driver_id || !req.body.vehicle_id) {
        apiResponse.getData(res, 1002, 'missing data', [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            } else {
                connection.query('select id,route_no from transport_route_info where (vehicle_id='+req.body.vehicle_id+' || driver_id='+req.body.driver_id+') and school_id='+req.params.school_id, function (err, data) {
                    if (err) {
                        connection.release();
                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else if (data.length != 0) {
                        connection.release();
                        apiResponse.getData(res, 1006, 'already assigned', [{}]);
                    } else {
                        connection.query('select id,route_no,school_id,driver_id,vehicle_id,start_location,end_location,route_name from transport_route_info where id =' + req.body.route_id + ' and school_id=' + req.params.school_id, function (err, results) {
                            if (err) {
                                connection.release();
                                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                            } else {
                                if (results.length == 0) {
                                    connection.release();
                                    apiResponse.getData(res, 1006, 'No route found', [{}]);
                                } else {
                                    connection.query('select id,school_id,route_id,stoppage_id,student_id from transport_route_stop_users where deleted = 0 and route_id = ' + req.body.route_id + ' and school_id = ' + req.params.school_id, function (err, countStudent) {
                                        if (err) {
                                            connection.release();
                                            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                        } else {
                                            connection.query('select seats from transport_vehicle where deleted = 0 and id = ' + req.body.vehicle_id, function (err, countSeats) {
                                                if (err) {
                                                    connection.release();
                                                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                } else {
                                                    if (countStudent.length > countSeats[0].seats) {
                                                        connection.release();
                                                        apiResponse.getData(res, 1001, 'Students on this route exceeds the seat limit', [{}]);
                                                    } else {
                                                        if (results[0].vehicle_id === null && results[0].driver_id === null) {
                                                            connection.query('update transport_route_info set driver_id = ' + req.body.driver_id + ',vehicle_id = ' + req.body.vehicle_id + ' where id=' + req.body.route_id + ' and school_id=' + req.params.school_id, function (err, rows) {
                                                                if (err) {
                                                                    connection.release();
                                                                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                                } else {
                                                                    if (rows.affectedRows == 0) {
                                                                        connection.release();
                                                                        apiResponse.getData(res, 1006, 'cannot assign', [{}]);
                                                                    } else {
                                                                        connection.query('update transport_vehicle set assigned = 1 where id =' + req.body.vehicle_id, function (err, rowsaffected) {
                                                                            if (err) {
                                                                                connection.release();
                                                                                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                                            } else {
                                                                                if (rowsaffected.affectedRows == 0) {
                                                                                    connection.release();
                                                                                    apiResponse.getData(res, 1006, 'cannot assign', [{}]);
                                                                                } else {

                                                                                    connection.query('select tr.id,tr.route_no,tr.vehicle_id,tr.driver_id,um.first_name,tv.vehicle_no from transport_route_info as tr join user_master as um on tr.driver_id=um.UUID join transport_vehicle as tv on tr.vehicle_id=tv.id where um.school_id=' + req.params.school_id + ' and tr.id=' + req.body.route_id, function (err, selectedrows) {

                                                                                            if (err) {
                                                                                                connection.release();
                                                                                                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                                                            } else {
                                                                                                if (!selectedrows) {
                                                                                                    connection.release();
                                                                                                    apiResponse.getData(res, 1006, 'No assigned vehicle', [{}]);

                                                                                                } else {
                                                                                                    var response = {
                                                                                                        "id": selectedrows[0].id
                                                                                                        , "route_no": selectedrows[0].route_no
                                                                                                        , "vehicle_id": selectedrows[0].vehicle_id
                                                                                                        , "driver_id": selectedrows[0].driver_id
                                                                                                        , "first_name": selectedrows[0].first_name
                                                                                                        , "vehicle_no": selectedrows[0].vehicle_no
                                                                                                    }
                                                                                                    connection.release();
                                                                                                    apiResponse.getData(res, 1006, 'assigned', [response]);
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            connection.release();
                                                            apiResponse.getData(res, 1006, 'already assigned', [{}]);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    }
});

//module.exports = router;

/*API to get list of vehicles*/
router.get('/getVehicles', auth.user, function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'internal server error', [{}]);
        } else {
            connection.query('select tv.id,tv.vehicle_no,tv.vehicle_type_id,tv.school_id,tv.seats,tv.assigned,tt.vehicle_type,um.first_name from transport_vehicle as tv left join transport_vehicle_type as tt on tv.vehicle_type_id=tt.id left join transport_route_info as tri on tri.vehicle_id=tv.id left join user_master as um on um.UUID=tri.driver_id where tv.deleted = 0 and tv.school_id =' + req.params.school_id, function (err, results) {
                if (err) {
                    connection.release();
                    apiResponse.getData(res, 1001, 'internal server error', [{}]);
                } else {
                    if (results.length == 0) {
                        connection.release();
                        apiResponse.getData(res, 1002, 'no vehicles found', [{}]);
                    } else {
                        var response = {
                            vehicles: results
                        };
                        connection.release();
                        apiResponse.getData(res, 1006, 'success', [response]);
                    }
                }
            });
        }
    });
});

/*for adding vehicles*/
/*input JSON format
{"vehicle_id":"4"}*/

router.post('/removeVehicles', auth.user, function (req, res, next) {

    if (!req.body.vehicle_id || !req.params.school_id) {
        apiResponse.getData(res, 1007, 'missing data', [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'internal server error', [{}]);

            } else {
                connection.query('update transport_vehicle set status = 0,deleted = 1 where id =' + req.body.vehicle_id + ' and school_id =' + req.params.school_id, function (err, results) {
                    if (err) {
                        connection.release();
                        apiResponse.getData(res, 1001, 'internal server error', [{}]);
                    } else {
                        if (results.affectedRows == 0) {
                            connection.release();
                            apiResponse.getData(res, 1006, 'cannot delete vehicle', [results]);
                        } else {
                            connection.release();
                            apiResponse.getData(res, 1006, 'vehicle deleted', [results]);
                        }
                    }
                });
            }

        });
    }
});

/*for unassigning vehicles*/

router.post('/unassignVehicle', auth.user, function (req, res, next) {

    if (!req.body.route_id || !req.body.driver_id || !req.body.vehicle_id) {
        apiResponse.getData(res, 1002, 'missing data', [{}]);
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);

            } else {

                connection.query('select id,route_no,school_id,driver_id,vehicle_id,start_location,end_location,route_name from transport_route_info where id =' + req.body.route_id, function (err, results) {
                    if (err) {
                        connection.release();
                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else {
                        if (results.length == 0) {
                            connection.release();
                            apiResponse.getData(res, 1006, 'No route found', [{}]);
                        } else {
                            if (results[0].vehicle_id != null && results[0].driver_id != null) {
                                connection.query('update transport_route_info set driver_id = null,vehicle_id = null where id=' + req.body.route_id, function (err, rows) {
                                    if (err) {
                                        connection.release();
                                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                    } else {
                                        if (rows.affectedRows == 0) {
                                            connection.release();
                                            apiResponse.getData(res, 1006, 'cannot unassign', [{}]);
                                        } else {
                                            connection.query('update transport_vehicle set assigned = 0 where id =' + req.body.vehicle_id, function (err, rowsaffected) {
                                                if (err) {
                                                    connection.release();
                                                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                                                } else {
                                                    if (rowsaffected.affectedRows == 0) {
                                                        connection.release();
                                                        apiResponse.getData(res, 1006, 'cannot unassign', [{}]);
                                                    } else {
                                                        connection.release();
                                                        apiResponse.getData(res, 1006, 'unassigned', [{}]);
                                                    }
                                                }
                                            })
                                        }
                                    }
                                });
                            } else {
                                connection.release();
                                apiResponse.getData(res, 1006, 'already unassigned', [{}]);
                            }
                        }
                    }
                });
            }

        });
    }
});

/*getting list of assigned vehicles*/
router.get('/getAssignedVehicles', auth.user, function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'Internal server error', [{}]);
        } else {
            connection.query('select tr.id,tr.route_no,tr.vehicle_id,tr.driver_id,um.first_name,tv.vehicle_no from transport_route_info as tr join user_master as um on tr.driver_id=um.UUID join transport_vehicle as tv on tr.vehicle_id=tv.id where um.school_id=' + req.params.school_id, function (err, selectedrows) {
                if (err) {
                    connection.release();
                    apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                } else {
                    if (!selectedrows) {
                        connection.release();
                        apiResponse.getData(res, 1006, 'No assigned vehicle', [{}]);
                    } else {
                        var response = {
                            assignedVehicles: selectedrows
                        }
                        connection.release();
                        apiResponse.getData(res, 1006, 'assigned', [response]);
                    }
                }
            })
        }
    })
});

/*for adding vehicles*/
/*input JSON format*/
/*{vehicle_type_id":1,"vehicle_no":"UP 16 AS 5555","seats":55,"vehicle_id":10} */

router.post('/updateVehicle', auth.user, function (req, res, next) {

    if (!req.body.vehicle_no) {
        apiResponse.getData(res, 1007, 'Vehicle number required', [{}]);
    } else if (!req.body.vehicle_type_id) {
        apiResponse.getData(res, 1007, 'Vehicle name required', [{}]);
    } else if (!req.body.seats) {
        apiResponse.getData(res, 1007, 'seats required', [{}]);
    } else if (!req.body.vehicle_id) {
        apiResponse.getData(res, 1001, 'internal server error', [{}]);
    } else {
        var counter = 0;
        pool.getConnection(function (err, connection) {
            if (err) {
                apiResponse.getData(res, 1001, 'internal server error', [{}]);
            } else {
                var str = req.body.vehicle_no;
                str = str.replace(/[^a-z\d\s]+/gi, "");
                str = str.replace(/\s/g, "");
                var data = {
                    'vehicle_no': str
                    , 'vehicle_type_id': req.body.vehicle_type_id
                    , 'school_id': req.params.school_id
                    , 'seats': req.body.seats
                    , 'created_on': new Date()
                    , 'created_by': req.headers.uuid
                    , 'modified_on': new Date()
                    , 'modified_by': req.headers.uuid
                    , 'deleted': 0
                    , 'status': 1
                };
                connection.query('select id,vehicle_no,vehicle_type_id,school_id,seats from transport_vehicle where deleted = 0 and vehicle_no=' + "'" + str + "'" + ' and school_id=' + req.params.school_id + ' and id !=' + req.body.vehicle_id, function (err, results) {
                    if (err) {
                        connection.release();
                        apiResponse.getData(res, 1001, 'internal server error', [{}]);
                    } else if (results.length > 0) {
                        connection.release();
                        apiResponse.getData(res, 1002, 'vehicle already exists', [{}]);
                    } else {
                        connection.query('update transport_vehicle SET ? where id=' + req.body.vehicle_id, data, function (err, rows) {
                            if (!err) {
                                connection.query("select tv.id,tv.vehicle_no,tv.vehicle_type_id,tv.school_id,tv.seats,tv.assigned,tt.vehicle_type from transport_vehicle as tv left join transport_vehicle_type as tt on tv.vehicle_type_id=tt.id where tv.id=" + req.body.vehicle_id, function (err, rows) {
                                    var response = {
                                        'id': rows[0].id
                                        , 'vehicle_type_id': rows[0].vehicle_type_id
                                        , 'vehicle_no': rows[0].vehicle_no
                                        , 'seats': rows[0].seats
                                        , 'assigned': rows[0].assigned
                                        , 'vehicle_type': rows[0].vehicle_type
                                    };
                                    connection.release();
                                    apiResponse.getData(res, 1006, 'vehicle updated', [response]);
                                });
                            }
                        });
                    }
                });
            }
        });
    }

});

/*for getting  vehicle types*/

router.get('/getVehicleType', auth.user, function (req, res, next) {

    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'internal server error', [{}]);
        } else {
            var qur = 'select id,vehicle_type from transport_vehicle_type';
            connection.query(qur, function (err, results) {
                if (err) {
                    connection.release();
                    apiResponse.getData(res, 1001, 'internal server error', [{}]);
                } else {
                    if (results.length == 0) {
                        connection.release();
                        apiResponse.getData(res, 1002, 'no data in database', [{}]);
                    } else {
                        var resp = {
                            vehicleTypes: results
                        };
                        connection.release();
                        apiResponse.getData(res, 1006, 'success', [resp]);
                    }
                }
            });
        }
    });
});

module.exports = router;