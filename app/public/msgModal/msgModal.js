/**
 * @author Michael McDermott
 * Created on 6/1/15.
 */

angular.module('ldr')
    .controller('MsgModalInstanceCtrl', function($scope, $timeout, api, lodash,
                                                 $modalInstance, config) {
        $scope.messages = angular.copy(config.form.messages);
        $scope.header = formatText(angular.copy(config.form.datasetName));
        $scope.newMessage = '';

        $scope.removeMsg = function(msg) {
            api('releases/form/' + config.form._id + '/message/remove/')
                .post(msg)
                .success(function() {
                    api('releases/form/' + config.form._id)
                        .get()
                        .success(function(release) {
                            $scope.messages = angular.copy(release.messages);
                            strsToDates();
                        });
                })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    $scope.close();
                }
            );
        };

        $scope.post = function() {
            api('releases/form/' + config.form._id + '/message/')
                .post({ message: $scope.newMessage })
                .success(function() {
                    api('releases/form/' + config.form._id)
                        .get()
                        .success(function(release) {
                            $scope.messages = angular.copy(release.messages);
                            strsToDates();
                            $scope.newMessage = '';
                        });
                })
                .error(function(resp) {
                    console.log('error:');
                    console.log(resp);
                    alert('There was an error saving the data. ' +
                        'Please try again later.');
                    $scope.close();
                }
            );
        };

        var strsToDates = function() {
            lodash.each($scope.messages, function(msg, i) {
                msg.date = new Date(msg.date);
            });
        };

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

        $scope.close = function() {
            $timeout.cancel(toPromise);
            $modalInstance.dismiss('cancel');
        };

        //pollServer();
        strsToDates();
    });
