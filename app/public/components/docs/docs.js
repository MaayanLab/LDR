/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr.docs', [
      'ui.router',
    ])

  .config(docsConfig)
  .controller('DocsCtrl', DocsCtrl);

  /* @ngInject */
  function docsConfig($stateProvider) {
    $stateProvider
      .state('docs', {
        url: '/docs',
        templateUrl: 'partials/docs.html',
        controller: 'DocsCtrl',
        controllerAs: 'vm',
        data: {}
      });
  }
  /* @ngInject */
  function DocsCtrl() {
    var vm = this;

  }
})();
