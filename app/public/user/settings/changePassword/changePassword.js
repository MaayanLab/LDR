/**
 * @author Michael McDermott
 * Created on 5/20/15.
 */

(function() {

angular.module('ldr.user.settings.changePassword', [
    'ui.router',
    'angular-storage',
    'ldr.api'
])
    .config(changePasswordConfig)
    .controller('ChangePasswordCtrl', ChangePasswordCtrl);

    function changePasswordConfig($stateProvider) {
        // UI Router state changePassword
        $stateProvider.state('changePassword', {
            url: '/user/{id:string}/settings/changePassword',
            templateUrl: 'user/settings/changePassword/changePassword.html',
            controller: 'ChangePasswordCtrl',
            controllerAs: 'vm',
            data: {
                requiresLogin: true
            }
        });
    }

    function ChangePasswordCtrl($stateParams, userManagement) {

        var vm = this;
        var id = $stateParams.id;
        vm.changePassword = changePassword;

        vm.passwords = {
            old: '',
            new: '',
            confirm: ''
        };

        function changePassword() {
            userManagement
                .changePassword(vm.passwords.old, vm.passwords.new, vm.passwords.confirm)
                .then(function() {
                    alert('Password successfully changed');
                }, function(error) {
                    alert('An error occurred while changing your password. ' +
                        'Please try again.');
                }
            );
        }
    }
})();