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
        var currentUser = store.get('currentUser');
        var releaseApi = api('releases');

        $scope.allForms = [];
        $scope.sortType = ['accepted', 'group.name'];
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

        $scope.returnForm = function(formToReturn) {
            $modal.open({
                templateUrl: 'user/admin/returnModal/returnModal.html',
                controller: 'ReturnModalInstanceCtrl',
                resolve: {
                    form: formToReturn
                }
            });
            releaseApi.get().success(function(forms) {
                $scope.allForms = forms;
            });
        };
    });
