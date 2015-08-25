/*eslint camelcase: 0*/

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
      network_data: landscapeData,
      svg_div_id: 'svg-div',
      row_label: 'Assays',
      col_label: 'Cell Lines',
      outer_margins: outerMargins,
      opacity_scale: 'log',
      input_domain: 0.1,
      tile_colors: ['#6A9CCD', '#ED9124'],
      title_tile: true,
      click_tile: clickTileCallback,
      // 'click_group': click_group_callback
      resize: false,
      order: vm.active,
      transpose: false
    };

    function renderClust() {
      if (angular.element(window).width() > 992) {
        argumentsObj.transpose = false;
        d3Clust.make_clust(argumentsObj);
      } else if (angular.element(window).width() < 992 &&
        angular.element(window).width() > 580) {
        argumentsObj.transpose = true;
        d3Clust.make_clust(argumentsObj);
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
