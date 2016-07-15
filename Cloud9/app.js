var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schoolMaster = require('./routes/schoolMaster');
var userMaster = require('./routes/userMaster');


var app = express();

//registering port;
app.set('port', process.env.PORT || '3005');
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');
//env setting
process.env.node_env = "dev"


app.use('/school', schoolMaster);
app.use('/user', userMaster);

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
    res.json(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(err);
});


app.use(function(err,req,res,next){
console.log(err)
    res.json(err);
})
//handle exception
process.on('uncaughtException', function(err) {
    console.log('Throw Exception: ', err.message);
//  res.json(err.message)
});
module.exports = app;