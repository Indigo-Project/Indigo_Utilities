app.run(['$window', '$rootScope', '$interval', '$state', 'jwtHelper', 'localStorageService', 'authManager', 'authService', function($window, $rootScope, $interval, $state, jwtHelper, localStorageService, authManager, authService){

  authManager.checkAuthOnRefresh();
  authManager.redirectWhenUnauthenticated();

  // Declare stateIsLoading default
  $rootScope.stateIsLoading = '';

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    // Set decoded JWT on rootscope
    $rootScope.currentJWT = localStorageService.get('jwt') ? jwtHelper.decodeToken(localStorageService.get('jwt')) : null;

    // Set Fathym Parent
    var url = (window.location != window.parent.location) ? document.referrer : document.location.host;
    $rootScope.fathymParent = url.substring(7,20) === "indigo.fathym" ? true : false;

    if (toState.name === "dashboard" && $rootScope.currentJWT) {
      $rootScope.stateIsLoading = 'dashboard';
    } else if (toState.name !== "login" && $rootScope.currentJWT.ass === "internal" && !$rootScope.fathymParent) {
      angular.element($window).on('mousemove click wheel keydown', function() {
        $rootScope.$broadcast('user-event')
      })

      $rootScope.$on('user-event', function() {
        $rootScope.inactivityTimer = 0.05 * 60;
      })

      $rootScope.inactivityTimer = 0.05 * 60;

      var interval;
      function countDown() {
        $rootScope.inactivityTimer -= 1;
        console.log($rootScope.inactivityTimer);
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
