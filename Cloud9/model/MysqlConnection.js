
var pool = require('../model/pool')
var MysqlConnection = '';
process.argv.forEach((val, index) => {

  if(index == 2 && val == 'stg'){
   MysqlConnection =  pool.stgConnection1;
  }else if(index == 2 && val == 'prod'){
   MysqlConnection = '';

  }else if(index == 2 && val == 'int'){
  // domainName = '10.10.2.62:3005';
    MysqlConnection = pool.intConnection2;
  
  }else if(index == 2 && val == 'dev'){
   //domainName = '10.10.2.82:3005';
   MysqlConnection =pool.devConnection1 ;
  
  }else{
   MysqlConnection = pool.defaultConnection;
  } 
});

module.exports=MysqlConnection;