/**
 * Created by mmcdermott on 5/12/15.
 */

describe('DataReleases', function() {

  beforeEach(module('ldr'));
  var $controller, $http, store, api;

  beforeEach(inject(function(_$controller_, _$http_, _api_, _store_) {
    $controller = _$controller_;
    $http = _$http_;
    store = _store_;
    api = _api_;
    // Replace local storage with spy -- MUST BE ABOVE CONTROLLER INIT
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
  describe('Create', function() {

    var $scope, createController;
    // beforeEach(inject(function() {
    //   $scope = {};
    //   // Load controller
    //   createController = $controller('ldr.releases.create', {
    //     api: api,
    //     $scope: $scope
    //   });
    // }));

    // it('should have a defined controller', function() {
    //   createController.should.exist();
    // });
  });

  describe('Overview', function() {
    var $scope, overviewController;
    // beforeEach(inject(function() {
    //   $scope = {};
    //   // Load controller
    //   overviewController = $controller('ldr.releases.overview', {
    //     api: api,
    //     $scope: $scope
    //   });
    // }));

    // it('should have a defined controller', function() {
    //   overviewController.should.exist();
    // });
  });

});
