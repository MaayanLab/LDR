angular.module( 'milestonesLanding.forms', [
    'ui.router',
    'angular-storage',
])
.config(function($stateProvider) {
    $stateProvider.state('forms', {
        url: '/forms',
        controller: 'FormsCtrl',
        templateUrl: 'views/forms.html',
        data: {
            requiresLogin: true
        }
    });
}).factory('FormData', function($http) {
    return {
        getUserForms: function(userId) {
            return $http({
                url: base + 'api/data?userId=' + userId,
                method: 'GET'
            });
        },
        deleteForm: function(userId,formId) {
            return $http({
                url: base + 'api/data/remove?userId=' + userId + '&formId=' + formId,
                method: 'DELETE'
            });
        }
    };
})
.controller('FormsCtrl', function FormsController ($scope, $http, store, $state, FormData) {
    var currentUser = store.get('currentUser');
    $scope.currentUser = currentUser;
    $scope.forms = [];

    FormData.getUserForms(currentUser._id).success(function(data) {
        $scope.forms = data;
    });

    $scope.editForm = function(form) {
        // TODO: Route to editing of form here
    };

    $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            FormData.deleteForm(currentUser._id,form._id).success(function(data) {
                console.log(data);
            });
            FormData.getUserForms(currentUser._id).success(function(data) {
                $scope.forms = data;
            });
        }
    };
});
