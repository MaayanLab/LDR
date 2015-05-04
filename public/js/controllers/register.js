angular.module('milestonesLanding.register', [
  'ui.router',
  'angular-storage'
])
    .config(function($stateProvider) {
      $stateProvider.state('register', {
        url: '/register',
        controller: 'RegisterCtrl',
        templateUrl: 'views/register.html',
        data: {
          loggedIn: true
        }
      });
    })
    .controller('RegisterCtrl', function LoginController($scope, $http, store, $state) {
      $scope.user = {};
      $scope.createUser = function() {
        console.log('POSTing user data');
        $http({
          url: '/register',
          method: 'POST',
          data: $scope.user
        });
      }
    });
