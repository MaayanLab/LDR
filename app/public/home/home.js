// Home page. Possible implementation of some sort of docent app

angular.module('ldr.home', [
    'ldr.api',
    'ui.router',
    'angular-storage',
    'infinite-scroll'
])

    .config(function($stateProvider) {
        $stateProvider.state('home', {
            url: '/',
            controller: 'HomeController',
            templateUrl: 'home/home.html'
        });
    })

    .factory('ReleasesLoader', function(api) {
        var ReleasesLoader = function() {
            this.items = [];
            this.busy = false;
            this.after = '';
        };
        ReleasesLoader.prototype.nextPage = function() {
            if (this.busy) {
                return;
            }
            this.busy = true;

            api('releases/approved/' + this.after)
                .get()
                .success(function(releases) {
                    for (var i = 0; i < releases.length; i++) {
                        this.items.push(releases[i]);
                    }
                    this.after = this.items[this.items.length - 1]._id;
                    console.log(this.after);
                    this.busy = false;
                }.bind(this)
            );
        };
        return ReleasesLoader;
    })

    .controller('HomeController', function($scope, ReleasesLoader) {

        $scope.releases = new ReleasesLoader();
    });
