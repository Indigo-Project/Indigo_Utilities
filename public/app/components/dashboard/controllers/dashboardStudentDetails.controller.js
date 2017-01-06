app.controller('DashboardStudentDetails', ['$compile', '$scope', '$location', '$state', '$stateParams', '$http', 'siteNavigation', 'TTI_API', 'socket', '$window', 'DashboardService', 'localStorageService', 'RWD', function($compile, $scope, $location, $state, $stateParams, $http, siteNavigation, TTI_API, socket, $window, DashboardService, localStorageService, RWD) {

  // $scope object instantiation
  $scope.data = {};
  $scope.view = {};

  $scope.data.currentStudentDataObject;

  function responsiveAdaptationSD() {
    var studentDetailsPopup = $('section.student-window');
    $scope.view.baseDimensions = RWD.calculateBaseDimensions(studentDetailsPopup);

    // console.log($scope.view.baseDimensions.documentHeight, studentDetailsPopup.height());
    // console.log($scope.view.baseDimensions.documentWidth, studentDetailsPopup.width());

    // Set padding
    var studentWindowWidth = $scope.view.baseDimensions.documentWidth;
    var studentWindowHeight = $scope.view.baseDimensions.documentHeight;
    var horizontalPaddingRatio = 30/1234;
    var verticalPaddingRatio = 20/608.6875;
    var studentWindowPadding = { top: verticalPaddingRatio * studentWindowHeight, right: horizontalPaddingRatio * studentWindowWidth, bottom: verticalPaddingRatio * studentWindowHeight, left: horizontalPaddingRatio * studentWindowWidth };
    studentDetailsPopup.css('padding', studentWindowPadding.top + "px " + studentWindowPadding.right + "px " + studentWindowPadding.bottom + "px " + studentWindowPadding.left + "px");

    var studentWindowInnerWidth = studentWindowWidth - (studentWindowPadding.left + studentWindowPadding.right);
    var studentWindowInnerHeight = studentWindowHeight - (studentWindowPadding.top + studentWindowPadding.bottom);
    console.log(studentWindowWidth, studentWindowInnerWidth);
    console.log(studentWindowHeight, studentWindowInnerHeight);

    // Row 1 Elements
    var row1 = $('section.sde-row1');
    var row1Spacer = $('div.sde-spacer');
    var row1Header = $('div.sde-header');
    var setRow1HeightByElements = function() {
      row1Spacer.height(studentWindowInnerHeight * 0.02);
      var row1SpacerHeight = row1Spacer.height();
    }
    setRow1HeightByElements();


    // Row 2 Elements
    var row2 = $('section.sde-row2');
    var row2dems2_0 = $('div.sde-dems2-0');
    var row2dems2_1 = $('div.sde-dems2-1');
    var row2dems2_2 = $('div.sde-dems2-2');
    var row2Flags  = $('div.sde-flags');
    // row2.height(studentWindowInnerHeight * 0.2);
    function setRow2HeightByElements() {

    }

    // Row 3 Elements
    var row3 = $('section.sde-row3');
    var row3Disc = $('div.sde-disc');
    var row3DiscContent = $('div.sde-disc-content');
    var row3Motivators = $('div.sde-motivators');
    var row3MotivatorsContent = $('div.sde-motivators-content');
    var row3Skills = $('div.sde-skills');
    var row3SkillsContent = $('div.sde-skills-content');
    // row3.height(studentWindowInnerHeight * 0.35);
    function setRow3HeightByElements() {
      row3DiscContent.height(row3SkillsContent.height());
      row3MotivatorsContent.height(row3SkillsContent.height());
    }
    setRow3HeightByElements();

    // Row 4 Elements
    var row4 = $('section.sde-row4');
    var row4se0 = $('div.sde-se-0');
    var row4se1 = $('div.sde-se-1');
    var row4sed0 = $('div.sde-sed-0');
    var row4sed1 = $('div.sde-sed-1');
    var row4sed2 = $('div.sde-sed-2');
    // row4.height(studentWindowInnerHeight * 0.25);
    function setRow4HeightByElements() {

    }

    console.log(studentWindowInnerHeight, row1.height() + row2.height() + row3.height() + row4.height()  );
  }

  $scope.view.doneResizing = function() {
    $state.reload();
  }

  $scope.view.loadStudentDetails = function() {

    var studentDataObj = localStorageService.get('currentStudentData');
    $scope.data.currentStudentDataObject = { columnHeaders: studentDataObj.columnHeaders, currentStudentData: studentDataObj.studentData };

    window.requestAnimationFrame(responsiveAdaptationSD);
    var resizeTimeout;
    $(window).on("resize orientationChange", function() {
      clearTimeout(resizeTimeout)
      // 100ms after most recent resize, refresh the $state
      resizeTimeout = setTimeout($scope.view.doneResizing(), 100);
      window.requestAnimationFrame(responsiveAdaptationSD);
    })
  }


  // load student details on state load
  $scope.view.loadStudentDetails();

  $scope.view.closeStudentDetails = function(event) {
    if (event.target.attributes.class.value.split(' ')[0] === 'dashboard-studentdetails') {
      var returnPath = $location.path()
      var returnPathArr = returnPath.split('/')
      $state.go('dashboard', { collection: returnPathArr[2], id: returnPathArr[3] })
    }
  }




}])
