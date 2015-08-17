/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .factory('messages', messages);

  /* @ngInject */
  function messages($modal, api) {
    return {
      viewMessages: viewMessages,
      removeMsg: removeMsg,
      postMsg: postMsg
    };

    //////////////////////////////

    function viewMessages(form) {
      return $modal
        .open({
          templateUrl: 'msgModal/msgModal.html',
          controller: 'MsgModalInstanceCtrl',
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

    function removeMsg(formId, msgObj) {
      return api('releases/form/' + formId + '/message/remove/')
        .post(msgObj);
    }

    function postMsg(formId, msgStr) {
      api('releases/form/' + formId + '/message/')
        .post({
          message: msgStr
        });
    }
  }
})();
