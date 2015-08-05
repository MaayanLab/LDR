/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
  .module('ldr.community.fundingOpps', [
    ])
  .config(fundingOppsConfig)
  .controller('FundingOppsController', FundingOppsController);

  /* @ngInject */
  function fundingOppsConfig($stateProvider) {
    $stateProvider.state('fundingOpps', {
      url: '/community/fundingOpps',
      templateUrl: 'community/fundingOpps/fundingOpps.html',
      controller: 'FundingOppsController',
      controllerAs: 'vm'
    });
  }

  function FundingOppsController() {
    var vm = this;
  }

}());
