angular.module('cpApp', ['ngRoute'] //, function($compileProvider) {
  //}
  )
  .config(function($routeProvider, $compileProvider) {
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
      .otherwise({
        redirectTo:'/'
      });
  })
  .controller('MenuController', function($scope, $location, $routeParams) {
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
        console.log('include_zips = false');
        cp[i].seriesData.includeZips = false;
      } else {
        console.log('include_zips = true');
        cp[i].seriesData.includeZips = true;
      }
    }
    $scope.dropDownClicked = function(idx) {
      setClass($scope, "dropDown");
      $location.path('/class').search({'id' : idx});
    }
    $scope.topLevelClassClicked = function(idx) {
      setClass($scope, "topLevelClass");
      $location.path('/class').search({'id' : idx});
    }
    $scope.aboutClicked = function(idx) {
      setClass($scope, "about");
      //$location.path('');
    }
    console.log(cp);
  })
  .controller('MainController', function($scope, $location, $routeParams) {
  })
  .controller('ClassController', function($scope, $location, $routeParams) {
    console.log('in ClassController');
    $scope.cp = cp;
    console.log($routeParams);
    if ($routeParams['id'] != null) {
      console.log('found idx');
      selectClass($scope, $routeParams.id);
    }
  })

var selectClass = function(scope, idx) {
  console.log(idx);
  console.log(scope.cp[idx]);
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



  console.log("scope.aboutClass: " + scope.aboutClass  );
  console.log("scope.dropDownClass: "+   scope.dropDownClass  );
  console.log("scope.topLevelClass: "+  scope.topLevelClass  );
}
