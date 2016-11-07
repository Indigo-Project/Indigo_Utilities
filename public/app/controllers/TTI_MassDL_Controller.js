app.controller('TTI_MassDL_Controller', ['$scope', '$state', 'Main_Service', function($scope, $state, Main_Service) {

  $scope.view = {};
  $scope.view.selectedFunction = "tti_massdl";

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

}])
