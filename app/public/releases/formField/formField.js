angular.module('ldr')
    .directive('lmFormField', function($modal, lodash) {
        return {
            restrict: 'E',
            required: 'ngModel',
            scope: {
                title: '@',
                name: '@',
                maxTags: '@',
                placeholder: '@',
                autocompleteEndpoint: '@',
                autocompleteSource: '=',
                ngModel: '=',
                isRequired: '@'
            },
            templateUrl: 'releases/formField/formField.html',
            link: function(scope, element, attrs) {
                scope.addNew = function(newTag) {
                    if (!newTag.newField) {
                        return true;
                    }
                    $modal.open({
                        templateUrl: 'releases/addModal/addModal.html',
                        controller: 'ModalInstanceCtrl',
                        resolve: {
                            config: function() {
                                return {
                                    newTag: newTag,
                                    name: scope.name,
                                    model: scope.ngModel,
                                    element: element
                                };
                            }
                        }
                    });
                    return true;
                };
            }
        };
    });
