angular.module( 'milestonesLanding.formCreate', [
    'ui.router',
    'angular-storage',
    'ui.select',
    'ngSanitize'
])
.config(function($stateProvider, schemaFormDecoratorsProvider) {
    $stateProvider.state('formCreate', {
        url: '/forms/create',
        controller: 'FormCreateCtrl',
        templateUrl: 'views/formCreate.html',
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
.factory('User', function ($http, store) {
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
}).factory('Data', function ($http, store) {
    return {
        getAssays: function() {
            return $http({
                url: 'http://localhost:3001/api/assays',
                method: 'GET',
            });
        },
        getCellLines: function() {
            return $http({
                url: 'http://localhost:3001/api/cellLines',
                method: 'GET',
            });
        },
        getPerturbagens: function() {
            return $http({
                url: 'http://localhost:3001/api/perturbagens',
                method: 'GET',
            });
        }
    };
}).filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
}).controller('FormCreateCtrl', function FormCreateController ($scope, $http, store, $state, User, Data) {


    Data.getAssays().success(function(assays) {
        $scope.assays = assays;
    });

    Data.getCellLines().success(function(cellLines) {
        $scope.cellLines = cellLines;
    });

    Data.getPerturbagens().success(function(perturbagens) {
        $scope.perturbagens = perturbagens;
    });

    $scope.form = {};
    $scope.form.assays = [];
    $scope.form.cellLines = [];
    $scope.form.perturbagens = [];

    $scope.user = store.get('currentUser');

    $scope.dataModel = {};

    var data = {};

    $scope.submit = function(form) {
        if (form === 'assay') {
            data.assay = $scope.assayModel.assay;
            data['assay-info'] = $scope.assayModel['assay-info'];
            $scope.allowPost = true;
        }
    };

    $scope.postData = {
        user: $scope.user,
        data: data
    };


    $scope.postToUser = function() {
        $http({
            url: 'http://localhost:3001/data/create',
            method: 'POST',
            data: $scope.postData
        }).then(function(response) {
            console.log(response);
        }, function(error) {
            alert(error.data);
        });
    };
});
