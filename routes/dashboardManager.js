var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var fs = require('fs');
var tilde = require('tilde-expansion');
var bPromise = require('bluebird');
var csv = require('csv');
var base64 = require('base-64');
var csvParse = require('csv-parse');
var syncParse = require('csv-parse/lib/sync');
var hummus = require('hummus');
var mkdirp = require('mkdirp');
var zlib = require('zlib');
var gzip = zlib.createGzip();
var archiver = require('archiver');
var fsE = require('fs-extra');
var mongo = require('../Database/mongo-db');

var TTI = require('../internalModules/TTI_Module');

router.post('/update-manager-notes', function(req, res, next) {

  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    mongo.updateDashboardManagerNotes(data.db, req.body.school, req.body.version, req.body.notes)
    // access collection (req.body.school)
    // access version (req.body.version)
    // find and update...


  })

})

module.exports = router;
