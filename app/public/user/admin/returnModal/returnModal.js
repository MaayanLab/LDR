/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

angular.module('ldr')
    .controller('ReturnModalInstanceCtrl', function($scope, api,
                                                    $modalInstance, config) {
        $scope.message = angular.copy(config.form.message);

        $scope.returnRelease = function() {
            if ($scope.message.length > 50) {
                api('releases/form/' + $scope.form._id + '/return/')
                    .post({ message: $scope.message })
                    .success(function() {
                        $modalInstance.close($scope.message);
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
