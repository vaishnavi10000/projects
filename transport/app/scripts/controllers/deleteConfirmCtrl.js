angular.module('transportApp')
    .controller('deleteConfirmCtrl', function ($scope, $uibModalInstance, items) {
    $scope.value=items;
        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to implement functionality of OK in model popup 
         * Return:vehicle_id
         * Params:null
         */
        $scope.ok = function () {
            $uibModalInstance.close(true);

        };

        /**
         * @Author: vaishnavi
         * @ngdoc function
         * @name transportApp.controller:AddvehiclesCtrl
         * @description:This function is used to implement functionality of CANCEL in model popup 
         * Return:vehicle_id
         * Params:null
         */
        $scope.cancel = function () {
            $uibModalInstance.close(false);
        };
    });