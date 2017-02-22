app.directive('dashboard', ['$compile', '$rootScope', '$state', '$stateParams', 'localStorageService', 'DashboardService', function($compile, $rootScope, $state, $stateParams, localStorageService, DashboardService) {

  function link(scope, element, attrs) {

    function loadDashboardData() {

      // If no dashboard data object has been specified into local storage from manager, locate and load from url parameters
      function loadDashboardDataFromDB() {
        console.log('loadDashboardDataFromDB');
        return new Promise(function(resolve, reject) {

          DashboardService.retrieveDataObjectForCurrentDashboard($stateParams.collection, $stateParams.id)
          .then(function(dashboardData) {

            console.log('loadDashboardDataFromDB data', dashboardData);
            scope.data.currentDashboardDataObject = dashboardData;

            // scope.data.studentNumber = dashboardData.compiledData.studentData.length;
            scope.view.dashDisplayschoolName = dashboardData.metaData.schoolInfo.optionDisplay;
            $('span.sd-title-name').html(scope.view.dashDisplayschoolName + " ");


            localStorageService.set('currentDashboardData', dashboardData);

            resolve();

          }).catch(function(error) {
            console.log(error);
          })

        })
      }

      // If dashboard data object exists within local storage, load to dashboard
      function loadDashboardDataFromLS() {
        console.log('loadDashboardDataFromLS');

        return new Promise(function(resolve, reject) {

          var dashboardData = localStorageService.get('currentDashboardData');

          console.log('loadDashboardDataFromLS data', dashboardData);
          scope.data.currentDashboardDataObject = dashboardData;

          // scope.data.studentNumber = dashboardData.compiledData.studentData.length;
          scope.view.dashDisplayschoolName = dashboardData.metaData.schoolInfo.optionDisplay;
          $('span.sd-title-name').html(scope.view.dashDisplayschoolName + " ");

          // compile ng-click html attribute applied from D3, binding to $scope
          var studentNameCells = $('table.student-data tbody td:nth-of-type(1)');
          $compile(studentNameCells)(scope);

          resolve();
        })
      }

      return new Promise(function(resolve, reject) {

        if (!localStorageService.get('currentDashboardData') || localStorageService.get('currentDashboardData')._id !== $stateParams.id ) {

          loadDashboardDataFromDB()
          .then(function() {
            resolve()
          })
          .catch(function(error) {
            console.log(error);
          })

        } else {

          loadDashboardDataFromLS()
          .then(function() {
            resolve()
          })
          .catch(function(error) {
            console.log(error);
          })

        }

      })

    }

    loadDashboardData()
    .then(function() {

      console.log(scope.data.currentDashboardDataObject);
      DashboardService.generateD3Dashboard({ data: scope.data.currentDashboardDataObject }, 'studentData')
      .then(function() {

        console.log($rootScope.stateIsLoading);
        $rootScope.stateIsLoading = '';
        console.log($rootScope.stateIsLoading);

        return;
      }).catch(function(error) {
        console.log(error);
      })

    }).catch(function(error) {
      console.log(error);
    })

  }

  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboard/directives/partials/dashboard.html',
    controller: 'Dashboard',
    link: link
  }

}])
