angular.module( 'milestonesLanding.admin', [
    'ui.router',
    'angular-storage',
])
.config(function($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        templateUrl: 'views/admin.html',
        data: {
            requiresLogin: true,
            requiresAdmin: true
        }
    });
}).factory('AdminFactory', function($http) {
    return {
        getAllForms: function() {
            return $http({
                url: base + 'api/data',
                method: 'GET'
            });
        },
        deleteForm: function(formId) {
            return $http({
                url: base + 'api/data/remove?formId=' + formId,
                method: 'DELETE'
            });
        }
    };
})
.controller('AdminCtrl', function AdminController ($scope, $http, store, $state, FormData, AdminFactory) {
    var currentUser = store.get('currentUser');
    $scope.allForms = [];

    AdminFactory.getAllForms().success(function(forms) {
        $scope.allForms = forms;
    });

    $scope.approveForm = 

    $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            AdminFactory.deleteForm(form._id).success(function(data) {
                console.log(data);
            });
            FormData.getUserForms(currentUser._id).success(function(data) {
                $scope.forms = data;
            });
        }
    };

});
