/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.centers.dcic', [
      'ui.router'
    ])
    .config(dcicConfig)
    .controller('DCICController', DCICController);

  /* @ngInject */
  function dcicConfig($stateProvider) {
    $stateProvider.state('dcic', {
      url: '/centers/dcic',
      templateUrl: 'centers/dcic/dcic.html',
      controller: 'DCICController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function DCICController() {

  }
})();
