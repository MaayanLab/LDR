angular.module( 'milestonesLanding', [
    'milestonesLanding.home',
    'milestonesLanding.login',
    'milestonesLanding.forms',
    'milestonesLanding.formCreate',
    'ui.router',
    'ui.bootstrap',
    'angular-storage',
    'angular-jwt'
])
.config(function milestonesLandingConfig($urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/MilestonesLanding');

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
                    $location.url('/login');
                return $q.reject(response);
            }
        };
    });

})
.run(function($rootScope, $state, store, jwtHelper) {
    "use strict";
    $rootScope.message = '';

    $rootScope.$on('$stateChangeStart', function(e, to) {
        if (to.data && to.data.requiresLogin) {
            if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                $rootScope.isLoggedIn = false;
                e.preventDefault();
                alert('You must be authorized to access this page. Please log in.');
                $state.go('login');
            } else {
                $rootScope.currentUser = store.get('currentUser');
                $rootScope.isLoggedIn = true;
            }
        }
    });



}).controller('milestonesLandingCtrl', function milestonesLandingCtrl ($scope, $rootScope, $http, $state, store, jwtHelper) {

    $scope.pageTitle = 'Milestones Landing';

    $scope.$on('$routeChangeSuccess', function(e, nextRoute) {
        if (nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)) {
            $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Milestones Landing' ;
        }
    });
 
    $scope.logout = function() {
        $rootScope.message = 'Logged out.';
        $http({
            url:'http://localhost:3001/logout',
            method: 'GET',
        }).then(function(result) {
            // No Error
            $rootScope.message = result;
            $rootScope.isLoggedIn = false;
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

