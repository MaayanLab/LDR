/**
 * @author Michael McDermott
 * Created on 7/21/15.
 */

(function() {
    'use strict';

    angular
        .module('ldr')
        .factory('ReleasesLoader', ReleasesLoader);

    /* @ngInject */
    function ReleasesLoader(releases) {
        var RL = function() {
            this.items = [];
            this.busy = false;
            this.after = '';
        };

        RL.prototype.nextPage = function() {
            if (this.busy || this.empty) {
                return;
            }
            this.busy = true;

            releases.getAfterRel(this.after)
                .success(function(releases) {
                    if (!releases.length) {
                        this.empty = true;
                        return;
                    }
                    this.empty = false;

                    for (var i = 0; i < releases.length; i++) {
                        this.items.push(releases[i]);
                    }
                    this.after = this.items[this.items.length - 1]._id;
                    this.busy = false;
                }.bind(this)
            );
        };
        return RL;
    }
})();
