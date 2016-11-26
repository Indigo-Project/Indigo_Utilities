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

var TTI = require('../APIs/TTI_API');

// require('events').EventEmitter.prototype._maxListeners = 500;
// process.env.NODE_DEBUG = "net";
require('should');

io.on('connection', function(socket) {
  console.log('Client Connected to Socket in /api Route');
  console.log(socket.id);

/** TTI - POWER BI FORMATTING ENDPOINT **/

router.post('/upload-csv', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  //TriMetrix Variables
  var Trimetrix_CH;
  var allStudents_Trimetrix = [];
  var allStudents_Trimetrix_CSV = "";
  var allStaff_Trimetrix = [];

  //All Students, All Reports
  var allStudents_AllReports = [];
  var final_CH = "FULL NAME,FIRST NAME,LAST NAME,EMAIL,COMPANY,POSITION,SCHOOL YEAR TAKEN,CLASS,REPORT DATE,GENDER,LINK,PASSWORD,D ADAPTED (%),I ADAPTED (%),S ADAPTED (%),C ADAPTED (%),WHEEL POSITION 1,D NATURAL (%),I NATURAL (%),S NATURAL (%),C NATURAL (%),WHEEL POSITION 2,URGENCY,FREQUENT INTERACTION WITH OTHERS,ORGANIZED WORKPLACE,ANALYSIS OF DATA,COMPETITIVENESS,VERSATILITY,PEOPLE ORIENTED,FREQUENT CHANGE,CONSISTENCY,CUSTOMER RELATIONS,FOLLOW UP AND FOLLOW THROUGH,FOLLOWING POLICY,THEORETICAL,UTILITARIAN,AESTHETIC,SOCIAL,INDIVIDUALISTIC,TRADITIONAL,RAW_THE,RAW_UTI,RAW_AES,RAW_SOC,RAW_IND,RAW_TRA,TEN_THE,TEN_UTI,TEN_AES,TEN_SOC,TEN_IND,TEN_TRA,INTELLECTUAL,RESOURCEFUL,HARMONIOUS,ALTRUISTIC,COMMANDING,STRUCTURED,INSTINCTIVE,SELFLESS,OBJECTIVE,INTENTIONAL,COLLABORATIVE,RECEPTIVE,EMPATHETIC OUTLOOK,PRACTICAL THINKING,SYSTEMS JUDGMENT,SENSE OF SELF,ROLE AWARENESS,SELF DIRECTION,EMPATHETIC OUTLOOK BIAS,PRACTICAL THINKING BIAS,SYSTEMS JUDGMENT BIAS,SENSE OF SELF BIAS,ROLE AWARENESS BIAS,SELF DIRECTION BIAS,CAPACITY FOR SOLVING PROBLEMS INVOLVING PEOPLE,CAPACITY FOR SOLVING PRACTICAL PROBLEMS,CAPACITY FOR SOLVING THEORETICAL PROBLEMS,CAPACITY FOR PROBLEM SOLVING AND DECISION MAKING IN THE OUTSIDE WORLD,INTERNAL PROBLEM SOLVING ABILITY,PROBLEM SOLVING ABILITY WITHIN ONE'S ROLES,PROBLEM SOLVING ABILITY REGARDING ONE'S FUTURE,CAPACITY FOR PROBLEM SOLVING AND DECISION MAKING WITHIN ONE'S SELF,BALANCED DECISION MAKING,EXTERNAL CONCENTRATION INDEX,INTERNAL CONCENTRATION INDEX,CONCEPTUAL THINKING,CONFLICT MANAGEMENT,CONTINUOUS LEARNING,CREATIVITY,CUSTOMER FOCUS,DECISION MAKING,DIPLOMACY & TACT,EMPATHY,EMPLOYEE DEVELOPMENT/COACHING,FLEXIBILITY,FUTURISTIC THINKING,GOAL ACHIEVEMENT,INTERPERSONAL SKILLS,LEADERSHIP,NEGOTIATION,PERSONAL ACCOUNTABILITY,PERSUASION,PLANNING & ORGANIZING,PRESENTING,PROBLEM SOLVING ABILITY,RESILIENCY,SELF-MANAGEMENT,TEAMWORK,UNDERSTANDING & EVALUATING OTHERS,WRITTEN COMMUNICATION,Year Born,Employment Status,Occupation,Experience,Income,Ethnicity,Veteran Status,Disabled,Education,College Major,Country,State,Zip or Postal Code,High School Leadership Roles,Major-related Jobs,Location Code,Dealership Name,Dealer Code,attend,Preparing,Too many tests,Too much homework,Managing my time,Social life/friends,Too many rules,Being compared to others,Bullying/ mean peers,Getting good grades,Applying for college,Otherstress,Graphic/Gaming Design,Financial Management,Nutrition/Cooking,Career Prep,Electrician/Plumbing/other Skilled Trade,Computer Programming,Film/Movie Making,Entrepreneurism/Starting your own Business,Environment/Conservation,Sales,Social Media Marketing,Other Courses,Free Lunch,Parentcollege,GPA,Math Grades,English Grades,Science Grades,Major,Paying Job,Jobs enjoyed,Jobs not rewarding,HSS Intro";
  var allStudents_AllReports_CH;

  // Establish Column Headers for formatted file (allStudents_AllReports)
  function addCHtoAS() {
    console.log("1 ------ INSIDE ADDCHTOAS");
    return new Promise(function(resolve,reject) {
      csv.parse(final_CH, function(err, output) {
        allStudents_AllReports_CH = output[0];
        allStudents_AllReports.push(allStudents_AllReports_CH);
        if (allStudents_AllReports.length) {
          // console.log("allStudents_AllReports", allStudents_AllReports);
          resolve();
        } else {
          reject("addCHtoAS() ERROR");
        }
      })
    })
  }

  // For an individual TriMetrix Report, establish/re-establish Column Headers & add all students to allStudents_Trimetrix
  function parseFromCSV(data, i) {
    console.log("3 ------ INSIDE PARSE FROM CSV");
    return new Promise(function(resolve, reject) {
      var parseVar = [];

      console.log("4 ------ BEFORE SYNCPARSE");
      var output = syncParse(data.data);
      console.log("5 ------ AFTER SYNCPARSE", output);

      Trimetrix_CH = output[0];
      output.shift();

      for (var b = 0; b < output.length; b++) {
        parseVar.push(output[b]);
        // console.log(output[b]);
        console.log("6 ------ BEGINNING OF PARSEFROMCSV");
      }
      console.log("PARSEVAR ----- PARSEVAR:", parseVar);
      var beforeLength_AS = allStudents_AllReports.length;
      for (var a = 0; a < parseVar.length; a++) {
        allStudents_AllReports.push(new Array(165));
      }
      var afterLength_AS = allStudents_AllReports.length;

      for (var j = 0; j < Trimetrix_CH.length; j++) {
        for (var k = 0; k < allStudents_AllReports_CH.length; k++) {
          // console.log("AS -", k, allStudents_AllReports_CH[k]);
          // console.log("IR -", j, Trimetrix_CH[j]);
          if(Trimetrix_CH[j] === allStudents_AllReports_CH[k]) {
            // console.log("----------MATCH----------");
            // console.log("AS -", k, allStudents_AllReports_CH[k]);
            // console.log("IR -", j, Trimetrix_CH[j]);

            for (var l = beforeLength_AS, m = 0; l < afterLength_AS; l++, m++) {
              allStudents_AllReports[l][6] = filesToFormat[i].schoolYearTaken;
              allStudents_AllReports[l][7] = filesToFormat[i].class;

              // console.log("----------------------");
              // console.log('ALL STUDENTS --' + l, allStudents_AllReports[l]);
              // console.log('PARSEVAR --' + m, parseVar[m]);
              // console.log(allStudents_AllReports[l][k]);
              // console.log(allStudents_AllReports[l][j]);
              allStudents_AllReports[l][k] = parseVar[m][j];
              // console.log(allStudents_AllReports[l][k]);
              // console.log(allStudents_AllReports[n][j]);
              // console.log("----------");

              //Full Name formatting & insertion
              // console.log(parseVar[m][0]);
              // console.log(parseVar[m][1]);
              // console.log(parseVar[m][2]);
              var firstNameProper = parseVar[m][0].charAt(0).toUpperCase() + parseVar[m][0].slice(1);
              var lastNameProper = parseVar[m][1].charAt(0).toUpperCase() + parseVar[m][1].slice(1);
              var fullName = lastNameProper + ", " + firstNameProper;
              allStudents_AllReports[l][0] = fullName;
            }
          }
        }
      }
      console.log("7 ------ END OF PARSEFROMCSV", allStudents_AllReports);
      if(output) {
        resolve(output)
      } else {
        reject(console.log("parseFromCSV() ERROR"));
      }
    })
  }

  // Stringify all of the combined reports for one report type
  function stringifyToCSV(parseVar) {
    console.log("10 ------ INSIDE STRINGIFYTOCSV");
    return new Promise(function(resolve,reject) {
      csv.stringify(parseVar, function(err, output) {
        stringVar = output;
        if(stringVar) {
          resolve(stringVar);
        } else {
          reject(console.log("stringifyCSV() ERROR"));
        }
      })
    })
  }

  // Filters all reports into allStudents_AllReports based on column headers
  function processReports(filesToFormat) {
    console.log("2 ------ INSIDE PROCESS REPORTS");
    return new Promise(function(resolve, reject) {
      for (var i = 0; i < filesToFormat.length; i++) {
        if (filesToFormat[i].role === "Students") {
          if (filesToFormat[i].reportType === "TriMetrix HD Talent (Legacy)") {

            parseFromCSV(filesToFormat[i], i)
            .then(function(data) {
              console.log("8 ------ PARSE FROM CSV .THEN");
              return;
            }).catch(function(err) {
              console.log(err);
            })
          }

          if (filesToFormat[i].reportType === "Talent Insights") {

          }
          if (filesToFormat[i].reportType === "Hartman Value Profile") {

          }
          if (filesToFormat[i].reportType === "TTI DNA Personal Soft Skills Indicator") {

          }
        }

        if (filesToFormat[i].role === "Staff") {
          if (filesToFormat[i].reportType === "TriMetrix HD Talent (Legacy)") {

            parse(filesToFormat[i].data, function(err, output) {
              console.log(output[0]);
            })
          }
          if (filesToFormat[i].reportType === "Talent Insights") {

          }
          if (filesToFormat[i].reportType === "Hartman Value Profile") {

          }
          if (filesToFormat[i].reportType === "TTI DNA Personal Soft Skills Indicator") {

          }
        }

      }
      if (filesToFormat.length) {
        resolve();
      } else {
        reject("ERROR - NO FILES SUBMITTED FOR FORMATTING");
      }
    })
  }

// EXECUTION
  addCHtoAS()
  .then(function() {
    processReports(filesToFormat)
    .then(function() {
      console.log("9 ------ INSIDE PROCESSREPORTS .THEN");
      stringifyToCSV(allStudents_AllReports)
      .then(function(data) {
        console.log("11 ------ INSIDE STRINGIFYTOCSV .THEN");
        tilde('~', function(userHome) {
          var destDir = "";
          var environment = process.env.NODE_ENV;
          console.log(environment);
          if (environment === "production") {
            destDir = userHome + 'Output_Files/formattedCSVFiles/';
            console.log('DD-1 TTI-PF', destDir);
          } else if (environment === "development_test") {
            destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/formattedCSVFiles/';
          }

          fs.writeFile(destDir + req.body.outputFileName + ".csv", data, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("12 ------ INSIDE WRITEFILE");
              console.log(req.body.outputFileName + ".csv Created");

              var filename = req.body.outputFileName + ".csv";
              var filePath = "./Output_Files/formattedCSVFiles/" + filename;
              var stat = fs.statSync(filePath);
              var fileToSend = fs.readFileSync(filePath);
              res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Content-Length': stat.size,
                'Content-Disposition': filename
              })
              res.end(fileToSend);
            }
          })
        })
      }).catch(function(err){
        console.log(err);
      })
    }).catch(function(err){
      console.log(err);
    })
  }).catch(function(err){
    console.log(err);
  })

});


