/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('ClustModalInstanceCtrl', ClustModalInstanceCtrl);

  /* @ngInject */
  function ClustModalInstanceCtrl($modalInstance, lodash, config, releases) {
    var vm = this;
    var tileAssay = config.tileInfo.row;
    var tileCLine = config.tileInfo.col;
    var pertIds = config.tileInfo.perts.map(function(obj) {
      return obj._id;
    });
    vm.close = close;
    vm.getMetaRels = getMetaRels;
    vm.releases = [];

    function getMetaRels(sampleType, ids) {
      releases
        .getMetaRel(sampleType, ids)
        .success(function(data) {
          // Only take the data releases that have the correct assay and cell
          // line
          lodash.each(data, function(dataRelease) {
            // dataRelease.metadata.assay is an array of objects that always
            // has a length of 1
            var assayAbbr = dataRelease.abbr;
            var cLineAbbrs = lodash.map(dataRelease.metadata.cellLines,
              function(cLine) {
                return cLine.abbr;
              });

            // Only take datasets that have the same assay abbr. and cell line
            // abbrs as the tile that was clicked.
            if (assayAbbr === tileAssay && cLineAbbrs.indexOf(tileCLine) > -1) {
              vm.releases.push(dataRelease);
            }
          });
        });
    }

    function close() {
      $modalInstance.close();
    }

    getMetaRels('perturbagens', pertIds);
  }
})();
