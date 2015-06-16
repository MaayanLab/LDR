angular.module('ldr')
    .controller('URLModalInstanceCtrl', function($scope, $modalInstance, config,
                                                 api) {

        console.log(config.form.urls);
        $scope.urls = angular.copy(config.form.urls);

        $scope.ok = function() {
            api('releases/form/' + config.form._id + '/urls')
                .post($scope.urls)
                .success(function() {
                    $scope.save();
                })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    $scope.cancel();
                });
        };

        $scope.save = function() {
            $modalInstance.close($scope.urls);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });

