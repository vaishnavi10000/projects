'use strict';

/**
 * @Author: Payal Vishwakarma
 * @name transportApp.controller:DriverinfonavigationctrlCtrl
 * @description
 * # DriverinfonavigationctrlCtrl
 * Controller of the transportApp
 */
angular.module('transportApp').controller('DriverinfonavigationctrlCtrl', function ($scope, $rootScope, apiCommunication, $location, $sessionStorage,globalConfig) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.driverInfoData = [];
    $scope.stoppageArr = [];
    $scope.$parent.showStoppageStudents = false;

    $scope.driverInfoData = [];
    
    //for getting constants
    $scope.resourceConfig=globalConfig;
	 $scope.schoolName="";
    
    /**
     * @Author: Payal
     * @name transportApp.controller:DriverinfonavigationctrlCtrl
     * @description: this method will called by main controller for assigning school name.
     * Return:color
     * Params:null
     */
    $scope.setSchoolName=function(schoolName){
        $sessionStorage.school_name=schoolName;
        $scope.schoolName=schoolName;
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

    var calculateAddress = function (latlng, callback) {
            var value;
            $scope.geocoder = new google.maps.Geocoder();
            if (latlng === (0, 0)) {
                value = 'No location found in database';
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
         * @Author:Payal Vishwakarma
         * @name :getCurrentDriverInfo
         * @description: This function is used to get all the driver in a school
         * Return:null
         * Params:null
         */
    $scope.getCurrentDriverInfo = function () {
        apiCommunication.listAlldriver.get({
                value: true
            }, function (result) {
                if (result.statusCode == 1006 || result.statusCode == 1002) {
                    if (result.driverList != undefined) {
                         $rootScope.arr = [];
                        for (var i = 0; i < result.driverList.length; i++) {
                           $rootScope.arr.push({color:$scope.getRandomColor(),driver_id:result.driverList[i].UUID});
                        }

                        $scope.driverInfoData = result.driverList;
						
                        for (var i = 0; i < $scope.driverInfoData.length; i++) {
                            $scope.driverInfoData[i].address = "";

                        }
                        $scope.getCurrentAddressFromGoogle();
                    }
                }
            },
            function (err) {})
    }
    var recurrsiveCall = 0;
    $scope.getCurrentAddressFromGoogle = function () {
            if (recurrsiveCall < $scope.driverInfoData.length) {
                //latlongg(28.6324755606311, 77.21970920520016)
                if ($scope.driverInfoData[recurrsiveCall].lattitude == null) {
                    var latlng = new google.maps.LatLng(28.6324755606311, 77.21970920520016);
                } else {
                    var latlng = new google.maps.LatLng($scope.driverInfoData[recurrsiveCall].lattitude, $scope.driverInfoData[recurrsiveCall].longitude);
                }
                calculateAddress(latlng, function (err, data) {
                    if (err) {
                        $scope.driverInfoData[recurrsiveCall].address = "";
                    } else {
                        $scope.driverInfoData[recurrsiveCall].address = data;
                        $scope.$apply();
                    }
                    recurrsiveCall++;
                    $scope.getCurrentAddressFromGoogle();
                });
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

            }, function (err) {})
        }
        /**
         * @Author:Payal Vishwakarma
         * @name :viewStudents
         * @description: This function is used to change the state and navigate to add student page containing list of students on a stoppage
         * Return:null
         * Params:null
         */
    $scope.viewStudents = function (obj) {   
        $sessionStorage.sessionObject=obj;
		console.log("from driver-route list page to add student");
		console.log($sessionStorage.sessionObject);
        $location.path('/addStudent/' + obj.route_id + '/' + obj.route_no);
    }

});