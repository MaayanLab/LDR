/**
 * @author Michael McDermott
 * Created on 5/27/15.
 */

(function() {

    angular
        .module('ldr.bar', ['chart.js', 'ldr.api'])
        .directive('ldrBar', ldrBar);

    function ldrBar(api) {
        return {
            restrict: 'E',
            templateUrl: 'bar/bar.html',
            link: ldrBarLink
        };

        /////////////////////

        // Need to use scope here because of canvas library
        /* @ngInject */
        function ldrBarLink(scope, element, attrs) {

            var groupId = attrs.groupId;
            scope.colors = [
                '#286090', // primary
                '#8ABDE8', // primary-light
                '#08385F', // primary-dark
                '#DF6632', // color-red
                '#DFB532', // color-yellow
                '#947002', // color-yellow-dark
                '#aaa' // color-gray
            ];

            scope.labels = [];
            scope.values = [];

            var toTitleCase = function(str) {
                return str.replace(/\w\S*/g, function(txt) {
                    return txt.charAt(0).toUpperCase() +
                        txt.substr(1).toLowerCase();
                });
            };

            api('group/' + groupId + '/statistics/')
                .get()
                .success(function(statsObj) {
                    // Chart takes an array of arrays for multiple bars
                    // in the same chart
                    var seriesOneValues = [];
                    angular.forEach(statsObj, function(value, key) {
                        // All fields are singular. Add an s to the chart
                        // and capitalize first letter
                        scope.labels.push(toTitleCase(key + 's'));
                        seriesOneValues.push(value);
                    });
                    scope.values.push(seriesOneValues);
                });
        }
    }
})();