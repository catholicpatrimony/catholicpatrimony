cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log, $filter) {
  //TODO - 
  //  BUGS:
  //    your date math doesn't work.
  //
  //  FEATURES:
  //    1) allow for paging through weeks
  //    2) have a date picker?
  //   
  //    in both cases, pick the date off the url

  //$log.debug('Dailies');
  var sd = $scope.sd;
  var homiliesByName = {};
  var homiliesByStringifiedDate = {};
  //$log.debug('$scope.classes: ');
  //$log.debug($scope.classes);
  for (var i=0; i < $scope.classes.length; i++) {
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
  //$log.debug('homiliesByName: ');
  //$log.debug(homiliesByName);
  //$log.debug('homiliesByStringifiedDate: ');
  //$log.debug(homiliesByStringifiedDate);

  $scope.set2weeks = function(day) {
    var twoSundaysAgo = null;
    var sundaysCounted = 0;
    while (true) {
      //$log.debug('day.getDay(): ' + day.getDay());
      if (day.getDay() == 0) {
        //$log.debug('sundaysCounted: ' + sundaysCounted);
        if (sundaysCounted == 1) {
          twoSundaysAgo = day;
          break;
        } else {
          sundaysCounted++;
        }
      }
      //day = new Date(day.UTC() - (24 * 60 * 60 * 1000));
      var previousDay = new Date(day.getTime());
      previousDay.setDate(day.getDate() - 1);
      day = previousDay;
    }

    //$log.debug('twoSundaysAgo: ' + twoSundaysAgo.toLocaleString());

    var last2weekDates = [];
    var firstWeek = [];
    var secondWeek = [];
    var last2weekAudios = [];
    var day = twoSundaysAgo;
    var years = [];
    var months = [];
    var monthDates = [];
    for (var i=0; i < 14; i++) {
      if (years.indexOf(day.getFullYear()) == -1) {
        $log.debug("adding year: " + day.getFullYear());
        years.push(day.getFullYear());
      }
      if (months.indexOf(day.getMonth()) == -1) {
        months.push(day.getMonth());
        monthDates.push(day);
      }
      last2weekDates[i] = day;
      var dayStr = $scope.getDayStr(day);
      last2weekAudios[i] = {
        'cpObj': homiliesByStringifiedDate[dayStr],
        'dateStr' : dayStr,
        'dayStr' : day.getDate(),
        'dateObj' : day
      };
      if (i < 7) {
        firstWeek[i] = last2weekAudios[i];
      } else {
        secondWeek[i - 7] = last2weekAudios[i];
      }
      var nextDay = new Date(day.getTime());
      nextDay.setDate(day.getDate() + 1);
      day = nextDay;
    }
    $scope.firstWeek = firstWeek;
    $scope.secondWeek = secondWeek;

    //$log.debug('last2weekDates: ');
    //$log.debug(last2weekDates);

    if (years.length > 1) {
      $scope.yearStr = years[0] + ' / ' + years[1];
    } else {
      $scope.yearStr = years[0] + '';
    }
    //$log.debug('monthDates: ');
    //$log.debug(monthDates);
    if (monthDates.length > 1) {
      $scope.monthStr = $filter('date')(monthDates[0], 'MMMM') + 
        ' / ' + $filter('date')(monthDates[1], 'MMMM');
    } else {
      $scope.monthStr = $filter('date')(monthDates[0], 'MMMM');
    }
  }

  $scope.getDayStr = function(day) {
    var dayStr = (day.getMonth() + 1) + '/' + day.getDate() + '/' + day.getFullYear();
    //$log.debug('dayStr: ' + dayStr);
    return dayStr;
  }

  $scope.set2weeks(new Date());

  $scope.back = function() {
    var anotherTwoWeeksBack = new Date($scope.secondWeek[1].dateObj.getTime());
    //$log.debug('$scope.secondWeek[1].dateObj: ' + $scope.getDayStr($scope.secondWeek[1].dateObj));
    //$log.debug('anotherTwoWeeksBack 1: ' + $scope.getDayStr(anotherTwoWeeksBack));
    anotherTwoWeeksBack.setDate(anotherTwoWeeksBack.getDate() - 14);
    //$log.debug('anotherTwoWeeksBack 2: ' + $scope.getDayStr(anotherTwoWeeksBack));
    $scope.set2weeks(anotherTwoWeeksBack);
    //$log.debug('back()');
  }

  $scope.forward = function() {
    var twoweeksforward = new Date($scope.secondWeek[1].dateObj.getTime());
    twoweeksforward.setDate(twoweeksforward.getDate() + 14);
    $scope.set2weeks(twoweeksforward);
    //$log.debug('forward()');
  }

});
