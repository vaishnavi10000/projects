
var mysql=require("mysql")
var MongoClient = require('mongodb').MongoClient;

var pool={}

pool.devConnection1 =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '10.10.6.83',
    user     : 'root',
    password : '@514educomp',
    database : 'eol_prod',
    debug    :  false
});

pool.intConnection2 =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '10.10.6.63',
    user     : 'root',
    password : '@514educomp',
    database : 'eol_prod',
    debug    :  false
});

pool.stgConnection3 =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '10.0.21.141',
    user     : 'root',
    password : 'root',
    database : 'eol_prod',
    debug    :  false
});


pool.defaultConnection =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '10.0.21.141',
    user     : 'root',
    password : 'root',
    database : 'eol_prod',
    debug    :  false
});



pool.MongoUrl='mongodb://10.10.6.83:27017/CloudNine';
module.exports=pool;