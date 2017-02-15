app.run(['$window', '$rootScope', '$interval', '$state', 'jwtHelper', 'localStorageService', 'authManager', 'authService', 'siteNavigation', function($window, $rootScope, $interval, $state, jwtHelper, localStorageService, authManager, authService, siteNavigation){

  authManager.checkAuthOnRefresh();
  authManager.redirectWhenUnauthenticated();

  // Declare stateIsLoading default
  $rootScope.stateIsLoading = '';
  $rootScope.currentJWT = localStorageService.get('jwt') ? jwtHelper.decodeToken(localStorageService.get('jwt')) : null;

  $rootScope.businessFunctionSelected;
  $rootScope.dashboardFunctionSelected;

  // Header Navigation Trigger
  $rootScope.viewNavigation = function(functionType) {

    var selectedFunction;

    if (functionType === 'businessUtility') {
      $rootScope.selectedDashboardFunction = 'home';
      $rootScope.businessFunctionSelected = true;
      $rootScope.dashboardFunctionSelected = false;
      selectedFunction = $rootScope.selectedBusinessFunction;
    } else if (functionType === 'dashboardManagement') {
      $rootScope.selectedBusinessFunction = 'home';
      $rootScope.businessFunctionSelected = false;
      $rootScope.dashboardFunctionSelected = true;
      selectedFunction = $rootScope.selectedDashboardFunction;
    }

    siteNavigation.accessFunction(selectedFunction, functionType);

  }

  // Logout Function
  $rootScope.logout = function() {
    localStorageService.clearAll();
    $state.go('login');
  }

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    // console.log('toState:', toState.name);

    // On State Change/Refresh, Maintain Function Selection Params
    var functionSelectionKey = {
      'ent_list': 'businessUtility',
      'blue_list': 'businessUtility',
      'tti_batchdl': 'businessUtility',
      'sum_page': 'businessUtility',
      'sum_stats': 'businessUtility',
      'dashboard_gen': 'dashboardManagement',
      'dashboard_manager': 'dashboardManagement'
    };

    $rootScope.currentState = toState.name;

    if ($rootScope.currentState === 'home') {
      $rootScope.selectedDashboardFunction = 'home';
      $rootScope.selectedBusinessFunction = 'home';
    } else {
      $rootScope.selectedBusinessFunction = functionSelectionKey[$rootScope.currentState] === 'businessUtility' ? $rootScope.currentState : 'home';
      $rootScope.selectedDashboardFunction = functionSelectionKey[$rootScope.currentState] === 'dashboardManagement' ? $rootScope.currentState : 'home';
    }

    // Set decoded JWT on rootscope
    $rootScope.currentJWT = localStorageService.get('jwt') ? jwtHelper.decodeToken(localStorageService.get('jwt')) : null;

    // Set Fathym Parent
    var url = (window.location != window.parent.location) ? document.referrer : document.location.host;
    $rootScope.fathymParent = url.substring(7,20) === "indigo.fathym" ? true : false;

    // Initiate dashboard loading animation
    if (toState.name === 'dashboard' && $rootScope.currentJWT) {
      $rootScope.stateIsLoading = 'dashboard';
    }

    // If not navigating to login, if association is within set or current associations, and if not in Fathym
    if (toState.name !== "login" && $rootScope.currentJWT.ass === "internal" && !$rootScope.fathymParent) {

      // If role is sample, only authorizes dashboard access
      if ($rootScope.currentJWT.role === 'sample') {
        if (toState.name !== 'dashboard' && toState.name !== 'dashboard.dashboard_student_detail' && toState.name !== 'login') {
          event.preventDefault();
          $state.go('dashboard', { collection: 'indigo-school', id: '587976ce6d03cc5f483e299b' });
        }
      }

      // Initiate inactivity timer
      angular.element($window).on('mousemove click wheel keydown', function() {
        $rootScope.$broadcast('user-event')
      })

      $rootScope.$on('user-event', function() {
        $rootScope.inactivityTimer = 10 * 60;
      })

      $rootScope.inactivityTimer = 10 * 60;

      var interval;
      function countDown() {
        $rootScope.inactivityTimer -= 1;
        if ($rootScope.inactivityTimer < 1) {
          $interval.cancel(interval);
          localStorageService.clearAll();
          $rootScope.currentJWT = null;
          $state.go('login', { inactivityLogout: true });
        }
      }
      interval = $interval(countDown, 1000);

    }

  });

}]);
