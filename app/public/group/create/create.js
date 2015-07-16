/**
 * @author Michael McDermott
 * Created on 5/27/15.
 */

angular.module('ldr.group.create', [
    'ui.router',
    'ldr.api',
    'ngLodash'
])

    .config(function($stateProvider) {
        $stateProvider.state('groupCreate', {
            url: '/group/create',
            controller: 'GroupCreateCtrl',
            templateUrl: 'group/create/create.html',
            data: {
            }
        });
    })

    .directive('groupNameAvailable', function($timeout, $q, lodash) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.groupName = function(modelValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return $q.when();
                    }
                    var DISALLOWED_GROUP_NAMES = [];
                    var def = $q.defer();
                    $timeout(function() {
                        // Mock a delayed response

                        var lcGroups = lodash.map(scope.groupList,
                            function(name) {
                                return name.toLowerCase();
                            });

                        // Add all disallowed group names as if they are taken
                        lcGroups.push.apply(lcGroups, DISALLOWED_GROUP_NAMES);

                        if (lcGroups.indexOf(modelValue.toLowerCase()) === -1) {
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

    .controller('GroupCreateCtrl', function($rootScope, $scope, $http,
                                            store, $state, api, lodash) {

        $scope.groupList = [];


        api('groups/').get().success(function(data) {
            $scope.groupList = lodash.map(data, 'name');
        });

        $scope.reset = function(form) {
            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }
            $scope.group = {
                name: '',
                abbr: '',
                homepage: '',
                email: '',
                description: '',
                location: ''
            };
        };

        $scope.createGroup = function() {
            $http.post('/LDR/api/group/create/', $scope.group)
                .success(function(group) {
                    // Check if there is a logged in user.
                    // If there is add them to the group and admit them.
                    if (store.get('currentUser')) {
                        var currentUser = store.get('currentUser');

                        // Server will take care of admitting a
                        // user if there is no one else in the group
                        api('group/' + group._id + '/users/' +
                            currentUser._id + '/approve/')
                            .put()
                            .success(function() {
                                $state.go('groupHome');
                            });
                    }
                    else if(store.get('userReg')) {
                        // If locally stored userReg, then the
                        // user is coming from the registration page.

                        // Add the group to userReg and
                        // DANGEROUSLY set them as admitted
                        var userReg = store.get('userReg');
                        userReg.group = group;
                        userReg.admitted = true;

                        // Remove the current userReg and add a new one.
                        store.remove('userReg');
                        store.set('userReg', userReg);

                        // Go back to the registration page
                        $state.go('userRegistration');
                    }
                });
        };

        $scope.reset();
    });
