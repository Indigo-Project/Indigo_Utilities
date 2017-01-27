app.controller('DashboardManager', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', '$timeout', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, $timeout, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.view = {};
  $scope.data = {};

  $scope.view.selectedFunction = "dashboard_manager";

  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";

  $scope.data.schoolNameOptionsLoaded = false;
  $scope.data.dashboardUrl = '';
  $scope.data.showiFrame;
  $scope.data.iFrameHTML;
  $scope.data.copyStatusMessage = 'hidden';

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

  // On Dashboard Manager school selection, configure available versions for selected school
  $scope.view.updateVersionOptions = function() {
    if ($scope.view.dashMschoolCode) {

      $scope.view.showMDashboard ? $scope.view.showMDashboard = false : null;

      var returnVersions = {};
      $scope.view.currentVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
      $scope.view.dashMschoolVersion = "";
      console.log($scope.view.currentVersions);
    } else {
      console.log('NO COLLECTION SELECTED');
    }
  };

  // load current dashboard version data object into $scope variable and local storage from dashboard manager, then create dashboard
  $scope.view.loadVersion = function() {
    $scope.view.showMDashboard = false;
    if ($scope.view.dashMschoolVersion) {
      // console.log($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion);
      DashboardService.retrieveStoredDashboardVersionDataObject($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion)
      .then(function(data) {
        console.log('got data', data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
        DashboardService.generateD3Dashboard(inputObject, "studentData");
        $scope.data.dashboardUrl = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        $scope.view.showMDashboard = true;
        RWD.responsiveAdaptationDM();
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    } else {
      console.log('NO VERSION SELECTED');
    }
  };

  // Open new tab with full screen dashboard
  $scope.view.openFSDashboard = function() {
    window.open($scope.data.dashboardUrl);
  }

  // Dashboard Manager Initialization
  $scope.view.initializeDashboardManager = function() {

    DashboardService.retrieveSchoolNameOptions()
    .then(function(data) {
      $scope.view.schoolNameOptions = data.data;
      var schoolKeys = Object.keys($scope.view.schoolNameOptions);
      for (var i = 0; i < schoolKeys.length; i++) {
        $scope.view.schoolNameOptions[schoolKeys[i]].code = schoolKeys[i]
      }

      DashboardService.retrieveSchoolsWithDashboards()
      .then(function(collections) {
        var collectionNames = Object.keys(collections.data);
        $scope.data.dbCollections = {};
        for (var i = 0; i < collectionNames.length; i++) {
          for (var j = 0; j < schoolKeys.length; j++) {
            if (collectionNames[i] === schoolKeys[j]) {
              $scope.data.dbCollections[collectionNames[i]] = collections.data[collectionNames[i]];
              $scope.data.dbCollections[collectionNames[i]].nameOptions = $scope.view.schoolNameOptions[collectionNames[i]];
            }
          }
        }

        var dbCollections = Object.keys($scope.data.dbCollections);
        $scope.data.availableCollections = {};
        for (var i = 0; i < dbCollections.length; i++) {
          $scope.data.availableCollections[dbCollections[i]] = $scope.data.dbCollections[dbCollections[i]].nameOptions;
        }

        $scope.data.availableVersions = {};
        for (var i = 0; i < dbCollections.length; i++) {
          var currentCollection = $scope.data.dbCollections[dbCollections[i]];
          var collectionVKeys = Object.keys(currentCollection)
          $scope.data.availableVersions[dbCollections[i]] = {};
          for (var j = 0; j < collectionVKeys.length; j++) {
            if (collectionVKeys[j] !== "nameOptions") {
              $scope.data.availableVersions[dbCollections[i]][collectionVKeys[j]] = currentCollection[collectionVKeys[j]];
            }
          }
        }

        $scope.data.schoolNameOptionsLoaded = true;

        $scope.$apply();
      });
    });

  }

  $scope.data.generateiFrame = function() {
    $scope.data.iFrameHTML = "<iframe src=\'" + $scope.data.dashboardUrl + "\' frameborder=\'0\' allowfullscreen=\'true\'></iframe>"
    $scope.data.showiFrame = true;
  }

  $scope.data.copyiFrame = function() {
    var copyText = $('input.iframe-html');
    copyText.select();

    var messageContainer = angular.element('div.iframe-html');

    try {
      var successful = document.execCommand('copy');
      $scope.data.copyStatusMessage = successful ? 'success' : 'failure';
    } catch (err) {
      $scope.data.copyStatusMessage = 'failure';
    }

    $timeout(function() {
      $scope.data.copyStatusMessage = 'hidden';
    }, 5000);

  }

  $scope.view.hideiFrame = function() {
    $scope.data.showiFrame = false;
    $scope.data.copyStatusMessage = 'hidden';
  }


  $scope.view.initializeDashboardManager();

}])
