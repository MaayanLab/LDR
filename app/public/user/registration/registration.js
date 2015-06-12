angular.module('ldr.user.registration', [
    'ui.router',
    'ldr.api',
    'ngLodash'
])

    .config(function($stateProvider) {
        $stateProvider.state('userRegistration', {
            url: '/user/registration/',
            controller: 'RegisterCtrl',
            templateUrl: 'user/registration/registration.html',
            data: {
                loggedIn: true
            }
        });
    })

    .directive('usernameAvailable', function($timeout, $q, lodash) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.username = function(modelValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return $q.when();
                    }

                    var DISALLOWED_USER_NAMES = [];
                    var def = $q.defer();
                    $timeout(function() {
                        // Mock a delayed response

                        var lcUsers = lodash.map(scope.userList,
                            function(name) {
                                return name.toLowerCase();
                            });

                        // Add all disallowed user names as if they are taken
                        lcUsers.push.apply(lcUsers, DISALLOWED_USER_NAMES);

                        if (lcUsers.indexOf(modelValue.toLowerCase()) === -1) {
                            // The username is available
                            def.resolve();
                        } else {
                            def.reject();
                        }
                    }, 1000);
                    return def.promise;
                };
            }
        };
    })

    .controller('RegisterCtrl', function($rootScope, $scope, $http,
                                         store, $state, api, lodash) {

        $scope.groups = [];
        $scope.userList = [];

        // Check if userReg is stored locally. If it is, populate the form
        var init = function() {
            var user = store.get('userReg');
            if (user) {
                $scope.user = user;
            }
            else {
                $scope.reset();
            }
        };

        api('groups/')
            .get()
            .success(function(data) {
            $scope.groups = lodash.filter(data, function(obj) {
                return obj.name !== 'NIH';
            });
        });

        api('users/')
            .get()
            .success(function(data) {
            $scope.userList = lodash.map(data, 'username');
        });

        $scope.reset = function(form) {
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $scope.user = {
                username: '',
                password: '',
                passwordConfirm: '',
                firstName: '',
                lastName: '',
                email: '',
                group: {
                    name: ''
                },
                location: '',
                fieldOfStudy: '',
                homepage: 'http://'
            };
        };

        $scope.createGroup = function() {
            // Store user locally so he may return and fill out form
            store.set('userReg', $scope.user);
            $state.go('groupCreate');
        };

        $scope.createUser = function() {
            // Combine first and last name into one name field
            $scope.user.name = $scope.user.firstName + ' ' +
                $scope.user.lastName;
            $http.post('/LDR/register', $scope.user)
                .success(function(response) {
                    alert('User created successfully');
                    $scope.setCurrentUser(response.user, response.id_token);
                    store.remove('userReg');
                    $state.go('home');
                });
        };

        init();
    });
