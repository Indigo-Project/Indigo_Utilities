app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: "views/home.html",
    })
    .state('pbi_pfmt', {
      url: '/pbi_pfmt',
      templateUrl: "views/pbi_preformatter.html",
    })
    .state('blue_list', {
      url: '/blue_list',
      templateUrl: "views/blue_list_generator.html",
    })
    .state('ent_list', {
      url: '/ent_list',
      templateUrl: "views/ent_list_generator.html",
    })
    .state('tti_massdl', {
      url: '/tti_massdl',
      templateUrl: "views/tti_mass_downloader.html",
    })
    .state('sum_page', {
      url: '/sum_page',
      templateUrl: "views/sum_page_generator.html",
    })
    .state('sum_stats', {
      url: '/sum_stats',
      templateUrl: "views/sum_stats_generator.html",
    })
    .state('dashboard_gen', {
      url: '/dashboard_gen',
      templateUrl: "views/dashboard_generator.html",
    })
    .state('dashboard_manager', {
      url: '/dashboard_manager',
      templateUrl: "views/dashboard_manager.html",
    })
    .state('dashboard', {
      url: '/dashboards/:collection/:id',
      templateUrl: "views/dashboard.html",
    })
    .state('dashboard_student_detail', {
      url: '/dashboards/:collection/:id/:studentpath',
      templateUrl: "views/dashboard_studentdetail.html",
    })

})
