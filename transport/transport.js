var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
//var routes = require('./routes/index');

process.dummyData=require('./dummytransportData.json');

require('./passport/passport');

var app = express();
/*var routeStoppage = require('./routes/addStoppage');
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
var assignVehicles = require('./routes/assignVehicles');*/
/*var getClassList = require('./routes/getClassList');
var getSectionList = require('./routes/getSectionList');
var getStudentList = require('./routes/getStudentList');
var addStudent = require('./routes/addStudent');
var deleteStudent = require('./routes/deleteStudent');
var getAssignedVehicles = require('./routes/getAssignedVehicles');
var unassignVehicle = require('./routes/unassignVehicle');
var location = require('./routes/getLatLong');
var getAllStudent = require('./routes/getAllStudent');
var updateVehicle = require('./routes/updateVehicle');
var updateDriver=require('./routes/updateDriver');
var editRoute = require('./routes/editRoute');*/

var stoppage = require('./routes/stoppage');
var route = require('./routes/route');
var student = require('./routes/student');
var vehicle = require('./routes/vehicle');
var driver = require('./routes/driver');
var getClassList = require('./routes/getClassList');
var getSectionList = require('./routes/getSectionList');
var location = require('./routes/getLatLong');
var cors = require('cors');

var app = express();
app.use(cors());
app.use('/', express.static(__dirname + '/app'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

//registering port;
/*app.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "http://devr.fliplearn.com");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type, accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    return next();
  }
);*/
app.set('port', process.env.PORT || '3003');

app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'jade');
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//routing for public content;
app.use(passport.initialize());

//env setting
process.env.node_env = "dev"

//routing for public content;


/*app.use('/route', addRoute);
app.use('/routes', getRouteList);
app.use('/delete', deleteRoute);
app.use('/driver', addDriver);
app.use('/delete', deleteDriver);
app.use('/updateDriver',updateDriver);
app.use('/drivers', getDriverList);
app.use('/routestoppage', routeStoppage);
app.use('/getstop', getStoppage);
app.use('/deletestop', deleteStoppage);
app.use('/add', addVehicles);
app.use('/removeVehicle', removeVehicles);
app.use('/getVehicle', getVehicles);
app.use('/assignVehicle', assignVehicles);*/
/*app.use('/class', getClassList);
app.use('/section', getSectionList);
app.use('/student', getStudentList);
app.use('/addstop', addStudent);
app.use('/deleteStudent', deleteStudent);
app.use('/getVehicles', getAssignedVehicles);
app.use('/unassign', unassignVehicle);
app.use('/getLatLong', location);
app.use('/stoppage', getAllStudent);
app.use('/updatevehicle', updateVehicle);
app.use('/editRoute', editRoute);
app.use('/editStoppage', editRoute);*/

app.use('/stoppage',stoppage);
app.use('/route',route);
app.use('/student',student);
app.use('/vehicle',vehicle);
app.use('/driver',driver);
app.use('/class', getClassList);
app.use('/section', getSectionList);
app.use('/getLatLong', location);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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