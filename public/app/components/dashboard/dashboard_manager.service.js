app.factory('DashboardManagerService', ['$http', function($http) {

  var DashboardManagerService = {

    saveNotes: function(school, version, notes) {
      $http({
        method: 'post',
        url: '/dashboard-manager/update-manager-notes',
        data: { school: school, version: version, notes: notes }
      })
    }
    
  }

  return DashboardManagerService;

}])
