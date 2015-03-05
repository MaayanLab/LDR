angular.module( 'milestonesLanding.form', [
    'ui.router',
    'angular-storage'
])
.config(function($stateProvider) {
    $stateProvider.state('form', {
        url: '/form',
        controller: 'FormCtrl',
        templateUrl: 'views/form.html',
        data: {
            requiresLogin: true
        }
    });
})
.controller('FormCtrl', function FormController ($scope, $http, $state) {

    var username = null;
    var data = null;

    $scope.postData = {
        username: username,
        data: data
    };

    $scope.postToUser = function() {
        $http({
            url: 'http://localhost:3001/data/create',
            method: 'POST',
            data: $scope.postData
        }).then(function(response) {
        }, function(error) {
            alert(error.data);
        });
    };

});
