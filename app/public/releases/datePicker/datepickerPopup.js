angular.module('ldr')
    .directive('datepickerPopup', function () {
        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function(scope, element, attr, controller) {
                // Remove the default formatter from the input directive to
                // prevent conflict. See this for more:
                // http://stackoverflow.com/a/27505341/1830334.
                controller.$formatters.shift();
            }
        };
    });
