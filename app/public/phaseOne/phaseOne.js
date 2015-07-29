/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.phaseOne', [
      'ui.router'
    ])
    .config(phaseOneConfig)
    .controller('PhaseOneController', PhaseOneController);

  /* @ngInject */
  function phaseOneConfig($stateProvider) {
    $stateProvider.state('phaseOne', {
      url: '/phaseOne',
      templateUrl: 'phaseOne/phaseOne.html',
      controller: 'PhaseOneController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function PhaseOneController($state, groups) {
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
