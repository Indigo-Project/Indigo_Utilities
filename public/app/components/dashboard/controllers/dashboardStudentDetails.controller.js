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
        row1Spacer: Math.min(6.086875/608.6875 * studentWindowInnerHeight, 12.34/1234 * studentWindowInnerWidth),
        row1Header: 34.97918200352931/608.6875 * studentWindowInnerHeight
      },
      sectionPadding: {
        left: 15/1234 * studentWindowWidth,
        right: 15/1234 * studentWindowWidth
      },
      sectionTitles: {
        row2Font: Math.min(16/608.6875 * studentWindowInnerHeight, 16/1234 * studentWindowWidth),
        row3Font: Math.min(18/608.6875 * studentWindowInnerHeight, 18/1234 * studentWindowWidth),
        row4Font: Math.min(16/608.6875 * studentWindowInnerHeight, 16/1234 * studentWindowWidth),
        row4Font2: Math.min(14/608.6875 * studentWindowInnerHeight, 14/1234 * studentWindowWidth),
        row2Margin: 10/608.6875 * studentWindowInnerHeight,
        row3Margin: 15/608.6875 * studentWindowInnerHeight,
        row4Margin: 10/608.6875 * studentWindowInnerHeight,
        row4Margin2: 16/608.6875 * studentWindowInnerHeight,
      },
      sectionFigures: {
        discChartHeight: Math.min(31/608.6875 * studentWindowInnerHeight, 31/1234 * studentWindowWidth),
        discChartBarHeight: Math.min(12/608.6875 * studentWindowInnerHeight, 12/1234 * studentWindowWidth)
      },
      sectionFigCaption: {
        paddingLeft: 8/1234 * studentWindowWidth,
        fontSize:  Math.min(9/608.6875 * studentWindowInnerHeight, 9/1234 * studentWindowWidth),
      },
      contentHeight: {
        row2Dems2: 114.890625/608.6875 * studentWindowInnerHeight,
        row3Disc: 182.203125/608.6875 * studentWindowInnerHeight,
        row3Motivators: 170/608.6875 * studentWindowInnerHeight,
        row3Skills: 182.203125/608.6875 * studentWindowInnerHeight,
        row4Se: 102.265625/608.6875 * studentWindowInnerHeight,
        row4Sed: 114.265625/608.6875 * studentWindowInnerHeight
      },
      contentPadding: {
        left: 10/1234 * studentWindowWidth
      },
      valueSizing: {
        marginBottom: 5/608.6875 * studentWindowInnerHeight,
        subPaddingLeft: 5/1234 * studentWindowWidth,
        nameFont: Math.min(32/608.6875 * studentWindowInnerHeight, 32/1234 * studentWindowWidth),
        smallFont: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
        smallFontLh: Math.min(9/608.6875 * studentWindowInnerHeight, 9/1234 * studentWindowWidth),
        smallFontMarginBottom: 5/608.6875 * studentWindowInnerHeight,
        mediumFont: Math.min(16/608.6875 * studentWindowInnerHeight, 16/1234 * studentWindowWidth),
        mediumFontLh: Math.min((16/608.6875  * 4/5) * studentWindowInnerHeight, (16/1234 * 4/5) * studentWindowInnerWidth),
        largeFont: Math.min(20/608.6875 * studentWindowInnerHeight, 20/1234 * studentWindowWidth),
        largeFontLh: Math.min((20/608.6875  * 4/5) * studentWindowInnerHeight, (20/1234 * 4/5) * studentWindowInnerWidth),
      },
      labelSizing: {
        font: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
        lineHeight: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
      },
      skillsDimensions: {
        spanMarginRight: 16.5/1234 * studentWindowWidth,
        spanWidth: 110/1234 * studentWindowWidth,
        valLh: Math.min(12.8/608.6875 * studentWindowInnerHeight, 12.8/1234 * studentWindowWidth),
      }
    };

    console.log(responsiveCalcs.sectionTitles.row2Font);

    // Universal Elements
    var valContent = $('div.sd-content-p');
    var pSub = $('p.sd-sub');
    var label = $('label.sd-label');
    var figCaption = $('figcaption.sde-row3-title-caption');

    var setUniversalDimensions = function () {
      valContent.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + "px");
      pSub.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
      pSub.css('line-height', responsiveCalcs.valueSizing.smallFontLh + 'px');
      pSub.css('padding-left', responsiveCalcs.valueSizing.subPaddingLeft + 'px');
      label.css('font-size', responsiveCalcs.labelSizing.font + 'px');
      label.css('line-height', responsiveCalcs.labelSizing.lineHeight + 'px');
      figCaption.css('font-size', responsiveCalcs.sectionFigCaption.fontSize);
      figCaption.css('padding-left', responsiveCalcs.sectionFigCaption.paddingLeft);
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
      row1Dems1.css('padding', '0 ' + responsiveCalcs.sectionPadding.right + 'px 0 ' + responsiveCalcs.sectionPadding.left + 'px');
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

    function setRow2Dimensions() {
      row2.css('padding', responsiveCalcs.rowTopBottomPadding.row2[0] + 'px 0 ' + responsiveCalcs.rowTopBottomPadding.row2[1] + 'px 0');
      sdeDems2.css('padding-right', responsiveCalcs.sectionPadding.right + 'px');
      sdeDems2Content.height(responsiveCalcs.contentHeight.row2Dems2);
      sdeDems2Content.css('padding-left', responsiveCalcs.contentPadding.left + 'px');
      row2Dems2HeaderDiv.css('margin-bottom', responsiveCalcs.sectionTitles.row2Margin + 'px');
      row2Dems2TitleFont.css('font-size', responsiveCalcs.sectionTitles.row2Font + 'px');
      row2Dems2Values.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
      row2Dems2Values.css('line-height', (responsiveCalcs.valueSizing.smallFontLh) + 'px');
      row2Dems2Labels.css('font-size', responsiveCalcs.labelSizing.font + 'px');
    }
    setRow2Dimensions();

    // Row 3 Elements
    var row3 = $('section.sde-row3');

    var row3Disc = $('div.sde-disc');
    var row3DiscContent = $('div.sde-disc-content');
    var discHeader = $('div.sde-disc-header');
    var discVals = $('p.sde-disc');
    var discChart = $('figure.disc-chart');
    var discChartBar = $('div.disc-bar')
    var row3Motivators = $('div.sde-motivators');
    var row3MotivatorsContent = $('div.sde-motivators-content');
    var motivatorsHeader = $('div.sde-motivators-header');
    var motivatorsVals = $('p.sde-motivators');
    var row3Skills = $('div.sde-skills');
    var row3SkillsContent = $('div.sde-skills-content');
    var skillsHeader = $('div.sde-skills-header');
    var skillsSpans = $('span.sde-skills');
    var skillsVals = $('p.sde-skills');

    var row3Title = $('h4.sde-row3-title');
    var row3TitleCaption = $('figcaption.sde-row3-title-caption');

    function setRow3HeightByElements() {

      row3.css('padding', responsiveCalcs.rowTopBottomPadding.row3[0] + 'px 0 ' + responsiveCalcs.rowTopBottomPadding.row3[1] + 'px 0');
      row3Title.css('font-size', responsiveCalcs.sectionTitles.row3Font + 'px');

      // Disc
      row3Disc.css('padding-right', responsiveCalcs.sectionPadding.right + 'px');
      row3DiscContent.height(responsiveCalcs.contentHeight.row3Disc + 'px');
      row3DiscContent.css('padding', responsiveCalcs.contentPadding.left + 'px');
      discHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row3Margin + 'px');
      discVals.css('font-size', responsiveCalcs.valueSizing.largeFont + 'px');
      discVals.css('line-height', responsiveCalcs.valueSizing.largeFontLh + 'px');
      discChart.height(responsiveCalcs.sectionFigures.discChartHeight);
      discChartBar.height(responsiveCalcs.sectionFigures.discChartBarHeight);

      // Motivators
      row3Motivators.css('padding', '0 ' + responsiveCalcs.sectionPadding.right + 'px 0 ' + responsiveCalcs.sectionPadding.left + 'px');
      row3MotivatorsContent.height(responsiveCalcs.contentHeight.row3Motivators + 'px');
      row3MotivatorsContent.css('padding', responsiveCalcs.contentPadding.left + 'px');
      motivatorsHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row3Margin + 'px');
      motivatorsVals.css('font-size', responsiveCalcs.valueSizing.largeFont + 'px');
      motivatorsVals.css('line-height', responsiveCalcs.valueSizing.largeFontLh + 'px');

      // Skills
      row3Skills.css('padding-left', responsiveCalcs.sectionPadding.left + 'px');
      row3SkillsContent.height(responsiveCalcs.contentHeight.row3Skills + 'px');
      row3SkillsContent.css('padding-left', responsiveCalcs.contentPadding.left + 'px');
      skillsHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row3Margin + 'px');
      skillsVals.css('font-size', responsiveCalcs.valueSizing.mediumFont + 'px');
      skillsVals.css('line-height', responsiveCalcs.valueSizing.mediumFontLh + 'px');
      skillsSpans.css('max-width', responsiveCalcs.skillsDimensions.spanWidth + 'px');
      skillsSpans.css('margin-right', responsiveCalcs.skillsDimensions.spanMarginRight + 'px');
      skillsVals.css('line-height', responsiveCalcs.skillsDimensions.valLh + 'px');
    }
    setRow3HeightByElements();


    // Row 4 Elements
    var row4 = $('section.sde-row4');
    var row4Titles = $('h4.sde-row4-title');

    var seSection = $('div.sde-se');
    var seContent = $('div.sde-se-content');
    var seHeader = $('div.sde-se-header');
    var row4se0 = $('div.sde-se-0');
    var row4se1 = $('div.sde-se-1');

    var sedSection = $('div.sde-sed');
    var sedContent = $('div.sde-sed-content');
    var sedHeader = $('div.sde-sed-header');
    var row4sed0 = $('div.sde-sed-0');
    var row4sed1 = $('div.sde-sed-1');
    var row4sed2 = $('div.sde-sed-2');

    var seVals = $('p.sde-se');
    var sedVals = $('p.sde-sed');

    function setRow4HeightByElements() {

      row4.css('padding-top', responsiveCalcs.rowTopBottomPadding.row4[0]);
      row4Titles.css('font-size', responsiveCalcs.sectionTitles.row4Font + 'px');
      // row4Titles.css('margin-bottom', responsiveCalcs.sectionTitles.row4Margin + 'px');

      seSection.css('padding-right', responsiveCalcs.sectionPadding.right + 'px');
      seContent.height(responsiveCalcs.contentHeight.row4Se);
      seContent.css('padding-left', responsiveCalcs.contentPadding.left + 'px');
      seHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row4Margin2 + 'px');
      seVals.css('font-size', responsiveCalcs.sectionTitles.row4Font2 + 'px');
      seVals.css('line-height', responsiveCalcs.sectionTitles.row4Font2 + 'px');

      sedSection.css('padding-left', responsiveCalcs.sectionPadding.left + 'px');
      sedContent.height(responsiveCalcs.contentHeight.row4Sed);
      sedContent.css('padding-left', responsiveCalcs.contentPadding.left + 'px');
      sedHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row4Margin + 'px');
      sedVals.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
      sedVals.css('line-height', responsiveCalcs.valueSizing.smallFontLh + 'px');
      sedVals.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + 'px');
    }
    setRow4HeightByElements();

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
