angular.module('milestones.nav', [])
    .directive('mlNav', function($http, $state, $rootScope, store) {
        return {
            restrict: 'E',
            templateUrl: 'nav/nav.html',
            link: function(scope, element, attrs) {

                scope.user = {};
                scope.showFailMessage = false;

                scope.login = function() {
                    $http({
                        url: 'login',
                        method: 'POST',
                        data: scope.user
                    }).then(function(result) {
                        if (result) {
                            // No error: authentication OK
                            // Set current user and jwt. Then go to forms page
                            scope.currentUser = result.data.user;
                            store.set('currentUser', result.data.user);
                            store.set('jwt', result.data.id_token);
                            $rootScope.isLoggedIn = true;
                            $rootScope.isLoggedInAdmin = result.data.user.admin;
                            $state.go('home');
                        }
                        else {
                            scope.showFailMessage = true;
                        }
                    }, function(err) {
                        scope.showFailMessage = true;
                    });
                };

                scope.logout = function() {
                    $rootScope.isLoggedInAdmin = false;
                    store.remove('currentUser');
                    store.remove('jwt');
                    alert('Successfully logged out');
                    scope.showFailMessage = false;
                    $rootScope.isLoggedIn = false;
                    $state.go('home');
                };
            }
        };
    });
