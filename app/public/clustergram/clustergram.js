/**
 * @author Michael McDermott
 * Created on 7/28/15.
 */

(function() {
  'use strict';
  angular
    .module('ldr.clustergram', [])
    .controller('ClustergramController', ClustergramController);

  /* @ngInject */
  function ClustergramController($modal, d3Clust, d3Data) {
    var vm = this;
    vm.setOrder = setOrder;
    vm.active = 'clust';

    var landscapeData = d3Data;

    // new way of making clustergram
    var outerMargins = {
      'top': 'inherit',
      'bottom': 'inherit',
      'left': 'inherit',
      'right': 'inherit'
    };

    function setOrder(orderString) {
      vm.active = orderString;
      d3Clust.reorder(orderString);
    }

    // define callback function for clicking on tile
    function clickTileCallback(tileInfo) {
      $modal
        .open({
          templateUrl: 'clustergram/clustModal/clustModal.html',
          controller: 'ClustModalInstanceCtrl',
          controllerAs: 'vm',
          resolve: {
            config: function() {
              return {
                tileInfo: tileInfo
              };
            }
          }
        });
    }

    // define arguments object
    var argumentsObj = {
      networkData: landscapeData,
      svgDivId: 'svg-div',
      rowLabel: 'Assays',
      colLabel: 'Cell Lines',
      outerMargins: outerMargins,
      opacityScale: 'log',
      inputDomain: 0.1,
      tileColors: ['#6A9CCD', '#ED9124'],
      titleTile: true,
      clickTile: clickTileCallback,
      // 'click_group': click_group_callback
      resize: false,
      order: vm.active,
      transpose: false
    };

    function renderClust() {
      if (angular.element(window).width() > 992) {
        argumentsObj.transpose = false;
        d3Clust.makeClust(argumentsObj);
      } else if (angular.element(window).width() < 992 &&
        angular.element(window).width() > 580) {
        argumentsObj.transpose = true;
        d3Clust.makeClust(argumentsObj);
      }
    }


    var runIt;
    angular.element(window).resize(function() {
      clearTimeout(runIt);
      runIt = setTimeout(renderClust(), 100);
    });

    renderClust();
  }

}());
