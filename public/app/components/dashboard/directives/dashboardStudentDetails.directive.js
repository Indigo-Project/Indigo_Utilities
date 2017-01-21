app.directive('dashboardStudentDetails', ['DashboardService', function(DashboardService) {

  function link(scope, element, attrs) {

    // Generate Student Details Window (D3)
    DashboardService.generateD3Dashboard(scope.data.currentStudentDataObject, "studentDetails")
  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard_studentdetails.html',
    controller: 'DashboardStudentDetails',
    link: link
  }

}])
