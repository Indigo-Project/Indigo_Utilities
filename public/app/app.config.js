app.config(['$locationProvider', '$httpProvider', 'jwtOptionsProvider', 'localStorageServiceProvider', function($locationProvider, $httpProvider, jwtOptionsProvider, localStorageServiceProvider) {

  localStorageServiceProvider
  .setPrefix('indigo-utility');

  var url = (window.location != window.parent.location) ? document.referrer : document.location.host;
  var fathymParent = url.substring(7,20) === "indigo.fathym" ? true : false;


  jwtOptionsProvider.config({
    // whiteListedDomains: ['localhost'],
    tokenGetter: ['options', function(options) {

      // Don't send token upon template request (returns undefined after jwtIntercepted)
      // if (options.url.substr(options.url.length - 5) === '.html') {
      //    return 'template request';
      // }

      var jwt = fathymParent ? 'fathymParent' : localStorage['indigo-utility.jwt'];
      return jwt;

    }],

    unauthenticatedRedirector: ['$state', function($state) {
      $state.go('login');
    }]

  });

  $httpProvider.interceptors.push('jwtInterceptor');


  $locationProvider.html5Mode(true);

}])
