/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

angular.module('ldr')
    .controller('MsgModalInstanceCtrl', function($scope, api,
                                                    $modalInstance, config) {
        $scope.form = angular.copy(config.form);

        $scope.ok = function() {
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
