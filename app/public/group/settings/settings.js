/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

(function() {
  'use strict';

  angular.module('ldr.group.settings', [
      'ui.router',
      'angular-storage'
    ])
    .config(groupSettingsConfig)
    .controller('GroupSettingsCtrl', GroupSettingsCtrl);

  /* @ngInject */
  function groupSettingsConfig($stateProvider) {
    // UI Router state userSettings
    $stateProvider.state('groupSettings', {
      url: '/group/{id:string}/settings',
      templateUrl: 'group/settings/settings.html',
      controller: 'GroupSettingsCtrl',
      controllerAs: 'vm',
      data: {
        requiresLogin: true,
        requiresAdmitted: true
      }
    });
  }

  /* @ngInject */
  function GroupSettingsCtrl($stateParams, $state, groups) {

    var vm = this;
    vm.groupId = $stateParams.id;
    vm.group = {};
    vm.getGroup = getGroup;
    vm.updateGroup = updateGroup;

    function getGroup() {
      groups
        .getOneGroup(vm.groupId)
        .success(function(group) {
          vm.group = angular.copy(group);
        })
        .error(function(resp) {
          console.log(resp);
        });
    }

    function updateGroup() {
      groups.updateGroup(vm.groupId, vm.group)
        .success(function() {
          alert('Group updated successfully');
          $state.go('groupHome', {
            id: vm.groupId
          });
        })
        .error(function(resp) {
          alert('An error occurred updating the group');
          console.log(resp);
        });
    }

    getGroup();
  }
})();
