var express = require('express');
var router = express.Router();
var apiResponse = require('../response');

var request = require('request');

/**
 * @Author: vaishnavi
 * @description:Api to dump student ledger data to fliplearn ledger table(Temp_Det_Cust_Ledg_Entry)
 * Return:JSON
 * Params:null
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
router.post('/dumpLedger', function(req, res, next) {

if(!req.body.ledgers){
apiResponse.getData(res, 100, 'no body', [{}]);
}else{
    var newLedgers = JSON.parse(req.body.ledgers)
    var ledgerStr = '';
    
    /*Database connection to fliplearn database*/
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log("error1",err)
            apiResponse.getData(res, 1001, 'Internal server error1', [{}]);
        } else {
            if (newLedgers.length > 0) {
                for (var i = 0; i < newLedgers.length; i++) {
                    ledgerStr += '("' + newLedgers[i]["Customer No_"] + '","' + newLedgers[i]["Company Name"] + '","' + newLedgers[i]["Entry No_"] + '","' + newLedgers[i]["Posting Date"] + '",' + newLedgers[i]["Document Type"] + ',"' + newLedgers[i]["Document No_"] + '","' + newLedgers[i]["Journal Batch Name"] + '",' + Math.round(newLedgers[i]["Amount"]) + ',' + newLedgers[i]["Insert Status"] + ',' + newLedgers[i]["Cust_ Ledger Entry No_"] + ',' + newLedgers[i]["Entry Type"] + ',' + newLedgers[i]["Amount (LCY)"] + ',"' + newLedgers[i]["Currency Code"] + '","' + newLedgers[i]["User ID"] + '","' + newLedgers[i]["Source Code"] + '",' + newLedgers[i]["Transaction No_"] + ',"' + newLedgers[i]["Reason Code"] + '",' + newLedgers[i]["Debit Amount"] + ',' + newLedgers[i]["Credit Amount"] + ',' + newLedgers[i]["Debit Amount (LCY)"] + ',' + newLedgers[i]["Credit Amount (LCY)"] + ',"' + newLedgers[i]["Initial Entry Due Date"] + '","' + newLedgers[i]["Initial Entry Global Dim_ 1"] + '","' + newLedgers[i]["Initial Entry Global Dim_ 2"] + '","' + newLedgers[i]["Gen_ Bus_ Posting Group"] + '","' + newLedgers[i]["Gen_ Prod_ Posting Group"] + '",' + newLedgers[i]["Use Tax"] + ',"' + newLedgers[i]["VAT Bus_ Posting Group"] + '","' + newLedgers[i]["VAT Prod_ Posting Group"] + '",' + newLedgers[i]["Initial Document Type"] + ',' + newLedgers[i]["Applied Cust_ Ledger Entry No_"] + ',' + newLedgers[i]["Unapplied"] + ',' + newLedgers[i]["Unapplied by Entry No_"] + ',' + newLedgers[i]["Remaining Pmt_ Disc_ Possible"] + ',' + newLedgers[i]["Max_ Payment Tolerance"] + ',"' + newLedgers[i]["Tax Jurisdiction Code"] + '","' + newLedgers[i]["TDS Nature of Deduction"] + '",' + newLedgers[i]["TDS Group"] + ',' + newLedgers[i]["Total TDS_TCS Incl_ SHECESS"] + ',"' + newLedgers[i]["TCS Nature of Collection"] + '",' + newLedgers[i]["TCS Type"] + '),'
                };
                
                ledgerStr = ledgerStr.substring(0, ledgerStr.length - 1);
                var query3 = 'INSERT INTO Temp_Det_Cust_Ledg_Entry (Customer_No,Company_Name,Entry_No,Posting_Date,Document_Type,Document_No,Journal_Batch_Name,Amount,Insert_Status,Cust_Ledger_Entry_No,Entry_Typ,Amount_LCY,Currency_Code,User_ID,Source_Code,Transaction_No,Reason_Code,Debit_Amount,Credit_Amount,Debit_Amount_LCY,Credit_Amount_LCY,Initial_Entry_Due_Date,Initial_Entry_Global_Dim_1,Initial_Entry_Global_Dim_2,Gen_Bus_Posting_Group,Gen_Prod_Posting_Group,Use_Tax,VAT_Bus_Posting_Group,VAT_Prod_Posting_Group,Initial_Document_Type,Applied_Cust_Ledger_Entry_No,Unapplied,Unapplied_by_Entry_No,Remaining_Pmt_Disc_Possible,Max_Payment_Tolerance,Tax_Jurisdiction_Code,TDS_Nature_of_Deduction,TDS_Group,Total_TDS_TCS_Incl_SHECESS,TCS_Nature_of_Collection,TCS_Type) values' + ledgerStr;
                
                connection.query(query3, function(err, InsertedLedgers) {
                    
                    if (err) {
                        
                        console.log("error2",err)
                       connection.release();
                        apiResponse.getData(res, 1001, 'Internal Server error2', [{}]);
                    } else {
                        connection.release();
                        apiResponse.getData(res, 1006, 'Successfully Synced', [{
                            "affectedRows": InsertedLedgers.affectedRows
                        }]);
                    }
                });
            } else {
                apiResponse.getData(res, 1002, 'No data to be synced', [{}]);
            }
        }
    })
}





});
module.exports = router;