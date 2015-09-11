/**
 * @author Michael McDermott
 * Created on 6/23/15.
 */

(function() {
  'use strict';

  angular
    .module('ldr')
    .controller('URLModalInstanceCtrl', URLModalInstanceCtrl);

  /* @ngInject */
  function URLModalInstanceCtrl($modalInstance, config, api) {

    var vm = this;
    vm.urls = angular.copy(config.form.urls);
    vm.ok = ok;
    vm.cancel = cancel;

    function ok(formIsValid) {
      if (formIsValid) {
        api('releases/form/' + config.form._id + '/urls/')
          .post(vm.urls)
          .success(function() {
            $modalInstance.close(vm.urls);
          })
          .error(function(resp) {
            console.log('error:');
            console.log(resp);
            alert('There was an error saving the data. ' +
              'Please try again later.');
            cancel();
          });
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }

})();
