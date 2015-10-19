/**
 * @author Michael McDermott
 * Created on 5/12/15.
 */


describe('API', function() {

  var api, $httpBackend, releaseReqHandler;
  beforeEach(module('ldr'));
  beforeEach(inject(function(_api_, $injector) {
    api = _api_;
    // Mock backend to only test API unit
    $httpBackend = $injector.get('$httpBackend');
    releaseReqHandler = $httpBackend.when('GET', 'api/releases')
      .respond([{
        _id: 'This is an ID string',
        user: 'This is an ID string',
        group: 'This is an ID string',
        dateModified: 'This is a DATE string',
        approved: false
      }]);
    userReqHandler = $httpBackend.when('GET', 'api/users')
      .respond([{
        _id: 'This is an ID string',
        username: 'This is a string',
        password: 'This is a string',
        group: 'This is an ID string',
        admin: false
      }]);
  }));
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should get an instance of the factory', function() {
    api.should.exist();
  });

  it('should make a GET request to api/releases', function(done) {
    $httpBackend.expectGET('api/releases');
    api('releases').get().success(function(releases) {
      releases.should.be.an('array');
      releases[0].should.include.keys('_id', 'user', 'group',
        'dateModified', 'approved');
      done();
    });
    $httpBackend.flush();
  });

  it('should make a GET request to api/users', function(done) {
    $httpBackend.expectGET('api/users');
    api('users').get().success(function(users) {
      users.should.be.an('array');
      users[0].should.include.keys('_id', 'username',
        'password', 'group', 'admin');
      done();
    });
    $httpBackend.flush();
  });

});
