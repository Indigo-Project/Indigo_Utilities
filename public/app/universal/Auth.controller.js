app.controller('Auth', ['$rootScope', '$scope', '$state', '$http','localStorageService', 'jwtHelper', 'authService', 'jwtService', function($rootScope, $scope, $state, $http, localStorageService, jwtHelper, authService, jwtService) {

  $scope.data = {};
  $scope.view = {};

  $scope.data.inactivityLogout = $state.params.inactivityLogout === true ? true : false;
  angular.element('form.login-form > input').on('change keydown', function() {
    $scope.data.inactivityLogout = false;
  })
  var submitButton = angular.element('form.login-form > input.login-submit')
  $scope.view.submitButtonValue = 'Login';

  $scope.data.ifLoggedInRedirectHome = function() {
    authService.verifyJWT()
    .then(function(response) {
      response.data === 'authenticated' ? $state.go('home') : null;
    }).catch(function(err) {
      console.log(err);
    })
  }

  $scope.data.ifLoggedInRedirectHome();

  $scope.data.submitLoginCredentials = function() {

    $scope.view.submitButtonValue = 'Authenticating...';

    authService.submitLoginCredentials($scope.data.username, $scope.data.password)
    .then(function(token) {

      var payload = jwtHelper.decodeToken(token.data);

      // Redirect based on authorization
      $scope.view.authorizationRedirectUponLogin(payload.ass, payload.role);

    }).catch(function(error) {
      $scope.view.submitButtonValue = 'Login';
      $scope.$apply();
      alert('login error: ' + error.data);
    })

  }

  $scope.view.authorizationRedirectUponLogin = function(association, role) {
    if (association === 'internal') {
      if (role === 'super-user' || role === 'team-user') {
        $state.go('home');
      } else if (role === 'sample') {
        $state.go('dashboard', { collection: 'indigo-school', id: '587976ce6d03cc5f483e299b' });
      } else {
        console.log('role not currently supported');
      }
    } else {
      console.log('currently only supports internal association');
    }
  }

  $scope.view.closeInactivityNotification = function() {
    $scope.data.inactivityLogout = false;
  }

}])
