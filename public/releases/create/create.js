angular.module('milestones.releases.create', [
    'ui.router',
    'angular-storage',
    'ngSanitize',
    'ui.bootstrap',
    'ngTagsInput',
    'ngLodash'
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
                model: ''
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
                name: 'dataUrl',
                title: 'Data URL',
                model: ''
            },
            {
                name: 'metadataUrl',
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

    api('releases/form/' + $stateParams.id).get().success(function(form) {
        if (form._id) {
            $scope.form._id = form._id;
        }
        lodash.each($scope.form.releaseDates, function(obj) {
            obj.model = form.releaseDates['level' + obj.level];
        });
        lodash.each($scope.form.urls, function(obj) {
            obj.model = form.urls[obj.name];
        });
        lodash.each($scope.form.metadata, function(obj) {
            var newData = form.metadata[obj.name];
            lodash.each(newData, function(newObj) {
                newObj.text = newObj.name;
            });
            obj.model = newData;
        });
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

        var form = {
            user: $scope.user._id,
            center: $scope.user.center,
            metadata: {},
            releaseDates: {},
            urls: {}
        };
        lodash.each($scope.form.metadata, function(obj) {
            form.metadata[obj.name] = lodash.map(obj.model, function(obj) { return obj._id });
        });
        lodash.each($scope.form.releaseDates, function(obj) {
            form.releaseDates['level' + obj.level] = lodash.isUndefined(obj.model) ? '' : obj.model;
        });
        lodash.each($scope.form.urls, function(obj) {
            form.urls[obj.name] = lodash.isUndefined(obj.model) ? '' : obj.model;
        });
        
        console.log('Form being posted:');
        console.log(form);

        var endpoint = 'releases/form/';
        if ($scope.form._id) {
            endpoint += $scope.form._id;
        }
        api(endpoint).post(form)
            .error(function(err) {
                console.log(err);
            })
            .success(function(result) {
                $state.go('releasesCreate', { id: result._id });
            });
    };
});
