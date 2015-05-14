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
    
    $scope.user = store.get('currentUser');
    $scope.center = $scope.user.center;

    var MAX_TAGS = 100;
    $scope.form = {
        metadata: [
            {
                name: 'assay',
                title: 'Assay',
                modalTitle: 'Assay',
                placeholder: 'Select one assay...',
                maxTags: 1,
                model: []
            },
            {
                name: 'cellLines',
                title: 'Cell Lines',
                modalTitle: 'Cell Line',
                placeholder: 'Select cell line(s)...',
                maxTags: 100,
                model: []
            },
            {
                name: 'readouts',
                title: 'Readouts',
                modalTitle: 'Readout',
                placeholder: 'Select readout(s)...',
                maxTags: MAX_TAGS,
                model: []
            },
            {
                name: 'perturbagens',
                title: 'Perturbagens',
                modalTitle: 'Perturbagen',
                placeholder: 'Select perturbagens...',
                maxTags: MAX_TAGS,
                model: []
            },
            {
                name: 'manipulatedGene',
                title: 'Manipulated Gene',
                modalTitle: 'Manipulated Gene',
                placeholder: 'Select one manipulated gene...',
                maxTags: 1,
                model: []
            },
            {
                name: 'organism',
                title: 'Organism',
                modalTitle: 'Organism',
                placeholder: 'Select Organism...',
                maxTags: 1,
                model: []
            },
            {
                name: 'relevantDisease',
                title: 'Relevant Disease',
                modalTitle: 'Relevant Disease',
                placeholder: 'Select Relevant Disease...',
                maxTags: 1,
                model: []
            },
            {
                name: 'experiment',
                title: 'Experiment',
                modalTitle: 'Experiment',
                placeholder: 'Select Experiment',
                maxTags: 1,
                model: []
            },
            {
                name: 'analysisTools',
                title: 'Analysis Tools',
                modalTitle: 'Analysis Tool',
                placeholder: 'Select Analysis Tools...',
                maxTags: MAX_TAGS,
                model: []
            },
            {
                name: 'tagsKeywords',
                title: 'Tags/Keywords',
                modalTitle: 'Tag/Keyword',
                placeholder: 'Select Tag/Keywords...',
                maxTags: MAX_TAGS,
                model: []
            }
        ],
        releaseDates: [
            {
                level: 1,
                model: 'foo'
            },
            {
                level: 2,
                model: ''
            },
            {
                level: 3,
                model: ''
            },
            {
                level: 4,
                model: ''
            }
        ],
        urls: [
            {
                name: 'pubMedUrl',
                title: 'PubMed URL',
                model: ''
            },
            {
                name: 'dateUrl',
                title: 'Data URL',
                model: ''
            },
            {
                name: 'metaDataUrl',
                title: 'Metadata URL',
                model: ''
            },
            {
                name: 'qcDocumentUrl',
                title: 'URL to the QC document',
                model: ''
            }
        ],
    };

    /*
    {
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
            level1: '',
            level2: '',
            level3: '',
            level4: ''
        },
        urls: {
            pubMedUrl:     '',
            dataUrl:       '',
            metadataUrl:   '',
            qcDocumentUrl: ''
        }
    }
    */

    api('releases/form/' + $stateParams.id).get().success(function(form) {
        /*lodash.each(form.metadata, function(sObj, sKey) {
            lodash.zipWith($scope.form[sKey], sObj);
        });*/
    });

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
        console.log($scope.form);
        
        /*debugger;
        

        var metadata = {};
        $.each($scope.form.metadata, function(key) {
            metadata[key] = lodash.map($scope.form.metadata[key], '_id');
        });

        var form = {
            user: $scope.user._id,
            center: $scope.user.center,
            metadata: metadata,
            releaseDates: $scope.form.releaseDates,
            urls: $scope.form.urls
        };

        console.log('Form being posted:');
        console.log(form);
        var formApi = api('releases');
        form.urls.pubMedUrl = { val: 'foooooo' };
        formApi.post(form)
            .error(function (err) {
                console.log(err);
            })
            .success(function (result) {
                console.log('Form posted.');
                console.log('Result from post is.');
                console.log(result);
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
