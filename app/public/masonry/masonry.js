/**
 * @author Michael McDermott
 * Created on 6/23/15.
 */
angular.module('ldr')
    .directive('ldrMasonry', function() {
        return {
            restrict: 'E',
            required: 'ngModel',
            scope: {
                resultArray: '='
            },
            templateUrl: 'masonry/masonry.html'
        };
    });
