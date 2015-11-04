(function() {
  'use strict';

  angular
    .module('ldr.user.forgot', [
      'ui.router',
      'ldr.api',
      'ngLodash'
    ])

  .config(userRegConfig)
    .controller('ForgotCtrl', ForgotCtrl);

  function userRegConfig($stateProvider) {
    $stateProvider.state('userForgot', {
      url: '/user/forgot',
      templateUrl: 'partials/forgot.html',
      controller: 'ForgotCtrl',
      controllerAs: 'vm',
      data: {
        loggedIn: true
      }
    });
  }

  /* @ngInject */
  function ForgotCtrl(userManagement) {

    var vm = this;
    vm.showSuccessMessage = false;
    vm.showFailMessage = false;
    vm.email = '';
    vm.sendForgotEmail = sendForgotEmail;

    function sendForgotEmail() {
      userManagement
        .sendForgotEmail(vm.email)
        .then(function(response) {
            showMessages(true);
          }, function(response) {
            showMessages(false);
          });
    }

    function showMessages(successful) {
      vm.showFailMessage = !successful;
      vm.showSuccessMessage = successful;
    }

  };

})();
