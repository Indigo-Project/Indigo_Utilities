app.controller('DashboardGenerator', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.data = {};
  $scope.uploader = {};
  $scope.view = {};

  $scope.data.schoolName = "";
  $scope.data.schoolCode = "";
  $scope.data.dashboardDataObjectName = "";

  $scope.view.selectedFunction = "dashboard_gen";
  $scope.view.dashboardCreationStatus = "";
  $scope.view.uploadOptionStatus = "no selection"
  $scope.view.dashboardGeneratedVersion = "";
  $scope.view.dashboardGeneratedSchool = "";
  $scope.view.dashboardDateCreated = "";
  $scope.view.schoolNameOptions = [];

  $scope.uploader.loadedFiles = [];

  // load school name options for 'Select School' dropdown
  $scope.view.loadSchoolNameOptions = function() {
    DashboardService.retrieveSchoolNameOptions()
    .then(function(schools) {
      var schoolKeys = Object.keys(schools.data);
      for (var i = 0; i < schoolKeys.length; i++) {
        var schoolObj = { code: schoolKeys[i], optionDisplay: schools.data[schoolKeys[i]].optionDisplay}
        $scope.view.schoolNameOptions.push(schoolObj);
      }
      console.log($scope.view.schoolNameOptions);
      $scope.$apply();
    })
  }

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

  $scope.view.displayOption = function(status) {
    $scope.view.uploadOptionStatus = status;
    if (status === 'csv-upload') {
      return 'option-selected';
    } else if (status === 'tti-import') {
      return 'option-selected';
    }
  }

  $scope.uploader.addChosenReports = function(uploadType) {
    if ($scope.uploader.role === undefined) {
      alert("PLEASE SELECT ROLE")
    }
    else if ($scope.uploader.role === 'Students' && ($scope.uploader.schoolYearTaken === undefined || $scope.uploader.class === undefined)) {
      if ($scope.uploader.schoolYearTaken === undefined && $scope.uploader.class === undefined) {
        alert("PLEASE ENTER SCHOOL YEAR TAKEN AND CLASS")
      }
      else if ($scope.uploader.schoolYearTaken === undefined) {
        alert("PLEASE ENTER SCHOOL YEAR TAKEN")
      }
      else if ($scope.uploader.class === undefined) {
        alert("PLEASE ENTER CLASS")
      }
    }
    else if ($scope.uploader.file === undefined)  {
      alert("NO FILE UPLOADED");
    } else {
      $scope.uploader.loadedFiles.push(
        {uploadType: uploadType,
        name: $('input[type=file]').val().substring(12),
        reportType: $scope.uploader.reportType,
        role: $scope.uploader.role,
        data: $scope.uploader.file,
        schoolYearTaken: $scope.uploader.schoolYearTaken,
        class: $scope.uploader.class});

      angular.element("input[type='file']").val(null);
      $scope.uploader.reportType = undefined;
      $scope.uploader.file = undefined;
      $scope.uploader.role = undefined;
      $scope.uploader.schoolYearTaken = undefined;
      $scope.uploader.class = undefined;
      $('input[type=file]').val(null)
    }
  }

  $scope.data.generateDashboard = function() {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else if (!$scope.data.schoolCode) {
      alert("PLEASE SELECT SCHOOL");
    } else {
      if(confirm("Please confirm that the school name is correct. Upon submission for dashboard generation, this name will become a unique identifier for the dashboard, associated within the same grouping as future versions of dashboards for the same school. refer to FAQ for a more detailed explanation of how this works.")) {
        $scope.view.dashboardCreationStatus = "generating";

        for (var schoolKey in $scope.view.dashboardNameOptions) {
          if ($scope.view.dashboardNameOptions[schoolKey].code === $scope.data.schoolCode) {
            $scope.data.schoolName = $scope.view.dashboardNameOptions[schoolKey].name;
          }
        }
        // $scope.data.schoolName = $scope.view.dashboardNameOptions[$scope.data.schoolCode].name;

        DashboardService.createDashboardDataObject($scope.uploader.loadedFiles, $scope.data.schoolCode, $scope.data.dashboardDataObjectName)
        .then(function(data) {
          console.log('dashboard data object', data);
          var data = data.data;
          var dataObjKeys = Object.keys(data);
          $scope.data.studentNumber = data.compiledData.studentData.length;
          $scope.data.studentClasses = [];

          // generate class array
          for (var i = 0; i < dataObjKeys.length; i++) {
            if (dataObjKeys[i] === "Staff" || dataObjKeys[i] === "compiledData" || dataObjKeys[i] === "metaData" || dataObjKeys[i] === "_id") {
              console.log(dataObjKeys[i] + ' not a student group - not added to class options');
            } else {
              $scope.data.studentClasses.push(dataObjKeys[i].substring(0,4))
            }
          }

          // DashboardService.generateD3Dashboard({ data: data }, "studentData")
          // $('span.sd-title-name').html($scope.data.schoolName + " ");

          $scope.view.dashboardCreationStatus = "success";
          $scope.view.dashboardGeneratedVersion = data.metaData.dataObjectTitle;
          $scope.view.dashboardGeneratedSchool = data.metaData.schoolInfo.optionDisplay;
          $scope.view.dashboardDateCreated = data.metaData.dateCreated;
          $scope.$apply();
        })
      } else {
        console.log('Generation Aborted');
      }
    }
  }

}])
