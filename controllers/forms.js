angular.module( 'milestonesLanding.forms', [
    'ui.router',
    'angular-storage',
    'schemaForm'
])
.config(function($stateProvider, schemaFormDecoratorsProvider) {
    $stateProvider.state('forms', {
        url: '/forms',
        controller: 'FormsCtrl',
        templateUrl: 'views/forms.html',
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
                url: 'http://localhost:3001/api/data/schema',
                method: 'GET',
                data: currentUser
            });
        }
    };
})
.controller('FormsCtrl', function FormsController ($scope, $http, store, $state, User) {
    
   
});
