'use strict';

/**
 * @Author: Abhishek Arora
 * @name transportApp.controller:MainCtrl
 * @description: This controller will call api for getting driver information based on school as well as current location of the driver
 * # MainCtrl
 * Controller of the transportApp
 */
angular.module('transportApp').controller('MainCtrl', function ($scope, $rootScope, $localStorage, NgMap, $location, apiCommunication, $timeout, $route, $sessionStorage, $anchorScroll) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.$parent.showStoppageStudents = false;
    var intervalForLocation;
    var listOfDrivers;
    $scope.errorOccurred = false;
    $scope.driverInfoData = [];
    $scope.stoppageArr = [];
    $scope.$parent.showStoppageStudents = false;
    $scope.driverLocationData = [];
    var driver_ids = [];
    var setIntervalFlag = true;
    var angularError = $localStorage.config.constantMsg.angularError ; //"Something went wrong.Please try again";
    $scope.driverInfoData = [];

    $scope.refresh = function () {
            $route.reload();
        }
        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is used to generate random color
         * Return:color
         * Params:null
         */
    $scope.getRandomColor = function () {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        /**
         * @Author:Payal Vishwakarma
         * @name :calculateAddress
         * @description: This function is used to get address of driver
         * Return:null
         * Params:null
         */

    var calculateAddress = function (latlng, flag, callback) {
            var value;
            $scope.geocoder = new google.maps.Geocoder();
            if (flag == "false") {
                value = 'No location found';
                callback(null, value);
            } else {
                $scope.geocoder.geocode({
                    'latLng': latlng
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            value = results[1].formatted_address;
                            callback(null, value);
                        } else {
                            value = 'Location not found';
                            callback(null, value);
                        }
                    } else {
                        value = 'Geocoder failed';
                        callback(null, value);
                    }
                });
            }

        }
        /**
         * @Author: Vaishnavi
         * @name transportApp.controller:MainCtrl
         * @description: This function is used to change the location of the tracker as data getting from API
         * Return:null
         * Params:null
         */
    $scope.getCurrentDriverLocation = function () {
            $scope.driverLocationData = [];
            apiCommunication.driverInfo.post({}, {
                    uuids: driver_ids
                }, function (result) {
                    if (result.statusCode == 1001) {
                        $scope.errorOccurred = true;
                        $scope.errorMessage = result.description;
                        return;
                    } else if (result.statusCode == 1006) {

                        for (var j = 0; j < driver_ids.length; j++) {

                            for (var i = 0; i < result.location.length; i++) {
                                if (driver_ids[j] == result.location[i].uuid) {
                                    for (var color = 0; color < $rootScope.arr.length; color++) {
                                        if (result.location[i].uuid == $rootScope.arr[color].driver_id) {
                                            result.location[i]["loc_color"] = $rootScope.arr[color].color;
                                            $scope.driverLocationData.push(result.location[i]);
                                        }
                                    }
                                    break;
                                }
                            }

                        }
                        if (setIntervalFlag == true) {
                            intervalForLocation = $timeout(function () {
                                $scope.getCurrentDriverInfo();
                            }, 50000);
                        } else {
                            intervalForLocation = $timeout(function () {
                                $scope.getCurrentDriverLocation();
                            }, 50000)
                        }
                    } else {
                        $scope.errorOccurred = true;
                        $scope.errorMessage = result.description;
                        return;
                    }
                },
                function (err) {
                    $scope.errorOccurred = true;
                    $scope.errorMessage = angularError;
                });
        }
        /**
         * @Author:Payal Vishwakarma
         * @name :getCurrentDriverInfo
         * @description: This function is used to get all the driver in a school
         * Return:null
         * Params:null
         */
    $rootScope.arr = [];
    $scope.getCurrentDriverInfo = function () {
            angular.element("#txt1").focus();
            apiCommunication.listAlldriver.get({
                    value: true
                }, function (result) {
                    if (result.statusCode == 1006 || result.statusCode == 1002) {
                        if (result.driverList != undefined) {
                            driver_ids = [];
                            for (var i = 0; i < result.driverList.length; i++) {
                                driver_ids.push(result.driverList[i].driver_id);
                                result.driverList[i].address = "";
                                result.driverList[i].color = "";
                                if ($rootScope.arr.length < driver_ids.length) {
                                    $rootScope.arr.push({
                                        color: $scope.getRandomColor(),
                                        driver_id: result.driverList[i].driver_id
                                    });
                                }
                            }
                            $sessionStorage.colorArray = $rootScope.arr;
                            $scope.driverInfoData = result.driverList;
                            for (var i = 0; i < $scope.driverInfoData.length; i++) {
                                for (var color = 0; color < $rootScope.arr.length; color++) {
                                    if ($scope.driverInfoData[i].driver_id == $rootScope.arr[color].driver_id) {
                                        $scope.driverInfoData[i].color = $rootScope.arr[color].color;
                                    }
                                }
                                //   break;
                            }
                            $sessionStorage.school_id = result.school_id;
                            if ($scope.$parent != null) {
                                $scope.$parent.setSchoolName(result.school_name);
                            }
                            $scope.getCurrentAddressFromGoogle();
                        } else {
                            $scope.errorOccurred = true;
                            $scope.errorMessage = angularError;
                        }
                    } else if(result.statusCode == 1005 && result.message == "No Driver Found") {
                        $sessionStorage.school_id = result.school_id;
                        if ($scope.$parent != null) {
                            $scope.$parent.setSchoolName(result.school_name);
                        }
                    } else {
                        $scope.errorOccurred = true;
                        $scope.errorMessage = result.description;
                    }


                },
                function (err) {
                    $scope.errorOccurred = true;
                    $scope.errorMessage = angularError;
                })

        }
        /**
         * @Author:Payal Vishwakarma
         * @name :getCurrentAddressFromGoogle
         * @description: This function is called recursively to get address of all the drivers in the available driver-route list
         * Return:null
         * Params:null
         */
    var recurrsiveCall = 0;
    $scope.getCurrentAddressFromGoogle = function () {
            if (recurrsiveCall < $scope.driverInfoData.length) {
                if ($scope.driverInfoData[recurrsiveCall].lattitude == null) {
                    var latlng = (0, 0);
                    var setFlag = "false";
                } else {
                    var latlng = new google.maps.LatLng($scope.driverInfoData[recurrsiveCall].lattitude, $scope.driverInfoData[recurrsiveCall].longitude);
                    var setFlag = "true";
                }
                calculateAddress(latlng, setFlag, function (err, data) {
                    if (err) {
                        $scope.driverInfoData[recurrsiveCall].address = "";
                    } else {
                        $scope.driverInfoData[recurrsiveCall].address = data;
                    }
                    recurrsiveCall++;
                    $scope.getCurrentAddressFromGoogle();
                });
            } else {
                $anchorScroll('txt1');
                recurrsiveCall = 0;
                if(!$scope.$$phase) {
                $scope.$apply();  //$digest or $apply
                }
               // $scope.$apply();
                $scope.getCurrentDriverLocation();
            }
        }
        /**
         * @Author:Payal Vishwakarma
         * @name :getStoppages
         * @description: This function is used to get all the stoppages along with students in a route 
         * Return:null
         * Params:null
         */
    $scope.getStoppages = function (id) {
            apiCommunication.students.get({
                route_id: id
            }, function (result) {
                if (result.statusCode == 1006 || result.statusCode == 1002) {
                    if (result.studentList != undefined) {
                        $scope.showStoppageStudents = true;
                        $scope.stoppageArr = result.studentList;
                    }
                } else if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004 || result.statusCode == 1007) {
                    $scope.showStoppageStudents = false;
                }

            }, function (err) {
                $scope.errorOccurred = true;
                $scope.errorMessage = angularError;
            })
        }
        /**
         * @Author:Payal Vishwakarma
         * @name :viewStudents
         * @description: This function is used to change the state and navigate to add student page containing list of students on a stoppage
         * Return:null
         * Params:null
         */
    $scope.viewStudents = function (obj) {
            $sessionStorage.sessionObject = obj;
            $location.path('/addStudent/' + obj.route_id + '/' + obj.route_no);
        }
        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:MainCtrl
         * @description: This function is used to show the info window for the marker
         * Return:null
         * Params:event and selected object
         */
    $scope.$on('$destroy', function () {
        $scope.map.hideInfoWindow('myInfoWindow', this);
        if (intervalForLocation) {
            $timeout.cancel(intervalForLocation);
        }
    });

    if (!$rootScope.online) {
        alert('No internet connection');
    } else {
        $scope.geocoder = new google.maps.Geocoder();
        $scope.driverLocationData;

        NgMap.getMap().then(function (map) {
            $scope.map = map;
        });

        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:MainCtrl
         * @description: This function is used to show the info window for the marker
         * Return:null
         * Params:event and selected object
         */
        $scope.showCity = function (event, city) {
            $scope.selectedCity = city;
            $scope.map.showInfoWindow('myInfoWindow', this);
            $scope.latlng = new google.maps.LatLng($scope.selectedCity.lattitude, $scope.selectedCity.longitude);
            $scope.geocoder.geocode({
                'latLng': $scope.latlng
            }, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        $scope.address = results[0];
                        $scope.$apply();
                    } else {
                        console.log('Location not found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
        };

    }
});

angular.module('transportApp').run(function ($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.online = true;
        });
    }, false);
});