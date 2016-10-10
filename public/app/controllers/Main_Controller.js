app.controller('Main_Controller', ['$scope', '$state', function($scope, $state) {

  $scope.view = {};
  $scope.view.selectedFunction = $state.current.name;

  // dynamically change options based on selected function
  $scope.view.accessFunction = function() {
    if ($scope.view.selectedFunction === "pbi_pfmt") {
      $state.go("pbi_pfmt");
    } else if ($scope.view.selectedFunction === "blue_list") {
      $state.go("blue_list");
    } else if ($scope.view.selectedFunction === "ent_list") {
      $state.go("ent_list");
    } else if ($scope.view.selectedFunction === "tti_massdl") {
      $state.go("tti_massdl");
    } else if ($scope.view.selectedFunction === "default"){
      $state.go("default");
    }
  }

}])
