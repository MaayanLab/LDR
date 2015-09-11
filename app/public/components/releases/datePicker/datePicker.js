(function() {
  'use strict';

  angular.module('ldr')
    .directive('ldrDatePicker', ldrDatePicker);

  function ldrDatePicker() {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        level: '@',
        ngModel: '='
      },
      templateUrl: 'partials/datePicker.html',
      link: function(scope, element) {
        scope.open = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          scope.opened = true;
        };
        //scope.format = 'dd-MMMM-yyyy';
      }
    };
  }
})();
