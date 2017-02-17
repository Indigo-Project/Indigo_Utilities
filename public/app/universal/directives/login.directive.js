app.directive('login', ['$state', function($state) {

  return {
    restrict: 'E',
    templateUrl: 'app/universal/directives/partials/login.html',
    controller: 'Auth'
  }

}])
