/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('MsgModalInstanceCtrl', MsgModalInstanceCtrl);

  /* @ngInject */
  function MsgModalInstanceCtrl($timeout, $modalInstance,
    config, messages, releases) {

    var vm = this;
    console.log(config.form);
    vm.messages = angular.copy(config.form.messages);
    vm.header = angular.copy(config.form.datasetName);
    vm.newMessage = '';
    vm.removeMsg = removeMsg;
    vm.post = post;
    vm.close = close;


    var formId = config.form._id;

    function updateRelease() {
      releases.getOneRel(formId)
        .success(function(release) {
          vm.messages = angular.copy(release.messages);
          strsToDates();
        });
    }

    function removeMsg(msgObj) {
      messages.removeMsg(formId, msgObj)
        .success(function() {
          updateRelease();
        })
        .error(function(resp) {
          console.log(resp);
          alert('There was an error saving the data. Please try again later.');
          close();
        });
    }

    function post() {
      console.log(formId);
      console.log(vm.newMessage);
      messages.postMsg(formId, vm.newMessage)
        .success(function() {
          updateRelease();
          vm.message = '';
        })
        .error(function(resp) {
          console.log(resp);
          alert('There was an error saving the data. Please try again later.');
          close();
        });
    }

    function strsToDates() {
      angular.forEach(vm.messages, function(msg) {
        msg.date = new Date(msg.date);
      });
    }

    function close() {
      $modalInstance.dismiss('cancel');
    }

    //pollServer();
    strsToDates();
  }

})();
