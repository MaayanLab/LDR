/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.centers.dsgc', [
      'ui.router'
    ])
    .config(dsgcConfig)
    .controller('DSGCController', DSGCController);

  /* @ngInject */
  function dsgcConfig($stateProvider) {
    $stateProvider.state('dsgc', {
      url: '/centers/dsgc',
      templateUrl: 'centers/dsgc/dsgc.html',
      controller: 'DSGCController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function DSGCController() {

  }
})();
