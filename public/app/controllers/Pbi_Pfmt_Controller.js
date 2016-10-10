app.controller('Pbi_Pfmt_Controller', ['$scope', '$state', '$http', 'FileUploader', function($scope, $state, $http, FileUploader) {

  $scope.view = {};
  $scope.uploader = {};
  $scope.data = {};

  $scope.view.selectedFunction = "pbi_pfmt";
  // $scope.view.fileNames = [];

  $scope.uploader.file = undefined;
  $scope.uploader.loadedFiles = [];

  console.log($scope.uploader.reportType);
  console.log($scope.uploader.file);

  // dynamically change options based on selected function
  $scope.view.accessFunction = function() {
    console.log($state);
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

  // $scope.server.uploadCsv = function() {
  //   $http.get("/api/upload-csv")
  //   .then(function(data) {
  //     console.log(data);
  //   })
  // }

  $scope.uploader.addChosenReports = function() {
    console.log($scope.uploader.reportType);
    console.log($scope.uploader.file);
    if($scope.uploader.reportType === undefined || $scope.uploader.file === undefined) {
      console.log("REPORT TYPE AND FILE UPLOAD ARE BOTH REQUIRED");
      alert("REPORT TYPE AND FILE UPLOAD ARE BOTH REQUIRED");
    } else {
      $scope.uploader.loadedFiles.push(
        {name: $('input[type=file]').val().substring(12),
        reportType: $scope.uploader.reportType,
        data: $scope.uploader.file});
      angular.element("input[type='file']").val(null);
      }
    $scope.uploader.reportType = undefined;
    $scope.uploader.file = undefined;
    $('input[type=file]').val(null)
    console.log($scope.uploader.loadedFiles);
  }

  $scope.data.formatCSVFiles = function() {
    console.log('FORMAT');
    console.log($scope.uploader.loadedFiles);
  }
}])
