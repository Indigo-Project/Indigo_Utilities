var express = require('express');
var router = express.Router();
var csv = require('csv');
var syncParse = require('csv-parse/lib/sync');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("local api");
});

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
        console.log(output[b]);
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
      // })
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

  function writeCSV() {}

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

module.exports = router;
