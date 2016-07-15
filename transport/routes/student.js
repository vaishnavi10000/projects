var express = require('express');
var router = express.Router();
var pool=require('../model/pool')
var apiResponse = require('../response');
var schoolActive = require('../function/schoolActive');
var auth = require('../authuser');

/**
 * @Author: vaishnavi
 * @ngdoc function
 * @description:Api to add student to a route stoppage
 * Return:adds a student to a stoppage
 * Params:null
 */
router.post('/add', auth.user, function (req, res, next) {
if (!req.body.student_id || !req.body.route_id ) {
    apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
}else if(req.body.student_id.length==0){
          apiResponse.getData(res, 1007, 'Proper input missing', [{}]);
} else {
        var student_id = req.body.student_id;
      var available_seats=0;
    pool.getConnection(function (err, connection) {
    if(err){
             apiResponse.getData(res, 1001, 'Internal server error', [{}]);
     }else{
         // function to get student count at a route
          var getStudentCount=function(callBack){
           connection.query("select student_id from transport_route_stop_users where school_id=? and route_id=? and deleted=0", [req.params.school_id,req.body.route_id], function (err, rows) {
                          if (!err) {
                                    if (rows.length == 0) {
                                               callBack(null,0)
                                        } else {
                                                callBack(null, rows.length)
                                           } 
                                     } else {
                                            callBack(err, null)
                                            }
                                    });                
                }//function getStudentCount ends
                
    // function to do insertion in database            
    var addStudent=function(flag){
    if(flag==0){
              apiResponse.getData(res, 1005, available_seats+' seats available', [{}]);
     }else if (flag==1){
    // var student_id = req.body.student_id;
        var data = [];
        var studenStr = {
            "school_id": req.params.school_id,
            "route_id": req.body.route_id,
            "stoppage_id": req.body.stoppage_id,
            "created_by": req.headers.uuid,
            "modified_on": null,
            "modified_by": null,
            "deleted": "0",
            "status": "1",
        };
        var rest;
        var studentID;
        var studentStr = "";


       var studentExists = function (callback) {
        var reqIdsStr = "";
        for (var i = 0; i < student_id.length; i++) {
            reqIdsStr += student_id[i] + ","
        }
        pool.getConnection(function (err, connection) {
            if(err){
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            }else{
                reqIdsStr = reqIdsStr.substring(0, reqIdsStr.length - 1);
            connection.query("select student_id from transport_route_stop_users where student_id IN(" + reqIdsStr + ") AND deleted=0", function (err, rows) {

                if (err) {
                    callback(err, null)
                } else {
                    callback(null, rows);
                 }
            }); 
          }
        });
    }//function studentExists() ends
     studentExists(function (err, rows) {
     
            if (rows.length > 0 && rows.length != student_id.length) {
                for (var i = 0; i < rows.length; i++) {
                var index = student_id.indexOf(rows[i].student_id);
                student_id.splice(index, 1);
                }
                if(student_id.length>0){
                    for (var i = 0; i < student_id.length; i++) {
                    studentStr += '(' + studenStr.school_id + ',' + studenStr.route_id + ',' + studenStr.stoppage_id + ',' + '"' + new Date().toJSON() + '"' + ',' + studenStr.created_by + ',' + studenStr.modified_on + ',' + studenStr.modified_by + ',' + 0 + ',' + 1 + ',' + student_id[i] + ')' + ',';
                }//for
                studentStr = studentStr.substring(0, studentStr.length - 1);
                
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else {
                        var query = "insert into transport_route_stop_users (school_id,route_id,stoppage_id,created_on,created_by,modified_on,modified_by,deleted,status,student_id) VALUES"+studentStr;
                        connection.query(query, function (err, rows) {
                            if (err) {
                                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                            } else {
                                apiResponse.getData(res, 1006, 'Student added to stoppage', [{}]);
                            }
                        });
                    }
                });
                    
                }//if
                else{
                    apiResponse.getData(res, 1006, 'Student already exists', [{}]);
                }
               } else if (rows.length == 0) {
                for (var i = 0; i < student_id.length; i++) {
                    studentStr += '(' + studenStr.school_id + ',' + studenStr.route_id + ',' + studenStr.stoppage_id + ',' + '"' + new Date().toJSON() + '"' + ',' + studenStr.created_by + ',' + studenStr.modified_on + ',' + studenStr.modified_by + ',' + 0 + ',' + 1 + ',' + student_id[i] + ')' + ',';
                }
                studentStr = studentStr.substring(0, studentStr.length - 1);
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                    } else {
                        var query = "insert into transport_route_stop_users (school_id,route_id,stoppage_id,created_on,created_by,modified_on,modified_by,deleted,status,student_id) VALUES"+studentStr;
                        connection.query(query, function (err, rows) {
                            if (err) {
                                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
                            } else {
                                apiResponse.getData(res, 1006, 'Student added to stoppage', [{}]);
                            }
                        });
                    }
                });

            } else if (rows.length == student_id.length) {
                apiResponse.getData(res, 1002, 'Student already exists', [{}]);

            } else {
                apiResponse.getData(res, 1001, 'Internal server error', [{}]);
            }

        }); //function
      } 
    } // addStudent function ends
                 connection.query("select tr.id as route_id,tr.vehicle_id,tv.seats from transport_route_info tr left join transport_vehicle tv on tr.vehicle_id=tv.id where tr.school_id=? and tr.id=? and  tr.deleted=0", [req.params.school_id,req.body.route_id], function (err, route) {
                                         console.log("roueee..."+JSON.stringify(route));             
                                        if (!err) {
                                                if (route.length == 0) {
                                                    apiResponse.getData(res, 1002, 'Route does not exists', [{}]);
                                                } else {
                                                    console.log("seat.count"+route[0].seats);
                                                   //   var available_seats=0;
                                                         if(route[0].seats==0 || route[0].seats==null){
                                                             var seat_count=50; // when no vehicle assigned on this route
                                                             getStudentCount(function (err, studentCount ){      
                                                              if(err){
                                                                   apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);   
                                                               }else{
                                                                   console.log("student.count"+studentCount);
                                                                   available_seats=seat_count-studentCount;
                                                                   console.log(available_seats+"   available_seats");
                                                                   if(available_seats>=student_id.length){
                                                                       addStudent(1);
                                                                   }else{
                                                                       addStudent(0);
                                                                       //console.log("dont insert")
                                                                   }
                                                               }              
                                                             });      

                                                        }else{
                                                             var seat_count=route[0].seats; //when some vehicle is assigned
                                                             getStudentCount(function (err, studentCount){       
                                                              if(err){
                                                                   apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);   
                                                               }else{
                                                                   console.log("student.count"+studentCount);
                                                                   available_seats=seat_count-studentCount;
                                                                   if(available_seats>=student_id.length){
                                                                       addStudent(1);
                                                                       //console.log("do insertion")
                                                                   }else{
                                                                       addStudent(0);
                                                                     //  console.log("dont insert")
                                                                   }
                                                               }              
                                                             });      
                                                        }
                                                          
                                            } 
                                        } else { console.log("err..."+err)
                                                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                                            }
                                    });
              
                
                
          }//connection.release();
        });
    
  
    } //else
});

