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
    vm.add = add;

    function getSamples() {
      metadata
        .getSamples(config.sample)
        .success(function(samples) {
          vm.options = samples;
        });
    }

    vm.cancel = cancel;

    function add() {
      var results = [];
      angular.forEach(vm.selected, function(objString) {
        var obj = angular.fromJson(objString);
        var sample = {
          _id: obj._id,
          name: obj.name,
          text: obj.name,
        };
        results.push(sample);
      });
      $modalInstance.close(results);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    getSamples();
  }
})();
