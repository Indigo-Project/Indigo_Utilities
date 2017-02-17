app.controller('UserManager', ['$scope', 'DashboardService', function($scope, DashboardService) {

  $scope.view = {};
  $scope.data = {};


  $scope.view.schoolSelected = "";

  $scope.data.schoolNameOptionsLoaded = false;


  // Upon school selection, load data objects into sidebar
  $scope.view.loadUsersForSelection = function() {
    if ($scope.view.schoolSelected) {

    }
  };

  // Dashboard Manager Initialization
  $scope.view.initializeUsersManager = function() {

    DashboardService.retrieveSchoolNameOptions()
    .then(function(data) {
      $scope.view.schoolNameOptions = data.data;
      var schoolKeys = Object.keys($scope.view.schoolNameOptions);
      for (var i = 0; i < schoolKeys.length; i++) {
        $scope.view.schoolNameOptions[schoolKeys[i]].code = schoolKeys[i]
      }

      DashboardService.retrieveSchoolsWithDashboardData()
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

        // $scope.data.availableVersions = {};
        // for (var i = 0; i < dbCollections.length; i++) {
        //   var currentCollection = $scope.data.dbCollections[dbCollections[i]];
        //   var collectionVKeys = Object.keys(currentCollection)
        //   $scope.data.availableVersions[dbCollections[i]] = {};
        //   for (var j = 0; j < collectionVKeys.length; j++) {
        //     if (collectionVKeys[j] !== "nameOptions") {
        //       $scope.data.availableVersions[dbCollections[i]][collectionVKeys[j]] = currentCollection[collectionVKeys[j]];
        //     }
        //   }
        // }

        $scope.data.schoolNameOptionsLoaded = true;

        $scope.$apply();
      }).catch(function(err) {
        console.log('retrieveSchoolsWithDashboards Error', err);
      });
    }).catch(function(err) {
      console.log(err);
    });

  };

  $scope.view.initializeUsersManager();


}])
