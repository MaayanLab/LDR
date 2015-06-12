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
             store, $state, $modal, lodash, api, nameServer, $q) {

        $scope.user = store.get('currentUser');
        $scope.group = $scope.user.group;

        var MAX_TAGS = 100;
        $scope.form = {
            metadata: [
                // DO NOT MOVE ASSAY OUTSIDE OF FIRST [0] POSITION
                {
                    name: 'assay',
                    title: 'Assay',
                    modalTitle: 'Assay',
                    placeholder: 'Select one assay...',
                    maxTags: 1,
                    autocompleteEndpoint: 'assay',
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
                    autocompleteEndpoint: 'cell',
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
                    autocompleteEndpoint: 'perturbagen',
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
                    autocompleteEndpoint: 'readout',
                    useAutocomplete: true,
                    autocompleteOnly: true,
                    isRequired: true,
                    model: []
                },
                {
                    name: 'manipulatedGene',
                    title: 'Manipulated Gene',
                    modalTitle: 'Manipulated Gene',
                    placeholder: 'Select one manipulated gene...',
                    maxTags: 1,
                    autocompleteEndpoint: 'gene',
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
                    autocompleteEndpoint: 'organism',
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
                    autocompleteEndpoint: 'disease',
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
                    autocompleteEndpoint: 'tool',
                    // useAutocomplete: true, Uncomment when implemented
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
            experiment: {
                name: 'experiment',
                title: 'Description of Experiment',
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

        // Watch assay description and change experiment description if that
        // is changed
        $scope.$watch('form.metadata[0].model[0]', function() {
            if ($scope.form.metadata[0].model.length) {
                $scope.form.experiment.model =
                    $scope.form.metadata[0].model[0].info;
            }
        });

        function formatText(name) {
            var MAX = 40;
            if (name.length < MAX) {
                return name;
            }
            return name.slice(0, MAX) + '...';
        }

        api('releases/form/' + $stateParams.id).get().success(function(form) {
            if (form._id) {
                $scope.form._id = form._id;
            }
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
                    debugger;
                    if (newObj.name) {
                        newObj.text = formatText(newObj.name);
                    }
                });
                obj.model = newData;
            });
        });

        $scope.autocompleteSource = function(textInput, fieldName) {
            var params = {
                name: textInput,
                group: $scope.group.abbr
            };
            return nameServer.get(fieldName, params).then(function(response) {
                // We build a hash and then convert it to an array of objects
                // in order to prevent duplicates being returned to
                // NgTagsInput.
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

        $scope.submit = function() {
            var form = {
                user: $scope.user._id,
                group: $scope.user.group,
                description: '',
                metadata: {},
                releaseDates: {},
                urls: {}
            };

            form.description = $scope.form.experiment.model;

            var buildIds = function() {
                var promises = [];
                lodash.each($scope.form.metadata, function(metadataObj) {
                    lodash.each(metadataObj.model, function(modelObj) {
                        if (!modelObj._id && modelObj.endpoint) {
                            debugger;
                            // Id doesn't exist but omit it anyway
                            // Add group abbr (will be name eventually)
                            modelObj.group = $scope.group.abbr;
                            var endpoint = modelObj.endpoint;
                            var promise = nameServer
                                .post(endpoint,
                                lodash.omit(modelObj, ['_id', 'endpoint', 'text']))
                                .success(function(id) {
                                    modelObj._id = id;
                                })
                                .error(function(xhr, textStatus, errorThrown) {
                                }
                            );
                            promises.push(promise);
                        }
                    });
                });
                return $q.all(promises);
            };

            buildIds().then(function() {
                lodash.each($scope.form.metadata, function(obj) {
                    form.metadata[obj.name] = lodash.map(obj.model, function(obj) {
                        debugger;
                        if (Object.keys(obj).length === 1 && obj.text) {
                            return obj.text;
                        }
                        else if (obj._id) {
                            return obj._id;
                        }
                        else {
                            throw new Error('Object should have id ' +
                                'and does not!')
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

                console.log(form);
                var endpoint = 'releases/form/';
                if (!lodash.isUndefined($scope.form._id)) {
                    endpoint += $scope.form._id;
                }
                api(endpoint)
                    .post(form)
                    .error(function(err) {
                        throw new Error(err);
                    })
                    .success(function() {
                        //$state.go('releasesCreate', { id: result._id });
                        $state.go('releasesOverview');
                    }
                );
            });
        };
    });
