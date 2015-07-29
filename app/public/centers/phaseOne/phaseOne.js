/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.centers.phaseOne', [
      'ui.router'
    ])
    .config(phaseOneConfig)
    .controller('PhaseOneController', PhaseOneController);

  /* @ngInject */
  function phaseOneConfig($stateProvider) {
    $stateProvider.state('phaseOne', {
      url: '/centers/phaseOne',
      templateUrl: 'centers/phaseOne/phaseOne.html',
      controller: 'PhaseOneController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function PhaseOneController() {

  }
})();
