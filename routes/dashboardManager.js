var express = require('express');
var router = express.Router();
var path = require('path');

var mongo = require('../Database/mongo-db');
var TTI = require('../internalModules/TTI_Module');

router.post('/update-manager-notes', function(req, res, next) {

  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    mongo.updateDashboardManagerNotes(data.db, req.body.school, req.body.version, req.body.notes)
  })

})

module.exports = router;
