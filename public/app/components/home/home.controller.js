app.controller('Home', ['$scope', '$state', '$http', 'siteNavigation', 'socket', function($scope, $state, $http, siteNavigation, socket) {

  $scope.view = {};
  $scope.uploader = {};
  $scope.data = {};

  $scope.view.selectedFunction = "home";

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

}])
