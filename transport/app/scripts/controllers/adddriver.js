'use strict';

/**
 * @ngdoc function //$scope,$localStorage $location, $uibModal, $window, apiCommunication,$rootScope',userTokenInfo
 * @name transportApp.controller:AdddriverCtrl
 * @description
 * # AdddriverCtrl
 * Controller of the transportApp
 */
angular.module('transportApp')
    .controller('AdddriverCtrl', function ($scope,$localStorage, $location, $uibModal, $window, apiCommunication,$rootScope,userTokenInfo) {
        this.awesomeThings = [
      'HTML5 Boilerplate'
            , 'AngularJS'
            , 'Karma'
    ];
        var angularError = $localStorage.config.constantMsg.angularError;
        $scope.addBtn = true;
        $scope.imgsrcShow = false;
        $scope.confimationPopupInfo = {
            "Title": "Delete",
            "Message":  $localStorage.config.constantMsg.removeDriverConfirmation,  //"Are you sure want to delete selected driver?",
            "okButton": "Yes",
            "cancelButton": "No"
        }
        $scope.confimationeditPopupInfo = {
            "Title": "Update",
            "Message":  $localStorage.config.constantMsg.updateDriverConfirmation, //"Are you sure want to update selected driver?",
            "okButton": "Yes",
            "cancelButton": "No"
        }
        $scope.$parent.showStoppageStudents = false;
        $scope.indexForUpdate;
        $scope.show = false;
        $scope.infocolor;
        $scope.gridOptions = [];
        $scope.alerts = [
            {
                type: 'error',
                msg: $localStorage.config.constantMsg.Mobile_no,  //  globalConfig.constantMsg.Mobile_no,
                show: false
            }
  ];
        $scope.attachments = [];
        $scope.finalInputJson = {
            "driver_name": "",
            "mobile_no": "",
            "licence": ""
        };

        $scope.driverinfo = {
            "name": "",
            "mobile": ''
        };


        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.clearField = function () {
            $scope.alerts[0].show = false;
            $scope.show = false;
        };


        $scope.displayLicence = function (value) {
            console.log(value.licence);
            console.log("http://apptesting.fliplearn.com:3003/"+value.licence)
            $window.open("http://apptesting.fliplearn.com:3003/"+value.licence, '_blank');
        }

        $scope.limitKeypress = function ($event, value, maxLength) {
              if($event.which >= 48 && $event.which <= 57 || ($event.which == 8 || $event.which == 46)) {
                   if ($event.which == 8 || $event.which == 46) {
                    return false;
                } else if (value != undefined && value.toString().length >= maxLength) {
                    $event.preventDefault();
                }
            }
            else{
                 $event.preventDefault();
            }
            }
            /**
             * @Author: Himanshu Bhatti
             * @ngdoc function
             * @name transportApp.controller:AddvehiclesCtrl
             * @description:This function is used remove selected driver from grid
             * Return:null
             * Params:null
             */
        $scope.removeDriver =
            function (value) {
                $scope.size = ($scope.gridOptions.length) / 30 - 43;
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

                        delete value.$$hashKey;
                        var ide = $scope.gridOptions.indexOf(value);
                        $scope.driver_id = value.UUID
                        apiCommunication.deleteDriver.post({}, {
                            "driver_id": $scope.driver_id
                        }, function (result) {
                            if (result.statusCode == 1005 || result.statusCode == 1001) {

                                $scope.infocolor = 'warning'

                                $scope.msg = result.description;
                                $scope.show = true;
                            } else if (result.statusCode == 1006) {
                                $scope.infocolor = 'success'
                                $scope.msg = result.description;
                                $scope.show = true;
                                $scope.gridOptions.splice(ide, 1);
                            }
                            $scope.driverinfo.name = ""
                            $scope.driverinfo.mobile = ""
                            $scope.driverinfo.licence = ""
                            $scope.editBtn = false;
                            $scope.resetBtn = false;
                            $scope.addBtn = true;
                            $scope.imgsrcShow = false;
                        }, function (err) {

                        })


                    }
                    //$scope.selected = selectedItem;
                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to redirect to assign bus page to assigning a bus to the driver
         * Return:null
         * Params:null
         */
        $scope.assignBus =
            function (value) {
                $rootScope.driverId = value.UUID;
                $rootScope.driverName = value.first_name;
                $location.path('/assignVehicle');

            };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to edit the information of an existing driver
         * Return:null
         * Params:null
         */
        $scope.editDriver =
            function (value) {
                angular.element("#driverName").focus();
                $scope.show = "";
                $scope.indexForUpdate = $scope.gridOptions.indexOf(value);
                if (!value.licence) {
                    $scope.driverinfo.licence = ''
                    $scope.editBtn = true;
                    $scope.resetBtn = true;
                    $scope.addBtn = false;
                    $scope.imgsrcShow = false;
                    $scope.driverinfo.name = value.first_name;
                    $scope.driverinfo.mobile = value.mobile_number;
                    $scope.route_no=value.route_no;
                     $scope.login_id=value.login_id;
                } else {
                    $scope.editBtn = true;
                    $scope.resetBtn = true;
                    $scope.addBtn = false;
                    $scope.imgsrcShow = true;
                    $scope.driverinfo.name = value.first_name;
                    $scope.driverinfo.mobile = value.mobile_number;
                    $scope.driverinfo.licence = value.licence;
                    $scope.route_no=value.route_no;
                     $scope.login_id=value.login_id;
                }

            };
        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is reset all field and change button to add
         * Return:null
         * Params:null
         */
        $scope.resetDriverInfo = function () {
                $scope.driverinfo.name = ""
                $scope.driverinfo.mobile = ""
                $scope.driverinfo.licence = ""
                $scope.editBtn = false;
                $scope.resetBtn = false;
                $scope.addBtn = true;
                $scope.imgsrcShow = false;
            }
            /**
             * @Author: Himanshu Bhatti
             * @ngdoc function
             * @name transportApp.controller:AddvehiclesCtrl
             * @description:This function is used add a new driver or update an existing driver
             * Return:null
             * Params:null
             */

        $scope.addDriverInfo = function () {
            if ($scope.mimetype != 'image/png' && $scope.mimetype != 'image/jpg' && $scope.mimetype != 'image/jpeg' && $scope.mimetype != undefined) {
                $scope.infocolor = 'warning'
                $scope.msg = $localStorage.config.constantMsg.wrongFileExtension ; // "File type not valid"
                $scope.show = true;
                $scope.driverinfo = {
                    "name": "",
                    "mobile": ""
                };
                $scope.attachments = [];
                document.getElementById('driverImage').value = "";
                $scope.photo = "";
                $scope.mimetype = undefined;
            } else {
                for (var i = 0; i < $scope.gridOptions.length; i++) {
                    if ($scope.gridOptions[i].mobile_number == $scope.driverinfo.mobile) {
                        $scope.show = false;
                        $scope.alerts[0].show = true;
                        return
                    }
                }
                 var str=$scope.driverinfo.name
                $scope.driverName=str.replace(/^[ ]+|[ ]+$/g,'');
                // if ($scope.gridOptions.length == 0) {
                var headers = {
                    'Content-Type': undefined,
                    session_token: userTokenInfo.getUserToken(),
                        uuid: userTokenInfo.getUserUuid(),
                    driver_name: $scope.driverName,
                    mobile_no: parseInt($scope.driverinfo.mobile)
                };
                var file = $scope.attachments[0];
                apiCommunication.uploadSingleFile(file, headers).success(function (fdata) {
                    if (fdata.statusCode == 1005 || fdata.statusCode == 1001 || fdata.statusCode == 1004 || fdata.statusCode == 1002) {
                        $scope.infocolor = 'warning'
                        $scope.msg = fdata.description;
                        $scope.show = true;
                    } else if (fdata.statusCode == 1006) {
                        $scope.infocolor = 'success'
                        $scope.msg = fdata.description;
                        $scope.show = true;
                        $scope.gridOptions.push(fdata);
                        //console.log($scope.gridOptions);
                        //$scope.getAvailableDrivers();
                    }

                });
                $scope.driverinfo = {
                    "name": "",
                    "mobile": "",
                    "licence": ""
                };
                document.getElementById('driverImage').value = "";
                $scope.attachments = [];
                $scope.photo = "";
                $scope.mimetype = undefined;

            }
        };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used edit the driver information after consuming API
         * Return:null
         * Params:null
         */
        $scope.editDriverInfo = function (value) {
            if ($scope.mimetype != 'image/png' && $scope.mimetype != 'image/jpg' && $scope.mimetype != 'image/jpeg' && $scope.mimetype != undefined) {
                $scope.infocolor = 'warning'
                $scope.msg =   $localStorage.config.constantMsg.wrongFileExtension ; //"File type not valid"
                $scope.show = true;
                $scope.driverinfo = {
                    "name": "",
                    "mobile": ""
                };
                $scope.imgsrcShow = false;
                $scope.addBtn = true;
                $scope.editBtn = false;
                $scope.resetBtn = false;
                $scope.attachments = [];
                document.getElementById('driverImage').value = "";
                $scope.photo = "";
                $scope.mimetype = undefined;
            } else {

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '../views/deletePopup.html',
                    controller: 'deleteConfirmCtrl',
                    size: "sm",
                    resolve: {
                        items: function () {
                            return $scope.confimationeditPopupInfo;
                        }
                    }
                });

                modalInstance.result.then(function (status) {
                    if (status) {
                        var str1=$scope.driverinfo.name
                    $scope.driverupdatedName=str1.replace(/^[ ]+|[ ]+$/g,'');
                        var headers = {
                            'Content-Type': undefined,
                            session_token: userTokenInfo.getUserToken(),
                        uuid: userTokenInfo.getUserUuid(),
                            driver_name: $scope.driverupdatedName,
                            mobile_no: parseInt($scope.driverinfo.mobile),
                            licence: $scope.driverinfo.licence,
                            driver_id: $scope.gridOptions[$scope.indexForUpdate].UUID,
                            route_no:$scope.route_no,
                            login_id:$scope.login_id
                        };
                        var file = $scope.attachments[0];
                        apiCommunication.edituploadSingleFile(file, headers).success(function (fdata) {
                            $scope.addBtn = true;
                            $scope.editBtn = false;
                            $scope.resetBtn = false;
                            if (fdata.statusCode == 1005 || fdata.statusCode == 1001 || fdata.statusCode == 1004 || fdata.statusCode == 1002) {
                                $scope.infocolor = 'warning'
                                $scope.msg = fdata.description;
                                $scope.show = true;
                            } else if (fdata.statusCode == 1006) {
                                $scope.infocolor = 'success'
                                $scope.msg = fdata.description;
                                $scope.show = true;
                                $scope.gridOptions[$scope.indexForUpdate] = fdata;
                            }

                        });
                        $scope.driverinfo = {
                            "name": "",
                            "mobile": "",
                            "licence": ""
                        };
                        $scope.imgsrcShow = false;
                        document.getElementById('driverImage').value = "";
                        $scope.attachments = [];
                        $scope.photo = "";
                        $scope.mimetype = undefined;



                    }
                    //$scope.selected = selectedItem;
                }, function () {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
            }
        };
        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used remove the currently uploaded image for driver liscence
         * Return:null
         * Params:null
         */
        $scope.removecurrentImage = function () {
            $scope.driverinfo.licence = "";
            $scope.imgsrcShow = false;
        }

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used add image for driver liscence
         * Return:null
         * Params:null
         */
        $scope.attachments = [];
        $scope.file_changed = function (e) {
            $scope.attachments[0] = e.files[0];
            $scope.photo = e.files[0];
            $scope.mimetype = e.files[0].type;
            $scope.$apply();
        };

        /**
         * @Author: Himanshu Bhatti
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to get all the drivers
         * Return:null
         * Params:null
         */
        $scope.getAvailableDrivers = function () {
            apiCommunication.addDriverOutput.get({
                allDriver: 1
            }, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    for (var i = 0; i < result.driverList.length; i++) {
                        $scope.gridOptions.push(result.driverList[i]);
                    }
                }


            }, function (err) {

            })
        }
    });