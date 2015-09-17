(function() {
  'use strict';

  angular
    .module('ldr')
    .directive('ldrFormField', ldrFormField);

  /* @ngInject */
  function ldrFormField(metadata) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        title: '@',
        name: '@',
        maxTags: '@',
        placeholder: '@',
        useAutocomplete: '@',
        autocompleteOnly: '@',
        autocompleteEndpoint: '@',
        autocompleteSource: '=',
        ngModel: '=',
        isRequired: '@',
        showErrors: '='
      },
      templateUrl: 'partials/formField.html',
      controller: LDRFormFieldController,
      controllerAs: 'vm',
      bindToController: true
    };

    /* @ngInject */
    function LDRFormFieldController(metadata) {

      var vm = this;
      vm.addNew = addNew;

      function addNew(newTag) {
        if (!newTag.newField) {
          return true;
        }
        metadata
          .addNew(newTag, vm.name, vm.ngModel, vm.element)
          .then(function() {}, function() {
            // Modal was dismissed
            vm.ngModel.splice(vm.ngModel.length - 1, 1);
          });
      }
    }
  }
})();
