app.config(['$locationProvider', '$httpProvider', 'jwtOptionsProvider', 'localStorageServiceProvider', function($locationProvider, $httpProvider, jwtOptionsProvider, localStorageServiceProvider) {

  localStorageServiceProvider
  .setPrefix('indigo-utility');

  var url = (window.location != window.parent.location) ? document.referrer : document.location.host;
  console.log(url, document.referrer, document.location.host);
  var fathymParent = url.substring(0,13) === "indigo.fathym" ? true : false;
  console.log(url.substring(0,13), fathymParent);

  if (!fathymParent) {
    jwtOptionsProvider.config({
      // whiteListedDomains: ['localhost'],
      tokenGetter: ['options', function(options) {

        // Don't send token upon template request (returns undefined after jwtIntercepted)
        // console.log(options);
        // if (options.url.substr(options.url.length - 5) === '.html') {
        //   console.log('temp request');
        //   if (confirm('proceed')) {
        //     return 'template request';
        //   }
        // }

        var jwt = localStorage['indigo-utility.jwt']
        return jwt;

      }],

      unauthenticatedRedirector: ['$state', function($state) {
        $state.go('login');
      }]

    });

    $httpProvider.interceptors.push('jwtInterceptor');
  }

  $locationProvider.html5Mode(true);

}])
