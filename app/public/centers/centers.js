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
  function CentersController($state) {
    var vm = this;
    vm.goToPhase = goToPhase;

    function goToPhase(phaseNum) {
      $state.go('phase' + phaseNum);
    }

  }
})();
