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

.controller('AdminCtrl', function($scope, $http, store, $state, api) {
    var currentUser = store.get('currentUser');
    $scope.allForms = [];

    var dataApi = api('releases');

    dataApi.get().success(function(forms) {
        console.log(forms);
        $scope.allForms = forms;
    });

    $scope.approveForm = function(form) {
        form.status = 'approved';
        dataApi.put({ data: form }).success(function(err, result) {
            if (err)
                console.log(err);
        });
        FormGets.getAllForms().success(function(forms) {
            $scope.allForms = forms;
        });
    };

    $scope.returnForm = function (form) {
        form.status = 'needs re-edit';
        dataApi.put({ data: form }).success(function(err, result) {
            if (err)
                console.log(err);
        });
        dataApi.get().success(function(forms) {
            $scope.allForms = forms;
        });
    };

    $scope.deleteForm = function (form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            AdminFactory.deleteForm(form._id).success(function(data) {
                console.log(data);
            });
            dataApi.getUserForms(currentUser._id).success(function(data) {
                $scope.forms = data;
            });
        }
    };

});
