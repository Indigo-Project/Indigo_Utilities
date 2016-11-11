var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var tilde = require('tilde-expansion');
var bPromise = require('bluebird');
var csv = require('csv');
var base64 = require('base-64');
var csvParse = require('csv-parse');
var syncParse = require('csv-parse/lib/sync');

var TTI = require('../APIs/TTI_API');

require('events').EventEmitter.prototype._maxListeners = 500;
process.env.NODE_DEBUG = "net";
require('should');

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
        fs.writeFile("formattedCSVFiles/" + req.body.outputFileName + ".csv", data, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("12 ------ INSIDE WRITEFILE");
            console.log(req.body.outputFileName + ".csv Created");
            // res.sendFile(req.body.outputFileName + ".csv", {root: "../Indigo_Utilities/formattedCSVFiles/"}, function(err) {
            //   if(err) {
            //     console.log(err);
            //   } else {
            //     console.log("File Sent..?");
            //   }
            // });

            var filename = req.body.outputFileName + ".csv";
            var filePath = "./formattedCSVFiles/" + filename;
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



/**ENT LIST**/

router.post('/ent-list', function(req, res, next) {

  var filesToFormat = req.body.inputFiles;

  // FOR EACH INPUT FILE (TTI LINK), RELATIVE COLUMN HEADER INDICES ARE SET
  function setColumnHeaders(data) {
    return new Promise(function(resolve, reject) {
      // console.log(data);
      // D NATURAL (%)
      var DomIndex = "";
      // C NATURAL (%)
      var ComIndex = "";
      // TEN_UTI
      var UtiIndex = "";
      //TEN_IND
      var IndIndex = "";
      // TEN_SOC
      var SocIndex = "";

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
          fs.writeFile("Output_Files/Entrepreneur_Lists/" + req.body.outputFileName + ".csv", output, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log(req.body.outputFileName + ".csv Created");
              var filename = req.body.outputFileName + ".csv";
              var filePath = "./Output_Files/Entrepreneur_Lists/" + filename;
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
          fs.writeFile("Output_Files/Blue_Lists/" + req.body.outputFileName + ".csv", output, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log(req.body.outputFileName + ".csv Created");
              var filename = req.body.outputFileName + ".csv";
              var filePath = "./Output_Files/Blue_Lists/" + filename;
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
        }
      })
    });
  }

  generateBlueList();

})


router.post("/validate-local-dir", function(req, res, next) {
  tilde('~', function(userHome) {
    var localDir = userHome + req.body.localDir;
    fs.access(localDir, fs.constants.F_OK, function(err) {
      if (!err) {
        res.send(localDir);
      } else {
        res.send({ error: "Download Directory is misspelled or does not exist - Please try again."})
      }
    })
  })
})

