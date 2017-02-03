require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require('socket.io');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

var app = express();

var io = socket_io();
app.io = io;

var auth = require('./routes/auth');
var entListGeneration = require('./routes/entListGeneration');
var blueListGeneration = require('./routes/blueListGeneration');
var sumStatsGeneration = require('./routes/sumStatsGeneration');
var batchReportDownloader = require('./routes/batchReportDownloader')(io);
var TTI_API = require('./routes/TTI_API');
var dashboard = require('./routes/dashboard');
var dashboardManager = require('./routes/dashboardManager');

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.set('case sensitive routing', true);

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/assets/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(bearerToken());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/auth', auth);

// reroute url parameters of angular ui-router routes
app.use("/login", express.static(__dirname + "/public/index.html"));
app.use("/dashboard_manager", express.static(__dirname + "/public/index.html"));
app.use("/blue_list", express.static(__dirname + "/public/index.html"));
app.use("/ent_list", express.static(__dirname + "/public/index.html"));
app.use("/tti_batchdl", express.static(__dirname + "/public/index.html"));
app.use("/sum_page", express.static(__dirname + "/public/index.html"));
app.use("/sum_stats", express.static(__dirname + "/public/index.html"));
app.use("/dashboard_gen", express.static(__dirname + "/public/index.html"));
app.use("/dashboards/:collection/:id", express.static(__dirname + "/public/index.html"));
app.use("/dashboards/:collection/:id/:studentpath", express.static(__dirname + "/public/index.html"));

// On each request to server route, verify jwt token before access
app.use(function (req,res,next) {

  console.log(req.token);
  if (req.token) {
    jwt.verify(JSON.parse(req.token), process.env.JWT_SECRET, function(err, decoded) {
      if (!err) {
        next();
      } else {
        console.log(err);
        // res.status(401).send('Unauthorized');
        res.redirect('/login');
      }
    })
  } else {
    res.redirect('/login');
  }

});


app.use('/ent-list', entListGeneration);
app.use('/blue-list', blueListGeneration);
app.use('/summary-stats', sumStatsGeneration);
app.use('/batch-download', batchReportDownloader);
app.use('/TTI-API', TTI_API);
app.use('/dashboard', dashboard);
app.use('/dashboard-manager', dashboardManager);


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
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
  res.send({
    message: err.message,
    error: {}
  });
});


module.exports = app;
