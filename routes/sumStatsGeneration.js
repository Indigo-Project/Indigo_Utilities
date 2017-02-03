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

router.post('/generate', function(req, res, next) {

  console.log('inside route');
  var filesToFormat = req.body.inputFiles
  // console.log('filesToFormat', filesToFormat);

  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      var DomIndex = "", InfIndex = "", SteIndex = "", ComIndex = "", TheIndex = "", UtiIndex = "", AesIndex = "", SocIndex = "", IndIndex = "", TraIndex = "";

      csvParse(data.data, function(err, output) {
        var columnHeaders = output[0];
        for (var j = 0; j < columnHeaders.length; j++) {
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
        if (DomIndex === "" || InfIndex === "" || SteIndex === "" || ComIndex === "" || TheIndex === "" || UtiIndex === "" || AesIndex === "" || SocIndex === "" || IndIndex === "" || TraIndex === "") {
          resolve({ errReason: "Client Error: Incorrect Report Type", internalMessage: "One or more indices is null", externalMessage: "One or more uploaded reports is the incorrect report type for current summary stats report generation. Refresh and try again. List of acceptable Report Types:\n\n-Talent Insights\n-Trimetrix"})
        } else {
          var indexArr = [ DomIndex, InfIndex, SteIndex, ComIndex, TheIndex, UtiIndex, AesIndex, SocIndex, IndIndex, TraIndex ];
          var body = { data: output, indexArr: indexArr };
          resolve(body);
        }
      });
    })
  }

  function compile(data, indexArr) {
    return new Promise(function(resolve, reject) {

      var returnArr = [];

      for (var i = 1; i < data.length; i++) {

        // GET INDIVIDUAL SCORES
        var DomScore = data[i][indexArr[0]];
        var InfScore = data[i][indexArr[1]];
        var SteScore = data[i][indexArr[2]];
        var ComScore = data[i][indexArr[3]];
        var TheScore = data[i][indexArr[4]];
        var UtiScore = data[i][indexArr[5]];
        var AesScore = data[i][indexArr[6]];
        var SocScore = data[i][indexArr[7]];
        var IndScore = data[i][indexArr[8]];
        var TraScore = data[i][indexArr[9]];

        returnArr.push([ DomScore, InfScore, SteScore, ComScore, TheScore, UtiScore, AesScore, SocScore, IndScore, TraScore ]);

      }
      if (returnArr[0].length === 10) {
        resolve(returnArr)
      } else {
        reject('returnArr subarray length innacurate');
      }

    })
  }

  function generateStatistics(data) {

    return new Promise(function(resolve, reject) {

      var sumStatsWorkingArr = [];
      for (var i = 0; i < 10; i++) {
        sumStatsWorkingArr.push([])
      }
      var sumStatsReturnArr = [[],[]];

      // PUSH INDIVIDUAL SCORES TO SUM STATS ARR IN RESPECTIVE SUBARRAYS
      for (var i = 0; i < data.length; i++) {
        sumStatsWorkingArr[0].push(data[i][0]);
        sumStatsWorkingArr[1].push(data[i][1]);
        sumStatsWorkingArr[2].push(data[i][2]);
        sumStatsWorkingArr[3].push(data[i][3]);
        sumStatsWorkingArr[4].push(data[i][4]);
        sumStatsWorkingArr[5].push(data[i][5]);
        sumStatsWorkingArr[6].push(data[i][6]);
        sumStatsWorkingArr[7].push(data[i][7]);
        sumStatsWorkingArr[8].push(data[i][8]);
        sumStatsWorkingArr[9].push(data[i][9]);
      }

      // INCLUDE ADULT AVERAGES
      sumStatsReturnArr.unshift(['43.0', '58.7', '60.7', '50.5', '6.0', '5.3', '4.3', '4.2', '5.5', '4.7' ])

      // GENERATE AVERAGES
      for (var i = 0; i < sumStatsWorkingArr.length; i++) {
        var sum = sumStatsWorkingArr[i].reduce(function(a,b) {
          return Number(a) + Number(b);
        })
        var average = (sum/sumStatsWorkingArr[i].length).toFixed(1)
        sumStatsReturnArr[1].push(average);
      }

      // GENERATE STANDARD DEVIATIONS
      for (var i = 0; i < sumStatsWorkingArr.length; i++) {
        var avg = Number(sumStatsReturnArr[1][i]);
        var distsFromAvgSqd = [];
        for (var j = 0; j < sumStatsWorkingArr[i].length; j++) {
          distsFromAvgSqd.push(Math.pow(avg - Number(sumStatsWorkingArr[i][j]), 2))
        }
        var sumOfDistsFromAvgSqd = distsFromAvgSqd.reduce(function(a,b) {
          return a + b;
        })
        var variance = sumOfDistsFromAvgSqd/sumStatsWorkingArr[i].length;
        var standardDeviation = Math.sqrt(variance).toFixed(1);
        sumStatsReturnArr[2].push(standardDeviation)
      }

      // SET ROW TITLES
      sumStatsReturnArr[0].unshift('Standard Adult Averages');
      sumStatsReturnArr[1].unshift('School Averages');
      sumStatsReturnArr[2].unshift('School Standard Deviations (1 std dev)');
      sumStatsReturnArr.unshift(['Title', 'Dominance-Nat', 'Infl-Nat', 'Stead-Nat', 'Compl-Nat', 'Theo', 'Util', 'Aesth', 'Soci', 'Indiv', 'Trad']);

      if (data) {
        resolve(sumStatsReturnArr);
      } else {
        reject('no data');
      }
    })

  }

  function combineReports(filesToFormat) {
    return new Promise(function(resolve, reject) {

      var count = 0;
      var compilationFile = [];

      function loopReports(count) {
        if (count < filesToFormat.length) {
          setColumnHeaders(filesToFormat[count])
          .then(function(data1) {
            if (data1.errReason) {
              res.writeHeader(406, {"Content-Type": "application/json"});
              res.end(JSON.stringify(data1));
            } else {
              compile(data1.data, data1.indexArr)
              .then(function(data2) {
                for (var j = 0; j < data2.length; j++) {
                  compilationFile.push(data2[j]);
                }
                if (count === (filesToFormat.length - 1)) {
                  resolve(compilationFile)
                } else {
                  count ++;
                  loopReports(count)
                }
              })
            }
          }).catch(function(error) {
            console.log(error);
          })
        }
      }
      loopReports(count);
    })
  }

  combineReports(filesToFormat)
  .then(function(data1) {
    generateStatistics(data1)
    .then(function(data2) {
      csv.stringify(data2, function(error, output) {
        if(output) {
          tilde('~/', function(userHome) {
            console.log('IN SUMM TILDE');
            var destDir = "";
            var environment = process.env.NODE_ENV;
            if (environment === "production") {
              destDir = userHome + 'Output_Files/Summary_Statistics/';
            } else if (environment === "development") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Summary_Statistics/';
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
                          else console.log('Summary_Statistics removed');
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
    })
  })
})

module.exports = router;
