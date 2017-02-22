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

      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsb2NhbGhvc3Q6MzAwMCIsIm5hbWUiOiJpbmRpZ29BZG1pbiIsInJvbGUiOiJzdXBlci11c2VyIiwiYXNzIjoiaW50ZXJuYWwiLCJpYXQiOjE0ODc3OTMyMjksImV4cCI6MTQ4Nzg3OTYyOX0.mnH1k0tg6KTiBVnQCwmHvZsdCTzN5j8Y5iqg_O32ypw"
      var jwt = fathymParent ? btoa('fath') + '.' + btoa('yMPa') + '.' + btoa('rent') : localStorage['indigo-utility.jwt'];
      return jwt;

    }],

    unauthenticatedRedirector: ['$state', function($state) {
      $state.go('login');
    }]

  });

  $httpProvider.interceptors.push('jwtInterceptor');


  $locationProvider.html5Mode(true);

}])
