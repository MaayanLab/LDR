angular.module('ldr')
    .controller('ModalInstanceCtrl', function($scope, $modalInstance,
                                              config, api) {
        // name = assay, cellLines, readouts, perturbagens, relevantDisease
        $scope.name = config.name;
        $scope.newTag = config.newTag;
        $scope.model = config.model;
        $scope.element = config.element;
        console.log($scope.name);

        $scope.ok = function() {
            $scope.newTag.text = $scope.newTag.name;
            delete $scope.newTag.newField;
            var post;
            if ($scope.name === 'assay') {
                post = api('assays').post($scope.newTag);
            } else if ($scope.name === 'cellLines') {
                post = api('cellLines').post($scope.newTag);
            } else if ($scope.name === 'perturbagens') {
                post = api('perturbagens').post($scope.newTag);
            } else if ($scope.name === 'readouts') {
                post = api('readouts').post($scope.newTag);
            } else if ($scope.name === 'manipulatedGene') {
                post = api('genes').post($scope.newTag);
            } else if ($scope.name === 'relevantDisease') {
                post = api('diseases').post($scope.newTag);
            } else if ($scope.name === 'organism') {
                post = api('organisms').post($scope.newTag);
            } else if ($scope.name === 'analysisTools') {
                post = api('tools').post($scope.newTag);
            }

            post.success(function(resp) {
                $scope.newTag._id = resp;
                $scope.save();
            })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    $scope.cancel();
                });
        };

        $scope.save = function() {
            $scope.model[$scope.model.length - 1] = $scope.newTag;
            $modalInstance.close();
        };

        $scope.cancel = function() {
            $scope.model.splice($scope.model.length - 1, 1);
            $modalInstance.dismiss('cancel');
        };
    });

