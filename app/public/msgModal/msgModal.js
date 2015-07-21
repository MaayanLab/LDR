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
    function MsgModalInstanceCtrl($scope, $timeout, $modalInstance,
                                  config, messages, releases) {

        var vm = this;
        vm.messages = angular.copy(config.form.messages);
        vm.header = formatText(angular.copy(config.form.datasetName));
        vm.newMessage = '';
        vm.removeMsg = removeMsg;
        vm.post = post;

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
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    close();
                }
            );
        }

        function post() {
            messages.postMsg(formId, vm.newMessage)
                .success(function() {
                    updateRelease();
                    vm.message = '';
                })
                .error(function(resp) {
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    close();
                }
            );
        }

        function strsToDates() {
            angular.forEach(vm.messages, function(msg) {
                msg.date = new Date(msg.date);
            });
        }

        function formatText(name) {
            var MAX = 50;
            if (name.length < MAX) {
                return name;
            }
            return name.slice(0, MAX) + '...';
        }

        var toPromise;

        //var pollServer = function() {
        //    api('releases/form/' + config.form._id)
        //        .get()
        //        .success(function(release) {
        //            $scope.messages = angular.copy(release.messages);
        //            toPromise = $timeout(pollServer, 3000);
        //        }
        //    );
        //};

        $scope.$on('modal.closing', function() {
            $timeout.cancel(toPromise);
        });

        function close() {
            $timeout.cancel(toPromise);
            $modalInstance.dismiss('cancel');
        }

        //pollServer();
        strsToDates();
    }

})();
