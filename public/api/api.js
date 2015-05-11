angular.module('milestonesLanding.api', [])

.factory('dataApi', function($http) {

    var BASE = 'api/',
        SECURE = BASE + 'secure/';
    
    // The only valid params are "id" and "centerId". Do we want to validate
    // before making a request?
    return {
        get: function(endpoint, params) {
            return $http({
                url: BASE + endpoint,
                method: 'GET',
                params: params || {}
            });
        },
        put: function(endpoint, params) {
            return $http({
                url: SECURE + endpoint,
                method: 'PUT',
                data: params
            });
        },
        post: function(endpoint, params) {
            return $http({
                url: SECURE + endpoint,
                method: 'POST',
                data: params
            });
        },
        del: function(endpoint, id) {
            return $http({
                url: SECURE + endpoint,
                method: 'DELETE',
                params: {
                    id: id
                }
            });
        }
    };
});
