app.directive('dashboard', ['$compile','DashboardService', function($compile, DashboardService) {

  function link(scope, element, attrs) {
    DashboardService.d3Setup({ data: scope.data.currentDashboardDataObject }, 'studentData');

    // compile ng-click='view.openStudentDetails' attribute added during d3Setup to DOM
    $compile($('table.student-data tbody td:nth-of-type(1)'))(scope);
  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard.html',
    controller: 'Dashboard',
    link: link
  }
}])
