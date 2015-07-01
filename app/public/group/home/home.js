/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

angular.module('ldr.group.home', [
    'ui.router',
    'angular-storage',
    'ngFileUpload',
    'ldr.api'
])

    // UI Router state formCreate
    .config(function($stateProvider) {
        $stateProvider.state('groupHome', {
            url: '/group/{id:string}/home',
            controller: 'GroupHomeCtrl',
            templateUrl: 'group/home/home.html',
            data: {
                requiresLogin: true,
                requiresAdmitted: true
            }
        });
    })

    .controller('GroupHomeCtrl', function($scope, $stateParams, $timeout,
                                          store, api, Upload, lodash) {

        $scope.groupId = $stateParams.id;
        $scope.group = {};
        api('group/' + $scope.groupId + '/')
            .get()
            .success(function(group) {
                $scope.group = angular.copy(group);
            });


        $scope.users = [];

        api('group/' + $scope.groupId + '/users/')
            .get()
            .success(function(usersArr) {
                $scope.users = usersArr;
            }
        );

        $scope.acceptUser = function(user) {
            if (confirm('Are you sure you would like to admit this user? This' +
                    ' can not be undone.')) {
                api('group/' + $scope.groupId + '/users/' + user._id +
                    '/approve/')
                    .put()
                    .success(function() {
                        api('group/' + $scope.groupId + '/users/')
                            .get()
                            .success(function(usersArr) {
                                $scope.users = usersArr;
                                $scope.showAdmitted = true;
                                $timeout($scope.showAdmitted = false, 5000);
                            }
                        );
                    }
                );
            }
        };

        $scope.$watch('files', function() {
            $scope.upload($scope.files);
        });
        $scope.log = '';

        $scope.upload = function(files) {
            if (files && files.length) {
                lodash.each(files, function(file) {
                    Upload.upload({
                        url: '/LDR/api/secure/group/' + $scope.groupId +
                            '/upload/',
                        file: file
                    }).progress(function(evt) {
                        //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    }).success(function(data, status, headers, config) {
                        window.location.reload();
                        $scope.log = 'file: ' + config.file.name +
                        ', Response: ' + JSON.stringify(data) +
                        '\n' + $scope.log;
                    });
                });
            }
        };

        // Uncomment to poll server and check for new users
        /*
         var pollServer = function() {
         api('group/' + groupId + '/users')
         .get()
         .success(function(usersArr) {
         $scope.users = usersArr;
         $timeout(pollServer, 1000);
         });
         };
         pollServer();
         */

    });
