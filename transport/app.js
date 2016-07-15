var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var routes = require('./routes/index');
var routeStoppage = require('./routes/addStoppage');
var getStoppage = require('./routes/getStoppage');
var deleteStoppage=require('./routes/deleteStoppage');
var addRoute = require('./routes/addRoute');
var deleteRoute = require('./routes/deleteRoute');
var getRouteList = require('./routes/getRouteList');
var addDriver = require('./routes/addDriver');
var deleteDriver = require('./routes/deleteDriver');
var getDriverList = require('./routes/getDriverList');
var addVehicles = require('./routes/addVehicle');
var removeVehicles = require('./routes/removeVehicles');
var getVehicles = require('./routes/getVehicles');
var assignVehicles = require('./routes/assignVehicles');
var getClassList = require('./routes/getClassList');
var getSectionList = require('./routes/getSectionList');
var getStudentList = require('./routes/getStudentList');
var addStudent = require('./routes/addStudent');
var deleteStudent = require('./routes/deleteStudent');

require('./passport/passport');

var app = express();
app.use('/', express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.set('port', process.env.PORT || '4000');

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

// view engine setup
app.set('views', path.join(__dirname, '/app/views'));
app.set('view **engine**', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
/*app.use(express.static(path.join(__dirname, 'public')));*/
app.use(passport.initialize());

//app.use('/', authUser);
//app.use('/users', users);

app.use('/route', addRoute);
app.use('/routes', getRouteList);
app.use('/delete', deleteRoute);
app.use('/driver', addDriver);
app.use('/delete', deleteDriver);
app.use('/drivers', getDriverList);
app.use('/routestoppage', routeStoppage);
app.use('/getstop', getStoppage);
app.use('/deletestop', deleteStoppage);
app.use('/add', addVehicles);
app.use('/removeVehicle', removeVehicles);
app.use('/getVehicle', getVehicles);
app.use('/assignVehicle', assignVehicles);
app.use('/class', getClassList);
app.use('/section', getSectionList);
app.use('/student', getStudentList);
app.use('/addstop', addStudent);
app.use('/deleteStudent', deleteStudent);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
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


module.exports = app;
