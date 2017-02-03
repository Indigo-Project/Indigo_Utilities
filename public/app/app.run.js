app.run(function(authManager, $rootScope){

  authManager.checkAuthOnRefresh();
  authManager.redirectWhenUnauthenticated();

  $rootScope.stateIsLoading = '';

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    console.log(toState);
    if (toState.name === "dashboard") {
      $rootScope.stateIsLoading = 'dashboard';
    }
  });

});
