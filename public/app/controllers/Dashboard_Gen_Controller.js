app.controller('Dashboard_Gen_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', 'Dashboard_Gen', function($scope, $state, $http, Main_Service, TTI_API, socket, $window, Dashboard_Gen) {

  $scope.data = {};
  $scope.uploader = {};
  $scope.view = {};

  $scope.view.selectedFunction = "dashboard_gen";
  $scope.view.displayDashboard = false;
  $scope.view.dashboardSection = "studentData";

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

  console.log('d3', d3);

  // $scope.uploader.file = undefined;
  $scope.uploader.loadedFiles = [];

  $scope.uploader.addChosenReports = function() {
    if($scope.uploader.file === undefined)  {
      alert("NO FILE UPLOADED");
    } else {
    $scope.uploader.loadedFiles.push(
      {name: $('input[type=file]').val().substring(12),
      reportType: $scope.uploader.reportType,
      role: $scope.uploader.role,
      data: $scope.uploader.file,
      schoolYearTaken: $scope.uploader.schoolYearTaken,
      class: $scope.uploader.class});
      angular.element("input[type='file']").val(null);
    }
    $scope.uploader.reportType = undefined;
    $scope.uploader.file = undefined;
    $scope.uploader.role = undefined;
    $scope.uploader.schoolYearTaken = undefined;
    $scope.uploader.class = undefined;
    $('input[type=file]').val(null)
    // console.log($scope.uploader.loadedFiles);
  }

  $scope.data.generateDashboard = function() {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else {
      console.log('GENERATING');
      $scope.view.displayDashboard = true;
      Dashboard_Gen.studentData($scope.uploader.loadedFiles);
    }
  }

  $scope.view.studentDataTableSort = function() {
    console.log('table sort');
    // Dashboard_Gen.studentDataTableSort()
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
