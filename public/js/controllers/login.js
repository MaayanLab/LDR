angular.module( 'milestonesLanding.login', [
    'ui.router',
    'angular-storage'
])
.config(function($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        controller: 'LoginCtrl',
        templateUrl: 'views/login.html'
    });
})
.controller('LoginCtrl', function LoginController($scope, $http, store, $state) {

    

});
