app.controller('Main', ['$scope', '$state', 'siteNavigation', function($scope, $state, siteNavigation) {

  $scope.view = {};

  $scope.view.selectedFunction = $state.current.name;
  console.log($state.current.name);

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

}])
