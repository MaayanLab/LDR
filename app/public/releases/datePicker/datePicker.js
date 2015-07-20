(function() {

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
            templateUrl: 'releases/datePicker/datePicker.html',
            link: function(scope, element, attrs) {
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