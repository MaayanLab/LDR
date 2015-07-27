(function() {
  'use strict';

  angular
    .module('ldr.user.admin', [
      'ui.router',
      'angular-storage',
      'ldr.api',
      'ui.bootstrap'
    ])

  .config(adminConfig)
    .controller('AdminCtrl', AdminCtrl);

  /* @ngInject */
  function adminConfig($stateProvider) {
    // UI Router state admin
    $stateProvider.state('admin', {
      url: '/user/admin',
      templateUrl: 'user/admin/admin.html',
      controller: 'AdminCtrl',
      controllerAs: 'vm',
      data: {
        requiresLogin: true,
        requiresAdmin: true
      }
    });
  }

  /* @ngInject */
  function AdminCtrl(admin, releases, messages, exportReleases) {

    var vm = this;

    vm.allForms = [];
    vm.sortType = ['released', 'approved'];
    vm.sortReverse = false;
    vm.allSelected = false;

    vm.approve = approve;
    vm.unApprove = unApprove;
    vm.returnRel = returnRel;
    vm.selectAll = selAll;
    vm.unselectAll = unselAll;
    vm.export = expRel;
    vm.exportReleases = exportReleases;
    vm.viewMessages = messages.viewMessages;


    function getReleases() {
      releases.getAllRel().success(function(data) {
        vm.allForms = data;
        return vm.allForms;
      });
    }

    function approve(form) {
      admin.approve(form)
        .success(function() {
          getReleases();
        });
    }

    function unApprove(form) {
      admin.unApprove(form)
        .success(function() {
          getReleases();
        });
    }

    function returnRel(form) {
      admin.returnRel()
        .then(function(message) {
          form.message = message;
          getReleases();
        });
    }

    function selAll() {
      vm.allSelected = exportReleases.selectAll(vm.allForms);
    }

    function unselAll() {
      vm.allSelected = exportReleases.unselectAll(vm.allForms);
    }

    function expRel() {
      exportReleases.exportRel(vm.allForms);
    }

    getReleases();
  }
})();