/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of students in a section
 * Request: sesion_token,uuid in header and section_id in query string 
 * Response:Array of students in a section
 */
router.get('/studentList/:section_id', auth.user, function (req, res, next) {
    if (!req.params.section_id) {
        apiResponse.getData(res, 1005, "section_id required", [{}]);
    } else {
        schoolActive.checkActive(req.params.school_id, function (data) {
            if (data == true) {
                pool.getConnection(function (err, connection) {
                    if (err) {
                        apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                    } else {
                        connection.query("select a.UUID as student_id,um.first_name,um.middle_name,um.last_name from user_group_details as a left join user_master as um on a.UUID=um.UUID where a.group_id=? and a.role_id=2 and um.UUID not in (select tr.student_id from transport_route_stop_users as tr where tr.student_id is not null and tr.school_id=? and tr.deleted=0 and tr.status=1)", [req.params.section_id,req.params.school_id], function (err, rows) {
                            if (!err) {
                                if (rows.length == 0) {
                                    apiResponse.getData(res, 1005, "No student found in this section", [{}]);
                                } else {
                                    var response = {
                                        studentList: rows
                                    }
                                    apiResponse.getData(res, 1002, 'Success', [response]);
                                }
                            } else {
                                apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);

                            }
                        });

                        connection.release();
                    }
                });

            } else {
                apiResponse.getData(res, 1005, 'School Inactive', [{}]);
            }
        });
    } //else
});


/* Transport Module
 * Payal Vishwakarma - 20/04/2016
 * Method to get list of students in a section
 * Request: sesion_token,uuid in header and route_id in params
 * Response:Array of students at  stoppages  in a route
 */

