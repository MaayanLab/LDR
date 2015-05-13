angular.module('milestones.releases.create', [
    'ui.router',
    'angular-storage',
    'ngSanitize',
    'ui.bootstrap',
    'ngLodash',
    'ngTagsInput'
])

// UI Router state formCreate
.config(function($stateProvider) {
    $stateProvider.state('releasesCreate', {
        url: '/releases/form/{id:string}',
        controller: 'releases.create.ctrl',
        templateUrl: '/releases/create/create.html',
        data: {
            requiresLogin: true
        }
    });
})

.controller('releases.create.ctrl', function(
        $stateParams, $scope, $timeout, $http, $location, $anchorScroll, store, $state, $modal, lodash, api
    ) {
    
    console.log($stateParams);

    $scope.user = store.get('currentUser');
    $scope.center = $scope.user.center;

    // TODO: Decide if there's a better way to do this.
    $scope.form = {
        metadata: {
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
            metadataUrl:   { val: null },
            qcDocumentUrl: { val: null }
        }
    };

    api('releases/form/' + $stateParams.id).get().success(function(form) {
        debugger;
        $scope.form = form;
    });


    var MAX_TAGS = 100;
    $scope.fields = [
        {
            name: 'assay',
            title: 'Assay',
            modalTitle: 'Assay',
            placeholder: 'Select one assay...',
            maxTags: 1,
            model: $scope.form.metadata.assay
        },
        {
            name: 'cellLines',
            title: 'Cell Lines',
            modalTitle: 'Cell Line',
            placeholder: 'Select cell line(s)...',
            maxTags: 100,
            model: $scope.form.metadata.cellLines
        },
        {
            name: 'readouts',
            title: 'Readouts',
            modalTitle: 'Readout',
            placeholder: 'Select readout(s)...',
            maxTags: MAX_TAGS,
            model: $scope.form.metadata.readouts
        },
        {
            name: 'perturbagens',
            title: 'Perturbagens',
            modalTitle: 'Perturbagen',
            placeholder: 'Select perturbagens...',
            maxTags: MAX_TAGS,
            model: $scope.form.metadata.perturbagens
        },
        {
            name: 'manipulatedGene',
            title: 'Manipulated Gene',
            modalTitle: 'Manipulated Gene',
            placeholder: 'Select one manipulated gene...',
            maxTags: 1,
            model: $scope.form.metadata.manipulatedGene
        },
        {
            name: 'organism',
            title: 'Organism',
            modalTitle: 'Organism',
            placeholder: 'Select Organism...',
            maxTags: 1,
            model: $scope.form.metadata.organism
        },
        {
            name: 'relevantDisease',
            title: 'Relevant Disease',
            modalTitle: 'Relevant Disease',
            placeholder: 'Select Relevant Disease...',
            maxTags: 1,
            model: $scope.form.metadata.relevantDisease
        },
        {
            name: 'experiment',
            title: 'Experiment',
            modalTitle: 'Experiment',
            placeholder: 'Select Experiment',
            maxTags: 1,
            model: $scope.form.metadata.experiment
        },
        {
            name: 'analysisTools',
            title: 'Analysis Tools',
            modalTitle: 'Analysis Tool',
            placeholder: 'Select Analysis Tools...',
            maxTags: MAX_TAGS,
            model: $scope.form.metadata.analysisTools
        },
        {
            name: 'tagsKeywords',
            title: 'Tags/Keywords',
            modalTitle: 'Tag/Keyword',
            placeholder: 'Select Tag/Keywords...',
            maxTags: MAX_TAGS,
            model: $scope.form.metadata.tagsKeywords
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
            model: $scope.form.urls.metadataUrl
        },
        {
            title: 'URL to the QC document',
            model: $scope.form.urls.qcDocumentUrl
        }
    ];

    $scope.autocompleteSource = function(val) {
        return $http.get('http://146.203.54.165:7078/form/cell', {
            params: {
                name: val
            }
        }).then(function(response) {
            return response.data.map(function(item) {
                var result = {};
                result.text = item.name;
                result._id = item._id;
                return result;
            });
        });
    };

    $scope.submit = function() {
        debugger;

        var releaseDates = {};
        $.each($scope.form.releaseDates, function(key, obj) {
            releaseDates[key] = obj;
        });

        var urls = {};
        $.each($scope.form.urls, function(key, obj) {
            urls[key] = obj;
        });

        var metadata = {};
        $.each($scope.form.metadata, function(key) {
            metadata[key] = lodash.map($scope.form.metadata[key], '_id');
        });

        var form = {
            user: $scope.user._id,
            center: $scope.user.center,
            metadata: metadata,
            releaseDates: $scope.form.releaseDates,
            urls: urls
        };

        console.log(form);
        var formApi = api('releases');
        formApi.post(form)
            .error(function (err) {
                console.log(err);
            })
            .success(function (result) {
                console.log('Form posted.');
                debugger;
                $state.go('releasesCreate', { id: result._id });
            });

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

});
