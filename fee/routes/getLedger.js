var express = require('express');
var router = express.Router();
var apiResponse = require('../response');

/* Fee payment Module
 * Abhishek Arora - 22/06/2016
 * Method to get the detail information
 * Request: school_id and admission_no in body
 * Response: detail balance amount
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
router.post('/getLedger', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            apiResponse.getData(res, 1001, 'Internal Server Error', [{}]);
        } else {
            var Invo = [];
            var pay = [];
            
            var query = "select tdc.Transaction_No,tdc.Debit_Amount,tdc.Credit_Amount,tdc.Document_Type,tdc.Amount from Temp_Det_Cust_Ledg_Entry as tdc left join fee_school_map as fsm on fsm.school_name=tdc.Company_Name where fsm.school_id = ? and tdc.Customer_No = ?";
            connection.query(query, [req.body.school_id, req.body.Admission_no], function (err, rows) {

                if (!err) {
                    if (rows.length == 0) {
                        connection.release();
                        apiResponse.getData(res, 1005, "No data found for ledger details", [{}]);
                    } else {

                        for (var i = 0; i < rows.length; i++) {
                            var x = {
                                "Amount": rows[i].Amount,
                                "Transaction_No": rows[i].Transaction_No,
                                "Document_Type": rows[i].Document_Type,
                                "Debit_Amount": rows[i].Debit_Amount,
                                "Credit_Amount": rows[i].Credit_Amount
                            }
                            if (rows[i].Document_Type == 1) {
                                Invo.push(x);
                            } else if (rows[i].Document_Type == 2) {
                                pay.push(x);
                            }
                        }
                        var response = {
                            "Invoice":Invo,
                            "Payment":pay
                        }
                        connection.release();
                        apiResponse.getData(res, 1002, 'Ok', [response]);
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