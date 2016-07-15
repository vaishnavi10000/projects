'use strict';

/**
 * @ngdoc function
 * @name transportApp.controller:SelecteddriverinfoctrlCtrl
 * @description
 * # SelecteddriverinfoctrlCtrl
 * Controller of the transportApp
 */
angular.module('transportApp').controller('SelecteddriverinfoctrlCtrl', function ($scope, NgMap, apiCommunication, $routeParams, $interval, globalConfig, $rootScope, $timeout,$sessionStorage) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var intervalForLocation;
    $scope.errorOccurred=false;

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
            $interval.cancel(intervalForLocation);
        }
    });

    NgMap.getMap().then(function (map) {
        $scope.map = map;
    });
    $scope.geocoder = new google.maps.Geocoder();
    $scope.driverLocationData;
    $scope.markerIndex = $routeParams.index;
   

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

    };
    $timeout(function () {
        $scope.showCity();
    }, 1000);
    /**
     * @Author: Abhishek Arora
     * @name transportApp.controller:MainCtrl
     * @description: This function is used to change the location of the tracker as data getting from API
     * Return:null
     * Params:null
     */
    $scope.driverLocationData = {
        lat: null,
        long: null
    };
var colorArrLocal;
 $scope.getCurrentDriverLocation2 = function() {
         apiCommunication.driverInfo.post({}, {
              uuids: [$routeParams.driverId]
          }, function(result) {
             if (result.statusCode == 1001) {
                    $scope.errorOccurred=true;
                    $scope.errorMessage = result.description;
              }else if (result.statusCode == 1006) {
                  $scope.driverLocationData.lat = result.location[0].lattitude;
                  $scope.driverLocationData.long = result.location[0].longitude;
                   $scope.driverLocationData.driver_id=result.location[0].uuid;
                  colorArrLocal=$sessionStorage.colorArray;
                     for (var color = 0; color < colorArrLocal.length; color++) {
                                        if ($scope.driverLocationData.driver_id == colorArrLocal[color].driver_id) {
                                            $scope.driverLocationData["loc_color"] = colorArrLocal[color].color;
                                           
                                        }
                                    }
                 
                  $scope.latlng = new google.maps.LatLng(result.location[0].lattitude, result.location[0].longitude);
                  $scope.geocoder.geocode({
                      'latLng': $scope.latlng
                  }, function(results, status) {

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
              }else if(result.statusCode=1004){
               console.log("no data")
              }else{
                console.log("some other error")
              }

          }, function(err) {
              console.log(err)
          })
    };
    
    $scope.getCurrentDriverLocation2();
    
  
    intervalForLocation = $interval(function () {
       $scope.getCurrentDriverLocation2();
    }, 30000);


});