// SUMMARY STATISTIC GENERATION

router.post('/summary-stats', function(req, res, next) {

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
    console.log('inside combineReports');
    return new Promise(function(resolve, reject) {

      var count = 0;
      var compilationFile = [];

      function loopReports(count) {
        console.log('inside loopReports');
        if (count < filesToFormat.length) {
          console.log('inside Loop');
          setColumnHeaders(filesToFormat[count])
          .then(function(data1) {
            if (data1.errReason) {
              console.log(data1.errReason);
              res.writeHeader(406, {"Content-Type": "application/json"});
              res.end(JSON.stringify(data1));
            } else {
              console.log('indexArr', data1.indexArr);
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
      csv.stringify(data2, function(err, output) {
        if(output) {
          tilde('~/', function(userHome) {
            var destDir = "";
            var environment = process.env.NODE_ENV;
            if (environment === "production") {
              destDir = userHome + 'Output_Files/Summary_Statistics/';
            } else if (environment === "development_test") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Summary_Statistics/';
            }
            fs.writeFile(destDir + req.body.outputFileName + ".csv", output, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log(req.body.outputFileName + ".csv Created");
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
              }
            })
          })
        }
      })
    })
  })
})

/**ENT LIST**/

router.post('/ent-list', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  // FOR EACH INPUT FILE (TTI LINK), RELATIVE COLUMN HEADER INDICES ARE SET
  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      var fnIndex, lnIndex, genderIndex, DomIndex, InfIndex, SteIndex, ComIndex, TheIndex, UtiIndex, AesIndex, SocIndex, IndIndex, TraIndex;

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

      for (var i = 1; i < data.length; i++) {

        // GET SCORES
        var DomScore = data[i][indexArr[3]]
        var ComScore = data[i][indexArr[4]]
        var UtiScore = data[i][indexArr[5]]
        var IndScore = data[i][indexArr[6]]
        var SocScore = data[i][indexArr[7]]

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
            } else if (environment === "development_test") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Entrepreneur_Lists/';
            }
            fs.writeFile(destDir + req.body.outputFileName + ".csv", output, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log(req.body.outputFileName + ".csv Created");
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
              }
            })
          })
        }
      })
    });
  }

  generateEntList();

})



