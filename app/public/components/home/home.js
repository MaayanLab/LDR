/**
 * @author Michael McDermott
 * Created on 5/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.home', [
      'ldr.api',
      'ui.router',
      'angular-storage',
      'ngLodash',
      'ui.bootstrap'
    ])
    .config(ldrHomeConfig)
    .controller('LDRHomeController', LDRHomeController);

  /* @ngInject */
  function ldrHomeConfig($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'partials/home.html',
      controller: 'LDRHomeController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function LDRHomeController($scope, events, releases, metadata) {

    var vm = this;
    vm.firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    vm.query = '';
    vm.appRelPromise = releases.getApprovedRel();

    function getReleases() {
      vm.appRelPromise
        .success(function(releases) {
          vm.releases = releases;
        });
    }

    vm.summary = {
      //Users: 0,
      Centers: 0,
      Assays: 0,
      'Cell lines': 0,
      Perturbagens: 0,
      Readouts: 0,
      Genes: 0,
      Diseases: 0,
      Organisms: 0,
      'Data Releases': 0
    };

    function countUpTo(field, count, max, step, time) {
      setTimeout(function() {
        if (count + step > max) {
          countUpTo(field, count, max, 1, 0);
        } else if (count !== max) {
          count = count + step;
          vm.summary[field] = count;
          $scope.$apply();
          countUpTo(field, count, max, step, time);
        }
      }, time);
    }

    function getCounts() {
      var counts = {};
      metadata
        .getReleasedCounts()
        .success(function(countsObj) {
          counts = countsObj;
          //countUpTo('Users', 0, counts.Users, 1, 50);
          countUpTo('Data Releases', 0, counts.dataReleases, 3, 50);
          countUpTo('Centers', 0, counts.groups, 1, 50);
          countUpTo('Assays', 0, counts.assays, 1, 50);
          countUpTo('Cell lines', 0, counts.cellLines, 5, 50);
          countUpTo('Perturbagens', 0, counts.perturbagens, 12, 50);
          countUpTo('Readouts', 0, counts.readouts, 5, 50);
          countUpTo('Genes', 0, counts.genes, 5, 50);
          countUpTo('Diseases', 0, counts.diseases, 5, 50);
          countUpTo('Organisms', 0, counts.organisms, 5, 50);
        });
    }

    getCounts();
    getReleases();
  }
})();
