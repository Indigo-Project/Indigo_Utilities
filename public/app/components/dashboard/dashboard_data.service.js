app.factory('DashboardDataService', ['$http', function($http) {

  var DashboardDataService = {

    toggleSchoolDataObjActiveStatus: function(promptedStatus, schoolCode, id) {
      return new Promise(function(resolve, reject) {
        $http({
          method: 'post',
          url: '/dashboard-data/toggle-active-status',
          data: { promptedStatus: promptedStatus, schoolCode: schoolCode, id: id }
        }).then(function(data) {
          resolve(data);
        }).catch(function(error) {
          reject(error)
        })
      })
    }

  }

  return DashboardDataService;

}])
