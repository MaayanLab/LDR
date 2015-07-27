(function() {
  'use strict';

  angular
    .module('ldr.releases.overview', [
      'ui.router',
      'angular-storage'
    ])

  .config(relOverviewConfig)
    .controller('RelOverviewCtrl', RelOverviewCtrl);

  // UI Router state forms
  /* @ngInject */
  function relOverviewConfig($stateProvider) {
    $stateProvider
      .state('releasesOverview', {
        url: '/releases/{groupId:string}/overview',
        templateUrl: 'releases/overview/overview.html',
        controller: 'RelOverviewCtrl',
        controllerAs: 'vm',
        data: {
          requiresLogin: true,
          requiresAdmitted: true
        }
      });
  }

  /* @ngInject */
  function RelOverviewCtrl($stateParams, store, messages, releases, exportReleases) {

    var vm = this;
    vm.user = store.get('currentUser');
    vm.forms = [];
    vm.sortType = ['released', 'accepted', 'datasetName'];
    vm.sortReverse = false;
    vm.allSelected = false;
    vm.groupId = $stateParams.groupId;

    vm.editUrls = editUrls;
    vm.rel = rel;
    vm.del = del;
    vm.selectAll = selAll;
    vm.unselectAll = unselAll;
    vm.export = expRel;
    vm.releases = releases;
    vm.viewMessages = viewMessages;

    function getReleases() {
      releases.getGroupRel(vm.groupId).success(function(data) {
        vm.forms = data;
        return vm.forms;
      });
    }

    function editUrls(form) {
      releases
        .editUrls(form)
        .then(function(urls) {
          form.urls = urls;
          return form;
        });
    }

    function del(form) {
      releases
        .deleteRel(form)
        .success(function() {
          getReleases();
        })
        .error(function(error) {
          alert(error);
        });
    }

    function rel(form) {
      releases
        .release(form)
        .success(function() {
          getReleases();
        })
        .error(function(error) {
          alert(error);
        });
    }

    function selAll() {
      vm.allSelected = exportReleases.selectAll(vm.forms);
    }

    function unselAll() {
      vm.allSelected = exportReleases.unselectAll(vm.forms);
    }

    function expRel() {
      exportReleases.exportRel(vm.forms);
    }

    function viewMessages(form) {
      messages.viewMessages(form).then(function() {

      }, function() {
        // Messages modal dismissed
      });
    }

    getReleases();
  }
})();
