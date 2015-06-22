angular.module('ldr', [
    'ldr.nav',
    'ldr.home',
    'ldr.bar',
    'ldr.group.home',
    'ldr.group.create',
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
    .directive('title', ['$rootScope', '$timeout',
        function($rootScope, $timeout) {
            return {
                link: function() {
                    var listener = function(event, toState) {
                        $timeout(function() {
                            $rootScope.title =
                                (toState.data && toState.data.pageTitle) ?
                                    toState.data.pageTitle :
                                    'LINCS Data Registry';
                        });
                    };
                    $rootScope.$on('$stateChangeSuccess', listener);
                }
            };
        }
    ])

    .config(function ldrConfig($urlRouterProvider, jwtInterceptorProvider,
                               $httpProvider) {

        // Add JWT to every request to server
        jwtInterceptorProvider.tokenGetter = function(store) {
            return store.get('jwt');
        };
        $httpProvider.interceptors.push('jwtInterceptor');

        /*
         // For AJAX errors
         $httpProvider.interceptors.push(function($q) {
         return {
         response: function(response) {
         return response;
         },
         responseError: function(response) {
         if (response.status === 401)
         return $q.reject(response);
         }
         };
         });
         */
    })

    .run(function($rootScope, $state, store, jwtHelper) {

        $rootScope.currentUser = store.get('currentUser');
        // Check status of user on every state change
        // Used for Navbar and blocking pages from unauthorized users
        // Otherwise, just check if the user is logged in
        $rootScope.$on('$stateChangeStart', function(e, to) {
            // Get current user
            $rootScope.currentUser = store.get('currentUser');

            // Check if the state requires login or admin privileges
            if (to.data) {
                if (to.data.requiresAdmitted) {
                    // Logged in but not admitted to group
                    if ($rootScope.currentUser.admitted !== true) {
                        $rootScope.isLoggedIn = true;
                        $rootScope.isLoggedInAdmin = false;
                        $rootScope.isAdmitted = false;
                        e.preventDefault();
                        alert('You have not yet been admitted to this group! ' +
                            'Someone must accept you before you can view ' +
                            'releases and submit new ones.');
                        $state.go('home');
                    }
                }
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
                    $rootScope.isAdmitted = true;
                }
                else if ($rootScope.currentUser.admitted) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.isAdmitted = true;
                }
                else {
                    $rootScope.isLoggedIn = true;
                    $rootScope.isLoggedInAdmin = false;
                }
            }
        });

        $rootScope.$on('$routeChangeSuccess', function(event, current) {
            if (current.hasOwnProperty('$$route')) {
                $rootScope.title = current.$$route.title;
            }
        });
    })
    .controller('ldrCtrl', function($scope, store) {
        $scope.pageTitle = 'LINCS Dataset Registry';
        $scope.currentUser = store.get('currentUser');
    });
