angular.module('ldr')
    .controller('ModalInstanceCtrl', function($scope, $modalInstance,
                                              config, nameServer) {
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
                post = nameServer.post('assay', $scope.newTag);
            }
            if ($scope.name === 'cellLines') {
                post = nameServer.post('cell', $scope.newTag);
            }
            if ($scope.name === 'perturbagens') {
                post = nameServer.post('perturbagen', $scope.newTag);
            }
            if ($scope.name === 'readouts') {
                post = nameServer.post('readout', $scope.newTag);
            }
            if ($scope.name === 'manipulatedGene') {
                post = nameServer.post('gene', $scope.newTag);
            }
            if ($scope.name === 'organism') {
                post = nameServer.post('organism', $scope.newTag);
            }
            if ($scope.name === 'relevantDisease') {
                post = nameServer.post('disease', $scope.newTag);
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

