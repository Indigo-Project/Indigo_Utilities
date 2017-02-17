app.controller('CreateDashboard', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', '$timeout', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'DashboardManagerService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, $timeout, siteNavigation, TTI_API, socket, $window, DashboardService, DashboardManagerService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.view = {};
  $scope.data = {};

  $scope.view.closeCreateDashboard = function() {
    $state.go('dashboard_manager');
  }

}])
