/**
 * Created by mmcdermott on 5/12/15.
 */

describe('Metadata', function() {

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

    describe('Overview', function() {
        var $scope, metadataController;
        beforeEach(inject(function() {
            $scope = {};
            // Load controller
            metadataController = $controller('MetadataCtrl', { api: api, $scope: $scope });
        }));

        it('should have a defined controller', function() {
            expect(metadataController).to.exist;
        });
    });

});