angular.module( 'milestonesLanding.home', [
    'ui.router',
    'angular-storage'
])
.config(function($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: 'HomeCtrl',
        templateUrl: 'views/home.html'
    });
})
.controller('HomeCtrl', function HomeController($scope, $http) {


});
