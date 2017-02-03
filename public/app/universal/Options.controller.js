app.controller('Options', ['$scope', '$state', 'localStorageService', function($scope, $state, localStorageService) {

  $scope.view = {};

  $scope.view.logout = function() {
    console.log('logout');
    localStorageService.clearAll();
    $state.go('login');
  }

}])
