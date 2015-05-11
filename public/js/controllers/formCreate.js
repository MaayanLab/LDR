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
        templateUrl: 'views/formCreate.html',
        data: {
            requiresLogin: true
        }
    });
})

.controller('FormCreateCtrl', function FormCreateController($scope, $timeout, $http, $location, $anchorScroll,
                                                                      store, $state, $modal, lodash) {

    $scope.user = store.get('currentUser');
    $scope.center = $scope.user.center.name;
    
    $scope.form = {
        selectedData: {
            assay: [],
            cellLines: [],
            readouts: [],
            perturbagens: [],
            manipulatedGene: [],
            organism: [],
            relevantDisease: [],
            experiment: [],
            analysisTools: [],
            tagsKeywords: []
        },
        releaseDates: {
            level1: { val: null },
            level2: { val: null },
            level3: { val: null },
            level4: { val: null }
        },
        urls: {
            pubMedUrl:     { val: null },
            dataUrl:       { val: null },
            metaDataUrl:   { val: null },
            qcDocumentUrl: { val: null }
        }
    };

    var MAX_TAGS = 100;
    $scope.fields = [
        {
            name: 'assay',
            title: 'Assay',
            modalTitle: 'Assay',
            placeholder: 'Select one assay...',
            maxTags: 1,
            model: $scope.form.selectedData.assay
        },
        {
            name: 'cellLines',
            title: 'Cell Lines',
            modalTitle: 'Cell Line',
            placeholder: 'Select cell line(s)...',
            maxTags: 100,
            model: $scope.form.selectedData.cellLines
        },
        {
            name: 'readouts',
            title: 'Readouts',
            modalTitle: 'Readout',
            placeholder: 'Select readout(s)...',
            maxTags: MAX_TAGS,
            model: $scope.form.selectedData.readouts
        },
        {
            name: 'perturbagens',
            title: 'Perturbagens',
            modalTitle: 'Perturbagen',
            placeholder: 'Select perturbagens...',
            maxTags: MAX_TAGS,
            model: $scope.form.selectedData.perturbagens
        },
        {
            name: 'manipulatedGene',
            title: 'Manipulated Gene',
            modalTitle: 'Manipulated Gene',
            placeholder: 'Select one manipulated gene...',
            maxTags: 1,
            model: $scope.form.selectedData.manipulatedGene
        },
        {
            name: 'organism',
            title: 'Organism',
            modalTitle: 'Organism',
            placeholder: 'Select Organism...',
            maxTags: 1,
            model: $scope.form.selectedData.organism
        },
        {
            name: 'relevantDisease',
            title: 'Relevant Disease',
            modalTitle: 'Relevant Disease',
            placeholder: 'Select Relevant Disease...',
            maxTags: 1,
            model: $scope.form.selectedData.relevantDisease
        },
        {
            name: 'experiment',
            title: 'Experiment',
            modalTitle: 'Experiment',
            placeholder: 'Select Experiment',
            maxTags: 1,
            model: $scope.form.selectedData.experiment
        },
        {
            name: 'analysisTools',
            title: 'Analysis Tools',
            modalTitle: 'Analysis Tool',
            placeholder: 'Select Analysis Tools...',
            maxTags: MAX_TAGS,
            model: $scope.form.selectedData.analysisTools
        },
        {
            name: 'tagsKeywords',
            title: 'Tags/Keywords',
            modalTitle: 'Tag/Keyword',
            placeholder: 'Select Tag/Keywords...',
            maxTags: MAX_TAGS,
            model: $scope.form.selectedData.tagsKeywords
        }
    ];

    $scope.releaseDates = [
        {
            level: 1,
            model: $scope.form.releaseDates.level1
        },
        {
            level: 2,
            model: $scope.form.releaseDates.level2
        },
        {
            level: 3,
            model: $scope.form.releaseDates.level3
        },
        {
            level: 4,
            model: $scope.form.releaseDates.level4
        }
    ];
    
    $scope.urls = [
        {
            title: 'PubMed URL',
            model: $scope.form.urls.pubMedUrl
        },
        {
            title: 'Data URL',
            model: $scope.form.urls.dataUrl
        },
        {
            title: 'Meta-Data URL',
            model: $scope.form.urls.metaDataUrl
        },
        {
            title: 'URL to the QC document',
            model: $scope.form.urls.qcDocumentUrl
        }
    ];

    $scope.autocompleteSource = function(val) {
        return $http.get('http://146.203.54.165:7078/cell', {
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
        });
    };

    $scope.submit = function() {

        console.log($scope.form);

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
