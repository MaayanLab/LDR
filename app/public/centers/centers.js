/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.centers', [
      'ui.router'
    ])
    .config(centersConfig)
    .controller('CentersController', CentersController);

  /* @ngInject */
  function centersConfig($stateProvider) {
    $stateProvider.state('centers', {
      url: '/centers',
      templateUrl: 'centers/centers.html',
      controller: 'CentersController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function CentersController($state, groups) {
    var vm = this;
    vm.groups = [];
    vm.goToGroup = goToGroup;

    function getAllGroups() {
      groups
        .getAllGroups()
        .success(function(data) {
          vm.groups = data;
        })
        .error(function(resp) {
          console.log(resp);
        }
      );
    }

    function goToGroup(groupId) {
      $state.go('groupHome', {id: groupId });
    }

    getAllGroups();
  }
})();
