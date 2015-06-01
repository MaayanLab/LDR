angular.module('ldr.releases.overview', [
        'ui.router',
        'angular-storage',
        'ldr.api'
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

    .controller('releases.overview.ctrl', function($scope, $http, store, $state, lodash, api) {
        var currentUser = store.get('currentUser'),
            dataApi = api('releases/form/');

        $scope.user = currentUser;
        $scope.forms = [];

        api('releases/group/' + $scope.user.group._id).get().success(function(data) {
            // Convert release date strings to proper date objects so Angular
            // can format them correctly.
            lodash.each(data, function(obj) {
                lodash.each(obj.releaseDates, function(level, key) {
                    if (level === '') { return; }
                    obj.releaseDates[key] = new Date(level);
                });
            });
            $scope.forms = data;
            debugger;
        });

        $scope.editForm = function(form) {
            $state.go('releasesCreate', { id: form._id });
        };

        $scope.deleteForm = function(form) {
            console.log(form);
            if (confirm('Are you sure you would like to delete this entry?')) {
                api('releases/form/' + form._id ).del().success(function() {
                    api('releases/group/' + $scope.user.group._id).get().success(function(data) {
                        $scope.forms = data;
                    });
                });
            }
        };
    });
