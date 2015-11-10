//angular.module('cpApp', ['ngRoute', 'ngDisqus'] //, function($compileProvider) {
  //}
var cpApp = angular.module('cpApp', ['ngRoute', 'ngSanitize', 'angularUtils.directives.dirDisqus', 'ui.bootstrap'])
  .config(function($routeProvider, $compileProvider, $locationProvider ) {
  //.config(function($routeProvider, $compileProvider, $locationProvider, $disqusProvider ) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|itms):/);
    $routeProvider
      .when('/', {
        reloadOnSearch: false,
        controller:'MainController',
        templateUrl:'partials/main.html?v=2'
      })
      .when('/class', {
        reloadOnSearch: true,
        controller:'ClassController',
        templateUrl:'partials/courseContent.html?v=2'
      })
      .when('/session', {
        reloadOnSearch: true,
        controller:'SessionController',
        templateUrl:'partials/session.html?v=2'
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
    $scope.selectClassByName = function(courseName) {
      for (var i=0; i < $scope.cp.length; i++) {
        if (cp[i].seriesData.normalized_name == courseName) {
          $scope.selectClass(cp[i]);
        }
      }
    }
    $scope.classSelected = function(c) {
      $scope.selectClass(c);
      $location.path('/class').search({'course' : c.seriesData.normalized_name});
    }
    $scope.selectClass = function(c) {
      /* the reason I'm doing this here is because firefox is line breaking the
       * straight template solution (which I left commented out in classContent.html */
      for (var i=0; i < c.classes.length; i++) {
        var c2 = c.classes[i];
        c2.fileicons = [];
        if ('new_handout_file' in c2) {
          for (var j=0; j < c2.new_handout_file.length; j++) {
            var nhf = c2.new_handout_file[j];
            if (nhf.indexOf('.pdf') > -1) {
              c2.fileicons[j] = 'pdficon.gif';
            } else if (nhf.indexOf('.doc') > -1) {
              c2.fileicons[j] = 'docicon.png';
            } else if (nhf.indexOf('.ppt') > -1) {
              c2.fileicons[j] = 'document_powerpoint.png';
            } else if (nhf.indexOf('http') > -1) {
              c2.fileicons[j] = 'Link_symbol_16.png';
            }
          }
        }
      }
      if ($scope.seriesSelected != null) {
        $scope.seriesSelected.active = false;
      }
      c.active = true;
      $scope.seriesSelected = c;
      $scope.sd = c.seriesData;
      $scope.classes = c.classes;
    }
    $scope.goHome = function() {
      if ($scope.seriesSelected != null) {
        $scope.seriesSelected.active = false;
      }
      $location.path('/');
    }
    $log.debug('defining trustSrc');
    $scope.trustSrc = function(src) {
      try {
        //$log.debug('trustSrc: ' + src);
        return $sce.trustAsResourceUrl(src);
      } catch (e) {
      }
    }
    $scope.gdoc_loaded = function() {
      var f = function(id) {
          document.getElementById(id).style.display = "none";
      };
      f("header");
      f("footer");
      //$log.debug('gdoc_loaded');
    };
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
  })
  .controller('MainController', function($scope, $location, $routeParams, $log) {
  })
  .controller('ClassController', function($scope, $location, $routeParams, $log) {
    $log.debug('in ClassController');
    $scope.cp = cp;
    $log.debug($routeParams);
    if ($routeParams['course'] != null) {
      $log.debug('found course');
      $scope.selectClassByName($routeParams.course);
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
      $scope.selectClassByName($routeParams['course']);
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
  });
