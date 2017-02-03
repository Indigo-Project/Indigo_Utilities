var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var tilde = require('tilde-expansion');
var csv = require('csv');
var csvParse = require('csv-parse');
var mkdirp = require('mkdirp');
var fsE = require('fs-extra');

var mongo = require('../Database/mongo-db');
var TTI = require('../internalModules/TTI_Module');

// Generate Blue List
router.post('/generate', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  // FOR EACH INPUT FILE (TTI LINK), RELATIVE COLUMN HEADER INDICES ARE SET
  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      // console.log(data);

      var fnIndex = "";
      var lnIndex = "";
      var genderIndex = "";

      var stressIndex = "";
      var confIndex = "";
      var selfIndex = "";
      var belongIndex = "";
      var resilIndex = "";
      var dirIndex = "";
      var dirbIndex = "";
      var eoIndex = "";
      var ptIndex = "";
      var sjIndex = "";

      csvParse(data.data, function(err, output) {
        // console.log(output);
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
          if (columnHeaders[j] === "HANDLING STRESS") {
            stressIndex = j;
          }
          if (columnHeaders[j] === "SELF CONFIDENCE") {
            confIndex = j;
          }
          if (columnHeaders[j] === "SENSE OF SELF") {
            selfIndex = j;
          }
          if (columnHeaders[j] === "SENSE OF BELONGING") {
            belongIndex = j;
          }
          if (columnHeaders[j] === "RESILIENCY") {
            resilIndex = j;
          }
          if (columnHeaders[j] === "SELF DIRECTION") {
            dirIndex = j;
          }
          if (columnHeaders[j] === "SELF DIRECTION BIAS") {
            dirbIndex = j;
          }
          if (columnHeaders[j] === "UNDERSTANDING OTHERS" || columnHeaders[j] === "EMPATHETIC OUTLOOK") {
            eoIndex = j;
          }
          if (columnHeaders[j] === "PRACTICAL THINKING") {
            ptIndex = j;
          }
          if (columnHeaders[j] === "SYSTEMS JUDGMENT") {
            sjIndex = j;
          }
        }

        if (fnIndex === "" || lnIndex === "" || stressIndex === "" || confIndex === "" || selfIndex === "" || belongIndex === "" || resilIndex === "" || dirIndex === "" || dirbIndex === "" || eoIndex === "" || ptIndex === "" || sjIndex === "") {
          resolve({ errReason: "Client Error: Incorrect Report Type", internalMessage: "One or more indices is null", externalMessage: "One or more uploaded reports is the incorrect report type for blue list generation. Refresh and try again. List of acceptable Report Types:\n\n-Hartman Value Profile"})
        } else {
          var indexArr = [fnIndex, lnIndex, genderIndex, stressIndex, confIndex, selfIndex, belongIndex, resilIndex, dirIndex, dirbIndex, eoIndex, ptIndex, sjIndex];
          var body = { data: output, indexArr: indexArr };
          resolve(body);
          console.log('column headers set');
        }
      });
    })
  }

  // OUTPUT BLUE LIST FOR INPUT FILE (TTI LINK) USING RELATIVE DATA INDICES
  function outputBlueData(data, indexArr) {
    return new Promise(function(resolve, reject) {

      var blueListArr = [];

      for (var i = 1; i < data.length; i++) {

        // GET SCORES
        var stressScore = data[i][indexArr[3]]
        var confScore = data[i][indexArr[4]]
        var selfScore = data[i][indexArr[5]]
        var belongScore = data[i][indexArr[6]]
        var resilScore = data[i][indexArr[7]]
        var dirScore = data[i][indexArr[8]]
        var dirbScore = data[i][indexArr[9]]
        if (dirbScore === '1') {
          dirbScore = 'POS';
        } else if (dirbScore === '0') {
          dirbScore = 'NEU';
        } else if (dirbScore === '-1') {
          dirbScore = 'NEG';
        }
        var eoScore = data[i][indexArr[10]]
        var ptScore = data[i][indexArr[11]]
        var sjScore = data[i][indexArr[12]]

        var studentOutput = [ data[i][indexArr[0]], data[i][indexArr[1]], data[i][indexArr[2]], data[i][indexArr[3]], data[i][indexArr[4]], data[i][indexArr[5]], data[i][indexArr[6]], data[i][indexArr[7]], data[i][indexArr[8]], dirbScore, data[i][indexArr[10]], data[i][indexArr[11]], data[i][indexArr[12]] ];


        var ct0 = 0;   // counter for how many of the first 4 variables are below a set threshold; to be used for at-risk flagging
        if ((stressScore < 2) && (belongScore < 5) && (resilScore < 5)) {   // FIRST TEST, if flagged, grab student and cascade thru if-then

            blueListArr.push(studentOutput);
        } else {
          if (stressScore < 3) { ct0++; }
          if (confScore < 3.5) { ct0++; }
          if (dirScore < 3) { ct0++; }
          if (selfScore < 3.5) { ct0++; }
          if (belongScore < 3.5) { ct0++; }
          if ((ct0 >= 2) && (resilScore < 5)) {   // SECOND TEST
             blueListArr.push(studentOutput);
          } else {
            var ct1 = 0;   // use 2 diff conter vars to determine third test…
            var ct2 = 0;
            if (confScore < 3.5) { ct1++; }
            if (dirScore < 3) { ct1++; }
            if (selfScore < 3.5) { ct1++; }
            if (belongScore < 3.5) { ct1++; }
            if ((confScore < 2) || (dirScore < 2) || (selfScore < 2) || (belongScore < 2)) {
               ct2++;
            }

            if ( (stressScore < 4) && ((ct1 >=2) || (ct2>=1)) && (resilScore < 5)) {   // THIRD TEST
               blueListArr.push(studentOutput);
            }
          }
        }
      }

      if (data) {
        resolve(blueListArr);
      } else {
        reject('no data');
      }

    })
  }

  // COMPILE BLUE LISTS FROM ALL SOURCES
  function compileBlueLists() {

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
              outputBlueData(data1.data, data1.indexArr)
              .then(function(data2) {
                for (var j = 0; j < data2.length; j++) {
                  exportFile.push(data2[j]);
                }
                if (count === (filesToFormat.length - 1)) {
                  exportFile.unshift(['First', 'Last', 'Gender', 'HANDLING STRESS', 'SELF CONFIDENCE', 'SENSE OF SELF', 'SENSE OF BELONGING', 'RESILIENCY', 'SELF DIRECTION', 'SELF DIRECTION BIAS', 'EMPATHETIC OUTLOOK', 'PRACTICAL THINKING', 'SYSTEMS JUDGMENT'])
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
  function generateBlueList() {

    compileBlueLists()
    .then(function(data){
      csv.stringify(data, function(err, output) {
        if(output) {
          tilde('~/', function(userHome) {
            var destDir = "";
            var environment = process.env.NODE_ENV;
            if (environment === "production") {
              destDir = userHome + 'Output_Files/Blue_Lists/';
            } else if (environment === "development") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Blue_Lists/';
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
                          else console.log('Blue_lists removed');
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

  generateBlueList();

})

module.exports = router;
