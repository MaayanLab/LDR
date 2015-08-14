/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('ClustModalInstanceCtrl', ClustModalInstanceCtrl);

  /* @ngInject */
  function ClustModalInstanceCtrl($modalInstance, config) {
    var vm = this;
    vm.perturbagens = config.tileInfo.perts;
    vm.close = close;

    function close() {
      $modalInstance.close();
    }
  }
})();
