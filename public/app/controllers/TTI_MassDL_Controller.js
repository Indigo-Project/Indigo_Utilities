app.controller('TTI_MassDL_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', function($scope, $state, $http, Main_Service, TTI_API) {

  $scope.view = {};
  $scope.data = {};
  $scope.form = {};

  $scope.view.selectedFunction = "tti_massdl";
  $scope.view.formStatus = "Download";

  $scope.data.linkStatusMeta = false;
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
    if ($scope.form.linkID.length === 9) {
      $scope.data.linkStatusMeta = true;
      TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID)
      .then(function(data1) {
        if (data1.data.error) {
          $scope.view.linkIdStatus = "Link Is Not Verified";
          $scope.$apply();
        } else {
          console.log(data1.data);
          $scope.view.linkIdStatus = "Link Verified";
          for (var i = 0; i < data1.data.length; i++) {
            console.log(data1.data[i][11]);
            var currentReportType = data1.data[i][11]
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
          // var reportviews = data1.data.link.reportviews;
          // for (var i = 0; i < reportviews.length; i++) {
          //   console.log(reportviews[i]);
          //   $scope.data.reportTypeOptions.push(reportviews[i]);
          // }
          $scope.$apply();
        }
      })
    } else {
      if ($scope.data.linkStatusMeta) {
        $scope.view.linkIdStatus = "Link Is Not Verified"
      } else {
        $scope.view.linkIdStatus = "";
      }
    }
  }

  $scope.form.toggleCheckboxSelection = function(reportType) {
    var idx = $scope.form.selectedReportTypes.indexOf(reportType);

    if (idx > -1) {
      $scope.form.selectedReportTypes.splice(idx, 1);
    }

    else {
      $scope.form.selectedReportTypes.push(reportType);
    }

    console.log($scope.form.selectedReportTypes);
  }

  // Submit Batch Download Form
  $scope.data.batchDownload = function() {
    console.log($scope.data.reportTypeOptions);
    var reportTypesUserOutput = $scope.form.selectedReportTypes;
    if(!reportTypesUserOutput.length) {
      alert('You need to select at least 1 report type to proceed');
    } else {
      console.log(reportTypesUserOutput);
      // TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID)
      // .then(function(data1) {
      //   if (data1.data.error) {
      //     alert(data1.data.error);
      //   } else {
      //     TTI_API.validateLocalDir($scope.form.directory)
      //     .then(function(data2) {
      //       if (data2.data.error) {
      //         alert(data2.data.error)
      //       } else {
      //         if(confirm("download X reports from '" + data1.data.link.name + "' to " + data2.data + "?")) {
      //           $scope.view.formStatus = "Download in progress...";
      //           $scope.$apply();
      //         }
      //       }
      //     }).catch(function(error) {
      //       console.log(error);
      //     })
      //   }
      // }).catch(function(error) {
      //   console.log(error);
      // })
    }


  }

}])
