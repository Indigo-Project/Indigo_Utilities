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

app.directive('d3', function ( /* dependencies */ ) {
  // define constants and helpers used for the directive
  // ...
  return {
    restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
    scope: { // attributes bound to the scope of the directive
      val: '='
    },
    link: function (scope, element, attrs) {
      // initialization, done once per my-directive tag in template. If my-directive is within an
      // ng-repeat-ed template then it will be called every time ngRepeat creates a new copy of the template.

      // ...

      // whenever the bound 'exp' expression changes, execute this
      scope.$watch('exp', function (newVal, oldVal) {
        // ...
      });
    }
  };
});
