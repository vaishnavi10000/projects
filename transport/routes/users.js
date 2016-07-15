var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var pool=require('../model/pool')

/* GET users listing. */
router.post('/user_details',auth, function(req, res, next) {
	console.log(req.payload)
	pool.getConnection(function(err,connection){
        if (err) {
          
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from user_master LIMIT 10",function(err,rows){
          
            if(!err) {
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
         connection.release();
  });
  
});

module.exports = router;
