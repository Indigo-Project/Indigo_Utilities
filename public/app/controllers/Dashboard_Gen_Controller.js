app.controller('Dashboard_Gen_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', 'Dashboard_Gen', function($scope, $state, $http, Main_Service, TTI_API, socket, $window, Dashboard_Gen) {

  $scope.data = {};
  $scope.uploader = {};
  $scope.view = {};

  $scope.data.schoolName = "";
  $scope.data.dataObject = "";

  $scope.view.selectedFunction = "dashboard_gen";
  $scope.view.uploadOptionStatus = "no selection"
  $scope.view.displayDashboard = false;
  $scope.view.dashboardSection = "studentData";

  $scope.view.studentFilter = "";
  $scope.view.classFilter = "";
  $scope.view.genderFilter = "";

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

  $scope.view.displayOption = function(status) {
    $scope.view.uploadOptionStatus = status;
    if (status === 'csv-upload') {
      return 'option-selected';
    } else if (status === 'tti-import') {
      return 'option-selected';
    }
  }

  $scope.view.applyStudentFilter = function() {

  }

  // $scope.uploader.file = undefined;
  $scope.uploader.loadedFiles = [];

  $scope.uploader.addChosenReports = function(uploadType) {
    console.log('adding chosen report');
    if ($scope.uploader.role === undefined) {
      alert("PLEASE SELECT ROLE")
    }
    else if ($scope.uploader.role === 'Students' && ($scope.uploader.schoolYearTaken === undefined || $scope.uploader.class === undefined)) {
      console.log(0);
      if ($scope.uploader.schoolYearTaken === undefined && $scope.uploader.class === undefined) {
        console.log(1);
        alert("PLEASE ENTER SCHOOL YEAR TAKEN AND CLASS")
      }
      else if ($scope.uploader.schoolYearTaken === undefined) {
        console.log(2);
        console.log("PLEASE ENTER SCHOOL YEAR TAKEN");
        alert("PLEASE ENTER SCHOOL YEAR TAKEN")
      }
      else if ($scope.uploader.class === undefined) {
        console.log(3);
        console.log("PLEASE ENTER CLASS");
        alert("PLEASE ENTER CLASS")
      }
    }
    else if ($scope.uploader.file === undefined)  {
      alert("NO FILE UPLOADED");
    } else {
      console.log('EXECUTING');
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
    console.log($scope.uploader.loadedFiles);
  }

  $scope.data.generateDashboard = function() {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else if (!$scope.data.schoolName) {
      alert("PLEASE ENTER THE SCHOOL NAME");
    } else {
      confirm("Please confirm that the school name is spelled correctly and as intended. Upon submission for dashboard generation, this name will become the unique identifier for this school, which will be used in the future when creating new dashboards for the same school, and will also appear within the dashboard. refer to FAQ for a more detailed explanation of how this works.")
      console.log('GENERATING');
      Dashboard_Gen.getDataObject($scope.uploader.loadedFiles, $scope.data.schoolName)
      .then(function(data) {
        $scope.data.dataObject = data;
        console.log($scope.data.dataObject);
        $scope.data.studentData = data.data.compiledData.studentData;
        var dataObjKeys = Object.keys(data.data);
        $scope.data.studentClasses = [];
        for (var i = 0; i < dataObjKeys.length; i++) {
          console.log(dataObjKeys[i]);
          if (dataObjKeys[i] === "Staff" || dataObjKeys[i] === "compiledData") {
            console.log('not a student group');
          } else {
            $scope.data.studentClasses.push(dataObjKeys[i].substring(0,4))
          }
        }
        console.log($scope.data.studentClasses);
        $scope.view.displayDashboard = true;
        Dashboard_Gen.createDashboard(data)
        $scope.$apply();
      })
    }
  }

  $scope.view.dashboardNav = function(dashboardSection) {
    $scope.view.dashboardSection = dashboardSection;
    $('.dashboard-nav').removeClass('dash-frame-selected');
    $('.dashboard-nav.' + dashboardSection).addClass('dash-frame-selected');
  }


  // CHART TEST

  // var data = [11, 20, 27, 13, 22];
  //
  // var x = d3.scaleLinear()
  //   .domain([0, d3.max(data)])
  //   .range([0, 220]);
  //
  // d3.select("div.chart")
  //   .selectAll("div")
  //     .data(data)
  //   .enter().append("div")
  //     .style("width", function(d) { return x(d) + "px"; })
  //     .text(function(d) { return d; })



}])
