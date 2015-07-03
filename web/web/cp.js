//angular.module('cpApp', ['ngRoute', 'ngDisqus'] //, function($compileProvider) {
  //}
angular.module('cpApp', ['ngRoute', 'angularUtils.directives.dirDisqus'])
  .config(function($routeProvider, $compileProvider, $locationProvider ) {
  //.config(function($routeProvider, $compileProvider, $locationProvider, $disqusProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|itms):/);
    $routeProvider
      .when('/', {
        reloadOnSearch: false,
        controller:'MainController',
        templateUrl:'web/main.html'
      })
      .when('/class', {
        reloadOnSearch: true,
        controller:'ClassController',
        templateUrl:'web/classContent.html'
      })
      .when('/session', {
        reloadOnSearch: true,
        controller:'SessionController',
        templateUrl:'web/session.html'
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
  .controller('MenuController', function($scope, $location, $routeParams, $log) {
    $scope.cp = cp;
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
    $scope.dropDownClicked = function(idx) {
      setClass($scope, "dropDown");
      $location.path('/class').search({'classId' : idx});
    }
    $scope.topLevelClassClicked = function(idx) {
      setClass($scope, "topLevelClass");
      $location.path('/class').search({'classId' : idx});
    }
    $scope.aboutClicked = function(idx) {
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
    if ($routeParams['classId'] != null) {
      $log.debug('found idx');
      selectClass($scope, $routeParams.classId);
    }
    if ($routeParams['enableComments'] != null) {
      $scope.enableComments = true;
    } else {
      $scope.enableComments = false;
    }
    $log.debug('enableComments: ' + $scope.enableComments);

    $scope.sessionClicked = function(sessionId) {
      $location.path('/session').search({'classId' : $scope.classId, 'sessionId': sessionId});
    }
  })
  .controller('SessionController', function($scope, $location, $routeParams, $log) {
    $scope.myDisqus_contentLoaded = false;
    $log.debug('in SessionController');
    $scope.cp = cp;
    $log.debug($routeParams);
    /*
    if ($routeParams['classId'] != null) {
      $scope.session = 
    }
    */
    if ($routeParams['classId'] != null) {
      $log.debug('found idx');
      selectClass($scope, $routeParams.classId);
      if ($routeParams['sessionId'] != null) {
        $scope.c = $scope.classes[$routeParams['sessionId']];
        $scope.myDisqus_identifier = 'cp.com.session_' + $routeParams['classId'] + '_' + $routeParams['sessionId'];
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

var selectClass = function(scope, idx) {
  /*
  $log.debug(idx);
  $log.debug(scope.cp[idx]);
  */
  scope.classId = idx;
  scope.seriesSelected = cp[idx];
  scope.sd = cp[idx].seriesData;
  scope.classes = cp[idx].classes;
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
