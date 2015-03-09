angular.module( 'milestonesLanding.formCreate', [
    'ui.router',
    'angular-storage',
    'ui.select',
    'ngSanitize',
    'ui.bootstrap',
    'ngLodash'
])
.config(function($stateProvider) {
    $stateProvider.state('formCreate', {
        url: '/forms/create',
        controller: 'FormCreateCtrl',
        templateUrl: 'views/formCreate.html',
        data: {
            requiresLogin: true
        }
    });
}).factory('User', function ($http, store) {
    var currentUser = store.get('currentUser');
    console.log('CURRENT USER');
    console.log(currentUser);
    return {
        getSchema: function() {
            return $http({
                url: 'http://localhost:3001/api/schema',
                method: 'GET',
                data: currentUser
            });
        }
    };
}).factory('Data', function ($http, store) {
    return {
        getAssays: function() {
            return $http({
                url: 'http://localhost:3001/api/assays',
                method: 'GET',
            });
        },
        getCellLines: function() {
            return $http({
                url: 'http://localhost:3001/api/cellLines',
                method: 'GET',
            });
        },
        getPerturbagens: function() {
            return $http({
                url: 'http://localhost:3001/api/perturbagens',
                method: 'GET',
            });
        },
        getReadouts: function() {
            return $http({
                url: 'http://localhost:3001/api/readouts',
                method: 'GET',
            });
        }
    };
}).filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
}).controller('FormCreateCtrl', function FormCreateController ($scope, $http, store, $state, lodash, User, Data) {

    var emptyDict = {};

    $scope.user = store.get('currentUser');

    // API calls for selections
    Data.getAssays().success(function(assays) {
        $scope.assays = assays;
    });

    Data.getCellLines().success(function(cellLines) {
        $scope.cellLines = cellLines;
    });

    Data.getPerturbagens().success(function(perturbagens) {
        $scope.perturbagens = perturbagens;
    });

    Data.getReadouts().success(function(readouts) {
        $scope.readouts = readouts;
    });

    // Init for posting data
    $scope.form = {};
    $scope.form.userId = $scope.user._id;
    $scope.form.status = 'awaiting approval';
    $scope.form.dateModified = new Date();
    $scope.form.center = $scope.user.institution;
    $scope.form.assay = {};
    $scope.form.cellLines = [];
    $scope.form.perturbagens = [];
    $scope.form.readouts = [];
    $scope.form.releaseDates = {};

    // Date picker
    $scope.clear = function () {
        $scope.form.releaseDates.levelOne = null;
        $scope.form.releaseDates.levelTwo = null;
        $scope.form.releaseDates.levelThree = null;
        $scope.form.releaseDates.levelFour = null;

    };

    $scope.clear();

    // Disable weekend selection
    $scope.disabledDate = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.minDate = new Date();

    $scope.lvlOneOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.lvlOneOpened = true;
    };

    $scope.lvlTwoOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.lvlTwoOpened = true;
    };

    $scope.lvlThreeOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.lvlThreeOpened = true;
    };

    $scope.lvlFourOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.lvlFourOpened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'MM/dd/yyyy';

    // End date picker

    var data = {};

    $scope.reset = function(inpForm) {
        if (inpForm) {
            inpForm.$setPristine();
            inpForm.$setUntouched();
        }

        $scope.form = {};
        $scope.form.userId = $scope.user._id;
        $scope.form.status = 'awaiting approval';
        $scope.form.dateModified = new Date();
        $scope.form.center = $scope.user.institution;
        $scope.form.assay = {};
        $scope.form.cellLines = [];
        $scope.form.perturbagens = [];
        $scope.form.readouts = [];
        $scope.form.releaseDates = {};
    };

    var post = function() {
        var outputForm = {};
        lodash.transform($scope.form, function(res, value, key) {
            if (value)
                outputForm[key] = value;
        });

        outputForm.readoutCount = $scope.form.readouts.length;
        outputForm.cellLineCount = $scope.form.cellLines.length;
        outputForm.perturbagenCount = $scope.form.perturbagens.length;
        console.log(outputForm);

        $http({
            url: 'http://localhost:3001/api/data/add',
            method: 'POST',
            data: outputForm
        }).then(function(response) {
            console.log(response);
        }, function(error) {
            console.log(error);
            alert(error.data);
        });
    };

    $scope.postMove = function() {
        post();
        $state.go('forms');
    };
    $scope.postAddAnother = function() {
        post();
        alert('Post successful');
        $state.go('formCreate');
    };

    $scope.post = {
        user: $scope.user,
        data: data
    };


    $scope.postToUser = function() {
        $http({
            url: 'http://localhost:3001/api/data/add',
            method: 'POST',
            data: $scope.postData
        }).then(function(response) {
            console.log(response);
        }, function(error) {
            alert(error.data);
        });
    };
});
