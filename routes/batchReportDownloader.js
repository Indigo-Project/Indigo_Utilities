module.exports = function(io) {

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

  require('should');

  io.on('connection', function(socket) {
    console.log('Client Connected to Socket in /api Route', socket.id);


    router.post("/validate-local-dir", function(req, res, next) {
      tilde('~/', function(userHome) {
        if (process.env.NODE_ENV === "development") {
          var localDir = userHome + req.body.localDir;
          fs.access(localDir, function(error) {
            if (!error) {
              res.send(localDir);
            } else {
              res.send({ error: error, message: "Download Directory is misspelled or does not exist - Please try again.", localDir: localDir})
            }
          })
        } else if (process.env.NODE_ENV === "production") {
          mkdirp(userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp/', function(error) {
            var localDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp/';
            if (!error) {
              res.send(localDir)
            } else {
              res.send({ error: error, message: "Download Directory Error - Please try again.", localDir: localDir})
            }
          })
        }
      })
    })

    // router.post("/validate-tti-request", function(req, res, next) {
    //   if (req.body.mode === "verify") {
    //     var listReportsEndpoint = TTI.APIs.listReports.generateEndpoint(req.body.accountID, req.body.linkID);
    //     TTI.APIs.requestFormat("GET", listReportsEndpoint, req.body.login, req.body.password)
    //     .then(function(reportList1) {
    //       var showLinkEndpoint = TTI.APIs.showLink.generateEndpoint(req.body.accountID, req.body.linkID);
    //       TTI.APIs.requestFormat("GET", showLinkEndpoint, req.body.login, req.body.password)
    //       .then(function(linkInfo) {
    //         var fixedData = [reportList1.slice(0,133), ",", reportList1.slice(133)].join('');
    //         csv.parse(fixedData, function(error, reportList2) {
    //           reportList2.shift();
    //           var reportTypes = [];
    //           var filteredReportList = [];
    //
    //           for (var i = 0; i < reportList2.length; i++) {
    //             var match = false;
    //             if (!reportTypes.length) {
    //               reportTypes.push(reportList2[i][11]);
    //             }
    //             for (var j = 0; j < reportTypes.length; j++) {
    //               if (reportList2[i][11] === reportTypes[j]) {
    //                 match = true;
    //               }
    //             }
    //             if (!match) {
    //               reportTypes.push(reportList2[i][11]);
    //             }
    //           }
    //           res.send({ reportList: reportList2, reportTypes: reportTypes, linkInfo: JSON.parse(linkInfo) });
    //         })
    //       }).catch(function(error) {
    //         res.send({ error: error });
    //       })
    //     }).catch(function(error) {
    //       res.send({ error: error });
    //     })
    //   } else if (req.body.mode === "filter"){
    //     var reportList = req.body.currentLinkReportList;
    //     var reportTypeFilter = req.body.reportTypeFilter;
    //     var filteredReportList = [];
    //     for (var i = 0; i < reportList.length; i++) {
    //       var match = false;
    //       for (var j = 0; j < reportTypeFilter.length; j++) {
    //         if (reportList[i][11] === reportTypeFilter[j]) {
    //           match = true;
    //         }
    //       }
    //       if (match) {
    //         filteredReportList.push(reportList[i])
    //       }
    //     }
    //     res.send({ filteredReportList: filteredReportList });
    //   }
    // })

    router.post("/dl-to-client", function(req, res, next) {
      if (req.body.dataPath) {

        var dateTmp = new Date();
        var dateObj = dateTmp.getMonth() + "-" + dateTmp.getDate() + "-" + dateTmp.getFullYear() + "_" + dateTmp.getHours() + "h" + dateTmp.getMinutes() + "m";
        var stat = fs.statSync(req.body.dataPath);
        var fileName = "assessments_" + dateObj + ".zip"

        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename=' + fileName,
            'Content-Length': stat.size
        });

        var download = fs.createReadStream(req.body.dataPath).pipe(res);
        download.on('finish', function() {
          tilde('~', function(userHome) {
            if (process.env.NODE_ENV === "production") {
              var removeZip =  userHome + '/Output_Files/Assessments/Zips/assessments.zip'
            } else if (process.env.NODE_ENV === "development_test") {
              var removeZip = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Zips/assessments.zip'
            }
            fsE.remove(removeZip, function(error) {
              if (error) console.log(error);
              else console.log('assessments.zip removed');
            })
          })
        })

      }
    })

    /**TTI BATCH DOWNLOADER**/

    router.post("/batch-download", function(req, res, next) {

      // Remove all Duplicates Based on Date
      function removeDuplicates(reports, types) {
        return new Promise(function(resolve, reject) {

          // Create distObject For All Report Types
          var distObject = {};
          for (var i = 0; i < types.length; i++) {
            distObject[types[i]] = [];
          }
          for (var i = 0; i < reports.length; i++) {
            for (var j = 0; j < types.length; j++) {
              if (reports[i][11] === types[j]) distObject[types[j]].push(reports[i]);
            }
          }

          // Fore each report type, create an array of all names (formatted) which we will run duplicate check on
          var dOKeys = Object.keys(distObject)
          var dupNumber = 0;
          return new Promise(function(resolve, reject) {


            bPromise.each(dOKeys, function(element, i, length) {
              var formattedNameArr = [];
              for (var j = 0; j < distObject[dOKeys[i]].length; j++) {
                formattedNameArr.push((distObject[dOKeys[i]][j][1] + distObject[dOKeys[i]][j][2]).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," "));
              }

              // Create an array with all the indices of a value in another array
              function getElementIndices(arr, val) {
                return new Promise(function(resolve, reject) {
                  var indices = [];
                  for(var k = 0; k < arr.length; k++) {
                    if (arr[k] === val) indices.push(k);
                  }
                  resolve({name: val, indices: indices});
                })
              }

              // Create matchObj Object
              function dupCheckArr(arr) {
                return new Promise(function(resolve, reject) {
                  for (var l = 0; l < arr.length; l++) {
                    getElementIndices(arr, arr[l])
                    .then(function(data) {
                      matchObj[data.name] = data.indices;
                      if (l === arr.length) resolve()
                    }).catch(function(error) {
                      console.log(error);
                    })
                  }
                })
              }

              var matchObj = {};
              var matchArr = [];

              dupCheckArr(formattedNameArr)
              .then(function() {
                mOKeys = Object.keys(matchObj);
                var removeIndices = [];
                for (var m = 0; m < mOKeys.length; m++) {
                  var dateObj = []
                  for (var n = 0; n < matchObj[mOKeys[m]].length; n++) {
                    var date = new Date((distObject[dOKeys[i]][matchObj[mOKeys[m]][n]][6]).split('-').join("/"));
                    dateObj.push(date)
                  }

                  var keepIndex = "";
                  if (dateObj.length > 1) {
                    for (var o = 0; o < dateObj.length; o++) {
                      if ((dateObj[o] - dateObj[o+1] || 0) > 7776000000) {
                        keepIndex = matchObj[mOKeys[m]][o];
                        break;
                      } else {
                        keepIndex = matchObj[mOKeys[m]][dateObj.length-1]
                      }
                    }
                    for (var o = 0; o < dateObj.length; o++) {
                      if (matchObj[mOKeys[m]][o] !== keepIndex) {
                        removeIndices.push(matchObj[mOKeys[m]][o])
                      }
                    }
                  }
                }
                dupNumber = removeIndices.length;
                function sortDescending(a,b) {
                  return b-a;
                }
                removeIndices.sort(sortDescending);
                if (removeIndices.length) {
                  for (var o = 0; o < removeIndices.length; o++) {
                    distObject[dOKeys[i]].splice(Number(removeIndices[o]), 1);
                    if (o === removeIndices.length-1 && i === length-1) {
                      resolve();
                    }
                  }
                } else {
                  resolve();
                }
              }).catch(function(error) {
                console.log(error);
              })
            }).then(function() {
            }).catch(function(error) {
              console.log(error);
            })
          }).then(function() {
            resolve({ reportObject: distObject, dupNumber: dupNumber });
          }).catch(function(error) {
            console.log(error);
          })
        })
      }

      // Declaration of Global Variables
      var reportList = req.body.reportList;
      var reportTypes = req.body.reportTypes;
      var encodeString = base64.encode(req.body.login + ":" + req.body.password);
      var dlCount = req.body.dlCount;

      // ARCHIVE REPORTS FUNCTION
      function archiveReports(dupNumber, dlCount, message) {
        tilde('~', function(userHome) {
          if (process.env.NODE_ENV === "production") {
            var destDir = userHome + '/Output_Files/Assessments/Zips/';
            var sendDir = userHome + '/Output_Files/Assessments/Indigo_Assessments_Tmp/';
            var removeDir = userHome + '/Output_Files/Assessments/Indigo_Assessments_Tmp';
            var makeDir = userHome + '/Output_Files/Assessments/Zips'
          } else if (process.env.NODE_ENV === "development_test") {
            var destDir = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Zips/';
            var sendDir = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp/';
            var removeDir = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp';
            var makeDir = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Zips';
          }

          mkdirp(makeDir, function() {

            var requestTimer = setTimeout(function() {
              console.log('exit pipe to resume');
              res.send('zipPaused')
            }, 25000);

            var output = fs.createWriteStream(destDir + 'assessments.zip');

            var archive = archiver('zip');

            archive.on('error', function(err) {
              res.status(500).send({error: err.message});
            });

            archive.on('end', function() {
              clearTimeout(requestTimer);
              fsE.remove(removeDir, function(error) {
                if (error) console.log(error);
                else console.log(removeDir + " REMOVED");
                res.send({ processStatus: message, dataPath: output.path, dlCount: dlCount, dupNumber: dupNumber });
              })
            });

            archive.directory(sendDir, 'Assessments_' + req.body.accountID + "-" + req.body.linkID);
            archive.pipe(output);
            archive.finalize();
          })
        })
      }

      function resumeArchive() {

      }

      // Execution Call
      function executeDownload(processStatus, distReportArrC, currentSegmentIndex, dlCount) {

        // Declare Function to Create Download Directory
        function createDownloadDir() {
          return new Promise(function(resolve, reject) {
            var makeDir;
            tilde('~', function(userHome) {
              if (process.env.NODE_ENV === "production") {
                makeDir = userHome + '/Output_Files/Assessments/Indigo_Assessments_Tmp/';
              } else if (process.env.NODE_ENV === "development_test") {
                makeDir = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp/';
              }
              mkdirp(makeDir, function(err) {
                if (err) reject('makeDirp error:', err);
                else resolve(makeDir + ' Directory Created')
              })
            })
          })
        }

        var numOfSegments = req.body.numOfSegments || 0;

        if (processStatus === "fresh") {

          removeDuplicates(reportList, reportTypes)
          .then(function(data1) {
            initiateDLAR(data1.reportObject)
            .then(function(data2) {
              numOfSegments = data2.numOfSegments;
              createDownloadDir()
              .then(function(message) {
                downloadCurrentSegment(data2.distReportArr[currentSegmentIndex], currentSegmentIndex)
                .then(function(data3) {
                  res.send({ processStatus: "midCycle", prevSegmentIndex: data3.prevSegmentIndex, distReportArr: data2.distReportArr, dlCount: data3.dlCount, numOfSegments: numOfSegments, dupNumber: data1.dupNumber })
                }).catch(function(error) {
                  console.log(error);
                })
              }).catch(function(error) {
                console.log(error);
              })
            }).catch(function(error) {
              console.log(error);
            })
          })
        } else if (processStatus === "midCycle") {
          if (currentSegmentIndex === numOfSegments ) {
            archiveReports(req.body.dupNumber, dlCount, "finished")
            io.emit('preparingFiles')
          } else {
            downloadCurrentSegment(distReportArrC[currentSegmentIndex], currentSegmentIndex)
            .then(function(data) {
              res.send({ processStatus: "midCycle", prevSegmentIndex: data.prevSegmentIndex, distReportArr: distReportArrC, dlCount: data.dlCount, numOfSegments: numOfSegments, dupNumber: req.body.dupNumber  })
            }).catch(function(error) {
              console.log(error);
            })

          }
        }
      }

      function initiateDLAR(reportObject) {

        return new Promise(function(resolve, reject) {

          var distReportArr = [];
          var workingReportArr = [];

          // Set up workingReportArr
          var reportObjectLength = 0;
          var rOKeys = Object.keys(reportObject)
          for (var i = 0; i < rOKeys.length; i++) {
            var reportsOfCurrentType = reportObject[rOKeys[i]]
            for (var j = 0; j < reportsOfCurrentType.length; j++) {
              reportObjectLength ++;
              var reportID = reportsOfCurrentType[j][0];
              var showReportEndpoint = TTI.APIs.showReport.generateEndpoint(req.body.accountID, req.body.linkID, reportID);
              var reportInfo = reportsOfCurrentType[j]
              workingReportArr.push([showReportEndpoint,reportInfo])
            }
          }

          // Create Distribued Report Arr by Chunk
          var chunk = 50;
          var numOfSegments = 0;
          for (var i = 0; i < workingReportArr.length; i += chunk) {
            distReportArr.push(workingReportArr.slice(i, i + chunk));
            numOfSegments ++;
          }

          // Derive Lengths for Resolve() Condition
          distReportArrLength = 0;
          for (var i = 0; i < distReportArr.length; i++) {
            for (var j = 0; j < distReportArr[i].length; j++) {
              distReportArrLength ++;
            }
          }

          if (distReportArrLength === reportObjectLength) {
            io.emit('reportNumber', { number: distReportArrLength});
            resolve({ distReportArr: distReportArr, numOfSegments: numOfSegments});
          } else {
            reject('original reportObject and distReportObject lengths are not equal')
          }

        })
      }

      // Run all reports through download function
      function downloadCurrentSegment(currSegmentArr, currSegmentIndex) {

        var segDlCount = 0;

        // Download Stream Function
        function download(requestOptions, destination) {
          return new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(destination);
            request(requestOptions).pipe(file);
            file.on('finish', function() {
              file.close(console.log("finished downloading " + destination));
              segDlCount ++;
              dlCount ++;
              io.emit('dlCount', { dlCount: dlCount});
              resolve(dlCount);
            }).on('error', function(error) {
              fs.unlink(destination);
              console.log("--- ERROR ---", error);
            });
          })
        };

        return new Promise(function(resolve, reject) {

          var dlIndex = 0;

          // Download Individual Report
          function downloadReport(dlIndex) {

            return new Promise(function(resolve, reject) {

              var suffix = TTI.assessmentInfoByName[currSegmentArr[dlIndex][1][11]].suffix;
              var firstNameW = currSegmentArr[dlIndex][1][1];
              var lastNameW = currSegmentArr[dlIndex][1][2];
              var firstName = firstNameW.charAt(0).toUpperCase() + firstNameW.substr(1).toLowerCase();
              var lastName = lastNameW.charAt(0).toUpperCase() + lastNameW.substr(1).toLowerCase();

              var destination;

              tilde('~', function(userHome) {
                if (process.env.NODE_ENV === "production") destination = userHome + '/Output_Files/Assessments/Indigo_Assessments_Tmp/' + lastName + ", " + firstName + suffix + ".pdf";
                else if (process.env.NODE_ENV === "development_test") destination = userHome + '/Documents/IndigoProject/Indigo_Utilities/Output_Files/Assessments/Indigo_Assessments_Tmp/' + lastName + ", " + firstName + suffix + ".pdf";

                var options = {
                  method: "GET",
                  url: currSegmentArr[dlIndex][0],
                  headers: {
                    'Authorization': 'Basic ' + encodeString
                  }
                }

                download(options, destination)
                .then(function(dlCount) {
                  resolve(segDlCount);
                })
              })
            })
          }

          function downloadReportsLoop() {
            return new Promise(function(resolve, reject) {
              for (var i = 0; i < currSegmentArr.length; i++) {
                downloadReport(i)
                .then(function(segDlCount) {
                  if (segDlCount === currSegmentArr.length) {
                    resolve(dlCount);
                  }
                })
              }
            })
          }

          downloadReportsLoop()
          .then(function() {
            resolve({ prevSegmentIndex: currSegmentIndex, dlCount: dlCount});
          })

        })
      }

      //EXECUTION CALL
      executeDownload(req.body.processStatus, req.body.distReportArrC, req.body.currentSegmentIndex, dlCount);

    });

    socket.on('disconnect', function() {
      console.log('Client disconnected.');
      console.log(socket.id);
    })

  })

return router;

}
