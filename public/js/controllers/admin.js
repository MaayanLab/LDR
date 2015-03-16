angular.module( 'milestonesLanding.admin', [
    'ui.router',
    'angular-storage',
])
.config(function($stateProvider) {
    $stateProvider.state('admin', {
        url: '/admin',
        controller: 'AdminCtrl',
        templateUrl: 'views/admin.html',
        data: {
            requiresLogin: true,
            requiresAdmin: true
        }
    });
}).controller('AdminCtrl', function AdminController ($scope, $http, store, $state, FormGets, FormUpdates, DataGets, DataPosts, DataDeletes) {
    var currentUser = store.get('currentUser');
    $scope.allForms = [];

    FormGets.getAllForms().success(function(forms) {
        $scope.allForms = forms;
    });

    $scope.approveForm = function(form) {
        //TODO: Create put request in factory and update status of given form with something like "approved"
        form.status = 'approved';
        FormUpdates.updateForm(form).success(function(err, result) {
            if (err)
                console.log(err);
        });
        FormGets.getAllForms().success(function(forms) {
            $scope.allForms = forms;
        });
    };

    $scope.deleteForm = function(form) {
        if (confirm('Are you sure you would like to delete this entry?')) {
            AdminFactory.deleteForm(form._id).success(function(data) {
                console.log(data);
            });
            FormData.getUserForms(currentUser._id).success(function(data) {
                $scope.forms = data;
            });
        }
    };

    $scope.removeAssay = function(assay) {
        DataDeletes.deleteAssay(assay._id).success(function(data) {
            console.log(data);
        });
    };


    $scope.removeCellLine = function(cLine) {
        DataDeletes.deleteCellLine(cLine._id).success(function(data) {
            console.log(data);
        });
    };

    $scope.removePerturbagen = function(pert) {
        DataDeletes.deletePerturbagen(pert._id).success(function(data) {
            console.log(data);
        });
    };

    $scope.removeReadout = function(rOut) {
        AdminFactory.deleteReadout(rOut._id).success(function(data) {
            console.log(data);
        });
    };
});
