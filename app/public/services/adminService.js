/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('admin', admin);

  /* @ngInject */
  function admin(api, $modal) {
    return {
      approve: approve,
      unApprove: unApprove,
      returnRel: returnRel
    };

    //////////////

    function approve(form) {
      return api('admin/' + form._id + '/approve').post();
    }

    function unApprove(form) {
      return api('admin/' + form._id + '/unapprove').post();
    }

    function returnRel(form) {
      return $modal
        .open({
          templateUrl: 'user/admin/returnModal/returnModal.html',
          controller: 'ReturnModalInstanceCtrl',
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
  }
})();
