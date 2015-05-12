/**
 * Created by mmcdermott on 5/12/15.
 */

describe('Dependencies', function() {
    it('Angular should be defined as angular', function() {
        expect(angular).to.exist;
    });
    it('JQuery should be defined as $', function() {
        expect($).to.exist;
    });
});