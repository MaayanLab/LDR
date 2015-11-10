/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.about', [
      'ui.router',
    ])

  .config(aboutConfig)
  .controller('AboutCtrl', AboutCtrl);

  /* @ngInject */
  function aboutConfig($stateProvider) {
    $stateProvider
      .state('about', {
        url: '/about',
        templateUrl: 'partials/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'vm',
        data: {}
      });
  }
  /* @ngInject */
  function AboutCtrl() {
    var vm = this;

  }
})();
