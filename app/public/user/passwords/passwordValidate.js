/**
 * @author Michael McDermott
 * Created on 5/20/15.
 */

angular.module('ldr')
    .directive("passwordStrength", function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                // Passwords must be 8-20 characters with alphanumeric characters and !@#$% special characters
                // Must include at least one uppercase letter, one lowercase letter, and one numeric digit
                var passwordTest = /^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/;
                scope.$watch(attrs.passwordStrength, function(value) {
                    if (angular.isDefined(value)) {
                        scope.passwordIsValid = passwordTest.test(value);
                    }
                });
            }
        };
    })
    .directive('comparePasswordTo', function() {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, model) {
                if (!attrs.comparePasswordTo) {
                    console.error('comparePasswordTo expects a model as an argument!');
                    return;
                }
                scope.$watch(attrs.comparePasswordTo, function (value) {
                    // Only compare values if the second ctrl has a value.
                    if (model.$viewValue !== undefined && model.$viewValue !== '') {
                        model.$setValidity('comparePasswordTo', value === model.$viewValue);
                    }
                });
                model.$parsers.push(function (value) {
                    // Mute the nxEqual error if the second ctrl is empty.
                    if (value === undefined || value === '') {
                        model.$setValidity('comparePasswordTo', true);
                        return value;
                    }
                    var isValid = value === scope.$eval(attrs.comparePasswordTo);
                    model.$setValidity('comparePasswordTo', isValid);
                    return isValid ? value : undefined;
                });
            }
        };
    });