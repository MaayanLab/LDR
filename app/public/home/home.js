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
      'ngLodash'
    ])
    .config(ldrHomeConfig)
    .controller('LDRHomeController', LDRHomeController);

  /* @ngInject */
  function ldrHomeConfig($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'LDRHomeController',
      controllerAs: 'vm'
    });
  }

  // Need scope here for the $apply function
  function LDRHomeController() {

    var vm = this;
    vm.query = '';

    vm.news = {
      webinars: [
        {
          title: 'TBA',
          description: 'Qian Zhu, PhD, University of Maryland, Baltimore County',
          date: 'August 11, 2015'
        },
        {
          title: 'TBA',
          description: 'Stephen Picoolo, PhD, Brigham Young University',
          date: 'September 8, 2015'
        }
      ],
      courses: [
        {
          title: 'Big Data Science with the BD2K-LINCS Data Coordination and Integration Center (DCIC)',
          date: 'September 15, 2015'
        }
      ],
      fundingOpps: [
        {
          title: ''
        }
      ],
    };
    /*vm.summary = {
        //Users: 0,
        Readouts: 0,
        Centers: 0,
        Genes: 0,
        Assays: 0,
        Diseases: 0,
        'Cell lines': 0,
        Organisms: 0,
        Perturbagens: 0,
        'Data Releases': 0
    };

    var counts = {};

    metadata
        .getCounts()
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
        });*/

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
  }
})();