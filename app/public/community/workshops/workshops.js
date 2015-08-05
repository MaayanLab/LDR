/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
  .module('ldr.community.workshops', [
    ])
  .config(workshopsConfig)
  .controller('WorkshopsController', WorkshopsController);

  /* @ngInject */
  function workshopsConfig($stateProvider) {
    $stateProvider.state('workshops', {
      url: '/community/workshops',
      templateUrl: 'community/workshops/workshops.html',
      controller: 'WorkshopsController',
      controllerAs: 'vm'
    });
  }

  function WorkshopsController() {
    var vm = this;
  }

}());
