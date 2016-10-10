app.directive('header', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/directives/partials/header.html',
    controller: 'Main_Controller'
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
          reader.onload = function (loadEvent) {
            console.log(loadEvent);
            var csv_file = atob(loadEvent.target.result.substring(21));
            // console.log(csv_file);
            scope.$apply(function () {
              scope.fileread = csv_file;
            });
          }
          console.log(changeEvent);
          reader.readAsDataURL(changeEvent.target.files[0]);
        });
    },
    // controller: "Pbi_Pfmt_Controller"
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
