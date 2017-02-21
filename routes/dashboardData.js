var express = require('express');
var router = express.Router();
var path = require('path');

var mongo = require('../Database/mongo-db');
var TTI = require('../internalModules/TTI_Module');

require('should');


router.post('/toggle-active-status', function(req, res, next) {

  console.log(req.body);

  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    mongo.toggleDashboardDataActivationStatus(data.db, req.body.promptedStatus, req.body.schoolCode, req.body.id)
    .then(function(data) {
      var successMessage = 'status changed from ' + data.value.metaData.activated + ' to ' + req.body.promptedStatus;
      console.log(successMessage);
      data.ok === 1 ? res.end(successMessage) : res.status(400);
    }).catch(function(error) {
      console.log(error);
    })
  })

})

module.exports = router;
