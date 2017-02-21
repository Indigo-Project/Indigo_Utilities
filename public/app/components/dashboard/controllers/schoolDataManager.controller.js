app.controller('SchoolDataManager', ['$scope', '$state', 'DashboardService', 'DashboardDataService', function($scope, $state, DashboardService, DashboardDataService) {

  $scope.view = {};
  $scope.data = {};

  $scope.view.showInterface;
  $scope.view.showObjectInterface;
  $scope.view.schoolSelection = "";
  $scope.view.selectedDataObjReference = "";

  $scope.view.cdoDashboardsAssigned = "";

  $scope.data.schoolNameOptionsLoaded = false;
  $scope.data.dataObjActive;


  $scope.view.redirectToDashboardGenerator = function() {
    $state.go('dashboard_gen');
  }


  // Upon school selection, load data objects into sidebar
  $scope.view.loadDataObjectsForSchool = function() {

    $scope.view.showInterface = false;
    $scope.view.selectedDataObjReference = "";

    if ($scope.view.schoolSelection) {

      $scope.view.showInterface ? $scope.view.showInterface = false : null;
      $scope.view.currentDataObjects = $scope.data.availableDataObjects[$scope.view.schoolSelection];

      console.log($scope.view.currentDataObjects);
    }

    $scope.view.showInterface = true;

  };


  // load recently selected data object into data manager object interface
  $scope.view.loadDataObjectIntoInterface = function(index, event, dataObject) {

    // console.log(index);
    // console.log(event);
    // var dataObjectThumbnails = angular.element('div.data-object-thumbnail');

    $scope.view.showObjectInterface = false;

    // If selectedDataObjReference is same as recently clicked thumbnail, deselect current. Else, select new data object
    $scope.view.selectedDataObjReference = index === $scope.view.selectedDataObjReference[0] ? "" : [index, dataObject.version];
    $scope.view.currentDataObject = dataObject;

    $scope.view.cdoActive = $scope.view.currentDataObject.activated;
    $scope.view.cdoEncrypted = $scope.view.currentDataObject.encrypted;
    $scope.view.settingsActivation = $scope.view.cdoActive;

    $scope.view.cdoDashboardsAssigned = "";
    console.log($scope.view.currentDataObject);
    $scope.view.dashAssignLength = $scope.view.currentDataObject.dashboardAssignments.length || 0;
    if ($scope.view.dashAssignLength) {
      for (var i = 0; i < $scope.view.dashAssignLength; i++) {
        var dashEnd = i === dataObject.dashboardAssignments.length -1 ? "" : ", ";
        var dashAdd = dataObject.dashboardAssignments[i][0]
        $scope.view.cdoDashboardsAssigned += dashAdd + dashEnd;
      }
    }

    // Display object interface
    $scope.view.showObjectInterface = true;

  };

  $scope.view.openSettings = function() {
    // console.log('open');
    $scope.view.settingsOpen = $scope.view.settingsOpen ? null : true;
  }
  $scope.view.closeSettings = function() {
    // console.log('close', $scope.view.settingsOpen);
    $scope.view.settingsOpen = $scope.view.settingsOpen ? false : null;
  }

  $scope.view.toggleDataActivation = function() {
    if ($scope.view.dashAssignLength) {
      alert('Data set is currently assigned to at least one dashboard. Data sets must not any have dependents in order to be deactivated.')
    } else {

      $scope.view.settingsActivation = !$scope.view.settingsActivation;
      DashboardDataService.toggleSchoolDataObjActiveStatus($scope.view.settingsActivation, $scope.view.currentDataObject.schoolInfo.code, $scope.view.currentDataObject.id)
      .then(function(data) {

        // update activation/deactivation in data object interface view
        $scope.view.cdoActive = $scope.view.settingsActivation;

        // update activation/deactivation data object thumbnail
        for (var collKey in $scope.view.currentDataObjects) {
          var currentColl = $scope.view.currentDataObjects[collKey]
          if (currentColl.id === $scope.view.currentDataObject.id) {
            currentColl.activated = $scope.view.cdoActive;
          }
        }

      }).catch(function(error) {
        console.log(error);
      })
    }
  }

  // Dashboard Manager Initialization
  $scope.view.initializeSchoolDataManager = function() {

    DashboardService.retrieveSchoolNameOptions()
    .then(function(data) {
      $scope.view.schoolNameOptions = data.data;
      var schoolKeys = Object.keys($scope.view.schoolNameOptions);
      for (var i = 0; i < schoolKeys.length; i++) {
        $scope.view.schoolNameOptions[schoolKeys[i]].code = schoolKeys[i]
      }

      DashboardService.retrieveSchoolDataOrDashboardRefs('data')
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
        $scope.data.availableDataObjects = {};
        for (var i = 0; i < dbCollectionKeys.length; i++) {
          var currentCollection = $scope.data.dbCollections[dbCollectionKeys[i]];
          var collectionObjectKeys = Object.keys(currentCollection)
          $scope.data.availableDataObjects[dbCollectionKeys[i]] = {};
          for (var j = 0; j < collectionObjectKeys.length; j++) {
            if (collectionObjectKeys[j] !== "nameOptions") {
              $scope.data.availableDataObjects[dbCollectionKeys[i]][collectionObjectKeys[j]] = currentCollection[collectionObjectKeys[j]];
            }
          }
        }
        console.log($scope.data.availableDataObjects);

        $scope.data.schoolNameOptionsLoaded = true;

        $scope.$apply();
      }).catch(function(err) {
        console.log('retrieveSchoolsWithDashboards Error', err);
      });
    }).catch(function(err) {
      console.log(err);
    });

  };

  $scope.view.initializeSchoolDataManager();

}])
