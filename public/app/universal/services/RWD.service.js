app.factory('RWD', ['$state', function($state) {
  return {
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
    }
  }
}])
