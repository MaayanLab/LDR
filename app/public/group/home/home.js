/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

angular.module('ldr.group.home', [
    'ui.router',
    'angular-storage',
    'ldr.api'
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

    .controller('GroupHomeCtrl', function($scope, $stateParams, $timeout,
                                          store, api) {
        var currentUser = store.get('currentUser');
        var groupId = $stateParams.id;

        $scope.users = [];

        api('group/' + groupId + '/users')
            .get()
            .success(function(usersArr) {
                $scope.users = usersArr;
            });

        $scope.acceptUser = function(user) {
            console.log(user);
            debugger;
        };

        // Uncomment to poll server and check for new users
        /*
         var pollServer = function() {
         api('group/' + groupId + '/users')
         .get()
         .success(function(usersArr) {
         $scope.users = usersArr;
         $timeout(pollServer, 1000);
         });
         };
         pollServer();
         */

    });