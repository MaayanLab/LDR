angular.module('milestonesLanding.formData', [
    'ui.router',
    'angular-storage',
    'milestonesLanding.api'
])

.config(function ($stateProvider) {
    $stateProvider.state('formData', {
        url: '/forms/data',
        controller: 'FormDataCtrl',
        templateUrl: 'views/formData.html',
        data: {
            requiresLogin: true
        }
    });
})
.controller('FormDataCtrl', function($scope, $http, store, $state, $modal, lodash, dataApi) {

    $scope.user = store.get('currentUser');

    var getAllMetaData = function(centerId) {
        var data = ['assays', 'cellLines', 'perturbagens', 'readouts'];
        lodash.each(data, function(val, i) {
            dataApi.get(val, { centerId: centerId }).success(function(serverData) {
                $scope[val] = serverData;
            });
        });
    };

    $scope.selectData = function(inpType, selected) {
        var modalInstance = $modal.open({
            templateUrl: 'views/formModal.html',
            controller: 'FormModalCtrl',
            resolve: {
                data: function () {
                    return {
                        inpType: inpType,
                        selected: selected
                    };
                }
            }
        });
        modalInstance.result.then(function (result) {
            if (result === 'delete') {
                if (inpType === 'Assay') {
                    DataDeletes.deleteAssay(selected._id);
                }
                if (inpType === 'Cell Line') {
                    DataDeletes.deleteCellLine(selected._id);
                }
                if (inpType === 'Perturbagen') {
                    DataDeletes.deletePerturbagen(selected._id);
                }
                if (inpType === 'Readout') {
                    DataDeletes.deleteReadout(selected._id);
                }
            }
            else {
                if (inpType === 'Assay') {
                    DataUpdates.updateAssay(result);
                }
                if (inpType === 'Cell Line') {
                    DataUpdates.updateCellLine(result);
                }
                if (inpType === 'Perturbagen') {
                    DataUpdates.updatePerturbagen(result);
                }
                if (inpType === 'Readout') {
                    DataUpdates.updateReadout(result);
                }
            }
        }, function () {
            getAllMetaData($scope.user.center._id);
        });
    };

    getAllMetaData($scope.user.center._id);
});
