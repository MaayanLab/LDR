/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

angular.module('ldr.group.settings', [
    'ui.router',
    'angular-storage'
])
    .config(function($stateProvider) {
        // UI Router state userSettings
        $stateProvider.state('groupSettings', {
            url: '/group/{id:string}/settings',
            controller: 'GroupSettingsCtrl',
            templateUrl: 'group/settings/settings.html',
            data: {
                requiresLogin: true,
                requiresAdmitted: true
            }
        });
    })
    .controller('GroupSettingsCtrl', function($scope, $stateParams, api,
                                                $state) {

        $scope.groupId = $stateParams.id;
        $scope.group = {};
        api('group/' + $scope.groupId + '/')
            .get()
            .success(function(group) {
                $scope.group = angular.copy(group);
            });

        $scope.updateGroup = function() {
            api('group/' + $scope.groupId + '/update/')
                .put($scope.group)
                .success(function() {
                    alert('Group updated successfully');
                    $state.go('groupHome', { id: $scope.groupId });
                }
            );
        };
    });
