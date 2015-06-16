angular.module('ldr')
    .controller('URLModalInstanceCtrl', function($scope, $modalInstance, config,
                                                 api) {
        
        $scope.urls = angular.copy(config.form.urls);

        $scope.ok = function(formValid) {
            if (formValid) {
                api('releases/form/' + config.form._id + '/urls')
                    .post($scope.urls)
                    .success(function() {
                        $modalInstance.close($scope.urls);
                    })
                    .error(function(resp) {
                        console.log('error:');
                        console.log(resp);
                        alert('There was an error saving the data. ' +
                            'Please try again later.');
                        $scope.cancel();
                    }
                );
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });

