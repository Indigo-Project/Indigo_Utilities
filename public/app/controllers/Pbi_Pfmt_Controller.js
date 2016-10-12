app.controller('Pbi_Pfmt_Controller', ['$scope', '$state', '$http', 'FileSaver', 'Blob', function($scope, $state, $http, FileSaver, Blob) {

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
    // console.log($scope.uploader.reportType);
    // console.log($scope.uploader.file);
    if($scope.uploader.reportType === undefined || $scope.uploader.file === undefined || $scope.uploader.role === undefined)  {
      console.log("REPORT TYPE, ROLE, AND FILE UPLOAD ARE ALL REQUIRED");
      alert("REPORT TYPE, ROLE, AND FILE UPLOAD ARE ALL REQUIRED");
    } else if ($scope.uploader.role === "Students" && ($scope.uploader.class === undefined || $scope.uploader.schoolYearTaken === undefined)) {
      alert("FOR STUDENTS, SCHOOL YEAR TAKEN AND CLASS ARE REQUIRED. IF FIELDS HAVE BEEN POPULATED, CORRECT THE FORMAT");
    } else {
      $scope.uploader.loadedFiles.push(
        {name: $('input[type=file]').val().substring(12),
        reportType: $scope.uploader.reportType,
        role: $scope.uploader.role,
        data: $scope.uploader.file,
        schoolYearTaken: $scope.uploader.schoolYearTaken,
        class: $scope.uploader.class});
      angular.element("input[type='file']").val(null);
      }
    $scope.uploader.reportType = undefined;
    $scope.uploader.file = undefined;
    $scope.uploader.role = undefined;
    $scope.uploader.schoolYearTaken = undefined;
    $scope.uploader.class = undefined;
    $('input[type=file]').val(null)
    // console.log($scope.uploader.loadedFiles);
  }

  $scope.data.formatCSVFiles = function(fileName) {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else if (fileName === undefined || fileName === "" ) {
      alert("PLEASE ENTER DESIRED NAME FOR DOWNLOAD FILE - CANNOT BE BLANK");
    } else {
      console.log('FORMATTING');
      $http({
        method: 'POST',
        url: '/api/upload-csv',
        data: {inputFiles:$scope.uploader.loadedFiles, outputFileName: fileName},
        responseType: 'blob'
      }).success(function(data, status, headers, config) {
        var blob = new Blob([data], {type: 'text/csv' });
        var fileName = headers('content-disposition');
        console.log(blob);
        console.log(fileName);
        FileSaver.saveAs(blob, fileName);
        // console.log(data);
        // console.log(status);
        // console.log(headers);
        // console.log(config);
      }).catch(function(err) {
        console.log(err);
      })
    }
  }
}])
