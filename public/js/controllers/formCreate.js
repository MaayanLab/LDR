angular.module('milestonesLanding.formCreate', [
    'ui.router',
    'angular-storage',
    'ngSanitize',
    'ui.bootstrap',
    'ngLodash',
    'ngTagsInput'
])
    // UI Router state formCreate
    .config(function ($stateProvider) {
        $stateProvider.state('formCreate', {
            url: '/forms/create',
            controller: 'FormCreateCtrl',
            templateUrl: 'views/formCreate.html',
            data: {
                requiresLogin: true
            }
        });
    })
    .controller('FormCreateCtrl', function FormCreateController($scope, $http, $location, $anchorScroll,
                                                                  store, $state, $modal, lodash, FormUpdates,
                                                                  FormPosts, DataGets, DataPosts) {

        $scope.user = store.get('currentUser');

        $scope.options = {
            assay: {
                name: 'assay',
                title: 'Assay',
                modalTitle: 'Assay',
                placeholder: 'Select Assay...',
                multiple: false
            },
            cellLines: {
                name: 'cellLines',
                title: 'Cell Lines',
                modalTitle: 'Cell Line',
                model: 'form.cellLines',
                placeholder: 'Select Cell Lines...',
                multiple: true
            }
        };

        $scope.tagCache = {};

        $scope.onSelect = function(obj, option) {
            $scope.form[option] = obj;
        };

        $scope.onSelectCache = function(key, option) {
            $scope.form[option][key.text] = $scope.tagCache[key.text];
        };

        $scope.onRemoveCache = function(key, option) {
            delete $scope.form[option][key.text];
        };

        // Grouped all API calls to save having to call four functions each time
        var getAllMetaData = function (centerId) {
            // API calls for data
            DataGets.getAssays({centerId: centerId}).success(function (assays) {
                $scope.assays = assays;
            });
            DataGets.getCellLines({centerId: centerId}).success(function (cellLines) {
                $scope.cellLines = cellLines;
            });
            DataGets.getPerturbagens({centerId: centerId}).success(function (perturbagens) {
                $scope.perturbagens = perturbagens;
            });
            DataGets.getReadouts({centerId: centerId}).success(function (readouts) {
                $scope.readouts = readouts;
            });
        };

        $scope.funcAsync = function(val, multipleBool) {
            if (val === '') {
                return;
            }
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: val,
                    sensor: false
                }
            }).then(function(response) {
                return response.data.results.map(function(item){
                    $scope.tagCache[item.formatted_address] = item;
                    return (multipleBool ? item.formatted_address : item);
                });
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
        $scope.disabledDate = function (date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        $scope.minDate = new Date();

        $scope.lvlOneOpen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.lvlOneOpened = true;
        };

        $scope.lvlTwoOpen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.lvlTwoOpened = true;
        };

        $scope.lvlThreeOpen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.lvlThreeOpened = true;
        };

        $scope.lvlFourOpen = function ($event) {
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

        // Clear form, set pristine and untouched, refresh status and date modified
        $scope.reset = function (inpForm) {
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

        // Clear field when user clicks 'X' button
        $scope.clearSelection = function (selection) {
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

        // Open Modal
        $scope.addNew = function (inpType) {
            var modalInstance = $modal.open({
                templateUrl: 'views/formModal.html',
                controller: 'FormModalCtrl',
                resolve: {
                    data: function () {
                        return {
                            inpType: inpType
                        };
                    }
                }
            });
            modalInstance.result.then(function (result) {
                result.user = $scope.user._id;
                result.center = $scope.user.center._id;
                if (inpType === 'Assay') {
                    DataPosts.postAssay(result);
                }
                if (inpType === 'Cell Line') {
                    DataPosts.postCellLine(result);
                }
                if (inpType === 'Perturbagen') {
                    DataPosts.postPerturbagen(result);
                }
                if (inpType === 'Readout') {
                    DataPosts.postReadout(result);
                }
                if (inpType === 'Disease') {
                    DataPosts.postDisease(result);
                }
            }, function () {
                getAllMetaData($scope.user.center._id);
            });
        };

        // Update form
        $scope.updateForm = function () {
            $scope.form.status = 'awaiting approval';
            $scope.form.dateModified = new Date();
            FormUpdates.updateForm($scope.form).success(function (err, result) {
                if (err)
                    console.log(err);
            });
        };

        // Post form
        $scope.post = function () {

            console.log($scope.form);

            /*$scope.showValidation = true;
            var outputForm = {};
            // TODO: Pretty sure this doesn't work. Should strip all keys with falsey values
            lodash.transform($scope.form, function (res, value, key) {
                if (value)
                    outputForm[key] = value;
            });

            // Get counts of meta-data
            outputForm.cellLineCount = $scope.form.cellLines.length;
            outputForm.perturbagenCount = $scope.form.perturbagens.length;
            outputForm.readoutCount = $scope.form.readouts.length;

            // Reset status and date
            outputForm.status = 'awaiting approval';
            outputForm.dateModified = new Date();

            // Only push IDs of model systems, this allows for them to change in the form when changed elsewhere
            outputForm.assay = $scope.form.assay._id;
            outputForm.cellLines = [];
            for (var i = 0; i < outputForm.cellLineCount; i++) {
                outputForm.cellLines.push($scope.form.cellLines[i]._id);
            }
            outputForm.perturbagens = [];
            for (var j = 0; j < outputForm.perturbagenCount; j++) {
                outputForm.perturbagens.push($scope.form.perturbagens[j]._id);
            }
            outputForm.readouts = [];
            for (var k = 0; k < outputForm.readoutCount; k++) {
                outputForm.readouts.push($scope.form.readouts[k]._id);
            }


            FormPosts
                .postForm(outputForm)
                .error(function (err) {
                    console.log(err);
                })
                .success(function (result) {
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
            }*/
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
