angular.module('ldr.releases.create', [
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
            templateUrl: 'releases/create/create.html',
            data: {
                requiresLogin: true,
                requiresAdmitted: true
            }
        });
    })

    .controller('releases.create.ctrl',
    function($stateParams, $scope, $timeout, $http, $location, $anchorScroll,
             store, $state, $modal, lodash, api) {

        $scope.user = $scope.getCurrentUser();
        $scope.group = $scope.user.group;
        $scope.showErrors = false;

        var MAX_TAGS = 10000;
        $scope.form = {
            datasetName: {
                name: 'datasetName',
                title: 'Dataset Name',
                placeholder: 'Enter a name for your dataset...',
                model: ''
            },
            metadata: [
                // DO NOT MOVE ASSAY OUTSIDE OF FIRST [0] POSITION
                {
                    name: 'assay',
                    title: 'Assay',
                    modalTitle: 'Assay',
                    placeholder: 'Select one assay...',
                    maxTags: 1,
                    autocompleteEndpoint: 'assays',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    isRequired: true,
                    model: []
                },
                {
                    name: 'cellLines',
                    title: 'Cell Lines',
                    modalTitle: 'Cell Line',
                    placeholder: 'Select cell line(s)...',
                    maxTags: 100,
                    autocompleteEndpoint: 'cellLines',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    isRequired: true,
                    model: []
                },
                {
                    name: 'perturbagens',
                    title: 'Perturbagens',
                    modalTitle: 'Perturbagen',
                    placeholder: 'Select perturbagens...',
                    maxTags: MAX_TAGS,
                    autocompleteEndpoint: 'perturbagens',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    isRequired: true,
                    model: []
                },
                {
                    name: 'readouts',
                    title: 'Readouts',
                    modalTitle: 'Readout',
                    placeholder: 'Select readout(s)...',
                    maxTags: MAX_TAGS,
                    autocompleteEndpoint: 'readouts',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    isRequired: true,
                    model: []
                },
                {
                    name: 'manipulatedGene',
                    title: 'Manipulated Gene(s)',
                    modalTitle: 'Manipulated Gene',
                    placeholder: 'Select manipulated gene(s)...',
                    maxTags: 100,
                    autocompleteEndpoint: 'genes',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    model: []
                },
                {
                    name: 'organism',
                    title: 'Organism',
                    modalTitle: 'Organism',
                    placeholder: 'Select Organism...',
                    maxTags: 1,
                    autocompleteEndpoint: 'organisms',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    model: []
                },
                {
                    name: 'relevantDisease',
                    title: 'Relevant Disease',
                    modalTitle: 'Relevant Disease',
                    placeholder: 'Select Relevant Disease...',
                    maxTags: 1,
                    autocompleteEndpoint: 'diseases',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    model: []
                },
                {
                    name: 'analysisTools',
                    title: 'Analysis Tools',
                    modalTitle: 'Analysis Tool',
                    placeholder: 'Select Analysis Tools...',
                    maxTags: MAX_TAGS,
                    autocompleteEndpoint: 'tools',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    model: []
                },
                {
                    name: 'tagsKeywords',
                    title: 'Tags/Keywords',
                    modalTitle: 'Tag/Keyword',
                    placeholder: 'Separate tags with the ENTER key...',
                    maxTags: MAX_TAGS,
                    autocompleteOnly: false,
                    model: []
                }
            ],
            description: {
                name: 'description',
                title: 'Description of Dataset',
                placeholder: 'Enter description...',
                model: ''
            },
            releaseDates: [
                {
                    level: 1,
                    model: '',
                    isRequired: true
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
                    title: 'Metadata Documentation URL',
                    model: ''
                },
                {
                    name: 'qcDocumentUrl',
                    title: 'QC Documentation URL',
                    model: ''
                }
            ]
        };

        $scope.$watchGroup([
            'form.metadata[0].model',
            'form.metadata[1].model',
            'form.metadata[2].model',
            'form.metadata[3].model'
        ], function() {
            $scope.showErrors = false;
        });

        function formatText(name) {
            var MAX = 50;
            if (name.length < MAX) {
                return name;
            }
            return name.slice(0, MAX) + '...';
        }

        var formInit;

        api('releases/form/' + $stateParams.id)
            .get()
            .success(function(form) {
                formInit = angular.copy(form);
                lodash.each(formInit.metadata, function(arr, key) {
                    formInit.metadata[key] = lodash.map(arr, function(obj) {
                        return obj._id;
                    });
                });
                lodash.each(formInit.releaseDates, function(str, key) {
                    formInit.releaseDates[key] =
                        (str === null || str === '') ? null : new Date(str);
                });

                if (form._id) {
                    $scope.form._id = form._id;
                }

                $scope.form.description.model = form.description;
                $scope.form.datasetName.model = form.datasetName;

                lodash.each($scope.form.releaseDates, function(obj) {
                    var date = form.releaseDates['level' + obj.level];
                    obj.model = (date === null || date === '') ?
                        null : new Date(date);
                });

                lodash.each($scope.form.urls, function(obj) {
                    obj.model = form.urls[obj.name];
                });

                lodash.each($scope.form.metadata, function(obj) {
                    var newData = form.metadata[obj.name];
                    lodash.each(newData, function(newObj) {
                        if (newObj.name) {
                            newObj.text = formatText(newObj.name);
                        }
                    });
                    obj.model = newData;
                });
            }
        );

        $scope.autocompleteSource = function(textInput, fieldName) {
            var params = {
                q: textInput
            };
            return api('autocomplete/' + fieldName)
                .get(params)
                .then(function(response) {
                    // We build a hash and then convert it to an array of
                    // objects in order to prevent duplicates being returned
                    // to NgTagsInput.
                    var results = {
                        newField: {
                            text: 'New field',
                            newField: true
                        }
                    };
                    response.data.map(function(item) {
                        if (results[item.name]) {
                            return;
                        }
                        var obj = {};
                        obj.endpoint = fieldName;
                        obj.name = item.name;
                        obj.info = item.info;
                        obj.text = formatText(item.name);
                        obj._id = item._id;
                        results[item.name] = obj;
                    });
                    return lodash.values(results);
                });
        };

        $scope.cancel = function() {
            $state.go('releasesOverview');
        };

        $scope.validate = function() {
            lodash.each($scope.form.metadata, function(obj) {
                if (obj.isRequired && !obj.model.length) {
                    $scope.showErrors = true;
                }
            });
            lodash.each($scope.form.releaseDates, function(obj) {
                if (obj.isRequired && obj.model === '') {
                    $scope.showErrors = true;
                }
            });
            if (!$scope.showErrors) {
                submit();
            }
        };

        var submit = function() {

            var form = {
                user: $scope.user._id,
                group: $scope.user.group._id,
                description: '',
                metadata: {},
                releaseDates: {},
                urls: {}
            };

            form.datasetName = $scope.form.datasetName.model;
            form.description = $scope.form.description.model;

            lodash.each($scope.form.metadata, function(obj) {
                form.metadata[obj.name] = lodash.map(obj.model, function(obj) {
                    if (Object.keys(obj).length === 1 && obj.text) {
                        return obj.text;
                    }
                    if (obj._id) {
                        return obj._id;
                    }
                });
            });
            lodash.each($scope.form.releaseDates, function(obj) {
                form.releaseDates['level' + obj.level] =
                    lodash.isUndefined(obj.model) ? '' : obj.model;
            });
            lodash.each($scope.form.urls, function(obj) {
                form.urls[obj.name] = lodash.isUndefined(obj.model) ?
                    '' : obj.model;
            });

            var endpoint = 'releases/form/';
            if (!lodash.isUndefined($scope.form._id)) {
                endpoint += $scope.form._id;
            }

            // Compare datasetName, metadata, releaseDates, and urls to see
            // if anything has changed. If it has, update it. If not, go back
            // to releasesOverview page.

            var compareDateObjs = function(obj1, obj2) {
                var equal = true;
                lodash.each(obj1, function(date, key) {
                    // If either date is null, calling .toString() will throw a
                    // TypeError. Pythony code here -- Ask forgiveness after
                    // doing it rather than before.
                    try {
                        if (obj1[key].toString() !== obj2[key].toString()) {
                            equal = false;
                        }
                    } catch (e) {
                        if (e instanceof TypeError) {
                            if (obj1[key] !== obj2[key]) {
                                equal = false;
                            }
                        }
                        else {
                            throw e;
                        }
                    }
                });
                return equal;
            };

            if (form.datasetName === formInit.datasetName &&
                lodash.isEqual(form.metadata, formInit.metadata) &&
                compareDateObjs(form.releaseDates, formInit.releaseDates) &&
                lodash.isEqual(form.urls, formInit.urls)) {
                $state.go('releasesOverview');
            } else {
                api(endpoint)
                    .post(form)
                    .error(function(err) {
                        throw new Error(err);
                    })
                    .success(function() {
                        $state.go('releasesOverview');
                    }
                );
            }
        };
    });