router.get('/listStudents/:route_id', auth.user, function(req, res, next) {
 if (!req.params.route_id || req.params.route_id=='')
  {
        apiResponse.getData(res, 1007, "route_id required",[{}]);
     }
   else{
         schoolActive.checkActive(req.params.school_id,function(data){
        if(data==true){
            pool.getConnection(function(err,connection){
              if (err) {
                  apiResponse.getData(res, 1001, 'Internal server Error',[{}]);
                      connection.release();
                           } 
                      connection.query("select route_id ,id as stoppage_id,stoppage_name from transport_route_stoppage where route_id=? and deleted=0 and status=1",[req.params.route_id],function(err,stoppage){
                     if(!err){
                             var stoppageStudent=[];
                            if (stoppage.length == 0) {
                              apiResponse.getData(res, 1005,"No stoppage on this route", [{}]);
                             }
                             else {
                                          connection.query("select t.route_id,t.id as stoppage_id, t.stoppage_name, ts.student_id, u.UUID, u.first_name,u.middle_name,u.last_name from transport_route_stoppage as t left join transport_route_stop_users as ts on t.id=ts.stoppage_id left join user_master as u on u.UUID =ts.student_id where ts.route_id=? and ts.status=1 and ts.deleted=0 and ts.school_id=?",[req.params.route_id,req.params.school_id],function(err,students){
                                                if(!err){
                                                       if (students.length == 0) {
                                                          for(var stoppageCount=0; stoppageCount < stoppage.length; stoppageCount++){  
                                                              var obj={};
                                                               obj.stoppage_id=stoppage[stoppageCount].stoppage_id;
                                                               obj.stoppage_name=stoppage[stoppageCount].stoppage_name;
                                                               obj.students=[];
                                                               stoppageStudent.push(obj);
                                                               }
                                                               var response={
                                                 studentList:stoppageStudent
                                                } 
                                                               apiResponse.getData(res, 1002, 'Ok',[response]);
                                                            }
                                                            else {                                                            
                                                             for(var stoppageCount=0; stoppageCount < stoppage.length; stoppageCount++){
                                                              var obj={};
                                                               obj.stoppage_id=stoppage[stoppageCount].stoppage_id;
                                                               obj.stoppage_name=stoppage[stoppageCount].stoppage_name;
                                                                obj.students=[];
                                                               for(var studentCount=0; studentCount < students.length; studentCount++){
                                                                if(stoppage[stoppageCount].stoppage_id ==students[studentCount].stoppage_id){
                                                                    obj.students.push(students[studentCount])
                                                                }

                                                               }
                                                              stoppageStudent.push(obj);
                                                             }
                                                                  var response={
                                                 studentList:stoppageStudent
                                                } 
                                                                 apiResponse.getData(res, 1002, 'Ok',[response]);

                                                                  }
                                                       } 
                                              else{
                                                     apiResponse.getData(res, 1001, 'Internal server Error',[{}]);
                                                     connection.release();
                                            }   
                                             });
                                        
                    
                           }
                            }    
                    else{
                      apiResponse.getData(res, 1001, 'Internal server Error',[{}]);
                      connection.release();
                     }
                 });
                   connection.on('error', function(err) {  
                      apiResponse.getData(res, 1001, 'Internal server Error',[{}]);
              });
              });
       
      }else{
        apiResponse.getData(res, 1005, 'School Inactive',[{}]);
      }
      });
      }//else
    });
/**
 * @Author: vaishnavi
 * @ngdoc function
 * @name transportApp.controller:AddvehiclesCtrl
 * @description:Api to delete student to a route stoppage
 * Return:success
 * Params:null
 */
router.post('/delete', auth.user, function(req, res, next) {
	if(!req.body.student_id){
	apiResponse.getData(res, 1007, 'missing data', [{}]);
	}else if(isNaN(req.body.student_id) ){
	 apiResponse.getData(res, 1007, 'Enter valid school id and student_id', [{}]);
	}else{
	pool.getConnection(function(err,connection){
		if(err){
			apiResponse.getData(res, 1001, 'Internal server error', [{}]);	
		}
        else{
			var query="UPDATE transport_route_stop_users SET deleted="+1+" , status="+0+",modified_by="+req.headers.uuid+" WHERE school_id="+req.params.school_id+" AND student_id="+req.body.student_id+" AND deleted=0 AND status=1";
	connection.query(query,
	function(err, rows) {
		if(err){
			apiResponse.getData(res, 1003, 'Exception Occurred', [{}]);
			
		}else if(rows.affectedRows==0 && rows.changedRows==0){
			apiResponse.getData(res, 1002, 'Record already deleted', [{}]);	
		}
		else{
			apiResponse.getData(res, 1006, 'Student removed from stoppage', [{}]);	
			}
		});
		connection.on('error', function(err) {
		apiResponse.getData(res, 1001, 'Internal server error', [{}]);
		});
         connection.release();
    }
	});
        
}	
});
module.exports = router;