(function() {
  'use strict';

  angular
    .module('ldr.nav', [])
    .directive('ldrNav', ldrNav);

  function ldrNav() {
    return {
      restrict: 'E',
      templateUrl: 'partials/nav.html',
      controller: LDRNavController,
      controllerAs: 'vm',
      bindToController: true
    };

    ///////////////////

    /* @ngInject */
    function LDRNavController($http, $state, store, jwtHelper) {

      var vm = this;
      vm.user = getCurrentUser();
      vm.showFailMessage = false;

      vm.register = register;
      vm.login = login;
      vm.logout = logout;
      vm.getCurrentUser = getCurrentUser;
      vm.setCurrentUser = setCurrentUser;

      function getCurrentUser() {
        var user;
        var loggedIn = !!(store.get('jwt') && !jwtHelper.isTokenExpired(store.get('jwt')));
        if (loggedIn) {
          user = store.get('currentUser');
          vm.isLoggedIn = true;
          vm.isLoggedInAdmin = user.admin;
          vm.isAdmitted = user.admitted;
        } else {
          user = {};
          vm.isLoggedIn = false;
          vm.isLoggedInAdmin = false;
          vm.isAdmitted = false;
        }
        return user;
      }

      function setCurrentUser(user, token) {
        vm.user = user;
        store.set('currentUser', user);
        if (token) {
          store.set('jwt', token);
        }
        vm.isLoggedIn = true;
        vm.isLoggedInAdmin = user.admin;
        vm.isAdmitted = user.admitted;
      }

      function register() {
        vm.isLoggedIn = false;
        vm.isLoggedInAdmin = false;
        vm.isAdmitted = false;
        vm.showFailMessage = false;
        $state.go('userRegistration');
      }

      function login(user) {
        $http({
          url: 'login',
          method: 'POST',
          data: user || vm.user
        }).then(function(result) {
          if (result) {
            // No error: authentication OK
            // Set current user and jwt. Then go to homepage.
            setCurrentUser(result.data.user, result.data.id_token);
            $state.go('home');
          } else {
            vm.showFailMessage = true;
            // This will be removed for a better error notification
            alert('The username or password you entered was ' +
              'incorrect. Please try again.');
          }
        }, function() {
          vm.showFailMessage = true;
          // This will be removed for a better error notification
          alert('The username or password you entered was ' +
            'incorrect. Please try again.');
        });
      }

      function logout() {
        vm.isLoggedIn = false;
        vm.isLoggedInAdmin = false;
        vm.isAdmitted = false;
        store.remove('currentUser');
        store.remove('jwt');
        vm.showFailMessage = false;
        $state.go('home');
      }

    }
  }
})();
