/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.releases.home', [
      'ui.router',
      'angular-storage'
    ])

  .config(relHomeConfig)
    .controller('RelHomeCtrl', RelHomeCtrl);

  // UI Router state forms
  /* @ngInject */
  function relHomeConfig($stateProvider) {
    $stateProvider
      .state('releasesHome', {
        url: '/releases',
        templateUrl: 'releases/home/releasesHome.html',
        controller: 'RelHomeCtrl',
        controllerAs: 'vm',
        data: {
        }
      });
  }

  /* @ngInject */
  function RelHomeCtrl($stateParams, store, messages, releases, exportReleases) {

    var vm = this;
    vm.user = store.get('currentUser');
    vm.forms = [];
    vm.sortType = ['released', 'accepted', 'datasetName'];
    vm.sortReverse = false;
    vm.allSelected = false;
    vm.groupId = $stateParams.groupId;

    vm.export = expRel;
    vm.selAll = selAll;
    vm.unselAll = unselAll;

    function getReleases() {
      releases.getAllRel().success(function(data) {
        vm.forms = data;
        return vm.forms;
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
      unselAll();
    }

    getReleases();
  }
})();
