app.directive('dashboardStudentDetails', ['DashboardService', function(DashboardService) {

  function link(scope, element, attrs) {
    // Generate student Details Popup using D3
    DashboardService.d3Setup(scope.data.currentStudentDataObject, "studentDetails")
  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard_studentdetails.html',
    controller: 'DashboardStudentDetails',
    link: link
  }

}])