/**BLUE LIST**/

router.post('/blue-list', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  // FOR EACH INPUT FILE (TTI LINK), RELATIVE COLUMN HEADER INDICES ARE SET
  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      // console.log(data);
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
          if (columnHeaders[j] === "EMPATHETIC OUTLOOK") {
            eoIndex = j;
          }
          if (columnHeaders[j] === "PRACTICAL THINKING") {
            ptIndex = j;
          }
          if (columnHeaders[j] === "SYSTEMS JUDGMENT") {
            sjIndex = j;
          }
        }

        if (fnIndex === "" || lnIndex === "" || genderIndex === "" || stressIndex === "" || confIndex === "" || selfIndex === "" || belongIndex === "" || resilIndex === "" || dirIndex === "" || dirbIndex === "" || eoIndex === "" || ptIndex === "" || sjIndex === "") {
          resolve({ errReason: "Client Error: Incorrect Report Type", internalMessage: "One or more indices is null", externalMessage: "One or more uploaded reports is the incorrect report type for blue list generation. Refresh and try again. List of acceptable Report Types:\n\n-Hartman Value Profile"})
        } else {
          var indexArr = [fnIndex, lnIndex, genderIndex, stressIndex, confIndex, selfIndex, belongIndex, resilIndex, dirIndex, dirbIndex, eoIndex, ptIndex, sjIndex];
          var body = { data: output, indexArr: indexArr };
          resolve(body);
        }
      });
    })
  }

  // OUTPUT ENT LIST FOR INPUT FILE (TTI LINK) USING RELATIVE DATA INDICES
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
        if ((stressScore < 2) && (belongScore < 5 && belongScore >= 3.5) && (resilScore < 5)) {   // FIRST TEST, if flagged, grab student and cascade thru if-then
            blueListArr.push(studentOutput);
        } else {
          if (stressScore < 3) { ct0++; }
          if (confScore < 3.5) { ct0++; }
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

  // COMPILE BLUE LISTS FROM ALL INSTANCES
  function compileBlueLists() {
    return new Promise(function(resolve, reject) {

      var count = 0;
      var exportFile = [];

      function forLoop(count) {
        if (count < filesToFormat.length) {
          setColumnHeaders(filesToFormat[count])
          .then(function(data1) {
            console.log(data1);
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
                  console.log('resolve', exportFile);
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
            } else if (environment === "development_test") {
              destDir = userHome + 'Documents/IndigoProject/Indigo_Utilities/Output_Files/Blue_Lists/';
            }
            fs.writeFile(destDir + req.body.outputFileName + ".csv", output, function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log(req.body.outputFileName + ".csv Created");
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
              }
            })
          })
        }
      })
    });
  }

  generateBlueList();

})


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
    } else if (process.env.NODE_ENV === "development_test" || process.env.NODE_ENV === "production") {
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

router.post("/validate-tti-request", function(req, res, next) {
  console.log('INSIDE');
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
          console.log(reportTypes);
          console.log(reportList2);
          console.log(linkInfo);
          res.send({ reportList: reportList2, reportTypes: reportTypes, linkInfo: JSON.parse(linkInfo) });
        })
      }).catch(function(error) {
        res.send({ error: error });
      })
    }).catch(function(error) {
      res.send({ error: error });
    })
  } else if (req.body.mode === "filter"){
    var reportList = req.body.currentLinkReportList;
    console.log(reportList);
    var reportTypeFilter = req.body.reportTypeFilter;
    console.log(reportTypeFilter);
    var filteredReportList = [];
    for (var i = 0; i < reportList.length; i++) {
      console.log(reportList[i]);
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
    console.log('filteredReportList:', filteredReportList.length);
    res.send({ filteredReportList: filteredReportList });
  }
})

