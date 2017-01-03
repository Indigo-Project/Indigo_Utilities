app.factory('Main_Service', ['$state', function($state) {

  return {
    accessFunction: function(selectedFunction) {
      if (selectedFunction === "pbi_pfmt") {
        $state.go("pbi_pfmt");
      } else if (selectedFunction === "blue_list") {
        $state.go("blue_list");
      } else if (selectedFunction === "ent_list") {
        $state.go("ent_list");
      } else if (selectedFunction === "tti_massdl") {
        $state.go("tti_massdl");
      } else if (selectedFunction === "sum_page") {
        $state.go("sum_page");
      } else if (selectedFunction === "sum_stats") {
        $state.go("sum_stats");
      } else if (selectedFunction === "dashboard_gen") {
        $state.go("dashboard_gen");
      } else if (selectedFunction === "dashboard_manager"){
        $state.go("dashboard_manager");
      } else if (selectedFunction === "default"){
        $state.go("default");
      }
    }
  }
}])

app.factory('Responsive_WD_Service', ['$state', function($state) {
  return {
    calculateBaseDimensions: function(doc) {
      var baseDimensions = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        screenAvailWidth: window.screen.availWidth,
        screenAvailHeight: window.screen.availHeight,
        browserWidth: window.outerWidth,
        browserHeight: window.outerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight,
        documentWidth: doc.width(),
        documentHeight: doc.height()
      }
      return baseDimensions;
    }
  }
}])

app.factory('TTI_API', ['$state', '$http', 'FileSaver', 'Blob', function($state, $http, FileSaver, Blob) {

  return {

    validateLocalDir: function(dirPath) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-local-dir",
          data: { localDir: dirPath }
        }).then(function(data) {
          console.log(data);
          resolve(data);
        }).catch(function(error) {
          console.log('vdrErr:', error);
        })
      })
    },

    validateRequestData: function(login, password, accountID, linkID, reportTypeFilter, mode, currentLinkReportList) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-tti-request",
          data: { login: login, password: password, accountID: accountID, linkID: linkID, reportTypeFilter: reportTypeFilter, mode: mode, currentLinkReportList: currentLinkReportList }
        }).then(function(data) {
          console.log(data);
          resolve(data);
        }).catch(function(error) {
          console.log(error);
          reject(error);
        })
      })
    },

    batchDownload: function(login, password, accountID, linkID, reportList, reportTypes) {
      console.log('1');
      return new Promise(function(resolve, reject) {

        function postToServer(processStatus, nextSegmentIndex, distReportArrC, dlCount, numOfSegments, dupNumber, login_, password_, accountID_, linkID_, reportList_, reportTypes_) {
          console.log('2');
          return new Promise(function(resolve, reject) {
            $http({
              method: "POST",
              url: "/api/batch-download",
              data: { processStatus: processStatus, currentSegmentIndex: nextSegmentIndex, distReportArrC: distReportArrC, dlCount: dlCount, numOfSegments: numOfSegments, dupNumber: dupNumber, login: login_, password: password_, accountID: accountID_, linkID: linkID_, reportList: reportList_, reportTypes: reportTypes_ }
            }).then(function(data1) {
              console.log('HTTP REQUEST RESPONDED');
              resolve(data1);
            }).catch(function(error) {
              console.log(error);
              reject(error);
            })
          }).then(function(data2) {
            console.log(data2);
            if (data2.data.processStatus === "finished") {
              console.log('archive and download reports');
              $http({
                method: "POST",
                url: "/api/dl-to-client",
                data: { dataPath: data2.data.dataPath },
                responseType: 'arraybuffer'
              }).then(function(data3) {
                console.log(data3);
                var dateTmp = new Date();
                var dateObj = dateTmp.getMonth() + "-" + dateTmp.getDate() + "-" + dateTmp.getFullYear() + "_" + dateTmp.getHours() + "h" + dateTmp.getMinutes() + "m";
                var blob = new Blob([data3.data], { type: "application/zip" });
                var fileName = "assessments_" + dateObj + ".zip";
                FileSaver.saveAs(blob, fileName);
                console.log(data2);
                resolve(data2);
              }).catch(function(error) {
                console.log(error);
              })
            } else if (data2.data.processStatus === "midCycle") {
              console.log('run postToServer with New Data');
              postToServer(data2.data.processStatus, data2.data.prevSegmentIndex + 1, data2.data.distReportArr, data2.data.dlCount, data2.data.numOfSegments, data2.data.dupNumber, login, password, accountID, linkID, reportList, reportTypes);
            } else if (data2.data.processStatus === "midZip") {
              console.log('run resumeZip');
              resumeZip()
            }
          }).catch(function(error) {
            console.log(error);
            reject(error);
          })
        }

        postToServer("fresh", 0, null, 0, 0, 0, login, password, accountID, linkID, reportList, reportTypes)
      })
    },

    sumPageDownload: function(login, password, accountID, linkID, directory, reportList, reportTypes) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/sumpage-download",
          data: { login: login, password: password, accountID: accountID, linkID: linkID, destination: directory, reportList: reportList, reportTypes: reportTypes }
        }).then(function(data) {
          if(data) {
            console.log(data);
            resolve(data);
          }
        }).catch(function(error) {
          console.log(error);
          if(error) {
            reject(error);
          }
        })
      })
    }
  }
}])

