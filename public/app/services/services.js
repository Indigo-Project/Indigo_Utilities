app.factory('Main_Service', ['$state', function($state) {
  return {
    accessFunction: function(selectedFunction) {
      if (selectedFunction === "pbi_pfmt") {
        $state.go("pbi_pfmt");
      } else if (selectedFunction === "blue_list") {
        $state.go("blue_list");
      } else if (selectedFunction === "ent_list") {
        $state.go("ent_list");
      } else if (selectedFunction === "sum_page") {
        $state.go("sum_page");
      } else if (selectedFunction === "tti_massdl") {
        $state.go("tti_massdl");
      } else if (selectedFunction === "default"){
        $state.go("default");
      }
    }
  }
}])

app.factory('TTI_API', ['$state', '$http', function($state, $http) {
  return {
    validateLocalDir: function(dirPath) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-local-dir",
          data: { localDir: dirPath }
        }).then(function(data) {
          resolve(data);
        }).catch(function(error) {
          console.log(error);
        })
      })
    },
    validateRequestData: function(login, password, accountID, linkID) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-tti-request",
          data: { login: login, password: password, accountID: accountID, linkID: linkID }
        }).then(function(data) {
          if(data) {
            resolve(data);
          }
        }).catch(function(error) {
          console.log(error);
          if(error) {
            reject(error);
          }
        })
      })
    },
    batchDownload: function(login, password, accountID, linkID) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/batch-download",
          data: { login: login, password: password, accountID: accountID, linkID: linkID }
        }).then(function(data) {
          if(data) {
            resolve(data);
          }
        }).catch(function(error) {
          console.log(error);
          if(error) {
            reject(error);
          }
        })
      })
    }
  }
}])
