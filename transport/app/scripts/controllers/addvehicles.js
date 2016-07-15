'use strict';

/**
 * @ngdoc function
 * @name transportApp.controller:AddvehiclesCtrl
 * @description
 * # AddvehiclesCtrl
 * Controller of the transportApp
 */
angular.module('transportApp')
    .controller('AddvehiclesCtrl', function ($scope, $localStorage, $location, apiCommunication, $uibModal, $rootScope) {
        this.awesomeThings = [
      'HTML5 Boilerplate'


            , 'AngularJS'


            , 'Karma'
    ];
        $scope.confimationPopupInfo = {
            "Title": "Delete",
            "Message": $localStorage.config.constantMsg.removeVehicleConfirmation //"Are you sure want to delete selected Item?"
                ,
            "okButton": "Yes",
            "cancelButton": "No"
        }
        $scope.confimationPopupInfoUpdate = {
            "Title": "update",
            "Message": $localStorage.config.constantMsg.updateVehicleConfirmation //"Are you sure want to update selected vehicle?"
                ,
            "okButton": "Yes",
            "cancelButton": "No"
        }
        $scope.$parent.showStoppageStudents = false;
        $scope.btnLabel = 'Add Vehicle';
        $scope.indexForUpdate;
        $scope.gridOptions = [];
        $scope.vehicleTypeArr = [];
        $scope.showMessage = false;
        var angularError = $localStorage.config.constantMsg.angularError;

        $scope.finalInputJson = {
            "session_token": null,
            "uuid": null,
            "vehicle_type_id": null,
            "vehicle_no": "",
            "seats": ""
        };

        $scope.vehicleinfo = {
            "typeId": null,
            "vehicleNo": "",
            "seats": ""
        };

        $scope.limitKeypress = function ($event, value, maxLength) {
            if ($event.keyCode == 8 || $event.keyCode == 46) {
                return false;
            } else if (value != undefined && value.toString().length >= maxLength) {
                $event.preventDefault();

            }

        }


        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to edit the information of an existing vehicle
         * Return:null
         * Params:null
         */
        $scope.editVehicle =
            function (value) {
                angular.element('#vehicleName').focus();
                $scope.indexForUpdate = $scope.gridOptions.indexOf(value)
                $scope.btnLabel = 'Update Vehicle'
                delete value.$$hashKey;
                for(var i=0; i<$scope.vehicleTypeArr.length; i++)
                    {
                        if($scope.vehicleTypeArr[i].id==value.vehicle_type_id){
                            $scope.vehicleinfo.typeId = $scope.vehicleTypeArr[i];
                            $scope.vehicleinfo.vehicleNo = value.vehicle_no;
                            $scope.vehicleinfo.seats = value.seats;
                        }
                    }
               
                
            };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used add a new vehicle or update an existing vehicle
         * Return:null
         * Params:null
         */
        $scope.addVehicleInfo = function () {
            if ($scope.btnLabel == 'Add Vehicle') {
                $scope.finalInputJson.vehicle_type_id = $scope.vehicleinfo.typeId.id;
                $scope.finalInputJson.vehicle_no = $scope.vehicleinfo.vehicleNo;
                $scope.finalInputJson.seats = $scope.vehicleinfo.seats;
                apiCommunication.addVehicle.post({}, $scope.finalInputJson, function (result) {
                    if (!result.id) {
                        $scope.infocolor = 'warning'
                        $scope.msg = result.description
                        $scope.showMessage = true;
                    } else {

                        $scope.infocolor = 'success'
                        $scope.msg = result.description
                        $scope.showMessage = true;

                        $scope.gridOptions.unshift(result);
                    }
                }, function (err) {
                    $scope.infocolor = 'warning'
                    $scope.msg = angularError;
                    $scope.showMessage = true;

                })

                $scope.vehicleinfo = {
                    "name": "",
                    "vehicleNo": "",
                    "seats": ""
                };
            } else {

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '../views/deletePopup.html',
                    controller: 'deleteConfirmCtrl',
                    size: "sm",
                    resolve: {
                        items: function () {
                            return $scope.confimationPopupInfoUpdate;
                        }
                    }
                });

                modalInstance.result.then(function (status) {
                    if (status) {
                        var updateInfo = {
                            "vehicle_id": $scope.gridOptions[$scope.indexForUpdate].id,
                            "vehicle_type_id": $scope.vehicleinfo.typeId.id,
                            "vehicle_no": $scope.vehicleinfo.vehicleNo,
                            "seats": $scope.vehicleinfo.seats
                        };
                        apiCommunication.updatevehicle.post({}, updateInfo, function (result) {
                            if (!result.id) {
                                $scope.infocolor = 'warning'
                                $scope.msg = result.description
                                $scope.showMessage = true;
                            } else {

                                $scope.infocolor = 'success'
                                $scope.msg = result.description
                                $scope.showMessage = true;

                                $scope.gridOptions[$scope.indexForUpdate] = result;

                            }
                        }, function (err) {
                            $scope.infocolor = 'warning'
                            $scope.msg = angularError;
                            $scope.showMessage = true;

                        })
                        $scope.vehicleinfo = {
                            "name": "",
                            "vehicleNo": "",
                            "seats": ""
                        };
                        $scope.btnLabel = 'Add Vehicle';

                    }

                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });



            }
        };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to get all the vehicles
         * Return:null
         * Params:null
         */
        $scope.getAvailableVehicles = function () {
            apiCommunication.addVehicleOutput.get({}, function (result) {
                if (!result.vehicles) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description
                    $scope.showMessage = true;
                } else {
                    for (var i = 0; i < result.vehicles.length; i++) {
                        $scope.gridOptions.push(result.vehicles[i]);
                    }
                }

            }, function (err) {
                $scope.infocolor = 'warning'
                $scope.msg = angularError;
                $scope.showMessage = true;

            })
            
            
            apiCommunication.getVehicleType.get({}, function (result) { 
                if (!result.vehicleTypes) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description
                    $scope.showMessage = true;
                } else {
                    for (var i = 0; i < result.vehicleTypes.length; i++) {
                        $scope.vehicleTypeArr.push(result.vehicleTypes[i]);
                    }
                }

            }, function (err) {
                $scope.infocolor = 'warning'
                $scope.msg = angularError;
                $scope.showMessage = true;

            })
            
            
        }


        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to open popup for delete
         * Return:vehicle_id
         * Params:null
         */

        $scope.removeVehicle = function (value) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '../views/deletePopup.html',
                controller: 'deleteConfirmCtrl',
                size: "sm",
                resolve: {
                    items: function () {
                        return $scope.confimationPopupInfo;
                    }
                }
            });

            modalInstance.result.then(function (status) {
                if (status) {



                    var temp = {
                        "vehicle_id": value.id,
                        "school_id": value.school_id
                    };
                    apiCommunication.removeVehicle.post({}, temp, function (result) {
                        if (result.description === "vehicle deleted") {

                            $scope.infocolor = 'success'
                            $scope.msg = result.description
                            $scope.showMessage = true;

                            $scope.vehicleinfo = {
                                "name": "",
                                "vehicleNo": "",
                                "seats": ""
                            };
                            $scope.btnLabel = 'Add Vehicle';
                            var ide = $scope.gridOptions.indexOf(value);
                            $scope.gridOptions.splice(ide, 1);

                        } else {
                            $scope.infocolor = 'warning'
                            $scope.msg = result.description
                            $scope.showMessage = true;
                        }

                    }, function (err) {
                        $scope.infocolor = 'warning'
                        $scope.msg = angularError;
                        $scope.showMessage = true;

                    })
                }
            }, function () {

            });
        };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to clear the response message
         * Return:null
         * Params:null
         */

        $scope.clearMessage = function () {
            $scope.showMessage = false;
        };

        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to assign vehicle to driver
         * Return:vehicle_id
         * Params:null
         */

        $scope.assignDriver = function (value) {
            $scope.finalInputJson.vehicle_type_id = value.vehicle_type_id;
            $scope.finalInputJson.vehicle_no = value.vehicle_no;
            $scope.finalInputJson.seats = value.seats;
            $rootScope.vehiclenumber = value.vehicle_no;
            $rootScope.vehicleId = value.id;
            $rootScope.seatCount = value.seats;
            //$rootScope.hello = value.seats;
            $location.path('/assignVehicle');

        };

    });