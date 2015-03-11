angular.module( 'milestonesLanding.forms', [
    'ui.router',
    'angular-storage',
])
.config(function($stateProvider) {
    $stateProvider.state('forms', {
        url: baseUrl + 'forms',
        controller: 'FormsCtrl',
        templateUrl: 'views/forms.html',
        data: {
            requiresLogin: true
        }
    });
}).factory('UserData', function($http) {
    return {
        getData: function(user) {
            return $http({
                url: 'http://localhost:3001/api/data/user',
                method: 'POST',
                data: user
            });
        }
    };
})
.controller('FormsCtrl', function FormsController ($scope, $http, store, $state, UserData) {
    var currentUser = store.get('currentUser');
    console.log(currentUser);
    $scope.forms = [];

    UserData.getData(currentUser).success(function(data) {
        $scope.forms = data;
    });
});
