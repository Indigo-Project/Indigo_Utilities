app.run(function($rootScope){

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if (toState.name === "dashboard") {
      // console.log('stateChangeStart');
      $rootScope.stateIsLoading = 'dashboard';
    }
  });

});
