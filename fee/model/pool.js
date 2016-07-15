
var mysql=require("mysql")
var mssql = require('mssql');


var pool =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '52.221.221.141',
    user     : 'root',
    password : '@514educomp',
    database : 'eol_prod',
    debug    :  false
});

module.exports=pool;