app.controller('Dashboard', ['$rootScope','$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', 'Fullscreen', function($rootScope, $compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD, Fullscreen) {

  $scope.data = {};
  $scope.view = {};

  $scope.data.studentFilter = [];
  $scope.data.classFilter = [];
  $scope.data.genderFilter = [];
  $scope.data.currentDashboardDataObject;

  $scope.view.studentFilter = [];
  $scope.view.classFilter = [];
  $scope.view.genderFilter = [];
  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";

  $scope.data.fathymContainer = true;

  $scope.view.toggleFullScreen = function () {
    Fullscreen.isEnabled() ? Fullscreen.cancel() : Fullscreen.all();
  }

  // RWD resize reaction event
  $scope.view.responsiveAdaptationDashboard = function() {
    RWD.responsiveAdaptationDashboard();
    $scope.$apply();
  }

  $scope.view.doneResizing = function() {
    $state.reload();
  }

  // open student details window when student name is clicked
  $scope.view.openStudentDetails = function(event) {

    function getStudentDataObjectFromRouteParams () {
      return new Promise(function(resolve, reject) {

        var studentNameCondensed = event.currentTarget.innerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase();
        var nameFromTable = event.currentTarget.childNodes[0].wholeText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase();;
        var rowIndex = event.currentTarget.parentNode.attributes['row-index'].value;
        var studentPath = studentNameCondensed + rowIndex;
        var schoolCollection = $location.path().split("/")[2];
        var versionId = $location.path().split("/")[3];

        var currentDashboardData = localStorageService.get("currentDashboardData");
        var dashDataStudents = currentDashboardData.compiledData.studentData;
        var columnHeaders = currentDashboardData.compiledData.columnHeaders[0];
        var studentIndex;
        for (var i = 0; i < dashDataStudents.length; i++) {

          // using row index
          // var pathCode = dashDataStudents[i][0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase() + i;
          // if (studentPath === pathCode) studentIndex = i;

          // without using row index
          var pathCode = dashDataStudents[i][0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").toLowerCase();
          if (nameFromTable === pathCode) studentIndex = i;
        }
        // console.log(dashDataStudents, studentIndex);
        var studentData = dashDataStudents[studentIndex];

        // Create key to define whether current student uses DNA or HD Skills
        var metaData = {};
        var skillsOptionByClassGroupKey = {};
        var cDDKeys = Object.keys(currentDashboardData);
        for (var i = 0; i < cDDKeys.length; i++) {
          if (cDDKeys[i] !== 'compiledData' && cDDKeys[i] !== 'metaData' && cDDKeys[i] !== '_id') {
            var topPriorityString = currentDashboardData[cDDKeys[i]].uploadTypes[currentDashboardData[cDDKeys[i]].uploadTypePriorityIndex[0]];
            skillsOptionByClassGroupKey[cDDKeys[i]] = topPriorityString.substring(0,6) === 'Talent' ? 'DNA' : topPriorityString === "Trimetrix HD Talent (Legacy) Temp" ? 'DNA' : 'HD';
          }
        }
        for (var classGroup in skillsOptionByClassGroupKey) {
          if (studentData[4] + "/" + studentData[5] === classGroup) {
            metaData.skillsOption = skillsOptionByClassGroupKey[classGroup];
          }
        }

        var studentDataObj = { stateInfo: [schoolCollection, versionId, studentPath], columnHeaders: columnHeaders, studentData: studentData, metaData: metaData }

        if (studentDataObj) {
          localStorageService.set("currentStudentData", studentDataObj);
          resolve(studentDataObj)
        } else {
          reject('no student data');
        }
      })
    }

    getStudentDataObjectFromRouteParams()
    .then(function(data) {
      $state.go('dashboard.dashboard_student_detail', { collection: data.stateInfo[0], id: data.stateInfo[1], studentpath: data.stateInfo[2]});
    }).catch(function(error) {
      console.log(error);
    })
  }

  // if no object in local storage, or localstorage object's id is not same as in url parameter, get correct student data object
  $scope.data.dashboardInit = function() {

      window.requestAnimationFrame($scope.view.responsiveAdaptationDashboard);
      var resizeTimeout;
      $(window).on("resize orientationChange", function() {
        clearTimeout(resizeTimeout);
        // 100ms after most recent resize, refresh the $state
        resizeTimeout = setTimeout($scope.view.doneResizing(), 100);
        window.requestAnimationFrame($scope.view.responsiveAdaptationDashboard);
      })
    // });
  }

  // Initialization Execution
  $scope.data.dashboardInit();

}])
