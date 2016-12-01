app.controller('Dashboard_Gen_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', function($scope, $state, $http, Main_Service, TTI_API, socket, $window) {

  $scope.data = {};
  $scope.view = {};
  $scope.form = {};

  $scope.view.selectedFunction = "dashboard_gen";

}])
