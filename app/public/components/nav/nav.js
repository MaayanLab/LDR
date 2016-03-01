(function() {
  'use strict';

  angular
    .module('ldr.nav', [])
    .directive('ldrNav', ldrNav);

  /* @ngInject */
  function ldrNav($http, $state, jwtHelper, store) {
    return {
      restrict: 'E',
      templateUrl: 'partials/nav.html',
      link: LDRNavLink
    };

    ///////////////////

    function LDRNavLink(scope, elem, attrs) {

      scope.user = getCurrentUser();
      scope.showFailMessage = false;
      scope.register = register;
      scope.login = login;
      scope.logout = logout;
      scope.getCurrentUser = getCurrentUser;
      scope.setCurrentUser = setCurrentUser;

      function getCurrentUser() {
        var user;
        var loggedIn = (store.get('jwt') &&
          !jwtHelper.isTokenExpired(store.get('jwt')));
        if (loggedIn) {
          user = store.get('currentUser');
          scope.isLoggedIn = true;
          scope.isLoggedInAdmin = user.admin;
          scope.isAdmitted = user.admitted;
        } else {
          localStorage.removeItem('token');
          user = {};
          scope.isLoggedIn = false;
          scope.isLoggedInAdmin = false;
          scope.isAdmitted = false;
        }
        return user;
      }

      function setCurrentUser(user, token) {
        scope.user = user;
        store.set('currentUser', user);
        if (token) {
          store.set('jwt', token);
        }
        scope.isLoggedIn = true;
        scope.isLoggedInAdmin = user.admin;
        scope.isAdmitted = user.admitted;
      }

      function register() {
        scope.isLoggedIn = false;
        scope.isLoggedInAdmin = false;
        scope.isAdmitted = false;
        scope.showFailMessage = false;
        $state.go('userRegistration');
      }

      function login(user) {
        $http({
          url: 'login',
          method: 'POST',
          data: user || scope.user
        }).then(function(result) {
          if (result) {
            // No error: authentication OK
            // Set current user and jwt. Then go to homepage.
            setCurrentUser(result.data.user, result.data.id_token);
            $state.go('home');
          } else {
            scope.showFailMessage = true;
          }
        }, function() {
            scope.showFailMessage = true;
          });
      }

      function logout() {
        scope.isLoggedIn = false;
        scope.isLoggedInAdmin = false;
        scope.isAdmitted = false;
        store.remove('currentUser');
        store.remove('jwt');
        scope.showFailMessage = false;
        $state.go('home');
      }

    }
  }
})();
