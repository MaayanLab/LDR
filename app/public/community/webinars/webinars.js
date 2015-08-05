/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
  .module('ldr.community.webinars', [
    ])
  .config(webinarsConfig)
  .controller('WebinarsController', WebinarsController);

  /* @ngInject */
  function webinarsConfig($stateProvider) {
    $stateProvider.state('webinars', {
      url: '/community/webinars',
      templateUrl: 'community/webinars/webinars.html',
      controller: 'WebinarsController',
      controllerAs: 'vm'
    });
  }

  function WebinarsController() {
    var vm = this;
  }

}());
