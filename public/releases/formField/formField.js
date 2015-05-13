angular.module('milestones')

.directive('lmFormField', function() {
    return {
        restrict: 'E',
        required: 'ngModel',
        scope: {
            title: '@',
            maxTags: '@',
            placeholder: '@',
            autocompleteSource: '&',
            ngModel: '='
        },
        templateUrl: 'releases/formField/formField.html',
        link: function(scope, element, attrs) {
            scope.clearSelection = function() {
                angular.copy([], scope.ngModel);
            };
            scope.openModal = function() {
                console.log('open modal');
            };
        }
    };
});
