(function() {
  'use strict';

  angular
    .module('ldr', [
      'ldr.nav',
      'ldr.home',
      'ldr.bar',
      'ldr.centers',
      'ldr.centers.dcic',
      'ldr.centers.dsgc',
      'ldr.centers.dsgc.center',
      'ldr.centers.phaseOne',
      'ldr.group.home',
      'ldr.group.create',
      'ldr.group.settings',
      'ldr.releases.home',
      'ldr.releases.overview',
      'ldr.releases.create',
      'ldr.search',
      'ldr.user.admin',
      'ldr.user.settings',
      'ldr.user.settings.changePassword',
      'ui.router',
      'ui.bootstrap',
      'angular-storage',
      'angular-jwt'
    ])
    .config(ldrConfig)
    .run(runLDR)
    .directive('title', xxTitle)
    .controller('ldrCtrl', ldrCtrl);

  /* @ngInject */
  function ldrConfig(jwtInterceptorProvider, $httpProvider) {
    // Add JWT to every request to server

    /* @ngInject */
    function getJwt(store) {
      return store.get('jwt');
    }

    jwtInterceptorProvider.tokenGetter = getJwt;
    $httpProvider.interceptors.push('jwtInterceptor');
  }

  /* @ngInject */
  function runLDR($rootScope, $state, store, jwtHelper) {

    $rootScope.atHome = ($state.current.url === '^' || $state.current.url === '/');
    // Check status of user on every state change
    // Used for Navbar and blocking pages from unauthorized users
    // Otherwise, just check if the user is logged in

    $rootScope.$on('$stateChangeStart', function(event, to) {
      // Change banner depending on state
      $rootScope.atHome = (to.url === '^' || to.url === '/');

      var e = event;
      // Get current user
      var currentUser = store.get('currentUser');
      var loggedIn = !!(store.get('jwt') && !jwtHelper.isTokenExpired(store.get('jwt')));
      var message = '';

      // Check if the state requires login or admin privileges
      if (to.data) {
        if (to.data.requiresAdmitted) {
          if (!loggedIn || !currentUser) {
            e.preventDefault();
            message = 'You must be logged in to access this page.';
            $state.go('home');
          } else if (!currentUser.admitted) {
            // Logged in but not admitted to group
            e.preventDefault();
            message = 'You have not yet been admitted to this group! ' +
              'Someone must accept you before you can view ' +
              'releases and submit new ones.';
            $state.go('home');
          }
        }
        if (to.data.requiresAdmin) {
          // User not logged in
          if (!loggedIn || !currentUser) {
            e.preventDefault();
            message = 'You must be the authorized to access this ' +
              'page.';
            $state.go('home');
          } else if (!currentUser.admin) {
            // Logged in but does not have admin privileges
            e.preventDefault();
            message = 'You must be the authorized to access this ' +
              'page.';
            $state.go('home');
          }
        }
        if (to.data.requiresLogin) {
          if (!loggedIn || !currentUser) {
            e.preventDefault();
            message = 'You must be authorized to access this page. ' +
              'Please log in.';
            $state.go('home');
          }
        }
        if (to.data.loggedIn) {
          if (loggedIn) {
            e.preventDefault();
            $state.go('home');
          }
        }
      }
      // Prevent multiple alerts
      if (message !== '') {
        alert(message);
      }
    });

  }

  /* @ngInject */
  function xxTitle($rootScope, $timeout) {
    return {
      link: function() {
        var listener = function(event, toState) {
          $timeout(function() {
            $rootScope.title =
              (toState.data && toState.data.pageTitle) ?
              toState.data.pageTitle :
              'NIH LINCS Program';
          });
        };
        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }

  /* @ngInject */
  function ldrCtrl($state) {
    // Automatically add the hash and go to home state
    $state.go('home');
  }
})();
