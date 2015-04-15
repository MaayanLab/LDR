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
}).controller('FormCreateCtrl', function FormCreateController ($scope, $http, $location, $anchorScroll,
                                                               store, $state,$modal, lodash, FormUpdates,
                                                               FormPosts, DataGets, DataPosts) {
    var emptyDict = {};

    $scope.user = store.get('currentUser');

    var getAllMetaData = function(centerId) {
        // API calls for data
        DataGets.getAssays({ centerId: centerId }).success(function(assays) {
            $scope.assays = assays;
        });
        DataGets.getCellLines({ centerId: centerId }).success(function(cellLines) {
            $scope.cellLines = cellLines;
        });
        DataGets.getPerturbagens({ centerId: centerId }).success(function(perturbagens) {
            $scope.perturbagens = perturbagens;
        });
        DataGets.getReadouts({ centerId: centerId }).success(function(readouts) {
            $scope.readouts = readouts;
        });
    };

    // Get request is too slow. After fixing, will replace large array at bottom of controller
    //DataGets.getDiseases().success(function(diseases) {
    //    $scope.diseases = diseases;
    //});

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

    $scope.reset = function(inpForm) {
        if (inpForm) {
            inpForm.$setPristine();
            inpForm.$setUntouched();
        }

        $scope.addAnother = false;
        $scope.showValidation = false;

        $scope.form = {};
        $scope.form.user = $scope.user._id;
        $scope.form.status = 'awaiting approval';
        $scope.form.dateModified = new Date();
        $scope.form.center = $scope.user.center;
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
        else if (selection === 'CellLine')
            $scope.form.cellLines = [];
        else if (selection === 'Perturbagen')
            $scope.form.perturbagens = [];
        else if (selection === 'Readout')
            $scope.form.readouts = [];
        else if (selection === 'Disease')
            $scope.form.disease = {};
    };

    $scope.addNew = function(inpType) {
        var modalInstance = $modal.open({
            templateUrl: 'views/formModal.html',
            controller: 'FormModalCtrl',
            resolve: {
                data: function() {
                    return {
                        inpType: inpType
                    };
                }
            }
        });
        modalInstance.result.then(function(result){
            result.user = $scope.user._id;
            result.center = $scope.user.center._id;
            if(inpType === 'Assay') {
                DataPosts.postAssay(result);
            }
            if(inpType === 'Cell Line') {
                DataPosts.postAssay(result);
            }
            if(inpType === 'Perturbagen') {
                DataPosts.postAssay(result);
            }
            if(inpType === 'Readout') {
                DataPosts.postAssay(result);
            }
            if(inpType === 'Disease') {
                DataPosts.postDisease(result);
            }
        }, function() {
            getAllMetaData($scope.user.center._id);
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
    $scope.post = function() {
        $scope.showValidation = true;
        var outputForm = {};
        lodash.transform($scope.form, function(res, value, key) {
            if (value)
                outputForm[key] = value;
        });

        outputForm.cellLineCount = $scope.form.cellLines.length;
        outputForm.perturbagenCount = $scope.form.perturbagens.length;
        outputForm.readoutCount = $scope.form.readouts.length;
        outputForm.status = 'awaiting approval';
        outputForm.dateModified = new Date();

        outputForm.assay = $scope.form.assay._id;
        outputForm.cellLines = [];
        for (var i=0;i<outputForm.cellLineCount;i++) {
            outputForm.cellLines.push($scope.form.cellLines[i]._id);
        }
        outputForm.perturbagens = [];
        for (var j=0;j<outputForm.perturbagenCount;j++) {
            outputForm.perturbagens.push($scope.form.perturbagens[j]._id);
        }
        outputForm.readouts = [];
        for (var k=0;k<outputForm.readoutCount;k++) {
            outputForm.readouts.push($scope.form.readouts[k]._id);
        }

        FormPosts
        .postForm(outputForm)
        .error(function(err) {
            console.log(err);
        })
        .success(function(result) {
            console.log('Form posted.');
            console.log(outputForm);
        });
        if ($scope.addAnother) {
            alert('Post successful');

            // Clear form
            $scope.reset();

            // Scroll to top (center)
            $location.hash('formCenter');
            $anchorScroll();
        }
        else {
            $state.go('forms');
        }
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

    // Init form. Will be changed to inside a conditional when editing is implemented
    $scope.reset();
    getAllMetaData($scope.user.center._id);

});
