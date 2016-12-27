var app = angular.module('Indigo_Utilities',['ui.router', 'ngFileSaver', 'LocalStorageModule'])

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {

  localStorageServiceProvider
  .setPrefix('indigo-utility')

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('default', {
      url: '/',
      templateUrl: "templates/default.html",
    })
    .state('pbi_pfmt', {
      url: '/pbi_pfmt',
      templateUrl: "templates/pbi_pfmt.html",
    })
    .state('blue_list', {
      url: '/blue_list',
      templateUrl: "templates/blue_list.html",
    })
    .state('ent_list', {
      url: '/ent_list',
      templateUrl: "templates/ent_list.html",
    })
    .state('tti_massdl', {
      url: '/tti_massdl',
      templateUrl: "templates/tti_massdl.html",
    })
    .state('sum_page', {
      url: '/sum_page',
      templateUrl: "templates/sum_page.html",
    })
    .state('sum_stats', {
      url: '/sum_stats',
      templateUrl: "templates/sum_stats.html",
    })
    .state('dashboard_gen', {
      url: '/dashboard_gen',
      templateUrl: "templates/dashboard_gen.html",
    })
    .state('dashboard_manager', {
      url: '/dashboard_manager',
      templateUrl: "templates/dashboard_manager.html",
    })
    .state('dashboard_fullscreen', {
      url: '/dashboards/:collection/:id',
      templateUrl: "templates/dashboard_fullscreen.html",
    })
    .state('dashboard_student_detail', {
      url: '/dashboards/:collection/:id/:studentpath',
      templateUrl: "templates/dashboard_studentdetail.html",
    })

    $locationProvider.html5Mode(true);
})
