cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log, $filter, $uibModal) {
  //TODO - 
  //
  //  FEATURES:
  //    2 -have a date picker?
  //    3 - pick the date off the url
  $scope.parseLiturgicalDay = function(homiliesByName, c, j) {
    //$log.debug(c);
    if (c['liturgical_year'] && j == 0) {
      homiliesByName[c.liturgical_day[j] + '-' + c.liturgical_year] = c;
    } else {
      homiliesByName[c.liturgical_day[j]] = c;
    }
    /*
    //DH2015Y13WeekOrdTFri(FeastofThomasApostle).wav
    if (//DH20[0-9]{2}Y([0-9]{1-2}) ) {
      if (OrdT) {
      }
      if (Tues) {
      }
    }
    */
  };

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
      if (!(c.liturgical_day instanceof Array)) {
        c.liturgical_day = [c.liturgical_day];
      }
      for (var j=0; j < c.liturgical_day.length; j++) {
        $scope.parseLiturgicalDay(homiliesByName, c, j);
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

  $scope.showDay = function(d, ld) {
    $log.debug('showDay(d): ');
    $log.debug(d);

    d.litdaySelected = ld;
    $scope.showingDay = true;
    $scope.day2show = d;
    $scope.c = d.cpObj;

    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'partials/course_specific/daily_modal.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      //bindToController: true
      resolve: {
        parentScope: function() {
          return $scope;
        }
      }
    });
  }

});

cpApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, parentScope) {
//cpApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

  $scope.c = parentScope.c;
  $scope.day2show = parentScope.day2show;
  $scope.sd = parentScope.sd;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
