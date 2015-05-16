angular.module('milestones')
    .directive('lmFormField', function($modal, $q, lodash) {
        return {
            restrict: 'E',
            required: 'ngModel',
            scope: {
                title: '@',
                maxTags: '@',
                placeholder: '@',
                autocompleteEndpoint: '@',
                autocompleteSource: '=',
                ngModel: '='
            },
            templateUrl: 'releases/formField/formField.html',
            link: function(scope, element, attrs) {
                scope.addNew = function(newTag) {
                    if (!newTag.newField) {
                        return true;
                    }
                    /*$modal.open({
                        templateUrl: 'releases/addModal/addModal.html',
                        controller: function($scope, $modalInstance) {
                            $scope.ok = function() {
                                newTag.text = $scope.newText.text;
                                newTag.newField = false;
                                $modalInstance.close();
                            };
                            $scope.cancel = function() {
                                addTag = false;
                                $modalInstance.dismiss('cancel');
                            };
                        }
                    });*/
                    return $q(function(resolve, reject) {
                        $modal.open({
                            templateUrl: 'releases/addModal/addModal.html',
                            controller: function($scope, $modalInstance) {
                                $scope.ok = function() {
                                    newTag.text = $scope.newText.text;
                                    newTag.newField = false;
                                    $modalInstance.close();
                                    resolve(true);
                                };
                                $scope.cancel = function() {
                                    $modalInstance.dismiss('cancel');
                                    reject(false);
                                };
                            }
                        });
                    });
                };
            }
        };
    });
