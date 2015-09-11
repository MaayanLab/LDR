/**
 * @author Michael McDermott
 * Created on 5/27/15.
 */

(function() {
  'use strict';

  angular.module('ldr.group.create', [
    'ui.router'
  ])

  .config(groupCreateConfig)
    .controller('GroupCreateCtrl', GroupCreateCtrl);

  /* @ngInject */
  function groupCreateConfig($stateProvider) {
    $stateProvider.state('groupCreate', {
      url: '/group/create',
      templateUrl: 'partials/groupCreate.html',
      controller: 'GroupCreateCtrl',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function GroupCreateCtrl(store, $state, groups) {

    var vm = this;
    vm.groupList = groups.getGroupList();
    vm.createGroup = createGroup;
    vm.reset = reset;

    function reset(form) {
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
      vm.group = {
        name: '',
        abbr: '',
        homepage: '',
        email: '',
        description: '',
        location: ''
      };
    }

    function createGroup(groupToCreate) {
      groups
        .createGroup(groupToCreate)
        .success(function(group) {
          // Check if there is a logged in user.
          // If there is add them to the group and admit them.
          if (store.get('currentUser')) {
            var currentUser = store.get('currentUser');

            // Server will take care of admitting a
            // user if there is no one else in the group
            groups.admitUserToGroup(group._id, currentUser._id)
              .success(function() {
                $state.go('groupHome');
              });
          } else if (store.get('userReg')) {
            // If locally stored userReg, then the
            // user is coming from the registration page.

            // Add the group to userReg and
            // DANGEROUSLY set them as admitted
            var userReg = store.get('userReg');
            userReg.group = group;
            userReg.admitted = true;

            // Remove the current userReg and add a new one.
            store.remove('userReg');
            store.set('userReg', userReg);

            // Go back to the registration page
            $state.go('userRegistration');
          }
        })
        .error(function(resp) {
          console.log(resp);
          alert('Group could not be created. Please try again.');
        });
    }

    reset();
  }

})();
