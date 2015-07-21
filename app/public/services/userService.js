/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .factory('userManagement', userManagement)
        .directive('usernameAvailable', usernameAvailable);


    /* @ngInject */
    function userManagement(api, store) {
        return {
            changePassword: changePassword,
            updateUser: updateUser
        };

        /////////////////

        /**
         * @name changePassword
         * @desc Change the user's password
         * @param {String} oldP: old password
         * @param {String} newP: new password
         * @param {String} confirmP: new password again to confirm
         */
        function changePassword(oldP, newP, confirmP) {
            var passwords = {
                old: oldP,
                new: newP,
                confirm: confirmP
            };

            return api('user/' + id + '/changePassword/').put(passwords);
        }

        /**
         * @name updateUser
         * @desc Update a user in the database
         * @param {String} userId: the ID of the user being updated
         * @param {Object} newUser: the new user information to update with
         */
        function updateUser(userId, newUser) {
            newUser.name = newUser.firstName + ' ' +
                newUser.lastName;
            api('user/' + userId + '/update/')
                .put(newUser)
                .success(function() {
                    store.set('currentUser', newUser);
                    alert('User updated successfully');
                }
            );
        }
    }

    /* @ngInject */
    function usernameAvailable($timeout, $q, lodash) {
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
    }
})();