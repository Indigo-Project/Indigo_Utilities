app.factory('authService', ['$http', 'localStorageService', function($http, localStorageService) {

  var authService = {

    submitLoginCredentials: function(username, password) {
      return new Promise(function(resolve, reject) {

        $http({
          method: 'POST',
          url: '/auth/login',
          data: { username: username, password: password }
        }).then(function(token) {
          console.log(token);
          resolve(token);
        }).catch(function(error) {
          console.log(error);
          reject(error);
        })

      })
    },

    verifyJWT: function() {
      return new Promise(function(resolve, reject) {

        var token = localStorageService.get('jwt') || null;
        if (token) {
          $http({
            method: 'POST',
            url: '/auth/verify-token',
            data: { token: localStorageService.get('jwt') }
          }).then(function(response) {
            resolve(response);
          }).catch(function(error) {
            console.log(error);
            reject(error);
          })
        } else {
          console.log('no token');
        }

      })

    }
  };

  return authService;

}])
