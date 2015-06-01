angular.module('ldr', [
    'ldr.nav',
    'ldr.home',
    'ldr.bar',
    'ldr.group.home',
    'ldr.releases.overview',
    'ldr.releases.create',
    'ldr.user.admin',
    'ldr.user.registration',
    'ldr.user.settings',
    'ldr.user.settings.changePassword',
    'ui.router',
    'ui.bootstrap',
    'angular-storage',
    'angular-jwt'
])
    .config(function ldrConfig($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $locationProvider) {

        // Add JWT to every request to server
        //jwtInterceptorProvider.tokenGetter = function (store) {
        //    return store.get('jwt');
        //};
        //$httpProvider.interceptors.push('jwtInterceptor');

        // For AJAX errors
        $httpProvider.interceptors.push(function($q, $location) {
            return {
                response: function(response) {
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401)
                    //$location.url(base);
                        return $q.reject(response);
                }
            };
        });
    })

    .run(function($rootScope, $state, store, jwtHelper) {
        "use strict";
        $rootScope.currentUser = store.get('currentUser');
        // Check status of user on every state change
        // Used for Navbar and blocking pages from unauthorized users
        // Otherwise, just check if the user is logged in
        $rootScope.$on('$stateChangeStart', function(e, to) {
            // Get current user
            $rootScope.currentUser = store.get('currentUser');

            // Check if the state requires login or admin privileges
            if (to.data) {
                if (to.data.requiresAdmin) {
                    // Check if user is logged in by checking if there is a valid JWT

                    // User not logged in
                    if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                        $rootScope.isLoggedIn = false;
                        $rootScope.isLoggedInAdmin = false;
                        e.preventDefault();
                        alert('You must be the authorized to access this page. Please log in.');
                        $state.go('home');
                    }
                    // Logged in but does not have admin privileges
                    if ($rootScope.currentUser.admin !== true) {
                        $rootScope.currentUser = store.get('currentUser');
                        $rootScope.isLoggedIn = true;
                        $rootScope.isLoggedInAdmin = false;
                        e.preventDefault();
                        alert('You must be the authorized to access this page.');
                        $state.go('home');
                    }
                }
                if (to.data.requiresLogin) {
                    if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                        $rootScope.isLoggedIn = false;
                        $rootScope.isLoggedInAdmin = false;
                        e.preventDefault();
                        alert('You must be authorized to access this page. Please log in.');
                        $state.go('home');
                    } else {
                        if ($rootScope.currentUser.admin) {
                            $rootScope.currentUser = store.get('currentUser');
                            $rootScope.isLoggedIn = true;
                            $rootScope.isLoggedInAdmin = true;
                        }
                        else {
                            $rootScope.currentUser = store.get('currentUser');
                            $rootScope.isLoggedIn = true;
                            $rootScope.isLoggedInAdmin = false;
                        }
                    }
                }
                if (to.data.loggedIn) {
                    if (store.get('jwt') && !jwtHelper.isTokenExpired(store.get('jwt'))) {
                        e.preventDefault();
                        $state.go('home');
                    }
                }
            }
            else if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                $rootScope.isLoggedIn = false;
            }
            else {
                if ($rootScope.currentUser.admin) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.isLoggedInAdmin = true;
                }
                else {
                    $rootScope.isLoggedIn = true;
                    $rootScope.isLoggedInAdmin = false;
                }
            }
        });
    })
    .controller('ldrCtrl', function ldrCtrl($scope, store) {
        $scope.pageTitle = 'LDR';
        $scope.currentUser = store.get('currentUser');
        // Don't think this works, but should dynamically change title of page
        $scope.$on('$routeChangeSuccess', function(e, nextRoute) {
            if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
                $scope.pageTitle = nextRoute.$$route.pageTitle + ' | LDR';
            }
        });
    });
