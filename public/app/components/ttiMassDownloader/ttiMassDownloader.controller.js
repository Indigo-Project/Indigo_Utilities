app.controller('TTIMassDownloader', ['$scope', '$state', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', function($scope, $state, $http, siteNavigation, TTI_API, socket, $window) {

  // socket.disconnect()
  // .then(function() {
  //   console.log('disconnected');
  //   socket.connect('http://localhost:3000');
  //   console.log('reconnected');
  // })

  // socket.connect('http://localhost:3000')


  $scope.data = {};
  $scope.view = {};
  $scope.form = {};

  $scope.view.selectedFunction = "tti_massdl";

  $scope.data.linkStatusMeta = false;
  $scope.data.downloadStatus = "";
  $scope.data.reportTypeOptions = [];
  $scope.data.currentLinkReportList;

  $scope.view.troubleshootingHidden = true;
  $scope.view.sumPageGenHidden = true;
  $scope.view.linkIdStatus = "";
  $scope.view.formStatus = "Download";
  $scope.view.successMessage = "";
  $scope.view.dupNumber = "";
  $scope.view.dlCount = 0;
  $scope.view.numberOfReportsToDownload = 0;
  $scope.view.statusMessage = $scope.view.dlCount + "/" + $scope.view.numberOfReportsToDownload + " Reports Downloaded...";

  socket.on('reportNumber', function(data) {
    $scope.view.numberOfReportsToDownload = data.number;
    $scope.view.statusMessage = $scope.view.dlCount + "/" + $scope.view.numberOfReportsToDownload + " Reports Downloaded...";
  })

  socket.on('dlCount', function(data) {
    $scope.view.dlCount = data.dlCount
    $scope.view.statusMessage = $scope.view.dlCount + "/" + $scope.view.numberOfReportsToDownload + " Reports Downloaded...";
  })

  socket.on('preparingFiles', function(data) {
    $scope.view.statusMessage = "Zipping and Delivering Files...";
  })

  $scope.form.login = "";
  $scope.form.password = "";
  $scope.form.accountID = "";
  $scope.form.linkID = "";
  $scope.form.selectedReportTypes = [];

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

  // detect refresh event
  // $window.onbeforeunload = function() {
  //
  // };

  $scope.view.toggleTroubleshooting = function() {
    $scope.view.sumPageGenHidden = true;
    $scope.view.troubleshootingHidden = !$scope.view.troubleshootingHidden
  }

  $scope.view.toggleSumPageGen = function() {
    $scope.view.troubleshootingHidden = true;
    $scope.view.sumPageGenHidden = !$scope.view.sumPageGenHidden;
  }

  $scope.$on('$stateChangeStart', function(event, next, current) {
    if ($scope.data.downloadStatus === "Processing") {
      if(!confirm("Are you sure you want to leave this page? ")) {
        event.preventDefault();
    }
   }
  });


  // Validate TTI Link
  $scope.data.validateLink = function() {
    $scope.form.selectedReportTypes = [];
    $scope.data.reportTypeOptions = [];
    $scope.data.downloadStatus = "";
    if ($scope.form.linkID && $scope.form.accountID && $scope.form.login && $scope.form.password) {
      if ($scope.form.linkID.length === 9) {
        $scope.view.linkIdStatus = "verifying";
        $scope.data.linkStatusMeta = true;
        TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID, null, "verify", null)
        .then(function(data1) {
          if (data1.data.error || !data1.data) {
            $scope.view.linkIdStatus = "unverified";
            $scope.$apply();
          } else {
            $scope.view.linkIdStatus = "verified";
            $scope.data.reportTypeOptions = data1.data.reportTypes;
            $scope.data.currentLinkReportList = data1.data.reportList
            $scope.data.currentLinkName = data1.data.linkInfo.link.name
            $scope.$apply();
          }
        })
      } else {
        if ($scope.data.linkStatusMeta) {
          $scope.view.linkIdStatus = "incomplete"
        } else {
          $scope.view.linkIdStatus = "";
        }
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
    console.log($scope.form.selectedReportTypes);
  }

  // Submit Batch Download
  $scope.data.batchDownload = function() {
    $scope.view.dlCount = 0;
    $scope.view.numberOfReportsToDownload = 0;
    $scope.view.formStatus = "Validating Request...";
    if(!$scope.form.selectedReportTypes.length) {
      alert('You need to select at least 1 report type to proceed');
      $scope.view.formStatus = "Download";
    } else {
      TTI_API.validateRequestData($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID, $scope.form.selectedReportTypes, "filter", $scope.data.currentLinkReportList)
      .then(function(data1) {
        var filteredReportList = data1.data.filteredReportList;
        if (data1.data.error) {
          alert(data1.data.error);
          $scope.view.formStatus = "Download";
          $scope.$apply();
        } else {
          TTI_API.validateLocalDir($scope.form.directory)
          .then(function(data2) {
            if (data2.data.error) {
              alert(data2.data.message)
              $scope.view.formStatus = "Download";
              $scope.$apply();
            } else {
              if (confirm("download " + filteredReportList.length + " reports from '" + $scope.data.currentLinkName + "' ?")) {
                $scope.data.downloadStatus = "Processing";
                $scope.view.formStatus = "Download in progress...";
                TTI_API.batchDownload($scope.form.login, $scope.form.password, $scope.form.accountID, $scope.form.linkID, filteredReportList, $scope.form.selectedReportTypes)
                .then(function(data) {
                  console.log(data);
                  console.log(data.data.dlCount);
                  console.log(data.data.dupNumber);
                  $scope.view.formStatus = "Download";
                  $scope.view.successMessage = "Success! " + data.data.dlCount + " Reports Downloaded";
                  $scope.data.downloadStatus = "Complete";
                  if (data.data.dupNumber > 0) {
                    $scope.view.dupNumber = " - " + " duplicates removed: " + data.data.dupNumber;
                  }
                  $scope.$apply();
                }).catch(function(error) {
                  $scope.data.downloadStatus = "";
                  $scope.view.formStatus = "Download";
                  console.log(error);
                  $scope.$apply();
                })
              } else {
                $scope.view.formStatus = "Download";
                $scope.$apply();
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
