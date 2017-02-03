// app.factory('jwtInterceptor', ['localStorageService', function(localStorageService){
//
//   var interceptor = {
//     request: function(config) {
//       console.log(config.headers);
//       var jwt = localStorageService.get('jwt');
//       if (jwt) {
//         console.log('Bearer ' + jwt);
//         config.headers.authorization = 'Bearer ' + jwt;
//         console.log(config.headers.authorization);
//       }
//       return config;
//     }
//   };
//
//   return interceptor;
//
// }])
