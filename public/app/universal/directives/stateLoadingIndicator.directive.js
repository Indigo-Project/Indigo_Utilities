app.directive('stateLoadingIndicator', ['$rootScope', function($rootScope) {

  return {
    restrict: 'E',
    templateUrl: 'app/universal/directives/partials/state-loading-indicator.html',
    controller: function($scope) {
      $scope.logo = "../../../../assets/images/indigo.png"
    }
  }

}])
