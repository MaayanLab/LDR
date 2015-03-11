angular.module('milestonesLanding')
.controller('FormModalCtrl', function FormModalCtrl($scope, $modalInstance, datatype) {
    
    $scope.datatype = datatype;
    
    $scope.modalForm = {};
    
    $scope.add = function() {
        $modalInstance.close($scope.modalForm);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

});

