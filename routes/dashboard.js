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


router.get('/retrieve-school-name-options', function(req, res, next) {
  res.send(TTI.dashboardSchoolNames)
})

router.post('/create-dashboard-data-object', function(req, res, next) {

  // STEP 1 of raw input preparation:
    // 1. converts all data objects to useable javascript objects with unified format, regardless of source
    // 2. removes duplicates from all individual reports
    // 3. reorganizes all data by class/school year or staff groupings
  function prepareRawObject1(input0) {
    console.log('in prepare raw object 1');

    // Convert data from all source types to unified & useable form
    function convertToUseable(report) {
      console.log('CTU REPORT DATA', report.uploadType);
      return new Promise(function(resolve, reject) {
        var returnObj = report;
        if (report.uploadType === "csv upload") {
          csv.parse(report.data, function(error, output) {

            if (error) {
              console.log('PARSE ERROR', error);
            }

            returnObj.data = output;
            resolve(returnObj);
          })
        } else if (report.uploadType === "tti import") {

        }
      }).catch(function(error) {
        console.log('PARSE ERROR', error);
      })
    }

    // Remove all Duplicates Based on Date
    function removeDuplicates(report) {
      var reportData = report.data;
      var reportRole = report.role;
      // console.log('RM DUPLICATES VAR SETTING');
      // console.log(report);
      // console.log(report.name);
      // console.log(reportData, reportRole);

      return new Promise(function(resolve, reject) {

        // For each report type, create an array of all names (formatted) which we will run duplicate check on
        var dupNumber = 0;

        var formattedNameArr = [];
        for (var i = 1; i < reportData.length; i++) {
          formattedNameArr.push((reportData[i][0] + reportData[i][1]).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," "));
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
          // console.log('matchObj', matchObj);
          mOKeys = Object.keys(matchObj);
          var removeIndices = [];
          for (var m = 0; m < mOKeys.length; m++) {

            // FOR TTI UPLOADS, dateObj will = [oldest <--> newest]
            var dateObj = [];

            for (var n = 0; n < matchObj[mOKeys[m]].length; n++) {
              var date = new Date((reportData[matchObj[mOKeys[m]][n]][5]).split('-').join("/"));
              dateObj.push(date)
            }

            var keepIndex = "";
            var dateObjCount = 0;
            if (dateObj.length > 1) {
              if (reportRole === "Students") {
                for (var o = dateObj.length-1; o > 0; o--) {
                  if ((dateObj[o] - dateObj[o-1] || 0) > 7776000000) {
                    keepIndex = matchObj[mOKeys[m]][o];
                    break;
                  } else {
                    keepIndex = matchObj[mOKeys[m]][o-1];
                  }
                }
              } else if (reportRole === "Staff") {
                keepIndex = matchObj[mOKeys[m]][dateObj.length-1];
              }

              for (var o = 0; o < dateObj.length; o++) {
                if (matchObj[mOKeys[m]][o] !== keepIndex) {
                  removeIndices.push(matchObj[mOKeys[m]][o])
                }
              }
            }
          }
          dupNumber = removeIndices.length;
          // console.log('dupNumber:', dupNumber);
          function sortDescending(a,b) {
            return b-a;
          }
          removeIndices.sort(sortDescending);
          // console.log('report length before:', reportData.length);
          if (removeIndices.length) {
            for (var o = 0; o < removeIndices.length; o++) {
              reportData.splice(Number(removeIndices[o]), 1);
              if (o === removeIndices.length-1) {
                report.data = reportData;
                resolve({dupNumber: dupNumber, report: report});
              }
            }
          } else {
            report.data = reportData;
            resolve({dupNumber: dupNumber, report: report});
          }
          // console.log("report length after", reportData.length);
        }).catch(function(error) {
          console.log(error);
        })
      })
    }

    return new Promise(function(resolve, reject) {

      return new Promise(function(resolve, reject) {

        var count = 0;
        var staffCount= 0;
        var useableObject1 = {}
        bPromise.each(input0, function(element, i, length) {
          convertToUseable(input0[i])
          .then(function(parsedReport) {
            removeDuplicates(parsedReport)
            .then(function(data) {

              count ++;

              var currentReport = data.report;
              if (currentReport.role === "Staff") {
                var key = "Staff";
              } else if (currentReport.role === "Students"){
                var key = currentReport.class + "/" + currentReport.schoolYearTaken;
              }
              if (useableObject1[key]) {
                useableObject1[key].typeArr.push(currentReport.uploadType);
                useableObject1[key].nameArr.push(currentReport.name);
                useableObject1[key].role = currentReport.role;
                useableObject1[key].data.push(currentReport.data);
              } else {
                // Create fresh data set for group object
                useableObject1[key] = {};
                useableObject1[key].typeArr = [];
                useableObject1[key].nameArr = [];
                useableObject1[key].data = [];

                // Populate group object with current report data
                useableObject1[key].typeArr.push(currentReport.uploadType);
                useableObject1[key].nameArr.push(currentReport.name);
                useableObject1[key].role = currentReport.role;
                useableObject1[key].data.push(currentReport.data);
                // console.log('3.1.A');
              }

              // console.log(count, length);
              if (count === length) resolve(useableObject1);
            })
          })
        })
      }).then(function(data) {
        console.log('----- prepareRawObject1 Complete -----' );
        resolve(data);
      })
    })
  }

  // STEP 2 of raw input preparation
    // 1. Create uploadTypes array with assessment/instrument type for each data file upload
    // 2. Create assessment/instrument priority index for setting column headers & data compilation
    // 3. Define compiled data column headers
    // 4. populate compiled data field with available data
  function prepareRawObject2(input1) {
    console.log('inside pRO2', input1);
    var input1Keys = Object.keys(input1);
    return new Promise(function(resolve, reject) {

      // 1
      for (var i = 0; i < input1Keys.length; i++) {
        var currentGrouping = input1[input1Keys[i]];
        var reportDataArray = currentGrouping.data;
        currentGrouping.uploadTypes = [];
        for (var j = 0; j < reportDataArray.length; j++) {
          var reportLengthID = reportDataArray[j][0].length
          var exportTypes = Object.keys(TTI.exportTypeIdentifier)
          for (var k = 0; k < exportTypes.length; k++) {
            if (TTI.exportTypeIdentifier[exportTypes[k]].length === reportLengthID) {
              currentGrouping.uploadTypes.push(exportTypes[k])
            }
          }
        }
      }

      //2
      for (var groupKey in input1) {
        var group = input1[groupKey];
        console.log(group.uploadTypes);
        group.uploadTypePriorityIndex = [];
        // For the first found Trimetrix Report, throw it into the first priority position and break out of loop.
        for (var i = 0; i < group.uploadTypes.length; i++) {
          if (group.uploadTypes[i] === "Trimetrix HD Talent (Legacy) D" || group.uploadTypes[i] === "Trimetrix HD Talent (Legacy)" || group.uploadTypes[i] === "Trimetrix HD Talent (Legacy) Temp") {
            console.log(i, group.uploadTypes[i]);
            group.uploadTypePriorityIndex.push(i);
            break;
          }
        };
        // If there is no Trimetrix Report (only way priorityIndex length = 0), look for Talent Insights and if found, make first priority.
        // Unless, the first value is a Trimetrix Temp (in which case we want the other files as well)
        if (!group.uploadTypePriorityIndex.length || group.uploadTypes[0] === "Trimetrix HD Talent (Legacy) Temp") {
          for (var i = 0; i < group.uploadTypes.length; i++) {
            if (group.uploadTypes[i] === "Talent Insights D" || group.uploadTypes[i] === "Talent Insights lD" || group.uploadTypes[i] === "Talent Insights") {
              console.log(i, group.uploadTypes[i]);
              group.uploadTypePriorityIndex.push(i);
              break;
            }
          };
          if(group.uploadTypePriorityIndex.length === 1) {
            for (var i = 0; i < group.uploadTypes.length; i++) {
              if (group.uploadTypes[i] === "TTI DNA Personal Soft Skills Indicator D" || group.uploadTypes[i] === "TTI DNA Personal Soft Skills Indicator lD" || group.uploadTypes[i] === "TTI DNA Personal Soft Skills Indicator" || group.uploadTypes[i] === "TTI DNA Personal Soft Skills Indicator API Instrument") {
                console.log(i, group.uploadTypes[i]);
                group.uploadTypePriorityIndex.push(i);
                break;
              }
            };
            for (var i = 0; i < group.uploadTypes.length; i++) {
              if (group.uploadTypes[i] === "Hartman Value Profile D" || group.uploadTypes[i] === "Hartman Value Profile lD" || group.uploadTypes[i] === "Hartman Value Profile") {
                console.log(i, group.uploadTypes[i]);
                group.uploadTypePriorityIndex.push(i);
                break;
              }
            };
          } else {
            console.log(groupKey + " group not included. No Trimetrix or Talent Insights found.")
          }
        }
      }
      console.log(1716, input1);

      // 3
      var studentUMD = ['FULL NAME', 'FIRST NAME', 'LAST NAME', 'GENDER', 'CLASS', 'SCHOOL YEAR', 'REPORT DATE', 'EMAIL', 'COMPANY', 'POSITION', 'LINK', 'PASSWORD' ];
      var staffUMD = ['FULL NAME', 'FIRST NAME', 'LAST NAME', 'GENDER', 'REPORT DATE', 'EMAIL', 'COMPANY', 'POSITION', 'LINK', 'PASSWORD' ];

      for (var groupKey in input1) {
      // console.log("---------- NEW GROUP: " + groupKey + " ----------");
        var group = input1[groupKey];
        var groupRole = group.role;
        var groupDataArr = group.data;
        var groupPriorityIndex = group.uploadTypePriorityIndex;
        var compiledDataCH;

        if (groupRole === "Staff") {
          compiledDataCH = staffUMD;
        } else {
          compiledDataCH = studentUMD;
        }
        // console.log('compiled Data CH:', compiledDataCH);

        for (var i = 0; i < groupDataArr.length; i++) {
          // console.log("---------- DATA SET " + i + " ----------");
          var currentDataSetCH = groupDataArr[groupPriorityIndex[i]][0]
          // console.log(i, currentDataSetCH);
          var matchCount = 0;
          for (var j = 0; j < currentDataSetCH.length; j++) {
            var currentColumnHeader = currentDataSetCH[j].toUpperCase();
            // console.log("----- currentColumnHeader " + j + ' -----');
            // console.log('assessing addition of:', currentColumnHeader);
            var match = false;
            // console.log(compiledDataCH);
            for (var k = 0; k < compiledDataCH.length; k++) {
              // console.log('compiledDataCH[k] === ' + compiledDataCH[k]);
              // console.log('MATCH COMPARISON:  ' + 'UMD: ' + compiledDataCH[k] + ", new: " + currentColumnHeader);
              if (currentColumnHeader === compiledDataCH[k]) {
                match = true;
                matchCount ++;
                break;
              }
            }
            if (!match) {
              compiledDataCH.push(currentColumnHeader);
              // console.log('added ' + currentColumnHeader + ' to ' +  groupRole + ' Column Headers');
            }
          }
          // console.log('matchCount ----------', matchCount);
        }
      }
      // console.log('studentData CH:', studentUMD);
      // console.log('staffData CH:', staffUMD);
      input1.compiledData = { studentData: [studentUMD], staffData: [staffUMD] };
      // console.log('input1 cD after step 2.3', input1.compiledData);
      // console.log('STUDENT DATA COLUMN HEADERS');
      for (var i = 0; i < input1.compiledData.studentData[0].length; i++) {
        console.log(input1.compiledData.studentData[0][i]);
      }

      // 4
      console.log('4.1');
      for (var groupKey in input1) {
        function titleCase(str) {
          return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        }
        if (groupKey === 'compiledData') {
          console.log('compiledData groupKey not included');
        } else {

          var group = input1[groupKey];
          var groupRole = group.role;
          var groupDataArr = group.data;
          var groupPriorityIndex = group.uploadTypePriorityIndex;
          var compiledData;
          var sClass;
          var sSchoolYear;

          // console.log('input1 + groupKey in step 4', input1, groupKey);
          // console.log('currGroup', group);

          if (groupRole === "Staff") {
            compiledData = input1.compiledData.staffData;
          } else if (groupRole === "Students") {
            compiledData = input1.compiledData.studentData;
            sClass = groupKey.substring(0,4);
            sSchoolYear = groupKey.substring(5);
          }

          var prioritySet = groupDataArr[groupPriorityIndex[0]];

          // Set UMD (Universal MetaData) anchors for studentData/staffData using prioritySet
          for (var j = 1; j < prioritySet.length; j++) {
            var umdSET = [];
            for (var k = 0; k < 9; k++) {
              umdSET.push(prioritySet[j][k])
            }
            if (groupRole === "Staff") {
              compiledData.push([
                titleCase(umdSET[1]) + ", " + titleCase(umdSET[0]),
                titleCase(umdSET[0]),
                titleCase(umdSET[1]),
                titleCase(umdSET[6]),
                titleCase(umdSET[5]),
                titleCase(umdSET[2]),
                titleCase(umdSET[3]),
                titleCase(umdSET[4]),
                titleCase(umdSET[7]),
                titleCase(umdSET[8]),
              ])
            } else if (groupRole === "Students") {
              if (group.uploadTypes[0] === "Talent Insights lD") {
                console.log(1827, group.uploadTypes[0]);
                console.log(1829, umdSET);
                compiledData.push([
                  titleCase(umdSET[1]) + ", " + titleCase(umdSET[0]),
                  titleCase(umdSET[0]),
                  titleCase(umdSET[1]),
                  titleCase(umdSET[2]),
                  sClass,
                  sSchoolYear,
                  // titleCase(umdSET[5]),
                  // titleCase(umdSET[2]),
                  // titleCase(umdSET[3]),
                  // titleCase(umdSET[4]),
                  // titleCase(umdSET[7]),
                  // titleCase(umdSET[8]),
                ])
              } else {
                compiledData.push([
                  titleCase(umdSET[1]) + ", " + titleCase(umdSET[0]),
                  titleCase(umdSET[0]),
                  titleCase(umdSET[1]),
                  titleCase(umdSET[6]),
                  sClass,
                  sSchoolYear,
                  titleCase(umdSET[5]),
                  titleCase(umdSET[2]),
                  titleCase(umdSET[3]),
                  titleCase(umdSET[4]),
                  titleCase(umdSET[7]),
                  titleCase(umdSET[8]),
                ])
              }
            }
          }
        }
      }

      var studentData = input1.compiledData.studentData;
      var staffData = input1.compiledData.staffData;
      // console.log('current input1 cD', input1.compiledData);

      console.log('4.2');
      for (var groupKey in input1) {
        if (groupKey === 'compiledData') {
          console.log('compiledData groupKey not included');
        } else {
          var group = input1[groupKey];
          var groupRole = group.role;
          var groupDataArr = group.data;
          var groupPriorityIndex = group.uploadTypePriorityIndex;
          if (groupRole === "Staff") {
            var compiledData = input1.compiledData.staffData;
            var dataStart = 10;
          } else if (groupRole === "Students") {
            var compiledData = input1.compiledData.studentData;
            var dataStart = 12;
          }
          var chRef = compiledData[0];
          // console.log('chRef', chRef);
          for (var i = 1; i < compiledData.length; i++) {
            var currCdRow = compiledData[i]
            // console.log(currCdRow);
            var anchorNameString = (currCdRow[1] + currCdRow[2]).toLowerCase()
            // console.log(nameString);
            for (var j = 0; j < groupPriorityIndex.length; j++) {
              var currentGroup = groupDataArr[groupPriorityIndex[j]];
              for (var k = 1; k < currentGroup.length; k++) {
                // console.log('currGroup ' + k, currentGroup[k]);
                // var nameString = (currentGroup[k][1] + currentGroup[k][2]).toLowerCase();
                // console.log('FIRST', currentGroup[k][chRef.indexOf('FIRST NAME')], 'LAST', currentGroup[k][chRef.indexOf('LAST NAME')]);
                var nameString = (currentGroup[k][currentGroup[0].indexOf('FIRST NAME')] + currentGroup[k][currentGroup[0].indexOf('LAST NAME')]).toLowerCase();
                if (anchorNameString === nameString) {
                  // console.log('NAME MATCH' + j + ':', anchorNameString, nameString);
                  // console.log("-----------------");
                  // console.log(currCdRow, currentGroup[k]);
                  var dataChRef = currentGroup[0]
                  for (var m = 0; m < dataChRef.length; m++) {
                    // console.log("----------");
                    for (var l = dataStart; l < chRef.length; l++) {
                      if (dataChRef[m].toUpperCase() === chRef[l].toUpperCase()) {
                        // console.log('CH REF MATCH', dataChRef[m], chRef[l]);
                        // console.log(m, l);
                        // console.log(i, k);
                        if (!currCdRow[l]) {
                          // console.log('no ' + chRef[l] + ', populate with ' + currentGroup[0][m], currentGroup[k][m] || "''" );
                          currCdRow[l] = currentGroup[k][m] || "";
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // console.log(studentData.length);
      // console.log(1901, input1.compiledData.studentData[0]);
      // input1.compiledData.columnHeaders[0][j],
      // console.log(studentData[0]);
      // for (var i = 1; i < studentData.length; i++) {
      //   console.log('----- studentData ' + i + ' -----');
      //   for (var j = 0; j < studentData[i].length; j++) {
      //     console.log(input1.compiledData.studentData[0][j], studentData[i][j]);
      //   }
      // }

      input1.compiledData.columnHeaders = [input1.compiledData.studentData[0], input1.compiledData.staffData[0]];
      studentData.shift();
      staffData.shift();
      studentData.sort(function(a, b) {
        return a[0] < b[0] ? -1 : a[0] === b[0] ? 0 : 1;
      })
      var newDateObj = new Date();
      var dateCreated = (newDateObj.getMonth() + 1) + "/" + newDateObj.getDate() + "/" + newDateObj.getFullYear() + " - " + newDateObj.getHours() + ":" + newDateObj.getMinutes() + ":" + newDateObj.getSeconds();
      input1.metaData = {
        version: "",
        schoolInfo: {
          code: req.body.schoolCode,
          name: TTI.dashboardSchoolNames[req.body.schoolCode].name,
          optionDisplay: TTI.dashboardSchoolNames[req.body.schoolCode].optionDisplay
        },
        dateCreated: dateCreated,
        dateCreatedMS: newDateObj
      };
      resolve(input1)
    })
  }

  function updateDatabase(input2, schoolCode) {
    return new Promise(function(resolve, reject) {
      mongo.mongoDBConnect(mongo.indigoDashboardsURI)
      .then(function(data) {
        mongo.addDashboard(data.db, input2, req.body.schoolCode, req.body.dashboardVersionName)
        .then(function(documentId) {
          mongo.getDocumentById(data.db, schoolCode, documentId)
          .then(function(dashObj) {
            resolve(dashObj)
            mongo.mongoDBDisconnect(data.db);
          })
        })
      })
    })
  }

  var dataObject = { students: [], staff: [] }
  var input = req.body.inputFiles;

  function finalExecution(input0) {

    prepareRawObject1(input0)
    .then(function(input1) {
      console.log('AFTER PREPARE RAW OBJECT 1');
      prepareRawObject2(input1)
      .then(function(input2) {
        console.log('AFTER PREPARE RAW OBJECT 2');
        updateDatabase(input2, req.body.schoolCode)
        .then(function(input3) {
          // console.log('INPUT 3', input3);
          // for (var i = 0; i < input3.compiledData.studentData.length; i++) {
          //   for (var j = 0; j < input3.compiledData.studentData[i].length; j++) {
          //     console.log(input3.compiledData.columnHeaders[0][j], input3.compiledData.studentData[i][j], toString.call(input3.compiledData.studentData[i][j]));
          //   }
          // }
          res.send(input3)
        }).catch(function(error) {
          console.log(error);
        });
      }).catch(function(error) {
        console.log(error);
      });
    }).catch(function(error) {
      console.log(error);
    });

  }

  finalExecution(input);

})

router.get('/retrieve-school-dashboard-collections', function(req, res, next) {
  function getAllCollectionVersions(db, collectionNames) {
    return new Promise(function(resolve, reject) {
      var collectionReturn = {};
      bPromise.each(collectionNames, function(element, index, length) {
        // console.log(index, element);
        mongo.getDashboardVersions(db, element)
        .then(function(versions) {
          // console.log(element, versions);
          collectionReturn[element] = versions;
          if (Object.keys(collectionReturn).length === length) {
            resolve(collectionReturn);
          }
        }).catch(function(err) {
          reject(err);
        })
      })
    })
  }

  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    mongo.getDashboardCollections(data.db)
    .then(function(collections) {
      // console.log('COLLECTIONS RETURNED', collections);
      var collectionNames = [];

      // Create filtered array of school collection names for reference
      for (var key in collections) {
        var collection = collections[key];
        if (collection.s.name !== "system.indexes" && collection.s.name !== "objectlabs-system" && collection.s.name !== "objectlabs-system.admin.collections") {
          collectionNames.push(collection.s.name);
        }
      }

      // Create collection obj with all collections and associated metadata object tied to each
      getAllCollectionVersions(data.db, collectionNames)
      .then(function(collectionObj) {
        res.send(collectionObj)
        mongo.mongoDBDisconnect(data.db);
      })

    }).catch(function(error) {
      console.log(error);
    })
  }).catch(function(error) {
    console.log('DATABASE CONNECTION ERROR:', error);
  })

})

router.post('/retreive-stored-dashboard-data-object', function(req, res, next) {
  mongo.mongoDBConnect(mongo.indigoDashboardsURI)
  .then(function(data) {
    // console.log(data);
    var dataId = req.body.version ? req.body.version : req.body.id;
    var IdOption = req.body.version ? "version" : "id";
    console.log('CCC', req.body.schoolCode, IdOption, dataId);
    mongo.getDashboardData(data.db, req.body.schoolCode, dataId, IdOption)
    .then(function(dashData) {
      console.log('dashData', dashData);
      res.send(dashData);
    })
  })
})

module.exports = router;
