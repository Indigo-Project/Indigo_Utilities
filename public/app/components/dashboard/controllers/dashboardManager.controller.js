app.controller('DashboardManager', ['$compile', '$rootScope', '$scope', '$location', '$state', '$stateParams', '$http', '$timeout', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'DashboardManagerService', 'localStorageService', 'RWD', function($compile, $rootScope, $scope, $location, $state, $stateParams, $http, $timeout, siteNavigation, TTI_API, socket, $window, DashboardService, DashboardManagerService, localStorageService, RWD) {

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

  $scope.data.dbCollections;
  $scope.data.availableVersions;

  $scope.data.schoolDataObjectsStatus = "no school selection";
  $scope.data.activeSchoolDataObjects;
  $scope.data.dashCreationSchoolCode;
  $scope.data.dashCreationSchoolDataObjId;



  $scope.view.openCreateDashboard = function() {
    $state.go('dashboard_manager.create_dashboard')
    // .then(function() {
    //   $rootScope.dashManagerSchoolSelection ? $scope.data.dashCreationSchoolCode = $rootScope.dashManagerSchoolSelection : null;
    // })
  }

  $scope.view.closeCreateDashboard = function(event) {
    event.target.className === "manager-create-dashboard" || event.target.className === "cd-exit-button" ? $state.go('dashboard_manager') : null;
  }

  $scope.view.navigateToDataObjCreation = function() {
    $state.go('dashboard_gen');
  }

  $scope.view.navigateToSchoolDataManager = function() {
    $state.go('school_data_manager');
  }

  // On Dashboard Manager 'school' selection change, configure available versions for selected school
  $scope.view.updateVersionOptions = function() {

    if ($scope.view.dashMschoolCode) {
      $scope.view.showMDashboard ? $scope.view.showMDashboard = false : null;
      $scope.view.currentSchoolVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
    }

    // Set global 'dashboard manager school selection' school code, for reference in dashboard creator and elsewhere
    $state.current.name === 'dashboard_manager' ? $rootScope.dashManagerSchoolSelection = $scope.view.dashMschoolCode : null;

  };

  // load current dashboard version data object into $scope variable and local storage from dashboard manager, then create dashboard
  $scope.view.loadVersion = function() {

    // Hide dashboard manager interface (before data is ready to load)
    $scope.view.showMDashboard = false;

    if ($scope.view.dashMschoolVersion) {

      // sets dataObjectId from dashboardRef dataReference object
      var dataObjectId = $scope.data.availableVersions[$scope.view.dashMschoolCode][$scope.view.dashMschoolVersion].dataReference[1];
      // set dashboardRefId for DB traversal
      var dashboardRefId = $scope.data.availableVersions[$scope.view.dashMschoolCode][$scope.view.dashMschoolVersion].id;

      DashboardService.retrieveDataObjectForCurrentDashboard($scope.view.dashMschoolCode, dashboardRefId)
      .then(function(data) {
        console.log('got data:', data);

        // Dashboard Manager Data/Metadata Values
        $scope.data.currentVersionData.dataObjectTitle = data.metaData.dataObjectTitle;
        $scope.data.currentVersionData.schoolName = data.metaData.schoolInfo.name;
        $scope.data.currentVersionData.versionName = $scope.data.availableVersions[$scope.view.dashMschoolCode][$scope.view.dashMschoolVersion].dashboardTitle;
        $scope.data.currentVersionData.dateCreated = data.metaData.dateCreated;
        $scope.data.currentVersionData.managerNotes = data.metaData.notes || "";

        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
        DashboardService.generateD3Dashboard(inputObject, "studentData");
        $scope.data.dashboardUrl = '/dashboards/' + $scope.view.dashMschoolCode + "/" + dashboardRefId;
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

      DashboardService.retrieveSchoolDataOrDashboardRefs('dash')
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

        $state.current.name === "dashboard_manager.create_dashboard" ? $scope.view.initializeDashboardCreator() : null;

        $scope.data.schoolNameOptionsLoaded = true;

        $scope.$apply();
      }).catch(function(err) {
        console.log('retrieveSchoolsWithDashboards Error', err);
      });
    }).catch(function(err) {
      console.log(err);
    });

  }

  //
  $scope.view.initializeDashboardCreator = function() {

    // if dashManagerSchoolSelection exists on rootScope, set dashCreationSchoolCode on scope
    $rootScope.dashManagerSchoolSelection ? $scope.data.dashCreationSchoolCode = $rootScope.dashManagerSchoolSelection : null;

    // set schoolSelectionDropdown value to dashCreationSchoolCode (whether "" or not)
    var schoolSelectionDropdown = angular.element('select.mcd-school-selection');
    schoolSelectionDropdown.value = $scope.data.dashCreationSchoolCode;

    // if dashCreationSchoolCode, load school data objects
    $scope.data.dashCreationSchoolCode ? $scope.view.loadSchoolDataObjects() : null;

  }

  // Upon selection of 'school' within Dashboard Creator, load activated data objects for school
  $scope.view.loadSchoolDataObjects = function() {

    // console.log($scope.data.dashCreationSchoolCode);
    // var schoolSelectionDropdown = angular.element('select.mcd-school-selection');
    // console.log(schoolSelectionDropdown);

    if ($scope.data.dashCreationSchoolCode) {
      $scope.data.schoolDataObjectsStatus = 'loading';
      DashboardService.retrieveSchoolDataOrDashboardRefs('data', $scope.data.dashCreationSchoolCode)
      .then(function(data) {
        var dataColl = data.data;
        console.log(dataColl);
        $scope.data.activeSchoolDataObjects = [];
        for (var dataObjKey in dataColl) {
          console.log(dataColl[dataObjKey].activated);
          dataColl[dataObjKey].activated ? $scope.data.activeSchoolDataObjects.push(dataColl[dataObjKey]) : null;
        }

        if ($scope.data.activeSchoolDataObjects.length) {
          $scope.data.schoolDataObjectsStatus = 'loaded';
        } else {
          $scope.data.schoolDataObjectsStatus = 'no activated data'
        }

        console.log($scope.data.schoolDataObjectsStatus);

      }).catch(function(error) {
        console.log(error);
      })
    } else {
      $scope.data.schoolDataObjectsStatus = "no school selection";
      console.log($scope.data.schoolDataObjectsStatus);
    }


  }

  $scope.data.createDashboard = function() {

    var schoolDataObjInfo;
    for (var i = 0; i < $scope.data.activeSchoolDataObjects.length; i++) {
      if ($scope.data.activeSchoolDataObjects[i].id === $scope.data.dashCreationSchoolDataObjId) {
        schoolDataObjInfo = $scope.data.activeSchoolDataObjects[i];
        break;
      }
    }

    console.log($scope.data.dashCreationTitle, schoolDataObjInfo);

    DashboardService.createDashboard($scope.data.dashCreationTitle, schoolDataObjInfo)

  }

  // console.log($state.current.name);
  // $state.current.name === "dashboard_manager" ? $scope.view.initializeDashboardManager() : null;
  $scope.view.initializeDashboardManager();

}])
