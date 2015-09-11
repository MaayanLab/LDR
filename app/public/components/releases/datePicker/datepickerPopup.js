(function() {
  'use strict';

  angular
    .module('ldr')
    .directive('datepickerPopup', datepickerPopup);

  function datepickerPopup() {
    return {
      restrict: 'EAC',
      require: 'ngModel',
      link: function(scope, element, attr, vm) {
        // Remove the default formatter from the input directive to
        // prevent conflict. See this for more:
        // http://stackoverflow.com/a/27505341/1830334.
        vm.$formatters.shift();
      }
    };
  }
})();
