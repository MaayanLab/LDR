/**
 * @author Michael McDermott
 * Created on 5/12/15.
 */

describe('Dependencies', function() {
    it('Angular should be defined as angular', function() {
        angular.should.exist();
    });
    it('JQuery should be defined as $', function() {
        $.should.exist();
    });
});