app.controller('Auth', ['$scope', '$state', '$http','localStorageService', 'jwtHelper', 'authService', 'jwtService', function($scope, $state, $http, localStorageService, jwtHelper, authService, jwtService) {

  $scope.data = {};
  $scope.view = {};

  $scope.data.inactivityLogout = $state.params.inactivityLogout === true ? true : false;
  angular.element('form.login-form > input').on('change', function() {
    $scope.data.inactivityLogout = false;
  })

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

    authService.submitLoginCredentials($scope.data.username, $scope.data.password)
    .then(function(token) {

      // Store JWT Token
      // localStorageService.set('jwt', token.data);

      var payload = jwtHelper.decodeToken(token.data);
      console.log(payload);

      // Redirect based on authorization
      $scope.view.authorizationRedirectUponLogin(payload.ass, payload.role);

    }).catch(function(error) {
      alert('login error: ' + error.data);
    })

  }

  $scope.view.authorizationRedirectUponLogin = function(association, role) {
    if (association === 'internal') {
      if (role === 'super-user' || role === 'team-user') {
        $state.go('home');
      } else {
        console.log('current only supports super-user & team-user roles');
      }
    } else {
      console.log('current only supports internal association');
    }
  }

  $scope.view.closeInactivityNotification = function() {
    $scope.data.inactivityLogout = false;
  }

}])
