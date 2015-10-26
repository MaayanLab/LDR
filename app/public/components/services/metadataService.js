/**
 * @author Michael McDermott
 * Created on 7/21/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('metadata', metadata);

  /* @ngInject */
  function metadata($modal, api) {
    return {
      addNew: addNew,
      autocomplete: autocomplete,
      getReleasedCounts: getReleasedCounts,
      getSamples: getSamples,
      selectMultiple: selectMultiple
    };

    ///////////////////

    function selectMultiple(sampleName) {
      return $modal
        .open({
          templateUrl: 'partials/multipleModal.html',
          controller: 'MultipleModalInstanceCtrl',
          controllerAs: 'vm',
          resolve: {
            config: function() {
              return {
                sample: sampleName,
              };
            }
          }
        })
        .result;
    }

    function addNew(newTag, name, model, element) {
      return $modal
        .open({
          templateUrl: 'partials/addModal.html',
          controller: 'AddModalInstanceCtrl',
          controllerAs: 'vm',
          resolve: {
            config: function() {
              return {
                newTag: newTag,
                name: name,
                model: model,
                element: element
              };
            }
          }
        })
        .result;
    }

    function getReleasedCounts() {
      return api('counts/released').get();
    }

    function autocomplete(endpoint, query) {
      return api('autocomplete/' + endpoint).get({ q: query });
    }

    function getSamples(pluralSampleName) {
      return api(pluralSampleName + '/').get();
    }
  }

})();
