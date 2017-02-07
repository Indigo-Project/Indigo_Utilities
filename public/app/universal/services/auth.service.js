app.factory('authService', ['$http', '$q', 'localStorageService', function($http, $q, localStorageService) {

  var authService = {

    submitLoginCredentials: function(username, password) {
      return new Promise(function(resolve, reject) {

        $http({
          method: 'POST',
          url: '/auth/login',
          data: { username: username, password: password }
        }).then(function(token) {
          // console.log(token.data);
          function storeToken() {
            return $q(function(resolve, reject) {
              localStorageService.set('jwt', token.data);
              // console.log(localStorageService.get('jwt'));
              localStorageService.get('jwt') ? resolve() : storeToken();
            })
          }
          storeToken()
          .then(function() {
            resolve(token);
          })
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
            // console.log(error);
            reject(error);
          })
        } else {
          // console.log('no token');
        }

      })

    }
  };

  return authService;

}])
