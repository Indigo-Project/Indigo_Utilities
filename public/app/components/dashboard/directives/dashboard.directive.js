app.directive('dashboard', ['$compile', '$rootScope', 'DashboardService', function($compile, $rootScope, DashboardService) {

  function link(scope, element, attrs) {

    DashboardService.generateD3Dashboard({ data: scope.data.currentDashboardDataObject }, 'studentData');

    // console.log(window.location);
    // console.log(window.parent.location);
    // console.log(document.referrer);
    // console.log(document.location.href);

    var url = (window.location != window.parent.location)
            ? document.referrer
            : document.location.origin;

    // console.log(url);


    $rootScope.stateIsLoading = false;

  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard.html',
    controller: 'Dashboard',
    link: link
  }
}])
