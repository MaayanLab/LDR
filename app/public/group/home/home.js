/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

angular.module('milestones.group.home', [
    'ui.router',
    'angular-storage',
    'milestones.api'
])

    // UI Router state formCreate
    .config(function($stateProvider) {
        $stateProvider.state('groupHome', {
            url: '/group/{id:string}/home',
            controller: 'GroupHomeCtrl',
            templateUrl: 'group/home/home.html',
            data: {
                requiresLogin: true
            }
        });
    })

    .controller('GroupHomeCtrl', function($scope, $stateParams, $timeout, store, api) {
        var currentUser = store.get('currentUser');
        var groupId = $stateParams.id;

        $scope.statistics = {};
        $scope.users = [];

        api('group/' + groupId + '/statistics').get().success(function(statsObj) {
            $scope.statistics = statsObj;
        });

        api('group/' + groupId + '/users').get().success(function(usersArr) {
            $scope.users = usersArr;
        });

        // Uncomment to poll server and check for new users
        /*
        var pollServer = function() {
            api('group/' + groupId + '/users').get().success(function(usersArr) {
                $scope.users = usersArr;
                $timeout(pollServer, 1000);
            });
        };
        pollServer();
        */

    });