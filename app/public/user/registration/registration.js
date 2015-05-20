angular.module('ldr.user.registration', [
    'ui.router',
    'ldr.api'
])

.config(function ($stateProvider) {
    $stateProvider.state('userRegistration', {
        url: '/user/registration',
        controller: 'RegisterCtrl',
        templateUrl: 'user/registration/registration.html',
        data: {
            loggedIn: true
        }
    });
})

.directive('emailAvailable', function($timeout, $q) {
    var isValidEmail = function(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    };

    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$asyncValidators.email = function(modelValue, viewValue) {
                if (ctrl && ctrl.$validators.email) {
                    ctrl.$validators.email = function(modelValue) {
                        return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                    };
                }
                /*console.log(modelValue);
                if (ctrl.$isEmpty(modelValue)) {
                    console.log('empty');
                    return $q.when();
                }

                var def = $q.defer();
                $timeout(function() {
                    if (isValidEmail(modelValue)) {
                        console.log('not rejectin');
                        def.resolve();
                    } else {
                        console.log('rejectin');
                        def.reject();
                    }
                }, 2000);
                return def.promise;*/
            };
        }
    };
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
                }, 2000);
                return def.promise;
            };
        }
    };
})

.controller('RegisterCtrl', function LoginController($scope, $http, store, $state, api) {
    $scope.centers = [];
    api('centers').get().success(function(data) {
        $scope.centers = data;
    });

    $scope.userList = [];
    
    api('users').get().success(function(data) {
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
    };
});