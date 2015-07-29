/**
 * @author Michael McDermott
 * Created on 7/27/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.centers.dsgc.center', [
      'ui.router'
    ])
    .config(dsgcCenterConfig)
    .controller('DSGCCenterController', DSGCCenterController);

  /* @ngInject */
  function dsgcCenterConfig($stateProvider) {
    $stateProvider.state('dsgcCenter', {
      url: '/centers/dsgc/{center:string}',
      templateUrl: 'centers/dsgcCenter/dsgcCenter.html',
      controller: 'DSGCCenterController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function DSGCCenterController($stateParams, groups) {
    var vm = this;
    vm.center = {};
    vm.center.name = $stateParams.center;

    function getCenter() {
      groups
        .getAllGroups()
        .success(function(data) {
          angular.forEach(data, function(obj) {
            if (obj.name === $stateParams.center) {
              vm.center = obj;
            }
          });
        }
      );
    }

    getCenter();
  }
})();
