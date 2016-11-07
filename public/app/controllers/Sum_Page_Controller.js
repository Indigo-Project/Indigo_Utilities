app.controller("Sum_Page_Controller", ['$scope', '$state', '$http', 'Main_Service', function($scope, $state, $http, Main_Service) {

  $scope.view = {}
  $scope.data = {}

  $scope.view.selectedFunction = "sum_page";

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

}])
