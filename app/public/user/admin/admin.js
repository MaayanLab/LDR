angular.module('ldr.user.admin', [
    'ui.router',
    'angular-storage',
    'ldr.api',
    'ui.bootstrap'
])

    .config(function($stateProvider) {
        // UI Router state admin
        $stateProvider.state('admin', {
            url: '/user/admin',
            controller: 'AdminCtrl',
            templateUrl: 'user/admin/admin.html',
            data: {
                requiresLogin: true,
                requiresAdmin: true
            }
        });
    })

    .controller('AdminCtrl', function($scope, $http, lodash,
                                      store, $state, api, $modal) {

        var releaseApi = api('releases');

        $scope.allForms = [];
        $scope.sortType = ['released', 'approved'];
        $scope.sortReverse = false;

        releaseApi.get().success(function(forms) {
            lodash.each(forms, function(obj) {
                lodash.each(obj.releaseDates, function(level, key) {
                    if (level === '') {
                        return;
                    }
                    obj.releaseDates[key] = new Date(level);
                });
            });
            $scope.allForms = forms;
        });

        $scope.approveForm = function(form) {
            api('admin/' + form._id + '/approve').post().success(function() {
                releaseApi.get().success(function(forms) {
                    $scope.allForms = forms;
                });
            });
        };

        $scope.unapproveForm = function(form) {
            api('admin/' + form._id + '/unapprove').post().success(function() {
                releaseApi.get().success(function(forms) {
                    $scope.allForms = forms;
                });
            });
        };

        $scope.viewMessages = function(form) {
            $modal.open({
                templateUrl: 'msgModal/msgModal.html',
                controller: 'MsgModalInstanceCtrl',
                resolve: {
                    config: function() {
                        return {
                            form: form
                        };
                    }
                }
            });
        };

        $scope.returnForm = function(form) {
            $modal
                .open({
                    templateUrl: 'user/admin/returnModal/returnModal.html',
                    controller: 'ReturnModalInstanceCtrl',
                    resolve: {
                        config: function() {
                            return {
                                form: form
                            }
                        }
                    }
                })
                .result.then(function(message) {
                    form.message = message;
                    releaseApi.get().success(function(forms) {
                        $scope.allForms = forms;
                    });
                }
            );
        };

        $scope.allSelected = false;

        $scope.unselectAll = function() {
            $scope.allSelected = false;
            angular.forEach($scope.allForms, function(form) {
                form.selected = false;
            });
        };

        $scope.selectAll = function() {
            $scope.allSelected = true;
            angular.forEach($scope.allForms, function(form) {
                form.selected = true;
            });
        };

        $scope.export = function() {
            var selectedIds = lodash.map($scope.allForms, function(form) {
                if (form.selected) {
                    return form._id;
                }
            });

            selectedIds = lodash.remove(selectedIds, function(id) {
                return !!id;
            });

            console.log(selectedIds);
            if (selectedIds.length) {
                window.open('/LDR/api/releases/export?ids=' + selectedIds.join(','));
            } else {
                alert('You must select releases before you can export them!');
            }
        };
    });
