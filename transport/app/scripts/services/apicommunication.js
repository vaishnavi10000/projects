'use strict';

/**
 * @ngdoc service
 * @name transportApp.apiCommunication
 * @description
 * # apiCommunication
 * Factory in the transportApp.
 */
angular.module('transportApp')
    .factory('apiCommunication', function ($resource, $http, conf) {
        // Service logic
        // ...
        var meaningOfLife = 42;

        // Public API here
       return {
            uploadSingleFile: function (file, headers) {
                var fd = new FormData();
                fd.append('file', file);
                return $http.post('http://apptesting.fliplearn.com:3003/driver/addDriver', fd, {
                    transformRequest: angular.identity,
                    headers: headers
                })
            },
            edituploadSingleFile: function (file, headers) {
                var fd = new FormData();
                fd.append('file', file);
                return $http.post('http://apptesting.fliplearn.com:3003/driver', fd, {
                    transformRequest: angular.identity,
                    headers: headers
                })
            },
        	driverInfo: $resource(conf.apiBase + "getLatLong/location", {}, conf.apiAction),
            students: $resource(conf.apiBase + "student/listStudents/:route_id", {}, conf.apiAction),
            deleteDriver: $resource(conf.apiBase + "driver/deleteDriver", {}, conf.apiAction),
            addSelectedStudents: $resource(conf.apiBase + "student/add", {}, conf.apiAction),
            listAlldriver: $resource(conf.apiBase + "driver/listAll/:value", {}, conf.apiAction),
            getAssignedVehicles: $resource(conf.apiBase + "vehicle/getAssignedVehicles", {}, conf.apiAction),
            unassignVehicle: $resource(conf.apiBase + "vehicle/unassignVehicle", {}, conf.apiAction),
            addDriverOutput: $resource(conf.apiBase + "driver/getList/:allDriver", {}, conf.apiAction),
            addDriver: $resource(conf.apiBase + "driver/addDriver", {}, conf.apiAction),
            driverLocation: $resource(conf.apiBase + "driverLocation", {}, conf.apiAction),
            driverLocationDummy: $resource("scripts/dummyData/dummyData.json", {}, conf.apiAction),
            //driverInfo: $resource(conf.apiBase + "drivers/getList", {}, conf.apiAction),
            driverInfoDummy: $resource("scripts/dummyData/driverInfo.json", {}, conf.apiAction),
            addVehicleOutput: $resource(conf.apiBase + "vehicle/getVehicles", {}, conf.apiAction),
            addVehicle: $resource(conf.apiBase + "vehicle/addVehicle", {}, conf.apiAction),
            routeNo: $resource(conf.apiBase + "route/addRoute", {}, conf.apiAction),
            routeList: $resource(conf.apiBase + "route/routeList", {}, conf.apiAction),
            removeVehicle: $resource(conf.apiBase + "vehicle/removeVehicles", {}, conf.apiAction),
            assignVehicle: $resource(conf.apiBase + "vehicle/assignVehicles", {}, conf.apiAction),
            stoppageInfo: $resource(conf.apiBase + "stoppage/get/:route_id", {}, conf.apiAction),
            addStop: $resource(conf.apiBase + "stoppage/add", {}, conf.apiAction),
            deleteStoppage: $resource(conf.apiBase + "stoppage/delete", {}, conf.apiAction),
            classList: $resource(conf.apiBase + "class/classList", {}, conf.apiAction),
            sectionList: $resource(conf.apiBase + "section/sectionList/:class_id", {}, conf.apiAction),
            studentInfo: $resource(conf.apiBase + "student/studentList/:section_id", {}, conf.apiAction),
            removeStudent: $resource(conf.apiBase + "student/delete", {}, conf.apiAction),
            removeRoute: $resource(conf.apiBase + "route/deleteRoute", {}, conf.apiAction),
			updatevehicle: $resource(conf.apiBase + "vehicle/updateVehicle", {}, conf.apiAction),
            editRoute: $resource(conf.apiBase + "route/editRoute", {}, conf.apiAction),
            editStoppage: $resource(conf.apiBase + "stoppage/edit", {}, conf.apiAction),
			getVehicleType: $resource(conf.apiBase + "vehicle/getVehicleType", {}, conf.apiAction)
                //driverInfo: $resource(conf.apiBase + "drivers", {}, conf.apiAction),
                /*driverInfoDummy: $resource("scripts/dummyData/driverInfo.json", {}, conf.apiAction),
                driverLocation: $resource(conf.apiBase + "driverLocation", {}, conf.apiAction),
                driverLocationDummy: $resource("scripts/dummyData/dummyData.json", {}, conf.apiAction),
                routeNo:$resource(conf.apiBase + "route", {}, conf.apiAction),
                routeNoDummy: $resource("scripts/dummyData/routeDummydata.json", {}, conf.apiAction),
                stoppageInfo:$resource(conf.apiBase + "routes/stoppage", {}, conf.apiAction),
                stoppageNameDummy: $resource("scripts/dummyData/stoppageDummydata.json", {}, conf.apiAction),
                schoolInfo:$resource(conf.apiBase + "schools", {}, conf.apiAction),
                schoolDummyInfo: $resource("scripts/dummyData/schoolDummydata.json", {}, conf.apiAction),
                addDriverOutput: $resource(conf.apiBase + "driver", {}, conf.apiAction1),
                addDriverOutputDummy: $resource("scripts/dummyData/addDriverOutput.json", {}, conf.apiAction),
                addVehicleOutput: $resource(conf.apiBase + "vehicles", {}, conf.apiAction),
                addVehicleOutputDummy: $resource("scripts/dummyData/addVehicleOutput.json", {}, conf.apiAction),
                assignVehicleOutput: $resource(conf.apiBase + "assignVehcile", {}, conf.apiAction),
                studentInfo: $resource(conf.apiBase + "students", {}, conf.apiAction),
                studentInfoDummy: $resource("scripts/dummyData/studentDummydata.json", {}, conf.apiAction)*/

        };
    })
    /** 
     * @ngdoc service
     * @name fliplearn.conf
     * @description
     * # conf
     * Factory in the fliplearn.
     */
     .factory('userTokenInfo', function($location, $localStorage) {
        var tokenInfo={};
        tokenInfo.setTempToken= function(){
			var url = $location.$$absUrl.split(/[&||?||#||=]/);
			var transport_token = url[4];
			var transport_uuid = url[2];
			$localStorage.transport_token=url[4];
			$localStorage.transport_uuid=url[2];
			/*if($location.$$absUrl=="http://apptesting.fliplearn.com:3003/"){
				$localStorage.transport_token="uigOWbOq13Lb9EKlEDEcrPqRR";
				$localStorage.transport_uuid="43039";
				alert('here');
			} */    
        }
		
		tokenInfo.setTempToken();
    
        tokenInfo.getUserToken = function(){
            return $localStorage.transport_token;
        };
        
        tokenInfo.getUserUuid = function(){			
            return $localStorage.transport_uuid;
        }; 
        return tokenInfo;
    })
    /** 
     * @ngdoc service
     * @name fliplearn.conf
     * @description
     * # conf
     * Factory in the fliplearn.
     */
    .factory('conf', function (userTokenInfo, $localStorage) {
       //userTokenInfo.setTempToken();
        return {
            // Public API here
            apiBase: 'http://apptesting.fliplearn.com:3003/',
            apiAction1: {
                'post': {
                    method: 'POST',
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'undefined'
                    }
                }
            },
            apiAction: {
                'get': {
                    method: 'GET',
                    withCredentials: true,
                    headers: {
                        session_token: userTokenInfo.getUserToken(),
                        uuid: userTokenInfo.getUserUuid()
                    }
                },
                'edit': {
                    method: 'PUT',
                    withCredentials: true
                },
                'post': {
                    method: 'POST',
                    withCredentials: true,
                    headers: {
                        session_token: userTokenInfo.getUserToken(),
                        uuid: userTokenInfo.getUserUuid()
                    }
                },
                'query': {
                    method: 'GET',
                    withCredentials: true,
                    isArray: true
                },
                'remove': {
                    method: 'DELETE',
                    withCredentials: true
                },
                'delete': {
                    method: 'DELETE',
                    withCredentials: true
                }
            }
        }
    });