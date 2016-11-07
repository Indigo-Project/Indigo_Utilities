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
