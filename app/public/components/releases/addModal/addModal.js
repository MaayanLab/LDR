(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);

  /* @ngInject */
  function ModalInstanceCtrl($modalInstance, config, api) {
    // name = assay, cellLines, readouts, perturbagens, relevantDisease

    var vm = this;

    vm.name = config.name;
    vm.newTag = config.newTag;
    vm.model = config.model;
    vm.element = config.element;

    vm.ok = ok;
    vm.save = save;
    vm.cancel = cancel;

    function ok() {
      vm.newTag.text = vm.newTag.name;
      delete vm.newTag.newField;
      var post;
      if (vm.name === 'assay') {
        post = api('assays').post(vm.newTag);
      } else if (vm.name === 'cellLines') {
        post = api('cellLines').post(vm.newTag);
      } else if (vm.name === 'perturbagens') {
        post = api('perturbagens').post(vm.newTag);
      } else if (vm.name === 'readouts') {
        post = api('readouts').post(vm.newTag);
      } else if (vm.name === 'manipulatedGene') {
        post = api('genes').post(vm.newTag);
      } else if (vm.name === 'relevantDisease') {
        post = api('diseases').post(vm.newTag);
      } else if (vm.name === 'organism') {
        post = api('organisms').post(vm.newTag);
      } else if (vm.name === 'analysisTools') {
        post = api('tools').post(vm.newTag);
      }

      post.success(function(resp) {
          vm.newTag._id = resp;
          save();
        })
        .error(function(resp) {
          console.log('error:');
          console.log(resp);
          alert('There was an error saving the data. ' +
            'Please try again later.');
          cancel();
        });
    }

    function save() {
      vm.model[vm.model.length - 1] = vm.newTag;
      $modalInstance.close();
    }

    function cancel() {
      vm.model.splice(vm.model.length - 1, 1);
      $modalInstance.dismiss('cancel');
    }
  }
})();
