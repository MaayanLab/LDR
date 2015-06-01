angular.module('ldr.nav', [])
    .directive('ldrNav', function($http, $state, $rootScope, store) {
        return {
            restrict: 'E',
            templateUrl: 'nav/nav.html',
            link: function(scope, element, attrs) {

                scope.setCurrentUser = function(user, token) {
                    scope.currentUser = user;
                    store.set('currentUser', user);
                    store.set('jwt', token);
                    $rootScope.isLoggedIn = true;
                    $rootScope.isLoggedInAdmin = user.admin;
                };
                scope.user = {};
                scope.showFailMessage = false;

                scope.login = function(user) {
                    $http({
                        url: 'login',
                        method: 'POST',
                        data: user || scope.user
                    }).then(function(result) {
                        if (result) {
                            // No error: authentication OK
                            // Set current user and jwt. Then go to forms page
                            scope.setCurrentUser(result.data.user,
                                result.data.id_token);
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
                    $rootScope.isLoggedIn = false;
                    $rootScope.isLoggedInAdmin = false;
                    store.remove('currentUser');
                    store.remove('jwt');
                    alert('Successfully logged out');
                    scope.showFailMessage = false;
                    $state.go('home');
                };

                scope.register = function() {
                    $rootScope.isLoggedIn = false;
                    $rootScope.isLoggedInAdmin = false;
                    scope.showFailMessage = false;
                    $state.go('userRegistration');
                };
            }
        };
    });