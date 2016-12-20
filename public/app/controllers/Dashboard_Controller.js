app.controller('Dashboard_Controller', ['$scope', '$state', '$http', 'Main_Service', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', function($scope, $state, $http, Main_Service, TTI_API, socket, $window, DashboardService, localStorageService) {

  // responsive calcs
  console.log('document width:', document.documentElement.clientWidth);
  console.log('document height:', document.documentElement.clientHeight);
  console.log('window width:', window.innerWidth);
  console.log('window height:', window.innerHeight);

  $scope.data = {};
  $scope.uploader = {};
  $scope.view = {};

  // School name options dropdown and dashboard manager options setup
  DashboardService.getSchoolNameOptions()
  .then(function(data) {
    $scope.view.dashboardNameOptions = data.data;
    var schoolNames = Object.keys($scope.view.dashboardNameOptions);
    for (var i = 0; i < schoolNames.length; i++) {
      $scope.view.dashboardNameOptions[schoolNames[i]].code = schoolNames[i]
    }

    console.log($scope.view.dashboardNameOptions);

    DashboardService.getStoredSchools()
    .then(function(collections) {
      var collectionNames = Object.keys(collections.data);
      console.log(collectionNames);
      $scope.data.dbCollections = {};
      for (var i = 0; i < collectionNames.length; i++) {
        for (var j = 0; j < schoolNames.length; j++) {
          if (collectionNames[i] === schoolNames[j]) {
            console.log(collectionNames[i], schoolNames[j]);
            $scope.data.dbCollections[collectionNames[i]] = collections.data[collectionNames[i]];
            $scope.data.dbCollections[collectionNames[i]].nameOptions = $scope.view.dashboardNameOptions[collectionNames[i]];
          }
        }
      }
      console.log($scope.data.dbCollections);

      var dbCollections = Object.keys($scope.data.dbCollections);
      $scope.data.availableCollections = {};
      for (var i = 0; i < dbCollections.length; i++) {
        $scope.data.availableCollections[dbCollections[i]] = $scope.data.dbCollections[dbCollections[i]].nameOptions;
      }
      console.log($scope.data.availableCollections);

      $scope.data.availableVersions = {};
      for (var i = 0; i < dbCollections.length; i++) {
        var currentCollection = $scope.data.dbCollections[dbCollections[i]];
        var collectionVKeys = Object.keys(currentCollection)
        $scope.data.availableVersions[dbCollections[i]] = {};
        for (var j = 0; j < collectionVKeys.length; j++) {
          if (collectionVKeys[j] !== "nameOptions") {
            $scope.data.availableVersions[dbCollections[i]][collectionVKeys[j]] = currentCollection[collectionVKeys[j]];
          }
        }
      }
      console.log($scope.data.availableVersions);

      $scope.$apply();
    });
  });

  $scope.data.schoolName = "";
  $scope.data.schoolCode = "";
  $scope.data.dataObject = "";
  $scope.data.studentFilter = [];
  $scope.data.classFilter = [];
  $scope.data.genderFilter = [];

  if ($state.current.name === "dashboard_gen") {
    $scope.view.selectedFunction = "dashboard_gen";
  } else if ($state.current.name === "dashboard_manager") {
      $scope.view.selectedFunction = "dashboard_manager";
  }
  $scope.view.uploadOptionStatus = "no selection"
  $scope.view.dashboardCreationStatus = "";
  $scope.view.displayDashboard = false;
  $scope.view.dashboardSection = "studentData";

  //Dashboard Manager
  $scope.view.dashMschoolCode = "";
  $scope.view.dashMschoolVersion = "";

  // On Dashboard Manager school selection, configure available versions for school
  $scope.view.updateVersionOptions = function() {
    if ($scope.view.dashMschoolCode) {
      var returnVersions = {};
      $scope.view.currentVersions = $scope.data.availableVersions[$scope.view.dashMschoolCode];
      console.log($scope.view.currentVersions);
    } else {
      console.log('NO COLLECTION SELECTED');
    }
  };

  // load current dashboard version data object into $scope variable and local storage, then create dashboard
  $scope.view.loadVersion = function() {
    $scope.view.showMDashboard = false;
    if ($scope.view.dashMschoolVersion) {
      console.log($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion);
      DashboardService.getStoredDashboardData($scope.view.dashMschoolCode, $scope.view.dashMschoolVersion)
      .then(function(data) {
        $scope.data.currentDashboardDataObject = data
        localStorageService.set('currentDashboardData', data);
        DashboardService.createDashboard($scope.data.currentDashboardDataObject, $scope.view.dashMschoolCode);
        $scope.view.iframeSrc = '/dashboards/' + $scope.view.dashMschoolCode + "/" + $scope.data.currentDashboardDataObject._id;
        $scope.view.iframeDimensions = []
        console.log($scope.view.iframeSrc);
        $scope.view.showMDashboard = true;
        $('span.sd-title-name').html($scope.view.dashMschoolCode + " ");
        $scope.$apply();
      }).catch(function(error) {
        console.log(error);
      })
    } else {
      console.log('NO VERSION SELECTED');
    }
  };

  $scope.view.loadFSDashboard = function() {
    var dashboardData = localStorageService.get('currentDashboardData');
    console.log(dashboardData);
    $scope.data.studentNumber = dashboardData.compiledData.studentData.length;
    DashboardService.createDashboard(dashboardData);
    $scope.view.showFSDashboard = true;
  }

  // Open new tab with full screen dashboard
  $scope.view.FullScreenDashboard = function() {
    $scope.data.studentNumber = $scope.data.currentDashboardDataObject.compiledData.studentData.length;
    var collection = $scope.view.dashMschoolCode;
    var id = $scope.data.currentDashboardDataObject._id;
    window.open('/dashboards/' + collection + '/' + id, '_blank');
  }

  // If state is dashboard_fullscreen on load, load dashboard into view
  console.log($state.current.name);
  if ($state.current.name === "dashboard_fullscreen") {
    console.log('INSIDE');
    $scope.view.showFSDashboard = false;
    $scope.view.loadFSDashboard();
    // $scope.$apply();
  }

  // iFrame generation testing
  // $scope.view.dashboardFrame = $('section.dashboard-frame').html();
  $scope.view.generateIframe = function() {
    console.log('generating iframe...');

    console.log('iframe template before', DashboardService.iframeHtml.template);
    DashboardService.iframeHtml.template = $('section.dashboard-frame').html();
    // console.log('iframe template after', DashboardService.iframeHtml.template);
    // var iframe = document.createElement("iframe");
    // iframe.setAttribute("srcdoc", DashboardService.iframeHtml.template);
    // iframe.style.width = "1440px";
    // iframe.style.height = "723px";
    // var iframePartial = angular.element('dashboard-iframe');
    // console.log(iframePartial);
    // iframePartial.append(iframe);
    window.open('/dashboard_iframe');
  }

  $scope.view.studentFilter = [];
  $scope.view.classFilter = [];
  $scope.view.genderFilter = [];

  // dynamically change options based on selected function
  $scope.view.accessFunction = function () {
    Main_Service.accessFunction($scope.view.selectedFunction);
  }

  $scope.view.displayOption = function(status) {
    $scope.view.uploadOptionStatus = status;
    if (status === 'csv-upload') {
      return 'option-selected';
    } else if (status === 'tti-import') {
      return 'option-selected';
    }
  }

  $scope.view.applyFilters = function() {
    DashboardService.applyFilters($scope.view.studentFilter, $scope.view.classFilter, $scope.view.genderFilter);
  }

  $scope.view.toggleStudentSelection = function(studentName) {
    var i = $scope.data.studentFilter.indexOf(studentName)
    if (i > -1) {
      $scope.data.studentFilter.splice(i, 1);
    } else {
      $scope.data.studentFilter.push(studentName);
    }
    console.log($scope.data.studentFilter);
  }

  $scope.view.toggleClassSelection = function(className) {
    var i = $scope.data.classFilter.indexOf(className)
    if (i > -1) {
      $scope.data.classFilter.splice(i, 1);
    } else {
      $scope.data.classFilter.push(className);
    }
    console.log($scope.data.classFilter);
  }

  $scope.view.toggleGenderSelection = function(gender) {
    var i = $scope.data.genderFilter.indexOf(gender)
    if (i > -1) {
      $scope.data.genderFilter.splice(i, 1);
    } else {
      $scope.data.genderFilter.push(gender);
    }
    console.log($scope.data.genderFilter);
  }

  // $scope.uploader.file = undefined;
  $scope.uploader.loadedFiles = [];

  $scope.uploader.addChosenReports = function(uploadType) {
    console.log('adding chosen report');
    if ($scope.uploader.role === undefined) {
      alert("PLEASE SELECT ROLE")
    }
    else if ($scope.uploader.role === 'Students' && ($scope.uploader.schoolYearTaken === undefined || $scope.uploader.class === undefined)) {
      console.log(0);
      if ($scope.uploader.schoolYearTaken === undefined && $scope.uploader.class === undefined) {
        console.log(1);
        alert("PLEASE ENTER SCHOOL YEAR TAKEN AND CLASS")
      }
      else if ($scope.uploader.schoolYearTaken === undefined) {
        console.log(2);
        console.log("PLEASE ENTER SCHOOL YEAR TAKEN");
        alert("PLEASE ENTER SCHOOL YEAR TAKEN")
      }
      else if ($scope.uploader.class === undefined) {
        console.log(3);
        console.log("PLEASE ENTER CLASS");
        alert("PLEASE ENTER CLASS")
      }
    }
    else if ($scope.uploader.file === undefined)  {
      alert("NO FILE UPLOADED");
    } else {
      console.log('EXECUTING');
      $scope.uploader.loadedFiles.push(
        {uploadType: uploadType,
        name: $('input[type=file]').val().substring(12),
        reportType: $scope.uploader.reportType,
        role: $scope.uploader.role,
        data: $scope.uploader.file,
        schoolYearTaken: $scope.uploader.schoolYearTaken,
        class: $scope.uploader.class});

      angular.element("input[type='file']").val(null);
      $scope.uploader.reportType = undefined;
      $scope.uploader.file = undefined;
      $scope.uploader.role = undefined;
      $scope.uploader.schoolYearTaken = undefined;
      $scope.uploader.class = undefined;
      $('input[type=file]').val(null)
    }
    // console.log($scope.uploader.loadedFiles);
  }

  $scope.data.generateDashboard = function() {
    if ($scope.uploader.loadedFiles.length === 0) {
      alert("NO FILES HAVE BEEN LOADED FOR FORMATTING");
    } else if (!$scope.data.schoolName) {
      alert("PLEASE SELECT SCHOOL");
    } else {
      if(confirm("Please confirm that the school name is correct. Upon submission for dashboard generation, this name will become a unique identifier for the dashboard, associated within the same grouping as future versions of dashboards for the same school. refer to FAQ for a more detailed explanation of how this works.")) {
        console.log('GENERATING');

        var dashboardNameOptions = $scope.view.dashboardNameOptions;
        for (var code in dashboardNameOptions) {
          if (dashboardNameOptions[code].name === $scope.data.schoolName) {
            $scope.data.schoolCode = code;
          }
        }
        DashboardService.getDataObject($scope.uploader.loadedFiles, $scope.data.schoolCode)
        .then(function(data) {
          var dataObjKeys = Object.keys(data.data);
          console.log(data.data);
          $scope.data.studentNumber = data.data.compiledData.studentData.length;
          $scope.data.studentClasses = [];

          // generate class array
          for (var i = 0; i < dataObjKeys.length; i++) {
            if (dataObjKeys[i] === "Staff" || dataObjKeys[i] === "compiledData" || dataObjKeys[i] === "metaData" || dataObjKeys[i] === "_id") {
              console.log('not a student group, do not add to class options');
            } else {
              $scope.data.studentClasses.push(dataObjKeys[i].substring(0,4))
            }
          }

          DashboardService.createDashboard(data.data)
          $('span.sd-title-name').html($scope.data.schoolName + " ");
          $scope.view.dashboardCreationStatus = "success";
          $scope.$apply();
        })
      } else {
        console.log('Generation Aborted');
      }
    }
  }

  // $scope.view.dashboardNav = function(dashboardSection) {
  //   $scope.view.dashboardSection = dashboardSection;
  //   $('.dashboard-nav').removeClass('dash-frame-selected');
  //   $('.dashboard-nav.' + dashboardSection).addClass('dash-frame-selected');
  // }


  // CHART TEST

  // var data = [11, 20, 27, 13, 22];
  //
  // var x = d3.scaleLinear()
  //   .domain([0, d3.max(data)])
  //   .range([0, 220]);
  //
  // d3.select("div.chart")
  //   .selectAll("div")
  //     .data(data)
  //   .enter().append("div")
  //     .style("width", function(d) { return x(d) + "px"; })
  //     .text(function(d) { return d; })



}])
