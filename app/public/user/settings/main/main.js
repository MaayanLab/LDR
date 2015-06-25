/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

angular.module('ldr.user.settings', [
    'ui.router',
    'angular-storage'
])
    .config(function($stateProvider) {
        // UI Router state userSettings
        $stateProvider.state('userSettings', {
            url: '/user/{id:string}/settings',
            controller: 'UserSettingsCtrl',
            templateUrl: 'user/settings/main/main.html',
            data: {
                requiresLogin: true
            }
        });
    })
    .controller('UserSettingsCtrl', function($scope, api) {

        $scope.user = angular.copy($scope.getCurrentUser());
        if ($scope.user.name) {
            $scope.user.firstName = $scope.user.name.split(' ')[0];
            $scope.user.lastName = $scope.user.name.split(' ')[1];
        }


        $scope.updateUser = function() {
            $scope.user.name = $scope.user.firstName + ' ' +
                $scope.user.lastName;
            $scope.setCurrentUser($scope.user);
            api('user/' + $scope.user._id + '/update/')
                .put($scope.user)
                .success(function() {
                    alert('User updated successfully');
                })
        };

    });