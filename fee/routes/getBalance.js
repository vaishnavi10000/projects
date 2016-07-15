var express = require('express');
var router = express.Router();
var apiResponse = require('../response');

/* Fee payment Module
 * Abhishek Arora - 22/06/2016
 * Method to get the balance for the student
 * Request: school_id and admission_no in body
 * Response: Balance amount
 */
var ConfigNames = '';
process.argv.forEach((val, index) => {
	console.log("----"+val+"----");
  if(index == 2 && val == 'stg'){
	  ConfigNames = '/pool-stg.js';
	  //var pool = require(__dirname+'/pool-stg.js');
  }else if(index == 2 && val == 'prod'){
	  ConfigNames = '/pool-live.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else if(index == 2 && val == 'int'){
	  ConfigNames = '/pool-int.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else if(index == 2 && val == 'dev'){
	  ConfigNames = '/pool-dev.js';
	  //var pool = require(__dirname+'/pool-live.js');
  }else{
	  //var pool = require(__dirname+'/pool-local.js');
	  ConfigNames = '/pool-local.js';
  } 
});
var pool = require('../model'+ConfigNames);
router.post('/getBalance', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
        } else {
            var response = {
                Total_Balance: ""
                , Payment_Status: ""
            }
            var query = "select SUM(tdc.Amount)as Amount,tdc.Document_type FROM Temp_Det_Cust_Ledg_Entry as tdc left join fee_school_map as fsm on fsm.school_name=tdc.Company_Name where fsm.school_id = ? and tdc.Customer_No = ? group by tdc.Document_Type";

            connection.query(query, [req.body.school_id, req.body.Admission_no], function (err, rows) {
                if (!err) {
                    if (rows.length == 0) {
                        connection.release();
                        apiResponse.getData(res, 1005, "No data found for balance", [{}]);
                    } else {
                        var invoice = 0;
                        var payment = 0;
                        if (rows[0] != undefined && rows[0].Document_type == 1 && rows[0].Amount != undefined) {
                            invoice = rows[0].Amount;
                        }
                        if (rows[1] != undefined && rows[1].Document_type == 2 && rows[1].Amount != undefined) {
                            payment = rows[1].Amount;
                        }
                        var amount = invoice - payment;
                        if (amount < 0) {
                            response.Total_Balance = amount * (-1);
                            response.Payment_Status = "Advance";
                        } else if(amount==0){
                            response.Total_Balance = payment;
                            response.Payment_Status = "No Outstanding balance";
                        }else {
                            response.Total_Balance = amount;
                            response.Payment_Status = "Outstanding";
                        }
                        connection.release();
                        apiResponse.getData(res, 1002, 'Ok', [{
                            "data": response
                        }]);
                    }
                } else {
                    connection.release();
                    apiResponse.getData(res, 1004, 'Internal Server Error', [{}]);
                }
            });
        }
    });
})

module.exports = router;