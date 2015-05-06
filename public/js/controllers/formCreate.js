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

        $scope.options = [
            {
                name: 'assay',
                text: '',
                title: 'Assay',
                modalTitle: 'Assay',
                placeholder: 'Select Assay...',
                multiple: false
            },
            {
                name: 'cellLines',
                title: 'Cell Lines',
                modalTitle: 'Cell Line',
                placeholder: 'Select Cell Lines...',
                multiple: true
            },
            {
                name: 'readouts',
                title: 'Readouts',
                modalTitle: 'Readout',
                placeholder: 'Select Readouts...',
                multiple: true
            },
            {
                name: 'perturbagens',
                title: 'Perturbagens',
                modalTitle: 'Perturbagen',
                placeholder: 'Select Perturbagens...',
                multiple: true
            },
            {
                name: 'manipulatedGene',
                title: 'Manipulated Gene',
                modalTitle: 'Manipulated Gene',
                placeholder: 'Select Manipulated Gene...',
                multiple: false
            },
            {
                name: 'organism',
                title: 'Organism',
                modalTitle: 'Organism',
                placeholder: 'Select Organism...',
                multiple: false
            },
            {
                name: 'relevantDisease',
                title: 'Relevant Disease',
                modalTitle: 'Relevant Disease',
                placeholder: 'Select Relevant Disease...',
                multiple: false
            },
            {
                name: 'experiment',
                title: 'Experiment',
                modalTitle: 'Experiment',
                placeholder: 'Select Experiment',
                multiple: false
            },
            {
                name: 'analysisTools',
                title: 'Analysis Tools',
                modalTitle: 'Analysis Tool',
                placeholder: 'Select Analysis Tools...',
                multiple: true
            },
            {
                name: 'tagsKeywords',
                title: 'Tags/Keywords',
                modalTitle: 'Tag/Keyword',
                placeholder: 'Select Tag/Keywords...',
                multiple: true
            }
        ];

        function chunk(arr, size) {
            var newArr = [];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));
            }
            return newArr;
        }

        $scope.chunkedData = chunk($scope.options, 2);


        $scope.onSelect = function(obj, option) {
            $scope.form[option] = obj;
        };

        var tagCache = {};

        $scope.onSelectCache = function(key, option) {
            $scope.form[option].push( tagCache[key.text] );
        };

        $scope.onRemoveCache = function(key, option) {
            lodash.remove($scope.form[option], function(obj) {
                return obj.formatted_address === key.text;
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
                    tagCache[item.formatted_address] = item;
                    return (multipleBool ? item.formatted_address : item);
                });
            });
        };

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
            $.each($scope.options, function(i, option) {
                $scope.form[option.name] = option.multiple ? [] : {};
            });
        };

        // Clear field when user clicks 'X' button
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

        $scope.addNew = function() {
            console.log('TODO');
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

            $scope.showValidation = true;
            var outputForm = {};
            $.each($scope.form, function (key, value) {
                if (value)
                    outputForm[key] = value;
            });

            // Get counts of meta-data
            outputForm.cellLineCount = $scope.form.cellLines.length;
            outputForm.perturbagenCount = $scope.form.perturbagens.length;
            outputForm.readoutCount = $scope.form.readouts.length;

            // TODO: Only push IDs of model systems, this allows for them to change in the form when changed elsewhere
            /*outputForm.assay = $scope.form.assay._id;
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
            */

            console.log(outputForm);

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
            }
        };

        // Init form. Will be changed to inside a conditional when editing is implemented
        $scope.reset();
    });
