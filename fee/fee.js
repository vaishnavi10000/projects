var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var getBalance = require('./routes/getBalance');
var getLedger = require('./routes/getLedger');
var ledger = require('./routes/studentLedger');
var fee = require('./routes/feeCollectionDetail');

var app = express();

//registering port;
app.set('port', process.env.PORT || '3005');
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true , limit: '1gb'}));
app.use(cookieParser());
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');
//env setting
process.env.node_env = "dev"

//routing for public content;
app.use('/balance', getBalance);
app.use('/ledger', getLedger);
app.use('/student', ledger);
app.use('/fee', fee);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//handle exception
process.on('uncaughtException', function(err) {
    console.log('Throw Exception: ', err.message);
});
module.exports = app;