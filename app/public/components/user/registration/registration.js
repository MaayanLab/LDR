(function() {
  'use strict';

  angular
    .module('ldr.user.registration', [
      'ui.router',
      'ldr.api',
      'ngLodash'
    ])

  .config(userRegConfig)
    .controller('RegisterCtrl', RegisterCtrl);

  function userRegConfig($stateProvider) {
    $stateProvider.state('userRegistration', {
      url: '/user/registration/',
      templateUrl: 'partials/registration.html',
      controller: 'RegisterCtrl',
      controllerAs: 'vm',
      data: {
        loggedIn: true
      }
    });
  }

  /* @ngInject */
  function RegisterCtrl($scope, $http, store, $state, api, lodash) {

    var vm = this;

    // Check if userReg is stored locally. If it is, populate the form
    vm.user = store.get('userReg') ? store.get('userReg') : reset();
    vm.groups = [];
    vm.userList = [];

    vm.createUser = createUser;
    vm.createGroup = createGroup;
    vm.reset = reset;

    api('groups/')
      .get()
      .success(function(data) {
        vm.groups = lodash.filter(data, function(obj) {
          return obj.name !== 'NIH';
        });
      });

    api('users/')
      .get()
      .success(function(data) {
        vm.userList = lodash.map(data, 'username');
      });

    function reset(form) {
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
      vm.user = {
        username: '',
        password: '',
        passwordConfirm: '',
        firstName: '',
        lastName: '',
        email: '',
        group: {
          name: ''
        },
        location: '',
        fieldOfStudy: '',
        homepage: 'http://'
      };

      return vm.user;
    }

    function createGroup() {
      // Store user locally so he/she may return and fill out form
      store.set('userReg', vm.user);
      $state.go('groupCreate');
    }

    function createUser() {
      // Combine first and last name into one name field
      vm.user.name = vm.user.firstName + ' ' + vm.user.lastName;
      $http.post('/LDR/register', vm.user)
        .success(function(response) {
          alert('User created successfully');
          $scope.setCurrentUser(response.user, response.id_token);
          store.remove('userReg');
          $state.go('home');
        });
    }
  }
})();
