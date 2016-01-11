(function() {
  'use strict';

  angular
    .module('ldr.releases.create', [
      'ui.router',
      'angular-storage',
      'ngSanitize',
      'ui.bootstrap',
      'ngTagsInput',
      'ngLodash'
    ])

  // UI Router state formCreate
  .config(releasesCreateConfig)
    .controller('ReleasesCreateCtrl', ReleasesCreateCtrl);

  /* @ngInject */
  function releasesCreateConfig($stateProvider) {
    $stateProvider.state('releasesCreate', {
      url: '/releases/form/{id:string}',
      templateUrl: 'partials/releasesCreate.html',
      controller: 'ReleasesCreateCtrl',
      controllerAs: 'vm',
      data: {
        requiresLogin: true,
        requiresAdmitted: true
      }
    });
  }

  /* @ngInject */
  function ReleasesCreateCtrl($stateParams, $scope, store, $state, lodash,
    releases, metadata) {

    var vm = this;
    vm.user = store.get('currentUser');
    vm.group = vm.user.group;
    vm.showErrors = false;

    vm.autocompleteSource = autocompleteSource;
    vm.validate = validate;
    vm.cancel = cancel;

    var MAX_TAGS = 10000000;
    vm.form = {
      datasetName: {
        name: 'datasetName',
        title: 'Dataset Name',
        placeholder: 'Enter a name for your dataset...',
        model: ''
      },
      metadata: [
        // DO NOT REARRANGE ORDER
        {
          name: 'assay',
          title: 'Assay',
          modalTitle: 'Assay',
          placeholder: 'Select an assay...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'assays',
          useAutocomplete: true,
          allowSelectMultiple: true,
          autocompleteOnly: true,
          isRequired: true,
          model: []
        }, {
          name: 'cellLines',
          title: 'Cell Lines',
          modalTitle: 'Cell Line',
          placeholder: 'Select cell line(s)...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'cellLines',
          useAutocomplete: true,
          allowSelectMultiple: true,
          autocompleteOnly: true,
          isRequired: true,
          model: []
        }, {
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
        }, {
          name: 'readouts',
          title: 'Readouts',
          modalTitle: 'Readout',
          placeholder: 'Select readout(s)...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'readouts',
          useAutocomplete: true,
          allowSelectMultiple: true,
          autocompleteOnly: true,
          isRequired: true,
          model: []
        }, {
          name: 'genes',
          title: 'Manipulated Gene(s)',
          modalTitle: 'Manipulated Gene',
          placeholder: 'Select manipulated gene(s)...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'genes',
          useAutocomplete: true,
          autocompleteOnly: true,
          model: []
        }, {
          name: 'organisms',
          title: 'Organism(s)',
          modalTitle: 'Organism',
          placeholder: 'Select organism(s)...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'organisms',
          useAutocomplete: true,
          allowSelectMultiple: true,
          autocompleteOnly: true,
          model: []
        }, {
          name: 'diseases',
          title: 'Relevant Disease(s)',
          modalTitle: 'Relevant Disease',
          placeholder: 'Select relevant disease(s)...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'diseases',
          useAutocomplete: true,
          allowSelectMultiple: true,
          autocompleteOnly: true,
          model: []
        }, {
          name: 'tools',
          title: 'Analysis Tools',
          modalTitle: 'Analysis Tool',
          placeholder: 'Select analysis tools used...',
          maxTags: MAX_TAGS,
          autocompleteEndpoint: 'tools',
          useAutocomplete: true,
          autocompleteOnly: true,
          model: []
        }, {
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
      releaseDates: [{
        level: 1,
        model: '',
        isRequired: true
      }, {
        level: 2,
        model: ''
      }, {
        level: 3,
        model: ''
      }, {
        level: 4,
        model: ''
      }],
      urls: [{
        name: 'pubMedUrl',
        title: 'PubMed URL',
        model: ''
      }, {
        name: 'dataUrl',
        title: 'Data URL',
        model: ''
      }, {
        name: 'analysisUrl',
        title: 'Data Analysis URL',
        model: ''
      }, {
        name: 'metadataUrl',
        title: 'Metadata Documentation URL',
        model: ''
      }, {
        name: 'qcDocumentUrl',
        title: 'QC Documentation URL',
        model: ''
      }]
    };

    $scope.$watchGroup([
      'vm.form.metadata[0].model',
      'vm.form.metadata[1].model',
      'vm.form.metadata[2].model',
      'vm.form.metadata[3].model'
    ], function() {
      vm.showErrors = false;
    });

    function formatText(name) {
      var MAX = 50;
      if (name.length < MAX) {
        return name;
      }
      return name.slice(0, MAX) + '...';
    }

    var formInit;

    releases
      .getOneRel($stateParams.id)
      .success(function(form) {
        console.log(form);
        formInit = angular.copy(form);
        angular.forEach(formInit.metadata, function(arr, key) {
          formInit.metadata[key] = lodash.map(arr, function(obj) {
            return obj._id;
          });
        });
        angular.forEach(formInit.releaseDates, function(str, key) {
          formInit.releaseDates[key] =
            (str === null || str === '') ? null : new Date(str);
        });

        vm.form._id = form._id ? form._id : null;
        vm.form.did = form.did ? form.did : '';
        vm.form.description.model = form.description;
        vm.form.datasetName.model = form.datasetName;

        angular.forEach(vm.form.releaseDates, function(obj) {
          var date = form.releaseDates['level' + obj.level];
          obj.model = (date === null || date === '') ?
            null : new Date(date);
        });

        angular.forEach(vm.form.urls, function(obj) {
          obj.model = form.urls[obj.name];
        });

        angular.forEach(vm.form.metadata, function(obj) {
          var newData = form.metadata[obj.name];
          angular.forEach(newData, function(newObj) {
            if (newObj.name) {
              newObj.text = formatText(newObj.name);
            }
          });
          obj.model = newData;
        });
      });

    function autocompleteSource(textInput, fieldName) {
      return metadata
        .autocomplete(fieldName, textInput)
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
    }

    function cancel() {
      $state.go('releasesOverview', { groupId: vm.user.group._id });
    }

    function validate() {
      angular.forEach(vm.form.metadata, function(obj) {
        if (obj.isRequired && !obj.model.length) {
          vm.showErrors = true;
          console.log(obj);
        }
      });
      angular.forEach(vm.form.releaseDates, function(obj) {
        if (obj.isRequired && obj.model === '') {
          vm.showErrors = true;
          console.log(obj);
        }
      });
      if (!vm.showErrors) {
        if (confirm('Are you sure you would like to submit these changes?')) {
          submit();
        }
      }
    }

    function submit() {

      var form = {
        datasetName: vm.form.datasetName.model,
        user: vm.user._id,
        group: vm.user.group._id,
        description: vm.form.description.model,
        metadata: {},
        releaseDates: {},
        urls: {}
      };

      if (vm.form._id) {
        form._id = vm.form._id;
      }
      if (vm.form.did) {
        form.did = vm.form.did;
      }

      angular.forEach(vm.form.metadata, function(obj) {
        form.metadata[obj.name] = lodash.map(obj.model, function(modObj) {
          if (Object.keys(modObj).length === 1 && modObj.text) {
            return modObj.text;
          }
          if (modObj._id) {
            return modObj._id;
          }
        });
      });
      angular.forEach(vm.form.releaseDates, function(obj) {
        form.releaseDates['level' + obj.level] =
          lodash.isUndefined(obj.model) ? '' : obj.model;
      });
      angular.forEach(vm.form.urls, function(obj) {
        form.urls[obj.name] = lodash.isUndefined(obj.model) ?
          '' : obj.model;
      });
      console.log(form);

      releases
        .postRel(form)
        .error(function(err) {
          throw new Error(err);
        })
        .success(function() {
          $state.go('releasesOverview', { groupId: vm.user.group._id });
        });
    }
  }
})();
