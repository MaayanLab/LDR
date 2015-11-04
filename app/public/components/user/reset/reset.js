(function() {
  'use strict';

  angular
    .module('ldr.user.reset', [
      'ui.router',
      'ldr.api',
      'ngLodash'
    ])

  .config(userRegConfig)
    .controller('ResetCtrl', ResetCtrl);

  function userRegConfig($stateProvider) {
    $stateProvider.state('userReset', {
      url: '/user/reset/{token:string}',
      templateUrl: 'partials/reset.html',
      controller: 'ResetCtrl',
      controllerAs: 'vm',
      data: {
        loggedIn: true
      }
    });
  }

  /* @ngInject */
  function ResetCtrl($state, $stateParams, userManagement) {

    var vm = this;
    vm.resetPassword = resetPassword;
    vm.showFailMessage = false;
    vm.passwords = {
      new: '',
      confirm: '',
    };

    function resetPassword() {
      if (vm.passwords.new.length) {
        userManagement
          .resetPassword($stateParams.token, vm.passwords.new)
          .then(function(response) {
            alert('Password successfully reset!');
            $state.go('home');
          }, function(response) {
            vm.showFailMessage = true;
          });
      }
    }

  };

})();
