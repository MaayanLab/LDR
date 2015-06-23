// Home page. Possible implementation of some sort of docent app

angular.module('ldr.home', [
    'ldr.api',
    'ui.router',
    'angular-storage',
    'infinite-scroll',
    'ngLodash',
    'wu.masonry'
])

    .config(function($stateProvider) {
        $stateProvider.state('home', {
            url: '/',
            controller: 'HomeController',
            templateUrl: 'home/home.html'
        });
    })

    .factory('ReleasesLoader', function(api, lodash) {
        var ReleasesLoader = function() {
            this.items = [];
            this.busy = false;
            this.after = '';
        };

        ReleasesLoader.prototype.nextPage = function() {
            if (this.busy || this.empty) {
                return;
            }
            this.busy = true;

            api('releases/approved/' + this.after)
                .get()
                .success(function(releases) {
                    if (!releases.length) {
                        this.empty = true;
                        return;
                    }
                    this.empty = false;
                    // Convert release date strings to proper date objects
                    // so Angular can format them correctly.
                    lodash.each(releases, function(obj) {
                        lodash.each(obj.releaseDates, function(level, key) {
                            if (level === '') {
                                return;
                            }
                            obj.releaseDates[key] = new Date(level);
                        });
                    });

                    for (var i = 0; i < releases.length; i++) {
                        this.items.push(releases[i]);
                    }
                    this.after = this.items[this.items.length - 1]._id;
                    this.busy = false;
                }.bind(this)
            );
        };
        return ReleasesLoader;
    })

    .controller('HomeController', function($scope, ReleasesLoader, $state) {

        $scope.releases = new ReleasesLoader();
        $scope.query = '';

        $scope.searchReleases = function() {
            console.log($scope.query);
            
        };
    });
