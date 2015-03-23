angular.module( 'milestonesLanding.formData', [
    'ui.router',
    'angular-storage',
])
.config(function($stateProvider) {
    $stateProvider.state('formData', {
        url: '/forms/data',
        controller: 'FormDataCtrl',
        templateUrl: 'views/formData.html',
        data: {
            requiresLogin: true
        }
    });
}).factory('DataGets', function($http, lodash) {
    // props are in general --> {id: ...} or {centerId: ...}
    return {
        getAssays: function(props) {
            props = lodash.pick(props, lodash.identity);
            if (!props) {
                return $http({
                    url: base + 'api/assays',
                    method: 'GET',
                });
            }
            else if (props.id) {
                return $http({
                    url: base + 'api/assays?id=' + props.id,
                    method: 'GET',
                });
            }
            else if (props.centerId) {
                return $http({
                    url: base + 'api/assays?centerId=' + props.centerId,
                    method: 'GET',
                });
            }
            else {
                console.log('Improper arguments were given to GET request.');
            }
        },
        getCellLines: function(props) {
            props = lodash.pick(props, lodash.identity);
            if (!props) {
                return $http({
                    url: base + 'api/cellLines',
                    method: 'GET',
                });
            }
            else if (props.id) {
                return $http({
                    url: base + 'api/cellLines?id=' + props.id,
                    method: 'GET',
                });
            }
            else if (props.centerId) {
                return $http({
                    url: base + 'api/cellLines?centerId=' + props.centerId,
                    method: 'GET',
                });
            }
            else {
                console.log('Improper arguments were given to GET request.');
            }
        },
        getPerturbagens: function(props) {
            props = lodash.pick(props, lodash.identity);
            if (!props) {
                return $http({
                    url: base + 'api/perturbagens',
                    method: 'GET',
                });
            }
            else if (props.id) {
                return $http({
                    url: base + 'api/perturbagens?id=' + props.id,
                    method: 'GET',
                });
            }
            else if (props.centerId) {
                return $http({
                    url: base + 'api/perturbagens?centerId=' + props.centerId,
                    method: 'GET',
                });
            }
            else {
                console.log('Improper arguments were given to GET request.');
            }
        },
        getReadouts: function(props) {
            props = lodash.pick(props, lodash.identity);
            if (!props) {
                return $http({
                    url: base + 'api/readouts',
                    method: 'GET',
                });
            }
            else if (props.id) {
                return $http({
                    url: base + 'api/readouts?id=' + props.id,
                    method: 'GET',
                });
            }
            else if (props.centerId) {
                return $http({
                    url: base + 'api/readouts?centerId=' + props.centerId,
                    method: 'GET',
                });
            }
            else {
                console.log('Improper arguments were given to GET request.');
            }
        },
        getDiseases: function(props) {
            props = lodash.pick(props, lodash.identity);
            if (!props) {
                return $http({
                    url: base + 'api/assays',
                    method: 'GET',
                });
            }
            else if (props.id) {
                return $http({
                    url: base + 'api/assays?id=' + props.id,
                    method: 'GET',
                });
            }
            else if (props.centerId) {
                return $http({
                    url: base + 'api/assays?centerId=' + props.centerId,
                    method: 'GET',
                });
            }
            else {
                console.log('Improper arguments were given to GET request.');
            }
        }
    };
}).factory('DataPosts', function($http) {
    return {
        postAssay: function(assay) {
            return $http({
                url: base + 'api/assays',
                method: 'POST',
                data: assay
            });
        },
        postCellLine: function(cLine) {
            return $http({
                url: base + 'api/cellLines',
                method: 'POST',
                data: cLine
            });
        },
        postPerturbagen: function(pert) {
            return $http({
                url: base + 'api/perturbagens',
                method: 'POST',
                data: pert
            });
        },
        postReadout: function(rOut) {
            return $http({
                url: base + 'api/readouts',
                method: 'POST',
                data: rOut
            });
        }
    };
}).factory('DataUpdates', function($http) {
    return {
        updateAssay: function(assay) {
            return $http({
                url: base + 'api/assays/update?id=' + assay._id,
                method: 'PUT',
                data: assay
            });
        },
        updateCellLine: function(cLine) {
            return $http({
                url: base + 'api/cellLines/update?id=' + cLine._id,
                method: 'PUT',
                data: cLine
            });
        },
        updatePerturbagen: function(pert) {
            return $http({
                url: base + 'api/perturbagens/update?id=' + pert._id,
                method: 'PUT',
                data: pert
            });
        },
        updateReadout: function(rOut) {
            return $http({
                url: base + 'api/readouts/update?id=' + rOut._id,
                method: 'PUT',
                data: rOut
            });
        },


    };
}).factory('DataDeletes', function($http) {
    return {
        deleteAssay: function(assayId) {
            return $http({
                url: base + 'api/assays/remove?id=' + assayId,
                method: 'DELETE'
            });
        },
        deleteCellLine: function(cLineId) {
            return $http({
                url: base + 'api/cellLines/remove?id=' + cLineId,
                method: 'DELETE'
            });
        },
        deletePerturbagen: function(pertId) {
            return $http({
                url: base + 'api/perturbagens/remove?id=' + pertId,
                method: 'DELETE'
            });
        },
        deleteReadout: function(rOutId) {
            return $http({
                url: base + 'api/readouts/remove?id=' + rOutId,
                method: 'DELETE'
            });
        },


    };
}).controller('FormDataCtrl', function FormDataController ($scope, $http, store, $state, $modal, lodash, FormUpdates, DataGets, DataPosts, DataUpdates, DataDeletes) {

    $scope.user = store.get('currentUser');

    // API calls for data
    DataGets.getAssays({ centerId: $scope.user.center._id }).success(function(assays) {
        $scope.assays = assays;
    });

    DataGets.getCellLines({ centerId: $scope.user.center._id }).success(function(cellLines) {
        $scope.cellLines = cellLines;
    });

    DataGets.getPerturbagens({ centerId: $scope.user.center._id }).success(function(perturbagens) {
        $scope.perturbagens = perturbagens;
    });

    DataGets.getReadouts({ centerId: $scope.user.center._id }).success(function(readouts) {
        $scope.readouts = readouts;
    });

    
    $scope.addNew = function(inpType) {

        var modalInstance = $modal.open({
            templateUrl: 'views/formModal.html',
            controller: 'FormModalCtrl',
            resolve: {
                data: function() {
                    return {
                        inpType: inpType
                    };
                }
            }
        });

        modalInstance.result.then(function(result){
            result.userId = $scope.user._id;
            result.centerId = $scope.user.center._id;
            if(inpType === 'Assay') {
                DataPosts.postAssay(result);
                DataGets.getAssays({ centerId: $scope.user.center._id }).success(function(assays) {
                    $scope.assays = assays;
                });
            }
            if(inpType === 'Cell Line') {
                DataPosts.postAssay(result);
                DataGets.getCellLines({ centerId: $scope.user.center._id }).success(function(cellLines) {
                    $scope.cellLines = cellLines;
                });
            }
            if(inpType === 'Perturbagen') {
                DataPosts.postAssay(result);
                DataGets.getPerturbagens({ centerId: $scope.user.center._id }).success(function(perturbagens) {
                    $scope.perturbagens = perturbagens;
                });
            }
            if(inpType === 'Readout') {
                DataPosts.postAssay(result);
                DataGets.getReadouts({ centerId: $scope.user.center._id }).success(function(readouts) {
                    $scope.readouts = readouts;
                });
            }
            if(inpType === 'Disease') {
                DataPosts.postDisease(result);
                DataGets.getDiseases({ centerId: $scope.user.center._id }).success(function(diseases) {
                    $scope.diseases = diseases;
                });
            }
        });
    };

    $scope.selectData = function(inpType,selected) {

        var modalInstance = $modal.open({
            templateUrl: 'views/formModal.html',
            controller: 'FormModalCtrl',
            resolve: {
                data: function() {
                    return {
                        inpType: inpType,
                        selected: selected
                    };
                }
            }
        });

        modalInstance.result.then(function(result){
            if (result === 'delete') {
                if(inpType === 'Assay') {
                    DataDeletes.deleteAssay(selected._id);
                    DataGets.getAssays({ centerId: $scope.user.center._id }).success(function(assays) {
                        $scope.assays = assays;
                    });
                }
                if(inpType === 'Cell Line') {
                    DataDeletes.deleteCellLine(selected._id);
                    DataGets.getCellLines({ centerId: $scope.user.center._id }).success(function(cellLines) {
                        $scope.cellLines = cellLines;
                    });
                }
                if(inpType === 'Perturbagen') {
                    DataDeletes.deletePerturbagen(selected._id);
                    DataGets.getPerturbagens({ centerId: $scope.user.center._id }).success(function(perturbagens) {
                        $scope.perturbagens = perturbagens;
                    });
                }
                if(inpType === 'Readout') {
                    DataDeletes.deleteReadout(selected._id);
                    DataGets.getReadouts({ centerId: $scope.user.center._id }).success(function(readouts) {
                        $scope.readouts = readouts;
                    });
                }
            }
            else {
                if(inpType === 'Assay') {
                    DataUpdates.updateAssay(result);
                    DataGets.getAssays({ centerId: $scope.user.center._id }).success(function(assays) {
                        $scope.assays = assays;
                    });
                }
                if(inpType === 'Cell Line') {
                    DataUpdates.updateCellLine(result);
                    DataGets.getCellLines({ centerId: $scope.user.center._id }).success(function(cellLines) {
                        $scope.cellLines = cellLines;
                    });
                }
                if(inpType === 'Perturbagen') {
                    DataUpdates.updatePerturbagen(result);
                    DataGets.getPerturbagens({ centerId: $scope.user.center._id }).success(function(perturbagens) {
                        $scope.perturbagens = perturbagens;
                    });
                }
                if(inpType === 'Readout') {
                    DataUpdates.updateReadout(result);
                    DataGets.getReadouts({ centerId: $scope.user.center._id }).success(function(readouts) {
                        $scope.readouts = readouts;
                    });
                }
            }
        });
    };

});
