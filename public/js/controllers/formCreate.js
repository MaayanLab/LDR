angular.module( 'milestonesLanding.formCreate', [
    'ui.router',
    'angular-storage',
    'ui.select',
    'ngSanitize',
    'ui.bootstrap',
    'ngLodash'
])
.config(function($stateProvider) {
    $stateProvider.state('formsCreate', {
        url: '/forms/create',
        controller: 'FormCreateCtrl',
        templateUrl: 'views/formCreate.html',
        data: {
            requiresLogin: true
        }
    });
}).factory('User', function ($http, store) {
    var currentUser = store.get('currentUser');
    return {
        getSchema: function() {
            return $http({
                url: base + 'api/schema',
                method: 'GET',
                data: currentUser
            });
        }
    };
}).factory('Data', function ($http, store) {
    return {
        getAssays: function() {
            return $http({
                url: base + 'api/assays',
                method: 'GET',
            });
        },
        getCellLines: function() {
            return $http({
                url: base + 'api/cellLines',
                method: 'GET',
            });
        },
        getPerturbagens: function() {
            return $http({
                url: base + 'api/perturbagens',
                method: 'GET',
            });
        },
        getReadouts: function() {
            return $http({
                url: base + 'api/readouts',
                method: 'GET',
            });
        },
        postAssay: function(assay) {
            return $http({
                url: base + 'api/assays',
                method: 'POST',
                data: assay
            });
        },
        postCellLine: function(cellLine) {
            return $http({
                url: base + 'api/cellLines',
                method: 'POST',
                data: cellLine
            });
        },
        postPerturbagen: function(pert) {
            return $http({
                url: base + 'api/perturbagens',
                method: 'POST',
                data: pert
            });
        },
        postReadout: function(readout) {
            return $http({
                url: base + 'api/readouts',
                method: 'POST',
                data: readout
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
}).controller('FormCreateCtrl', function FormCreateController ($scope, $http, store, $state, $modal, lodash, User, Data) {

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

    $scope.addNew = function(inpType) {

        var modalInstance = $modal.open({
            templateUrl: 'views/formModal.html',
            controller: 'FormModalCtrl',
            resolve: {
                datatype: function() {
                    return inpType;
                }
            }
        });

        modalInstance.result.then(function(result){
            if(inpType === 'Assay') {
                Data.postAssay(result);
                Data.getAssays().success(function(assays) {
                    $scope.assays = assays;
                }
                                        );
            }
            if(inpType === 'Cell Line') {
                Data.postAssay(result);
                Data.getCellLines().success(function(cellLines) {
                    $scope.cellLines = cellLines;
                });
            }
            if(inpType === 'Perturbagen') {
                Data.postAssay(result);
                Data.getPerturbagens().success(function(perturbagens) {
                    $scope.perturbagens = perturbagens;
                });
            }
            if(inpType === 'Readout') {
                Data.postAssay(result);
                Data.getReadouts().success(function(readouts) {
                    $scope.readouts = readouts;
                });
            }
        });
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

        $http({
            url: base + 'api/data/add',
            method: 'POST',
            data: outputForm
        }).then(function(response) {
        }, function(error) {
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
});
