app.controller('SchoolDataManager', ['$scope', '$state', 'DashboardService', function($scope, $state, DashboardService) {

  $scope.view = {};
  $scope.data = {};

  $scope.view.showInterface;
  $scope.view.showObjectInterface;
  $scope.view.schoolSelection = "";
  $scope.view.selectedDataObjReference = "";

  $scope.data.schoolNameOptionsLoaded = false;

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
      $scope.view.noDataObjects = Object.keys($scope.view.currentDataObjects).length ? false : true;
    }

    $scope.view.showInterface = true;

  };

  // $scope.view.updateVersionOptions = function() {
  //   if ($scope.view.dashMschoolCode) {
  //     $scope.view.showMDashboard ? $scope.view.showMDashboard = false : null;
  //     $scope.view.currentDataObjects = $scope.data.availableDataObjects[$scope.view.schoolSelection];
  //   }
  // };

  // load recently selected data object into data manager object interface
  $scope.view.loadDataObjectIntoInterface = function(index, event, dataObject) {

    // console.log(index);
    // console.log(event);
    // var dataObjectThumbnails = angular.element('div.data-object-thumbnail');

    $scope.view.showObjectInterface = false;

    // If selectedDataObjReference is same as recently clicked thumbnail, deselect current. Else, select new data object
    $scope.view.selectedDataObjReference = index === $scope.view.selectedDataObjReference[0] ? "" : [index, dataObject.version];
    $scope.view.currentDataObject = dataObject;

    // Display object interface
    $scope.view.showObjectInterface = true;


    // if ($scope.view.selectedDataObjReference) {
    //   DashboardService.retrieveStoredDashboardVersionDataObject($scope.view.dashMschoolCode, $scope.view.selectedDataObjReference)
    //   .then(function(data) {
    //     console.log('got data', data);
    //
    //     // Dashboard Manager Data/Metadata Values
    //     $scope.data.currentVersionData.schoolName = data.metaData.schoolInfo.name;
    //     $scope.data.currentVersionData.versionName = data.metaData.version;
    //     $scope.data.currentVersionData.dateCreated = data.metaData.dateCreated;
    //     $scope.data.currentVersionData.managerNotes = data.metaData.managerNotes || "";
    //
    //     $scope.data.currentDashboardDataObject = data
    //     localStorageService.set('currentDashboardData', data);
    //     var inputObject = { data: $scope.data.currentDashboardDataObject, schoolName: $scope.view.dashMschoolCode}
    //     DashboardService.generateD3Dashboard(inputObject, "studentData");
    //     $scope.data.dashboardUrl = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
    //     $scope.view.showObjectInterface = true;
    //     $scope.$apply();
    //
    //     // RWD.responsiveAdaptationDM();
    //
    //   }).catch(function(error) {
    //     console.log(error);
    //   })
    // } else {
    //   console.log('NO SCHOOL SELECTED');
    // }
  };

  $scope.view.openSettings = function() {
    console.log('open');
    $scope.view.settingsOpen = $scope.view.settingsOpen ? null : true;
  }
  $scope.view.closeSettings = function() {
    // console.log('close', $scope.view.settingsOpen);
    $scope.view.settingsOpen = $scope.view.settingsOpen ? false : null;
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

      DashboardService.retrieveSchoolDataOrDashboardRef('data')
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
