/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('ReturnModalInstanceCtrl', ReturnModalInstanceCtrl);

  function ReturnModalInstanceCtrl(api, $modalInstance, config) {
    var vm = this;
    vm.message = '';
    vm.returnRelease = returnRelease;
    vm.cancel = cancel;

    function returnRelease() {
      if (vm.message.length > 20) {
        var reason = 'This release has been returned for the ' +
          'following reason: ' + vm.message;
        api('releases/form/' + config.form._id + '/return/')
          .post({
            message: reason
          })
          .success(function() {
            $modalInstance.close(reason);
          })
          .error(function(resp) {
            console.log('error:');
            console.log(resp);
            alert('There was an error saving the data. Please try again later.');
            cancel();
          });
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }
})();
