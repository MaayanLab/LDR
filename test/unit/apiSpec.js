/**
 * Created by mmcdermott on 5/12/15.
 */

describe('API', function() {

    var api, $httpBackend, releaseReqHandler;
    beforeEach(module('milestones'));
    beforeEach(inject(function(_api_, $injector) {
        api = _api_;
        $httpBackend = $injector.get('$httpBackend');
        releaseReqHandler = $httpBackend.when('GET', 'api/releases')
            .respond([{
                _id: "This is an ID string",
                user: "This is an ID string",
                center: "This is an ID string",
                dateModified: "This is a DATE string",
                approved: false
            }]);
        userReqHandler = $httpBackend.when('GET', 'api/users')
            .respond([{
                _id: "This is an ID string",
                username: "This is a string",
                password: "This is a string",
                center: "This is an ID string",
                admin: false
            }]);
    }));
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('can get an instance of the factory', function() {
        expect(api).to.exist;
    });

    it('should make a GET request to api/releases', function(done) {
        $httpBackend.expectGET('api/releases');
        api('releases').get().success(function(releases) {
            expect(releases).to.be.an('array');
            expect(releases[0]).to.include.keys('_id', 'user', 'center', 'dateModified', 'approved');
            done();
        });
        $httpBackend.flush();
    });

    it('should make a GET request to api/users', function(done) {
        $httpBackend.expectGET('api/users');
        api('users').get().success(function(users) {
            expect(users).to.be.an('array');
            expect(users[0]).to.include.keys('_id', 'username', 'password', 'center', 'admin');
            done();
        });
        $httpBackend.flush();

    })

});