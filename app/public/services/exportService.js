/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .factory('exportReleases', exportReleases);

    /* @ngInject */
    function exportReleases(lodash, $window) {
        return {
            unselectAll: unselectAll,
            selectAll: selectAll,
            exportRel: exportRel
        };

        //////////////

        function unselectAll(forms) {
            angular.forEach(forms, function(form) {
                form.selected = false;
            });
            return false;
        }

        function selectAll(forms) {
            angular.forEach(forms, function(form) {
                form.selected = true;
            });
            return true;
        }

        function exportRel(forms) {
            var selectedIds = lodash.map(forms, function(form) {
                if (form.selected) {
                    return form._id;
                }
            });

            selectedIds = lodash.remove(selectedIds, function(id) {
                return !!id;
            });

            if (selectedIds.length) {
                $window.open('/LDR/api/releases/export?ids=' + selectedIds.join(','));
            } else {
                alert('You must select releases before you can export them!');
            }
        }
    }
})();