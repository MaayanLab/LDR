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
}).controller('FormCreateCtrl', function FormCreateController ($scope, $http, store, $state, $modal, lodash, FormUpdates, FormPosts, DataGets, DataPosts) {
    var emptyDict = {};

    $scope.user = store.get('currentUser');

    // API calls for selections
    DataGets.getAssays({ centerId: $scope.user.center._id }).success(function(assays) {
        $scope.assays = assays;
    });

    DataGets.getCellLines({ centerId: $scope.user.center._id }).success(function(cellLines) {
        $scope.cellLines = cellLines;
    });

    DataGets.getPerturbagens({ centerId: $scope.user.center._id }).success(function(perturbagens) {
        $scope.perturbagens = perturbagens;
    });

    DataGets.getReadouts({ centerId: $scope.user.center._id }).success(function(readouts) {
        $scope.readouts = readouts;
    });

    // Get request is too slow. After fixing, will replace large array at bottom of controller
    //DataGets.getDiseases().success(function(diseases) {
    //    $scope.diseases = diseases;
    //});

    // Init if not editing
    $scope.form = {};
    $scope.form.userId = $scope.user._id;
    $scope.form.center = $scope.user.center.name;
    $scope.form.assay = {};
    $scope.form.cellLines = [];
    $scope.form.perturbagens = [];
    $scope.form.readouts = [];
    $scope.form.releaseDates = {};
    $scope.form.disease = {};

    // Date picker
    $scope.clear = function () {
        $scope.form.releaseDates.levelOne = null;
        $scope.form.releaseDates.levelTwo = null;
        $scope.form.releaseDates.levelThree = null;
        $scope.form.releaseDates.levelFour = null;

    };

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
        $scope.form.center = $scope.user.center.name;
        $scope.form.assay = {};
        $scope.form.cellLines = [];
        $scope.form.perturbagens = [];
        $scope.form.readouts = [];
        $scope.form.releaseDates = {};
        $scope.form.disease = {};
    };

    $scope.clearSelection = function(selection) {
        if (selection === 'Assay')
            $scope.form.assay = {};
        else if (selection === 'Disease')
            $scope.form.disease = {};
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
                DataPosts.postAssay(result);
                DataGets.getAssays({ userId: $scope.user._id, centerId: $scope.user.center._id }).success(function(assays) {
                    $scope.assays = assays;
                });
            }
            if(inpType === 'Cell Line') {
                DataPosts.postAssay(result);
                DataGets.getCellLines({ userId: $scope.user._id, centerId: $scope.user.center._id }).success(function(cellLines) {
                    $scope.cellLines = cellLines;
                });
            }
            if(inpType === 'Perturbagen') {
                DataPosts.postAssay(result);
                DataGets.getPerturbagens({ userId: $scope.user._id, centerId: $scope.user.center._id }).success(function(perturbagens) {
                    $scope.perturbagens = perturbagens;
                });
            }
            if(inpType === 'Readout') {
                DataPosts.postAssay(result);
                DataGets.getReadouts({ userId: $scope.user._id, centerId: $scope.user.center._id }).success(function(readouts) {
                    $scope.readouts = readouts;
                });
            }
            if(inpType === 'Disease') {
                DataPosts.postDisease(result);
                DataGets.getDiseases({ userId: $scope.user._id, centerId: $scope.user.center._id }).success(function(diseases) {
                    $scope.diseases = diseases;
                });
            }
        });
    };

    $scope.updateForm = function() {
        $scope.form.status = 'awaiting approval';
        $scope.form.dateModified = new Date();
        FormUpdates.updateForm($scope.form).success(function(err, result) {
            if (err)
                console.log(err);
        });
    };

    // TODO: Fix. Should strip keys with empty values and post
    var post = function() {
        var outputForm = {};
        lodash.transform($scope.form, function(res, value, key) {
            if (value)
                outputForm[key] = value;
        });

        outputForm.readoutCount = $scope.form.readouts.length;
        outputForm.cellLineCount = $scope.form.cellLines.length;
        outputForm.perturbagenCount = $scope.form.perturbagens.length;
        outputForm.postedByUser = $scope.user.username;
        outputForm.center = $scope.user.center.name;
        outputForm.status = 'awaiting approval';
        outputForm.dateModified = new Date();


        console.log(outputForm.center);

        FormPosts.postForm(outputForm).success(function(result) {
            console.log('Form posted.');
        });
    };

    $scope.postMove = function() {
        post();
        $state.go('forms');
    };
    $scope.postAddAnother = function() {
        post();
        alert('Post successful');
        $scope.reset();
        // TODO: Add scroll to top
    }; 

    $scope.diseases = [
        {
        name: "aagenaes syndrome",
        info: ""
    },
    {
        name: "aarskog syndrome",
        info: ""
    },
    {
        name: "aase smith syndrome",
        info: ""
    },
    {
        name: "abcd syndrome",
        info: ""
    },
    {
        name: "abderhalden kaufmann lignac syndrome",
        info: ""
    },
    {
        name: "abdominal aortic aneurysm",
        info: ""
    },
    {
        name: "abdominal chemodectomas with cutaneous angiolipomas",
        info: ""
    },
    {
        name: "abdominal cystic lymphangioma",
        info: ""
    }
    ];
});
