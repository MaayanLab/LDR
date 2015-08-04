/**
 * @author Michael McDermott
 * Created on 6/23/15.
 */

(function() {
  'use strict';

  angular.module('ldr.search', [
    'ui.router',
    'angular-storage',
    'ldr.api',
    'ngLodash'
  ])

  // UI Router state formCreate
  .config(searchConfig)
    .controller('SearchCtrl', SearchCtrl);

  /* @ngInject */
  function searchConfig($stateProvider) {
    $stateProvider.state('search', {
      url: '/search?{q:string}',
      templateUrl: 'search/search.html',
      controller: 'SearchCtrl',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function SearchCtrl(releases, $stateParams) {

    var vm = this;
    vm.results = [];
    vm.query = $stateParams.q;
    vm.search = search;

    // Add separate query that doesn't change on input change
    vm.queryLabel = angular.copy(vm.query);

    function search() {
      releases
        .search(vm.query)
        .success(function(results) {
          angular.forEach(results, function(obj) {
            angular.forEach(obj.releaseDates, function(level, key) {
              if (level === '') {
                return;
              }
              obj.releaseDates[key] = new Date(level);
            });
          });
          vm.results = results;
        });
    }
  }
})();
