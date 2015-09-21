//angular.module('cpApp', ['ngRoute', 'ngDisqus'] //, function($compileProvider) {
  //}
angular.module('cpApp', ['ngRoute', 'ngSanitize', 'angularUtils.directives.dirDisqus'])
  .config(function($routeProvider, $compileProvider, $locationProvider ) {
  //.config(function($routeProvider, $compileProvider, $locationProvider, $disqusProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|itms):/);
    $routeProvider
      .when('/', {
        reloadOnSearch: false,
        controller:'MainController',
        templateUrl:'web/main.html?v=2'
      })
      .when('/class', {
        reloadOnSearch: true,
        controller:'ClassController',
        templateUrl:'web/classContent.html?v=2'
      })
      .when('/session', {
        reloadOnSearch: true,
        controller:'SessionController',
        templateUrl:'web/session.html?v=2'
      })
      .otherwise({
        redirectTo:'/'
      });
    /*
    $locationProvider.html5Mode({
      enabled: true
    });
    */
    //$locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    //$disqusProvider.setShortname('catholicpatrimony');
  })
  .controller('MenuController', function($scope, $location, $routeParams, $log, $sce) {
    $log.debug('defining trustSrc');
    $scope.trustSrc = function(src) {
      try {
        //$log.debug('trustSrc: ' + src);
        return $sce.trustAsResourceUrl(src);
      } catch (e) {
      }
    }
    $scope.gdoc_loaded = function() {
      var f = function(id)
      {
          document.getElementById(id).style.display = "none";
      };
      f("header");
      f("footer");
    };
    $scope.cp = cp;
    $scope.uncovering_2015_schedule = uncovering_2015_schedule;
    $scope.dropDownMenu = [];
    $scope.topLevelMenu = [];
    for (var i=0; i < cp.length; i++) {
      $scope.cp[i].idx = i;
      if (cp[i].seriesData.separate_menu && cp[i].seriesData.separate_menu == "TRUE") {
        $scope.topLevelMenu.push(cp[i]);
      } else if (cp[i].seriesData.publish && cp[i].seriesData.publish == "FALSE") {
      } else {
        $scope.dropDownMenu.push(cp[i]);
      }
      if (cp[i].seriesData.include_zips && cp[i].seriesData.include_zips == "FALSE") {
        $log.debug('include_zips = false');
        cp[i].seriesData.includeZips = false;
      } else {
        $log.debug('include_zips = true');
        cp[i].seriesData.includeZips = true;
      }
    }
    $scope.dropDownClicked = function(course) {
      setClass($scope, "dropDown");
      $location.path('/class').search({'course' : course});
    }
    $scope.topLevelClassClicked = function(course) {
      setClass($scope, "topLevelClass");
      $location.path('/class').search({'course' : course});
    }
    $scope.aboutClicked = function(course) {
      setClass($scope, "about");
      //$location.path('');
    }
    $log.debug(cp);
  })
  .controller('MainController', function($scope, $location, $routeParams, $log) {
  })
  .controller('ClassController', function($scope, $location, $routeParams, $log) {
    $log.debug('in ClassController');
    $scope.cp = cp;
    $log.debug($routeParams);
    if ($routeParams['course'] != null) {
      $log.debug('found course');
      selectClass($scope, $routeParams.course);
    }
    if ($routeParams['enableComments'] != null) {
      $scope.enableComments = true;
    } else {
      $scope.enableComments = false;
    }
    $log.debug('enableComments: ' + $scope.enableComments);

    $scope.sessionClicked = function(c) {
      $scope.c = c;
      $location.path('/session').search({'course' : $scope.course, 'sessionId': c.id});
    }
  })
  .controller('SessionController', function($scope, $location, $routeParams, $log, $sce) {
    $scope.myDisqus_contentLoaded = false;
    $log.debug('in SessionController');
    $scope.cp = cp;
    $log.debug($routeParams);
    /*
    if ($routeParams['course'] != null) {
      $scope.session = 
    }
    */
    if ($routeParams['course'] != null) {
      $log.debug('found course');
      selectClass($scope, $routeParams.course);
      if ($routeParams['sessionId'] != null) {
        for (var i=0; i < $scope.classes.length; i++) {
          if ($scope.classes[i].id == $routeParams['sessionId']) {
            $scope.c = $scope.classes[i];
          }
        }
        $scope.myDisqus_identifier = 'cp.com.session_' + $routeParams['course'] + '_' + $routeParams['sessionId'];
        $scope.myDisqus_title = $scope.c.title;
        $scope.myDisqus_url = $location.absUrl();
        $log.debug($scope.myDisqus_identifier);
        $log.debug('d1');
        $log.debug($scope.myDisqus_title);
        document.title = $scope.myDisqus_title
        $log.debug('d2');
        $log.debug($scope.myDisqus_url);
        $log.debug('d3');
        $scope.myDisqus_contentLoaded = true;
      }
    }
  })

var selectClass = function(scope, course) {
  /*
  $log.debug(idx);
  $log.debug(scope.cp[idx]);
  */
  scope.course = course;
  for (var i=0; i < cp.length; i++) {
    if (cp[i].seriesData.normalized_name == course) {
      scope.seriesSelected = cp[i];
    }
  }
  scope.sd = scope.seriesSelected.seriesData;
  scope.classes = scope.seriesSelected.classes;
}

var setClass = function(scope, tlm) {
  scope.aboutClass="";
  scope.dropDownClass="";
  scope.topLevelClass="";
  if (tlm == "about") {
    scope.aboutClass="active";
  } else if (tlm == "dropDown") {
    scope.dropDownClass="active";
  } else if (tlm == "topLevelClass") {
    scope.topLevelClass="active";
  }

  /*
  $log.debug("scope.aboutClass: " + scope.aboutClass  );
  $log.debug("scope.dropDownClass: "+   scope.dropDownClass  );
  $log.debug("scope.topLevelClass: "+  scope.topLevelClass  );
  */
}
