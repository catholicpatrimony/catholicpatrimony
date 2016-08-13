//cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log, $filter, $uibModal) {
cpApp.controller('DailyHomiliesController', function($scope, $location, $routeParams, $log, $filter, $uibModal) {

  if ($location.search().dt) {
    $scope.dt = new Date($location.search().dt);
  } else {
    $scope.dt = new Date();
  }

  //TODO - 
  //
  //  FEATURES:
  //    2 -have a date picker?
  //    3 - pick the date off the url
  $scope.parseLiturgicalDay = function(homiliesByName, homiliesArr, c, j) {
    //$log.debug(c);
    /*
    if (c['liturgical_year'] && j == 0) {
      homiliesArr.push(c.liturgical_day[j]);
      homiliesByName[c.liturgical_day[j]] = c;
      //homiliesByName[c.liturgical_day[j] + '-' + c.liturgical_year] = c;
    } else {
      homiliesArr.push(c.liturgical_day[j]);
      homiliesByName[c.liturgical_day[j]] = c;
    }
    */
    if (!c.hasOwnProperty('searchText')) {
      c['searchText'] = c.liturgical_day[j] + ' ' + c.tags;
      homiliesArr.push(c);
    } else {
      c['searchText'] = c['searchText'] + ' ' + c.liturgical_day[j];
      //c['searchText'] = c.liturgical_day[j];
    }
    //$log.debug(c.searchText);
    homiliesByName[c.liturgical_day[j]] = c;
    //$log.debug(c.liturgical_day[j]);
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

  var sd = $scope.sd;
  var homiliesByName = {};
  var homiliesArr = [];
  var homiliesByStringifiedDate = {};
  //$log.debug('$scope.classes: ');
  //$log.debug($scope.classes);
  for (var i=0; i < $scope.classes.length; i++) {
    var c = $scope.classes[i];
    //if ('date' in c) {
    if ('beluga' in c) {
      homiliesByStringifiedDate[c.date] = c;
      //$log.debug('c.date: ' + c.date);
    } else {
      //var regex = /([0-9]{4})-0?([1-9]{1,2}[0]?)-0?([1-9]{1,2}[0]?).*/
      var regex = /([0-9]{4})-([0-9]{2})-([0-9]{2}).*/
      var m = regex.exec(c['audio']);
      if (m != null) {
        //$log.debug('m[1]: ' + m[1]);
        //$log.debug('m[2]: ' + m[2]);
        //$log.debug('m[3]: ' + m[3]);
        //var origDateFormat = m[2] + '/' + m[3] + '/' + m[1];
        var origDateFormat = m[1] + '-' + m[2] + '-' + m[3];
        //$log.debug('origDateFormat: ' + origDateFormat);
        c.date = origDateFormat;
        homiliesByStringifiedDate[origDateFormat] = c;
      }
    }
    if ('liturgical_day' in c) {
      //$log.debug(c.liturgical_day);
      if (!(c.liturgical_day instanceof Array)) {
        c.liturgical_day = [c.liturgical_day];
      }
      for (var j=0; j < c.liturgical_day.length; j++) {
        $scope.parseLiturgicalDay(homiliesByName, homiliesArr, c, j);
      }
    }
  }
  homiliesArr;


  $scope.updateSearch = function() {
    var matchingArr1 = [];
    var noText = true;
    if ($scope.searchText1.val != '') {
      matchingArr1 = $filter('filter')(homiliesArr, {'searchText': $scope.searchText1.val});
      $log.debug('matchingArr1.length: ' + matchingArr1.length);
      for (var i = 0; i < matchingArr1.length; i++) {
        $log.debug('matchingArr1['+i+']:');
        $log.debug(matchingArr1[i]);
      }
      noText = false;
    }
    var matchingArr2 = [];
    if ($scope.searchText2.val != '') {
      matchingArr2 = $filter('filter')(homiliesArr, {'searchText': $scope.searchText2.val});
      noText = false;
    }
    $scope.matchingArr = arrayUnique(matchingArr1.concat(matchingArr2));
    $scope.noResults = false;
    $scope.tooManyResults = false;
    if ($scope.matchingArr.length > 20 || noText) {
      $scope.tooManyResults = true;
    } else if ($scope.matchingArr.length == 0) {
      $scope.noResults = true;
    } else {
      for (var i=0; i < $scope.matchingArr.length; i++) {
        if ($scope.c.id == $scope.matchingArr[i].id) {
          $scope.matchingArr.splice(i, 1);
        }
      }
    }

    $log.debug('matchingArr');
    $log.debug($scope.matchingArr);
  }
  //$log.debug('homiliesByName: ');
  //$log.debug(homiliesByName);
  //$log.debug('homiliesByStringifiedDate: ');
  //$log.debug(homiliesByStringifiedDate);


  $scope.set2weeks = function(day) {
    //$log.debug('set2weeks: ');
    //$log.debug(day);
    $scope.set2weeksday = day;
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
        //$log.debug("adding year: " + day.getFullYear());
        years.push(day.getFullYear());
      }
      if (months.indexOf(day.getMonth()) == -1) {
        months.push(day.getMonth());
        monthDates.push(day);
      }
      last2weekDates[i] = day;
      var dayStr = $scope.getDayStr(day);
      //$log.debug('dayStr: ' + dayStr);
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
    //var dayStr = (day.getMonth() + 1) + '/' + day.getDate() + '/' + day.getFullYear();
    var dayStr = day.getFullYear();
    dayStr += '-';
    if (day.getMonth() < 9) {
      dayStr += '0'
    }
    dayStr += day.getMonth() + 1;
    dayStr += '-';
    if (day.getDate() < 10) {
      dayStr += '0'
    }
    dayStr += day.getDate();

    //$log.debug('dayStr: ' + dayStr);
    return dayStr;
  }

  $scope.set2weeks($scope.dt);

  $scope.back = function() {
    var anotherTwoWeeksBack = new Date($scope.secondWeek[1].dateObj.getTime());
    //$log.debug('$scope.secondWeek[1].dateObj: ' + $scope.getDayStr($scope.secondWeek[1].dateObj));
    //$log.debug('anotherTwoWeeksBack 1: ' + $scope.getDayStr(anotherTwoWeeksBack));
    anotherTwoWeeksBack.setDate(anotherTwoWeeksBack.getDate() - 14);
    //$log.debug('anotherTwoWeeksBack 2: ' + $scope.getDayStr(anotherTwoWeeksBack));
    $scope.set2weeks(anotherTwoWeeksBack);
    var dtStr = $filter('date')(new Date(anotherTwoWeeksBack),'yyyy-MM-dd');
    //$log.debug('dtStr: ' + dtStr);
    $location.search('dt', dtStr);
    //$log.debug('back()');
  }

  $scope.forward = function() {
    var twoweeksforward = new Date($scope.secondWeek[1].dateObj.getTime());
    twoweeksforward.setDate(twoweeksforward.getDate() + 14);
    $scope.set2weeks(twoweeksforward);
    var dtStr = $filter('date')(new Date(twoweeksforward),'yyyy-MM-dd');
    //$log.debug('dtStr: ' + dtStr);
    $location.search('dt', dtStr);
    //$log.debug('forward()');
  }

  $scope.showComments = function() {
    $scope.show_disqus = true;
  }

  $scope.showDayModalIsOpen = false;
  $scope.showDay = function(d) {
    $scope.show_disqus = false;
    $log.debug('showDay(d): ');
    $log.debug(d);

    //d.litdaySelected = ld;
    $scope.showingDay = true;
    //$scope.day2show = d;
    $scope.c = d;
    //$location.path('/session').search({'course' : $scope.course, 'sessionId': c.id});
    $scope.sessionId = d.id;
    $log.debug('showDay.sessionId: ' + $scope.sessionId);
    //$location.search({'course' : $scope.course, 'sessionId': d.cpObj.id});
    //$scope.disqusConfig = $scope.assignDisqusParams($scope);
    $scope.assignDisqusParams($scope.sessionId);
    $log.debug('$scope.disqusConfig.disqus_shortname: '+ $scope.disqusConfig.disqus_shortname);

      //templateUrl: 'partials/course_specific/daily_modal.html',
    $location.search('showDay', d.date);
    $scope.$watch('searchText1.val', function(newValue, oldValue) {
      $log.debug('searchText1 updated');
      if (oldValue != newValue) {
        $scope.updateSearch();
      }
    });
    $scope.$watch('searchText2.val', function(newValue, oldValue) {
      //$log.debug('searchText2 updated');
      if (oldValue != newValue) {
        $scope.updateSearch();
      }
    });
    if (!$scope.showDayModalIsOpen) {
      $scope.showDayModalIsOpen = true;
      $scope.searchRelated(d);
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'partials/course_specific/daily_session.html?cbp=20190803',
        controller: ModalInstanceCtrl,
        size: 'lg',
        scope: $scope,
        preserveScope: true,
        bindToController: true
      });
      $scope.modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $scope.showDayModalIsOpen = false;
        //$log.debug($scope.searchText1.val);
        //$log.info('Modal dismissed at: ' + new Date());
        $location.search('showDay', null);
      });
    }
  }

  $scope.searchRelated = function(d) {
      $scope.searchText1 = { 'val': ''};
      $scope.searchText2 = { 'val': ''};
      if (d.hasOwnProperty('liturgical_day')) {
        for (var i=0; i < d.liturgical_day.length; i++) {
          if (i == 0) {
            $scope.searchText1.val = d.liturgical_day[i];
          } else {
            $scope.searchText2.val = d.liturgical_day[i];
          }
        }
      }
      $scope.updateSearch();
  }


  if ($location.search().showDay) {
    //$log.debug('homiliesByStringifiedDate[$location.search().showDay]: ');
    //$log.debug(homiliesByStringifiedDate[$location.search().showDay]);
    $scope.showDay(homiliesByStringifiedDate[$location.search().showDay]);
  }

  $scope.ok = function () {
    $log.debug('ok');
    $scope.modalInstance.dismiss();
    $location.search('showDay', null);
  };

  $scope.cancel = function () {
    //$log.debug('cancel');
    $uibModal.dismiss('cancel');
    $location.search('showDay', null);
  };

});

var ModalInstanceCtrl =  function ($scope, $controller, $window, $http, $log, $location) {

//cpApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, parentScope) {
//cpApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

}
