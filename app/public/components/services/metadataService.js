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
      getCounts: getCounts,
      autocomplete: autocomplete
    };

    ///////////////////

    function addNew(newTag, name, model, element) {
      return $modal
        .open({
          templateUrl: 'partials/addModal.html',
          controller: 'ModalInstanceCtrl',
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

    function getCounts() {
      return api('counts').get();
    }

    function autocomplete(endpoint, query) {
      return api('autocomplete/' + endpoint).get({
        q: query
      });
    }
  }

})();
