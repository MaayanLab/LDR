angular.module('ldr.user.admin', [
    'ui.router',
    'angular-storage',
    'ldr.api'
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

    .controller('AdminCtrl', function($scope, $http,
                                      store, $state, api, $modal) {
        var currentUser = store.get('currentUser');
        $scope.allForms = [];

        var releaseApi = api('releases');

        releaseApi.get().success(function(forms) {
            console.log(forms);
            $scope.allForms = forms;
        });

        $scope.approveForm = function(form) {
            api('admin/' + form._id + '/approve').post().success(function() {
                releaseApi.get().success(function(forms) {
                    $scope.allForms = forms;
                });
            })
        };

        $scope.unapproveForm = function(form) {
            api('admin/' + form._id + '/unapprove').post().success(function() {
                releaseApi.get().success(function(forms) {
                    $scope.allForms = forms;
                });
            })
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
