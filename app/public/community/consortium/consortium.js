/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
  .module('ldr.community.consortiumMeetings', [
    ])
  .config(consortiumMeetingsConfig)
  .controller('ConsortiumMeetingsController', ConsortiumMeetingsController);

  /* @ngInject */
  function consortiumMeetingsConfig($stateProvider) {
    $stateProvider.state('consortiumMeetings', {
      url: '/community/consortiumMeetings',
      templateUrl: 'community/consortiumMeetings/consortiumMeetings.html',
      controller: 'ConsortiumMeetingsController',
      controllerAs: 'vm'
    });
  }

  function ConsortiumMeetingsController() {
    var vm = this;
  }

}());
