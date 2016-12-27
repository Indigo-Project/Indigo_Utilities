app.controller('Dashboard_Controller', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'Responsive_WD_Service', function($compile, $scope, $location, $state, $stateParams, $http, Main_Service, TTI_API, socket, $window, DashboardService, localStorageService, Responsive_WD_Service) {

  // $scope object instantiation
  $scope.data = {};
  $scope.uploader = {};
  $scope.view = {};

  // Alter selected function based on route (multiple directives tied to controller)
  // if ($state.current.name === "dashboard_gen") {
  //   $scope.view.selectedFunction = "dashboard_gen";
  // } else if ($state.current.name === "dashboard_manager") {
  //   $scope.view.selectedFunction = "dashboard_manager";
  // }

  // dynamically change options based on selected function
  // $scope.view.accessFunction = function () {
  //   Main_Service.accessFunction($scope.view.selectedFunction);
  // }

  // responsive 'reaction' event
  // function responsiveAdaptationFS() {
  //   // Responsive initialization of dimensions
  //   var dashboardFrameElement = $('section.dashboard-frame');
  //   // console.log(dashboardFrameElement.width(), dashboardFrameElement.height());
  //
  //   $scope.view.baseDimensions = Responsive_WD_Service.calculateBaseDimensions(dashboardFrameElement);
  //
  //   // Dashboard frame width and height changed to viewport width and height
  //   var dashboardWidth = $scope.view.baseDimensions.viewportWidth; dashboardFrameElement.width(dashboardWidth);
  //   var dashboardHeight = $scope.view.baseDimensions.viewportHeight; dashboardFrameElement.height(dashboardHeight);
  //
  //   // Set Padding and Dimensions of studentData Dashboard Section (inner-frame)
  //   var dashboardFramePadding = { top: (.020747 * dashboardHeight) + "px", right: (.017361 * dashboardWidth) + "px", bottom: (.020747 * dashboardHeight) + "px", left: (.017361 * dashboardWidth) + "px"}
  //   dashboardFrameElement.css("padding", dashboardFramePadding.top + " " + dashboardFramePadding.right + " " + dashboardFramePadding.bottom + " " + dashboardFramePadding.left + " ");
  //   var studentDataWidthExp = dashboardWidth - (.017361 * dashboardWidth * 2)
  //   var studentDataHeightExp = dashboardHeight - ((.020747 * dashboardHeight) * 2)
  //
  //   var studentDataElement = $('section.dashboard-studentData');
  //   studentDataElement.width(studentDataWidthExp);
  //   studentDataElement.height(studentDataHeightExp);
  //
  //   //Calculate Width/Height Ratio
  //   var widthToHeightRatio = dashboardWidth/dashboardHeight;
  //
  //   // Grid structure
  //   var studentData_Row1 = $('section.sd-row1');
  //   var studentData_Row2 = $('section.sd-row2');
  //   var studentData_Row2_Column1 = $('section.sd-column1');
  //   var studentData_Row2_Column2 = $('section.sd-column2');
  //   var studentData_Row2_Column2_Row1 = $('section.sd-column2-row1');
  //   var studentData_Row2_Column2_Row2 = $('section.sd-column2-row2');
  //
  //   studentData_Row1.height(studentDataHeightExp * .102733);
  //   // console.log("Row 1", studentDataHeightExp * .102733, studentData_Row1.height());
  //   studentData_Row2.height(studentDataHeightExp * .897267);
  //   // console.log("Row 2", studentDataHeightExp * .897267, studentData_Row2.height());
  //   studentData_Row2_Column1.height(studentDataHeightExp * .897267)
  //   // console.log("Row 2 C1", studentDataHeightExp * .897267, studentData_Row2_Column1.height());
  //   studentData_Row2_Column2.height(studentDataHeightExp * .897267)
  //   // console.log("Row 2 C2", studentDataHeightExp * .897267, studentData_Row2_Column2.height());
  //   studentData_Row2_Column2_Row1.height((studentDataHeightExp * .897267) * .79695)
  //   // console.log("Row 2 C2 R1", (studentDataHeightExp * .897267) * .79695, studentData_Row2_Column2_Row1.height());
  //   studentData_Row2_Column2_Row2.height((studentDataHeightExp * .897267) * .20305)
  //   // console.log("Row 2 C2 R2", (studentDataHeightExp * .897267) * .20305, studentData_Row2_Column2_Row2.height());
  //
  //   // Grid Components Variable Definition
  //   var studentFilterFrame = $('section.student-filter-frame');
  //   var studentFilterOuter = $('section.student-filter-outer');
  //   var studentFilterInner = $('section.student-filter-inner');
  //   var studentFilter = $('div.student-filter');
  //   var studentSearchBar = $('input.search-bar');
  //   var classFilterFrame = $('section.class-filter-frame');
  //   var classFilterOuter = $('section.class-filter-outer');
  //   var classFilterInner = $('section.class-filter-inner');
  //   var classFilter = $('div.class-filter');
  //   var genderFilterFrame = $('section.gender-filter-frame');
  //   var genderFilterOuter = $('section.gender-filter-outer');
  //   var genderFilterInner = $('section.gender-filter-inner');
  //   var genderFilter = $('div.gender-filter');
  //
  //   studentFilterFrame.height(studentData_Row2_Column1.height() * .35);
  //   studentFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
  //   studentFilterOuter.outerHeight(studentFilterFrame.height());
  //   studentFilterInner.height(studentFilterOuter.height() - 20);
  //   studentFilter.height(studentFilterInner.height() * .65736004);
  //   // studentSearchBar.width(studentFilterInner.width());
  //
  //   genderFilterFrame.height(studentData_Row2_Column1.height() * .15058088);
  //   genderFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
  //   genderFilterOuter.outerHeight(genderFilterFrame.height());
  //   genderFilterInner.height(genderFilterOuter.height() - 20);
  //   classFilterFrame.height(studentData_Row2_Column1.height() * .4328851);
  //
  //   // Row 2 - Column 2 - Row 2 Variable Definition
  //   var studentData_studentCount = $('section.student-count');
  //   var studentData_adultAvgs = $('section.adult-avgs');
  //
  //   studentData_studentCount.height(studentData_Row2_Column2_Row2.height());
  //   studentData_adultAvgs.height(studentData_Row2_Column2_Row2.height());
  //
  //   // Dashboard Table Components Variable Definition
  //   var studentData_Table_Container = $('div.student-data-table');
  //   var studentData_Table = $('table.student-data');
  //   var studentData_tHead = $('table.student-data > thead');
  //   var studentData_tBody = $('table.student-data > tbody');
  //
  //   studentData_Table_Container.width(studentData_Row2_Column2.width());
  //   studentData_Table.width(studentData_Table_Container.width());
  //   studentData_tHead.width(studentData_Table.width())
  //   var sD_tHead_minusBorders = studentData_tHead.width() - 26;
  //   studentData_tBody.width(studentData_Table.width());
  //   studentData_tBody.height((studentData_Row2_Column2_Row1.height() - studentData_tHead.height()) * .9);
  //   // console.log('table width', studentData_Table.width());
  //   // console.log('thead width', studentData_tHead.width());
  //   // console.log('tbody width', studentData_tBody.width());
  //
  //   // tHead Column Headers Variable Definition
  //   var tHead = {
  //     students: $('thead.student-data th:nth-of-type(1)'),
  //     // students2: $('thead.student-data th:nth-child(1)'),
  //     gender: $('thead.student-data th:nth-of-type(2)'),
  //     class: $('thead.student-data th:nth-of-type(3)'),
  //     dominance: $('thead.student-data th:nth-of-type(4)'),
  //     influencing: $('thead.student-data th:nth-of-type(5)'),
  //     steadiness: $('thead.student-data th:nth-of-type(6)'),
  //     compliance: $('thead.student-data th:nth-of-type(7)'),
  //     theoretical: $('thead.student-data th:nth-of-type(8)'),
  //     utilitarian: $('thead.student-data th:nth-of-type(9)'),
  //     aesthetic: $('thead.student-data th:nth-of-type(10)'),
  //     social: $('thead.student-data th:nth-of-type(11)'),
  //     individualistic: $('thead.student-data th:nth-of-type(12)'),
  //     traditional: $('thead.student-data th:nth-of-type(13)')
  //   }
  //
  //   tHead.students.innerWidth(sD_tHead_minusBorders * 0.14059753954306);
  //   tHead.gender.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
  //   tHead.class.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
  //   tHead.dominance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.influencing.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.steadiness.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.compliance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.theoretical.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.utilitarian.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.aesthetic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.social.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.individualistic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //   tHead.traditional.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
  //
  //   // tBody Columns Variable Definition
  //   var tBodyColumns = {
  //     students: $('tbody.student-data td:nth-child(1)'),
  //     gender: $('tbody.student-data td:nth-child(2)'),
  //     class: $('tbody.student-data td:nth-child(3)'),
  //     dominance: $('tbody.student-data td:nth-child(4)'),
  //     influencing: $('tbody.student-data td:nth-child(5)'),
  //     steadiness: $('tbody.student-data td:nth-child(6)'),
  //     compliance: $('tbody.student-data td:nth-child(7)'),
  //     theoretical: $('tbody.student-data td:nth-child(8)'),
  //     utilitarian: $('tbody.student-data td:nth-child(9)'),
  //     aesthetic: $('tbody.student-data td:nth-child(10)'),
  //     social: $('tbody.student-data td:nth-child(11)'),
  //     individualistic: $('tbody.student-data td:nth-child(12)'),
  //     traditional: $('tbody.student-data td:nth-child(13)')
  //   }
  //
  //   // tHead and tBody column width alignment
  //   tBodyColumns.students.innerWidth(tHead.students.innerWidth());
  //   tBodyColumns.gender.innerWidth(tHead.gender.innerWidth());
  //   tBodyColumns.class.innerWidth(tHead.class.innerWidth());
  //   tBodyColumns.dominance.innerWidth(tHead.dominance.innerWidth());
  //   tBodyColumns.influencing.innerWidth(tHead.influencing.innerWidth());
  //   tBodyColumns.steadiness.innerWidth(tHead.steadiness.innerWidth());
  //   tBodyColumns.compliance.innerWidth(tHead.compliance.innerWidth());
  //   tBodyColumns.theoretical.innerWidth(tHead.theoretical.innerWidth());
  //   tBodyColumns.utilitarian.innerWidth(tHead.utilitarian.innerWidth());
  //   tBodyColumns.aesthetic.innerWidth(tHead.aesthetic.innerWidth());
  //   tBodyColumns.social.innerWidth(tHead.social.innerWidth());
  //   tBodyColumns.individualistic.innerWidth(tHead.individualistic.innerWidth());
  //   tBodyColumns.traditional.innerWidth(tHead.traditional.innerWidth());
  //
  //   $scope.$apply();
  // }

  // function responsiveAdaptationDM() {
  //
  //   // var dashboardFrameElement = $('section.dashboard-frame');
  //   var dashboardIframe = $('iframe.dashM-iframe');
  //   $scope.view.baseDimensionsDM = Responsive_WD_Service.calculateBaseDimensions(dashboardIframe);
  //
  //   var iframeWidth = $scope.view.baseDimensionsDM.viewportWidth - 40
  //   // var dFERatio = dashboardFrameElement.height() / dashboardFrameElement.width()
  //   // console.log(dashboardFrameElement.width(), dashboardFrameElement.height(), dFERatio);
  //
  //   var dFERatio = 723/1440;
  //   dashboardIframe.width(iframeWidth);
  //   dashboardIframe.height(dashboardIframe.width() * dFERatio);
  //   // console.log(dFERatio);
  //   // dashboardIFrame.width()
  //   // dashboardIframe.height(dashboardIframe.width() * dFERatio);
  // }

  // School name options dropdown and dashboard manager options initialization
  // if ($state.current.name === "dashboard_manager") {
  //   DashboardService.getSchoolNameOptions()
  //   .then(function(data) {
  //     $scope.view.dashboardNameOptions = data.data;
  //     var schoolNames = Object.keys($scope.view.dashboardNameOptions);
  //     for (var i = 0; i < schoolNames.length; i++) {
  //       $scope.view.dashboardNameOptions[schoolNames[i]].code = schoolNames[i]
  //     }
  //
  //     DashboardService.getStoredSchools()
  //     .then(function(collections) {
  //       var collectionNames = Object.keys(collections.data);
  //       // console.log(collectionNames);
  //       $scope.data.dbCollections = {};
  //       for (var i = 0; i < collectionNames.length; i++) {
  //         for (var j = 0; j < schoolNames.length; j++) {
  //           if (collectionNames[i] === schoolNames[j]) {
  //             // console.log(collectionNames[i], schoolNames[j]);
  //             $scope.data.dbCollections[collectionNames[i]] = collections.data[collectionNames[i]];
  //             $scope.data.dbCollections[collectionNames[i]].nameOptions = $scope.view.dashboardNameOptions[collectionNames[i]];
  //           }
  //         }
  //       }
  //       // console.log($scope.data.dbCollections);
  //
  //       var dbCollections = Object.keys($scope.data.dbCollections);
  //       $scope.data.availableCollections = {};
  //       for (var i = 0; i < dbCollections.length; i++) {
  //         $scope.data.availableCollections[dbCollections[i]] = $scope.data.dbCollections[dbCollections[i]].nameOptions;
  //       }
  //       // console.log($scope.data.availableCollections);
  //
  //       $scope.data.availableVersions = {};
  //       for (var i = 0; i < dbCollections.length; i++) {
  //         var currentCollection = $scope.data.dbCollections[dbCollections[i]];
  //         var collectionVKeys = Object.keys(currentCollection)
  //         $scope.data.availableVersions[dbCollections[i]] = {};
  //         for (var j = 0; j < collectionVKeys.length; j++) {
  //           if (collectionVKeys[j] !== "nameOptions") {
  //             $scope.data.availableVersions[dbCollections[i]][collectionVKeys[j]] = currentCollection[collectionVKeys[j]];
  //           }
  //         }
  //       }
  //       // console.log($scope.data.availableVersions);
  //
  //       $scope.$apply();
  //     });
  //   });
  // }

  // $scope variable declaration
  $scope.data.schoolName = "";
  $scope.data.schoolCode = "";
  $scope.data.dataObject = "";
  // $scope.data.studentFilter = [];
  // $scope.data.classFilter = [];
  // $scope.data.genderFilter = [];

  $scope.view.uploadOptionStatus = "no selection"
  $scope.view.dashboardCreationStatus = "";
  $scope.view.studentFilter = [];
  $scope.view.classFilter = [];
  $scope.view.genderFilter = [];
  $scope.view.dashboardGeneratedVersion = "";
  $scope.view.dashboardGeneratedSchool = "";
  $scope.view.dashboardDateCreated = "";

  $scope.uploader.loadedFiles = [];

  //Dashboard Manager variables
  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";

  // On Dashboard Manager school selection, configure available versions for selected school
  // $scope.view.updateVersionOptions = function() {
    if ($scope.view.dashMschoolCode) {
      var returnVersions = {};
      $scope.view.currentVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
      console.log($scope.view.currentVersions);
    } else {
      console.log('NO COLLECTION SELECTED');
    }
  };

  // load current dashboard version data object into $scope variable and local storage from dashboard manager, then create dashboard
  // $scope.view.loadVersion = function() {
    $scope.view.showMDashboard = false;
    if ($scope.view.dashMschoolVersion) {
      // console.log($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion);
      DashboardService.getStoredDashboardData($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion)
      .then(function(data) {
        console.log('got data', data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        DashboardService.createDashboard($scope.data.currentDashboardDataObject, $scope.view.dashMschoolCode);
        $scope.view.iframeSrc = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        $scope.view.showMDashboard = true;
        responsiveAdaptationDM();
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    } else {
      console.log('NO VERSION SELECTED');
    }
  };

  // if no dash-data set has been specified from manager, load based on full screen params
  $scope.data.loadVersionFS = function() {
    return new Promise(function(resolve, reject) {
      DashboardService.getStoredDashboardData($stateParams.collection, null, $stateParams.id)
      .then(function(data) {
        console.log(data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data, $scope.view.dashMschoolCode);
        DashboardService.createDashboard($scope.data.currentDashboardDataObject, $scope.view.dashMschoolCode);
        // $scope.view.iframeSrc = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        // $scope.view.showMDashboard = true;
        responsiveAdaptationDM();
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    })
  }

  // load dashboard within full screen view
  $scope.view.loadFSDashboard = function() {
    return new Promise(function(resolve, reject) {
      var dashboardData = localStorageService.get('currentDashboardData');
      $scope.data.studentNumber = dashboardData.compiledData.studentData.length;
      DashboardService.createDashboard(dashboardData);
      $scope.view.dashDisplayschoolName = dashboardData.metaData.schoolInfo.optionDisplay;
      $('span.sd-title-name').html($scope.view.dashDisplayschoolName + " ");

      // compile ng-click html attribute applied from D3, binding to $scope
      var studentNameCells = $('table.student-data tbody td:nth-of-type(1)');
      $compile(studentNameCells)($scope);

      $scope.view.showFSDashboard = true;
      resolve();
    })
  }

  // Open new tab with full screen dashboard
  // $scope.view.openFSDashboard = function() {
    $scope.data.studentNumber = $scope.data.currentDashboardDataObject.compiledData.studentData.length;
    var collection = $scope.view.dashMschoolCode;
    var id = $scope.data.currentDashboardDataObject._id;
    window.open('/dashboards/' + collection + '/' + id, '_blank');
  }

  $scope.view.doneResizing = function() {
    $state.reload();
  }


  // If state is dashboard_fullscreen on load, load dashboard into view
  if ($state.current.name === "dashboard_fullscreen" || $state.current.name === "dashboard_student_detail") {
    // if no object in local storage, or localstorage object's id is not same as in url parameter, get correct student data object
    if (!localStorageService.get('currentDashboardData') || localStorageService.get('currentDashboardData')._id !== $stateParams.id ) {
      console.log('LOAD CORRECT VERSION...');
      $scope.data.loadVersionFS();
    } else {
      $scope.view.showFSDashboard = false;
      $scope.view.loadFSDashboard()
      .then(function() {
        window.requestAnimationFrame(responsiveAdaptationFS);
        var resizeTimeout;
        $(window).on("resize orientationChange", function() {
          clearTimeout(resizeTimeout);
          // 100ms after most recent resize, refresh the $state
          resizeTimeout = setTimeout($scope.view.doneResizing(), 100);
          window.requestAnimationFrame(responsiveAdaptationFS);
        })
      });
    }
  }

  $scope.view.openStudentDetails = function(event) {

    function getStudentDataObjectFromRouteParams () {
      return new Promise(function(resolve, reject) {

        var studentNameCondensed = event.currentTarget.innerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase();
        var rowIndex = event.currentTarget.parentNode.attributes['row-index'].value;
        var studentPath = studentNameCondensed + rowIndex;
        var schoolCollection = $location.path().split("/")[2];
        var versionId = $location.path().split("/")[3];
        $state.go('dashboard_student_detail', { collection: schoolCollection, id: versionId, studentpath: studentPath});

        var dashDataStudents = localStorageService.get("currentDashboardData").compiledData.studentData;
        var columnHeaders = localStorageService.get("currentDashboardData").compiledData.columnHeaders[0];
        var studentIndex;
        for (var i = 0; i < dashDataStudents.length; i++) {
          var pathCode = dashDataStudents[i][0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase() + i;
          if (studentPath === pathCode) studentIndex = i;
        }
        var studentData = dashDataStudents[studentIndex];
        localStorageService.set("currentStudentData", studentData);
        if (studentData) {
          resolve({ stateInfo: [schoolCollection, versionId, studentPath], columnHeaders: columnHeaders, studentData: studentData })
        } else {
          reject('no student data');
        }
      })
    }

    getStudentDataObjectFromRouteParams()
    .then(function(data) {
      DashboardService.loadStudentDetails(data.columnHeaders, data.studentData)
      .then(function() {
        $state.go('dashboard_student_detail', { collection: data.stateInfo[0], id: data.stateInfo[1], studentpath: data.stateInfo[2]});
        responsiveAdaptationDM();
        $scope.$apply();
        // $state.reload();
        console.log('done');
      }).catch(function(error) {
        console.log(error);
      })
    }).catch(function(error) {
      console.log(error);
    })
  }

  $scope.view.closeStudentDetails = function(event) {
    console.log('closing...');
    if (event.target.attributes.class.value.split(' ')[0] === 'dashboard-studentdetails') {
      var returnPath = $location.path()
      var returnPathArr = returnPath.split('/')
      $state.go('dashboard_fullscreen', { collection: returnPathArr[2], id: returnPathArr[3] })
    }
  }

  // $scope.view.applyFilters = function() {
  //   DashboardService.applyFilters($scope.view.studentFilter, $scope.view.classFilter, $scope.view.genderFilter);
  // }

  // $scope.view.toggleStudentSelection = function(studentName) {
  //   var i = $scope.data.studentFilter.indexOf(studentName)
  //   if (i > -1) {
  //     $scope.data.studentFilter.splice(i, 1);
  //   } else {
  //     $scope.data.studentFilter.push(studentName);
  //   }
  //   console.log($scope.data.studentFilter);
  // }
  //
  // $scope.view.toggleClassSelection = function(className) {
  //   var i = $scope.data.classFilter.indexOf(className)
  //   if (i > -1) {
  //     $scope.data.classFilter.splice(i, 1);
  //   } else {
  //     $scope.data.classFilter.push(className);
  //   }
  //   console.log($scope.data.classFilter);
  // }
  //
  // $scope.view.toggleGenderSelection = function(gender) {
  //   var i = $scope.data.genderFilter.indexOf(gender)
  //   if (i > -1) {
  //     $scope.data.genderFilter.splice(i, 1);
  //   } else {
  //     $scope.data.genderFilter.push(gender);
  //   }
  //   console.log($scope.data.genderFilter);
  // }


  // $scope.view.displayOption = function(status) {
  //   $scope.view.uploadOptionStatus = status;
  //   if (status === 'csv-upload') {
  //     return 'option-selected';
  //   } else if (status === 'tti-import') {
  //     return 'option-selected';
  //   }
  // }
  //
  // $scope.uploader.addChosenReports = function(uploadType) {
  //   if ($scope.uploader.role === undefined) {
  //     alert("PLEASE SELECT ROLE")
  //   }
  //   else if ($scope.uploader.role === 'Students' && ($scope.uploader.schoolYearTaken === undefined || $scope.uploader.class === undefined)) {
  //     if ($scope.uploader.schoolYearTaken === undefined && $scope.uploader.class === undefined) {
  //       alert("PLEASE ENTER SCHOOL YEAR TAKEN AND CLASS")
  //     }
  //     else if ($scope.uploader.schoolYearTaken === undefined) {
  //       alert("PLEASE ENTER SCHOOL YEAR TAKEN")
  //     }
  //     else if ($scope.uploader.class === undefined) {
  //       alert("PLEASE ENTER CLASS")
  //     }
  //   }
  //   else if ($scope.uploader.file === undefined)  {
  //     alert("NO FILE UPLOADED");
  //   } else {
  //     $scope.uploader.loadedFiles.push(
  //       {uploadType: uploadType,
  //       name: $('input[type=file]').val().substring(12),
  //       reportType: $scope.uploader.reportType,
  //       role: $scope.uploader.role,
  //       data: $scope.uploader.file,
  //       schoolYearTaken: $scope.uploader.schoolYearTaken,
  //       class: $scope.uploader.class});
  //
  //     angular.element("input[type='file']").val(null);
  //     $scope.uploader.reportType = undefined;
  //     $scope.uploader.file = undefined;
  //     $scope.uploader.role = undefined;
  //     $scope.uploader.schoolYearTaken = undefined;
  //     $scope.uploader.class = undefined;
  //     $('input[type=file]').val(null)
  //   }
  // }
  //
  // $scope.data.generateDashboard = function() {
  //   if ($scope.uploader.loadedFiles.length === 0) {
  //     alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
  //   } else if (!$scope.data.schoolName) {
  //     alert("PLEASE SELECT SCHOOL");
  //   } else {
  //     if(confirm("Please confirm that the school name is correct. Upon submission for dashboard generation, this name will become a unique identifier for the dashboard, associated within the same grouping as future versions of dashboards for the same school. refer to FAQ for a more detailed explanation of how this works.")) {
  //       $scope.view.dashboardCreationStatus = "Generating Dashboard...";
  //
  //       var dashboardNameOptions = $scope.view.dashboardNameOptions;
  //       for (var code in dashboardNameOptions) {
  //         if (dashboardNameOptions[code].name === $scope.data.schoolName) {
  //           $scope.data.schoolCode = code;
  //         }
  //       }
  //       DashboardService.getDataObject($scope.uploader.loadedFiles, $scope.data.schoolCode)
  //       .then(function(data) {
  //         var data = data.data;
  //         var dataObjKeys = Object.keys(data);
  //         $scope.data.studentNumber = data.compiledData.studentData.length;
  //         $scope.data.studentClasses = [];
  //
  //         // generate class array
  //         for (var i = 0; i < dataObjKeys.length; i++) {
  //           if (dataObjKeys[i] === "Staff" || dataObjKeys[i] === "compiledData" || dataObjKeys[i] === "metaData" || dataObjKeys[i] === "_id") {
  //             console.log('not a student group - not added to class options');
  //           } else {
  //             $scope.data.studentClasses.push(dataObjKeys[i].substring(0,4))
  //           }
  //         }
  //         DashboardService.createDashboard(data)
  //         $('span.sd-title-name').html($scope.data.schoolName + " ");
  //         $scope.view.dashboardCreationStatus = "success";
  //         $scope.view.dashboardGeneratedVersion = data.metaData.version;
  //         $scope.view.dashboardGeneratedSchool = data.metaData.schoolInfo.optionDisplay;
  //         $scope.view.dashboardDateCreated = data.metaData.dateCreated;
  //         $scope.$apply();
  //       })
  //     } else {
  //       console.log('Generation Aborted');
  //     }
  //   }
  // }

}])
