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

    // Set padding on student window
    var studentWindowWidth = $scope.view.baseDimensions.documentWidth;
    var studentWindowHeight = $scope.view.baseDimensions.documentHeight;
    var horizontalPaddingRatio = 30/1294;
    var verticalPaddingRatio = 20/648.6875;
    var studentWindowPadding = { top: verticalPaddingRatio * studentWindowHeight, right: horizontalPaddingRatio * studentWindowWidth, bottom: verticalPaddingRatio * studentWindowHeight, left: horizontalPaddingRatio * studentWindowWidth };
    studentDetailsPopup.css('padding', studentWindowPadding.top + "px " + studentWindowPadding.right + "px " + studentWindowPadding.bottom + "px " + studentWindowPadding.left + "px");

    var studentWindowInnerWidth = studentWindowWidth - (studentWindowPadding.left + studentWindowPadding.right);
    var studentWindowInnerHeight = studentWindowHeight - (studentWindowPadding.top + studentWindowPadding.bottom);

    // Responsive Calculations (unassigned), * studentWindowInnerHeight (608.6875)
    var responsiveCalcs = {
      rowHeights: {
        row1Proportion: 0.07608584043536297 * studentWindowInnerHeight,
        row2Proportion: 0.27428380737242014 * studentWindowInnerHeight,
        row3Proportion: 0.39701201355375293 * studentWindowInnerHeight,
        row4Proportion: 0.2526183386384639 * studentWindowInnerHeight
      },
      rowTopBottomPadding: {
        row1: [0, (5/608.6875 * studentWindowInnerHeight)],
        row2: [(10/608.6875 * studentWindowInnerHeight), (12.5/608.6875 * studentWindowInnerHeight)],
        row3: [(10/608.6875 * studentWindowInnerHeight), (12.5/608.6875 * studentWindowInnerHeight)],
        row4: [(10/608.6875 * studentWindowInnerHeight), 0]
      },
      sectionHeights: {
        row1Spacer: 6.086875/608.6875 * studentWindowInnerHeight,
        row1Header: 34.97918200352931/608.6875 * studentWindowInnerHeight
      },
      sectionPadding: {
        leftS: 10/608.6875 * studentWindowInnerHeight,
        leftL: 15/608.6875 * studentWindowInnerHeight,
        right: 15/608.6875 * studentWindowInnerHeight
      },
      sectionTitles: {
        row2Font: 16/608.6875 * studentWindowInnerHeight,
        row3Font: 18/608.6875 * studentWindowInnerHeight,
        row4Font: 16/608.6875 * studentWindowInnerHeight,
        row2Margin: 10/608.6875 * studentWindowInnerHeight,
        row3Margin: 15/608.6875 * studentWindowInnerHeight,
        row4Margin: 10/608.6875 * studentWindowInnerHeight
      },
      sectionFigCaption: {
        paddingLeft: 8/608.6875 * studentWindowInnerHeight,
        fontSize: 9/608.6875 * studentWindowInnerHeight
      },
      contentHeight: {
        row2Dems2: 114.890625/608.6875 * studentWindowInnerHeight,
        row3Disc: 182.203125/608.6875 * studentWindowInnerHeight,
        row3Motivators: 170/608.6875 * studentWindowInnerHeight,
        row3Skills: 182.203125/608.6875 * studentWindowInnerHeight,
        row4Se: 114.265625/608.6875 * studentWindowInnerHeight,
        row4Sed: 114.265625/608.6875 * studentWindowInnerHeight
      },
      contentPadding: {
        left: 10/608.6875 * studentWindowInnerHeight
      },
      valueSizing: {
        paddingBottom: 5/608.6875 * studentWindowInnerHeight,
        subPaddingLeft: 5/608.6875 * studentWindowInnerHeight,
        nameFont: 32/608.6875 * studentWindowInnerHeight,
        smallFont: 10/608.6875 * studentWindowInnerHeight,
        smallFontLh: (10/608.6875) * studentWindowInnerHeight,
        smallFontMarginBottom: 5/608.6875 * studentWindowInnerHeight,
        mediumFont: 16/608.6875 * studentWindowInnerHeight,
        mediumFontLh: (16/608.6875  * 4/5) * studentWindowInnerHeight,
        LargeFont: 20/608.6875 * studentWindowInnerHeight,
        LargeFontLh: (20/608.6875  * 4/5) * studentWindowInnerHeight
      },
      labelSizing: {
        font: 10/608.6875 * studentWindowInnerHeight
      },
      skillsDimensions: {
        spanMarginRight: 14/608.6875 * studentWindowInnerHeight,
        spanWidth: 119.2/608.6875 * studentWindowInnerHeight
      }
    };

    // Universal Elements
    var pSub = $('p.sd-sub');
    var valContent = $('div.sd-content-p');
    var setUniversalDimensions = function () {
      pSub.css('padding-left', responsiveCalcs.valueSizing.subPaddingLeft + 'px');
      pSub.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + 'px');
      valContent.css('padding-bottom', responsiveCalcs.valueSizing.paddingBottom + "px");
    }
    setUniversalDimensions();

    // Row 1 Elements
    var row1 = $('section.sde-row1');
    var row1Spacer = $('div.sde-spacer');
    var row1Header = $('div.sde-header');
    var row1Name = $('h3.sde-name');
    var row1Dems1 = $('div.sde-dems1');
    var row1Dem1Values = $('p.sde-dems1');
    var row1Dem1Labels = $('label.sde-dems1');
    var row1Flags = $('div.sde-flags');

    var setRow1Dimensions = function() {
      row1Spacer.height(responsiveCalcs.sectionHeights.row1Spacer);
      row1Header.height(responsiveCalcs.sectionHeights.row1Header);
      row1.css('padding-bottom', responsiveCalcs.rowTopBottomPadding.row1[1] + 'px;');
      row1Name.css('font-size', responsiveCalcs.valueSizing.nameFont + 'px');
      row1Dems1.css('padding', '0 ' + responsiveCalcs.sectionPadding.right + 'px 0 ' + responsiveCalcs.sectionPadding.leftL + 'px');
      row1Dem1Values.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
      row1Dem1Values.css('line-height', responsiveCalcs.valueSizing.smallFontLh + 'px');
      row1Dem1Values.css('margin-bottom', responsiveCalcs.valueSizing.smallFontMarginBottom + 'px');
      row1Dem1Labels.css('font-size', responsiveCalcs.labelSizing.font + 'px');
    }
    setRow1Dimensions();


    // Row 2 Elements
    var row2 = $('section.sde-row2');
    var sdeDems2 = $('div.sde-dems2');
    var sdeDems2Content = $('div.sde-dems2-content');
    var row2dems2_0 = $('div.sde-dems2-0');
    var row2dems2_1 = $('div.sde-dems2-1');
    var row2dems2_2 = $('div.sde-dems2-2');
    var row2Flags  = $('div.sde-flags');
    var row2Dems2HeaderDiv = $('div.sde-dems2-header');
    var row2Dems2TitleFont = $('h4.sde-row2-title');
    var row2Dems2Values = $('p.sde-dems2');
    var row2Dems2Labels = $('label.sde-dems2');

    function setRow2HeightByElements() {
      // row2.height(studentWindowInnerHeight * 0.24);
      row2.css('padding', responsiveCalcs.rowTopBottomPadding.row2[0] + 'px 0 ' + responsiveCalcs.rowTopBottomPadding.row2[1] + 'px 0');
      sdeDems2.css('padding-right', responsiveCalcs.sectionPadding.right + 'px');
      sdeDems2Content.height(responsiveCalcs.contentHeight.row2Dems2);
      sdeDems2Content.css('padding-left', responsiveCalcs.sectionPadding.leftS + 'px');
      row2Dems2HeaderDiv.css('margin-bottom', responsiveCalcs.sectionTitles.row2Margin + 'px');
      row2Dems2TitleFont.css('font-size', responsiveCalcs.sectionTitles.row2Font + 'px');
      row2Dems2Values.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
      row2Dems2Values.css('line-height', (responsiveCalcs.valueSizing.smallFontLh) + 'px');
      // row2Dems2Values.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + 'px');
      row2Dems2Labels.css('font-size', responsiveCalcs.labelSizing.font + 'px');
    }
    setRow2HeightByElements();
    // console.log(row2.outerHeight(), row2.outerHeight() - 51.5, sdeDems2Content.outerHeight());

    // Row 3 Elements
    var row3 = $('section.sde-row3');
    var row3Disc = $('div.sde-disc');
    var row3DiscContent = $('div.sde-disc-content');
    var row3Motivators = $('div.sde-motivators');
    var row3MotivatorsContent = $('div.sde-motivators-content');
    var row3Skills = $('div.sde-skills');
    var row3SkillsContent = $('div.sde-skills-content');
    row3.height(studentWindowInnerHeight * 0.365);
    function setRow3HeightByElements() {
      // row3DiscContent.height(row3SkillsContent.height());
      // row3MotivatorsContent.height(row3SkillsContent.height());
    }
    setRow3HeightByElements();

    // console.log(row3.outerHeight(), row3.outerHeight() - 23.5 - $('div.sde-disc-header').outerHeight() - 15, row3DiscContent.height());
    // 238.109375 178.109375 155

    // Row 4 Elements
    var row4 = $('section.sde-row4');
    var row4se0 = $('div.sde-se-0');
    var row4se1 = $('div.sde-se-1');
    var row4sed0 = $('div.sde-sed-0');
    var row4sed1 = $('div.sde-sed-1');
    var row4sed2 = $('div.sde-sed-2');

    function setRow4HeightByElements() {
      row4.height(studentWindowInnerHeight * 0.240527774925557);
    }
    setRow4HeightByElements();

    // console.log(row4.outerHeight(), row4.outerHeight() - 10 - 10 - $('div.sde-se-header').outerHeight(), $('div.sde-se-content').outerHeight());
    // console.log(row1.outerHeight()/studentWindowInnerHeight, row2.outerHeight()/studentWindowInnerHeight, row3.outerHeight()/studentWindowInnerHeight, row4.outerHeight()/studentWindowInnerHeight, row1.outerHeight()/studentWindowInnerHeight + row2.outerHeight()/studentWindowInnerHeight + row3.outerHeight()/studentWindowInnerHeight + row4.outerHeight()/studentWindowInnerHeight, 1 - (row1.outerHeight()/studentWindowInnerHeight + row2.outerHeight()/studentWindowInnerHeight + row3.outerHeight()/studentWindowInnerHeight));

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
