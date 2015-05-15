angular.module('ngLodash', [])

.constant('_', window._)

.run(function($rootScope) {
    $rootScope._ = window._;
});
