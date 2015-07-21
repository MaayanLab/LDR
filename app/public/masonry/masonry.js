/**
 * @author Michael McDermott
 * Created on 6/23/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .directive('ldrMasonry', ldrMasonry);

    function ldrMasonry() {
            return {
                restrict: 'E',
                required: 'ngModel',
                scope: {
                    resultArray: '='
                },
                templateUrl: 'masonry/masonry.html'
            };
        }
})();
