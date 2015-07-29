/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.phaseTwo', [
      'ui.router'
    ])
    .config(phaseTwoConfig)
    .controller('PhaseTwoController', PhaseTwoController);

  /* @ngInject */
  function phaseTwoConfig($stateProvider) {
    $stateProvider.state('phaseTwo', {
      url: '/phaseTwo',
      templateUrl: 'phaseTwo/phaseTwo.html',
      controller: 'PhaseTwoController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function PhaseTwoController($state, groups) {
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
