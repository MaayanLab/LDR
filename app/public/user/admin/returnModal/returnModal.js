/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

angular.module('ldr')
    .controller('ReturnModalInstanceCtrl', function($scope, api,
                                                    $modalInstance, form) {
        $scope.form = form;

        $scope.returnRelease = function() {
            api('releases/form/' + $scope.form._id)
                .post($scope.form).success(function() {
                    $modalInstance.close();
                }
            );
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
