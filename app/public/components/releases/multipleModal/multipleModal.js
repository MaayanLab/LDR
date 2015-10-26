(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('MultipleModalInstanceCtrl', MultipleModalInstanceCtrl);

  /* @ngInject */
  function MultipleModalInstanceCtrl($modalInstance, config, metadata) {

    // config.sample is name of field where 'select multiple' was selected

    var vm = this;
    vm.selected = [];
    vm.options = [];
    vm.ok = ok;

    function getSamples() {
      metadata
        .getSamples(config.sample)
        .success(function(samples) {
          vm.options = samples;
        });
    }

    vm.cancel = cancel;

    function ok() {
      var results = [];
      angular.forEach(vm.selected, function(objString) {
        results.push(angular.fromJson(objString));
      });
      $$modalInstance.close(results);

    }

    function save() {}

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    getSamples();
  }
})();
