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
      var dashboardWidth = baseDimensions.viewportWidth; dashboardFrameElement.width(dashboardWidth);
      var dashboardHeight = baseDimensions.viewportHeight; dashboardFrameElement.height(dashboardHeight);

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
      studentFilterInner.height(studentFilterOuter.height() - 20);
      studentFilter.height(studentFilterInner.height() * .65736004);
      studentSearchBar.height(Math.min(20/683 * dashboardInnerHeight, 20/1380 * dashboardInnerWidth));

      filterCheckbox.css('transform', "scale(" + Math.min(1/683 * dashboardInnerHeight, 1/1380 * dashboardInnerWidth) + ")");

      genderFilterFrame.height(studentData_Row2_Column1.height() * .15058088);
      genderFilterFrame.css("margin-bottom", (studentData_Row2_Column1.height() * .05) + "px");
      genderFilterOuter.outerHeight(genderFilterFrame.height());
      genderFilterInner.height(genderFilterOuter.height() - 20);
      classFilterFrame.height(studentData_Row2_Column1.height() * .4328851);

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
      filterHeaders.css('font-size', Math.min(16/683 * dashboardInnerHeight, 16/1380 * dashboardInnerWidth))
      filterHeaders.css('margin-bottom', Math.min(5/683 * dashboardInnerHeight, 5/1380 * dashboardInnerWidth))
      // filter options,14/20
      var filterLabels = $('label.filter-label');
      filterLabels.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth))
      // th column headers, 9/13
      // row td fonts, 9/13
      var tableColumnHeaders = $('th.student-data');
      var tableCellValues = $('td.student-data');
      tableColumnHeaders.css('font-size', Math.min(10.5/683 * dashboardInnerHeight, 10.5/1380 * dashboardInnerWidth))
      tableCellValues.css('font-size', Math.min(10.5/683 * dashboardInnerHeight, 10.5/1380 * dashboardInnerWidth))
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
      caaTitle.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth))
      caaTh.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth))
      caaValues.css('font-size', Math.min(14/683 * dashboardInnerHeight, 14/1380 * dashboardInnerWidth))

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

    }
  }

  return RWD;

}])
