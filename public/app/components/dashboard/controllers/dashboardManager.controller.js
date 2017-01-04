app.controller('DashboardManager', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.view = {};
  $scope.data = {};

  $scope.view.selectedFunction = "dashboard_manager";

  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";

  function responsiveAdaptationDM() {

    // var dashboardFrameElement = $('section.dashboard-frame');
    var dashboardIframe = $('iframe.dashM-iframe');
    $scope.view.baseDimensionsDM = RWD.calculateBaseDimensions(dashboardIframe);

    var iframeWidth = $scope.view.baseDimensionsDM.viewportWidth - 40
    // var dFERatio = dashboardFrameElement.height() / dashboardFrameElement.width()
    // console.log(dashboardFrameElement.width(), dashboardFrameElement.height(), dFERatio);

    var dFERatio = 723/1440;
    dashboardIframe.width(iframeWidth);
    dashboardIframe.height(dashboardIframe.width() * dFERatio);
    // console.log(dFERatio);
    // dashboardIFrame.width()
    // dashboardIframe.height(dashboardIframe.width() * dFERatio);
  }

  // school names init
  DashboardService.getSchoolNameOptions()
  .then(function(data) {
    $scope.view.dashboardNameOptions = data.data;
    var schoolNames = Object.keys($scope.view.dashboardNameOptions);
    for (var i = 0; i < schoolNames.length; i++) {
      $scope.view.dashboardNameOptions[schoolNames[i]].code = schoolNames[i]
    }

    DashboardService.getStoredSchools()
    .then(function(collections) {
      var collectionNames = Object.keys(collections.data);
      // console.log(collectionNames);
      $scope.data.dbCollections = {};
      for (var i = 0; i < collectionNames.length; i++) {
        for (var j = 0; j < schoolNames.length; j++) {
          if (collectionNames[i] === schoolNames[j]) {
            // console.log(collectionNames[i], schoolNames[j]);
            $scope.data.dbCollections[collectionNames[i]] = collections.data[collectionNames[i]];
            $scope.data.dbCollections[collectionNames[i]].nameOptions = $scope.view.dashboardNameOptions[collectionNames[i]];
          }
        }
      }
      // console.log($scope.data.dbCollections);

      var dbCollections = Object.keys($scope.data.dbCollections);
      $scope.data.availableCollections = {};
      for (var i = 0; i < dbCollections.length; i++) {
        $scope.data.availableCollections[dbCollections[i]] = $scope.data.dbCollections[dbCollections[i]].nameOptions;
      }
      // console.log($scope.data.availableCollections);

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
      // console.log($scope.data.availableVersions);

      $scope.$apply();
    });
  });

  function responsiveAdaptationDM() {

    // var dashboardFrameElement = $('section.dashboard-frame');
    var dashboardIframe = $('iframe.dashM-iframe');
    $scope.view.baseDimensionsDM = RWD.calculateBaseDimensions(dashboardIframe);

    var iframeWidth = $scope.view.baseDimensionsDM.viewportWidth - 40
    // var dFERatio = dashboardFrameElement.height() / dashboardFrameElement.width()
    // console.log(dashboardFrameElement.width(), dashboardFrameElement.height(), dFERatio);

    var dFERatio = 723/1440;
    dashboardIframe.width(iframeWidth);
    dashboardIframe.height(dashboardIframe.width() * dFERatio);
    // console.log(dFERatio);
    // dashboardIFrame.width()
    // dashboardIframe.height(dashboardIframe.width() * dFERatio);
  }

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    siteNavigation.accessFunction($scope.view.selectedFunction);
  }

  // On Dashboard Manager school selection, configure available versions for selected school
  $scope.view.updateVersionOptions = function() {
    if ($scope.view.dashMschoolCode) {
      var returnVersions = {};
      $scope.view.currentVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
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
      DashboardService.getStoredDashboardData($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion)
      .then(function(data) {
        console.log('got data', data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
        DashboardService.d3Setup(inputObject, "studentData");
        $scope.view.iframeSrc = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        $scope.view.showMDashboard = true;
        responsiveAdaptationDM();
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    } else {
      console.log('NO VERSION SELECTED');
    }
  };

  // if no dash-data set has been specified from manager, load based on full screen params
  $scope.data.loadVersionFS = function() {
    return new Promise(function(resolve, reject) {
      DashboardService.getStoredDashboardData($stateParams.collection, null, $stateParams.id)
      .then(function(data) {
        console.log(data);
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data, $scope.view.dashMschoolCode);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode };
        DashboardService.d3Setup(inputObject, "studentData");
        // $scope.view.iframeSrc = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        // $scope.view.showMDashboard = true;
        responsiveAdaptationDM();
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    })
  }

  // Open new tab with full screen dashboard
  $scope.view.openFSDashboard = function() {
    $scope.data.studentNumber = $scope.data.currentDashboardDataObject.compiledData.studentData.length;
    var collection = $scope.view.dashMschoolCode;
    var id = $scope.data.currentDashboardDataObject._id;
    window.open('/dashboards/' + collection + '/' + id, '_blank');
  }


}])
