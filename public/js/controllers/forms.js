angular.module( 'milestonesLanding.forms', [
  'ui.router',
  'angular-storage',
])
  // UI Router state forms
    .config(function($stateProvider) {
      $stateProvider.state('forms', {
        url: '/forms',
        controller: 'FormsCtrl',
        templateUrl: 'views/forms.html',
        data: {
          requiresLogin: true
        }
      });

      // AJAX requests for Form CRUD
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
    }).factory('FormDeletes', function($http) {
      return {
        deleteForm: function(formId) {
          return $http({
            url: base + 'api/secure/data?formId=' + formId,
            method: 'DELETE'
          });
        }
      };
    }).factory('FormUpdates', function($http) {
      return {
        updateForm: function(form) {
          return $http({
            url: base + 'api/secure/data?formId=' + form._id,
            method: 'PUT',
            data: form
          });
        }
      };
    }).factory('FormPosts', function($http) {
      return {
        postForm: function(inputForm) {
          return $http({
            url: base + 'api/secure/data',
            method: 'POST',
            data: inputForm
          });
        }
      };
    }).controller('FormsCtrl', function FormsController ($scope, $http, store, $state, FormGets, DataGets, DataPosts, FormDeletes) {
      var currentUser = store.get('currentUser');
      $scope.user = currentUser;
      $scope.forms = [];

      FormGets.getUserForms($scope.user._id).success(function(data) {
        $scope.forms = data;
      });

      $scope.editForm = function(form) {
        // TODO: Route to editing of form here
        store.set('formToEdit', form);
        $state.go('formsCreate');
      };

      $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
          FormDeletes.deleteForm(form._id).success(function(data) {
            console.log(data);
          });

          FormGets.getUserForms($scope.user._id).success(function(data) {
            $scope.forms = data;
          });
        }
      };
    });
