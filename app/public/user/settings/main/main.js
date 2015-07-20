/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

(function() {
    angular
        .module('ldr.user.settings', [
            'ui.router',
            'angular-storage'
        ])
        .config(userSettingsConfig)
        .controller('UserSettingsCtrl', UserSettingsCtrl);

    /* @ngInject */
    function userSettingsConfig($stateProvider) {
        // UI Router state userSettings
        $stateProvider.state('userSettings', {
            url: '/user/{id:string}/settings',
            templateUrl: 'user/settings/main/main.html',
            controller: 'UserSettingsCtrl',
            controllerAs: 'vm',
            data: {
                requiresLogin: true
            }
        });
    }

    /* @ngInject */
    function UserSettingsCtrl(userManagement, store) {

        var vm = this;
        vm.user = angular.copy(store.get('currentUser'));

        if (vm.user.name) {
            vm.user.firstName = vm.user.name.split(' ')[0];
            vm.user.lastName = vm.user.name.split(' ')[1];
        }

        $scope.updateUser = function() {
            userManagement
                .updateUser(vm.user._id, vm.user)
                .success(function() {
                    store.set('currentUser', vm.user);
                    alert('User updated successfully');
                }
            );
        };
    }
})();
