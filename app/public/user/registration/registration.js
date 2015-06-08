angular.module('ldr.user.registration', [
    'ui.router',
    'ldr.api'
])

    .config(function($stateProvider) {
        $stateProvider.state('userRegistration', {
            url: '/user/registration',
            controller: 'RegisterCtrl',
            templateUrl: 'user/registration/registration.html',
            data: {
                loggedIn: true
            }
        });
    })

    .directive('usernameAvailable', function($timeout, $q) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.username = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return $q.when();
                    }

                    var def = $q.defer();
                    $timeout(function() {
                        // Mock a delayed response
                        if (scope.userList.indexOf(modelValue) === -1) {
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

    .controller('RegisterCtrl', function LoginController(
        $rootScope, $scope, $http, store, $state, api, lodash) {

        // TODO: Validation of registration form (Partially there)
        $scope.groups = [];
        $scope.userList = [];

        api('groups/').get().success(function(data) {
            $scope.groups = data;
        });

        api('users/').get().success(function(data) {
            $scope.userList = lodash.map(data, 'username');
        });

        var reset = function() {
            $scope.user = {
                username: '',
                password: '',
                passwordConfirm: '',
                email: '',
                group: {
                    name: ''
                },
                location: '',
                fieldOfStudy: '',
                homepage: 'http://'
            };
        };

        $scope.createUser = function() {
            $http.post('/LDR/register', $scope.user)
                .success(function(response) {
                    alert('User created successfully');
                    $scope.setCurrentUser(response.user, response.id_token);
                    $state.go('home');
                });
        };

        reset();
    });
