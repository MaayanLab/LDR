angular.module('milestonesLanding.register', [
    'ui.router',
    'angular-storage'
])
    .config(function ($stateProvider) {
        $stateProvider.state('register', {
            url: base + 'register',
            controller: 'RegisterCtrl',
            templateUrl: 'views/register.html',
            data: {
                loggedIn: true
            }
        });
    })
    .factory('CentersGet', function($http) {
        return {
            getCenters: function() {
                return $http({
                    url: base + 'api/centers',
                    method: 'GET'
                });
            }
        };
    })
    .factory('UsersGet', function($http) {
        return {
            getUsers: function() {
                return $http({
                    url: base + 'api/users',
                    method: 'GET'
                });
            }
        }
    })
    .directive('usernameAvailable', function($http, $timeout, $q, UsersGet) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.username = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        // consider empty model valid
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

                    }, 2000);

                    return def.promise;
                };
            }
        };
    })
    .controller('RegisterCtrl', function LoginController($scope, $http, store, $state, CentersGet) {
        $scope.centers = [];
        CentersGet.getCenters().success(function(data) {
            $scope.centers = data;
        });
        
        $scope.userList;
        $http({
            url: base + 'api/users',
            method: 'GET'
        }).success(function(data) {
            $scope.userList = data;
        });

        $scope.user = {};
        $scope.createUser = function () {
            $scope.user.center = $scope.user.center._id;
            console.log($scope.user);
            $http({
                url: '/register',
                method: 'POST',
                data: $scope.user
            });
            $scope.user = {};
        }
    });
