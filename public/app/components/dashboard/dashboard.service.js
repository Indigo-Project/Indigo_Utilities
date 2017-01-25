app.factory('DashboardService', ['$compile', '$http', '$rootScope', 'RWD', function($compile, $http, $rootScope, RWD) {

  return {

    retrieveSchoolNameOptions: function() {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'GET',
          url: '/dashboard/retrieve-school-name-options',
        }).then(function(data) {
          if (data) resolve(data);
        }).catch(function(error) {
          console.log(error);
        })
      })
    },

    retrieveSchoolsWithDashboards: function() {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'GET',
          url: '/dashboard/retrieve-school-dashboard-collections'
        }).then(function(collections) {
          resolve(collections)
        }).catch(function(error) {
          reject(error);
        })
      })
    },

    createDashboardVersionDataObject: function(loadedFiles, schoolCode, dashboardVersionName) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'POST',
          url: '/dashboard/create-dashboard-data-object',
          data: { inputFiles: loadedFiles, schoolCode: schoolCode, dashboardVersionName: dashboardVersionName }
        }).then(function(data) {
          if (data) resolve(data);
        }).catch(function(error) {
          console.log(error);
        })
      })
    },

    retrieveStoredDashboardVersionDataObject: function(schoolCode, version, id) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'POST',
          url: '/dashboard/retreive-stored-dashboard-data-object',
          data: { schoolCode: schoolCode, version: version, id: id }
        }).then(function(data) {
          resolve(data.data);
        }).catch(function(err) {
          console.log(err);
        })
      })
    },

    generateD3Dashboard: function(inputObject, controlOption) {
      return new Promise(function(resolve, reject) {

        function createDashboard(data, schoolName) {

          // Global Vars
          var studentSelections, classSelections, genderSelections, dashData, sdCHs, dataKeys, studentClasses, dashValCHs, dashboardCHs, dashValsIndex, sortAscending, table, tablebody, titles, columnColorIndex, noData, searchReturn;
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
            tableBodyAvgs = table.append('tbody').attr('class', 'student-data-averages');
            titles = d3.values(dashboardCHs);

            columnColorIndex = ["rgba(255,255,255,", "rgba(255,255,255,", "rgba(255,255,255,", "rgba(255, 52, 52,", "rgba(250, 238, 74,", "rgba(41, 218, 32,", "rgba(96, 112, 255,", "rgba(128, 0, 127,", "rgba(128, 0, 127,", "rgba(128, 0, 127,", "rgba(128, 0, 127,", "rgba(128, 0, 127,", "rgba(128, 0, 127,"];
            // columnColorIndex = ["rgba(255,255,255,", "rgba(255,255,255,", "rgba(255,255,255,", "rgba(255, 52, 52,", "rgba(250, 238, 74,", "rgba(41, 218, 32,", "rgba(96, 112, 255,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,"];
          }

          function resetFiltersStaticSetup() {
            var resetFilterCTA = d3.select('p.reset-filters-cta');

            resetFilterCTA.on('click', function() {

              var searchBar = d3.select('input.search-bar');
              searchBar._groups[0][0].value = "";

              var noDataContainer = d3.select('div.dashboard-no-data-display');
              noDataContainer ? noDataContainer.remove() : null;

              unselectFilters();
              setupFilters(dashData, [[],[],[]], true);
              generateTable(dashData, 'filterReset');

              noData = false;
            });



          }

          // Dashboard Filters Setup
          // Setting and updating available filter options
          function setupFilters(data, filtersApplied, init) {

            // console.log('setupFilters', data, filtersApplied);

            // Student Filter
            function studentFilterSetup(data) {

              // for all checked students, if filtered data conflicts, keep checked student names within student filter options
              if (studentSelections.length) {
                for (var i = 0; i < studentSelections.length; i++) {
                  var notInFilteredData = true;
                  for (var j = 0; j < data.length; j++) {
                    if (data[j][0] === studentSelections[i]) {
                      notInFilteredData = false;
                    }
                  }
                  if (notInFilteredData) {
                    for (var j = 0; j < dashData.length; j++) {
                      if (studentSelections[i] === dashData[j][0]) {
                        // console.log(dashData[j]);
                        data.unshift(dashData[j]);
                      }
                    }
                  }
                }
              }

              var studentFilter = d3.select('div.student-filter-options')
              var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { return d })
              var studentFilterLabelsInner = studentFilterLabels.enter().append('label').attr('class', 'filter-label');
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

              var genderFilter = d3.select('div.gender-filter-options')
              var genderFilterLabels = genderFilter.selectAll('label').data(['Male', 'Female']).enter().append('label').attr('class', 'filter-label');
              genderFilterLabels.append('input').attr('type', 'checkbox');
              genderFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();

              // Apply change event to inputs
              var genderFilterInputs = genderFilter.selectAll('label > input')
              genderFilterInputs.on("change", function(data,i,arr) {

                var noDataContainer = d3.select('div.dashboard-no-data-display');
                if (noData) {
                  noDataContainer.remove();
                  noData = false;
                }

                var value = data;
                var action = this.checked ? "add" : "remove";
                applyFilters(action, "gender", value)
              })

            }

            // Class Filter
            function classFilterSetup(data) {

              var classFilter = d3.select('div.class-filter-options')
              var classFilterLabels = classFilter.selectAll('label').data(studentClasses).enter().append('label').attr('class', 'filter-label');
              classFilterLabels.append('input').attr('type', 'checkbox');
              classFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();

              // Apply change event to inputs
              var classFilterInputs = classFilter.selectAll('label > input')
              classFilterInputs.on("change", function(data,i,arr) {

                var noDataContainer = d3.select('div.dashboard-no-data-display');
                if (noData) {
                  noDataContainer.remove();
                  noData = false;
                }

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
          }

          // Unselect all filters
          // Uncheck all checked boxes, and empty global filter selection objects
          function unselectFilters() {


            var genderFilters = d3.select('div.gender-filter-options').selectAll('input')
            .attr('checked', function(d,i,a) { return a[i].checked = false; })
            genderSelections = [];

            var classFilters = d3.select('div.class-filter-options').selectAll('input')
            .attr('checked', function(d,i,a) { return a[i].checked = false; })
            classSelections = [];

            var studentFilters = d3.select('div.student-filter-options').selectAll('input')
            .attr('checked', function(d,i,a) { return a[i].checked = false; })
            studentSelections = [];

          }

          // Populate rows with data, based on student data object index references
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
                    rowObj.sort(function(a, b) {
                      return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i)
                    });
                    sortAscending = false;
                    this.className = 'student-data header des';
                  } else {
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
                    // console.log('Ascending');
                    tableBody.selectAll('tr')
                    .sort(function(a, b) {
                      return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i)
                    });
                    sortAscending = false;
                    this.className = 'student-data header des';
                  } else {
                    // console.log('Descending');
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

              function appendAveragesRows(currentPopulationData, status) {

                // Build compiled population object (student averages row data)
                var currentPopulationRowData = [];
                for (var i = 3; i < dashValsIndex.length; i++) {
                  var currValueSum = 0;
                  for (var j = 0; j < currentPopulationData.length; j++) {
                    currValueSum += Number(currentPopulationData[j][dashValsIndex[i]]);
                  }
                  currAvgValue = (currValueSum/currentPopulationData.length).toFixed(1);
                  currAvgValue === 'NaN' ? currAvgValue = 0 : null;
                  currentPopulationRowData[i-3] = currAvgValue;
                }
                currentPopulationRowData.unshift('Current Population Averages (' + currentPopulationData.length.toString() + ' students):');

                if (status === 'init') {

                  // Build corporate adult averages object (caa row data)
                  var adultAveragesRowData = ['Corporate Adult Averages:', '43.0', '58.7', '60.7', '50.5', '6.0', '5.3', '4.3', '4.2', '5.5', '4.7'];

                  // Populate current population averages row with data
                  var currentPopulationAverages = tableBodyAvgs.append('tr').attr('class', 'current-population-averages')
                  currentPopulationAverages.selectAll('td').data(currentPopulationRowData, function(d) { return d; }).enter()
                  .append('td').attr('class', 'current-population-averages stat-cell')
                  .text(function(d) {
                    return d;
                  })
                  .style('color', function(d, i) {
                    return i > 0 ? i === 2 ? "rgb(245, 255, 48)": columnColorIndex[i+2] + "1)" : "rgba(255,255,255)";
                  }).exit().remove();

                  // Populate corporate adult averages row with data
                  var adultAverages = tableBodyAvgs.append('tr').attr('class', 'adult-averages')
                  adultAverages.selectAll('td').data(adultAveragesRowData, function(d) { return d; }).enter()
                  .append('td').attr('class', 'corporate-adult-averages stat-cell')
                  .text(function(d) {
                    return d;
                  })

                  currentPopulationAverages.exit().remove();
                  adultAverages.exit().remove();

                } else if (status === 'update') {

                  // Populate current population averages row with data
                  // var currentPopulationAverages = tableBodyAvgs.select('tr.current-population-averages').data(currentPopulationRowData, function(d) { return d; })
                  var currentPopulationAveragesRow = tableBodyAvgs.select('tr.current-population-averages')
                  var currentPopulationAveragesCells = currentPopulationAveragesRow.selectAll('td.current-population-averages').data(currentPopulationRowData, function(d) { return d; })
                  currentPopulationAveragesCells.enter()
                  .append('td').attr('class', 'current-population-averages stat-cell')
                  .text(function(d, i, a) {
                    return d;
                  })
                  .style('color', function(d, i) {
                    return i > 0 ? i === 2 ? "rgb(245, 255, 48)": columnColorIndex[i+2] + "1)" : "rgba(255,255,255)";
                  }).exit().remove();

                  currentPopulationAveragesCells.exit().remove();

                  // Populate corporate adult averages row with data
                  // var adultAverages = tableBodyAvgs.append('tr').attr('class', 'adult-averages')
                  // adultAverages.selectAll('td').data(adultAveragesRowData, function(d) { return d; }).enter()
                  // .append('td').attr('class', 'corporate-adult-averages stat-cell')
                  // .text(function(d) {
                  //   return d;
                  // })

                }

              }

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
                  var motivOpacityCalc = (((Number(d.value) * 4.5) / 10) + 2) / 10;
                  var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
                  var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
                  return cellColor + opacity + ")";
                })

                appendAveragesRows(rowData, 'init');

                $compile($('table.student-data tbody td:nth-of-type(1)'))(angular.element('dashboard').scope());
                RWD.responsiveAdaptationDashboard();
                rowObj.exit().remove();

              } else if (status === 'noData') {

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

                  var searchBar = d3.select('input.search-bar');
                  searchBar._groups[0][0].value = "";

                  noDataContainer.remove();

                  unselectFilters();
                  setupFilters(dashData, [[],[],[]], true);
                  generateTable(dashData, 'filterReset');

                  noData = false;

                })

                noData = true;

                appendAveragesRows(rowData, 'update');

                RWD.responsiveAdaptationDashboard();

              } else if (status === 'update') {

                rowObj.enter().append('tr').attr('class', 'student-data')
                .attr('row-index', function(d, i) {
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

                appendAveragesRows(rowData, 'update');

                RWD.responsiveAdaptationDashboard();

                $compile($('table.student-data tbody td:nth-of-type(1)'))(angular.element('dashboard').scope());
                rowObj.exit().remove();

              }
            }

            if (status === 'init') {

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d }).enter().append('tr').attr('class', 'student-data');

              setupHeaders('init');
              return setupRows('init');

            } else if (status === 'update') {

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

              setupHeaders('reinitialize');
              return setupRows('update');

            } else if (status === 'noData') {

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

                var filteredData = dashData;

                // Update filtered data object with student filter
                if (studentSelections.length) {
                  for (var i = 0; i < studentSelections.length; i++) {
                    var matchedFilters = [false, null];
                    for (var j = 0; j < dashData.length; j++) {
                      if (studentSelections[i] === dashData[j][0]) {
                        matchedFilters = [true, j];
                        break;
                      }
                    }
                  }
                  filteredData = dashData.filter(function(d,i) { return studentSelections.includes(d[0]) });
                }

                // Update filtered data object with class filter
                if (classSelections.length) {
                  filteredData = filteredData.filter(function(d,i) { return classSelections.includes(d[4]) });
                }

                // Update filtered data object with gender filter
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

                var filtersApplied = [classSelections, genderSelections, studentSelections];

                if (filteredData && filtersApplied) resolve({ filteredData: filteredData, filtersApplied: filtersApplied });

              })
            }

            updateGlobalFilterObjects()
            .then(function() {
              createFilteredDataSetObject()
              .then(function(data) {

                if (!data.filteredData.length) {
                  generateTable(data.filteredData, 'noData')
                  setupFilters(dashData, data.filtersApplied, false);
                } else {
                  if (noData) {
                    var noDataContainer = d3.select('div.dashboard-no-data-display');
                    noDataContainer.remove()
                    generateTable(data.filteredData, 'update');
                    noData = false;
                  } else {
                    // console.log(data.filtersApplied);
                    generateTable(data.filteredData, 'update');
                    setupFilters(dashData, data.filtersApplied, false);
                  }
                }

              })
            });
          }

          // Search Bar Functionality
          function searchBarInit() {

            d3.select('input.search-bar')
            .on("keyup", function() {
              // var searchedData = dashData;
              var text = this.value.trim();

              var searchResults = dashData.map(function(e) {
                var regex = new RegExp(text + ".*", "i");
                if (regex.test(e[0])) {
                  return regex.exec(e[0])[0]
                }
              })

              var searchResultIndices = [];
              for (var i = 0; i < searchResults.length; i++) {
                if (searchResults[i]) searchResultIndices.push(i);
              }

              searchReturn = [];
              for (var i = 0; i < searchResultIndices.length; i++) {
                searchReturn.push(dashData[searchResultIndices[i]]);
              }

              setupFilters(searchReturn, [classSelections,genderSelections,studentSelections]);

            })
          }

          // Initialization Function
          function dashboardInitialization() {
            setDashboardGlobalVars();
            setupFilters(dashData, [[],[],[]], true);
            searchBarInit();
            resetFiltersStaticSetup();
            generateTable(dashData, 'init');
          }

          // Execution of Initialization Setup
          return dashboardInitialization();

        }

        function loadStudentDetails(columnHeaders, studentData, metaData) {

          // Global Variable Initialization
          var sDDataObject, adultAverages, sectionLabels, conversionObj;
          function setSDGlobalVars() {

            // Student Details data object setup
            sDDataObject = {};
            for (var i = 0; i < columnHeaders.length; i++) {
              sDDataObject[columnHeaders[i]] = { index: "", value: "" };
              sDDataObject[columnHeaders[i]].index = i;
              sDDataObject[columnHeaders[i]].value = !studentData[i] || studentData[i] === "Please Select" || studentData[i] === "-" ? "---" : studentData[i];
              sDDataObject[columnHeaders[i]].key = columnHeaders[i];
              sDDataObject[columnHeaders[i]].label = columnHeaders[i].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            }

            // Adult Averages Object
            adultAverages = {
              "DISC": ['43.0', '58.7', '60.7', '50.5'],
              "MOTIVATORS NAMES": ["TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA"],
              "MOTIVATORS": ['6.0', '5.3', '4.3', '4.2', '5.5', '4.7'],
              "HD-SKILLS": ['6.9', '5.3', '6.7', '5.0', '7.3', '7.2', '6.0', '4.1', '6.6', '7.3', '2.3', '7.2', '7.3', '6.0', '4.4', '7.0', '5.2', '5.5', '5.3', '7.2', '7.2', '7.2', '6.8', '7.9', '5.7'],
              "DNA-SKILLS": ['4.7', '5.2', '6.1', '4.8', '6.3', '4.0', '5.9', '3.6', '6.8', '4.5', '2.8', '6.8', '6.8', '6.1', '5.7', '3.8', '5.5', '5.5', '4.8', '6.1', '4.4', '6.3', '5.4'],
              "SOCIAL-EMOTIONAL-1": ['8.1', '8.0', '7.8'],
              "SOCIAL-EMOTIONAL-2": ['7.2', '7.1', '6.8']
            };

            // Section Labels Object (correspond to order of adultAverages arrays)
            sectionLabels = {
              "HD-SKILLS ": ["CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION"],
              "DNA-SKILLS": ["ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION"],
            };

            // Converts data object raw labels to presentable labels
            conversionObj = {
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

          }
          setSDGlobalVars();

          // Set Student Details Section Data
          function setSdSectionData(subValCategory) {

            // Define subValCategoryTemp and remove subValCategory from arguments array
            var subValCategoryTemp = subValCategory;
            Array.prototype.shift.apply(arguments);

            // Sort order transformation functions
            function applySortOptionsTransformer(returnArr) {

              var sortOptionsFunctionKey = {
                formatToColumnOrder: function (object, format) {
                  if (format === 'MOTIVATORS') {
                    return ([object[0], object[2], object[4], object[1], object[3], object[5]]);
                  } else if (format === 'HD-SKILLS') {
                    return object;
                  } else if (format === 'DNA-SKILLS') {
                    return object;
                  }
                },
                'highest-lowest': function(object, instrumentType) {

                  var sortedObject = object.sort(function(a,b) {
                    return Number(b[1]) - Number(a[1]);
                  })

                  return instrumentType ? this.formatToColumnOrder(sortedObject, instrumentType) : sortedObject;
                },
                'alphabetical': function(object, instrumentType) {
                  console.log('alphabetical');

                  var sortedObject = object.sort(function(a,b) {
                    return a[0] > b[0] ? 1 : -1;
                  })

                  return instrumentType ? this.formatToColumnOrder(sortedObject, instrumentType) : sortedObject;

                },
                'distance-from-adult-avg': function(object, instrumentType) {
                  console.log('distance-from-adult-avg');

                  var sortedObject = object.sort(function(a,b) {

                    // console.log('a:', a[0], a[1], a[2], Math.abs(a[1] - a[2] || 0 ));
                    // console.log('b:', b[0], b[1], bIndex, b[2], Math.abs(b[1] - b[2] || 0 ));
                    // console.log(Math.abs(a[1] - a[2] || 0 ) > Math.abs(b[1] - b[2] || 0 ));

                    return (Math.abs(a[1] - a[2]) > Math.abs(b[1] - b[2])) ? -1 : 1;
                  })
                  // console.log(sortedObject);

                  return instrumentType ? this.formatToColumnOrder(sortedObject, instrumentType) : sortedObject;

                },
                'relation-to-adult-avg': function(object, instrumentType) {
                  console.log('relation-to-adult-avg');

                  var sortedObject = object.sort(function(a,b) {

                    // console.log('a:', a[0], a[1], a[2], Math.abs(a[1] - a[2] || 0 ));
                    // console.log('b:', b[0], b[1], bIndex, b[2], Math.abs(b[1] - b[2] || 0 ));
                    // console.log(Math.abs(a[1] - a[2] || 0 ) > Math.abs(b[1] - b[2] || 0 ));

                    return (a[1] - a[2]) > (b[1] - b[2]) ? -1 : 1;
                  })
                  // console.log(sortedObject);

                  return instrumentType ? this.formatToColumnOrder(sortedObject, instrumentType) : sortedObject;

                },
                'distance-from-school-avg': function(object) {
                  console.log('distance-from-school-avg');

                }
              }

              if (subValCategoryTemp === 'MOTIVATORS') {

                var sortSelectOption = d3.select('select.motivators-sort-dropdown')._groups[0][0].value;
                return sortOptionsFunctionKey[sortSelectOption](returnArr, 'MOTIVATORS');

              } else if (subValCategoryTemp === 'HD-SKILLS') {

                var sortSelectOption = d3.select('select.skills-sort-dropdown')._groups[0][0].value;
                return sortOptionsFunctionKey[sortSelectOption](returnArr, 'HD-SKILLS');

              } else if (subValCategoryTemp === 'DNA-SKILLS') {

                var sortSelectOption = d3.select('select.skills-sort-dropdown')._groups[0][0].value;
                return sortOptionsFunctionKey[sortSelectOption](returnArr, 'DNA-SKILLS');

              } else {

                return returnArr;

              }

            }

            // Set sub values object for current section data set
            var subValArr;
            function setSubValArray () {
              if (subValCategoryTemp === 'DISC') {
                subValArr = [ sDDataObject['D ADAPTED (%)'].value, sDDataObject['I ADAPTED (%)'].value, sDDataObject['S ADAPTED (%)'].value, sDDataObject['C ADAPTED (%)'].value ]
              } else if (subValCategoryTemp === 'SOCIAL-EMOTIONAL-0') {
                subValArr = [ sDDataObject['UNDERSTANDING OTHERS BIAS'].value, sDDataObject['PRACTICAL THINKING BIAS'].value, sDDataObject['SYSTEMS JUDGMENT BIAS'].value ];
              } else if (subValCategoryTemp === 'SOCIAL-EMOTIONAL-1') {
                subValArr = [ sDDataObject['SENSE OF SELF BIAS'].value, sDDataObject['ROLE AWARENESS BIAS'].value, sDDataObject['SELF DIRECTION BIAS'].value ];
              } else {
                subValArr = adultAverages[subValCategoryTemp];
              }
            }
            setSubValArray();

            var returnArr = [];
            var conversionObjKeys = Object.keys(conversionObj);

            for (var i = 0; i < arguments.length; i++) {
              var pushVal;
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

            return subValCategoryTemp ? applySortOptionsTransformer(returnArr) : returnArr;

          }


          // ROW 1 *****

          // Student Name
          function setStudentName() {
            var studentName = d3.select('h3.sde-name');
            studentName.text(sDDataObject['FULL NAME'].value)
            .attr("class", "sde-name");
          }
          setStudentName();

          // Header Demographics
          function setHeaderDemographics() {
            var studentDems1 = d3.select('div.sde-dems1');
            var dems1 = setSdSectionData(null, "YEAR BORN", "CLASS", "GENDER", "ETHNICITY", "SCHOOL YEAR")
            var studentDems1Spans = studentDems1.selectAll('span').data(dems1, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-dems1");
            studentDems1Spans.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-dems1")
            studentDems1Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-dems1");
          }
          setHeaderDemographics();


          // ROW 2 *****

          // Academic & Career Profile
          // Demographics 2.0
          function setDems2_0() {
            var studentDems2_0 = d3.select('div.sde-dems2-0');
            var dems2_0 = setSdSectionData(null, "ENGLISH GRADES", "MATH GRADES", "SCIENCE GRADES");
            var studentDems2_0Spans = studentDems2_0.selectAll('span').data(dems2_0, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-dems2");
            var studentDems2_0SpansVals = studentDems2_0Spans.append('div').attr("class", "sd-content-p");
            studentDems2_0SpansVals.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-dems2")
            studentDems2_0Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-dems2");
          };
          setDems2_0();

          // Demographics 2.1
          function setDems2_1() {
            var studentDems2_1 = d3.select('div.sde-dems2-1');
            var dems2_1 = setSdSectionData(null, "GPA", "PARENTCOLLEGE", "PAYING JOB");
            var studentDems2_1Spans = studentDems2_1.selectAll('span').data(dems2_1, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-dems2");
            var studentDems2_1SpansVals = studentDems2_1Spans.append('div').attr("class", "sd-content-p");
            studentDems2_1SpansVals.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-dems2")
            studentDems2_1Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-dems2");
          }
          setDems2_1();

          // Demographics 2.2
          function setDems2_2() {
            var studentDems2_2 = d3.select('div.sde-dems2-2');
            var dems2_2 = setSdSectionData(null, "MAJOR", "JOBS ENJOYED", "JOBS NOT REWARDING");
            var studentDems2_2Spans = studentDems2_2.selectAll('span').data(dems2_2, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-dems2");
            var studentDems2_2SpansVals = studentDems2_2Spans.append('div').attr("class", "sd-content-p");
            studentDems2_2SpansVals.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-dems2")
            studentDems2_2Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-dems2");
          }
          setDems2_2();


          // ROW 3 *****

          // Disc
          function setDisc() {
            var studentDiscVals = d3.select('div.sde-disc-content');
            var discVals = setSdSectionData("DISC", "D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)");
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
          }
          setDisc();

          // Motivators
          function setMotivators() {
            var studentMotivatorVals = d3.select('div.sde-motivators-content');
            var motivatorVals = setSdSectionData("MOTIVATORS", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA");

            // if motivator value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < motivatorVals.length; i++) {
              if (motivatorVals[i][1].length === 1) {
                motivatorVals[i][1] += ".0";
              }
            }

            var studentMotivatorValsSpans = studentMotivatorVals.selectAll('span').data(motivatorVals, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-motivators");

            var studentMotivatorSpansVals = studentMotivatorValsSpans.append('div').attr("class", "sd-content-p");
            studentMotivatorSpansVals.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-motivators");
            studentMotivatorSpansVals.append('p').text(function(d) { return d[2]; })
            .attr("class", "sd-sub sde-motivators-sub");

            studentMotivatorValsSpans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-motivators");

            studentMotivatorValsSpans.exit().remove();

            var sortSelectOption = d3.select('select.motivators-sort-dropdown');
            sortSelectOption.on('change', function() {
              console.log(sortSelectOption._groups[0][0].value);
              updateMotivators();
            })

          }
          function updateMotivators() {
            var studentMotivatorVals = d3.select('div.sde-motivators-content');
            var motivatorVals = setSdSectionData("MOTIVATORS", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA");

            // if motivator value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < motivatorVals.length; i++) {
              if (motivatorVals[i][1].length === 1) {
                motivatorVals[i][1] += ".0";
              }
            }

            var studentMotivatorValsSpans = studentMotivatorVals.selectAll('span.sde-motivators').data(motivatorVals, function(d) { return d; })
            studentMotivatorValsSpans.order()
            studentMotivatorValsSpans.enter();
            studentMotivatorValsSpans.exit().remove();

            RWD.responsiveAdaptationStudentDetails();

          }
          setMotivators();

          // Skills
          function setSkills() {
            var studentSkillsVals = d3.select('div.sde-skills-content');
            var skillsOption = metaData.skillsOption;
            var skillsVals = skillsOption === 'DNA' ? setSdSectionData("DNA-SKILLS", "ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION") : setSdSectionData("HD-SKILLS", "CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION");

            // if skill value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < skillsVals.length; i++) {
              if (skillsVals[i][1].length === 1) {
                skillsVals[i][1] += ".0";
              }
            }

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

            var sortSelectOption = d3.select('select.skills-sort-dropdown');
            sortSelectOption.on('change', function() {
              console.log(sortSelectOption._groups[0][0].value);
              updateSkills();
            })

          }
          function updateSkills() {
            var studentSkillsVals = d3.select('div.sde-skills-content');
            var skillsOption = metaData.skillsOption;
            var skillsVals = skillsOption === 'DNA' ? setSdSectionData("DNA-SKILLS", "ANALYTICAL PROBLEM SOLVING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY/INNOVATION", "CUSTOMER SERVICE", "DECISION MAKING", "DIPLOMACY", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ORIENTATION", "INTERPERSONAL SKILLS", "LEADERSHIP", "MANAGEMENT", "NEGOTIATION", "PERSONAL EFFECTIVENESS", "PERSUASION", "PLANNING/ORGANIZING", "PRESENTING", "SELF-MANAGEMENT (TIME AND PRIORITIES)", "TEAMWORK", "WRITTEN COMMUNICATION") : setSdSectionData("HD-SKILLS", "CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CREATIVITY", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION");

            // if skill value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < skillsVals.length; i++) {
              if (skillsVals[i][1].length === 1) {
                skillsVals[i][1] += ".0";
              }
            }

            var studentSkillsValsSpans = studentSkillsVals.selectAll('span.sde-skills').data(skillsVals, function(d) { return d; })
            studentSkillsValsSpans.order()
            studentSkillsValsSpans.enter();
            studentSkillsValsSpans.exit().remove();

            RWD.responsiveAdaptationStudentDetails();
          }
          setSkills();


          // ROW 4 *****

          // SE 1.0
          function setSE1_0() {
            var studentSe1_0 = d3.select('div.sde-se-0');
            var se1_0 = setSdSectionData("SOCIAL-EMOTIONAL-0", "UNDERSTANDING OTHERS", "PRACTICAL THINKING", "SYSTEMS JUDGMENT");

            // if se value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < se1_0.length; i++) {
              if (se1_0[i][1].length === 1) {
                se1_0[i][1] += ".0";
              }
            }

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
          }
          setSE1_0();

          // SE 1.1
          function setSE1_1() {
            var studentSe1_1 = d3.select('div.sde-se-1');
            var se1_1 = setSdSectionData("SOCIAL-EMOTIONAL-1", "SENSE OF SELF", "ROLE AWARENESS", "SELF DIRECTION");

            // if se value is 1 digit in length (whole number), add .0 decimal
            for (var i = 0; i < se1_1.length; i++) {
              if (se1_1[i][1].length === 1) {
                se1_1[i][1] += ".0";
              }
            }

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
          }
          setSE1_1();

          // SED 1.0
          function setSED1_0() {
            var studentSed1_0 = d3.select('div.sde-sed-0');
            var sed1_0 = setSdSectionData(null, "ATTEND", "PREPARING");
            var studentSed1_0Spans = studentSed1_0.selectAll('span').data(sed1_0, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-sed");
            studentSed1_0Spans.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-sed")
            studentSed1_0Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-sed-0");
          }
          setSED1_0();

          // sed 1.1
          function setSED1_1() {
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
          }
          setSED1_1();

          // sed 1.2
          function setSED1_2() {
            var studentSed1_2 = d3.select('div.sde-sed-2');
            var sed1_2 = setSdSectionData(null, "OTHERSTRESS");
            var studentSed1_2Spans = studentSed1_2.selectAll('span').data(sed1_2, function(d) { return d; }).enter().append('span')
            .attr("class", "sd-span sde-sed");
            studentSed1_2Spans.append('p').text(function(d) { return d[1]; })
            .attr("class", "sd-val sde-sed")
            studentSed1_2Spans.append('label').text(function(d) { return d[0]; })
            .attr("class", "sd-label sde-sed-2");
          }
          setSED1_2();


          resolve();

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

  }
}])
