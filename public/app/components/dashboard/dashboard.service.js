app.factory('DashboardService', ['$compile', '$http', '$rootScope', 'RWD', function($compile, $http, $rootScope, RWD) {

  // console.log(angular.element('dashboard').scope());
  // console.log($('table.student-data tbody td:nth-of-type(1)'));

  return {

    getSchoolNameOptions: function() {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'GET',
          url: '/api/dashboard-names',
        }).then(function(data) {
          if (data) resolve(data);
        }).catch(function(error) {
          console.log(error);
        })
      })
    },

    getDataObject: function(loadedFiles, schoolCode, dashboardVersionName) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'POST',
          url: '/api/dashboard-gen',
          data: { inputFiles: loadedFiles, schoolCode: schoolCode, dashboardVersionName: dashboardVersionName }
        }).then(function(data) {
          if (data) resolve(data);
        }).catch(function(error) {
          console.log(error);
        })
      })
    },

    d3Setup: function(inputObject, controlOption) {
      return new Promise(function(resolve, reject) {

        function createDashboard(data, schoolName) {

          // Global Vars
          var studentSelections, classSelections, genderSelections, dashData, sdCHs, dataKeys, studentClasses, dashValCHs, dashboardCHs, dashValsIndex, sortAscending, table, tablebody, titles, columnColorIndex, noData;
          function setDashboardGlobalVars() {

            studentSelections = [];
            classSelections = [];
            genderSelections = [];

            dashData = data.compiledData.studentData;
            sdCHs = data.compiledData.columnHeaders[0];
            dataKeys = Object.keys(data)
            studentClasses = [];

            for (var i = 0; i < dataKeys.length; i++) {
              if (dataKeys[i] !== "Staff" && dataKeys[i] !== "compiledData" && dataKeys[i] !== "metaData" && dataKeys[i] !== "_id") {
                studentClasses.push(dataKeys[i].substring(0,4))
              }
            }

            dashValCHs = ["FULL NAME", "GENDER", "CLASS", "D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA"];
            dashboardCHs = ["Students", "Gender", "Class", "Dominance", "Influencing", "Steadiness", "Compliance", "Theoretical", "Utilitarian", "Aesthetic", "Social", "Individualistic", "Traditional"];
            dashValsIndex = [];

            for (var i = 0; i < sdCHs.length; i++) {
              for (var j = 0; j < dashValCHs.length; j++) {
                if(sdCHs[i] === dashValCHs[j]) {
                  dashValsIndex.push(i);
                }
              }
            }

            sortAscending = true;
            table = d3.select('div.student-data-table').append('table').attr('class', 'student-data');
            tableBody = table.append('tbody').attr('class', 'student-data');
            titles = d3.values(dashboardCHs);

            columnColorIndex = ["rgba(255,255,255,", "rgba(255,255,255,", "rgba(255,255,255,", "rgba(255, 52, 52,", "rgba(250, 238, 74,", "rgba(41, 218, 32,", "rgba(96, 112, 255,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,"];
          }

          // Dashboard Filters Setup
          // Setting and updating available filter options
          function setupFilters(data, filtersApplied, init) {

            console.log('setupFilters', data, filtersApplied);

            // Student Filter
            function studentFilterSetup(data) {

              var studentFilter = d3.select('div.student-filter')
              var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { return d })
              var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              studentFilterLabelsInner.append('p')
              .text(function(d) {
                return d[0];
              })
              studentFilterLabels.exit().remove();

              // Apply change event to inputs
              var studentFilterInputs = studentFilter.selectAll('label > input')
              studentFilterInputs.on("change", function(data,i,arr) {

                // var noDataContainer = d3.select('div.dashboard-no-data-display');
                // noData ? noDataContainer.remove() : null;

                var value = data[0];
                var action = this.checked ? "add" : "remove";
                applyFilters(action, "student", value)
              })

            }

            // Gender Filter
            function genderFilterSetup(data) {

              var genderFilter = d3.select('div.gender-filter')
              var genderFilterLabels = genderFilter.selectAll('label').data(['Male', 'Female']).enter().append('label');
              genderFilterLabels.append('input').attr('type', 'checkbox');
              genderFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();

              // Apply change event to inputs
              var genderFilterInputs = genderFilter.selectAll('label > input')
              genderFilterInputs.on("change", function(data,i,arr) {

                var noDataContainer = d3.select('div.dashboard-no-data-display');
                noData ? noDataContainer.remove() : null;

                var value = data;
                var action = this.checked ? "add" : "remove";
                applyFilters(action, "gender", value)
              })

            }

            // Class Filter
            function classFilterSetup(data) {

              var classFilter = d3.select('div.class-filter')
              var classFilterLabels = classFilter.selectAll('label').data(studentClasses).enter().append('label');
              classFilterLabels.append('input').attr('type', 'checkbox');
              classFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();

              // Apply change event to inputs
              var classFilterInputs = classFilter.selectAll('label > input')
              classFilterInputs.on("change", function(data,i,arr) {

                var noDataContainer = d3.select('div.dashboard-no-data-display');
                noData ? noDataContainer.remove() : null;

                var value = data;
                var action = this.checked ? "add" : "remove";
                applyFilters(action, "class", value)
              })

            }

            if (init) {

              studentFilterSetup(data);
              genderFilterSetup(data);
              classFilterSetup(data);

            } else {

              // If Class or Gender filter has been applied
              if (filtersApplied[0].length || filtersApplied[1].length) {

                // Update data object w/ Class Filter
                if (filtersApplied[0].length) {
                  data = data.filter(function(e, i, a) {
                    return filtersApplied[0].indexOf(e[4]) !== -1;
                  })
                }

                // Update data object w/ Gender Filter
                if (filtersApplied[1].length) {
                  data = data.filter(function(e, i, a) {
                    var gTransform = e[3] === 'M' ? 'Male' : 'Female';
                    return filtersApplied[1].indexOf(gTransform) !== -1;
                  })
                }

                // Update student filter options with updated data object
                studentFilterSetup(data);

              } else {

                // Update student filter options with original data object (no filters applied)
                studentFilterSetup(data);

              }
            }

              // keep selectedStudents (checked students) at top of student filter option
              // for (var i = 0; i < studentSelections.length; i++) {
              //   var selectedStudentExistsInData = false;
              //   for (var j = 0; j < data.length; j++) {
              //     if (studentSelections[i] === data[j][0]) {
              //       console.log('student ' + data[j][0] + ' found in data at index ' + j);
              //       selectedStudentExistsInData = true;
              //       selectedStudentDataIndex = j;
              //       console.log(selectedStudentDataIndex);
              //     }
              //   }
              //   if (selectedStudentExistsInData) {
              //     console.log('STUDENT EXISTS WITHIN FILTER PARAMETERS');
              //     // change position to beginning of data array, retain checked attribute
              //     // var student = data[selectedStudentDataIndex];
              //     // data.unshift(student);
              //     // console.log(data[0]);
              //     // console.log(data[selectedStudentDataIndex+1]);
              //     // data.splice(selectedStudentDataIndex+1,1);
              //   }
              //   else if (!selectedStudentExistsInData) {
              //     console.log('NO, STUDENT DOES NOT EXIST WITHIN FILTER PARAMETERS');
              //     // add student to beginning of data array, retain checked attribute
              //     var dashDataIndex;
              //     for (var j = 0; j < dashData.length; j++) {
              //       if (studentSelections[i] === dashData[j][0]) {
              //         dashDataIndex = j;
              //       }
              //     }
              //     console.log(dashData[j]);
              //     data.unshift(dashData[j])
              //   }
              // }
              // console.log(data);
              // console.log(data.length);
              // data.unshift([['Test Name']])

              // var studentFilter = d3.select('div.student-filter')
              // var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { return d; })
              // var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              // studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              // studentFilterLabelsInner.append('p')
              // .text(function(d) {
              //   console.log(d);
              //   return d[0];
              // })
              // studentFilterLabels.exit().remove();
              //
              // var studentFilterInputs = studentFilter.selectAll('label > input')
              // studentFilterInputs.on("change", function(data,i,arr) {
              //   var value = data[0];
              //   var action = this.checked ? "add" : "remove";
              //   applyFilters(action, "student", value)
              // })

            // } if (filtersApplied[2].length) {
            //
            //   console.log('student filter applied');
              // update filter box to reflect checked students (fixed at top)
              // for (var i = 0; i < filtersApplied[2].length; i++) {
              //   for (var j = 0; j < data.length; j++) {
              //     if (filtersApplied[2][i] === data[j][0]) {
              //       // console.log('data index ' + j, studentSelections[i], data[j][0]);
              //       var student = data[j]
              //       data.unshift(student);
              //       data.splice(j+1, 1);
              //     }
              //   }
              // }

              // console.log(data[0][0]);
              // var studentFilter = d3.select('div.student-filter')
              // var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) {
              //   // console.log(d[0]);
              //   return d;
              // })
              // var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              // studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              // studentFilterLabelsInner.append('p')
              // .text(function(d) {
              //   // console.log(d);
              //   return d[0];
              // })
              // studentFilterLabels.exit().remove();
              // // apply .on change event to inputs
              // var studentFilterInputs = studentFilter.selectAll('label > input')
              // studentFilterInputs.on("change", function(data,i,arr) {
              //   var value = data[0];
              //   var action = this.checked ? "add" : "remove";
              //   applyFilters(action, "student", value)
              // })

            // } else {

          }

          // populate rows with data, based on student data object index references
          function generateTable(rowData, status) {

            // Dashboard Headers Setup
            function setupHeaders(status) {

              // Sort Calculation Function
              function stringCompare(a, b, sort, i) {
                // console.log(i);
                if (i > 3) {
                  a = Number(a);
                  b = Number(b);
                }
                var tsA = toString.call(a);
                var tsB = toString.call(b);
                if (tsA === "[object String]" && tsB === "[object String]") {
                  a = a.toLowerCase();
                  b = b.toLowerCase();
                }
                if (sort === "asc") return a > b ? 1 : a == b ? 0 : -1;
                else if (sort === "des") return a < b ? 1 : a == b ? 0 : -1;
              }

              if (status === 'init') {

                var headers = table.append('thead').attr('class', 'student-data')
                .selectAll('th')
                .data(titles).enter()
                .append('th').attr('class', 'student-data')
                .text(function (d) {
                  return d;
                })
                .on('click', function(d, i) {
                  i = dashValsIndex[i];
                  headers.attr('class', 'student-data header');
                  if (sortAscending) {
                    console.log('Ascending');
                    rowObj.sort(function(a, b) {
                      return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i)
                    });
                    sortAscending = false;
                    this.className = 'student-data header des';
                  } else {
                    console.log('Descending');
                    rowObj.sort(function(a, b) { return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'des', i) });
                    sortAscending = true;
                    this.className = 'student-data header asc';
                  }
                })

              } else {

                var headers = table.select('thead').selectAll('th');

                headers.on('click', function(d, i) {
                  i = dashValsIndex[i];
                  headers.attr('class', 'student-data header');
                  if (sortAscending) {
                    console.log('Ascending');
                    tableBody.selectAll('tr')
                    .sort(function(a, b) {
                      return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i)
                    });
                    sortAscending = false;
                    this.className = 'student-data header des';
                  } else {
                    console.log('Descending');
                    tableBody.selectAll('tr')
                    .sort(function(a, b) {
                      return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'des', i)
                    });
                    sortAscending = true;
                    this.className = 'student-data header asc';
                  }
                })
              }
            }

            // Dashboard Rows Setup
            function setupRows(status) {

              if (status === 'init') {

                rowObj.attr('row-index', function(d, i) {
                  return i;
                })
                rowObj.selectAll('td').data(function (d,i) {
                  return dashValsIndex.map(function (k, i) {
                    return { 'value': d[k], 'name': dashValCHs[i] };
                  })
                }).enter()
                .append('td').attr('class', 'student-data')
                .attr('column-th', function (d, i, a) {
                  return d.name;
                })
                .attr('ng-click', 'view.openStudentDetails($event)')
                .text(function (d, i, a) {
                  return d.value;
                })
                .style("background-color", function(d, i) {
                  var discOpacityCalc = (((Number(d.value) * 80) / 100) + 20) / 100;
                  var motivOpacityCalc = (((Number(d.value) * 8) / 10) + 2) / 10;
                  var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
                  var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
                  return cellColor + opacity + ")";
                })

                RWD.responsiveAdaptationDashboard();
                $compile($('table.student-data tbody td:nth-of-type(1)'))(angular.element('dashboard').scope());
                rowObj.exit().remove();

              } else if (status === 'noData') {

                console.log('No Data Message');

                noData = true;

                rowObj.enter();
                rowObj.exit().remove();


                var noDataContainer = d3.select('div.student-data-table')
                .append('div').attr('class', 'dashboard-no-data-display')

                var messageContainer = noDataContainer.append('div').attr('class', 'no-data-message')

                messageContainer
                .append('h3').attr('class','no-data-message')
                .text("No Data Returned by Filters")

                messageContainer
                .append('button').attr('class','no-data-cta form-control')
                .text("reset filters")
                .on("click", function() {

                  noDataContainer.remove();

                  function unselectFilters() {


                    var genderFilters = d3.select('div.gender-filter').selectAll('input')
                    .attr('checked', function(d,i,a) { return a[i].checked = false; })
                    genderSelections = [];

                    var classFilters = d3.select('div.class-filter').selectAll('input')
                    .attr('checked', function(d,i,a) { return a[i].checked = false; })
                    classSelections = [];

                    var studentFilters = d3.select('div.student-filter').selectAll('input')
                    .attr('checked', function(d,i,a) { return a[i].checked = false; })
                    studentSelections = [];

                  }

                  unselectFilters();
                  setupFilters(dashData, [[],[],[]], true);
                  generateTable(dashData, 'filterReset');

                })

                noData = true;

                RWD.responsiveAdaptationDashboard();

              } else if (status === 'update') {

                console.log('update');

                rowObj.enter().append('tr').attr('class', 'student-data')
                .attr('row-index', function(d, i) {
                  // console.log(d, i);
                  return i;
                })
                .selectAll('td').data(function (d,i) {
                  return dashValsIndex.map(function (k, i) {
                    return { 'value': d[k], 'name': dashValCHs[i] };
                  })
                }).enter()
                .append('td').attr('class', 'student-data')
                .attr('column-th', function (d) {
                  return d.name;
                })
                .attr('ng-click', 'view.openStudentDetails($event)')
                .text(function (d, i, a) {
                  return d.value;
                })
                .text(function (d, i, a) {
                  return d.value;
                }).style("background-color", function(d, i) {
                  var discOpacityCalc = (((Number(d.value) * 80) / 100) + 20) / 100;
                  var motivOpacityCalc = (((Number(d.value) * 8) / 10) + 2) / 10;
                  var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
                  var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
                  return cellColor + opacity + ")";
                })

                RWD.responsiveAdaptationDashboard();
                $compile($('table.student-data tbody td:nth-of-type(1)'))(angular.element('dashboard').scope());
                rowObj.exit().remove();

              }
            }

            if (status === 'init') {

              console.log('initializing row data');

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d }).enter().append('tr').attr('class', 'student-data');

              setupHeaders('init');
              return setupRows('init');

            } else if (status === 'update') {

              // console.log('row data update', rowData);

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

              setupHeaders('reinitialize');
              return setupRows('update');

            } else if (status === 'noData') {

              // console.log('No Data Message');

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

              setupHeaders('reinitialize');
              return setupRows('noData');

            } else if (status === 'filterReset') {

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

              return setupRows('update');

            }
          }

          // Triggered on change to any filter checkbox - applies updated filter selection to dashbaord
          function applyFilters(action, filter, value) {

            function updateGlobalFilterObjects() {
              return new Promise(function(resolve, reject) {
                if (filter === "student") action === "add" ? studentSelections.push(value) : studentSelections.splice(studentSelections.indexOf(value), 1);
                if (filter === "class") action === "add" ? classSelections.push(value) : classSelections.splice(classSelections.indexOf(value), 1);
                if (filter === "gender") action === "add" ? genderSelections.push(value) : genderSelections.splice(genderSelections.indexOf(value), 1);
                resolve();
              })
            }

            function createFilteredDataSetObject() {

              return new Promise(function(resolve, reject) {

                var filteredData;
                if (studentSelections.length) {
                  filteredData = dashData.filter(function(d,i) { return studentSelections.includes(d[0]) });
                } else {
                  filteredData = dashData;
                }

                // update data object with class filter
                if (filteredData) {
                  if (classSelections.length) {
                    var filteredData = filteredData.filter(function(d,i) { return classSelections.includes(d[4]) });
                  }
                } else {
                  if (classSelections.length) {
                    var filteredData = dashData.filter(function(d,i) { return classSelections.includes(d[4]) });
                  } else {
                    var filteredData = dashData;
                  }
                }
                // update data object with gender filter
                if (filteredData) {
                  if (genderSelections.length) {
                    var filteredData = filteredData.filter(function(d,i) {
                      var gender;
                      if (d[3] === 'M') {
                        gender = 'Male';
                      } else if (d[3] === 'F') {
                        gender = 'Female';
                      }
                      return genderSelections.includes(gender)
                    });
                  }
                } else {
                  if (genderSelections.length) {
                    var filteredData = filteredData.filter(function(d,i) {
                      var gender;
                      if (d[3] === 'M') {
                        gender = 'Male';
                      } else if (d[3] === 'F') {
                        gender = 'Female';
                      }
                      return genderSelections.includes(gender)
                    });
                  } else {
                    var filteredData = dashData;
                  }
                }

                // console.log('filteredData', filteredData);

                var filtersApplied = [classSelections, genderSelections, studentSelections];

                if (filteredData && filtersApplied) resolve({ filteredData: filteredData, filtersApplied: filtersApplied });

              })
            }

            updateGlobalFilterObjects()
            .then(function() {
              createFilteredDataSetObject()
              .then(function(data) {

                // Setup Filters based on Applied Filters
                setupFilters(dashData, data.filtersApplied, false);

                // Setup Dashboard based on Filtered Data. If no data, display 'No Data' Message
                console.log(!data.filteredData.length, data.filteredData);
                !data.filteredData.length ? generateTable(data.filteredData, 'noData') : generateTable(data.filteredData, 'update');

                // Setup Dashboard based on Filterd Data
                // generateTable(data.filteredData, 'update');

              })
            });
          }

          // Search Bar Functionality
          function searchBarInit() {

            d3.select('input.search-bar')
            .on("keyup", function() {
              var searchedData = dashData;
              var text = this.value.trim();
              console.log('keyup', text);

              var searchResults = searchedData.map(function(e) {
                // console.log(e);
                var regex = new RegExp(text + ".*", "i");
                if (regex.test(e[0])) {
                  return regex.exec(e[0])[0]
                }
              })

              var searchResultIndices = [];
              for (var i = 0; i < searchResults.length; i++) {
                if (searchResults[i]) searchResultIndices.push(i);
              }

              var searchReturn = [];
              for (var i = 0; i < searchResultIndices.length; i++) {
                searchReturn.push(dashData[searchResultIndices[i]]);
              }

              setupFilters(searchReturn, [classSelections,genderSelections,studentSelections]);

            })
          }

          function dashboardInitialization() {
            setDashboardGlobalVars();
            setupFilters(dashData, [[],[],[]], true);
            generateTable(dashData, 'init');
          }

          return dashboardInitialization();

        }

        function loadStudentDetails(columnHeaders, studentData, metaData) {
          // student details data object setup
          var sDDataObject = {};
          for (var i = 0; i < columnHeaders.length; i++) {
            sDDataObject[columnHeaders[i]] = { index: "", value: "" };
            sDDataObject[columnHeaders[i]].index = i;
            sDDataObject[columnHeaders[i]].value = !studentData[i] || studentData[i] === "Please Select" || studentData[i] === "-" ? "---" : studentData[i];
            sDDataObject[columnHeaders[i]].key = columnHeaders[i];
            sDDataObject[columnHeaders[i]].label = columnHeaders[i].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
          }
          console.log(sDDataObject);

          var adultAverages = {
            "DISC": ['43.0', '58.7', '60.7', '50.5'],
            "MOTIVATORS": ['6.0', '5.3', '4.3', '4.2', '5.5', '4.7'],
            // HD SKILLS ["CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION"];
            "HD-SKILLS": ['6.9', '5.3', '6.7', '5.0', '7.3', '7.2', '6.0', '4.1', '6.6', '7.3', '2.3', '7.2', '7.3', '6.0', '4.4', '7.0', '5.2', '5.5', '5.3', '7.2', '7.2', '7.2', '6.8', '7.9', '5.7'],
            // DNA SKILLS ["ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION"]
            "DNA-SKILLS": ['4.7', '5.2', '6.1', '4.8', '6.3', '4.0', '5.9', '3.6', '6.8', '4.5', '2.8', '6.8', '6.8', '6.1', '5.7', '3.8', '5.5', '5.5', '4.8', '6.1', '4.4', '6.3', '5.4'],
            "SOCIAL-EMOTIONAL-1": ['8.1', '8.0', '7.8'],
            "SOCIAL-EMOTIONAL-2": ['7.2', '7.1', '6.8']
          }
          var dnaSkills = ["Analytical Problem Solving", "Conflict Management", "Continuous Learning", "Creativity/Innovation", "Customer Service", "Decision Making", "Diplomacy", "Empathy", "Employee Development/Coaching", "Flexibility", "Futuristic Thinking", "Goal Orientation", "Interpersonal Skills", "Leadership", "Management", "Negotiation", "Personal Effectiveness", "Persuasion", "Planning/Organizing", "Presenting", "Self-Management (time and priorities)", "Teamwork", "Written Communication"]
          var capDNASKILLS = []
          for (var i = 0; i < dnaSkills.length; i++) {
            capDNASKILLS.push(dnaSkills[i].toUpperCase());
          }
          console.log(capDNASKILLS);

          // row 1 - header name
          var studentName = d3.select('h3.sde-name');
          studentName.text(sDDataObject['FULL NAME'].value)
          .attr("class", "sde-name");

          function setSdSectionData(subValCategory) {

            // Set averages object for current section data set

            // Set 'sd-sub' value
            var subValArr;
            function setSubValArray () {
              if (subValCategory === 'DISC') {
                subValArr = [ sDDataObject['D ADAPTED (%)'].value, sDDataObject['I ADAPTED (%)'].value, sDDataObject['S ADAPTED (%)'].value, sDDataObject['C ADAPTED (%)'].value ]
                // console.log(subValArr);
              } else if (subValCategory === 'SOCIAL-EMOTIONAL-0') {
                subValArr = [ sDDataObject['UNDERSTANDING OTHERS BIAS'].value, sDDataObject['PRACTICAL THINKING BIAS'].value, sDDataObject['SYSTEMS JUDGMENT BIAS'].value ];
              } else if (subValCategory === 'SOCIAL-EMOTIONAL-1') {
                subValArr = [ sDDataObject['SENSE OF SELF BIAS'].value, sDDataObject['ROLE AWARENESS BIAS'].value, sDDataObject['SELF DIRECTION BIAS'].value ];
              } else {
                subValArr = adultAverages[subValCategory];
              }
            }
            setSubValArray();

            // Remove subValCategory from arguments array
            Array.prototype.shift.apply(arguments)

            var returnArr = [];
            var conversionObj = {
              "ATTEND": {
                label: function(label) {
                  return "Enjoy Attending School";
                }
              },
              "C NATURAL (%)": {
                label: function(label) {
                  return "Compliance";
                }
              },
              "D NATURAL (%)": {
                label: function(label) {
                  return "Dominance";
                }
              },
              "GENDER": {
                value: function(value) {
                  return value === "M" ? "Male" : "Female";
                }
              },
              "GPA": {
                label: function(label) {
                  return "GPA";
                }
              },
              "I NATURAL (%)": {
                label: function(label) {
                  return "Influencing";
                }
              },
              "MAJOR": {
                label: function(label) {
                  return "Major(s)";
                }
              },
              "OTHERSTRESS": {
                label: function(label) {
                  return "Other Stressors";
                }
              },
              "PARENTCOLLEGE": {
                label: function(label) {
                  return "First Generation";
                }
              },
              "PAYING JOB": {
                label: function(label) {
                  return "Has Paying Job";
                }
              },
              "PREPARING": {
                label: function(label) {
                  return "Feel School is Preparing for Life";
                }
              },
              "S NATURAL (%)": {
                label: function(label) {
                  return "Steadiness";
                }
              },
              "SCHOOL YEAR": {
                label: function(label) {
                  return "School Year Taken";
                }
              },
              "TEN_AES": {
                label: function(label) {
                  return "Aesthetic";
                }
              },
              "TEN_IND": {
                label: function(label) {
                  return "Individualistic";
                }
              },
              "TEN_SOC": {
                label: function(label) {
                  return "Social";
                }
              },
              "TEN_THE": {
                label: function(label) {
                  return "Theoretical";
                }
              },
              "TEN_TRA": {
                label: function(label) {
                  return "Traditional";
                }
              },
              "TEN_UTI": {
                label: function(label) {
                  return "Utilitarian";
                }
              },
            };
            var conversionObjKeys = Object.keys(conversionObj);

            for (var i = 0; i < arguments.length; i++) {
              var pushVal;
              // console.log(arguments[i]);
              for (var j = 0; j < conversionObjKeys.length; j++) {
                var label, value, sub;
                if (arguments[i] === conversionObjKeys[j]) {
                  if (sDDataObject[arguments[i]]) {
                    sub = subValArr ? subValArr[i] : 'null';
                    label = conversionObj[conversionObjKeys[j]].label ? conversionObj[conversionObjKeys[j]].label(sDDataObject[arguments[i]].label) : sDDataObject[arguments[i]].label;
                    value = conversionObj[conversionObjKeys[j]].value ? conversionObj[conversionObjKeys[j]].value(sDDataObject[arguments[i]].value) : sDDataObject[arguments[i]].value;
                    pushVal = [label, value, sub];
                    break;
                  } else {
                    // console.log(arguments[i] === conversionObjKeys[j] ? conversionObj[conversionObjKeys[j]].label('') : false, arguments[i]);
                    sub = subValArr ? subValArr[i] : 'null';
                    value = sDDataObject[arguments[i]] ? sDDataObject[arguments[i]].value : '---';
                    label = sDDataObject[arguments[i]] ? sDDataObject[arguments[i]].label : arguments[i] === conversionObjKeys[j] ? conversionObj[conversionObjKeys[j]].label('') : arguments[i];
                    pushVal = [label, value, sub];
                    break;
                  }
                } else {
                  sub = subValArr ? subValArr[i] : 'null';
                  label = sDDataObject[arguments[i]] ? sDDataObject[arguments[i]].label : arguments[i].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});;
                  value = sDDataObject[arguments[i]] ? sDDataObject[arguments[i]].value : '---';
                  pushVal = [label, value, sub];
                }
              }
              returnArr.push(pushVal);
            }
            return returnArr;
          }

          // ROW 1
          // header demographics
          var studentDems1 = d3.select('div.sde-dems1');
          var dems1 = setSdSectionData(null, "YEAR BORN", "CLASS", "GENDER", "ETHNICITY", "SCHOOL YEAR")
          var studentDems1Spans = studentDems1.selectAll('span').data(dems1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems1");
          studentDems1Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems1")
          studentDems1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems1");

          // ROW 2
          // dems 2.0
          var studentDems2_0 = d3.select('div.sde-dems2-0');
          var dems2_0 = setSdSectionData(null, "ENGLISH GRADES", "MATH GRADES", "SCIENCE GRADES");
          var studentDems2_0Spans = studentDems2_0.selectAll('span').data(dems2_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2");
          var studentDems2_0SpansVals = studentDems2_0Spans.append('div').attr("class", "sd-content-p");
          studentDems2_0SpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2")
          studentDems2_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2");

          // dems 2.1
          var studentDems2_1 = d3.select('div.sde-dems2-1');
          var dems2_1 = setSdSectionData(null, "GPA", "PARENTCOLLEGE", "PAYING JOB");
          var studentDems2_1Spans = studentDems2_1.selectAll('span').data(dems2_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2");
          var studentDems2_1SpansVals = studentDems2_1Spans.append('div').attr("class", "sd-content-p");
          studentDems2_1SpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2")
          studentDems2_1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2");

          // dems 2.2
          var studentDems2_2 = d3.select('div.sde-dems2-2');
          var dems2_2 = setSdSectionData(null, "MAJOR", "JOBS ENJOYED", "JOBS NOT REWARDING");
          var studentDems2_2Spans = studentDems2_2.selectAll('span').data(dems2_2, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2");
          var studentDems2_2SpansVals = studentDems2_2Spans.append('div').attr("class", "sd-content-p");
          studentDems2_2SpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2")
          studentDems2_2Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2");


          // ROW 3
          // disc
          var studentDiscVals = d3.select('div.sde-disc-content');
          var discVals = setSdSectionData("DISC", "D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)");
          var discCalcVals = setSdSectionData("D ADAPTED (%)", "I ADAPTED (%)", "S ADAPTED (%)", "C ADAPTED (%)");
          var studentDiscValsDivs = studentDiscVals.selectAll('div').data(discVals, function(d) { return d; }).enter().append('div')
          .attr("class", "disc-val-container");
          var studentDiscValsSpans = studentDiscValsDivs.append('span')
          .attr("class", "sd-span sde-disc");
          var studentDiscSpansVals = studentDiscValsSpans.append('div').attr("class", "sd-content-p");
          studentDiscSpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-disc");
          studentDiscSpansVals.append('p').text(function(d) { return d[2]; })
          .attr("class", "sd-sub sde-disc-sub");
          studentDiscValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-disc");

          var studentDiscValsCharts = studentDiscValsDivs.append('figure').attr('class', "disc-chart");
          var naturalBar = studentDiscValsCharts.append('div').attr("class", "disc-bar");
          var naturalBarColors = ["rgb(255, 0, 0)", "rgb(250, 255, 0)", "rgb(12, 255, 0)", "rgb(0, 25, 250)"]
          naturalBar.style("width", function(d) { return d[1] + "%" })
          naturalBar.style("background-color", function(d, i) { return naturalBarColors[i] })
          var adaptedBar = studentDiscValsCharts.append('div').attr("class", "disc-bar");
          adaptedBar.style("width", function(d) { return d[2] + "%" })
          adaptedBar.style("background-color", "rgb(233, 233, 233)")


          // motivators
          var studentMotivatorVals = d3.select('div.sde-motivators-content');
          var motivatorVals = setSdSectionData("MOTIVATORS", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA");
          var motivatorAvgs = adultAverages.MOTIVATORS
          var studentMotivatorValsSpans = studentMotivatorVals.selectAll('span').data(motivatorVals, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-motivators");
          var studentMotivatorSpansVals = studentMotivatorValsSpans.append('div').attr("class", "sd-content-p");
          studentMotivatorSpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-motivators");
          studentMotivatorSpansVals.append('p').text(function(d) { return d[2]; })
          .attr("class", "sd-sub sde-motivators-sub");
          studentMotivatorValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-motivators");

          // skills
          var studentSkillsVals = d3.select('div.sde-skills-content');
          console.log(metaData.skillsOption);
          var skillsOption = metaData.skillsOption;
          var skillsVals = skillsOption === 'DNA' ? setSdSectionData("DNA-SKILLS", "ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION") : setSdSectionData("HD-SKILLS", "CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION");
          // var skillsVals = setSdSectionData("HD-SKILLS", "CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION");
          // var skillsVals = setSdSectionData("DNA-SKILLS", "ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION");
          var skillsAvgs = adultAverages.SKILLS;
          var studentSkillsValsSpans = studentSkillsVals.selectAll('span').data(skillsVals, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-skills");
          var studentSkillsSpansVals = studentSkillsValsSpans.append('div').attr("class", "sd-content-p");
          studentSkillsSpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-skills")
          studentSkillsSpansVals.append('p').text(function(d) { return d[2]; })
          .attr("class", "sd-sub sde-skills-sub")
          studentSkillsValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-skills")
          .attr("title", function(d) { return d[0] });

          // ROW 4
          // se 1.0
          var studentSe1_0 = d3.select('div.sde-se-0');
          var se1_0 = setSdSectionData("SOCIAL-EMOTIONAL-0", "UNDERSTANDING OTHERS", "PRACTICAL THINKING", "SYSTEMS JUDGMENT");
          var se1_0Biases = setSdSectionData("UNDERSTANDING OTHERS BIAS", "PRACTICAL THINKING BIAS", "SYSTEMS JUDGMENT BIAS");
          var studentSe1_0Spans = studentSe1_0.selectAll('span').data(se1_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-se-0");
          var studentSe1_0SpansVals = studentSe1_0Spans.append('div').attr('class', 'sd-content-p')
          studentSe1_0SpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-se")
          studentSe1_0SpansVals.append('p').text(function(d) { return d[2]; })
          .attr("class", "sd-sub sde-se-sub")
          studentSe1_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-se-0");

          // se 1.1
          var studentSe1_1 = d3.select('div.sde-se-1');
          var se1_1 = setSdSectionData("SOCIAL-EMOTIONAL-1", "SENSE OF SELF", "ROLE AWARENESS", "SELF DIRECTION");
          var se1_1Biases = setSdSectionData("SENSE OF SELF BIAS", "ROLE AWARENESS BIAS", "SELF DIRECTION BIAS");
          var studentSe1_1Spans = studentSe1_1.selectAll('span').data(se1_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-se-1");
          var studentSe1_1SpansVals = studentSe1_1Spans.append('div').attr('class', 'sd-content-p')
          studentSe1_1SpansVals.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-se")
          studentSe1_1SpansVals.append('p').text(function(d) { return d[2]; })
          .attr("class", "sd-sub sde-se-sub")
          studentSe1_1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-se-1");

          // row 4 - sed 1.0
          var studentSed1_0 = d3.select('div.sde-sed-0');
          var sed1_0 = setSdSectionData(null, "ATTEND", "PREPARING");
          var studentSed1_0Spans = studentSed1_0.selectAll('span').data(sed1_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed");
          studentSed1_0Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-sed")
          studentSed1_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-sed-0");

          // row 4 - sed 1.1
          var studentSed1_1 = d3.select('div.sde-sed-1');
          var sed1_1Calc = setSdSectionData(null, "TOO MANY TESTS", "TOO MUCH HOMEWORK", "MANAGING MY TIME", "SOCIAL LIFE/FRIENDS", "TOO MANY RULES", "BEING COMPARED TO OTHERS", "BULLYING/ MEAN PEERS", "GETTING GOOD GRADES", "APPLYING FOR COLLEGE");
          var sed1_1Calc2 = sed1_1Calc.filter(function(e,i) { return e; })
          var sed1_1Calc3 = "";

          for (var i = 0; i < sed1_1Calc2.length; i++) {
            if (sed1_1Calc2[i][1] !== "---") {
              if (i === sed1_1Calc2.length - 1) {
                sed1_1Calc3 += sed1_1Calc2[i][0];
              } else {
                sed1_1Calc3 += sed1_1Calc2[i][0] + ", "
              }
            }
          }
          if (sed1_1Calc3 === "") sed1_1Calc3 = "---";

          var sed1_1 = [['School Stressors', sed1_1Calc3]];
          var studentSed1_1Spans = studentSed1_1.selectAll('span').data(sed1_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed");
          studentSed1_1Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-sed")
          studentSed1_1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-sed-1");

          // row 4 - sed 1.2
          var studentSed1_2 = d3.select('div.sde-sed-2');
          var sed1_2 = setSdSectionData(null, "OTHERSTRESS");
          var studentSed1_2Spans = studentSed1_2.selectAll('span').data(sed1_2, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed");
          studentSed1_2Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-sed")
          studentSed1_2Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-sed-2");

          resolve();
          // Use D3 to append data to appropriate fields in student detail popup

        }

        if (controlOption === "studentData") {
          createDashboard(inputObject.data, inputObject.schoolName)
          resolve();
        } else if (controlOption === "studentDetails") {
          loadStudentDetails(inputObject.columnHeaders, inputObject.currentStudentData, inputObject.metaData);
          resolve();
        }

      })
    },

    getStoredSchools: function() {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'GET',
          url: '/api/dashboard-collections'
        }).then(function(collections) {
          resolve(collections)
        }).catch(function(error) {
          reject(error);
        })
      })
    },

    getStoredDashboardData: function(schoolCode, version, id) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'POST',
          url: '/api/dashboard-data',
          data: { schoolCode: schoolCode, version: version, id: id }
        }).then(function(data) {
          resolve(data.data);
        }).catch(function(err) {
          console.log(err);
        })
      })
    },
  }
}])
