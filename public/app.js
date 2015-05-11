angular.module('milestonesLanding', [
    'milestonesLanding.navBar',
    'milestonesLanding.home',
    'milestonesLanding.admin',
    'milestonesLanding.dataReleases.overview',
    'milestonesLanding.dataReleases.create',
    'milestonesLanding.metadata.overview',
    'milestonesLanding.register',
    'ui.router',
    'ui.bootstrap',
    'angular-storage',
    'angular-jwt'
])
    .config(function milestonesLandingConfig($urlRouterProvider, jwtInterceptorProvider,
                                             $httpProvider, $locationProvider) {

        // Remove the 'X-Requested-With' header from all requests to prevent CORS errors
        // http://stackoverflow.com/questions/16661032/http-get-is-not-allowed-by-access-control-allow-origin-but-ajax-is
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Remove hash # from URL
        // $locationProvider.html5Mode(true);

        // Reroute to home if URL is not valid
        //$urlRouterProvider.otherwise(base);

        // Add JWT to every request to server
        //jwtInterceptorProvider.tokenGetter = function (store) {
        //    return store.get('jwt');
        //};
        //$httpProvider.interceptors.push('jwtInterceptor');

        // For AJAX errors
        $httpProvider.interceptors.push(function ($q, $location) {
            return {
                response: function (response) {
                    return response;
                },
                responseError: function (response) {
                    if (response.status === 401)
                        //$location.url(base);
                    return $q.reject(response);
                }
            };
        });
    })
    .run(function ($rootScope, $state, store, jwtHelper) {
        "use strict";

        $rootScope.message = '';
        // Check status of user on every state change
        // Used for Navbar and blocking pages from unauthorized users
        // Otherwise, just check if the user is logged in
        $rootScope.$on('$stateChangeStart', function (e, to) {
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
    }).controller('milestonesLandingCtrl', function milestonesLandingCtrl($scope) {
        $scope.pageTitle = 'Milestones Landing';

        // Don't think this works, but should dynamically change title of page
        $scope.$on('$routeChangeSuccess', function (e, nextRoute) {
            if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
                $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Milestones Landing';
            }
        });
    });
