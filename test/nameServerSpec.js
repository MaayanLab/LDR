/**
 * @author Michael McDermott
 * Created on 5/19/15.
 */

describe('Name Server', function() {

    const assayUrl = 'http://146.203.54.165:7078/form/assay?name=A';
    const cLineUrl = 'http://146.203.54.165:7078/form/cell?name=B';
    const pertUrl = 'http://146.203.54.165:7078/form/perturbagen?name=C';
    const rOutUrl = 'http://146.203.54.165:7078/form/readout?name=D';

    it('should get entries for "A" assay query', function(done) {
        $.get(assayUrl).done(function(data) {
            expect(data).to.be.an('array');
            expect(data).to.not.be.empty;
            done();
        })
    });

    it('should get entries for "B" cell line query', function(done) {
        $.get(cLineUrl).done(function(data) {
            expect(data).to.be.an('array');
            expect(data).to.not.be.empty;
            done();
        })
    });

    it('should get entries for "C" perturbagen query', function(done) {
        $.get(pertUrl).done(function(data) {
            expect(data).to.be.an('array');
            expect(data).to.not.be.empty;
            done();
        })
    });

    it('should get entries for "D" readout query', function(done) {
        $.get(rOutUrl).done(function(data) {
            expect(data).to.be.an('array');
            expect(data).to.not.be.empty;
            done();
        })
    });
});