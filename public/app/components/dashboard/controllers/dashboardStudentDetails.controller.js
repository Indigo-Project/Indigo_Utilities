app.controller('DashboardStudentDetails', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.data = {};
  $scope.view = {};

  $scope.data.currentStudentDataObject;

  $scope.view.responsiveAdaptation = function() {
    RWD.responsiveAdaptationStudentDetails();
  }

  $scope.view.doneResizing = function() {
    $state.reload();
  }

  $scope.view.loadStudentDetails = function() {

    var studentDataObj = localStorageService.get('currentStudentData');
    $scope.data.currentStudentDataObject = { columnHeaders: studentDataObj.columnHeaders, currentStudentData: studentDataObj.studentData, metaData: studentDataObj.metaData };

    window.requestAnimationFrame($scope.view.responsiveAdaptation);
    var resizeTimeout;

    $(window).on("resize orientationChange", function() {
      clearTimeout(resizeTimeout)
      // 100ms after most recent resize, refresh the $state
      resizeTimeout = setTimeout($scope.view.doneResizing(), 100);
      window.requestAnimationFrame($scope.view.responsiveAdaptation);
    })
  }


  // load student details on state load
  $scope.view.loadStudentDetails();

  $scope.view.closeStudentDetails = function(event) {
    if (event.target.attributes.class.value.split(' ')[0] === 'dashboard-studentdetails' || event.target.attributes.class.value.split(' ')[0] === 'exit-button') {
      var returnPath = $location.path()
      var returnPathArr = returnPath.split('/')
      $state.go('dashboard', { collection: returnPathArr[2], id: returnPathArr[3] })
    }
  }




}])
