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
console.log('inside 1');

router.post("/validate-request-endpoint", function(req, res, next) {
  console.log('inside');
  if (req.body.mode === "verify") {
    var listReportsEndpoint = TTI.APIs.listReports.generateEndpoint(req.body.accountID, req.body.linkID);
    TTI.APIs.requestFormat("GET", listReportsEndpoint, req.body.login, req.body.password)
    .then(function(reportList1) {
      var showLinkEndpoint = TTI.APIs.showLink.generateEndpoint(req.body.accountID, req.body.linkID);
      TTI.APIs.requestFormat("GET", showLinkEndpoint, req.body.login, req.body.password)
      .then(function(linkInfo) {
        var fixedData = [reportList1.slice(0,133), ",", reportList1.slice(133)].join('');
        csv.parse(fixedData, function(error, reportList2) {
          reportList2.shift();
          var reportTypes = [];
          var filteredReportList = [];

          for (var i = 0; i < reportList2.length; i++) {
            var match = false;
            if (!reportTypes.length) {
              reportTypes.push(reportList2[i][11]);
            }
            for (var j = 0; j < reportTypes.length; j++) {
              if (reportList2[i][11] === reportTypes[j]) {
                match = true;
              }
            }
            if (!match) {
              reportTypes.push(reportList2[i][11]);
            }
          }
          res.send({ reportList: reportList2, reportTypes: reportTypes, linkInfo: JSON.parse(linkInfo) });
        })
      }).catch(function(error) {
        res.send({ error: error });
      })
    }).catch(function(error) {
      res.send({ error: error });
    })
  } else if (req.body.mode === "filter") {
    var reportList = req.body.currentLinkReportList;
    var reportTypeFilter = req.body.reportTypeFilter;
    var filteredReportList = [];
    for (var i = 0; i < reportList.length; i++) {
      var match = false;
      for (var j = 0; j < reportTypeFilter.length; j++) {
        if (reportList[i][11] === reportTypeFilter[j]) {
          match = true;
        }
      }
      if (match) {
        filteredReportList.push(reportList[i])
      }
    }
    res.send({ filteredReportList: filteredReportList });
  }
})

module.exports = router;
