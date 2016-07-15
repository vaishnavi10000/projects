'use strict';

/**
 * @Author: Abhishek Arora
 * @ngdoc function
 * @name transportApp.controller:CreaterouteCtrl
 * @description
 * # CreaterouteCtrl
 * Controller of the transportApp
 */
angular.module('transportApp')
    .controller('CreaterouteCtrl', function ($scope, NgMap, $location, apiCommunication, $timeout, $rootScope, $uibModal, $filter, $sessionStorage, $anchorScroll) {
        $scope.confimationPopupInfo = {
            "Title": "Delete",
            "Message": "Are you sure want to delete selected Route?",
            "okButton": "Yes",
            "cancelButton": "No"
        };
        $scope.confimationStopPopupInfo = {
            "Title": "Delete",
            "Message": "Are you sure want to delete selected Stop?",
            "okButton": "Yes",
            "cancelButton": "No"
        };
        $scope.UpdateRoutePopupInfo = {
            "Title": "Update",
            "Message": "Are you sure want to update selected route?",
            "okButton": "Yes",
            "cancelButton": "No"
        };
        $scope.UpdateStopaggePopupInfo = {
            "Title": "Update",
            "Message": "Are you sure want to update selected stoppage?",
            "okButton": "Yes",
            "cancelButton": "No"
        };

        $scope.isStoppageEdit = false;
        $scope.minLength = 3;

        //reset variable
        $scope.resetValue = true;
        $scope.selectedId = '';
        $scope.onstopAdd = false;

        $scope.isStoppageSave = true;

        $scope.btnLabel = 'Save';
        $scope.buttonName = "Create";
        $scope.availableRoutes = [];
        $scope.grid = [];
        $scope.indexForUpdate;
        $scope.geocoder = new google.maps.Geocoder();
        $scope.checked = false;
        var editStoppageData;
        var selectedEditRoute;

        $scope.routeAdd = { //Input JSON for routes
            "session_token": null,
            "uuid": null,
            "start_location": "",
            "end_location": "",
            "route_no": "",
            "seats": "",
            "student_count": ""

        }
        $scope.stopAdd = {
            "stoppage_name": "",
            "lat": "",
            "long": "",
            "order_no": "",
            "route_id": ""
        }

        $scope.changeLocation = function () {

            if ($scope.stopAdd.stoppage_name != "") {
                $scope.stopAdd.lat = "";
                $scope.stopAdd.long = "";
            }
        }

        $scope.changeAddress = function () {
            if ($scope.stopAdd.lat != "" || $scope.stopAdd.long != "") {
                $scope.stopAdd.stoppage_name = "";
            }

        }


        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is used fetch the address when we drag map marker
         * Return:null
         * Params:null
         */

        $scope.dragEnd = function (evt) {
            //for hiding messages on change of marker
            $scope.addStoppageMsg = false;
            $scope.removeRouteMsg = false;

            var curLatlong = JSON.stringify(evt);
            curLatlong = JSON.parse(curLatlong);
            $scope.stopAdd.lat = curLatlong.latLng.lat;
            $scope.stopAdd.long = curLatlong.latLng.lng;
            $scope.centerLat = curLatlong.latLng.lat;
            $scope.centerLong = curLatlong.latLng.lng
            $scope.geocoder.geocode({
                'latLng': curLatlong.latLng
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        $scope.stopAdd.stoppage_name = results[0].formatted_address;
                        $scope.$apply();
                    } else {
                        console.log('Location not found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
        }



        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is used fetch the address for latitude and longitude
         * Return:null
         * Params:null
         */
        $scope.fetchLatLong = function () {
            $scope.geocoder.geocode({
                'address': $scope.stopAdd.stoppage_name
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    $scope.latitude = results[0].geometry.location.lat();
                    $scope.longitude = results[0].geometry.location.lng();
                    $scope.stopAdd.lat = $scope.latitude;
                    $scope.stopAdd.long = $scope.longitude;
                    $scope.$apply();
                } else {
                    alert("No lat long available");
                }
            });
        }

        /**
         * @Author: Abhishek Arora
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is used fetch the latitude and longitude for address.
         * Return:null
         * Params:null
         */
        /* 
                $scope.fetchAddress = function () {
                    $scope.LatLng = {
                        "lat": "",
                        "lng": ""
                    }
                    $scope.LatLng.lat = Number($scope.stopAdd.lat);
                    $scope.LatLng.lng = Number($scope.stopAdd.long);
                    $scope.geocoder.geocode({
                        'latLng': $scope.LatLng
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                $scope.stopAdd.stoppage_name = results[0].formatted_address;
                                $scope.$apply();
                            } else {
                                console.log('Location not found');
                            }
                        } else {
                            console.log('Geocoder failed due to: ' + status);
                        }
                    });
                } */



        /**
         * @Author: Vaishnavi
         * @name transportApp.controller:CreateRouteCtrl
         * @description: This function resets route form values
         * Return:null
         * Params:null
         */

        $scope.resetRoute = function () {
            //for hiding  div
            $scope.routeMessage = false;
            $scope.addStoppageMsg = false;
            $scope.removeRouteMsg = false;

            $scope.checked = false;
            $scope.routeAdd.start_location = null;
            $scope.routeAdd.end_location = null;
            $scope.routeAdd.route_no = null;

            $scope.stopAdd.stoppage_name = null;
            $scope.stopAdd.lat = null;
            $scope.stopAdd.long = null;

            $scope.resetValue = true;

            $scope.isStoppageEdit = false;
            $scope.isStoppageSave = true;
            $scope.selectedId = null;

            $scope.onstopAdd = false;

            $scope.grid = []
            $scope.isUpdateEnable = true;
        }



        /**
         * @Author: Vaishnavi
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is create input Json for routes
         * Return:null
         * Params:null
         */

        $scope.routeList = [];
        $scope.addRoute = function () {
            if ($scope.routeAdd.start_location == $scope.routeAdd.end_location) {
                $scope.routeMessage = true;
                $scope.infoColor = "danger";
                $scope.mes = "Start and end location cannot be same";
            } else {
                $scope.resetValue = false;
                //for hiding  div
                $scope.routeMessage = false;
                $scope.addStoppageMsg = false;
                $scope.removeRouteMsg = false;

                $scope.stopAdd.route_id = $scope.selectedRouteId;
                $scope.routeMessage = false;
                if ($scope.checked == false) {
                    $scope.checked = true;
                    $scope.buttonName = "Create"
                }
                if ($scope.checked == true) {
                    var routeExists = 0;

                    if ($scope.routeList.length != 0) {
                        for (var i = 0; i < $scope.routeList.length; i++) {
                            if ($scope.routeAdd.route_no == $scope.routeList[i].route_no) {
                                $scope.routeAdd.route_no = null;
                                $scope.form1.$invalid = false;
                                $scope.checked = false;
                                $scope.routeMessage = true;
                                $scope.infoColor = "danger";
                                $scope.mes = "Route no. already exists"
                                routeExists = 1;
                            }
                        }
                    } else {
                        $scope.routeMessage = true;
                        $scope.infoColor = "danger";
                        $scope.mes = "No routes available"
                    }

                    if (routeExists == 0) {
                        apiCommunication.routeNo.post({}, $scope.routeAdd, function (result) {
                            if (result.statusCode == 1002) {
                                $scope.checked = false;
                                $scope.buttonName = "Create";
                                $scope.routeMessage = true;
                                $scope.infoColor = "danger";
                                $scope.mes = result.description
                            } else if (result.statusCode == 1001) {
                                $scope.routeMessage = true;
                                $scope.infoColor = "danger";
                                $scope.mes = result.description
                            } else if (result.statusCode == 1007) {
                                $scope.routeMessage = true;
                                $scope.infoColor = "danger";
                                $scope.mes = result.description;
                            } else {
                                //$scope.form1.$invalid = true;
                                $scope.checked = true;
                                $scope.routeMessage = true;
                                $scope.infoColor = "success";
                                $scope.mes = result.description;
                                $scope.routeAdd.seats = result.seats;
                                $scope.routeAdd.student_count = result.student_count;
                                var str = JSON.stringify(result);
                                var resultObj = JSON.parse(str);
                                resultObj["student_count"] = 0
                                $scope.routeList.unshift(resultObj);
                                $scope.selectedId = result.route_id;
                                $scope.availableRoutes.unshift(result);
                            }

                        }, function (err) {
                            console.log(err)
                        });
                    }
                }
            }

        }

        /**
         * @Author: Abhishek Arora
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to redirect to add student with route no, route_id, stoppage_id and stoppage name
         * Return:null
         * Params:null
         */
        $scope.addStudent =
            function (value, route) {
                var ide = $scope.grid.indexOf(value);
                /*   $location.path('/addStudent/' + value.route_id + '/' + $scope.grid1.route_no + '/' + value.stoppage_id + '/' + value.stoppage_name);*/
                $sessionStorage.sessionObject = route;
                $location.path('/addStudent/' + value.route_id + '/' + $scope.routeAdd.route_no + '/' + value.id + '/' + value.stoppage_name);
            }

        /**
         * @Author: Vaishnavi
         * @name transportApp.controller:DriverinfonavigationctrlCtrl
         * @description: This function is used create input JSON for stoppage
         * Return:null
         * Params:null
         */
        $scope.addAddress = function () {
            //for hiding  div
            $scope.routeMessage = false;
            $scope.addStoppageMsg = false;
            $scope.removeRouteMsg = false;
            $scope.items = $filter('filter')($scope.grid, {
                "stoppage_name": $scope.stopAdd.stoppage_name
            });
            if ($scope.items.length == 0) {
                /*$scope.stopAdd.route_id = $scope.selectedRouteId;*/
                $scope.stopAdd.route_id = $scope.selectedId;
                apiCommunication.addStop.post({}, $scope.stopAdd, function (result) {

                    if (result.statusCode == 1001) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "danger";
                    } else if (result.statusCode == 1006) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "success";
                        if ($scope.buttonName == "Create") {
                            $scope.grid.unshift({
                                "stoppage_name": $scope.stopAdd.stoppage_name,
                                "lat": $scope.stopAdd.lat,
                                "long": $scope.stopAdd.long,
                                "id": result.stoppage_id,
                                "route_id": result.route_id
                            });
                        }



                        //to clear all fields
                        $scope.stopAdd.stoppage_name = null;
                        $scope.stopAdd.lat = null;
                        $scope.stopAdd.long = null;
                    } else if (result.statusCode == 1007) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "warning";
                    }

                });
            } else {
                $scope.addStoppageMsg = true;
                $scope.msg = "Stoppage Already Exists";
                $scope.infoColor = "danger";
            }
        };

        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to open popup for delete
         * Return:true
         * Params:null
         */
        $scope.removeStop = function (value) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '../views/deletePopup.html',
                controller: 'deleteConfirmCtrl',
                size: "sm",
                resolve: {
                    items: function () {
                        return $scope.confimationStopPopupInfo;
                    }
                }
            });
            modalInstance.result.then(function (status) {
                    if (status) {
                        apiCommunication.deleteStoppage.post({}, {
                            stop_id: value.id
                        }, function (result) {
                            if (result.statusCode == 1001) {
                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "danger";
                            } else if (result.statusCode == 1006) {
                                delete value.$$hashKey;
                                var ide = $scope.grid.indexOf(value);
                                $scope.grid.splice(ide, 1);
                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "success";
                            } else if (result.statusCode == 1007) {
                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "danger";
                            } else if (result.statusCode == 1002) {
                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "danger";
                            } else {
                                $scope.addStoppageMsg = true;
                                $scope.msg = "Please Try Again";
                                $scope.infoColor = "danger";
                            }
                        });
                    }
                },
                function () {});
        };

        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used fetch all routes
         * Return:null
         * Params:null
         */

        $scope.RouteTable = function () {
            apiCommunication.routeList.get({}, function (result) {
                if (result.routeList != undefined) {
                    for (var a = 0; a < result.routeList.length; a++) {
                        $scope.routeList.unshift(result.routeList[a])
                    }
                }
            });
        };
        $scope.RouteTable();

        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is to add stoppage from selected route from route table
         * Return:null
         * Params:null
         */
        $scope.addStoppages = function (route) {

            $anchorScroll('createStoppageHeading');
            $scope.resetRoute();
            //$scope.form1.$invalid = true
            $scope.editValue = true;
            //$scope.selectedId=false;
            //$scope.form1.$invalid = true;
            $scope.resetValue = false;
            $scope.submitValue = true;
            $scope.checked = true;
            $scope.onstopAdd = false;

            $scope.isStoppageSave = true;
            $scope.isStoppageEdit = false;

            //for hiding  div
            $scope.routeMessage = false;
            $scope.addStoppageMsg = false;
            $scope.removeRouteMsg = false;


            $scope.routeAdd.start_location = route.start_location;
            $scope.routeAdd.end_location = route.end_location;
            $scope.routeAdd.route_no = route.route_no;
            $scope.routeAdd.seats = route.seats;
            $scope.routeAdd.student_count = route.student_count;
            if (route.id) {
                $scope.selectedId = route.id;
            } else if (route.route_id) {
                $scope.selectedId = route.route_id;
            }

            apiCommunication.stoppageInfo.get({
                route_id: $scope.selectedId
            }, function (result) {
                $scope.grid = [];
                if (result.statusCode == 1002) {
                    $scope.addStoppageMsg = false;
                    for (var i = 0; i < result.stopage.length; i++) {
                        $scope.grid.push(result.stopage[i]);
                    }
                } else if (result.statusCode == 1005) {
                    $scope.addStoppageMsg = true;
                    $scope.msg = result.description;
                    $scope.infoColor = "success";
                    $scope.grid = []
                } else if (result.statusCode == 1001) {
                    $scope.addStoppageMsg = true;
                    $scope.msg = result.description;
                    $scope.infoColor = "danger";
                    $scope.grid = []
                } else if (result.statusCode == 1007) {
                    $scope.addStoppageMsg = true;
                    $scope.msg = result.description;
                    $scope.infoColor = "danger";
                    $scope.grid = []
                } else {
                    $scope.addStoppageMsg = true;
                    $scope.msg = "Please try again!";
                    $scope.infoColor = "danger";
                    $scope.grid = []
                }

            }, function (err) {
                console.log(err)
            });
        }


        /**
         * @Author: Vaishnavi
         * @ngdoc function
         * @description:This function removes route from route table and database.
         * Return:null
         * Params:null
         */
        $scope.removeRoute = function (route) {

            if (route.id) {
                $scope.selectedRouteId = route.id;
            } else if (route.route_id) {
                $scope.selectedRouteId = route.route_id;
            }
            //for hiding  div
            $scope.routeMessage = false;
            $scope.addStoppageMsg = false;
            $scope.removeRouteMsg = false;

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
                    angular.element("#msgBox").focus();
                    $scope.resetRoute();
                    apiCommunication.removeRoute.post({}, {
                        route_id: $scope.selectedRouteId
                    }, function (result) {
                        if (result.statusCode == 1001) {
                            $scope.removeRouteMsg = true;
                            $scope.msg = result.description;
                            $scope.infoColor = "danger";
                            $scope.grid = []
                        } else if (result.statusCode == 1006) {

                            if ($scope.driverInfoData.length > 0) {
                                for (var i = 0; i < $scope.driverInfoData.length; i++) {
                                    if ($scope.driverInfoData[i].route_id == $scope.selectedRouteId) {
                                        var dr = $scope.driverInfoData.splice($scope.driverInfoData.indexOf($scope.driverInfoData[i]), 1);
                                        $scope.removeRouteMsg = true;
                                        $scope.msg = result.description;
                                        $scope.infoColor = "success";
                                        $scope.routeList.splice($scope.routeList.indexOf(route), 1);
                                        $anchorScroll('removeRouteMessageAlert');
                                        return;
                                    } else if ($scope.routeList.indexOf(route) != -1) {
                                        $scope.removeRouteMsg = true;
                                        $scope.msg = result.description;
                                        $scope.infoColor = "success";
                                        $scope.routeList.splice($scope.routeList.indexOf(route), 1);
                                        $anchorScroll('removeRouteMessageAlert');
                                    } else {
                                        $scope.removeRouteMsg = true;
                                        $scope.msg = result.description;
                                        $scope.infoColor = "success";
                                        $scope.routeList.splice($scope.routeList.indexOf(route), 1);
                                        $anchorScroll('removeRouteMessageAlert');
                                    }
                                }
                            } else {
                                $scope.removeRouteMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "success";
                                $scope.routeList.splice($scope.routeList.indexOf(route), 1);
                                return;
                            }
                        } else if (result.statusCode == 1007) {
                            $scope.removeRouteMsg = true;
                            $scope.msg = result.description;
                            $scope.infoColor = "danger";
                        } else if (result.statusCode == 1002) {
                            $scope.removeRouteMsg = true;
                            $scope.msg = result.description;
                            $scope.infoColor = "danger";
                        } else {
                            $scope.removeRouteMsg = true;
                            $scope.msg = "Please Try Again";
                            $scope.infoColor = "danger";
                        }

                    });
                }
            }, function () {});
        };

        /**
         * @Author: Vaishnavi
         * @ngdoc function
         * @description:This function is used to edit route details.
         * Return:null
         * Params:route object to be edited
         */
        //$scope.editButtonEnable=false;
        $scope.editRoute = function (route) {

            $anchorScroll('createRouteHeading');
            if (route) {

                //to get stoppages on selected route to be edited
                apiCommunication.stoppageInfo.get({
                    route_id: route.id
                }, function (result) {
                    $scope.grid = [];
                    if (result.statusCode == 1002) {
                        $scope.addStoppageMsg = false;
                        for (var i = 0; i < result.stopage.length; i++) {
                            $scope.grid.push(result.stopage[i]);
                        }
                    } else if (result.statusCode == 1005) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "success";
                        $scope.grid = []
                    } else if (result.statusCode == 1001) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "danger";
                        $scope.grid = []
                    } else if (result.statusCode == 1007) {
                        $scope.addStoppageMsg = true;
                        $scope.msg = result.description;
                        $scope.infoColor = "danger";
                        $scope.grid = []
                    } else {
                        $scope.addStoppageMsg = true;
                        $scope.msg = "Please try again!";
                        $scope.infoColor = "danger";
                        $scope.grid = []
                    }

                }, function (err) {
                    console.log(err)
                });


                selectedEditRoute = route;
                $scope.resetRoute();
                $scope.isUpdateEnable = false;
                $scope.form1.$setPristine();
                $scope.checked = false
                if (route.id) {
                    $scope.selectedId = route.id;
                } else {
                    $scope.selectedId = route.route_id;
                }

                $scope.onstopAdd = true;
                //enable reset button and enable edit button
                $scope.resetValue = false;
                //$scope.form1.$invalid = true;

                angular.element("#exampleInputStart").focus();
                $scope.routeAdd.start_location = route.start_location;
                $scope.routeAdd.end_location = route.end_location;
                $scope.routeAdd.route_no = route.route_no;

                //to make text boxes editable   
                $scope.checked = false;

            } else {
                if ($scope.routeAdd.start_location == $scope.routeAdd.end_location) {

                    $scope.routeMessage = true;
                    $scope.infoColor = "warning";
                    $scope.mes = "Start and end location cannot be same";
                } else {
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: '../views/deletePopup.html',
                        controller: 'deleteConfirmCtrl',
                        size: "sm",
                        resolve: {
                            items: function () {
                                return $scope.UpdateRoutePopupInfo;
                            }
                        }
                    });
                    modalInstance.result.then(function (status) {
                        if (status) {
                            var editData = {
                                    "id": $scope.selectedId,
                                    "start_location": $scope.routeAdd.start_location,
                                    "end_location": $scope.routeAdd.end_location,
                                    "route_no": $scope.routeAdd.route_no,
                                }
                                //$scope.form1.$invalid = true;
                            $scope.checked = true;
                            apiCommunication.editRoute.post({}, editData, function (result) {


                                if (result.statusCode == 1001) {
                                    $scope.routeMessage = true;
                                    $scope.infoColor = "danger";
                                    $scope.mes = result.description
                                } else if (result.statusCode == 1002) {
                                    $scope.checked = false;
                                    $scope.routeMessage = true;
                                    $scope.infoColor = "warning";
                                    $scope.mes = result.description;
                                } else if (result.statusCode == 1007) {
                                    $scope.routeMessage = true;
                                    $scope.infoColor = "danger";
                                    $scope.mes = result.description;
                                } else if (result.statusCode == 1006) {
                                    // $scope.RouteTable();
                                    //to populate route table with updated data

                                    var index = $scope.routeList.indexOf(selectedEditRoute);
                                    for (var i = 0; i < $scope.routeList.length; i++) {
                                        if ($scope.routeList[i].id == selectedEditRoute.id) {
                                            $scope.routeList[i].start_location = result.start_location;
                                            $scope.routeList[i].end_location = result.end_location;
                                            $scope.routeList[i].route_no = result.route_no;

                                        }
                                    }

                                    //to disable once route is edited
                                    $scope.isUpdateEnable = true;

                                    //to reset pristine
                                    $scope.form1.$setPristine();
                                    $scope.checked = true;

                                    //to show success message
                                    $scope.routeMessage = true;
                                    $scope.infoColor = "success";
                                    $scope.mes = result.description;

                                    //disable edit button and enable create
                                    //$scope.selectedId = false;
                                    //$scope.form1.$invalid = false;
                                    $scope.resetValue = false;
                                    $scope.editValue = true;

                                    //disable text boxes
                                    $scope.checked = false;
                                    //$scope.selectedId=true;
                                    $scope.editButtonEnable = "true"
                                        /*$scope.routeAdd.start_location = null;
                                        $scope.routeAdd.end_location = null;
                                        $scope.routeAdd.route_no = null;*/
                                } else {
                                    $scope.routeMessage = true;
                                    $scope.infoColor = "info";
                                    $scope.mes = result.description;
                                }
                            });

                        }
                    }, function () {});
                }
            }

        };

        /**
         * @Author: Vaishnavi
         * @ngdoc function
         * @description:This function is used to edit stoppage details in a route.
         * Return:null
         * Params:stoppage object to be edited
         */
        $scope.editStoppage = function (stoppage) {
            //hide message
            $scope.addStoppageMsg = false;

            $scope.isStoppageEdit = true;
            $scope.isStoppageSave = false;

            if (stoppage) {
                $anchorScroll("createStoppageHeading")
                editStoppageData = stoppage;
                $scope.form.$invalid = true;

                //to fill textbox with edit data
                $scope.stopAdd.stoppage_name = stoppage.stoppage_name;
                $scope.stopAdd.lat = +stoppage.lat;
                $scope.stopAdd.long = +stoppage.long;
                $scope.editStoppageRouteId = stoppage.route_id;
                $scope.editStoppageId = stoppage.id;
            } else {


                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: '../views/deletePopup.html',
                    controller: 'deleteConfirmCtrl',
                    size: "sm",
                    resolve: {
                        items: function () {
                            return $scope.UpdateStopaggePopupInfo;
                        }
                    }
                });
                modalInstance.result.then(function (status) {
                    if (status) {
                        var stoppageData = {
                            "stoppage_name": $scope.stopAdd.stoppage_name,
                            "lat": $scope.stopAdd.lat,
                            "long": $scope.stopAdd.long,
                            "id": $scope.editStoppageId
                        }
                        apiCommunication.editStoppage.post({}, stoppageData, function (result) {
                            $scope.isStoppageEdit = false;
                            $scope.isStoppageSave = true;
                            if (result.statusCode == 1001) {
                                //to reset fields
                                $scope.stopAdd.stoppage_name = null;
                                $scope.stopAdd.lat = null
                                $scope.stopAdd.long = null;

                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "danger";
                            } else if (result.statusCode == 1002) {
                                $scope.checked = false;
                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "info";
                            } else if (result.statusCode == 1007) {
                                //to reset fields
                                $scope.stopAdd.stoppage_name = null;
                                $scope.stopAdd.lat = null
                                $scope.stopAdd.long = null;

                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "danger";
                            } else if (result.statusCode == 1006) {
                                $scope.msg = result.description;
                                $scope.addStoppageMsg = true;

                                $scope.infoColor = "success";
                                //to reset fields
                                $scope.stopAdd.stoppage_name = null;
                                $scope.stopAdd.lat = null
                                $scope.stopAdd.long = null;

                                //populating grid
                                for (var i = 0; i < $scope.grid.length; i++) {
                                    if ($scope.grid[i].id == editStoppageData.id) {
                                        $scope.grid[i].stoppage_name = result.editdata.stoppage_name;
                                        $scope.grid[i].lat = result.editdata.lat;
                                        $scope.grid[i].long = result.editdata.long;
                                    }
                                }
                            } else {
                                //to reset fields
                                $scope.stopAdd.stoppage_name = null;
                                $scope.stopAdd.lat = null
                                $scope.stopAdd.long = null;

                                $scope.addStoppageMsg = true;
                                $scope.msg = result.description;
                                $scope.infoColor = "info";
                            }
                        });
                    }
                }, function () {});
            } //else
        }
    });