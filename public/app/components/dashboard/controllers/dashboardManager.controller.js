app.controller('DashboardManager', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', '$timeout', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'DashboardManagerService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, $timeout, siteNavigation, TTI_API, socket, $window, DashboardService, DashboardManagerService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.view = {};
  $scope.data = {};

  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";
  $scope.view.notesCTA = "edit";

  $scope.data.schoolNameOptionsLoaded = false;
  $scope.data.currentVersionData = {};
  $scope.data.currentVersionData.schoolName;
  $scope.data.currentVersionData.versionName;
  $scope.data.currentVersionData.dateCreated;
  $scope.data.dashboardUrl = '';
  $scope.data.showiFrame;
  $scope.data.iFrameHTML;
  $scope.data.copyStatusMessage = 'hidden';

  $scope.view.openCreateDashboard = function() {
    $state.go('dashboard_manager.create_dashboard');
  }

  // On Dashboard Manager school selection, configure available versions for selected school
  $scope.view.updateVersionOptions = function() {
    if ($scope.view.dashMschoolCode) {
      $scope.view.showMDashboard ? $scope.view.showMDashboard = false : null;
      $scope.view.currentSchoolVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
    }
  };

  // load current dashboard version data object into $scope variable and local storage from dashboard manager, then create dashboard
  $scope.view.loadVersion = function() {

    $scope.view.showMDashboard = false;

    var dataObjectId = $scope.data.availableVersions[$scope.view.dashMschoolCode][$scope.view.dashMschoolVersion].dataReference[1]

    if ($scope.view.dashMschoolVersion) {
      DashboardService.retrieveDataObjectForCurrentDashboard($scope.view.dashMschoolCode, dataObjectId)
      .then(function(data) {
        console.log('got data:', data);

        // Dashboard Manager Data/Metadata Values
        $scope.data.currentVersionData.schoolName = data.metaData.schoolInfo.name;
        $scope.data.currentVersionData.versionName = data.metaData.dashboardTitle;
        $scope.data.currentVersionData.dateCreated = data.metaData.dateCreated;
        $scope.data.currentVersionData.managerNotes = data.metaData.notes || "";

        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
        DashboardService.generateD3Dashboard(inputObject, "studentData");
        $scope.data.dashboardUrl = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        $scope.view.showMDashboard = true;
        $scope.$apply();

        $("textarea.dashboard-manager-notes").height($("textarea.dashboard-manager-notes")[0].scrollHeight);
        RWD.responsiveAdaptationDM();

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

  $scope.data.editNotes = function() {
    $scope.view.notesCTA = 'save';
    $('textarea.dashboard-manager-notes').attr('readonly', false);
  };

  $scope.data.saveNotes = function() {
    $scope.view.notesCTA = 'edit';
    $('textarea.dashboard-manager-notes').attr('readonly', true);
    // $scope.data.currentVersionData.managerNotes;
    // console.log($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion, $scope.data.currentVersionData.managerNotes);
    DashboardManagerService.saveNotes($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion, $scope.data.currentVersionData.managerNotes);
  };

  $scope.view.refreshDMiFrame = function() {
    angular.element('iframe.dashM-iframe')[0].src = $scope.data.dashboardUrl;
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

  // Dashboard Manager Initialization
  $scope.view.initializeDashboardManager = function() {

    DashboardService.retrieveSchoolNameOptions()
    .then(function(data) {
      $scope.view.schoolNameOptions = data.data;
      var schoolKeys = Object.keys($scope.view.schoolNameOptions);
      for (var i = 0; i < schoolKeys.length; i++) {
        $scope.view.schoolNameOptions[schoolKeys[i]].code = schoolKeys[i]
      }

      DashboardService.retrieveSchoolDataOrDashboardRef('dash')
      .then(function(collections) {

        var collectionNames = Object.keys(collections.data);
        $scope.data.dbCollections = {};
        for (var i = 0; i < collectionNames.length; i++) {
          var unifiedCollName = collectionNames[i].slice(0, -5);
          for (var j = 0; j < schoolKeys.length; j++) {
            if (unifiedCollName === schoolKeys[j]) {
              $scope.data.dbCollections[unifiedCollName] = collections.data[collectionNames[i]];
              $scope.data.dbCollections[unifiedCollName].nameOptions = $scope.view.schoolNameOptions[unifiedCollName];
            }
          }
        }
        console.log($scope.data.dbCollections);

        var dbCollectionKeys = Object.keys($scope.data.dbCollections);
        $scope.data.availableVersions = {};
        for (var i = 0; i < dbCollectionKeys.length; i++) {
          var currentCollection = $scope.data.dbCollections[dbCollectionKeys[i]];
          var collectionObjectKeys = Object.keys(currentCollection)
          $scope.data.availableVersions[dbCollectionKeys[i]] = {};
          for (var j = 0; j < collectionObjectKeys.length; j++) {
            if (collectionObjectKeys[j] !== "nameOptions") {
              $scope.data.availableVersions[dbCollectionKeys[i]][collectionObjectKeys[j]] = currentCollection[collectionObjectKeys[j]];
            }
          }
        }
        console.log($scope.data.availableVersions);

        $scope.data.schoolNameOptionsLoaded = true;

        $scope.$apply();
      }).catch(function(err) {
        console.log('retrieveSchoolsWithDashboards Error', err);
      });
    }).catch(function(err) {
      console.log(err);
    });

  }

  $scope.view.initializeDashboardManager();

}])