router.post("filter-reports-for-dl", function(req, res, next) {

})

router.post("/dl-to-client", function(req, res, next) {
  console.log('inside /dl-to-client');
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
      console.log('finished download');
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
      // console.log(dOKeys);
      var dupNumber = 0;
      return new Promise(function(resolve, reject) {


        bPromise.each(dOKeys, function(element, i, length) {
          // console.log(i);
          // console.log("dokeys[i] ------- " + dOKeys[i] + " -------");
          // console.log('current segLength:', distObject[dOKeys[i]].length);
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
              // console.log('indices:', indices);
              // if (indices.length > 1)
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

          // console.log('FNA:', formattedNameArr);
          dupCheckArr(formattedNameArr)
          .then(function() {
            // console.log('matchObj:', matchObj);
            mOKeys = Object.keys(matchObj);
            var removeIndices = [];
            for (var m = 0; m < mOKeys.length; m++) {
              // console.log("----------");
              // console.log(mOKeys[m]);
              // console.log(matchObj[mOKeys[m]]);
              var dateObj = []
              for (var n = 0; n < matchObj[mOKeys[m]].length; n++) {
                var date = new Date((distObject[dOKeys[i]][matchObj[mOKeys[m]][n]][6]).split('-').join("/"));
                dateObj.push(date)
              }

              var keepIndex = "";
              if (dateObj.length > 1) {
                // console.log('dateObj:', dateObj);
                for (var o = 0; o < dateObj.length; o++) {
                  if ((dateObj[o] - dateObj[o+1] || 0) > 7776000000) {
                    keepIndex = matchObj[mOKeys[m]][o];
                    break;
                  } else {
                    keepIndex = matchObj[mOKeys[m]][dateObj.length-1]
                  }
                }
                // console.log('Keep Index:', keepIndex);
                for (var o = 0; o < dateObj.length; o++) {
                  // console.log(matchObj[mOKeys[m]][o]);
                  if (matchObj[mOKeys[m]][o] !== keepIndex) {
                    removeIndices.push(matchObj[mOKeys[m]][o])
                    // console.log('pushed');
                  }
                }
              }
            }
            dupNumber = removeIndices.length;
            console.log('DUPNUMBER 1:', dupNumber);

            function sortDescending(a,b) {
              return b-a;
            }
            removeIndices.sort(sortDescending);

            // console.log('REMOVE2:', removeIndices);
            if (removeIndices.length) {
              for (var o = 0; o < removeIndices.length; o++) {
                // console.log("removing index " + Number(removeIndices[o]), distObject[dOKeys[i]][removeIndices[o]] + " ---------- ");
                distObject[dOKeys[i]].splice(Number(removeIndices[o]), 1);
                if (o === removeIndices.length-1 && i === length-1) {
                  resolve();
                }
              }
            } else {
              resolve();
            }
            // console.log(distObject[dOKeys[i]].length);
            // console.log(distObject[dOKeys[i]]);
          }).catch(function(error) {
            console.log(error);
          })
        }).then(function() {
          // console.log('final distObject:', distObject);
        }).catch(function(error) {
          console.log(error);
        })
      }).then(function() {
        // console.log(distObject);
        // console.log(distObject["Indigo Assessment"].length);
        // console.log('final distObject Length:', distObject[0].length);
        // console.log('final distObject:', distObject);
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
  console.log('REQ.BODY.DLCOUNT:', req.body.dlCount);


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
        console.log('ZIPS DIR MADE');
        var output = fs.createWriteStream(destDir + 'assessments.zip');

        var archive = archiver('zip');

        archive.on('error', function(err) {
          console.log('ERROR:', error);
          console.log('ERROR MESSAGE:', err.message);
          res.status(500).send({error: err.message});
        });

        archive.on('end', function() {
          console.log('WRITE STREAM FINISHED');
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

  // Execution Call
  function executeDownload(processStatus, distReportArrC, currentSegmentIndex, dlCount) {

    console.log('processStatus:', processStatus);
    console.log('currentSegmentIndex:', currentSegmentIndex);
    console.log('dlCount:', dlCount);

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
        console.log('DATA1:', data1);
        initiateDLAR(data1.reportObject)
        .then(function(data2) {
          numOfSegments = data2.numOfSegments;
          console.log('NUM OF SEGMENTS:', numOfSegments);
          createDownloadDir()
          .then(function(message) {
            console.log(message);
            downloadCurrentSegment(data2.distReportArr[currentSegmentIndex], currentSegmentIndex)
            .then(function(data3) {
              console.log('DATA3', data3);
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
      console.log('CSI:', currentSegmentIndex);
      console.log('NOS:', numOfSegments);
      if (currentSegmentIndex === numOfSegments ) {
        archiveReports(req.body.dupNumber, dlCount, "finished")
        io.emit('preparingFiles')
      } else {
        downloadCurrentSegment(distReportArrC[currentSegmentIndex], currentSegmentIndex)
        .then(function(data) {
          console.log('DATA', data);
          console.log(numOfSegments);
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
    console.log('inside downloadCurrentSegment');

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
          var firstName = currSegmentArr[dlIndex][1][1];
          var lastName = currSegmentArr[dlIndex][1][2];

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
              console.log('dlCount:', dlCount);
              console.log('dlIndex: ', dlIndex);
              console.log('currenSegmentArrLength', currSegmentArr.length);
              resolve(segDlCount);
              // if (dlIndex === currSegmentArr.length-1) {
              //   console.log('all downloads complete for segment #' + currSegmentIndex);
              //   resolve({message: 'all downloads complete for segment #' + currSegmentIndex, dlStatus: 'midCycle', cpStatus: 'complete'});
              // } else {
              //   dlIndex ++;
              //   downloadReport(dlIndex);
              // }
            })
          })
        })

      }
      // downloadReport(dlIndex);

      function downloadReportsLoop() {
        return new Promise(function(resolve, reject) {
          for (var i = 0; i < currSegmentArr.length; i++) {
            downloadReport(i)
            .then(function(segDlCount) {
              if (segDlCount === currSegmentArr.length) {
                console.log('SEGMENT DOWNLOAD COMPLETE, DL COUNT:', dlCount);
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
