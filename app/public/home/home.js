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

    /*.factory('ReleasesLoader', function(api) {
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

                    for (var i = 0; i < releases.length; i++) {
                        this.items.push(releases[i]);
                    }
                    this.after = this.items[this.items.length - 1]._id;
                    this.busy = false;
                }.bind(this)
            );
        };
        return ReleasesLoader;
    })*/

    .controller('HomeController', function($scope, /*ReleasesLoader,*/ api) {

        $scope.approvedReleases = [];
        $scope.query = '';

        api('releases/approved/')
            .get()
            .success(function(releases) {
                $scope.approvedReleases = releases;
            });

        $scope.summary = {
            //Users: 0,
            Readouts: 0,
            Centers: 0,
            Genes: 0,
            Assays: 0,
            Diseases: 0,
            'Cell lines': 0,
            Organisms: 0,
            Perturbagens: 0,
            'Data Releases': 0
        };

        var counts = {};

        api('counts').get().success(function(countsObj) {
            counts = countsObj;
            //countUpTo('Users', 0, counts.Users, 1, 50);
            countUpTo('Data Releases', 0, counts.dataReleases, 3, 50);
            countUpTo('Centers', 0, counts.groups, 1, 50);
            countUpTo('Assays', 0, counts.assays, 1, 50);
            countUpTo('Cell lines', 0, counts.cellLines, 5, 50);
            countUpTo('Perturbagens', 0, counts.perturbagens, 12, 50);
            countUpTo('Readouts', 0, counts.readouts, 5, 50);
            countUpTo('Genes', 0, counts.genes, 5, 50);
            countUpTo('Diseases', 0, counts.diseases, 5, 50);
            countUpTo('Organisms', 0, counts.organisms, 5, 50);
        });

        function countUpTo(field, count, max, step, time) {
            setTimeout(function() {
                if (count + step > max) {
                    countUpTo(field, count, max, 1, 0);
                } else if (count !== max) {
                    count = count + step;
                    $scope.summary[field] = count;
                    $scope.$apply();
                    countUpTo(field, count, max, step, time);
                }
            }, time);
        }
    });
