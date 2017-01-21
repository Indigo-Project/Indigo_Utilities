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

// Generate Entrepreneur List
router.post('/generate', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  // FOR EACH INPUT FILE (TTI LINK), RELATIVE COLUMN HEADER INDICES ARE SET
  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      var fnIndex, lnIndex, genderIndex, DomIndex, InfIndex, SteIndex, ComIndex, TheIndex, UtiIndex, AesIndex, SocIndex, IndIndex, TraIndex;

      csvParse(data.data, function(err, output) {
        var columnHeaders = output[0];
        for (var j = 0; j < columnHeaders.length; j++) {
          if (columnHeaders[j] === "FIRST NAME") {
            fnIndex = j;
          }
          if (columnHeaders[j] === "LAST NAME") {
            lnIndex = j;
          }
          if (columnHeaders[j] === "GENDER") {
            genderIndex = j;
          }
          if (columnHeaders[j] === "D NATURAL (%)") {
            DomIndex = j;
          }
          if (columnHeaders[j] === "I NATURAL (%)") {
            InfIndex = j;
          }
          if (columnHeaders[j] === "S NATURAL (%)") {
            SteIndex = j;
          }
          if (columnHeaders[j] === "C NATURAL (%)") {
            ComIndex = j;
          }
          if (columnHeaders[j] === "TEN_THE") {
            TheIndex = j;
          }
          if (columnHeaders[j] === "TEN_UTI") {
            UtiIndex = j;
          }
          if (columnHeaders[j] === "TEN_AES") {
            AesIndex = j;
          }
          if (columnHeaders[j] === "TEN_SOC") {
            SocIndex = j;
          }
          if (columnHeaders[j] === "TEN_IND") {
            IndIndex = j;
          }
          if (columnHeaders[j] === "TEN_TRA") {
            TraIndex = j;
          }
        }
        if (fnIndex === "" || lnIndex === "" || genderIndex === "" || DomIndex === "" || InfIndex === "" || SteIndex === "" || ComIndex === "" || TheIndex === "" || UtiIndex === "" || AesIndex === "" || SocIndex === "" || IndIndex === "" || TraIndex === "") {
          resolve({ errReason: "Client Error: Incorrect Report Type", internalMessage: "One or more indices is null", externalMessage: "One or more uploaded reports is the incorrect report type for entrepreneur list generation. Refresh and try again. List of acceptable Report Types:\n\n-Talent Insights\n-Trimetrix"})
        } else {
          var indexArr = [fnIndex, lnIndex, genderIndex, DomIndex, InfIndex, SteIndex, ComIndex, TheIndex, UtiIndex, AesIndex, SocIndex, IndIndex, TraIndex];
          var body = { data: output, indexArr: indexArr };
          resolve(body);
        }
      });
    })
  }

  // OUTPUT ENT LIST FOR INPUT FILE (TTI LINK) USING RELATIVE DATA INDICES
  function outputEntData(data, indexArr) {
    return new Promise(function(resolve, reject) {

      var entListArr = [];

      console.log(indexArr);

      for (var i = 1; i < data.length; i++) {

        // GET SCORES
        var DomScore = data[i][indexArr[3]]
        var ComScore = data[i][indexArr[6]]
        var UtiScore = data[i][indexArr[8]]
        var SocScore = data[i][indexArr[10]]
        var IndScore = data[i][indexArr[11]]

        // CREATE CALCS
        var DomCalc = Math.max(-20, (DomScore - 50) );
        var ComCalc = Math.max(-20, Math.min((40 - ComScore), 20) );
        var UtiCalc = Math.max(-20, Math.min(10*(UtiScore - 4), 20) );
        var IndCalc = Math.max(-20, 10 * (IndScore - 5) );

        // ENT LIST OR NOT, SOC-ENT OR NOT
        var socialEntr;
        var studentOutput;

        if ((DomCalc + ComCalc + UtiCalc + IndCalc) > 19) {
          if ( (SocScore >= UtiScore) && (SocScore > 4.9) ){
            socialEntr = "Yes";
          } else {
            socialEntr = "No";
          }
          studentOutput = [ data[i][indexArr[0]], data[i][indexArr[1]], data[i][indexArr[2]], data[i][indexArr[3]], data[i][indexArr[4]], data[i][indexArr[5]], data[i][indexArr[6]], data[i][indexArr[7]], data[i][indexArr[8]], data[i][indexArr[9]], data[i][indexArr[10]], data[i][indexArr[11]], data[i][indexArr[12]], socialEntr];
          entListArr.push(studentOutput)
        }
      }
      if (data) {
        resolve(entListArr);
      } else {
        reject('no data');
      }
    })
  }

  // COMPILE ENT LISTS FROM ALL INSTANCES
  function compileEntLists() {
    return new Promise(function(resolve, reject) {

      var count = 0;
      var exportFile = [];

      function forLoop(count) {
        if (count < filesToFormat.length) {
          setColumnHeaders(filesToFormat[count])
          .then(function(data1) {
            if (data1.errReason) {
              res.writeHeader(406, {"Content-Type": "application/json"});
              res.end(JSON.stringify(data1));
            } else {
              outputEntData(data1.data, data1.indexArr)
              .then(function(data2) {
                for (var j = 0; j < data2.length; j++) {
                  exportFile.push(data2[j]);
                }
                if (count === (filesToFormat.length - 1)) {
                  exportFile.unshift(['First', 'Last', 'Gender', 'Dominance-Nat', 'Infl-Nat', 'Stead-Nat', 'Compl-Nat', 'Theo', 'Util', 'Aesth', 'Soci', 'Indiv', 'Trad', 'SocialEntr'])
                  resolve(exportFile)
                } else {
                  count ++;
                  forLoop(count)
                }
              })
            }
          }).catch(function(error) {
            console.log(error);
          })
        }
      }
      forLoop(count);
    })
  }

  // FINAL EXECUTION FUNCTION
  function generateEntList() {

    compileEntLists()
    .then(function(data){
      csv.stringify(data, function(err, output) {
        if(output) {
          tilde('~/', function(userHome) {
            var destDir = "";
            var environment = process.env.NODE_ENV;
            if (environment === "production") {
              destDir = userHome + 'Output_Files/Entrepreneur_Lists/';
            } else if (environment === "development") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Entrepreneur_Lists/';
            }
            fs.access(destDir, fs.F_OK, function(error) {
              if (error) {
                console.log("fs.access Error", error);
                mkdirp(destDir, function(error) {
                  if (error) {
                    console.log("mkdirp error", error);
                  } else {
                    console.log("mkdirp success");
                    fs.writeFile(destDir + req.body.outputFileName + ".csv", output, function(error) {
                      if (error) {
                        console.log("write file error", error);
                      } else {
                        var filename = req.body.outputFileName + ".csv";
                        var filePath = destDir + filename;
                        var stat = fs.statSync(filePath);
                        var fileToSend = fs.readFileSync(filePath);
                        res.writeHead(200, {
                          'Content-Type': 'text/csv',
                          'Content-Length': stat.size,
                          'Content-Disposition': filename
                        })
                        res.end(fileToSend);
                        fsE.remove(destDir, function(error) {
                          if (error) console.log(error);
                          else console.log('Entrepreneur_Lists removed');
                        })
                      }
                    })
                  }
                })
              } else {
                console.log('DIRECTORY EXISTS');
              }
            })
          })
        }
      })
    });
  }

  generateEntList();

})

module.exports = router;
