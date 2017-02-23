app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  var url = (window.location != window.parent.location) ? document.referrer : document.location.host;
  var fathymParent = url.substring(7,20) === "indigo.fathym" ? true : false;

  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: "views/login.html",
      params: {
        inactivityLogout: null
      }
    })
    .state('home', {
      url: '/',
      templateUrl: "views/home.html",
      data: {
        requiresLogin: true
      }
    })
    .state('pbi_pfmt', {
      url: '/pbi_pfmt',
      templateUrl: "views/pbi_preformatter.html",
      data: {
        requiresLogin: true
      }
    })
    .state('blue_list', {
      url: '/blue_list',
      templateUrl: "views/blue_list_generator.html",
      data: {
        requiresLogin: true
      }
    })
    .state('ent_list', {
      url: '/ent_list',
      templateUrl: "views/ent_list_generator.html",
      data: {
        requiresLogin: true
      }
    })
    .state('tti_batchdl', {
      url: '/tti_batchdl',
      templateUrl: "views/tti_batch_downloader.html",
      data: {
        requiresLogin: true
      }
    })
    .state('sum_page', {
      url: '/sum_page',
      templateUrl: "views/sum_page_generator.html",
      data: {
        requiresLogin: true
      }
    })
    .state('sum_stats', {
      url: '/sum_stats',
      templateUrl: "views/sum_stats_generator.html",
      data: {
        requiresLogin: true
      }
    })
    .state('dashboard_gen', {
      url: '/dashboard_gen',
      templateUrl: "views/dashboard_generator.html",
      data: {
        requiresLogin: true
      }
    })
    .state('dashboard_manager', {
      url: '/dashboard_manager',
      templateUrl: "views/dashboard_manager.html",
      data: {
        requiresLogin: true
      }
    })
    .state('dashboard_manager.create_dashboard', {
      url: '/create_dashboard',
      templateUrl: "views/dashboard_manager_create_dash.html",
      data: {
        requiresLogin: true
      }
    })
    .state('school_data_manager', {
      url: '/school_data_manager',
      templateUrl: "views/school_data_manager.html",
      data: {
        requiresLogin: true
      }
    })
    .state('user_manager', {
      url: '/user_manager',
      templateUrl: "views/user_manager.html",
      data: {
        requiresLogin: true
      }
    })
    .state('dashboard', {
      url: '/dashboards/:collection/:dashRefId',
      templateUrl: "views/dashboard.html",
      data: {
        requiresLogin: fathymParent ? false : true
      }
    })
    .state('dashboard.dashboard_student_detail', {
      url: '/:studentpath',
      templateUrl: "views/dashboard_studentdetail.html",
      data: {
        requiresLogin: fathymParent ? false : true
      }
    })

})
