/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.group.home', [
      'ui.router',
      'angular-storage',
      'ngFileUpload',
      'ldr.api'
    ])

  .config(groupHomeConfig)
  .controller('GroupHomeCtrl', GroupHomeCtrl);

  // UI Router state formCreate
  /* @ngInject */
  function groupHomeConfig($stateProvider) {
    $stateProvider
      .state('groupHome', {
        url: '/group/{id:string}/home',
        templateUrl: 'partials/groupHome.html',
        controller: 'GroupHomeCtrl',
        controllerAs: 'vm',
        data: {}
      });
  }
  /* @ngInject */
  function GroupHomeCtrl($scope, $stateParams, $timeout,
    $window, lodash, store, groups) {

    var vm = this;

    vm.user = store.get('currentUser');
    vm.admitted = false;
    vm.group = {};
    vm.users = [];
    vm.files = [];
    vm.groupId = $stateParams.id;
    vm.getUsers = getUsers;
    vm.admitUser = admitUser;

    function getGroup() {
      groups
        .getOneGroup(vm.groupId)
        .success(function(group) {
          vm.group = group;
          vm.admitted = (vm.user && lodash.isEqual(vm.user.group, group) &&
            vm.user.admitted);
        })
        .error(function(resp) {
          console.log(resp);
        });
    }

    function getUsers() {
      groups
        .getAllGroupUsers(vm.groupId)
        .success(function(usersArr) {
          vm.users = usersArr;
        })
        .error(function(resp) {
          console.log(resp);
        });
    }

    function admitUser(user) {
      if (confirm('Are you sure you would like to admit this user? This' +
          ' can not be undone.')) {
        groups.admitUserToGroup(vm.groupId, user._id)
          .success(function() {
            getUsers();
            vm.showAdmitted = true;
            $timeout(vm.showAdmitted = false, 5000);
          });
      }
    }

    $scope.$watch('vm.files', function() {
      upload(vm.files);
    });

    function upload(files) {
      if (files && files.length) {
        groups
          .changeGroupIcon(vm.groupId, files)
          .progress(function() {})
          .success(function(data, status, headers, config) {
            // $window.location.reload();
            console.log('file: ' + config.file.name +
              ', Response: ' + JSON.stringify(data) +
              '\n');
          });
      }
    }

    // Uncomment to poll server and check for new users
    /*
     var pollServer = function() {
     api('group/' + groupId + '/users')
     .get()
     .success(function(usersArr) {
     $scope.users = usersArr;
     $timeout(pollServer, 1000);
     });
     };
     pollServer();
     */

    getGroup();

    if (vm.user) {
      getUsers();
    }
  }
})();
