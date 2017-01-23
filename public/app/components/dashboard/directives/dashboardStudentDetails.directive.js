app.directive('dashboardStudentDetails', ['$rootScope', 'DashboardService', function($rootScope, DashboardService) {

  function link(scope, element, attrs) {

    DashboardService.generateD3Dashboard(scope.data.currentStudentDataObject, "studentDetails")

    $rootScope.stateIsLoading = false;
    
  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard_studentdetails.html',
    controller: 'DashboardStudentDetails',
    link: link
  }

}])
