app.factory('siteNavigation', ['$state', function($state) {

  return {
    accessFunction: function(selectedFunction, functionType) {
      if (selectedFunction === "blue_list") {
        $state.go("blue_list");
      } else if (selectedFunction === "ent_list") {
        $state.go("ent_list");
      } else if (selectedFunction === "tti_batchdl") {
        $state.go("tti_batchdl");
      } else if (selectedFunction === "sum_page") {
        $state.go("sum_page");
      } else if (selectedFunction === "sum_stats") {
        $state.go("sum_stats");
      } else if (selectedFunction === "dashboard_gen") {
        $state.go("dashboard_gen");
      } else if (selectedFunction === "dashboard_manager"){
        $state.go("dashboard_manager");
      } else if (selectedFunction === "home"){
        $state.go("home");
      }
    }
  }

}])
