/**
 * @author Michael McDermott
 * Created on 5/20/15.
 */

angular.module('ldr.user.settings.changePassword', [
    'ui.router',
    'angular-storage',
    'ldr.api'
])
    .config(function($stateProvider) {
        // UI Router state changePassword
        $stateProvider.state('changePassword', {
            url: '/user/{id:string}/settings/changePassword',
            controller: 'ChangePasswordCtrl',
            templateUrl: 'user/settings/changePassword/changePassword.html',
            data: {
                requiresLogin: true
            }
        });
    })
    .controller('ChangePasswordCtrl', function($scope, $stateParams, api) {

        var id = $stateParams.id;

        $scope.passwords = {
            old: '',
            new: '',
            confirm: ''
        };

        $scope.changePassword = function() {
            console.log($scope);
            api('user/' + id + '/changePassword/')
                .put($scope.passwords)
                .then(function() {
                    alert('Password successfully changed');
                }, function(error) {
                    alert('An error occurred while changing your password. ' +
                        'Please try again.');
                });
        };
    });