app.factory('DashboardService', ['$http', function($http) {

  return {

    iframeHtml: {
      template: "empty"
    },

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

    getDataObject: function(loadedFiles, schoolCode) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'POST',
          url: '/api/dashboard-gen',
          data: { inputFiles: loadedFiles, schoolCode: schoolCode }
        }).then(function(data) {
          if (data) resolve(data)
        }).catch(function(error) {
          console.log(error);
        })
      })
    },

    createDashboard: function(data, schoolName) {

      // Global Vars
      var studentSelections = [];
      var classSelections = [];
      var genderSelections = [];

      var dashData = data.compiledData.studentData;
      var sdCHs = data.compiledData.columnHeaders[0];
      var dataKeys = Object.keys(data)
      var studentClasses = [];

      for (var i = 0; i < dataKeys.length; i++) {
        if (dataKeys[i] !== "Staff" && dataKeys[i] !== "compiledData" && dataKeys[i] !== "metaData" && dataKeys[i] !== "_id") {
          studentClasses.push(dataKeys[i].substring(0,4))
        }
      }

      var dashValCHs = ["FULL NAME", "GENDER", "CLASS", "D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA"];
      var dashboardCHs = ["Students", "Gender", "Class", "Dominance", "Influencing", "Steadiness", "Compliance", "Theoretical", "Utilitarian", "Aesthetic", "Social", "Individualistic", "Traditional"];
      var dashValsIndex = [];

      for (var i = 0; i < sdCHs.length; i++) {
        for (var j = 0; j < dashValCHs.length; j++) {
          if(sdCHs[i] === dashValCHs[j]) {
            dashValsIndex.push(i);
          }
        }
      }

      var sortAscending = true;
      var table = d3.select('div.student-data-table').append('table').attr('class', 'student-data');
      var titles = d3.values(dashboardCHs);

      var columnColorIndex = ["rgba(255,255,255,", "rgba(255,255,255,", "rgba(255,255,255,", "rgba(255, 52, 52,", "rgba(250, 238, 74,", "rgba(41, 218, 32,", "rgba(96, 112, 255,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,"]

      // setup headers
      function setHeaders() {

        var rowObj = tableBody.selectAll('tr').data(dashData, function(d) { return d }).enter().append('tr');

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

        rowObj.exit().remove();

      }

      // setup filters
      function setFilters(data, filtersApplied) {

        if (filtersApplied[0].length || filtersApplied[1].length) {
          if (filtersApplied[0].length) {
            console.log('class filter applied');
            data = data.filter(function(e, i, a) {
              return filtersApplied[0].indexOf(e[4]) !== -1;
            })
          }
          if (filtersApplied[1].length) {
            console.log('gender filter applied');
            data = data.filter(function(e, i, a) {
              var gTransform = e[3] === 'M' ? 'Male' : 'Female';
              return filtersApplied[1].indexOf(gTransform) !== -1;
            })
          }

          console.log(studentSelections);
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
          console.log(data.length);
          // data.unshift([['Test Name']])

          var studentFilter = d3.select('div.student-filter')
          var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { console.log(d); return d; })
          var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
          studentFilterLabelsInner.append('input').attr('type', 'checkbox')
          studentFilterLabelsInner.append('p')
          .text(function(d) {
            console.log(d);
            return d[0];
          })
          studentFilterLabels.exit().remove();

          var studentFilterInputs = studentFilter.selectAll('label > input')
          studentFilterInputs.on("change", function(data,i,arr) {
            var value = data[0];
            var action = this.checked ? "add" : "remove";
            updateDashboard(action, "student", value)
          })

        } if (filtersApplied[2].length) {

          console.log('student filter applied');
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
          var studentFilter = d3.select('div.student-filter')
          var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) {
            // console.log(d[0]);
            return d;
          })
          var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
          studentFilterLabelsInner.append('input').attr('type', 'checkbox')
          studentFilterLabelsInner.append('p')
          .text(function(d) {
            // console.log(d);
            return d[0];
          })
          studentFilterLabels.exit().remove();
          // apply .on change event to inputs
          var studentFilterInputs = studentFilter.selectAll('label > input')
          studentFilterInputs.on("change", function(data,i,arr) {
            var value = data[0];
            var action = this.checked ? "add" : "remove";
            updateDashboard(action, "student", value)
          })

        } else {

          // // studentFilter init
          var studentFilter = d3.select('div.student-filter')
          var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { return d })
          var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
          studentFilterLabelsInner.append('input').attr('type', 'checkbox')
          studentFilterLabelsInner.append('p')
          .text(function(d) {
            return d[0];
          })
          studentFilterLabels.exit().remove();
          // apply .on change event to inputs
          var studentFilterInputs = studentFilter.selectAll('label > input')
          studentFilterInputs.on("change", function(data,i,arr) {
            var value = data[0];
            var action = this.checked ? "add" : "remove";
            updateDashboard(action, "student", value)
          })

          // classFilter init
          var classFilter = d3.select('div.class-filter')
          var classFilterLabels = classFilter.selectAll('label').data(studentClasses).enter().append('label');
          classFilterLabels.append('input').attr('type', 'checkbox');
          classFilterLabels.append('p')
          .text(function(d) {
            return d;
          }).exit().remove();
          // apply .on change event to inputs
          var classFilterInputs = classFilter.selectAll('label > input')
          classFilterInputs.on("change", function(data,i,arr) {
            var value = data;
            var action = this.checked ? "add" : "remove";
            updateDashboard(action, "class", value)
          })

          // genderFilter init
          var genderFilter = d3.select('div.gender-filter')
          var genderFilterLabels = genderFilter.selectAll('label').data(['Male', 'Female']).enter().append('label');
          genderFilterLabels.append('input').attr('type', 'checkbox');
          genderFilterLabels.append('p')
          .text(function(d) {
            return d;
          }).exit().remove();
          // apply .on change event to inputs
          var genderFilterInputs = genderFilter.selectAll('label > input')
          genderFilterInputs.on("change", function(data,i,arr) {
            var value = data;
            var action = this.checked ? "add" : "remove";
            updateDashboard(action, "gender", value)
          })
        }
      }

      // sort calc function
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

      // apply recent filter selections to dashbaord
      function updateDashboard(action, filter, value) {

        if (filter === "student") action === "add" ? studentSelections.push(value) : studentSelections.splice(studentSelections.indexOf(value), 1);
        if (filter === "class") action === "add" ? classSelections.push(value) : classSelections.splice(classSelections.indexOf(value), 1);
        if (filter === "gender") action === "add" ? genderSelections.push(value) : genderSelections.splice(genderSelections.indexOf(value), 1);

        // console.log(studentSelections);

        // update data object with students filter
        if (studentSelections.length) {
          var filteredData = dashData.filter(function(d,i) { return studentSelections.includes(d[0]) });
        } else {
          var filteredData = dashData;
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
            // console.log(filteredData);
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
        var filtersApplied = [classSelections, genderSelections, studentSelections];

        setFilters(dashData, filtersApplied)
        setRowData(filteredData);
      }

      // table body object reference
      var tableBody = table.append('tbody').attr('class', 'student-data');

      // populate rows with data, based on student data object index references
      function setRowData(rowData, init) {
        // console.log('setting row data', rowData);

        // setHeaders(rowObj);
        if (init) {
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
              return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i) });
              sortAscending = false;
              this.className = 'student-data header des';
            } else {
              console.log('Descending');
              rowObj.sort(function(a, b) { return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'des', i) });
              sortAscending = true;
              this.className = 'student-data header asc';
            }
            // rowObj.exit();
          })

          var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d }).enter().append('tr').attr('class', 'student-data')
          rowObj.attr('row-index', function(d, i) {
            return i;
          })
          rowObj.selectAll('td').data(function (d,i) {
            // console.log('d, i', d, i);
            return dashValsIndex.map(function (k, i) {
              // console.log('k, i', k,i);
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
            // console.log(Number(d.value), newValue);
            var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
            var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
            return cellColor + opacity + ")";
          })

          rowObj.exit().remove();

        } else {

          var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

          rowObj.enter().append('tr').attr('class', 'student-data')
          // .style("border-bottom", function() {
          //   return "1px solid black";
          // })
          .selectAll('td').data(function (d,i) {
            // console.log('d, i', d, i);
            return dashValsIndex.map(function (k, i) {
              // console.log('k, i', k,i);
              return { 'value': d[k], 'name': dashValCHs[i] };
            })
          }).enter()
          .append('td').attr('class', 'student-data')
          .attr('data-th', function (d) {
            return d.name;
          })
          .text(function (d, i, a) {
            return d.value;
          }).style("background-color", function(d, i) {
            var discOpacityCalc = (((Number(d.value) * 80) / 100) + 20) / 100;
            var motivOpacityCalc = (((Number(d.value) * 8) / 10) + 2) / 10;
            // console.log(Number(d.value), newValue);
            var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
            var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
            return cellColor + opacity + ")";
          })
          rowObj.exit().remove();
        }
        return;
      }

      // search bar Functionality
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

        setFilters(searchReturn, [classSelections,genderSelections,studentSelections]);

      })

      // setHeaders();
      setFilters(dashData, [[],[],[]]);
      setRowData(dashData, true);
      return;

      // var studentName = d3.select('h3.sde-name');
      // studentName.text(sDDMap.get('FULL NAME'));
      // var studentDems1 = d3.select('div.sde-dems1');
      // console.log(studentName, studentDems1);
      // var fullName = 'test';
      // studentDems1.selectAll('p').data(fullName, function(d) { return d;}).enter().append('p')
      // .text(function(d) { console.log(d); return d; }).exit();

    },

    loadStudentDetails: function(columnHeaders, studentData) {
      return new Promise(function(resolve, reject) {

        var studentDetailsData = {};
        for (var i = 0; i < columnHeaders.length; i++) {
          studentDetailsData[columnHeaders[i]] = studentData[i];
        }

        var sDDEntries = d3.entries(studentDetailsData)
        var sDDMap = d3.map(studentDetailsData, function(d) { return d; })
        console.log(sDDEntries, sDDMap);

        // Use D3 to append data to appropriate fields in student detail popup
        // Student Name
        var studentName = d3.select('h3.sde-name');
        studentName.text(sDDMap.get('FULL NAME'));
        // Header Demographics
        var studentDems1 = d3.select('div.sde-dems1');
        var dems1 = [sDDMap.get('GENDER'), sDDMap.get('SCHOOL YEAR'), sDDMap.get('YEAR BORN'), sDDMap.get('CLASS'), sDDMap.get('ETHNICITY'), sDDMap.get('SCHOOL YEAR')];
        console.log(dems1);
        studentDems1.selectAll('p').data(dems1, function(d) { return d;}).enter().append('p')
        .text(function(d) { return d; }).exit();

        resolve();
      })
    },

    d3Setup: function(inputObject, controlOption) {
      return new Promise(function(resolve, reject) {

        function createDashboard(data, schoolName) {
          // Global Vars
          var studentSelections = [];
          var classSelections = [];
          var genderSelections = [];

          var dashData = data.compiledData.studentData;
          var sdCHs = data.compiledData.columnHeaders[0];
          var dataKeys = Object.keys(data)
          var studentClasses = [];

          for (var i = 0; i < dataKeys.length; i++) {
            if (dataKeys[i] !== "Staff" && dataKeys[i] !== "compiledData" && dataKeys[i] !== "metaData" && dataKeys[i] !== "_id") {
              studentClasses.push(dataKeys[i].substring(0,4))
            }
          }

          var dashValCHs = ["FULL NAME", "GENDER", "CLASS", "D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)", "TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA"];
          var dashboardCHs = ["Students", "Gender", "Class", "Dominance", "Influencing", "Steadiness", "Compliance", "Theoretical", "Utilitarian", "Aesthetic", "Social", "Individualistic", "Traditional"];
          var dashValsIndex = [];

          for (var i = 0; i < sdCHs.length; i++) {
            for (var j = 0; j < dashValCHs.length; j++) {
              if(sdCHs[i] === dashValCHs[j]) {
                dashValsIndex.push(i);
              }
            }
          }

          var sortAscending = true;
          var table = d3.select('div.student-data-table').append('table').attr('class', 'student-data');
          var titles = d3.values(dashboardCHs);

          var columnColorIndex = ["rgba(255,255,255,", "rgba(255,255,255,", "rgba(255,255,255,", "rgba(255, 52, 52,", "rgba(250, 238, 74,", "rgba(41, 218, 32,", "rgba(96, 112, 255,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,", "rgba(212, 175, 55,"]

          // setup headers
          function setHeaders() {

            var rowObj = tableBody.selectAll('tr').data(dashData, function(d) { return d }).enter().append('tr');

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

            rowObj.exit();

          }

          // setup filters
          function setFilters(data, filtersApplied) {

            if (filtersApplied[0].length || filtersApplied[1].length) {
              if (filtersApplied[0].length) {
                console.log('class filter applied');
                data = data.filter(function(e, i, a) {
                  return filtersApplied[0].indexOf(e[4]) !== -1;
                })
              }
              if (filtersApplied[1].length) {
                console.log('gender filter applied');
                data = data.filter(function(e, i, a) {
                  var gTransform = e[3] === 'M' ? 'Male' : 'Female';
                  return filtersApplied[1].indexOf(gTransform) !== -1;
                })
              }

              console.log(studentSelections);
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
              console.log(data.length);
              // data.unshift([['Test Name']])

              var studentFilter = d3.select('div.student-filter')
              var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { console.log(d); return d; })
              var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              studentFilterLabelsInner.append('p')
              .text(function(d) {
                console.log(d);
                return d[0];
              })
              studentFilterLabels.exit().remove();

              var studentFilterInputs = studentFilter.selectAll('label > input')
              studentFilterInputs.on("change", function(data,i,arr) {
                var value = data[0];
                var action = this.checked ? "add" : "remove";
                updateDashboard(action, "student", value)
              })

            } if (filtersApplied[2].length) {

              console.log('student filter applied');
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
              var studentFilter = d3.select('div.student-filter')
              var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) {
                // console.log(d[0]);
                return d;
              })
              var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              studentFilterLabelsInner.append('p')
              .text(function(d) {
                // console.log(d);
                return d[0];
              })
              studentFilterLabels.exit().remove();
              // apply .on change event to inputs
              var studentFilterInputs = studentFilter.selectAll('label > input')
              studentFilterInputs.on("change", function(data,i,arr) {
                var value = data[0];
                var action = this.checked ? "add" : "remove";
                updateDashboard(action, "student", value)
              })

            } else {

              // // studentFilter init
              var studentFilter = d3.select('div.student-filter')
              var studentFilterLabels = studentFilter.selectAll('label').data(data, function(d) { return d })
              var studentFilterLabelsInner = studentFilterLabels.enter().append('label');
              studentFilterLabelsInner.append('input').attr('type', 'checkbox')
              studentFilterLabelsInner.append('p')
              .text(function(d) {
                return d[0];
              })
              studentFilterLabels.exit().remove();
              // apply .on change event to inputs
              var studentFilterInputs = studentFilter.selectAll('label > input')
              studentFilterInputs.on("change", function(data,i,arr) {
                var value = data[0];
                var action = this.checked ? "add" : "remove";
                updateDashboard(action, "student", value)
              })

              // classFilter init
              var classFilter = d3.select('div.class-filter')
              var classFilterLabels = classFilter.selectAll('label').data(studentClasses).enter().append('label');
              classFilterLabels.append('input').attr('type', 'checkbox');
              classFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();
              // apply .on change event to inputs
              var classFilterInputs = classFilter.selectAll('label > input')
              classFilterInputs.on("change", function(data,i,arr) {
                var value = data;
                var action = this.checked ? "add" : "remove";
                updateDashboard(action, "class", value)
              })

              // genderFilter init
              var genderFilter = d3.select('div.gender-filter')
              var genderFilterLabels = genderFilter.selectAll('label').data(['Male', 'Female']).enter().append('label');
              genderFilterLabels.append('input').attr('type', 'checkbox');
              genderFilterLabels.append('p')
              .text(function(d) {
                return d;
              }).exit().remove();
              // apply .on change event to inputs
              var genderFilterInputs = genderFilter.selectAll('label > input')
              genderFilterInputs.on("change", function(data,i,arr) {
                var value = data;
                var action = this.checked ? "add" : "remove";
                updateDashboard(action, "gender", value)
              })
            }
          }

          // sort calc function
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

          // apply recent filter selections to dashbaord
          function updateDashboard(action, filter, value) {

            if (filter === "student") action === "add" ? studentSelections.push(value) : studentSelections.splice(studentSelections.indexOf(value), 1);
            if (filter === "class") action === "add" ? classSelections.push(value) : classSelections.splice(classSelections.indexOf(value), 1);
            if (filter === "gender") action === "add" ? genderSelections.push(value) : genderSelections.splice(genderSelections.indexOf(value), 1);

            // console.log(studentSelections);

            // update data object with students filter
            if (studentSelections.length) {
              var filteredData = dashData.filter(function(d,i) { return studentSelections.includes(d[0]) });
            } else {
              var filteredData = dashData;
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
                // console.log(filteredData);
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
            var filtersApplied = [classSelections, genderSelections, studentSelections];

            setFilters(dashData, filtersApplied)
            setRowData(filteredData);
          }

          // table body object reference
          var tableBody = table.append('tbody').attr('class', 'student-data');

          // populate rows with data, based on student data object index references
          function setRowData(rowData, init) {
            // console.log('setting row data', rowData);

            // setHeaders(rowObj);
            if (init) {
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
                  return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'asc', i) });
                  sortAscending = false;
                  this.className = 'student-data header des';
                } else {
                  console.log('Descending');
                  rowObj.sort(function(a, b) { return a == null || b == null ? 0 : stringCompare(a[i], b[i], 'des', i) });
                  sortAscending = true;
                  this.className = 'student-data header asc';
                }
                // rowObj.exit();
              })

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d }).enter().append('tr').attr('class', 'student-data')
              rowObj.attr('row-index', function(d, i) {
                return i;
              })
              rowObj.selectAll('td').data(function (d,i) {
                // console.log('d, i', d, i);
                return dashValsIndex.map(function (k, i) {
                  // console.log('k, i', k,i);
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
                // console.log(Number(d.value), newValue);
                var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
                var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
                return cellColor + opacity + ")";
              })

              rowObj.exit().remove();

            } else {

              var rowObj = tableBody.selectAll('tr').data(rowData, function(d) { return d });

              rowObj.enter().append('tr').attr('class', 'student-data')
              // .style("border-bottom", function() {
              //   return "1px solid black";
              // })
              .selectAll('td').data(function (d,i) {
                // console.log('d, i', d, i);
                return dashValsIndex.map(function (k, i) {
                  // console.log('k, i', k,i);
                  return { 'value': d[k], 'name': dashValCHs[i] };
                })
              }).enter()
              .append('td').attr('class', 'student-data')
              .attr('data-th', function (d) {
                return d.name;
              })
              .text(function (d, i, a) {
                return d.value;
              }).style("background-color", function(d, i) {
                var discOpacityCalc = (((Number(d.value) * 80) / 100) + 20) / 100;
                var motivOpacityCalc = (((Number(d.value) * 8) / 10) + 2) / 10;
                // console.log(Number(d.value), newValue);
                var cellColor = i > 2 ? columnColorIndex[i] : "rgba(255,255,255,";
                var opacity = i > 2 && i <= 6 ? discOpacityCalc : i > 6 ? motivOpacityCalc : 1;
                return cellColor + opacity + ")";
              })
              rowObj.exit().remove();
            }
            return;
          }

          // search bar Functionality
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

            setFilters(searchReturn, [classSelections,genderSelections,studentSelections]);

          })

          // setHeaders();
          setFilters(dashData, [[],[],[]]);
          setRowData(dashData, true);
          return;

          // var studentName = d3.select('h3.sde-name');
          // studentName.text(sDDMap.get('FULL NAME'));
          // var studentDems1 = d3.select('div.sde-dems1');
          // console.log(studentName, studentDems1);
          // var fullName = 'test';
          // studentDems1.selectAll('p').data(fullName, function(d) { return d;}).enter().append('p')
          // .text(function(d) { console.log(d); return d; }).exit();

        }

        function loadStudentDetails(columnHeaders, studentData) {

          // createDashboard(studentData)

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
            "DISC": [43.0, 58.7, 60.7, 50.5],
            "MOTIVATORS": [6.0, 5.3, 4.3, 4.2, 5.5, 4.7],
            "SKILLS": []
          }

          // row 1 - header name
          var studentName = d3.select('h3.sde-name');
          studentName.text(sDDataObject['FULL NAME'].value)
          .attr("class", "sde-name");

          function setSdSectionData() {

            var returnArr = [];
            var conversionObj = {
              "GENDER": function(value) {
                return value = "M" ? "Male" : "Female";
              }
            };
            var conversionObjKeys = Object.keys(conversionObj);

            for (var i = 0; i < arguments.length; i++) {
              var pushVal;
              var converted = false;
              for (var j = 0; j < conversionObjKeys.length; j++) {
                if (arguments[i] === conversionObjKeys[j]) {
                  pushVal = [sDDataObject[arguments[i]].label, conversionObj[conversionObjKeys[j]](sDDataObject[arguments[i]].value)];
                  converted = true;
                }
              }
              if (!converted) {
                // console.log(arguments[i], sDDataObject[arguments[i]]);
                pushVal = [sDDataObject[arguments[i]].label, sDDataObject[arguments[i]].value]
              }
              returnArr.push(pushVal);
            }

            return returnArr;
          }

          // ROW 1
          // header demographics
          var studentDems1 = d3.select('div.sde-dems1');
          var dems1 = setSdSectionData("GENDER", "YEAR BORN", "CLASS", "ETHNICITY", "SCHOOL YEAR")
          var studentDems1Spans = studentDems1.selectAll('span').data(dems1, function(d) { console.log(d); return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems1");
          studentDems1Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems1")
          studentDems1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems1");

          // ROW 2
          // dems 2.0
          var studentDems2_0 = d3.select('div.sde-dems2-0');
          var dems2_0 = setSdSectionData("ENGLISH GRADES", "MATH GRADES", "SCIENCE GRADES");
          var studentDems2_0Spans = studentDems2_0.selectAll('span').data(dems2_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2-0");
          studentDems2_0Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2-0")
          studentDems2_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2-0");

          // dems 2.1
          var studentDems2_1 = d3.select('div.sde-dems2-1');
          var dems2_1 = setSdSectionData("GPA", "PARENTCOLLEGE", "PAYING JOB");
          var studentDems2_1Spans = studentDems2_1.selectAll('span').data(dems2_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2-1");
          studentDems2_1Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2-1")
          studentDems2_1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2-1");

          // dems 2.2
          var studentDems2_2 = d3.select('div.sde-dems2-2');
          var dems2_2 = setSdSectionData("MAJOR", "JOBS ENJOYED", "JOBS NOT REWARDING");
          var studentDems2_2Spans = studentDems2_2.selectAll('span').data(dems2_2, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-dems2-2");
          studentDems2_2Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-dems2-2")
          studentDems2_2Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-dems2-2");


          // ROW 3
          // disc
          var studentDiscVals = d3.select('div.sde-disc');
          var discVals = setSdSectionData("D NATURAL (%)", "I NATURAL (%)", "S NATURAL (%)", "C NATURAL (%)");
          var discCalcVals = setSdSectionData("D ADAPTED (%)", "I ADAPTED (%)", "S ADAPTED (%)", "C ADAPTED (%)");
          var studentDiscValsSpans = studentDiscVals.selectAll('span').data(discVals, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-disc");
          studentDiscValsSpans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-disc")
          studentDiscValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-disc");

          // motivators
          var studentMotivatorVals = d3.select('div.sde-motivators');
          var motivatorVals = setSdSectionData("TEN_THE", "TEN_UTI", "TEN_AES", "TEN_SOC", "TEN_IND", "TEN_TRA");
          var motivatorAvgs = adultAverages.MOTIVATORS
          var studentMotivatorValsSpans = studentMotivatorVals.selectAll('span').data(motivatorVals, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-motivators");
          studentMotivatorValsSpans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-motivators")
          studentMotivatorValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-motivators");

          // skills
          var studentSkillsVals = d3.select('div.sde-skills');
          var skillsVals = setSdSectionData("CONCEPTUAL THINKING", "CONFLICT MANAGEMENT", "CONTINUOUS LEARNING", "CUSTOMER FOCUS", "DECISION MAKING", "DIPLOMACY & TACT", "EMPATHY", "EMPLOYEE DEVELOPMENT/COACHING", "FLEXIBILITY", "FUTURISTIC THINKING", "GOAL ACHIEVEMENT", "INTERPERSONAL SKILLS", "LEADERSHIP", "NEGOTIATION", "PERSONAL ACCOUNTABILITY", "PERSUASION", "PLANNING & ORGANIZING", "PRESENTING", "PROBLEM SOLVING ABILITY", "RESILIENCY", "SELF-MANAGEMENT", "TEAMWORK", "UNDERSTANDING & EVALUATING OTHERS", "WRITTEN COMMUNICATION");
          var skillsAvgs = adultAverages.SKILLS;
          var studentSkillsValsSpans = studentSkillsVals.selectAll('span').data(skillsVals, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-skills");
          studentSkillsValsSpans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-skills")
          studentSkillsValsSpans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-skills");

          // ROW 4
          // se 1.0
          var studentSe1_0 = d3.select('div.sde-se-0');
          var se1_0 = setSdSectionData("UNDERSTANDING OTHERS", "PRACTICAL THINKING", "SYSTEMS JUDGMENT");
          var se1_0Biases = setSdSectionData("UNDERSTANDING OTHERS BIAS", "PRACTICAL THINKING BIAS", "SYSTEMS JUDGMENT BIAS");
          var studentSe1_0Spans = studentSe1_0.selectAll('span').data(se1_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-se-0");
          studentSe1_0Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-se-0")
          studentSe1_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-se-0");

          // se 1.1
          var studentSe1_1 = d3.select('div.sde-se-1');
          var se1_1 = setSdSectionData("SENSE OF SELF", "ROLE AWARENESS", "SELF DIRECTION");
          var se1_1Biases = setSdSectionData("SENSE OF SELF BIAS", "ROLE AWARENESS BIAS", "SELF DIRECTION BIAS");
          var studentSe1_1Spans = studentSe1_1.selectAll('span').data(se1_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-se-1");
          studentSe1_1Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-se-1")
          studentSe1_1Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-se-1");

          // row 4 - sed 1.0
          var studentSed1_0 = d3.select('div.sde-sed-0');
          var sed1_0 = setSdSectionData("ATTEND", "PREPARING");
          console.log(sed1_0);
          var studentSed1_0Spans = studentSed1_0.selectAll('span').data(sed1_0, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed-0");
          studentSed1_0Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-sed-0")
          studentSed1_0Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-sed-0");

          // row 4 - sed 1.1
          var studentSed1_1 = d3.select('div.sde-sed-1');
          var sed1_1Calc = setSdSectionData("TOO MANY TESTS", "TOO MUCH HOMEWORK", "MANAGING MY TIME", "SOCIAL LIFE/FRIENDS", "TOO MANY RULES", "BEING COMPARED TO OTHERS", "BULLYING/ MEAN PEERS", "GETTING GOOD GRADES", "APPLYING FOR COLLEGE");
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
          console.log(sed1_1);
          var studentSed1_1Spans = studentSed1_1.selectAll('span').data(sed1_1, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed-1");
          studentSed1_1Spans.append('p').text(function(d) { console.log(d); return d[1]; })
          .attr("class", "sd-val sde-sed-1")
          studentSed1_1Spans.append('label').text(function(d) { console.log(d); return d[0]; })
          .attr("class", "sd-label sde-sed-1");

          // row 4 - sed 1.2
          var studentSed1_2 = d3.select('div.sde-sed-2');
          var sed1_2 = setSdSectionData("OTHERSTRESS");
          var studentSed1_2Spans = studentSed1_2.selectAll('span').data(sed1_2, function(d) { return d; }).enter().append('span')
          .attr("class", "sd-span sde-sed-2");
          studentSed1_2Spans.append('p').text(function(d) { return d[1]; })
          .attr("class", "sd-val sde-sed-2")
          studentSed1_2Spans.append('label').text(function(d) { return d[0]; })
          .attr("class", "sd-label sde-sed-2");

          resolve();
          // Use D3 to append data to appropriate fields in student detail popup

        }

        if (controlOption === "studentData") {
          createDashboard(inputObject.data, inputObject.schoolName)
          resolve();
        } else if (controlOption === "studentDetails") {
          loadStudentDetails(inputObject.columnHeaders, inputObject.studentData);
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
        console.log(schoolCode, version, id);
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

app.factory('socket', ['$rootScope', '$state', function($rootScope, $state) {

  var url = $state.href('default', {}, {absolute: true})
  var socket = io.connect(url, { 'reconnection' : false });

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };


}])
