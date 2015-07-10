angular.module('ldr')
    .directive('ldrFormField', function($modal) {
        return {
            restrict: 'E',
            required: 'ngModel',
            scope: {
                title: '@',
                name: '@',
                maxTags: '@',
                placeholder: '@',
                useAutocomplete: '@',
                autocompleteOnly: '@',
                autocompleteEndpoint: '@',
                autocompleteSource: '=',
                ngModel: '=',
                isRequired: '@',
                showErrors: '='
            },
            templateUrl: 'releases/formField/formField.html',
            link: function(scope, element) {
                scope.addNew = function(newTag) {
                    if (!newTag.newField) {
                        return true;
                    }
                    $modal
                        .open({
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
                        })
                        .result.then(function () {
                        }, function () {
                            // Modal was dismissed
                            scope.ngModel.splice(scope.ngModel.length - 1, 1);
                        });
                    return true;
                };
            }
        };
    });
