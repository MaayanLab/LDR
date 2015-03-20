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
                url: base + 'api/assays/add',
                method: 'POST',
                data: assay
            });
        },
        postCellLine: function(cLine) {
            return $http({
                url: base + 'api/cellLines/add',
                method: 'POST',
                data: cLine
            });
        },
        postPerturbagen: function(pert) {
            return $http({
                url: base + 'api/perturbagens/add',
                method: 'POST',
                data: pert
            });
        },
        postReadout: function(rOut) {
            return $http({
                url: base + 'api/readouts/add',
                method: 'POST',
                data: rOut
            });
        }
    };
}).factory('DataDeletes', function($http) {
    return {
        deleteAssay: function(assayId) {
            return $http({
                url: base + 'api/assays?id=' + assayId,
                method: 'DELETE'
            });
        },
        deleteCellLine: function(cLineId) {
            return $http({
                url: base + 'api/cellLines?id=' + cLineId,
                method: 'DELETE'
            });
        },
        deletePerturbagen: function(pertId) {
            return $http({
                url: base + 'api/perturbagens?id=' + pertId,
                method: 'DELETE'
            });
        },
        deleteReadout: function(rOutId) {
            return $http({
                url: base + 'api/readouts?id=' + rOutId,
                method: 'DELETE'
            });
        },
       

    };
}).controller('FormDataCtrl', function FormDataController ($scope, $http, store, $state, $modal, lodash, FormUpdates, DataGets, DataPosts) {

    var currentUser = store.get('currentUser');
    $scope.user = currentUser;

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

    
    
});
