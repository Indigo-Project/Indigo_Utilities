app.controller('DashboardView', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.data = {};
  $scope.view = {};

  $scope.data.studentFilter = [];
  $scope.data.classFilter = [];
  $scope.data.genderFilter = [];

  $scope.view.studentFilter = [];
  $scope.view.classFilter = [];
  $scope.view.genderFilter = [];
  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";


  // responsive 'reaction' event
  function responsiveAdaptationFS() {
    // Responsive initialization of dimensions
    var dashboardFrameElement = $('section.dashboard-frame');
    // console.log(dashboardFrameElement.width(), dashboardFrameElement.height());

    $scope.view.baseDimensions = RWD.calculateBaseDimensions(dashboardFrameElement);

    // Dashboard frame width and height changed to viewport width and height
    var dashboardWidth = $scope.view.baseDimensions.viewportWidth; dashboardFrameElement.width(dashboardWidth);
    var dashboardHeight = $scope.view.baseDimensions.viewportHeight; dashboardFrameElement.height(dashboardHeight);

    // Set Padding and Dimensions of studentData Dashboard Section (inner-frame)
    var dashboardFramePadding = { top: (.020747 * dashboardHeight) + "px", right: (.017361 * dashboardWidth) + "px", bottom: (.020747 * dashboardHeight) + "px", left: (.017361 * dashboardWidth) + "px"}
    dashboardFrameElement.css("padding", dashboardFramePadding.top + " " + dashboardFramePadding.right + " " + dashboardFramePadding.bottom + " " + dashboardFramePadding.left + " ");
    var studentDataWidthExp = dashboardWidth - (.017361 * dashboardWidth * 2)
    var studentDataHeightExp = dashboardHeight - ((.020747 * dashboardHeight) * 2)

    var studentDataElement = $('section.dashboard-studentData');
    studentDataElement.width(studentDataWidthExp);
    studentDataElement.height(studentDataHeightExp);

    //Calculate Width/Height Ratio
    var widthToHeightRatio = dashboardWidth/dashboardHeight;

    // Grid structure
    var studentData_Row1 = $('section.sd-row1');
    var studentData_Row2 = $('section.sd-row2');
    var studentData_Row2_Column1 = $('section.sd-column1');
    var studentData_Row2_Column2 = $('section.sd-column2');
    var studentData_Row2_Column2_Row1 = $('section.sd-column2-row1');
    var studentData_Row2_Column2_Row2 = $('section.sd-column2-row2');

    studentData_Row1.height(studentDataHeightExp * .102733);
    // console.log("Row 1", studentDataHeightExp * .102733, studentData_Row1.height());
    studentData_Row2.height(studentDataHeightExp * .897267);
    // console.log("Row 2", studentDataHeightExp * .897267, studentData_Row2.height());
    studentData_Row2_Column1.height(studentDataHeightExp * .897267)
    // console.log("Row 2 C1", studentDataHeightExp * .897267, studentData_Row2_Column1.height());
    studentData_Row2_Column2.height(studentDataHeightExp * .897267)
    // console.log("Row 2 C2", studentDataHeightExp * .897267, studentData_Row2_Column2.height());
    studentData_Row2_Column2_Row1.height((studentDataHeightExp * .897267) * .79695)
    // console.log("Row 2 C2 R1", (studentDataHeightExp * .897267) * .79695, studentData_Row2_Column2_Row1.height());
    studentData_Row2_Column2_Row2.height((studentDataHeightExp * .897267) * .20305)
    // console.log("Row 2 C2 R2", (studentDataHeightExp * .897267) * .20305, studentData_Row2_Column2_Row2.height());

    // Grid Components Variable Definition
    var studentFilterFrame = $('section.student-filter-frame');
    var studentFilterOuter = $('section.student-filter-outer');
    var studentFilterInner = $('section.student-filter-inner');
    var studentFilter = $('div.student-filter');
    var studentSearchBar = $('input.search-bar');
    var classFilterFrame = $('section.class-filter-frame');
    var classFilterOuter = $('section.class-filter-outer');
    var classFilterInner = $('section.class-filter-inner');
    var classFilter = $('div.class-filter');
    var genderFilterFrame = $('section.gender-filter-frame');
    var genderFilterOuter = $('section.gender-filter-outer');
    var genderFilterInner = $('section.gender-filter-inner');
    var genderFilter = $('div.gender-filter');

    studentFilterFrame.height(studentData_Row2_Column1.height() * .35);
    studentFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
    studentFilterOuter.outerHeight(studentFilterFrame.height());
    studentFilterInner.height(studentFilterOuter.height() - 20);
    studentFilter.height(studentFilterInner.height() * .65736004);
    // studentSearchBar.width(studentFilterInner.width());

    genderFilterFrame.height(studentData_Row2_Column1.height() * .15058088);
    genderFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
    genderFilterOuter.outerHeight(genderFilterFrame.height());
    genderFilterInner.height(genderFilterOuter.height() - 20);
    classFilterFrame.height(studentData_Row2_Column1.height() * .4328851);

    // Row 2 - Column 2 - Row 2 Variable Definition
    var studentData_studentCount = $('section.student-count');
    var studentData_adultAvgs = $('section.adult-avgs');

    studentData_studentCount.height(studentData_Row2_Column2_Row2.height());
    studentData_adultAvgs.height(studentData_Row2_Column2_Row2.height());

    // Dashboard Table Components Variable Definition
    var studentData_Table_Container = $('div.student-data-table');
    var studentData_Table = $('table.student-data');
    var studentData_tHead = $('table.student-data > thead');
    var studentData_tBody = $('table.student-data > tbody');

    studentData_Table_Container.width(studentData_Row2_Column2.width());
    studentData_Table.width(studentData_Table_Container.width());
    studentData_tHead.width(studentData_Table.width())
    var sD_tHead_minusBorders = studentData_tHead.width() - 26;
    studentData_tBody.width(studentData_Table.width());
    studentData_tBody.height((studentData_Row2_Column2_Row1.height() - studentData_tHead.height()) * .9);
    // console.log('table width', studentData_Table.width());
    // console.log('thead width', studentData_tHead.width());
    // console.log('tbody width', studentData_tBody.width());

    // tHead Column Headers Variable Definition
    var tHead = {
      students: $('thead.student-data th:nth-of-type(1)'),
      // students2: $('thead.student-data th:nth-child(1)'),
      gender: $('thead.student-data th:nth-of-type(2)'),
      class: $('thead.student-data th:nth-of-type(3)'),
      dominance: $('thead.student-data th:nth-of-type(4)'),
      influencing: $('thead.student-data th:nth-of-type(5)'),
      steadiness: $('thead.student-data th:nth-of-type(6)'),
      compliance: $('thead.student-data th:nth-of-type(7)'),
      theoretical: $('thead.student-data th:nth-of-type(8)'),
      utilitarian: $('thead.student-data th:nth-of-type(9)'),
      aesthetic: $('thead.student-data th:nth-of-type(10)'),
      social: $('thead.student-data th:nth-of-type(11)'),
      individualistic: $('thead.student-data th:nth-of-type(12)'),
      traditional: $('thead.student-data th:nth-of-type(13)')
    }

    tHead.students.innerWidth(sD_tHead_minusBorders * 0.14059753954306);
    tHead.gender.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
    tHead.class.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
    tHead.dominance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.influencing.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.steadiness.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.compliance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.theoretical.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.utilitarian.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.aesthetic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.social.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.individualistic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
    tHead.traditional.innerWidth(sD_tHead_minusBorders * 0.07820738137083);

    // tBody Columns Variable Definition
    var tBodyColumns = {
      students: $('tbody.student-data td:nth-child(1)'),
      gender: $('tbody.student-data td:nth-child(2)'),
      class: $('tbody.student-data td:nth-child(3)'),
      dominance: $('tbody.student-data td:nth-child(4)'),
      influencing: $('tbody.student-data td:nth-child(5)'),
      steadiness: $('tbody.student-data td:nth-child(6)'),
      compliance: $('tbody.student-data td:nth-child(7)'),
      theoretical: $('tbody.student-data td:nth-child(8)'),
      utilitarian: $('tbody.student-data td:nth-child(9)'),
      aesthetic: $('tbody.student-data td:nth-child(10)'),
      social: $('tbody.student-data td:nth-child(11)'),
      individualistic: $('tbody.student-data td:nth-child(12)'),
      traditional: $('tbody.student-data td:nth-child(13)')
    }

    // tHead and tBody column width alignment
    tBodyColumns.students.innerWidth(tHead.students.innerWidth());
    tBodyColumns.gender.innerWidth(tHead.gender.innerWidth());
    tBodyColumns.class.innerWidth(tHead.class.innerWidth());
    tBodyColumns.dominance.innerWidth(tHead.dominance.innerWidth());
    tBodyColumns.influencing.innerWidth(tHead.influencing.innerWidth());
    tBodyColumns.steadiness.innerWidth(tHead.steadiness.innerWidth());
    tBodyColumns.compliance.innerWidth(tHead.compliance.innerWidth());
    tBodyColumns.theoretical.innerWidth(tHead.theoretical.innerWidth());
    tBodyColumns.utilitarian.innerWidth(tHead.utilitarian.innerWidth());
    tBodyColumns.aesthetic.innerWidth(tHead.aesthetic.innerWidth());
    tBodyColumns.social.innerWidth(tHead.social.innerWidth());
    tBodyColumns.individualistic.innerWidth(tHead.individualistic.innerWidth());
    tBodyColumns.traditional.innerWidth(tHead.traditional.innerWidth());

    $scope.$apply();
  }

  function responsiveAdaptationDM() {

    // var dashboardFrameElement = $('section.dashboard-frame');
    var dashboardIframe = $('iframe.dashM-iframe');
    $scope.view.baseDimensionsDM = RWD.calculateBaseDimensions(dashboardIframe);

    var iframeWidth = $scope.view.baseDimensionsDM.viewportWidth - 40
    // var dFERatio = dashboardFrameElement.height() / dashboardFrameElement.width()
    // console.log(dashboardFrameElement.width(), dashboardFrameElement.height(), dFERatio);

    var dFERatio = 723/1440;
    dashboardIframe.width(iframeWidth);
    dashboardIframe.height(dashboardIframe.width() * dFERatio);
    // console.log(dFERatio);
    // dashboardIFrame.width()
    // dashboardIframe.height(dashboardIframe.width() * dFERatio);
  }

  // if no dash-data set has been specified from manager, load based on full screen params
  $scope.data.loadVersionFS = function() {
    return new Promise(function(resolve, reject) {
      DashboardService.getStoredDashboardData($stateParams.collection, null, $stateParams.id)
      .then(function(data) {
        console.log(data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        // localStorageService.set('currentDashboardData', data, $scope.view.dashMschoolCode);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
        // DashboardService.createDashboard($scope.data.currentDashboardDataObject, $scope.view.dashMschoolCode);
        DashboardService.d3Setup(inputObject, "studentData");
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
      var inputObject = { data: dashboardData }
      DashboardService.d3Setup(inputObject, "studentData");
      $scope.view.dashDisplayschoolName = dashboardData.metaData.schoolInfo.optionDisplay;
      $('span.sd-title-name').html($scope.view.dashDisplayschoolName + " ");

      // compile ng-click html attribute applied from D3, binding to $scope
      var studentNameCells = $('table.student-data tbody td:nth-of-type(1)');
      $compile(studentNameCells)($scope);

      $scope.view.showFSDashboard = true;
      resolve();
    })
  }

  $scope.view.doneResizing = function() {
    $state.reload();
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
      var inputObject = { columnHeaders: data.columnHeaders, studentData: data.studentData, data: data.studentData}
      DashboardService.d3Setup(inputObject, "studentDetails")
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

  $scope.view.applyFilters = function() {
    DashboardService.applyFilters($scope.view.studentFilter, $scope.view.classFilter, $scope.view.genderFilter);
  }

  $scope.view.toggleStudentSelection = function(studentName) {
    var i = $scope.data.studentFilter.indexOf(studentName)
    if (i > -1) {
      $scope.data.studentFilter.splice(i, 1);
    } else {
      $scope.data.studentFilter.push(studentName);
    }
    console.log($scope.data.studentFilter);
  }

  $scope.view.toggleClassSelection = function(className) {
    var i = $scope.data.classFilter.indexOf(className)
    if (i > -1) {
      $scope.data.classFilter.splice(i, 1);
    } else {
      $scope.data.classFilter.push(className);
    }
    console.log($scope.data.classFilter);
  }

  $scope.view.toggleGenderSelection = function(gender) {
    var i = $scope.data.genderFilter.indexOf(gender)
    if (i > -1) {
      $scope.data.genderFilter.splice(i, 1);
    } else {
      $scope.data.genderFilter.push(gender);
    }
    console.log($scope.data.genderFilter);
  }

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
}])
