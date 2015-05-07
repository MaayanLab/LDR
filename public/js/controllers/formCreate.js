angular.module('milestonesLanding.formCreate', [
    'ui.router',
    'angular-storage',
    'ngSanitize',
    'ui.bootstrap',
    'ngLodash',
    'ngTagsInput'
])

// UI Router state formCreate
.config(function($stateProvider) {
    $stateProvider.state('formCreate', {
        url: '/forms/create',
        controller: 'FormCreateCtrl',
        templateUrl: 'views/formCreate.html'/*,
        data: {
            requiresLogin: true
        }*/
    });
})

.directive('enforceMaxTags', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            ngModelCtrl.$parsers.push(function(value) {
                console.log('link called');
            });
        }
    };
})

.controller('FormCreateCtrl', function FormCreateController($scope, $timeout) {/*$scope, $timeout, $http, $location, $anchorScroll,
                                                                      store, $state, $modal, lodash, FormUpdates,
                                                                      FormPosts, DataGets, DataPosts) {*/

    //$scope.user = store.get('currentUser');

    //var MAX_TAGS = 100;

    $scope.fields = [
        {
            name: 'assay',
            title: 'Assay',
            modalTitle: 'Assay',
            placeholder: 'Select one assay...',
            maxTags: 1,
            selectedData: []
        },
        {
            name: 'cellLines',
            title: 'Cell Lines',
            modalTitle: 'Cell Line',
            placeholder: 'Select cell line(s)...',
            maxTags: 100,
            selectedData: []
        }/*,
        {
            name: 'readouts',
            title: 'Readouts',
            modalTitle: 'Readout',
            placeholder: 'Select readout(s)...',
            maxTags: MAX_TAGS,
            selectedData: []
        },
        {
            name: 'perturbagens',
            title: 'Perturbagens',
            modalTitle: 'Perturbagen',
            placeholder: 'Select perturbagens...',
            maxTags: MAX_TAGS,
            selectedData: []
        },
        {
            name: 'manipulatedGene',
            title: 'Manipulated Gene',
            modalTitle: 'Manipulated Gene',
            placeholder: 'Select one manipulated gene...',
            maxTags: 1,
            selectedData: []
        },
        {
            name: 'organism',
            title: 'Organism',
            modalTitle: 'Organism',
            placeholder: 'Select Organism...',
            maxTags: 1,
            selectedData: []
        },
        {
            name: 'relevantDisease',
            title: 'Relevant Disease',
            modalTitle: 'Relevant Disease',
            placeholder: 'Select Relevant Disease...',
            maxTags: 1,
            selectedData: []
        },
        {
            name: 'experiment',
            title: 'Experiment',
            modalTitle: 'Experiment',
            placeholder: 'Select Experiment',
            maxTags: 1,
            selectedData: []
        },
        {
            name: 'analysisTools',
            title: 'Analysis Tools',
            modalTitle: 'Analysis Tool',
            placeholder: 'Select Analysis Tools...',
            maxTags: MAX_TAGS,
            selectedData: []
        },
        {
            name: 'tagsKeywords',
            title: 'Tags/Keywords',
            modalTitle: 'Tag/Keyword',
            placeholder: 'Select Tag/Keywords...',
            maxTags: MAX_TAGS,
            selectedData: []
        }*/
    ];

    /*function columnize(arr, size) {
        var newArr = [];
        for (var i=0; i<arr.length; i+=size) {
            newArr.push(arr.slice(i, i+size));
        }
        return newArr;
    }*/

    //$scope.columnizedData = columnize($scope.fields, 2);

    $scope.updateAutocomplete = function(val) {
        /*return $http.get('http://146.203.54.165:7078/cell', {
            params: {
                name: val
            }
        }).then(function(response) {
            return response.data.map(function(item) {
                var result = {};
                result.text = item.name;
                result._id = new Date();
                return result;
            });
        });*/
        return $timeout(function () {

            return [{
                "text": "Tag1"
            }, {
                "text": "Tag2"
            }, {
                "text": "Tag3"
            }, {
                "text": "Tag4"
            }, {
                "text": "Tag5"
            }, {
                "text": "Tag6"
            }, {
                "text": "Tag7"
            }, {
                "text": "Tag8"
            }, {
                "text": "Tag9"
            }, {
                "text": "Tag10"
            }]
        })
    };

    // Clear form, set pristine and untouched, refresh status and date modified
    //$scope.reset = function() {
        //$scope.addAnother = false;
        /*$.each($scope.fields, function(i, field) {
            field.selectedData = [];
        });*/
    //};

    // Clear field when user clicks 'X' button
    /*$scope.clearSelection = function(selection) {
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
    };*/

    // Post form
    $scope.post = function() {

        /*var form = {};
        form.user = $scope.user._id;
        form.dateModified = new Date();
        form.center = $scope.user.center;

        $.each($scope.fields, function(key, field) {
            if (field.selectedData.length) {
                form[field.name] = field.selectedData;
            }
        });

        /*FormPosts
            .postForm(outputForm)
            .error(function (err) {
                console.log(err);
            })
            .success(function (result) {
                console.log('Form posted.');
                console.log(outputForm);
            });*/

        /*console.log(form);

        if ($scope.addAnother) {
            alert('Submission successful');
            // Clear form
            $scope.reset();
            // Scroll to top (center)
            $location.hash('formCenter');
            $anchorScroll();
        } else {
            $state.go('forms');
        }*/
    };

    // Init form. Will be changed to inside a conditional when editing is implemented
    //$scope.reset();
});
