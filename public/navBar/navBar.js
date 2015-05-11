angular.module('milestonesLanding.navBar', [])

.directive('mlNavBar', function($http, $state, $rootScope, store) {
    return {
        restrict: 'E',
        templateUrl: 'navBar/navBar.html',
        link: function(scope, element, attrs) {
            
            scope.user = {};

            // Post to /login
            scope.login = function () {
                $http({
                    url: 'login',
                    method: 'POST',
                    data: scope.user
                }).then(function (result) {
                    // No error: authentication OK
                    // Set current user and jwt. Then go to forms page
                    store.set('currentUser', result.data.user);
                    store.set('jwt', result.data.id_token);
                    $state.go('forms');
                }, function (error) {
                    // Error: authentication failed
                    store.set('message', 'Authentication failed.');
                    alert('Login was unsuccessful. Please try again.');
                });
            };

            // Don't really need an AJAX request here, all that's important is deleting the currentUser and JWT
            scope.logout = function () {
                $rootScope.message = 'Logged out.';
                $http({
                    url: 'logout',
                    method: 'GET'
                }).then(function (result) {
                    // No Error
                    $rootScope.message = result;
                    $rootScope.isLoggedIn = false;
                    $rootScope.isLoggedInAdmin = false;
                    store.remove('currentUser');
                    store.remove('jwt');
                    alert('Successfully logged out');
                    $state.go('home');
                }, function (error) {
                    // Error
                    $rootScope.message = result;
                });
            };

        }
    };
});
