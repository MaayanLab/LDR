angular.module('milestones.api')
    .factory('nameServer', function($http) {

        var BASE_URL = 'http://146.203.54.165:7078/form/';

        return {
            get: function(endpoint, params) {
                return $http({
                    url: BASE_URL + endpoint,
                    method: 'GET',
                    params: params || {}
                });
            },
            post: function(endpoint, data) {
                return $.ajax({
                    url: BASE_URL + endpoint,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'json',
                    data: data
                });
            }
        };
    });
