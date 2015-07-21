/**
 * @author Michael McDermott
 * Created on 7/21/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .directive('groupNameAvailable', groupNameAvailable)
        .factory('groups', groups);

    /* @ngInject */
    function groupNameAvailable($timeout, $q, lodash, groups) {
        return {
            require: 'ngModel',
            link: groupNameAvailableLink
        };

        /////////////////////////////////

        function groupNameAvailableLink(scope, element, attrs, vm) {
            vm.$asyncValidators.groupName = function(modelValue) {
                if (vm.$isEmpty(modelValue)) {
                    return $q.when();
                }
                var DISALLOWED_GROUP_NAMES = [];
                var def = $q.defer();
                $timeout(function() {
                    // Mock a delayed response

                    var lcGroups = lodash.map(groups.getGroupList(),
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
    }

    /* @ngInject */
    function groups($http, api, Upload, lodash) {
        return {
            getGroupList: getGroupList,
            getOneGroup: getOneGroup,
            getAllGroups: getAllGroups,
            getAllGroupUsers: getAllGroupUsers,
            admitUserToGroup: admitUserToGroup,
            changeGroupIcon: changeGroupIcon,
            createGroup: createGroup,
            updateGroup: updateGroup
        };

        ///////////////////////////////////////////

        function getGroupList() {
            var groupList = [];
            getAllGroups()
                .success(function(data) {
                    groupList = lodash.map(data, 'name');
                    return groupList;
                })
                .error(function(resp) {
                    console.log(resp);
                    return groupList;
                }
            );
        }

        function getOneGroup(groupId) {
            return api('group/' + groupId + '/').get();
        }

        function getAllGroups() {
            return api('groups/').get();
        }

        function getAllGroupUsers(groupId) {
            return api('group/' + groupId + '/users/').get();
        }

        function admitUserToGroup(groupId, userId) {
            return api('group/' + groupId + '/users/' + userId + '/approve/')
                .put();
        }

        function changeGroupIcon(groupId, file) {
            if (Array.isArray(file)) {
                return Upload.upload({
                    url: '/LDR/api/secure/group/' + groupId + '/upload/',
                    file: file[0]
                });
            } else {
                return Upload.upload({
                    url: '/LDR/api/secure/group/' + groupId + '/upload/',
                    file: file
                });
            }
        }

        function createGroup(groupToCreate) {
            return $http.post('/LDR/api/group/create/', groupToCreate);
        }

        function updateGroup(groupId, updatedGroup) {
            return api('group/' + groupId + '/update/').put(updatedGroup);
        }

    }

})();