app.directive('dashboard', ['$compile','DashboardService', function($compile, DashboardService) {

  function link(scope, element, attrs) {

    // Generate D3 Dashboard
    DashboardService.generateD3Dashboard({ data: scope.data.currentDashboardDataObject }, 'studentData');
  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard.html',
    controller: 'Dashboard',
    link: link
  }
}])
