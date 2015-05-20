/**
 * @author Michael McDermott
 * Created on 5/20/15.
 */

angular.module('milestones.user.settings', [
    'ui.router',
    'angular-storage',
])

    .config(function($stateProvider) {
        // UI Router state admin
        $stateProvider.state('admin', {
            url: '/user/settings',
            controller: 'UserSettingsCtrl',
            templateUrl: 'user/settings/settings.html',
            data: {
                requiresLogin: true
            }
        });
    })
    .controller('UserSettingsCtrl', function($scope, $http, store) {
        var currentUser = store.get('currentUser');

    });