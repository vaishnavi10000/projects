var passport = require('passport');
var Strategy = require('passport-local');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var pool = require('../model/pool')
var config = require('../config');

var userStore = {};

passport.use(new Strategy(
    function (username, password, done) {
        if (!username || !password) {

            done(null, {
                "description": "username and password both required",
                "success": false
            });

        }
        var hash = crypto.createHash("md5").update(password).digest('hex');
        userStore[username.username] = hash;
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log("error in connection");
                done(null, {
                    "description": "database err",
                    "success": false,
                    "user": null,
                    "status": 1001
                });
                connection.release();
            }
            var query = 'select UUID,login_id, password,first_name,middle_name,last_name,school_id,role_id,active from user_master where login_id=' + '"' + username + '"';

            connection.query(query, function (err, data) {
                connection.release();
                if (!err) {
                    if (data.length == 0) {
                        console.log("dataa null ");
                        done(null, {
                            "description": "invalid user",
                            "success": false,
                            "user": null,
                            "status": 1004
                        });
                    }
                    /*instead of password,hash will be matched */
                    else if (data != null && data[0].password == password) {
                        console.log("Validated")

                        done(null, {
                            "description": "validated",
                            "success": true,
                            user: [{
                                "UUID": data[0].UUID,
                                "login_id": data[0].login_id,
                                "first_name": data[0].first_name,
                                "middle_name": data[0].middle_name,
                                "last_name": data[0].last_name,
                                "school_id": data[0].school_id,
                                "role_id": data[0].role_id,
                                "active": data[0].active,
                                "token": config.generateJWT()
                            }],
                            "status": 1002
                        });
                    } else {
                        console.log("not match")
                        done(null, {
                            "description": "invalid password",
                            "success": false,
                            "user": null,
                            "status": 1007
                        });
                    }
                }
            });
            connection.on('error', function (err) {
                console.log("error in connection");
                done(null, {
                    "description": "error in connection database",
                    "success": false,
                    "user": null,
                    "status": 1005
                });
            });
        });
    }
));


module.exports = passport;