/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

angular.module('ldr')
    .controller('ReturnModalInstanceCtrl', function($scope, api,
                                                    $modalInstance, config) {
        $scope.returnRelease = function() {
            if ($scope.message.length > 20) {
                var reason = 'This release has been returned for the ' +
                    'following reason: ' + $scope.message;
                api('releases/form/' + config.form._id + '/return/')
                    .post({ message: reason })
                    .success(function() {
                        $modalInstance.close(reason);
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
