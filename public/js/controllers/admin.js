angular.module('milestonesLanding.admin', [
    'ui.router',
    'angular-storage'
])
    .config(function ($stateProvider) {
        // UI Router state admin
        $stateProvider.state('admin', {
            url: '/admin',
            controller: 'AdminCtrl',
            templateUrl: 'views/admin.html',
            data: {
                requiresLogin: true,
                requiresAdmin: true
            }
        });
    }).controller('AdminCtrl', function AdminController($scope, $http, store, $state, FormGets, FormUpdates) {
        var currentUser = store.get('currentUser');
        $scope.allForms = [];

        FormGets.getAllForms().success(function (forms) {
            $scope.allForms = forms;
        });

        $scope.approveForm = function (form) {
            form.status = 'approved';
            FormUpdates.updateForm(form).success(function (err, result) {
                if (err)
                    console.log(err);
            });
            FormGets.getAllForms().success(function (forms) {
                $scope.allForms = forms;
            });
        };

        $scope.returnForm = function (form) {
            form.status = 'needs re-edit';
            FormUpdates.updateForm(form).success(function (err, result) {
                if (err)
                    console.log(err);
            });
            FormGets.getAllForms().success(function (forms) {
                $scope.allForms = forms;
            });
        };

        $scope.deleteForm = function (form) {
            if (confirm('Are you sure you would like to delete this entry?')) {
                AdminFactory.deleteForm(form._id).success(function (data) {
                    console.log(data);
                });
                FormData.getUserForms(currentUser._id).success(function (data) {
                    $scope.forms = data;
                });
            }
        };

    });
