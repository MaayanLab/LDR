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
    .controller('UserSettingsCtrl', function($scope, $stateParams, store) {
        var currentUser = store.get('currentUser');

    });