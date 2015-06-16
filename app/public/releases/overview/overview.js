angular.module('ldr.releases.overview', [
    'ui.router',
    'angular-storage',
    'ldr.api'
])

    // UI Router state forms
    .config(function($stateProvider) {
        $stateProvider.state('releasesOverview', {
            url: '/releases/overview',
            templateUrl: 'releases/overview/overview.html',
            controller: 'releases.overview.ctrl',
            data: {
                requiresLogin: true,
                requiresAdmitted: true
            }
        });
    })

    .controller('releases.overview.ctrl', function($scope, $http, store,
                                                   $filter, $state, lodash,
                                                   api, $modal) {

        $scope.user = $scope.getCurrentUser();
        $scope.forms = [];
        $scope.sortType = ['released', 'accepted', 'metadata.assay[0].name'];
        $scope.sortReverse = false;

        api('releases/group/' + $scope.user.group._id)
            .get()
            .success(function(data) {
                // Convert release date strings to proper date objects
                // so Angular can format them correctly.
                lodash.each(data, function(obj) {
                    lodash.each(obj.releaseDates, function(level, key) {
                        if (level === '') {
                            return;
                        }
                        obj.releaseDates[key] = new Date(level);
                    });
                });
                $scope.forms = data;
            });

        $scope.releaseForm = function(form) {
            if (confirm('Are you sure you would like to release this entry?')) {
                api('releases/form/' + form._id + '/release')
                    .put()
                    .success(function() {
                        api('releases/group/' + $scope.user.group._id)
                            .get()
                            .success(function(data) {
                                $scope.forms = data;
                            }
                        );
                    })
                    .error(function(error) {
                        alert(error);
                    }
                );
            }
        };

        $scope.editForm = function(form) {
            $state.go('releasesCreate', { id: form._id });
        };

        $scope.editUrls = function(form) {
            $modal
                .open({
                    templateUrl: 'releases/urlModal/urlModal.html',
                    controller: 'URLModalInstanceCtrl',
                    resolve: {
                        config: function() {
                            return {
                                form: form
                            };
                        }
                    }
                })
                .result.then(function(urls) {
                    form.urls = urls;
                });
        };

        $scope.deleteForm = function(form) {
            if (confirm('Are you sure you would like to delete this entry?')) {
                api('releases/form/' + form._id)
                    .del()
                    .success(function() {
                        api('releases/group/' + $scope.user.group._id)
                            .get()
                            .success(function(data) {
                                $scope.forms = data;
                            }
                        );
                    }
                );
            }
        };
    });
