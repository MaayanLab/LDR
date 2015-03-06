/*global angular */
'use strict';

/**
 * The main app module
 * @name app
 * @type {angular.Module}
 */
var lightApp = angular.module('lightApp', ['angular-underscore/filters', 'schemaForm', 'pascalprecht.translate', 'ui.select', 'ui.sortable'])
.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', function ($controllerProvider, $compileProvider, $filterProvider, $provide) {

    // Notice that the registration methods on the
    // module are now being overridden by their provider equivalents

    lightApp.controller = $controllerProvider.register;
    lightApp.directive  = $compileProvider.directive;
    lightApp.filter     = $filterProvider.register;
    lightApp.factory    = $provide.factory;
    lightApp.service    = $provide.service;

}])
.controller('SelectController', function($scope){
  $scope.schema = {
    type: 'object',
    title: 'Select',
    properties: {
      name: {
        title: 'Name',
        type: 'string'
      },
      select: {
        title: 'Single Select',
        type: 'string',
        format: 'uiselect',
        description: 'Only single item is allowd',
        items: [
          { value: 'one', label: 'label1'},
          { value: 'two', label: 'label2'},
          { value: 'three', label: 'label3'}
        ]
      },
      number_select: {
        title: 'Number Select',
        type: 'number',
        format: 'uiselect',
        description: 'Only single item is allowd',
        items: [
          { value: 1, label: 'label1'},
          { value: 2, label: 'label2'},
          { value: 3, label: 'label3'}
        ]
      },
      select2: {
        title: 'Single Select',
        type: 'string',
        format: 'uiselect',
        description: 'Only single item is allowd',
        items: [
          { value: 'one', label: 'label1'},
          { value: 'two', label: 'label2'},
          { value: 'three', label: 'label3'}
        ]
      },
      multiselect: {
        title: 'Multi Select',
        type: 'array',
        format: 'uiselect',
        description: 'Multi single items arre allowd',
        minItems: 1,
        maxItems: 4,
        items: [
          { value: 'one', label: 'label1'},
          { value: 'two', label: 'label2'},
          { value: 'three', label: 'label3'},
          { value: 'four', label: 'label4'},
          { value: 'five', label: 'label5'}
        ]
      },
      another: {
        title: 'Multi Select 2',
        type: 'array',
        format: 'uiselect',
        description: 'Multi single items arre allowd',
        minItems: 1,
        items: [
          { value: 'one', label: 'labelx'},
          { value: 'two', label: 'labelc'},
          { value: 'three', label: 'label3'}
        ]
      }
    },
    required: ['select', 'select2', 'another', 'multiselect']
  };
  $scope.form = [
    'name',
     {
       key: 'select',
       options: {
         uiClass: 'short'
       }
     },
     'number_select',
     {
       key: 'select2'
     },
     {
       key: 'another'
     },
     {
       key: 'multiselect'
      }
  ];
  $scope.model = {
    number_select: 1,
    multiselect: ['three', 'one']
  };
  $scope.submitted = function(form){
    $scope.$broadcast('schemaFormValidate')
    console.log($scope.model);
  };
});
