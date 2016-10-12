var app = angular.module('Indigo_Utilities',['ui.router', 'ngFileSaver'])

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('default', {
      url: '/',
      templateUrl: "templates/default.html",
      // controller: "Main_Controller"
    })
    .state('pbi_pfmt', {
      url: '/pbi_pfmt',
      templateUrl: "templates/pbi_pfmt.html",
      // controller: "Pbi_Pfmt_Controller"
    })
    .state('blue_list', {
      url: '/blue_list',
      templateUrl: "templates/blue_list.html",
      // controller: "Blue_List_Controller"
    })
    .state('ent_list', {
      url: '/ent_list',
      templateUrl: "templates/ent_list.html",
      // controller: "Ent_List_Controller"
    })
    .state('tti_massdl', {
      url: '/tti_massdl',
      templateUrl: "templates/tti_massdl.html",
      // controller: "TTI_MassDL_Controller"
    })

    $locationProvider.html5Mode(true);
})
