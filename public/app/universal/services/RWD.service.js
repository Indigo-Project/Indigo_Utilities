app.factory('RWD', ['$compile', '$state', function($state) {

  var RWD = {

    calculateBaseDimensions: function(doc) {
      var baseDimensions = {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        screenAvailWidth: window.screen.availWidth,
        screenAvailHeight: window.screen.availHeight,
        browserWidth: window.outerWidth,
        browserHeight: window.outerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight,
        documentWidth: doc.width(),
        documentHeight: doc.height()
      }
      return baseDimensions;
    },

    responsiveAdaptationDashboard: function() {
      // console.log('responsive calc..');
      // Responsive initialization of dimensions
      var dashboardFrameElement = $('section.dashboard-frame');
      var baseDimensions = RWD.calculateBaseDimensions(dashboardFrameElement);

      // viewport width: 1440
      // viewport height: 723

      // Dashboard frame width and height changed to viewport width and height
      var dashboardWidth = baseDimensions.viewportWidth;
      // dashboardFrameElement.width(dashboardWidth);
      var dashboardHeight = baseDimensions.viewportHeight;
      // dashboardFrameElement.height(dashboardHeight);

      var horizontalPaddingRatio = 30/1440;
      var verticalPaddingRatio = 20/723;

      // Set Padding and Dimensions of studentData Dashboard Section (inner-frame)
      var dashboardFramePadding = { top: verticalPaddingRatio * dashboardHeight, right: horizontalPaddingRatio * dashboardWidth, bottom: verticalPaddingRatio * dashboardHeight, left: horizontalPaddingRatio * dashboardWidth }
      dashboardFrameElement.css("padding", dashboardFramePadding.top + "px " + dashboardFramePadding.right + "px " + dashboardFramePadding.bottom + "px  " + dashboardFramePadding.left + "px");
      var dashboardInnerWidth = dashboardWidth - (dashboardFramePadding.left + dashboardFramePadding.right);
      var dashboardInnerHeight = dashboardHeight - (dashboardFramePadding.top + dashboardFramePadding.bottom);

      console.log(dashboardInnerWidth, dashboardInnerHeight);

      var dashboardElement = $('section.dashboard-studentData');
      dashboardElement.width(dashboardInnerWidth);
      dashboardElement.height(dashboardInnerHeight);

      console.log(dashboardFrameElement.width(), dashboardFrameElement.height());
      console.log(dashboardElement.width(), dashboardElement.height());


      var responsiveCalcs = {

      }

      // Grid structure
      var studentData_Row1 = $('section.sd-row1');
      var studentData_Row2 = $('section.sd-row2');
      var studentData_Row2_Column1 = $('section.sd-column1');
      var studentData_Row2_Column2 = $('section.sd-column2');
      var studentData_Row2_Column2_Row1 = $('section.sd-column2-row1');
      var studentData_Row2_Column2_Row2 = $('section.sd-column2-row2');

      studentData_Row1.height(dashboardInnerHeight * .102733);
      // console.log("Row 1", dashboardInnerHeight * .102733, studentData_Row1.height());
      studentData_Row2.height(dashboardInnerHeight * .897267);
      // console.log("Row 2", dashboardInnerHeight * .897267, studentData_Row2.height());
      studentData_Row2_Column1.height(dashboardInnerHeight * .897267)
      // console.log("Row 2 C1", dashboardInnerHeight * .897267, studentData_Row2_Column1.height());
      studentData_Row2_Column2.height(dashboardInnerHeight * .897267)
      // console.log("Row 2 C2", dashboardInnerHeight * .897267, studentData_Row2_Column2.height());
      studentData_Row2_Column2_Row1.height((dashboardInnerHeight * .897267) * .79695)
      // console.log("Row 2 C2 R1", (dashboardInnerHeight * .897267) * .79695, studentData_Row2_Column2_Row1.height());
      studentData_Row2_Column2_Row2.height((dashboardInnerHeight * .897267) * .20305)
      // console.log("Row 2 C2 R2", (dashboardInnerHeight * .897267) * .20305, studentData_Row2_Column2_Row2.height());

      // Grid Components Variable Definition
      var filterCheckbox = $('input[type=checkbox]');
      var studentFilterFrame = $('section.student-filter-frame');
      var studentFilterOuter = $('section.student-filter-outer');
      var studentFilterInner = $('section.student-filter-inner');
      var studentFilter = $('div.student-filter');
      var studentSearchBar = $('input.search-bar');
      var classFilterFrame = $('section.class-filter-frame');
      var classFilterOuter = $('section.class-filter-outer');
      var classFilterInner = $('section.class-filter-inner');
      var classFilter = $('div.class-filter');
      var genderFilterFrame = $('section.gender-filter-frame');
      var genderFilterOuter = $('section.gender-filter-outer');
      var genderFilterInner = $('section.gender-filter-inner');
      var genderFilter = $('div.gender-filter');

      studentFilterFrame.height(studentData_Row2_Column1.height() * .35);
      studentFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
      studentFilterOuter.outerHeight(studentFilterFrame.height());
      studentFilterInner.height(studentFilterOuter.height() - (Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth) * 2));
      studentFilter.height(studentFilterInner.innerHeight() * 142.484/212.484);
      studentSearchBar.height(Math.min(20/683 * dashboardInnerHeight, 20/1380 * dashboardInnerWidth));

      console.log(classFilterInner.innerHeight());

      filterCheckbox.css('transform', "scale(" + Math.min(1/683 * dashboardInnerHeight, 1/1380 * dashboardInnerWidth) + ")");

      studentFilterInner.css('padding', Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth));
      genderFilterInner.css('padding', Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth));
      classFilterInner.css('padding', Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth));

      studentFilter.css('padding-left', Math.min(5/683 * dashboardInnerHeight, 5/1380 * dashboardInnerWidth));
      genderFilter.css('padding-left', Math.min(5/683 * dashboardInnerHeight, 5/1380 * dashboardInnerWidth));
      classFilter.css('padding-left', Math.min(5/683 * dashboardInnerHeight, 5/1380 * dashboardInnerWidth));

      var filterDivMargins = {
        student: {
          top: Math.min(4/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth),
          right: 0,
          bottom: 0,
          left: 0
        },
        gender: {
          top: Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth),
          right: 0,
          bottom: 0,
          left: 0
        },
        class: {
          top: Math.min(10/683 * dashboardInnerHeight, 10/1380 * dashboardInnerWidth),
          right: 0,
          bottom: 0,
          left: 0
        }
      }
      studentFilter.css('margin', filterDivMargins.student.top + "px " + filterDivMargins.student.right + "px " + filterDivMargins.student.bottom + "px " + filterDivMargins.student.left + "px");
      genderFilter.css('margin', filterDivMargins.gender.top + "px " + filterDivMargins.gender.right + "px " + filterDivMargins.gender.bottom + "px " + filterDivMargins.gender.left + "px");
      classFilter.css('margin', filterDivMargins.class.top + "px " + filterDivMargins.class.right + "px " + filterDivMargins.class.bottom + "px " + filterDivMargins.class.left + "px");

      genderFilterFrame.height(studentData_Row2_Column1.height() * .15058088);
      genderFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
      genderFilterOuter.outerHeight(genderFilterFrame.height());
      genderFilterInner.height(genderFilterOuter.height() -  Math.min(20/683 * dashboardInnerHeight, 20/1380 * dashboardInnerWidth));
      genderFilter.height(genderFilterInner.innerHeight() * 45.27/90.27);

      classFilterFrame.height(studentData_Row2_Column1.height() * .4328851);
      // classFilterOuter.outerHeight(classFilterFrame.height());
      // classFilterInner.height(classFilterOuter.height() - 20);
      // classFilter.height(classFilterInner.innerHeight() * 80/125);

      // Row 2 - Column 2 - Row 2 Variable Definition
      var studentData_studentCount_Container = $('section.student-count');
      var studentData_studentCount = $('div.student-count');
      var studentData_adultAvgs = $('section.adult-avgs');

      studentData_studentCount_Container.height(studentData_Row2_Column2_Row2.height());
      studentData_adultAvgs.height(studentData_Row2_Column2_Row2.height());

      // Dashboard Table Components Variable Definition
      var studentData_Table_Container = $('div.student-data-table');
      var studentData_Table = $('table.student-data');
      var studentData_tHead = $('table.student-data > thead');
      var studentData_tBody = $('table.student-data > tbody');

      studentData_Table_Container.width(studentData_Row2_Column2.width());
      studentData_Table.width(studentData_Table_Container.width());
      studentData_tHead.width(studentData_Table.width())
      var sD_tHead_minusBorders = studentData_tHead.width() - 26;
      studentData_tBody.width(studentData_Table.width());
      studentData_tBody.height((studentData_Row2_Column2_Row1.height() - studentData_tHead.height()) * .9);
      // console.log('table width', studentData_Table.width());
      // console.log('thead width', studentData_tHead.width());
      // console.log('tbody width', studentData_tBody.width());

      // tHead Column Headers Variable Definition
      var tHead = {
        students: $('thead.student-data th:nth-of-type(1)'),
        // students2: $('thead.student-data th:nth-child(1)'),
        gender: $('thead.student-data th:nth-of-type(2)'),
        class: $('thead.student-data th:nth-of-type(3)'),
        dominance: $('thead.student-data th:nth-of-type(4)'),
        influencing: $('thead.student-data th:nth-of-type(5)'),
        steadiness: $('thead.student-data th:nth-of-type(6)'),
        compliance: $('thead.student-data th:nth-of-type(7)'),
        theoretical: $('thead.student-data th:nth-of-type(8)'),
        utilitarian: $('thead.student-data th:nth-of-type(9)'),
        aesthetic: $('thead.student-data th:nth-of-type(10)'),
        social: $('thead.student-data th:nth-of-type(11)'),
        individualistic: $('thead.student-data th:nth-of-type(12)'),
        traditional: $('thead.student-data th:nth-of-type(13)')
      }

      tHead.students.innerWidth(sD_tHead_minusBorders * 0.14059753954306);
      tHead.gender.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
      tHead.class.innerWidth(sD_tHead_minusBorders * 0.03866432337434);
      tHead.dominance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.influencing.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.steadiness.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.compliance.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.theoretical.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.utilitarian.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.aesthetic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.social.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.individualistic.innerWidth(sD_tHead_minusBorders * 0.07820738137083);
      tHead.traditional.innerWidth(sD_tHead_minusBorders * 0.07820738137083);

      // tBody Columns Variable Definition
      var tBodyColumns = {
        students: $('tbody.student-data td:nth-child(1)'),
        gender: $('tbody.student-data td:nth-child(2)'),
        class: $('tbody.student-data td:nth-child(3)'),
        dominance: $('tbody.student-data td:nth-child(4)'),
        influencing: $('tbody.student-data td:nth-child(5)'),
        steadiness: $('tbody.student-data td:nth-child(6)'),
        compliance: $('tbody.student-data td:nth-child(7)'),
        theoretical: $('tbody.student-data td:nth-child(8)'),
        utilitarian: $('tbody.student-data td:nth-child(9)'),
        aesthetic: $('tbody.student-data td:nth-child(10)'),
        social: $('tbody.student-data td:nth-child(11)'),
        individualistic: $('tbody.student-data td:nth-child(12)'),
        traditional: $('tbody.student-data td:nth-child(13)')
      }

      // tHead and tBody column width alignment
      tBodyColumns.students.innerWidth(tHead.students.innerWidth());
      tBodyColumns.gender.innerWidth(tHead.gender.innerWidth());
      tBodyColumns.class.innerWidth(tHead.class.innerWidth());
      tBodyColumns.dominance.innerWidth(tHead.dominance.innerWidth());
      tBodyColumns.influencing.innerWidth(tHead.influencing.innerWidth());
      tBodyColumns.steadiness.innerWidth(tHead.steadiness.innerWidth());
      tBodyColumns.compliance.innerWidth(tHead.compliance.innerWidth());
      tBodyColumns.theoretical.innerWidth(tHead.theoretical.innerWidth());
      tBodyColumns.utilitarian.innerWidth(tHead.utilitarian.innerWidth());
      tBodyColumns.aesthetic.innerWidth(tHead.aesthetic.innerWidth());
      tBodyColumns.social.innerWidth(tHead.social.innerWidth());
      tBodyColumns.individualistic.innerWidth(tHead.individualistic.innerWidth());
      tBodyColumns.traditional.innerWidth(tHead.traditional.innerWidth());

      console.log(tBodyColumns.students.outerWidth() + tBodyColumns.gender.outerWidth() + tBodyColumns.class.outerWidth(), studentData_studentCount_Container.width(), studentData_Row2_Column2_Row2.width());

      studentData_studentCount_Container.width(tBodyColumns.students.outerWidth() + tBodyColumns.gender.outerWidth() + tBodyColumns.class.outerWidth());
      // studentData_studentCount_Container.css('padding-left', studentData_studentCount_Container.width() * 0.1 + "px");
      studentData_studentCount.css('margin-left', "20px");
      studentData_adultAvgs.width(studentData_Row2_Column2_Row2.outerWidth() - studentData_studentCount_Container.outerWidth());

      var adultAvgs_Table = $('table.adult-avgs');
      var adultAvgs_ColumnHeaders = {
        dom: $('thead.adult-avgs th:nth-of-type(1)'),
        inf: $('thead.adult-avgs th:nth-of-type(2)'),
        ste: $('thead.adult-avgs th:nth-of-type(3)'),
        com: $('thead.adult-avgs th:nth-of-type(4)'),
        the: $('thead.adult-avgs th:nth-of-type(5)'),
        uti: $('thead.adult-avgs th:nth-of-type(6)'),
        aes: $('thead.adult-avgs th:nth-of-type(7)'),
        soc: $('thead.adult-avgs th:nth-of-type(8)'),
        ind: $('thead.adult-avgs th:nth-of-type(9)'),
        tra: $('thead.adult-avgs th:nth-of-type(10)'),
      }
      var adultAvgs_Columns = {
        dom: $('tbody.adult-avgs td:nth-of-type(1)'),
        inf: $('tbody.adult-avgs td:nth-of-type(2)'),
        ste: $('tbody.adult-avgs td:nth-of-type(3)'),
        com: $('tbody.adult-avgs td:nth-of-type(4)'),
        the: $('tbody.adult-avgs td:nth-of-type(5)'),
        uti: $('tbody.adult-avgs td:nth-of-type(6)'),
        aes: $('tbody.adult-avgs td:nth-of-type(7)'),
        soc: $('tbody.adult-avgs td:nth-of-type(8)'),
        ind: $('tbody.adult-avgs td:nth-of-type(9)'),
        tra: $('tbody.adult-avgs td:nth-of-type(10)'),
      }

      adultAvgs_ColumnHeaders.dom.innerWidth(tBodyColumns.dominance.innerWidth())
      adultAvgs_Columns.dom.innerWidth(tBodyColumns.dominance.innerWidth())
      adultAvgs_ColumnHeaders.inf.innerWidth(tBodyColumns.influencing.innerWidth())
      adultAvgs_Columns.inf.innerWidth(tBodyColumns.influencing.innerWidth())
      adultAvgs_ColumnHeaders.ste.innerWidth(tBodyColumns.steadiness.innerWidth())
      adultAvgs_Columns.ste.innerWidth(tBodyColumns.steadiness.innerWidth())
      adultAvgs_ColumnHeaders.com.innerWidth(tBodyColumns.compliance.innerWidth())
      adultAvgs_Columns.com.innerWidth(tBodyColumns.compliance.innerWidth())
      adultAvgs_ColumnHeaders.the.innerWidth(tBodyColumns.theoretical.innerWidth())
      adultAvgs_Columns.the.innerWidth(tBodyColumns.theoretical.innerWidth())
      adultAvgs_ColumnHeaders.uti.innerWidth(tBodyColumns.utilitarian.innerWidth())
      adultAvgs_Columns.uti.innerWidth(tBodyColumns.utilitarian.innerWidth())
      adultAvgs_ColumnHeaders.aes.innerWidth(tBodyColumns.aesthetic.innerWidth())
      adultAvgs_Columns.aes.innerWidth(tBodyColumns.aesthetic.innerWidth())
      adultAvgs_ColumnHeaders.soc.innerWidth(tBodyColumns.social.innerWidth())
      adultAvgs_Columns.soc.innerWidth(tBodyColumns.social.innerWidth())
      adultAvgs_ColumnHeaders.ind.innerWidth(tBodyColumns.individualistic.innerWidth())
      adultAvgs_Columns.ind.innerWidth(tBodyColumns.individualistic.innerWidth())
      adultAvgs_ColumnHeaders.tra.innerWidth(tBodyColumns.traditional.innerWidth())
      adultAvgs_Columns.tra.innerWidth(tBodyColumns.traditional.innerWidth())

      // nameFont: Math.min(32/683 * dashboardInnerHeight, 32/1380 * dashboardInnerWidth),

      // Font Sizes
      var title1 = $('span.sd-title-name');
      var title2 = $('span.sd-title-static');
      title1.css('font-size', Math.min(36/683 * dashboardInnerHeight, 36/1380 * dashboardInnerWidth));
      title1.css('margin-right', Math.min(15/683 * dashboardInnerHeight, 15/1380 * dashboardInnerWidth));
      title2.css('font-size', Math.min(36/683 * dashboardInnerHeight, 36/1380 * dashboardInnerWidth));
      // filter heading,16/18
      var filterHeaders = $('h4.filter-header');
      filterHeaders.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth))
      filterHeaders.css('margin-bottom', Math.min(5/683 * dashboardInnerHeight, 5/1380 * dashboardInnerWidth) + "px");
      // filter options,14/20
      var filterLabels = $('label.filter-label');
      filterLabels.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth) + "px")
      filterLabels.css('min-height', Math.min(20/683 * dashboardInnerHeight, 20/1380 * dashboardInnerWidth) + "px")
      // th column headers, 9/13
      // row td fonts, 9/13
      var tableColumnHeaders = $('th.student-data');
      var tableCellValues = $('td.student-data');
      tableColumnHeaders.css('font-size', Math.min(10.5/683 * dashboardInnerHeight, 10.5/1380 * dashboardInnerWidth))
      tableColumnHeaders.css('padding', Math.min(4/683 * dashboardInnerHeight, 4/1380 * dashboardInnerWidth))
      tableCellValues.css('font-size', Math.min(10.5/683 * dashboardInnerHeight, 10.5/1380 * dashboardInnerWidth))
      tableCellValues.css('padding', Math.min(4/683 * dashboardInnerHeight, 4/1380 * dashboardInnerWidth))
      // student count, 36/40
      var studentCountNum = $('div.student-count h1');
      var studentCountTitle = $('div.student-count h3');
      studentCountNum.css('font-size', Math.min(36/683 * dashboardInnerHeight, 36/1380 * dashboardInnerWidth))
      studentCountTitle.css('font-size', Math.min(24/683 * dashboardInnerHeight, 24/1380 * dashboardInnerWidth))
      // caa title, 14/15
      // caa type, 14/20
      var caaTitle = $('div.adult-avgs');
      var caaTh = $('thead.adult-avgs th');
      var caaValues = $('tbody.adult-avgs td');
      var caaCellPadding = {
        top: Math.min(3/683 * dashboardInnerHeight, 3/1380 * dashboardInnerWidth),
        right: Math.min(6/683 * dashboardInnerHeight, 6/1380 * dashboardInnerWidth),
        bottom: Math.min(3/683 * dashboardInnerHeight, 3/1380 * dashboardInnerWidth),
        left: Math.min(7/683 * dashboardInnerHeight, 7/1380 * dashboardInnerWidth)
      }
      caaTitle.css('font-size', Math.min(13/683 * dashboardInnerHeight, 13/1380 * dashboardInnerWidth))
      caaTh.css('font-size', Math.min(12/683 * dashboardInnerHeight, 12/1380 * dashboardInnerWidth))
      caaTh.css('padding', caaCellPadding.top + "px " + caaCellPadding.right + "px " + caaCellPadding.bottom + "px "+ caaCellPadding.left + "px");
      caaValues.css('font-size', Math.min(12/683 * dashboardInnerHeight, 12/1380 * dashboardInnerWidth))
      caaTh.css('padding', caaCellPadding.top + "px " + caaCellPadding.right + "px " + caaCellPadding.bottom + "px "+ caaCellPadding.left + "px");
      // no Data Message/CTA
      var noDataMessage = $('h3.no-data-message');
      var noDataButton = $('button.no-data-cta');
      noDataMessage.css('font-size', Math.min(24/683 * dashboardInnerHeight, 24/1380 * dashboardInnerWidth))
      noDataButton.css('font-size', Math.min(16/683 * dashboardInnerHeight, 16/1380 * dashboardInnerWidth))
      noDataButton.css('margin-top', Math.min(30/683 * dashboardInnerHeight, 30/1380 * dashboardInnerWidth))

      var noDataMessage = $('div.dashboard-no-data-display');
      if (noDataMessage) {
        noDataMessage.height(studentData_tBody.outerHeight());
      }
    },

    responsiveAdaptationStudentDetails: function() {
      var studentDetailsPopup = $('section.student-window');
      baseDimensions = RWD.calculateBaseDimensions(studentDetailsPopup);

      // console.log(baseDimensions.documentHeight, studentDetailsPopup.height());
      // console.log(baseDimensions.documentWidth, studentDetailsPopup.width());

      // Set padding on student window
      var studentWindowWidth = baseDimensions.documentWidth;
      var studentWindowHeight = baseDimensions.documentHeight;
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
          sedSSPaddingRight: Math.min((20/608.6875  * 4/5) * studentWindowInnerHeight, (20/1234 * 4/5) * studentWindowInnerWidth)
        },
        labelSizing: {
          font: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
          lineHeight: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
        },
        skillsDimensions: {
          spanMarginRight: 16.5/1234 * studentWindowWidth,
          spanWidth: 110/1234 * studentWindowWidth,
          valLh: Math.min(12.8/608.6875 * studentWindowInnerHeight, 12.8/1234 * studentWindowWidth),
        },
        miscDimensions: {
          exitButton: {
            fontSize: Math.min(20/608.6875 * studentWindowInnerHeight, 20/1234 * studentWindowWidth),
            lineHeight: Math.min(10/608.6875 * studentWindowInnerHeight, 10/1234 * studentWindowWidth),
            padding: Math.min(3/608.6875 * studentWindowInnerHeight, 3/1234 * studentWindowWidth)
          }
        }
      };

      // console.log(responsiveCalcs.sectionTitles.row2Font);

      // Universal Elements
      var valContent = $('div.sd-content-p');
      var pSub = $('p.sd-sub');
      var label = $('label.sd-label');
      var figCaption = $('figcaption.sde-row3-title-caption');
      var exitButton = $('div.exit-button')

      var setUniversalDimensions = function () {
        valContent.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + "px");
        pSub.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
        pSub.css('line-height', responsiveCalcs.valueSizing.smallFontLh + 'px');
        pSub.css('padding-left', responsiveCalcs.valueSizing.subPaddingLeft + 'px');
        label.css('font-size', responsiveCalcs.labelSizing.font + 'px');
        label.css('line-height', responsiveCalcs.labelSizing.lineHeight + 'px');
        figCaption.css('font-size', responsiveCalcs.sectionFigCaption.fontSize + 'px');
        figCaption.css('padding-left', responsiveCalcs.sectionFigCaption.paddingLeft + 'px');
        exitButton.css('font-size', responsiveCalcs.miscDimensions.exitButton.fontSize + 'px');
        exitButton.css('line-height', responsiveCalcs.miscDimensions.exitButton.lineHeight + 'px');
        exitButton.css('padding', responsiveCalcs.miscDimensions.exitButton.padding + 'px');
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

      function setRow3Dimensions() {

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
      setRow3Dimensions();


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

      function setRow4Dimensions() {

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
        sedHeader.css('margin-bottom', responsiveCalcs.sectionTitles.row4Margin2 + 'px');
        sedVals.css('font-size', responsiveCalcs.valueSizing.smallFont + 'px');
        sedVals.css('line-height', responsiveCalcs.valueSizing.smallFontLh + 'px');
        sedVals.css('margin-bottom', responsiveCalcs.valueSizing.marginBottom + 'px');
        sedVals.css('margin-right', responsiveCalcs.valueSizing.sedSSPaddingRight + 'px');
      }
      setRow4Dimensions();

    }

  }

  return RWD;

}])
