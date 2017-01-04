app.config(function($locationProvider, localStorageServiceProvider) {

  localStorageServiceProvider
  .setPrefix('indigo-utility')

  $locationProvider.html5Mode(true);

})
