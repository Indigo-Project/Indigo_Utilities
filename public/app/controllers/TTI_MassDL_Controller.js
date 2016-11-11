app.controller('TTI_MassDL_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', function($scope, $state, $http, Main_Service, TTI_API) {

  $scope.view = {};
  $scope.data = {};
  $scope.form = {};

  $scope.view.selectedFunction = "tti_massdl";
  $scope.view.linkIdStatus = "";
  $scope.view.formStatus = "Download";
  $scope.view.successMessage = "";
  $scope.view.dupNumber = "";

  $scope.data.linkStatusMeta = false;
  $scope.data.downloadStatus = "";
  $scope.data.reportTypeOptions = [];

  $scope.form.login = "";
  $scope.form.password = "";
  $scope.form.accountID = "";
  $scope.form.linkID = "";
  $scope.form.selectedReportTypes = [];

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

  // Validate TTI Link
  $scope.data.validateLink = function() {
    $scope.data.downloadStatus = "";
    if ($scope.form.linkID.length === 9) {
      $scope.view.linkIdStatus = "verifying";
      $scope.data.linkStatusMeta = true;
      TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID)
      .then(function(data1) {
        // console.log(data1);
        if (data1.data.error) {
          $scope.view.linkIdStatus = "unverified";
          $scope.$apply();
        } else {
          $scope.view.linkIdStatus = "verified";
          // console.log(data1.data.reportList.length);
          for (var i = 0; i < data1.data.reportList.length; i++) {
            var currentReportType = data1.data.reportList[i][11]
            var alreadyExists = false;
            for (var j = 0; j < $scope.data.reportTypeOptions.length; j++) {
              if(currentReportType === $scope.data.reportTypeOptions[j]) {
                alreadyExists = true;
              }
            }
            if (!alreadyExists) {
              $scope.data.reportTypeOptions.push(currentReportType);
            }
          }
          console.log($scope.data.reportTypeOptions);
          $scope.$apply();
        }
      })
    } else {
      if ($scope.data.linkStatusMeta) {
        $scope.view.linkIdStatus = "verifying"
      } else {
        $scope.view.linkIdStatus = "";
      }
    }
  }

  $scope.form.toggleCheckboxSelection = function(reportType) {
    $scope.data.downloadStatus = "";
    var idx = $scope.form.selectedReportTypes.indexOf(reportType);

    if (idx > -1) {
      $scope.form.selectedReportTypes.splice(idx, 1);
    }

    else {
      $scope.form.selectedReportTypes.push(reportType);
    }

    // console.log($scope.form.selectedReportTypes);
  }

  // Submit Batch Download Form
  $scope.data.batchDownload = function() {
    $scope.data.downloadStatus = "Processing";
    $scope.view.formStatus = "Validating Request...";
    console.log($scope.data.reportTypeOptions);
    var reportTypesUserOutput = $scope.form.selectedReportTypes;
    if(!reportTypesUserOutput.length) {
      alert('You need to select at least 1 report type to proceed');
      $scope.view.formStatus = "Download";
      $scope.$apply();
    } else {
      TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID, reportTypesUserOutput)
      .then(function(data1) {
        var filteredReportList = data1.data.filteredReportList;
        var linkInfo = data1.data.linkInfo;
        if (data1.data.error) {
          alert(data1.data.error);
          $scope.view.formStatus = "Download";
          $scope.$apply();
        } else {
          TTI_API.validateLocalDir($scope.form.directory)
          .then(function(data2) {
            if (data2.data.error) {
              alert(data2.data.error)
              $scope.view.formStatus = "Download";
              $scope.$apply();
            } else {
              if(confirm("download " + filteredReportList.length + " reports from '" + linkInfo.link.name + "' to " + data2.data + "?")) {
                $scope.view.formStatus = "Download in progress...";
                TTI_API.batchDownload($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID, $scope.form.directory, filteredReportList, reportTypesUserOutput)
                .then(function(data) {
                  console.log(data);
                  $scope.view.formStatus = "Download";
                  $scope.view.successMessage = "Success! " + data.data.dlCount + "/" + data.data.reportListLength + " Reports Downloaded";
                  $scope.data.downloadStatus = "Complete";
                  if (data.data.dupNumber > 0) {
                    $scope.view.dupNumber = "- (" + data.data.dupNumber + " duplicates removed)";
                  }
                  $scope.$apply();
                }).catch(function(error) {
                  console.log(error);
                })
              }
            }
          }).catch(function(error) {
            console.log(error);
          })
        }
      }).catch(function(error) {
        console.log(error);
      })
    }


  }

}])
