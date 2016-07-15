'use strict';

/**
 * @ngdoc function
 * @name transportApp.controller:AddstudentCtrl
 * @description
 * # AddstudentCtrl
 * Controller of the transportApp
 */
angular.module('transportApp')
    .controller('AddstudentCtrl', function ($scope, $routeParams, apiCommunication, $uibModal, $localStorage, $sessionStorage) {
        this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
        $scope.routeArr = [];
        $scope.stoppageArr = [];
        $scope.classArr = [];
        $scope.sectionArr = [];
        $scope.studentArr = [];
        $scope.activeButton = true;
        $scope.selectedRoute = {};
        $scope.selectedStoppage = {};
        $scope.selectedClass = {};
        $scope.readOnlyRoute = false;
        $scope.readOnlyStoppage = false;
        $scope.readOnlySection = false;
        $scope.show = false;
        $scope.hide = false;
        $scope.showStudentList = false;
        $scope.infocolor;
        $scope.errorRedFlagRoute = true;
        $scope.errorRedFlagStoppage = true;
        $scope.errorRedFlagClass = true;
        $scope.errorRedFlagSection = true;

        $scope.idsArr = [];
        $scope.confimationPopupInfo = {
            "Title": "Delete",
            "Message": $localStorage.config.constantMsg.removeStudentConfirmation, //"Are you sure want to delete selected Item?",
            "okButton": "Yes",
            "cancelButton": "No"
        }
        var angularError = $localStorage.config.constantMsg.angularError //"Something went wrong.Please try again";
            /**
             * @Author: Payal Vishwakarma 
             * @name :stoppageStudent
             * @description: This function is used fetch the Stoppages after makeing API call
             * Return:null
             * Params:null
             */
        $scope.stoppageStudent = function (id) {
            // api to get all the stoppages along with students on a route
            apiCommunication.students.get({
                route_id: id
            }, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004 || result.statusCode == 1007) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                    angular.element("#message").focus();
                    $scope.hide = true;
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    if (result.studentList != undefined) {
                        $scope.hide = false;
                        $scope.stoppageStudentArr = result.studentList;
                    }
                }

            }, function (err) {
                $scope.msg = angularError;
                $scope.show = true;
                angular.element("#message").focus();
            })

        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :getStoppages
         * @description: This function is used fetch the stoppages after makeing API call
         * Return:null
         * Params:null
         */
        $scope.getStoppages = function (id) {
            $scope.show = false;
            $scope.readOnlyStoppage = false;
            // api to get all the stoppages on a route
            apiCommunication.stoppageInfo.get({
                route_id: id
            }, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004 || result.statusCode == 1007) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                    angular.element("#message").focus();
                    $scope.hide = true;
                    $scope.stoppageName = "Stoppage";
                    $scope.readOnlyStoppage = true;
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    if (result.stopage != undefined) {
                        $scope.stoppageArr = result.stopage;
                        $scope.stoppageStudent(id); // api to get all the stoppages along with students on a route
                    }
                }

            }, function (err) {
                $scope.msg = angularError;
                $scope.show = true;
                angular.element("#message").focus();
            })

            if ($scope.selectedRoute != undefined && $scope.selectedStoppage.stoppage_name != undefined) {
                if ($scope.selectedClass != undefined && $scope.selectedSection != undefined && $scope.studentArr.length != 0) {
                    $scope.activeButton = false;
                }
            }
        }


        if ($routeParams.route_id != undefined) { // if navigated from create route page to add student page
            $scope.show = false;
            $scope.errorRedFlagRoute = false;
            $scope.errorRedFlagStoppage = false;
            $scope.stoppageStudent($routeParams.route_id); // api to get all the stoppages along with students on a rout
            $scope.selectedRoute.id = $routeParams.route_id;
            $scope.selectedRoute.route_no = $routeParams.route_no;
            $scope.selectedRoute.seats = $sessionStorage.sessionObject.seats;
            $scope.selectedRoute.student_count = $sessionStorage.sessionObject.student_count;
            $scope.selectedStoppage.id = $routeParams.stoppage_id;
            $scope.selectedStoppage.stoppage_name = $routeParams.stoppage_name;

            $scope.stoppageArr = $scope.selectedStoppage;
            $scope.readOnlyRoute = true;
            $scope.readOnlyStoppage = true,

                $scope.routeName = $scope.selectedRoute.route_no;
            $scope.stoppageName = $scope.selectedStoppage.stoppage_name;
            $scope.className = "Class";
            $scope.sectionName = "Section";

        } else if ($routeParams.routeId && $routeParams.routeNo) { // if navigated from driver-route list 
            $scope.errorRedFlagRoute = false;
            $scope.selectedRoute.id = $routeParams.routeId;
            $scope.selectedRoute.route_no = $routeParams.routeNo;
            $scope.selectedRoute.seats = $sessionStorage.sessionObject.seats;
            $scope.selectedRoute.student_count = $sessionStorage.sessionObject.student_count;
            $scope.readOnlyRoute = true;
            $scope.getStoppages($routeParams.routeId);
            $scope.routeName = $routeParams.routeNo;
            $scope.stoppageName = "Stoppage";
            $scope.className = "Class";
            $scope.sectionName = "Section";

        } else { //when on add student directly
            if ($scope.selectedRoute && $scope.selectedStoppage && $scope.selectedClass && $scope.selectedSection) {
                $scope.routeName = $scope.selectedRoute.route_no;
                $scope.stoppageName = $scope.selectedStoppage.stoppage_name;
                $scope.className = $scope.selectedClass.class_name;
                $scope.sectionName = $scope.selectedSection;
            } else {
                $scope.errorRedFlagRoute = true;
        $scope.errorRedFlagStoppage = true;
        $scope.errorRedFlagClass = true;
        $scope.errorRedFlagSection = true;
                $scope.routeName = "Route No.";
                $scope.stoppageName = "Stoppage";
                $scope.className = "Class";
                $scope.sectionName = "Section";
            }

        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :getAvailableDetails
         * @description: This function is used fetch the routes and classes in school after makeing API call
         * Return:null
         * Params:null
         */
        $scope.getAvailableDetails = function () {
            $scope.show = false;
            apiCommunication.routeList.get({}, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                    angular.element("#message").focus();
                    $scope.routeName = "Route No.";
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    $scope.routeArr = result.routeList;
                }

            }, function (err) {
                $scope.msg = angularError;
                $scope.show = true;
                angular.element("#message").focus();
            })

            apiCommunication.classList.get({}, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                    angular.element("#message").focus();
                    $scope.className = "Class";
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    $scope.classArr = result.classList;
                }

            }, function (err) {
                $scope.msg = angularError;
                $scope.show = true;
                angular.element("#message").focus();
            })

        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :getRoutes
         * @description: This function is used to add selected students ids to an array 
         * Return:null
         * Params:null
         */
        $scope.ids = [];
        var index;
        $scope.addIds = function ($index, id) {
            if ($scope.ids[$index]) {
                $scope.idsArr.push(id);
            } else {
                index = $scope.idsArr.indexOf(id);
                $scope.idsArr.splice(index, 1);
            }
        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :changeStoppage
         * @description: This function is used fetch the Stoppages after makeing API call
         * Return:null
         * Params:null
         */
        $scope.changeStoppage = function (object) {
                $scope.show = false;
                if ($scope.selectedRoute != undefined && $scope.selectedStoppage != null &&  $scope.selectedStoppage.stoppage_name != undefined) {
                    if ($scope.selectedClass != undefined && $scope.selectedSection != undefined && $scope.studentArr.length != 0) {
                        $scope.activeButton = false;
                    }
                }
            }
            /**
             * @Author: Payal Vishwakarma 
             * @name :getSections
             * @description: This function is used fetch the sections after makeing API call
             * Return:null
             * Params:null
             */
        $scope.getSections = function (object) {
            $scope.show = false;
            $scope.studentArr = [];
            $scope.showStudentList = false;

            apiCommunication.sectionList.get({
                class_id: object.class_id
            }, function (result) {
                if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004) {
                    $scope.infocolor = 'warning'
                    $scope.msg = result.description;
                    $scope.show = true;
                    angular.element("#message").focus();
                    $scope.readOnlySection = true;
                } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                    $scope.sectionArr = result.sectionList;
                }
            }, function (err) {
                $scope.msg = angularError;
                $scope.show = true;
                angular.element("#message").focus();
            })
        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :changeSection
         * @description: This function is called when selected section is changed
         * Return:null
         * Params:null
         */
        $scope.changeSection = function (object) {
                $scope.show = false;
                $scope.fetchStudents(); //to get students in a section
            }
            /**
             * @Author: Payal Vishwakarma 
             * @name :studentsList
             * @description: This function is used to show the division conataining list of students
             * Return:null
             * Params:null
             */
        $scope.studentsList = function () {
            if ($scope.studentArr.length >= 1) {
                $scope.showStudentList = true;
            } else {
                $scope.showStudentList = false;
            }
        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :fetchStudents
         * @description: This function is used fetch the Students in the selected section after makeing API call
         * Return:null
         * Params:null
         */
        $scope.fetchStudents = function () {
            if ($scope.selectedRoute != undefined && $scope.selectedStoppage != undefined && $scope.selectedClass != undefined && $scope.selectedSection != undefined) {
                apiCommunication.studentInfo.get({
                    section_id: $scope.selectedSection.section_id
                }, function (result) {
                    if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004) {
                        $scope.infocolor = 'warning'
                        $scope.msg = result.description;
                        $scope.show = true;
                        angular.element("#message").focus();
                        $scope.studentArr = [];
                        $scope.activeButton = true;
                    } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                        $scope.studentArr = result.studentList;
                        $scope.studentsList(); // to show the division conataining list of students
                        if ($scope.selectedRoute != undefined && $scope.selectedStoppage.stoppage_name != undefined) {
                            if ($scope.selectedClass != undefined && $scope.selectedSection != undefined && $scope.studentArr.length != 0) {
                                $scope.activeButton = false;
                            }
                        }
                    }
                }, function (err) {
                    $scope.msg = angularError;
                    $scope.show = true;
                    angular.element("#message").focus();
                })

            }
        }

        /**
         * @Author: Payal Vishwakarma 
         * @name :addStudents
         * @description: This function is used fetch the students after makeing API call
         * Return:null
         * Params:null
         */
        $scope.addStudents = function () {
                $scope.show = false;
                var add = function () {
                        apiCommunication.addSelectedStudents.post({}, {
                            route_id: $scope.selectedRoute.id,
                            stoppage_id: $scope.selectedStoppage.id,
                            student_id: $scope.idsArr
                        }, function (result) {
                            if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004 || result.statusCode == 1007) {
                                $scope.infocolor = 'warning'
                                $scope.msg = result.description;
                                $scope.show = true;
                                angular.element("#message").focus();
                            } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                                $scope.infocolor = 'success'
                                $scope.msg = result.description;
                                $scope.show = true;
                                angular.element("#message").focus();
                                $scope.selectedRoute.student_count = $scope.selectedRoute.student_count + $scope.idsArr.length;
                                $scope.available_seats = $scope.selectedRoute.seats - $scope.selectedRoute.student_count;
                                for (var idCounter = 0; idCounter < $scope.idsArr.length; idCounter++) {
                                    for (var stCounter = 0; stCounter < $scope.studentArr.length; stCounter++) {
                                        if ($scope.studentArr[stCounter].student_id == $scope.idsArr[idCounter]) {
                                            $scope.studentArr.splice(stCounter, 1);
                                        }
                                    }
                                }
                                $scope.stoppageStudent($scope.selectedRoute.id); // api to get all the stoppages which have students on a route
                                $scope.studentsList(); // do not show the division when there is no student in studentArr
                                $scope.idsArr = [];
                                $scope.ids = [];

                            }
                        }, function (err) {
                            $scope.msg = angularError;
                            $scope.show = true;
                            angular.element("#message").focus();
                        });

                    } // add function ends here
                if ($scope.idsArr.length == 0) {
                    $scope.infocolor = 'warning'
                    $scope.msg = $localStorage.config.constantMsg.noStudentSelected; //"Select any student to add to stoppage";
                    $scope.show = true;
                    angular.element("#message").focus();
                } else if ($scope.selectedRoute.seats == null && $scope.idsArr.length > 50) {
                    $scope.infocolor = 'warning'
                    $scope.msg = $localStorage.config.constantMsg.limitOfStudents // "You cant add more than 50 students";
                    $scope.show = true;
                    angular.element("#message").focus();
                } else if ($scope.selectedRoute.seats == null && $scope.idsArr.length <= 50) {
                    add();
                } else if ($scope.selectedRoute.seats != null) {
                    $scope.available_seats = $scope.selectedRoute.seats - $scope.selectedRoute.student_count;
                    if ($scope.idsArr.length > $scope.available_seats) {
                        $scope.infocolor = 'warning'
                        $scope.msg = $scope.available_seats + " " + "seats available";
                        $scope.show = true;
                        angular.element("#message").focus();
                    } else {
                        add(); // api call to add students
                    }
                }

            }
            /**
             * @Author: Payal Vishwakarma 
             * @name :removeStudent
             * @description: This function is used to remove student from stoppage
             * Return:null
             * Params:null
             */
        $scope.removeStudent = function (stoppage, student, $index) {
            $scope.show = false;
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
                    $scope.available_seats = $scope.selectedRoute.seats - $scope.selectedRoute.student_count;
                    apiCommunication.removeStudent.post({}, {
                        student_id: student.student_id
                    }, function (result) {
                        if (result.statusCode == 1005 || result.statusCode == 1001 || result.statusCode == 1004 || result.statusCode == 1007 || result.statusCode == 1003) {
                            $scope.infocolor = 'warning';
                            $scope.msg = result.description;
                            $scope.show = true;
                            angular.element("#message").focus();
                        } else if (result.statusCode == 1006 || result.statusCode == 1002) {
                            var index = $scope.stoppageStudentArr.indexOf(stoppage);
                            delete student.$$hashKey;
                            var index2 = $scope.stoppageStudentArr[index].students.indexOf(student);
                            $scope.stoppageStudentArr[index].students.splice(index2, 1);
                            $scope.infocolor = 'success';
                            $scope.msg = result.description;
                            $scope.show = true;
                            angular.element("#message").focus();
                            $scope.fetchStudents();
                            $scope.selectedRoute.student_count = $scope.selectedRoute.student_count - 1;
                            $scope.available_seats = $scope.selectedRoute.seats - $scope.selectedRoute.student_count;

                            $scope.idsArr = [];
                            $scope.ids = [];
                        }
                    }, function (err) {
                        $scope.msg = angularError;
                        $scope.show = true;
                        angular.element("#message").focus();
                    });
                }
            }, function () {});

        }
    });