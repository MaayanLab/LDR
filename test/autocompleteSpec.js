/**
 * @author Michael McDermott
 * Created on 5/19/15.
 */

describe('Autocomplete', function() {

  // assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools

  var acBase = 'http://localhost:3001/LDR/api/autocomplete/';

  var assayUrl = acBase + 'assays?q=A';
  var cLineUrl = acBase + 'cellLines?q=A';
  var pertUrl = acBase + 'perturbagens?q=A';
  var rOutUrl = acBase + 'readouts?q=A';
  var geneUrl = acBase + 'genes?q=A';
  var diseaseUrl = acBase + 'diseases?q=A';
  var organismUrl = acBase + 'organisms?q=A';
  var toolUrl = acBase + 'tools?q=A';

  function testACEndpoint(url, finishedCb) {
    return $.get(url).done(function(data) {
      data.should.be.an('array');
      data.should.have.length.above(0);
      finishedCb();
    });
  }

  it('should get entries for assays', function(finished) {
    testACEndpoint(assayUrl, finished);
  });

  it('should get entries for cell lines', function(finished) {
    testACEndpoint(cLineUrl, finished);
  });

  it('should get entries for perturbagens', function(finished) {
    testACEndpoint(pertUrl, finished);
  });

  it('should get entries for readouts', function(finished) {
    testACEndpoint(rOutUrl, finished);
  });

  it('should get entries for genes', function(finished) {
    testACEndpoint(geneUrl, finished);
  });

  it('should get entries for organisms', function(finished) {
    testACEndpoint(organismUrl, finished);
  });

  it('should get entries for diseases', function(finished) {
    testACEndpoint(diseaseUrl, finished);
  });

  it('should get entries for tools', function(finished) {
    testACEndpoint(toolUrl, finished);
  });
});
