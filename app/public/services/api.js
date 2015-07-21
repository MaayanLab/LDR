(function() {
    'use strict';

    angular
        .module('ldr.api', [])
        .factory('api', api);

    /* @ngInject */
    function api($http) {

        var BASE = 'api/',
            SECURE = BASE + 'secure/';

        // The only valid params are "id" and "groupId". Do we want to validate
        // before making a request?
        return function(endpoint) {
            return {
                get: function(params) {
                    return $http({
                        url: BASE + endpoint,
                        method: 'GET',
                        params: params || {}
                    });
                },
                put: function(params) {
                    return $http({
                        url: SECURE + endpoint,
                        method: 'PUT',
                        data: params
                    });
                },
                post: function(params) {
                    return $http({
                        url: SECURE + endpoint,
                        method: 'POST',
                        data: params
                    });
                },
                del: function(params) {
                    return $http({
                        url: SECURE + endpoint,
                        method: 'DELETE',
                        params: params
                    });
                }
            };
        };
    }

})();
