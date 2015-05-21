angular.module('ldr')
    .controller('ModalInstanceCtrl', function($scope, $modalInstance, config, nameServer) {
        $scope.name = config.name;
        $scope.newTag = config.newTag;
        $scope.model = config.model;
        $scope.element = config.element;

        $scope.ok = function() {
            $scope.newTag.text = $scope.newTag.name;
            delete $scope.newTag.newField;
            nameServer.post('cell', $scope.newTag)
                .success(function(resp) {
                    $scope.newTag._id = resp;
                    $scope.save();
                })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. Please try again later.');
                    $scope.cancel();
                });
        };

        $scope.save = function() {
            $scope.model[$scope.model.length-1] = $scope.newTag;
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $scope.model.splice($scope.model.length-1, 1);
            $modalInstance.dismiss('cancel');
        };
    });

