(function() {
  'use strict';

  angular
    .module('ldr.wordpress', [])
    .config(ldrWPConfig)
    .controller('WordpressController', WordpressController);

  /* @ngInject */
  function ldrWPConfig($stateProvider) {
    $stateProvider.state('wpPage', {
      url: '/{parentSlug:string}/:pageSlug',
      templateUrl: 'partials/wpPage.html',
      controller: 'WordpressController',
      controllerAs: 'vm'
    });
  }

  /* @ngInject */
  function WordpressController($stateParams, wordpress) {
    var vm = this;
    vm.content = '';

    function getContent() {
      var currentPageSlug = angular.isDefined($stateParams.pageSlug)
        ? $stateParams.pageSlug : $stateParams.parentSlug;
      wordpress
      .get
      .pageFromSlug(currentPageSlug)
      .then(function(response) {
        console.log(currentPageSlug);
        var page = response.data[0];
        vm.title = page.title.rendered;
        vm.content = page.content.rendered;
      });
    }

    getContent();
  }

})();
