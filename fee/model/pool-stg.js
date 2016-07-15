
var mysql=require("mysql")
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '10.10.6.31',
    user     : 'root',
    password : '@514educomp',
    database : 'eol_prod',
    debug    :  false
});
module.exports=pool;