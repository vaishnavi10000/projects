var pool = require('../model/pool')
var schoolActive = {};
var apiResponse = require('../response');

schoolActive.checkActive = function (school_id, cb) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log('Internal Server Error');
        } else {
            connection.query("select sm.school_id from school_master as sm where sm.school_id=? and sm.active=1", [school_id], function (err, rows) {
                if (!err) {
                    if (rows.length === 0) {
                        cb(false);
                    } else {
                        cb(true);
                    }
                } else {
                    cb(false);
                }
            });

            connection.release();
        }
    });

};


module.exports = schoolActive;