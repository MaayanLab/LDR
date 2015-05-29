/**
 * @author Michael McDermott
 * Created on 5/12/15.
 */


describe('App', function() {

    beforeEach(module('ldr'));
    var $controller, $http, store, api;

    beforeEach(inject(function(_$controller_, _$http_, _api_, _store_) {
        $controller = _$controller_;
        $http = _$http_;
        store = _store_;
        api = _api_;
        // Replace local storage with fake function -- MUST BE ABOVE CONTROLLER INIT
        sinon.stub(store, 'get', function(key) {
            return {
                username: 'testUser',
                group: {
                    _id: '12345',
                    name: 'testCenter'
                }
            };
        });
    }));

    describe('LDR', function() {
        var $scope, ldrController;
        beforeEach(inject(function($rootScope) {
            $scope = $rootScope.$new();
            // Just want to test unit. Ignore $scope.$on route changes by replacing $scope.$on with dummy function
            sinon.stub($scope, '$on', function() {
                return false;
            });
            // Load controller
            ldrController = $controller('ldrCtrl', { api: api, $scope: $scope });
        }));

        it('should have a defined controller', function() {
            ldrController.should.exist();
        });

        it('should have the correct page title', function() {
            $scope.pageTitle.should.be.a('string');
            $scope.pageTitle.should.equal('LDR');
        })
    });

});