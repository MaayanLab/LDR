// Not fully implemented and user can't access without typing the exact URL
// Allow for batch additions of forms by entering or copying/pasting a large JSON

angular.module("milestonesLanding.formBatch", [
    'ui.router',
    'angular-storage',
    'ngPrettyJson',
    'ui.ace'
])
    .config(function ($stateProvider) {
        $stateProvider.state('formBatch', {
            url: '/forms/batch',
            controller: 'FormBatchCtrl',
            templateUrl: 'views/formBatch.html',
            data: {
                requiresLogin: true
            }
        });

    }).controller('FormBatchCtrl', function FormBatchController($scope, $http, store, $state) {

        $scope.schema =
            [
                {
                    "assay": {
                        "name": "String",
                        "info": "String"
                    },
                    "readoutCount": "Number",
                    "releaseDates": {
                        "levelOne": "Date",
                        "levelTwo": "Date",
                        "levelThree": "Date",
                        "levelFour": "Date"
                    },
                    "perturbagens": [{"name": "String", "type": "String"}],
                    "perturbagensMeta": {
                        "pair": "Boolean",
                        "dose": ["dose-1", "dose-2", "dose-n"],
                        "doseCount": "Number",
                        "time": ["timePoint-1", "timePoint-2", "timePoint-n"],
                        "timeUnit": "String",
                        "timePoints": "Number",
                        "countType": [{"count": "Number", "type": "String"}]
                    },
                    "cellLines": [{
                        "name": "String",
                        "type": "String",
                        "class": "String",
                        "tissue": "String",
                        "controlOrDisease": "String"
                    }],
                    "cellLinesMeta": [{"count": "Number", "type": "String"}],
                    "instanceMeta": {
                        "reps": "Number",
                        "techReps": "Number",
                        "map": [{"perturbagen": "String", "cellLine": "String"}]
                    },
                    "readouts": [{"name": "String", "datatype": "String"}]
                }
            ];

        $scope.schemaOut = JSON.stringify($scope.schema, null, 2);

        $scope.aceBatch = {
            mode: 'javascript',
            onLoad: function (_ace) {
            }
        };

        $scope.aceModel = "[\n" +
            "\tEnter your data releases here.\n" +
            "\tThe final result should be an array of objects, where\n" +
            "\teach object has the schema shown on the left.\n" +
            "\tOnce finished, press the submit button below.\n" +
            "\tDo not forget to separate each data release using a comma!\n" +
            "]";

    });
