
app.factory('Main_Service', ['$state', function($state) {

  return {
    accessFunction: function(selectedFunction) {
      if (selectedFunction === "pbi_pfmt") {
        $state.go("pbi_pfmt");
      } else if (selectedFunction === "blue_list") {
        $state.go("blue_list");
      } else if (selectedFunction === "ent_list") {
        $state.go("ent_list");
      } else if (selectedFunction === "tti_massdl") {
        $state.go("tti_massdl");
      } else if (selectedFunction === "sum_page") {
        $state.go("sum_page");
      } else if (selectedFunction === "sum_stats") {
        $state.go("sum_stats");
      } else if (selectedFunction === "default"){
        $state.go("default");
      }
    }
  }
}])

app.factory('TTI_API', ['$state', '$http', 'FileSaver', 'Blob', function($state, $http, FileSaver, Blob) {

  return {

    validateLocalDir: function(dirPath) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-local-dir",
          data: { localDir: dirPath }
        }).then(function(data) {
          console.log(data);
          resolve(data);
        }).catch(function(error) {
          console.log('vdrErr:', error);
        })
      })
    },

    validateRequestData: function(login, password, accountID, linkID, reportTypeFilter, mode, currentLinkReportList) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/validate-tti-request",
          data: { login: login, password: password, accountID: accountID, linkID: linkID, reportTypeFilter: reportTypeFilter, mode: mode, currentLinkReportList: currentLinkReportList }
        }).then(function(data) {
          console.log(data);
          resolve(data);
        }).catch(function(error) {
          console.log(error);
          reject(error);
        })
      })
    },

    batchDownload: function(login, password, accountID, linkID, reportList, reportTypes) {
      console.log('1');
      return new Promise(function(resolve, reject) {

        function postToServer(processStatus, nextSegmentIndex, distReportArrC, dlCount, numOfSegments, dupNumber, login_, password_, accountID_, linkID_, reportList_, reportTypes_) {
          console.log('2');
          return new Promise(function(resolve, reject) {
            $http({
              method: "POST",
              url: "/api/batch-download",
              data: { processStatus: processStatus, currentSegmentIndex: nextSegmentIndex, distReportArrC: distReportArrC, dlCount: dlCount, numOfSegments: numOfSegments, dupNumber: dupNumber, login: login_, password: password_, accountID: accountID_, linkID: linkID_, reportList: reportList_, reportTypes: reportTypes_ }
            }).then(function(data1) {
              console.log('HTTP REQUEST RESPONDED');
              resolve(data1);
            }).catch(function(error) {
              console.log(error);
              reject(error);
            })
          }).then(function(data2) {
            console.log(data2);
            if (data2.data.processStatus === "finished") {
              console.log('archive and download reports');
              $http({
                method: "POST",
                url: "/api/dl-to-client",
                data: { dataPath: data2.data.dataPath },
                responseType: 'arraybuffer'
              }).then(function(data3) {
                console.log(data3);
                var dateTmp = new Date();
                var dateObj = dateTmp.getMonth() + "-" + dateTmp.getDate() + "-" + dateTmp.getFullYear() + "_" + dateTmp.getHours() + "h" + dateTmp.getMinutes() + "m";
                var blob = new Blob([data3.data], { type: "application/zip" });
                var fileName = "assessments_" + dateObj + ".zip";
                FileSaver.saveAs(blob, fileName);
                console.log(data2);
                resolve(data2);
              }).catch(function(error) {
                console.log(error);
              })
            } else if (data2.data.processStatus === "midCycle") {
              console.log('run postToServer with New Data');
              postToServer(data2.data.processStatus, data2.data.prevSegmentIndex + 1, data2.data.distReportArr, data2.data.dlCount, data2.data.numOfSegments, data2.data.dupNumber, login, password, accountID, linkID, reportList, reportTypes);
            }
          }).catch(function(error) {
            console.log(error);
            reject(error);
          })
        }

        postToServer("fresh", 0, null, 0, 0, 0, login, password, accountID, linkID, reportList, reportTypes)

      })
    },

    sumPageDownload: function(login, password, accountID, linkID, directory, reportList, reportTypes) {
      return new Promise(function(resolve, reject) {
        $http({
          method: "POST",
          url: "/api/sumpage-download",
          data: { login: login, password: password, accountID: accountID, linkID: linkID, destination: directory, reportList: reportList, reportTypes: reportTypes }
        }).then(function(data) {
          if(data) {
            console.log(data);
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

app.factory('socket', ['$rootScope', '$state', function($rootScope, $state) {

  var url = $state.href('default', {}, {absolute: true})
  var socket = io.connect(url, { 'reconnection' : false });

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };


}])
