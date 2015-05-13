/**
 * Created by mmcdermott on 5/12/15.
 */
describe('User', function() {

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
    describe('Admin', function() {

        var $scope, createController;
        beforeEach(inject(function() {
            $scope = {};
            // Load controller
            createController = $controller('AdminCtrl', { api: api, $scope: $scope });
        }));

        it('should have a defined controller', function() {
            expect(createController).to.exist;
        });
        /*
         it('should make a POST on submit', function(done) {
         var httpSpy = sinon.spy($http, 'post');
         $scope.submit();
         expect(httpSpy.called).to.be.true;
         })
         */
    });

    describe('Registration', function() {
        var $scope, registrationController;
        beforeEach(inject(function() {
            $scope = {};
            // Load controller
            registrationController = $controller('RegisterCtrl', { api: api, $scope: $scope });
        }));

        it('should have a defined controller', function() {
            expect(registrationController).to.exist;
        });
    });

});