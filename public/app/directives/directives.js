app.directive('header', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/header.html',
    controller: 'Main_Controller'
  }
})

app.directive('welcome', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/welcome.html',
  }
})

app.directive('pbiPfmt', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/pbi_pfmt.html',
    controller: "Pbi_Pfmt_Controller"
  }
})

app.directive('fileread', function() {
  return {
    restrict: 'A',
    scope: {
      fileread: "=",
    },
    link: function (scope, element, attributes) {
      element.bind("change", function (changeEvent) {
        var reader = new FileReader();
        // console.log(changeEvent.target.files[0]);
        reader.readAsDataURL(changeEvent.target.files[0]);
        reader.onload = function(loadEvent) {
          // console.log(loadEvent);
          var atobStartIndex = loadEvent.target.result.indexOf('base64') + 7;
          var csv_file = window.atob(loadEvent.target.result.substring(atobStartIndex));
          // console.log(csv_file);
          scope.$apply(function () {
            scope.fileread = csv_file;
          });
        }
      });
    },
  }
})

app.directive('blueList', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/blue_list.html',
    controller: "Blue_List_Controller"
  }
})

app.directive('entList', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/ent_list.html',
    controller: 'Ent_List_Controller'
  }
})

app.directive('ttiMassdl', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/tti_massdl.html',
    controller: 'TTI_MassDL_Controller'
  }
})

app.directive('sumPage', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/sum_page.html',
    controller: 'Sum_Page_Controller'
  }
})

app.directive('sumStats', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/sum_stats.html',
    controller: 'Sum_Stats_Controller'
  }
})

app.directive('dashboardGen', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/dashboard_gen.html',
    controller: 'Dashboard_Gen_Controller'
  }
})

app.directive('dashboardManager', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/dashboard_manager.html',
    controller: 'Dashboard_Manager_Controller'
  }
})

app.directive('dashboardFrame', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/dashboard_frame.html',
    controller: 'Dashboard_View_Controller'
  }
})

app.directive('dashboardFullscreen', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/dashboard_fullscreen.html',
    controller: 'Dashboard_View_Controller'
  }
})

app.directive('dashboardStudentdetails', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/dashboard_studentdetails.html',
    controller: 'Dashboard_View_Controller'
  }
})

app.directive('popupBackground', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/popup_background.html',
    controller: 'Dashboard_Controller'
  }
})
