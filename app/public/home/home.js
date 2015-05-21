// Home page. Possible implementation of some sort of docent app

angular.module('ldr.home', [
    'ui.router',
    'angular-storage'
])

.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'home/home.html'
    });
});
