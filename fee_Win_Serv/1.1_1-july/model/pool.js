
var mssql = require('mssql');

var pool={}

pool.connection2=mssql.connect("mssql://sa:sa@1@10.0.21.140/MDB_School");
pool.request=new mssql.Request();
module.exports=pool;