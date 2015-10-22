cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log) {
  $log.debug('Dailies');
  var sd = $scope.sd;
  for (var i=0; i < $scope.classes; i++) {
    var c = $scope.classes=[i];
    //$log.debug(
    Date.parse();
  }
  // make sure cp.json has the raw data and is loaded first
  // then create these data structures right here
  // start: vars that will come from elsewhere
  // This will be all classes ever
  var homiliesByName = {
    "Monday in the Second Week of Ordinary Time": { /* classData */}
  }
  var homiliesByStringifiedDate = {
    "20150703": { /* classData */}
  }
  // end: vars that will come from elsewhere

  // To be filled with the 14 days starting with 2 Sundays ago 
  // and going to the following Saturday
  var days = [];
  var day = new Date();
  var twoSundaysAgo = null;
  var sundaysCounted = 0;
  /*
  while (true) {
    if (true) {
    //if (// sunday) {
      if (sundaysCounted == 1) {
        // twoSundaysAgo = 
        break;
      } else {
        sundaysCounted++;
      }
    }
    //day.subtract a day
  }
  */


  /* 
   * day.date = // the date object
   * day.stringifiedDate = '20150703'
   * day.classRef = {
      day.displayDays = ['Friday in the 13th week of Ordinary Time', 'St. Thomas the Apostle']
   * }
   */

  // to determine
  // prevsunday

});
