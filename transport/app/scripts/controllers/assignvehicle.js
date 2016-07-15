'use strict';

/**
 * @ngdoc function
 * @name transportApp.controller:AssignvehicleCtrl
 * @description
 * # AssignvehicleCtrl
 * Controller of the transportApp
 */
angular.module('transportApp')
    .controller('AssignvehicleCtrl', function ($scope, $localStorage, $uibModal, globalConfig, apiCommunication, $location, $route, $rootScope) {
        this.awesomeThings = [
      'HTML5 Boilerplate'








            
            , 'AngularJS'








            
            , 'Karma'
    ];
        //console.log($rootScope.hello);
        $scope.confimationPopupInfo = {
            "Title": "Unassign"
            , "Message": "Are you sure want to unassign selected driver?"
            , "okButton": "Yes"
            , "cancelButton": "No"
        }
        $scope.$parent.showStoppageStudents = false;
        $scope.selectedDriver = -1;
        $scope.selectedVehicle = -1;
        $scope.selectedRoute = -1;
        $scope.vehicleNo = 'Vehicle No';
        $scope.routeNo = 'Route No';
        $scope.driverName = 'Driver Name';
        $scope.assignVehicleValidator = true;
        $scope.readOnly = false;
        $scope.readOnlyVehicle = false;
        $scope.gridOptions = [];
        $scope.driverArr = [];
        $scope.vehicleArr = [];
        $scope.routeArr = [];
        $scope.showRouteAlert = false;
        $scope.showDriverAlert = false;
        $scope.showVehicleAlert = false;
        $scope.showUnassignError = false;
        $scope.showErrorOrSuccess = false;
        $scope.errorRedFlagDriver = true;
        $scope.errorRedFlagVechile = true;
        $scope.errorRedFlagRoute = true;

        var angularError = $localStorage.config.constantMsg.angularError;

        //input JSON for posting data 
        $scope.finalInputJson = {
            "session_token": null
            , "uuid": null
            , "route_id": ""
            , "driver_id": ""
            , "vehicle_id": ""
        };
        if ($rootScope.driverName != undefined && $rootScope.driverName != "") {
            $scope.driverId = $rootScope.driverId;
            $scope.driverName = $rootScope.driverName;
            $scope.readOnly = true;
            var d = {
                "UUID": $scope.driverId
                , "first_name": $scope.driverName
            };
            $scope.driverArr.unshift(d);
            $scope.errorRedFlagDriver = false;
        }
        if ($rootScope.vehiclenumber != undefined && $rootScope.vehiclenumber != "") {
            $scope.readOnlyVehicle = true;
            $scope.vehicleNo = $rootScope.vehiclenumber;
            $scope.vehicleId = $rootScope.vehicleId
            $scope.seatCount = $rootScope.seatCount;
            var v = {
                "id": $scope.vehicleId
                , "vehicle_no": $scope.vehicleNo
                , "seats": $scope.seatCount
            };
            $scope.vehicleArr.unshift(v);
            $scope.errorRedFlagVechile = false;
        }
        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AssignvehicleCtrl
         * @description:This function is used to remove the error or success message
         * Return:null
         * Params:null
         */
        $scope.removeMessage = function () {
                $scope.showErrorOrSuccess = false;
            }
            /**
             * @Author: Himanshu Bhatti
             * @ngdoc function
             * @name transportApp.controller:AssignvehicleCtrl
             * @description:This function is used to remove the selected assigned vehicle
             * Return:null
             * Params:null
             */
        $scope.removeSelected = function (value) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled
                , templateUrl: '../views/deletePopup.html'
                , controller: 'deleteConfirmCtrl'
                , size: "sm"
                , resolve: {
                    items: function () {
                        return $scope.confimationPopupInfo;
                    }
                }
            });
            modalInstance.result.then(function (status) {
                if (status) {

                    $scope.finalInputJson.route_id = value.id;
                    $scope.finalInputJson.driver_id = value.driver_id;
                    $scope.finalInputJson.vehicle_id = value.vehicle_id;
                    apiCommunication.unassignVehicle.post({}, $scope.finalInputJson, function (result) {
                        if (result.description === "unassigned") {
                            $scope.infocolor = "success";
                            $scope.msg = $localStorage.config.constantMsg.vehicleUnassigned; //"Vehicle Unassigned";
                            $scope.showErrorOrSuccess = true;
                            var idx = $scope.gridOptions.indexOf(value)

                            var r = {
                                "id": value.id
                                , "route_no": value.route_no
                            };
                            var d = {
                                "UUID": value.driver_id
                                , "first_name": value.first_name
                            };
                            var v = {
                                "id": value.vehicle_id
                                , "vehicle_no": value.vehicle_no
                                , "seats": value.seats
                            };
                            $scope.routeArr.unshift(r);
                            $scope.driverArr.unshift(d);
                            $scope.vehicleArr.unshift(v);
                            $scope.gridOptions.splice(idx, 1);
                            if ($scope.routeArr.length == 0) {
                                $scope.showRouteAlert = true;
                            } else {
                                $scope.showRouteAlert = false;
                            }
                            if ($scope.driverArr.length == 0) {
                                $scope.showDriverAlert = true;
                            } else {
                                $scope.showDriverAlert = false;
                            }
                            if ($scope.vehicleArr.length == 0) {
                                $scope.showVehicleAlert = true;
                            } else {
                                $scope.showVehicleAlert = false;
                            }
                            $scope.selectedDriver = -1;
                            $scope.selectedVehicle = -1;
                            $scope.selectedRoute = -1;
                            $scope.vehicleNo = 'Vehicle No';
                            $scope.routeNo = 'Route No';
                            $scope.driverName = 'Driver Name';
                            $scope.assignVehicleValidator = true;
                            $scope.errorRedFlagDriver = true;
                            $scope.errorRedFlagVechile = true;
                            $scope.errorRedFlagRoute = true;

                        } else {
                            $scope.showUnassignError = true;
                        }
                    }, function (err) {
                        $scope.infocolor = "warning fade in";
                        $scope.msg = angularError; //"Please Try Again";
                        $scope.showErrorOrSuccess = true;

                    })
                    $scope.finalInputJson = {
                        "session_token": null
                        , "uuid": null
                        , "route_id": ""
                        , "driver_id": ""
                        , "vehicle_id": ""
                    };
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        }

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AssignvehicleCtrl
         * @description:This function is used to unassign the selected assigned vehicle
         * Return:null
         * Params:null
         */

        if (globalConfig.appEnv == "dev") {
            if ($scope.readOnly == false) {
                apiCommunication.addDriverOutput.get({
                    allDriver: 0
                }, function (result) {
                    if (result.driverList == undefined) {
                        $scope.showDriverAlert = true;
                    } else {
                        for (var i = 0; i < result.driverList.length; i++) {
                            $scope.driverArr.push(result.driverList[i]);
                        }
                    }
                }, function (err) {
                    $scope.infocolor = "warning fade in";
                    $scope.msg = angularError; // "Please Try Again";
                    $scope.showErrorOrSuccess = true;
                })
            }
            if ($scope.readOnlyVehicle == false) {
                apiCommunication.addVehicleOutput.get({}, function (result) {
                    if (result.vehicles == undefined) {
                        $scope.showVehicleAlert = true;
                    } else {

                        for (var i = 0; i < result.vehicles.length; i++) {
                            if (result.vehicles[i].assigned == 0) {
                                $scope.vehicleArr.push(result.vehicles[i]);
                            }

                        }
                        if ($scope.vehicleArr.length == undefined || $scope.vehicleArr.length == 0) {
                            $scope.showVehicleAlert = true;
                        }
                    }

                }, function (err) {
                    $scope.infocolor = "warning fade in";
                    $scope.msg = angularError; // "Please Try Again";
                    $scope.showErrorOrSuccess = true;
                })
            }
            if ($scope.routeNo == 'Route No') {
                apiCommunication.routeList.get({}, function (result) {
                    if (result.routeList == undefined) {
                        $scope.showRouteAlert = true;
                    } else {

                        for (var i = 0; i < result.routeList.length; i++) {
                            if (result.routeList[i].vehicle_id == null && result.routeList[i].driver_id == null) {
                                $scope.routeArr.push(result.routeList[i]);
                            }
                        }
                    }
                }, function (err) {
                    $scope.infocolor = "warning fade in";
                    $scope.msg = angularError; // "Please Try Again";
                    $scope.showErrorOrSuccess = true;
                })
            }
            $scope.formValidation = function () {
                if (($scope.selectedDriver > -1 && $scope.selectedVehicle > -1 && $scope.selectedRoute > -1) || ($scope.readOnly == true && $scope.selectedVehicle > -1 && $scope.selectedRoute > -1) || ($scope.readOnlyVehicle == true && $scope.selectedDriver > -1 && $scope.selectedRoute > -1)) {
                    $scope.assignVehicleValidator = false;
                }
            }
            $scope.$watch("selectedDriver", function (newVal, oldVal) {
                if (newVal != oldVal) {
                    $scope.formValidation();
                }
            });
            $scope.$watch("selectedVehicle", function (newVal, oldVal) {
                if (newVal != oldVal) {
                    $scope.formValidation();
                }
            });
            $scope.$watch("selectedRoute", function (newVal, oldVal) {
                if (newVal != oldVal) {
                    $scope.formValidation();
                }
            });
            /**
             * @Author: Himanshu Bhatti
             * @ngdoc function
             * @name transportApp.controller:AssignvehicleCtrl
             * @description:This function is used to assign a vehicle to a driver and vice-versa
             * Return:null
             * Params:null
             */
            $scope.fetchLocation = function () {
                if ($scope.readOnly == false && $scope.readOnlyVehicle == false) {
                    $scope.finalInputJson.route_id = $scope.routeArr[$scope.selectedRoute].id;
                    $scope.finalInputJson.driver_id = $scope.driverArr[$scope.selectedDriver].UUID;
                    $scope.finalInputJson.vehicle_id = $scope.vehicleArr[$scope.selectedVehicle].id;
                    if ($scope.routeArr[$scope.selectedRoute].student_count > $scope.vehicleArr[$scope.selectedVehicle].seats) {
                        $scope.infocolor = "warning fade in";
                        $scope.msg = $localStorage.config.constantMsg.seatLimitExceeded; //"Students on this route exceeds the seat limit"
                        $scope.showErrorOrSuccess = true;
                    } else {
                        apiCommunication.assignVehicle.post({}, $scope.finalInputJson, function (result) {
                            if (result.description === "assigned") {
                                $scope.infocolor = "success";
                                $scope.msg = $localStorage.config.constantMsg.vehicleAssigned; // "Vehicle Assigned";
                                $scope.showErrorOrSuccess = true;
                                $scope.routeArr.splice($scope.selectedRoute, 1);
                                $scope.driverArr.splice($scope.selectedDriver, 1);
                                $scope.vehicleArr.splice($scope.selectedVehicle, 1);
                                $scope.selectedDriver = -1;
                                $scope.selectedVehicle = -1;
                                $scope.selectedRoute = -1;
                                $scope.vehicleNo = 'Vehicle No';
                                $scope.routeNo = 'Route No';
                                $scope.driverName = 'Driver Name';
                                if ($scope.routeArr.length == 0) {
                                    $scope.showRouteAlert = true;
                                }
                                if ($scope.driverArr.length == 0) {
                                    $scope.showDriverAlert = true;
                                }
                                if ($scope.vehicleArr.length == 0) {
                                    $scope.showVehicleAlert = true;
                                }
                                $scope.gridOptions.unshift(result);
                                $scope.assignVehicleValidator = true;
                                $scope.errorRedFlagDriver = true;
                                $scope.errorRedFlagVechile = true;
                                $scope.errorRedFlagRoute = true;

                            } else if (result.description === "Internal server error") {
                                $scope.infocolor = "warning fade in";
                                $scope.msg = angularError; // "Please Try Again";
                                $scope.showErrorOrSuccess = true;
                            } else {
                                $scope.infocolor = "warning fade in";
                                $scope.msg = result.description;
                                $scope.showErrorOrSuccess = true;
                            }
                        }, function (err) {
                            $scope.infocolor = "warning fade in";
                            $scope.msg = angularError; //  "Please Try Again";
                            $scope.showErrorOrSuccess = true;
                        });
                        $scope.finalInputJson = {
                            "session_token": null
                            , "uuid": null
                            , "route_id": ""
                            , "driver_id": ""
                            , "vehicle_id": ""
                        };
                    }
                } else if ($scope.readOnly == true && $scope.readOnlyVehicle == false) {
                    $scope.finalInputJson.route_id = $scope.routeArr[$scope.selectedRoute].id;
                    $scope.finalInputJson.driver_id = $scope.driverId;
                    $scope.finalInputJson.vehicle_id = $scope.vehicleArr[$scope.selectedVehicle].id;

                    if ($scope.routeArr[$scope.selectedRoute].student_count > $scope.vehicleArr[$scope.selectedVehicle].seats) {
                        $scope.infocolor = "warning fade in";
                        $scope.msg = $localStorage.config.constantMsg.seatLimitExceeded; // "Students on this route exceeds the seat limit"
                        $scope.showErrorOrSuccess = true;
                    } else {
                        apiCommunication.assignVehicle.post({}, $scope.finalInputJson, function (result) {
                            if (result.description === "assigned") {
                                $scope.infocolor = "success";
                                $scope.msg = $localStorage.config.constantMsg.vehicleAssigned; //"Vehicle Assigned"    
                                $scope.showErrorOrSuccess = true;
                                $scope.readOnly = false;
                                $scope.driverId = "";
                                $rootScope.driverId = "";
                                $scope.driverName = "";
                                $rootScope.driverName = "";
                                $scope.driverArr.pop();
                                $scope.routeArr.splice($scope.selectedRoute, 1);
                                apiCommunication.addDriverOutput.get({
                                    allDriver: 0
                                }, function (results) {
                                    if (results.driverList == undefined) {
                                        $scope.showDriverAlert = true;
                                    } else {
                                        for (var i = 0; i < results.driverList.length; i++) {
                                            $scope.driverArr.push(results.driverList[i]);
                                        }
                                        $scope.$apply;
                                        $scope.vehicleArr.splice($scope.selectedVehicle, 1);
                                        $scope.selectedDriver = -1;
                                        $scope.selectedVehicle = -1;
                                        $scope.selectedRoute = -1;
                                        $scope.vehicleNo = 'Vehicle No';
                                        $scope.routeNo = 'Route No';
                                        $scope.driverName = 'Driver Name';
                                        if ($scope.routeArr.length == 0) {
                                            $scope.showRouteAlert = true;
                                        }
                                        if ($scope.driverArr.length == 0) {
                                            $scope.showDriverAlert = true;
                                        }
                                        if ($scope.vehicleArr.length == 0) {
                                            $scope.showVehicleAlert = true;
                                        }
                                        $scope.gridOptions.unshift(result);
                                        $scope.assignVehicleValidator = true;
                                        $scope.errorRedFlagDriver = true;
                                        $scope.errorRedFlagVechile = true;
                                        $scope.errorRedFlagRoute = true;
                                        $location.search('driverId', null);
                                        $location.search('driverName', null);
                                    }

                                }, function (err) {
                                    $scope.infocolor = "warning fade in";
                                    $scope.msg = angularError; // "Please Try Again";
                                    $scope.showErrorOrSuccess = true;
                                })

                            } else if (result.description === "Internal server error") {
                                $scope.infocolor = "warning fade in";
                                $scope.msg = angularError; //"Please Try Again";
                                $scope.showErrorOrSuccess = true;
                            } else {
                                $scope.infocolor = "warning fade in";
                                $scope.msg = result.description;
                                $scope.showErrorOrSuccess = true;
                            }

                        }, function (err) {
                            $scope.infocolor = "warning fade in";
                            $scope.msg = angularError; //"Please Try Again";
                            $scope.showErrorOrSuccess = true;
                        })
                        $scope.finalInputJson = {
                            "session_token": null
                            , "uuid": null
                            , "route_id": ""
                            , "driver_id": ""
                            , "vehicle_id": ""
                        };
                    }
                } else {

                    $scope.finalInputJson.route_id = $scope.routeArr[$scope.selectedRoute].id;
                    $scope.finalInputJson.driver_id = $scope.driverArr[$scope.selectedDriver].UUID;
                    $scope.finalInputJson.vehicle_id = $scope.vehicleId;
                    if ($scope.routeArr[$scope.selectedRoute].student_count > $scope.seatCount) {
                        $scope.infocolor = "warning fade in";
                        $scope.msg = $localStorage.config.constantMsg.seatLimitExceeded //"Students on this route exceeds the seat limit";
                        $scope.showErrorOrSuccess = true;
                    } else {
                        apiCommunication.assignVehicle.post({}, $scope.finalInputJson, function (result) {
                                if (result.description === "assigned") {
                                    $scope.infocolor = "success";
                                    $scope.msg = $localStorage.config.constantMsg.vehicleAssigned; //"Vehicle Assigned";
                                    $scope.showErrorOrSuccess = true;
                                    $scope.readOnlyVehicle = false;
                                    $scope.vehicleNo = "";
                                    $rootScope.vehiclenumber = "";
                                    $scope.vehicleId = "";
                                    $rootScope.vehicleId = "";
                                    $scope.seatCount = "";
                                    $rootScope.seatCount = "";
                                    $scope.routeArr.splice($scope.selectedRoute, 1);
                                    $scope.vehicleArr.pop();
                                    apiCommunication.addVehicleOutput.get({}, function (results) {
                                        if (results.vehicles == undefined) {
                                            $scope.showVehicleAlert = true;
                                        } else {
                                            for (var i = 0; i < results.vehicles.length; i++) {
                                                if (results.vehicles[i].assigned == 0) {
                                                    $scope.vehicleArr.push(results.vehicles[i]);
                                                }
                                            }
                                            $scope.$apply;
                                            $scope.driverArr.splice($scope.selectedDriver, 1);
                                            $scope.selectedDriver = -1;
                                            $scope.selectedVehicle = -1;
                                            $scope.selectedRoute = -1;
                                            $scope.vehicleNo = 'Vehicle No';
                                            $scope.routeNo = 'Route No';
                                            $scope.driverName = 'Driver Name';
                                            if ($scope.routeArr.length == 0) {
                                                $scope.showRouteAlert = true;
                                            }
                                            if ($scope.driverArr.length == 0) {
                                                $scope.showDriverAlert = true;
                                            }
                                            if ($scope.vehicleArr.length == 0) {
                                                $scope.showVehicleAlert = true;
                                            }
                                            $scope.gridOptions.unshift(result);
                                            $scope.assignVehicleValidator = true;
                                            $scope.errorRedFlagDriver = true;
                                            $scope.errorRedFlagVechile = true;
                                            $scope.errorRedFlagRoute = true;

                                        }

                                    }, function (err) {
                                        $scope.infocolor = "warning fade in";
                                        $scope.msg = angularError; // "Please Try Again";
                                        $scope.showErrorOrSuccess = true;
                                    })

                                } else if (result.description === "Internal server error") {
                                    $scope.infocolor = "warning fade in";
                                    $scope.msg = angularError; //"Please Try Again";
                                    $scope.showErrorOrSuccess = true;
                                } else {
                                    $scope.infocolor = "warning fade in";
                                    $scope.msg = result.description;
                                    $scope.showErrorOrSuccess = true;
                                }

                            }
                            , function (err) {
                                $scope.infocolor = "warning fade in";
                                $scope.msg = angularError; //"Please Try Again";
                                $scope.showErrorOrSuccess = true;
                            });
                        $scope.finalInputJson = {
                            "session_token": null
                            , "uuid": null
                            , "route_id": ""
                            , "driver_id": ""
                            , "vehicle_id": ""
                        };
                    }
                }
            }
        } else {
            $scope.infocolor = "warning fade in";
            $scope.msg = angularError; // "Try Again";
            $scope.showErrorOrSuccess = true;
        }
        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AssignvehicleCtrl
         * @description:This function is used to get all the assigned vehicles
         * Return:null
         * Params:null
         */
        $scope.getAssignedVehicles = function () {
            $rootScope.driverId = "";
            $rootScope.driverName = "";
            $rootScope.vehiclenumber = "";
            $rootScope.vehicleId = "";
            $rootScope.seatCount = "";
            apiCommunication.getAssignedVehicles.get({}, function (result) {
                if (result.assignedVehicles == undefined || result.assignedVehicles.length == 0) {
                    $scope.infocolor = "warning fade in";
                    $scope.msg = $localStorage.config.constantMsg.vehicleNotFound; //"No Assigned Vehicles Found";
                    $scope.showErrorOrSuccess = true;
                } else {
                    for (var i = 0; i < result.assignedVehicles.length; i++) {
                        $scope.gridOptions.push(result.assignedVehicles[i]);
                    }
                }
            }, function (err) {
                $scope.infocolor = "warning fade in";
                $scope.msg = angularError; //"Please Try Again";
                $scope.showErrorOrSuccess = true;
            })
        }
    });