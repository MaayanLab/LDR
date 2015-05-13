angular.module('milestones.releases.overview', [
    'ui.router',
    'angular-storage',
    'milestones.api'
])

// UI Router state forms
.config(function ($stateProvider) {
    $stateProvider.state('releasesOverview', {
        url: '/releases/overview',
        templateUrl: 'releases/overview/overview.html',
        controller: 'releases.overview.ctrl',
        data: {
            requiresLogin: true
        }
    });

})

.controller('releases.overview.ctrl', function($scope, $http, store, $state, api) {
    var currentUser = store.get('currentUser'),
        dataApi = api('releases');

    $scope.user = currentUser;
    $scope.forms = [];

    dataApi.get({ centerId: $scope.user.center._id }).success(function(data) {
        $scope.forms = data;
    });

    $scope.editForm = function(form) {
        // TODO: Route to editing of form here
        //store.set('formToEdit', form);
        //$state.go('api/releases/kjfskjkfjskdfjk');
    };

    $scope.deleteForm = function(form) {
        console.log(form);
        if (confirm('Are you sure you would like to delete this entry?')) {
            /*dataApi.del({ formId: form._id }).success(function () {
                // Reload data
                debugger;
                dataApi.get({ userId: $scope.user._id }).success(function (data) {
                    debugger;
                    $scope.forms = data;
                });
            });*/
            $http({
                url: '/api/secure/releases?formId=' + form._id,
                method: 'DELETE'
            }).success(function() {
                debugger;
            });
        }
        alert('delete!');
    };
});
