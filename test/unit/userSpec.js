/**
 * @author Michael McDermott
 * Created on 5/12/15.
 */

describe('User', function() {

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
  describe('Admin', function() {

    var $scope, createController;
    // beforeEach(inject(function() {
    //   $scope = {};
    //   // Load controller
    //   createController = $controller('ldr.user.admin', {
    //     api: api,
    //     $scope: $scope
    //   });
    // }));

    // it('should have a defined controller', function() {
    //   createController.should.exist();
    // });
  });

  describe('Registration', function() {
    var $scope, registrationController;
    beforeEach(inject(function() {
      $scope = {};
      // Load controller
      registrationController = $controller('RegisterCtrl', {
        api: api,
        $scope: $scope
      });
    }));

    it('should have a defined controller', function() {
      registrationController.should.exist();
    });
  });

});
