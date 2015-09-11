/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('releases', releases);

  /* @ngInject */
  function releases(api, $state, $modal) {
    return {
      getGroupRel: getGroupRel,
      getOneRel: getOneRel,
      getAllRel: getAllRel,
      getApprovedRel: getApprovedRel,
      getAfterRel: getAfterRel,
      getMetaRel: getMetaRel,
      postRel: postRel,
      edit: edit,
      editUrls: editUrls,
      release: release,
      deleteRel: deleteRel,
      search: search
    };

    //////////////

    function getGroupRel(groupId) {
      return api('releases/group/' + groupId).get();
    }

    function getOneRel(formId) {
      return api('releases/form/' + formId).get();
    }

    function getAllRel() {
      return api('releases/').get();
    }

    function getApprovedRel() {
      return api('releases/approved/').get();
    }

    function getAfterRel(afterId) {
      return api('releases/approved/' + afterId).get();
    }

    function getMetaRel(sample, ids) {
      return api('releases/samples/' + sample.toString() + '?ids=' + ids.join(',')).get();
    }

    function postRel(form) {
      if (angular.isDefined(form._id)) {
        return api('releases/form/' + form._id).post(form);
      } else {
        return api('releases/form/').post(form);
      }
    }

    function edit(formId) {
      $state.go('releasesCreate', {
        id: formId
      });
    }

    function editUrls(form) {
      return $modal
        .open({
          templateUrl: 'partials/urlModal.html',
          controller: 'URLModalInstanceCtrl',
          controllerAs: 'vm',
          resolve: {
            config: function() {
              return {
                form: form
              };
            }
          }
        })
        .result;
    }

    function release(form) {
      if (confirm('Are you sure you would like to release this entry?')) {
        return api('releases/form/' + form._id + '/release').put();
      }
    }

    function deleteRel(form) {
      if (confirm('Are you sure you would like to delete this entry?')) {
        return api('releases/form/' + form._id).del();
      }
    }

    function search(query) {
      return api('releases/search?q=' + query).get();
    }
  }
})();
