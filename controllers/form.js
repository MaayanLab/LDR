angular.module( 'milestonesLanding.form', [
    'ui.router',
    'angular-storage',
    'schemaForm'
])
.config(function($stateProvider, schemaFormDecoratorsProvider) {
    $stateProvider.state('form', {
        url: '/form',
        controller: 'FormCtrl',
        templateUrl: 'views/form.html',
        data: {
            requiresLogin: true
        }
    });
    schemaFormDecoratorsProvider.addMapping(
        'bootstrapDecorator',
        'datepicker',
        'directives/decorators/bootstrap/datepicker/datepicker.html'
    );
})
.factory('User', function($http, store) {
    var currentUser = store.get('currentUser');
    console.log('CURRENT USER');
    console.log(currentUser);
    return {
        getSchema: function() {
            return $http({
                url: 'http://localhost:3001/api/schema',
                method: 'GET',
                data: currentUser
            });
        }
    };
})
.controller('FormCtrl', function FormController ($scope, $http, store, $state, User) {

    $scope.center = store.get('currentUser').institution;
    $scope.assaySchema = {
        "type": "object",
        "title": "AssaySchema",
        "properties": {
            "assay":  {
                "title": "Assay",
                "type": "string",
                "validationMessage": "Please enter in assay title"
            },
            "assay-info":  {
                "title": "Assay Information",
                "type": "string",
                "validationMessage": "Please enter in assay information"
            },
        },
        "required": ["assay", "assay-info"]
    };
    $scope.assayForm = [
        "assay",
        {
            "key": "assay-info",
            "type": "textarea",
            "placeholder": "Make enter additional information about the assay"
        },
        {
            "type": "submit",
            "title": "OK"
        }
    ];

    $scope.assayModel = {};

    var username = null;
    var data = null;

    $scope.postData = {
        username: username,
        data: data
    };


    $scope.postToUser = function() {
        $http({
            url: 'http://localhost:3001/data/create',
            method: 'POST',
            data: $scope.postData
        }).then(function(response) {
        }, function(error) {
            alert(error.data);
        });
    };

});
