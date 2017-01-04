app.directive('sumPage', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/components/sumPageGenerator/directives/partials/sum_page_generator.html',
    controller: 'SumPageGenerator'
  }
})
