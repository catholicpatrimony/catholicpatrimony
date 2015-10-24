cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log) {
  //TODO - 
  //  BUGS:
  //    your date math doesn't work.
  //
  //  FEATURES:
  //    1) allow for paging through weeks
  //    2) have a date picker?
  //   
  //    in both cases, pick the date off the url

  $log.debug('Dailies');
  var sd = $scope.sd;
  var homiliesByName = {};
  var homiliesByStringifiedDate = {};
  $log.debug('$scope.classes: ');
  $log.debug($scope.classes);
  for (var i=0; i < $scope.classes.length; i++) {
    $log.debug('i: '+i);
    var c = $scope.classes[i];
    if ('date' in c) {
      homiliesByStringifiedDate[c.date] = c;
    }
    if ('liturgical_day' in c) {
      if (c.liturgical_day instanceof Array) {
        for (var j=0; j < c.liturgical_day.length; j++) {
          homiliesByName[c.liturgical_day[j]] = c;
        }
      } else {
        homiliesByName[c.liturgical_day] = c;
      }
    }
  }
  $log.debug('homiliesByName: ');
  $log.debug(homiliesByName);
  $log.debug('homiliesByStringifiedDate: ');
  $log.debug(homiliesByStringifiedDate);

  $scope.set2weeks = function(day) {
    var twoSundaysAgo = null;
    var sundaysCounted = 0;
    while (true) {
      $log.debug('day.getDay(): ' + day.getDay());
      if (day.getDay() == 0) {
        $log.debug('sundaysCounted: ' + sundaysCounted);
        if (sundaysCounted == 1) {
          twoSundaysAgo = day;
          break;
        } else {
          sundaysCounted++;
        }
      }
      //day = new Date(day.UTC() - (24 * 60 * 60 * 1000));
      var previousDay = new Date();
      previousDay.setDate(day.getDate() - 1);
      day = previousDay;
    }

    $log.debug('twoSundaysAgo: ' + twoSundaysAgo.toLocaleString());

    var last2weekDates = [];
    var firstWeek = [];
    var secondWeek = [];
    var last2weekAudios = [];
    var day = twoSundaysAgo;
    for (var i=0; i < 14; i++) {
      last2weekDates[i] = day;
      var dayStr = (day.getMonth() + 1) + '/' + day.getDate() + '/' + day.getFullYear();
      $log.debug('dayStr: ' + dayStr);
      last2weekAudios[i] = {
        'cpObj': homiliesByStringifiedDate[dayStr],
        'dayStr' : dayStr,
        'dateObj' : day
      };
      if (i < 7) {
        firstWeek[i] = last2weekAudios[i];
      } else {
        secondWeek[i - 7] = last2weekAudios[i];
      }
      var nextDay = new Date();
      nextDay.setDate(day.getDate() + 1);
      day = nextDay;
    }
    $scope.firstWeek = firstWeek;
    $scope.secondWeek = secondWeek;

    $log.debug('last2weekDates: ');
    $log.debug(last2weekDates);
  }

  $scope.set2weeks(new Date());

  $scope.back = function() {
    var another2sundaysBack = new Date();
    another2sundaysBack.setDate($scope.firstWeek[0].dateObj.getDate() - 14);
    $scope.set2weeks(another2sundaysBack);
    $log.debug('back()');
  }

  $scope.forward = function() {
    $log.debug('forward()');
  }

});
