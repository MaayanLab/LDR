/**
 * Created by mmcdermott on 5/12/15.
 */

/**
 * Created by mmcdermott on 5/12/15.
 */

describe('App', function() {

    beforeEach(module('milestones'));
    var $controller, $http, store, api;

    beforeEach(inject(function(_$controller_, _$http_, _api_, _store_) {
        $controller = _$controller_;
        $http = _$http_;
        store = _store_;
        api = _api_;
        // Replace local storage with fake function -- MUST BE ABOVE CONTROLLER INIT
        sinon.stub(store, 'get', function(key) {
            return { username: 'testUser', center: { name: 'testCenter' } };
        });
    }));

    describe('Milestones', function() {
        var $scope, milestonesController;
        beforeEach(inject(function($rootScope) {
            $scope = $rootScope.$new();
            // Just want to test unit. Ignore $scope.$on route changes by replacing $scope.$on with dummy function
            sinon.stub($scope, '$on', function() {
                return false;
            });
            // Load controller
            milestonesController = $controller('milestonesCtrl', { api: api, $scope: $scope });
        }));

        it('should have a defined controller', function() {
            expect(milestonesController).to.exist;
        });

        it('should have the correct page title', function() {
            expect($scope.pageTitle).to.be.a('string');
            expect($scope.pageTitle).to.be.equal('Milestones');
        })
    });

});