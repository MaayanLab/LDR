angular.module( 'milestonesLanding', [
    'milestonesLanding.home',
    'milestonesLanding.forms',
    'milestonesLanding.admin',
    'milestonesLanding.formCreate',
    'milestonesLanding.formData',
    'ui.router',
    'ui.bootstrap',
    'angular-storage',
    'angular-jwt'
])
.config(function milestonesLandingConfig($urlRouterProvider, jwtInterceptorProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise(base);

    jwtInterceptorProvider.tokenGetter = function(store) {
        return store.get('jwt');
    };

    $httpProvider.interceptors.push('jwtInterceptor');

    // For AJAX errors
    $httpProvider.interceptors.push(function($q, $location) {
        return {
            response: function(response) {
                return response;
            },
            responseError: function(response) {
                if (response.status === 401)
                    $location.url(base);
                return $q.reject(response);
            }
        };
    });

})
.run(function($rootScope, $state, store, jwtHelper) {
    "use strict";

    $rootScope.message = '';

    $rootScope.$on('$stateChangeStart', function(e, to) {
        $rootScope.currentUser = store.get('currentUser');
        if (to.data) {
            if (to.data.requiresAdmin) {
                if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                    $rootScope.isLoggedIn = false;
                    $rootScope.isLoggedInAdmin = false;
                    e.preventDefault();
                    alert('You must be the authorized to access this page. Please log in.');
                    $state.go('home');
                }
                if ($rootScope.currentUser.username !== 'admin') {
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
                    if ($rootScope.currentUser.username === 'admin') {
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
        } else if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
            $rootScope.isLoggedIn = false;
        } else {
            if ($rootScope.currentUser.username === 'admin') {
                $rootScope.isLoggedIn = true;
                $rootScope.isLoggedInAdmin = true;
            }
            else {
                $rootScope.isLoggedIn = true;
                $rootScope.isLoggedInAdmin = false;
            }
        }
    });
}).controller('milestonesLandingCtrl', function milestonesLandingCtrl ($scope, $rootScope, $http, $state, store, jwtHelper) {

    $scope.base = base;

    $scope.pageTitle = 'Milestones Landing';

    $scope.$on('$routeChangeSuccess', function(e, nextRoute) {
        if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
            $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Milestones Landing' ;
        }
    });

    $scope.user = {};

    $scope.login = function() {
        $http({
            url: base + 'login',
            method: 'POST',
            data: $scope.user
        }).then(function(result) {
            // No error: authentication OK
            store.set('currentUser', result.data.user);
            store.set('jwt', result.data.id_token);
            $state.go('forms');
        }, function(error) {
            // Error: authentication failed
            store.set('message', 'Authentication failed.');
            alert('Login was unsuccessful. Please try again.');
        });
    };

    $scope.logout = function() {
        $rootScope.message = 'Logged out.';
        $http({
            url: base + 'api/logout',
            method: 'GET',
        }).then(function(result) {
            // No Error
            $rootScope.message = result;
            $rootScope.isLoggedIn = false;
            $rootScope.isLoggedInAdmin = false;
            store.remove('jwt');
            alert('Successfully logged out');
            $state.go('home');
        }, function(error) {
            // Error
            $rootScope.message = result;
        });
    };

})

;

