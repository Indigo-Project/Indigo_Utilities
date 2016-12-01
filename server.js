require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io = require('socket.io');

var app = express();

var io = socket_io();
app.io = io;
var api = require('./routes/api')(io);

console.log('TEST LOG');

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/assets/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// reroute url parameters of angular ui-router routes
app.use("/pbi_pfmt", express.static(__dirname + "/public/index.html"));
app.use("/blue_list", express.static(__dirname + "/public/index.html"));
app.use("/ent_list", express.static(__dirname + "/public/index.html"));
app.use("/tti_massdl", express.static(__dirname + "/public/index.html"));
app.use("/sum_page", express.static(__dirname + "/public/index.html"));
app.use("/sum_stats", express.static(__dirname + "/public/index.html"));
app.use("/dashboard_gen", express.static(__dirname + "/public/index.html"));

app.use('/api', api);

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
