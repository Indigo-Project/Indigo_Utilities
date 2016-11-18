app.controller('Blue_List_Controller', ['$scope', '$state', '$http', 'Main_Service', 'FileSaver', 'Blob', 'socket', function($scope, $state, $http, Main_Service, FileSaver, Blob, socket) {

  $scope.view = {};
  $scope.uploader = {};
  $scope.data = {};

  $scope.view.selectedFunction = "blue_list";

  // $scope.uploader.file = undefined;
  $scope.uploader.loadedFiles = [];

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

  $scope.uploader.addChosenReports = function() {
    if($scope.uploader.file === undefined)  {
      alert("NO FILE UPLOADED");
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

  $scope.data.generateEntList = function(fileName) {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else if (fileName === undefined || fileName === "" ) {
      alert("PLEASE ENTER DESIRED NAME FOR DOWNLOAD FILE - CANNOT BE BLANK");
    } else {
      console.log('GENERATING');
      $http({
        method: 'POST',
        url: '/api/blue-list',
        data: { inputFiles:$scope.uploader.loadedFiles, outputFileName: fileName }
        // responseType: 'blob'
      })
      .success(function(data, status, headers, config) {
        var blob = new Blob([data], {type: 'text/csv' });
        var fileName = headers('content-disposition');
        FileSaver.saveAs(blob, fileName);
      }).catch(function(error) {
          console.log(error);
          alert(error.data.externalMessage);
      })
    }
  }

}])
