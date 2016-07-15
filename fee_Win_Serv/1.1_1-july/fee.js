var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ledger = require('./routes/studentLedger');
var fee = require('./routes/feeCollectionDetail');


var app = express();

//registering port;
app.set('port', process.env.PORT || '3006');
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'jade');
//env setting
process.env.node_env = "dev"

//routing for public content;

app.use('/student', ledger);
app.use('/fee', fee);




//handle exception
process.on('uncaughtException', function(err) {
    console.log('Throw Exception: ', err.message);
});
module.exports = app;