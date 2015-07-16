/**
 * @author Michael McDermott
 * Created on 6/23/15.
 */

angular.module('ldr.search', [
    'ui.router',
    'angular-storage',
    'ldr.api',
    'ngLodash'
])

    // UI Router state formCreate
    .config(function($stateProvider) {
        $stateProvider.state('search', {
            url: '/search?{q:string}',
            controller: 'SearchCtrl',
            templateUrl: 'search/search.html'
        });
    })

    .controller('SearchCtrl', function($scope, $stateParams, lodash,
                                          store, api) {

        $scope.results = [];
        $scope.query = $stateParams.q;

        // Add separate query that doesn't change on input change
        $scope.queryLabel = angular.copy($scope.query);
        api('releases/search?q=' + $scope.query)
            .get()
            .success(function(results) {
                lodash.each(results, function(obj) {
                    lodash.each(obj.releaseDates, function(level, key) {
                        if (level === '') {
                            return;
                        }
                        obj.releaseDates[key] = new Date(level);
                    });
                });
                $scope.results = results;
            }
        );
    });