router.post("/validate-tti-request", function(req, res, next) {
  var listReportsEndpoint = TTI.APIs.listReports.generateEndpoint(req.body.accountID, req.body.linkID);
  TTI.APIs.requestFormat("GET", listReportsEndpoint, req.body.login, req.body.password)
  .then(function(reportList1) {
    var showLinkEndpoint = TTI.APIs.showLink.generateEndpoint(req.body.accountID, req.body.linkID);
    TTI.APIs.requestFormat("GET", showLinkEndpoint, req.body.login, req.body.password)
    .then(function(linkInfo) {
      var fixedData = [reportList1.slice(0,133), ",", reportList1.slice(133)].join('');
      csv.parse(fixedData, function(error, reportList2) {
        var reportTypes = req.body.reportTypes;
        reportList2.shift();
        if (reportTypes) {
          var filteredReportList = [];
          for (var i = 0; i < reportList2.length; i++) {
            var match = false;
            for (var j = 0; j < reportTypes.length; j++) {
              if (reportList2[i][11] === reportTypes[j]) {
                filteredReportList.push(reportList2[i])
              }
            }
          }
          res.send({ filteredReportList: filteredReportList, linkInfo: JSON.parse(linkInfo) });
        } else {
          res.send({ reportList: reportList2, linkInfo: JSON.parse(linkInfo) });
        }
      })
    }).catch(function(error) {
      console.log(error);
      res.send({ error: error });
    })
  }).catch(function(error) {
    res.send({ error: error });
  })

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
      console.log(dOKeys);
      var dupNumber = 0;
      return new Promise(function(resolve, reject) {


        bPromise.each(dOKeys, function(element, i, length) {
          console.log(i);
          console.log("------- " + dOKeys[i] + " -------");
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
              console.log('indices:', indices);
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

          console.log('FNA:', formattedNameArr);
          dupCheckArr(formattedNameArr)
          .then(function() {
            console.log('matchObj:', matchObj);
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
                console.log('dateObj:', dateObj);
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

            function sortDescending(a,b) {
              return b-a;
            }
            removeIndices.sort(sortDescending);

            // console.log('REMOVE2:', removeIndices);
            if (removeIndices.length) {
              for (var o = 0; o < removeIndices.length; o++) {
                console.log("removing index " + Number(removeIndices[o]), distObject[dOKeys[i]][removeIndices[o]] + " ---------- ");
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
        console.log('final distObject:', distObject);
        resolve({ distObject: distObject, dupNumber: dupNumber });
      }).catch(function(error) {
        console.log(error);
      })
    })
  }

  var reportList = req.body.reportList;
  // console.log("REPORT LIST:", reportList);
  var reportTypes = req.body.reportTypes;
  var encodeString = base64.encode(req.body.login + ":" + req.body.password);
  var dlCount = 0;

  // Execution Call
  removeDuplicates(reportList, reportTypes)
  .then(function(data) {
    console.log("DIST OBJECT:", data);
    downloadAllReports(data.distObject)
    .then(function(success) {
      console.log('succes?', success);
      res.send({ message: success, dlCount: dlCount, reportListLength: reportList.length, dupNumber: data.dupNumber });
    })
  })

  // Run all reports through download function
  function downloadAllReports(reportObject) {

    return new Promise(function(resolve, reject) {

      var rOKeys = Object.keys(reportObject)

      var temp = [];
      for (var i = 0; i < rOKeys.length; i++) {
        console.log(reportObject[rOKeys[i]].length);
        temp.push(Number(reportObject[rOKeys[i]].length));
      }
      console.log(temp);
      var longestrOKeyIndex = temp.lastIndexOf(Math.max(...temp))

      console.log('longestrOKeyIndex:', longestrOKeyIndex);

      bPromise.each(rOKeys, function(element, i, length) {
        console.log(i, rOKeys[i] + " -----------------");

        var currentReportType = rOKeys[i];
        var reportsOfCurrentType = reportObject[rOKeys[i]]
        var suffix = TTI.assessmentInfoByName[rOKeys[i]].suffix;
        var segmentLength = reportsOfCurrentType.length;
        console.log('segLength:', segmentLength);
        var rOKeysLength = rOKeys.length;
        console.log('rOKeysLength:', rOKeysLength);

        var dlIndex = 0;

        // Download Stream Function
        function download(requestOptions, destination) {
          return new Promise(function(resolve, reject) {
            var file = fs.createWriteStream(destination);
            request(requestOptions).setMaxListeners(0).pipe(file);
            file.on('finish', function() {
              file.close(console.log("finished downloading " + destination));
              dlCount ++;
              resolve(dlCount);
            }).on('error', function(error) {
              fs.unlink(destination);
              console.log("--- ERROR ---", error);
            });
          })
        };

        // Download config and initiation for one report of report type
        function downloadReport(j) {
          return new Promise(function(resolve, reject) {
            var reportID = reportsOfCurrentType[j][0];
            var showReportEndpoint = TTI.APIs.showReport.generateEndpoint(req.body.accountID, req.body.linkID, reportID);
            var firstName = reportsOfCurrentType[j][1];
            var lastName = reportsOfCurrentType[j][2];
            console.log("----------");
            console.log(showReportEndpoint);
            tilde('~', function(userHome) {
              var destination = userHome + req.body.destination + "/" + lastName + ", " + firstName + suffix + ".pdf";
              console.log(destination);
              var file = fs.createWriteStream(destination);
              var options = {
                method: "GET",
                url: showReportEndpoint,
                headers: {
                  'Authorization': 'Basic ' + encodeString
                },
                maxRedirects: 1000
              }
              download(options, destination)
              .then(function(dlCount) {
                console.log('dlCount:', dlCount);
                console.log('dlIndex: ' + j, 'segLength: ' + segmentLength);
                console.log('i:', i);
                console.log('length:', rOKeysLength);
                if(j === segmentLength-1) {
                  console.log('I-ITERATION:', i);
                  if (i === longestrOKeyIndex) {
                    console.log('all downloads complete for all ' + rOKeysLength + ' report types');
                    resolve({message:'all downloads complete for all ' + rOKeysLength + ' report types', status: 'ac'});
                  } else {
                    console.log('all downloads complete for ' + currentReportType + ' report type');
                    resolve({message:'all downloads complete for ' + currentReportType + ' report type', status: 'crt'});
                  }
                }
                else {
                  dlIndex++;
                  if (segmentLength < 150) {
                    downloadReport(dlIndex);
                  } else {
                    setTimeout(downloadReport(dlIndex), 0)
                  }
                  // console.log("download " + dlCount + "/" + reportList.length + " complete");
                }
              })
            })
          }).then(function(data) {
            console.log("DATADATA:", data);
            if (data.status === "ac") {
              resolve('success');
            }
          }).catch(function(error) {
            console.log('dlREPORT ERROR:', error);
          })
        }

        // function downloadReportsLoop() {
        //   return new Promise(function(resolve, reject) {
        //     for (var p = 0; p < segmentLength; p++) {
        //       if (segmentLength < 125) {
        //         downloadReport(p)
        //         if (p === segmentLength-1) {
        //           // console.log('DONEDONE');
        //         }
        //       } else {
        //         setTimeout(downloadReport(dlIndex), 0)
        //         if (p === segmentLength-1) {
        //           // console.log('DONEDONE');
        //         }
        //       }
        //     }
        //   })
        // }
        //
        // downloadReportsLoop()


        downloadReport(dlIndex)

      }).then(function(data) {
        console.log('SALSA:', data);
        // resolve('success');
      })
    })
  }
});

module.exports = router;
