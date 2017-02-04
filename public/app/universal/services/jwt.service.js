app.factory('jwtService', ['localStorageService', 'jwtHelper', function(localStorageService, jwtHelper){

  var jwtService = {
    getDecodedJWT: function() {
      var jwt = localStorageService.get('jwt');
      var jwtDecoded = jwtHelper.decodeToken(jwt);
      return jwtDecoded;
    },
    clearJWT: function() {
      return localStorageService.remove('jwt')
    }
  };

  return jwtService;

}])
