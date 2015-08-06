/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
  .module('ldr.community', [])
  .config(communityConfig)
  .controller('CommunityController', CommunityController);

  /* @ngInject */
  function communityConfig($stateProvider) {
    $stateProvider.state('community', {
      url: '/community',
      templateUrl: 'community/community.html',
      controller: 'CommunityController',
      controllerAs: 'vm'
    });
  }

  function CommunityController() {
    var vm = this;
  }

}());
