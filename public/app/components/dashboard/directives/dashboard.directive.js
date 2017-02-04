app.directive('dashboard', ['$compile', '$rootScope', 'DashboardService', function($compile, $rootScope, DashboardService) {

  function link(scope, element, attrs) {

    DashboardService.generateD3Dashboard({ data: scope.data.currentDashboardDataObject }, 'studentData');

    $rootScope.stateIsLoading = '';

  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard.html',
    controller: 'Dashboard',
    link: link
  }
}])
