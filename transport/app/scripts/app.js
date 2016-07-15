'use strict';

/**
 * @ngdoc overview
 * @name transportApp
 * @description
 * # transportApp
 *
 * Main module of the application.
 */
angular
    .module('transportApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMap',
    'ui.bootstrap',
    'ui.grid',
    'checklist-model',
    'ngStorage'
  ])
    .config(['$httpProvider', '$routeProvider', function ($httpProvider, $routeProvider) {
        $httpProvider.interceptors.push('loadingInterceptor');
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })

        .when('/selectedDriver/:driverId/:index', {
                templateUrl: 'views/selecteddriverinfo.html',
                controller: 'SelecteddriverinfoctrlCtrl',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/createRoute', {
                templateUrl: 'views/createroute.html',
                controller: 'CreaterouteCtrl',
                controllerAs: 'createRoute',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/addDriver', {
                templateUrl: 'views/adddriver.html',
                controller: 'AdddriverCtrl',
                controllerAs: 'addDriver',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/addVehicles', {
                templateUrl: 'views/addvehicles.html',
                controller: 'AddvehiclesCtrl',
                controllerAs: 'addVehicles',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/addStudent/:route_id/:route_no/:stoppage_id/:stoppage_name', {
                templateUrl: 'views/addstudent.html',
                controller: 'AddstudentCtrl',
                controllerAs: 'addStudent',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/addStudent', {
                templateUrl: 'views/addstudent.html',
                controller: 'AddstudentCtrl',
                controllerAs: 'addStudent',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/addStudent/:routeId/:routeNo', {
                templateUrl: 'views/addstudent.html',
                controller: 'AddstudentCtrl',
                controllerAs: 'addStudent',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .when('/assignVehicle', {
                templateUrl: 'views/assignvehicle.html',
                controller: 'AssignvehicleCtrl',
                controllerAs: 'assignVehicle',
                resolve: {
                    confData: function (configData) {
                        configData.loadConfiguration()
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });


        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';


  }]).service('configData', ['$http', '$localStorage', function ($http, $localStorage) {
        this.loadConfiguration = function () {
            if (!$localStorage.config) {
               // alert('no data')
                $http.get('config.json').then(function (result) {
                    $localStorage.config = result.data;
                    return true;
                });
            } else {
                // alert("In service")
                // alert(JSON.stringify($localStorage.config))
            }
        };
}])