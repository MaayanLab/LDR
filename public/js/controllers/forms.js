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
}).factory('FormGets', function($http) {
    return {
        getUserForms: function(userId) {
            return $http({
                url: base + 'api/data?userId=' + userId,
                method: 'GET'
            });
        },
        getAllForms: function() {
            return $http({
                url: base + 'api/data',
                method: 'GET'
            });
        }
    };
}).factory('FormUpdates', function($http) {
    return {
        updateForm: function(form) {
            return $http({
                url: base + 'api/data/update',
                method: 'PUT',
                data: form
            });
        }
    };
}).controller('FormsCtrl', function FormsController ($scope, $http, store, $state, FormGets, DataGets, DataPosts, DataDeletes) {
    var currentUser = store.get('currentUser');
    $scope.currentUser = currentUser;
    $scope.forms = [];

    FormGets.getUserForms(currentUser._id).success(function(data) {
        $scope.forms = data;
    });

    $scope.editForm = function(form) {
        // TODO: Route to editing of form here
        store.set('formToEdit', form);
        $state.go('formsCreate');
    };

    $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            DataDeletes.deleteForm(form._id).success(function(data) {
                console.log(data);
            });
            FormGets.getUserForms(currentUser._id).success(function(data) {
                $scope.forms = data;
            });
        }
    };
});
