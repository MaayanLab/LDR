(function() {

    angular
        .module('ldr')
        .controller('ModalInstanceCtrl', ModalInstanceCtrl);

    /* @ngInject */
    function ModalInstanceCtrl($modalInstance, config, api) {
        // name = assay, cellLines, readouts, perturbagens, relevantDisease

        var vm = this;

        vm.name = config.name;
        vm.newTag = config.newTag;
        vm.model = config.model;
        vm.element = config.element;

        vm.ok = ok;
        vm.save = save;
        vm.cancel = cancel;

        function ok() {
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
                console.log($scope.newTag);
                $scope.save();
            })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    $scope.cancel();
                });
        }

        function save() {
            $scope.model[$scope.model.length - 1] = $scope.newTag;
            $modalInstance.close();
        }

        function cancel() {
            $scope.model.splice($scope.model.length - 1, 1);
            $modalInstance.dismiss('cancel');
        }
    }
})();
