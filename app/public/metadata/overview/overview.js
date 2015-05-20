angular.module('ldr.metadata.overview', [
    'ui.router',
    'angular-storage'
])

.config(function ($stateProvider) {
    $stateProvider.state('metadata', {
        url: 'metadata/overview',
        controller: 'MetadataCtrl',
        templateUrl: 'metadata/overview/overview.html',
        data: {
            requiresLogin: true
        }
    });
})

.controller('MetadataCtrl', function($scope, $http, store, $state, $modal, lodash, api) {

    $scope.user = store.get('currentUser');

    $scope.categories = [
        {
            name: 'assays',
            title: 'Assays',
            header: ['Name', 'Type'],
            data: undefined
        },
        {
            name: 'cellLines',
            title: 'Cell Lines',
            header: ['Name', 'Type', 'Class', 'Tissue'],
            data: undefined
        },
        {
            name: 'perturbagens',
            title: 'Perturbagens',
            header: ['Name', 'Type'],
            data: undefined
        },
        {
            name: 'readouts',
            title: 'Readouts',
            header: ['Name', 'Type'],
            data: undefined
        }
    ];

    /*var dataApi = api('data');
    lodash.each($scope.categories, function(obj, i) {
        var name = obj.name;
        dataApi.get(name, { centerId: $scope.user.center._id }).success(function(serverData) {
            var obj = lodash.where($scope.categories, { name: name })[0];
            obj.data = serverData;
        });
    });*/
});
