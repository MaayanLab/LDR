angular.module('milestonesLanding.metadata.overview', [
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

    var dataApi = api('data');

    lodash.each(['assays', 'cellLines'], function(val, i) {
        dataApi.get(val, { centerId: $scope.user.center._id }).success(function(serverData) {
            $scope[val] = serverData;
        });
    });
});
