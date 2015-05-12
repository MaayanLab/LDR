angular.module('milestonesLanding.dataRelease.overview', [
    'ui.router',
    'angular-storage',
    'milestonesLanding.api'
])

// UI Router state forms
.config(function ($stateProvider) {
    $stateProvider.state('dataReleaseOverview', {
        url: '/data-release/overview',
        templateUrl: 'dataRelease/overview/overview.html',
        controller: 'dataRelease.overview.ctrl',
        data: {
            requiresLogin: true
        }
    });

})

.controller('dataRelease.overview.ctrl', function($scope, $http, store, $state, api) {
    var currentUser = store.get('currentUser'),
        dataApi = api('data');

    $scope.user = currentUser;
    $scope.forms = [];

    dataApi.get({ centerId: $scope.user.center._id }).success(function(data) {
        $scope.forms = data;
    });

    $scope.editForm = function(form) {
        // TODO: Route to editing of form here
        store.set('formToEdit', form);
        $state.go('formsCreate');
    };

    $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            dataApi.del({ formId: form._id }).success(function (data) {
                dataApi.get({ userId: $scope.user._id }).success(function (data) {
                    $scope.forms = data;
                });
            });
        }
    };
});
