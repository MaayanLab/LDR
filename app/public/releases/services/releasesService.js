/**
 * @author Michael McDermott
 * Created on 7/20/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .factory('releases', releases);

    /* @ngInject */
    function releases(api, $state, $modal, store) {
        return {
            getAllRel: getAllRel,
            getRel: getRel,
            edit: edit,
            editUrls: editUrls,
            release: release,
            deleteRel: deleteRel,
            search: search
        };

        //////////////

        function getAllRel() {
            return api('releases/').get();
        }

        function getRel() {
            var user = store.get('currentUser');
            console.log(user);
            return api('releases/group/' + user.group._id).get();
        }

        function edit(form) {
            $state.go('releasesCreate', { id: form._id });
        }

        function editUrls(form) {
            return $modal
                .open({
                    templateUrl: 'releases/urlModal/urlModal.html',
                    controller: 'URLModalInstanceCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        config: function() {
                            return {
                                form: form
                            };
                        }
                    }
                })
                .result;
        }

        function release(form) {
            if (confirm('Are you sure you would like to release this entry?')) {
                return api('releases/form/' + form._id + '/release').put();
            }
        }

        function deleteRel(form) {
            if (confirm('Are you sure you would like to delete this entry?')) {
                return api('releases/form/' + form._id).del();
            }
        }

        function search(query) {
            return api('releases/search?q=' + query).get();
        }
    }
})();