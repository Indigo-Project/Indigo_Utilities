app.run(function($rootScope){

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if (toState.name === "dashboard") {
      console.log('stateChangeStart');
      $rootScope.stateIsLoading = 'dashboard';
    }
    // else if (toState.name === "dashboard_student_detail") {
    //   console.log('stateChangeStart');
    //   $rootScope.stateIsLoading = 'dashboard_student_detail';
    // }
  });

  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (toState.name === "dashboard") {
      console.log('stateChangeSuccess');
      // $rootScope.stateIsLoading = false;
    }
  });

});
