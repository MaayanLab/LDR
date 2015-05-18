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
            dataApi = api('releases/form/');

        $scope.user = currentUser;
        $scope.forms = [];

        api('releases/center/' + $scope.user.center._id).get().success(function(data) {
            console.log(data);
            $scope.forms = data;
        });

        $scope.editForm = function(form) {
            $state.go('releasesCreate', { id: form._id });
        };

        $scope.deleteForm = function(form) {
            console.log(form);
            if (confirm('Are you sure you would like to delete this entry?')) {
                api('releases/form/' + form._id ).del().success(function() {
                    alert('Deleted.');
                    api('releases/center/' + $scope.user.center._id).get().success(function(data) {
                        $scope.forms = data;
                    });
                });
            }
        };
    });
