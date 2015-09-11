(function() {
  'use strict';

  angular
    .module('ldr')
    .directive('ldrEnforceMaxTags', ldrEnforceMaxTags);

  function ldrEnforceMaxTags() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$parsers.push(function(value) {
          if (value && attrs.maxTags && value.length > attrs.maxTags) {
            value.splice(value.length - 1, 1);
          }
          return value;
        });
      }
    };
  }
})();
