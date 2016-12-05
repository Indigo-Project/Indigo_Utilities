app.controller('Dashboard_Gen_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', function($scope, $state, $http, Main_Service, TTI_API, socket, $window) {

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
    // if ($scope.uploader.loadedFiles.length === 0) {
    //   alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    // } else {
      console.log('GENERATING');
      $scope.view.displayDashboard = true;
      $http({
        method: 'POST',
        url: '/api/dashboard-gen',
        data: { inputFiles: $scope.uploader.loadedFiles }
      })
    // }
  }

  $scope.view.dashboardNav = function(dashboardSection) {
    $scope.view.dashboardSection = dashboardSection;
    $('.dashboard-nav').removeClass('dash-frame-selected');
    $('.dashboard-nav.' + dashboardSection).addClass('dash-frame-selected');
  }


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


  var data = [['c1', 'c2', 'c3', 'c4', 'c5'], ['1','2','3','4','5'], ['a','b','c','d','e']]
  var sortAscending = true;
  var table = d3.select('div.studentData').append('table');
  var titles = d3.keys(data[0]);
  console.log(data[0]);
  console.log(titles);
  var headers = table.append('thead')
                   .selectAll('th')
                   .data(titles).enter()
                   .append('th')
                   .text(function (d) {
	                    return d;
                    })
                   .on('click', function (d) {
                	   headers.attr('class', 'header');

                	   if (sortAscending) {
                	     rows.sort(function(a, b) { return b[d] < a[d]; });
                	     sortAscending = false;
                	     this.className = 'aes';
                	   } else {
                		 rows.sort(function(a, b) { return b[d] > a[d]; });
                		 sortAscending = true;
                		 this.className = 'des';
                	   }

                   });

  var rows = table.append('tbody').selectAll('tr')
               .data(data).enter()
               .append('tr');

  rows.selectAll('td')
    .data(function (d) {
    	return titles.map(function (k) {
    		return { 'value': d[k], 'name': k};
    	});
    }).enter()
    .append('td')
    .attr('data-th', function (d) {
    	return d.name;
    })
    .text(function (d) {
    	return d.value;
    });

}])
