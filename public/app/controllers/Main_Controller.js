app.controller('Main_Controller', ['$scope', '$state', 'Main_Service', function($scope, $state, Main_Service) {

  $scope.view = {};
  $scope.view.selectedFunction = $state.current.name;

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

}])
