/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .service('messagesServ', messagesServ);

    /* @ngInject */
    function messagesServ($modal) {
        this.viewMessages = function(form) {
            $modal.open({
                templateUrl: 'msgModal/msgModal.html',
                controller: 'MsgModalInstanceCtrl',
                resolve: {
                    config: function() {
                        return {
                            form: form
                        };
                    }
                }
            });
        }
    }
})();