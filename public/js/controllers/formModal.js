// Controller for modal instances

angular.module('milestonesLanding')
    .controller('FormModalCtrl', function FormModalCtrl($scope, $modalInstance, data) {

        $scope.modalForm = {};

        $scope.editData = false;

        $scope.datatype = data.inpType;

        if (data.selected) {
            $scope.editData = true;
            $scope.modalForm = data.selected;
        }


        $scope.close = function () {
            $modalInstance.close($scope.modalForm);
        };

        $scope.delete = function () {
            $modalInstance.close('delete');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    });

