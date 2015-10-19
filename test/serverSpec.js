/**
 * @author Michael McDermott
 * Created on 5/12/15.
 */

describe('Server', function() {

  var serverUrl = 'http://localhost:3001/LDR';

  it('should be running', function(done) {
    $.get(serverUrl + '/').done(function(data) {
      data.should.be.ok();
      done();
    });
  });

  describe('Autocomplete', function() {

    var acBase = serverUrl + '/api/autocomplete/';
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


  describe('Endpoints', function() {

    describe('/users', function() {
      it('should return user list from GET request', function(done) {
        $.get(serverUrl + '/api/users/').done(function(data) {
          data.should.be.an('array');
          var user = data[0];
          user.should.be.an('object');
          done();
        });
      });
    });

    describe('/releases', function() {
      it('should return data releases from GET request', function(
        done) {
        $.get(serverUrl + '/api/releases/').done(function(data) {
          data.should.be.an('array');
          var release = data[0];
          release.should.be.an('object');
          release.should.include.keys('user', 'group',
            'approved', 'dateModified', '_id',
            'urls', 'metadata', 'releaseDates');
          done();
        });
      });
      it('should return released data releases from GET request', function(
        done) {
        $.get(serverUrl + '/api/releases/released').done(function(data) {
          data.should.be.an('array');
          var release = data[0];
          release.should.be.an('object');
          release.should.include.keys('user', 'group',
            'approved', 'dateModified', '_id',
            'urls', 'metadata', 'releaseDates');
          done();
        });
      });
    });
  });

  describe('Releases Pipeline', function() {
    it(
      'should return an empty form on GET request to /api/releases/form/',
      function(done) {
        $.get(serverUrl + '/api/releases/form/').done(function(form) {
          expect(form).to.be.an('object');
          expect(form).to.include.keys('metadata', 'releaseDates',
            'urls');
          done();
        });
      });
    var validObj = {
      'user': '5519bd94ea7e106fc6784170',
      'group': '5519bd94ea7e106fc6784164',
      'datasetName': 'TEST DATASET NAME',
      'metadata': {
        'assay': ['555a4cfeed103be1009ca9f8'],
        'cellLines': ['554cde880bdc502a4057f5c4'],
        'readouts': [],
        'perturbagens': [],
        'manipulatedGene': [],
        'organism': [],
        'relevantDisease': [],
        'experiment': [],
        'analysisTools': [],
        'tagsKeywords': []
      },
      'releaseDates': {
        'level1': '2016-11-15T04:00:00.000Z',
        'level2': '',
        'level3': '',
        'level4': ''
      },
      'urls': {
        'pubMedUrl': '',
        'dataUrl': '',
        'metadataUrl': '',
        'qcDocumentUrl': ''
      }
    };

    var serverObj;

    it(
      'should make a POST request to /api/secure/releases/form/ and return release with id',
      function(done) {
        $.ajax({
          type: 'POST',
          url: serverUrl + '/api/secure/releases/form/',
          data: validObj
        }).done(function(release) {
          // Check for keys added by server
          expect(release).include.keys('_id', 'dateModified',
            'approved');
          // Pass release to update test
          serverObj = release;
          done();
        });
      });

    it(
      'should make a GET request to /api/releases/form/:id and return individual release',
      function(done) {
        $.get(serverUrl + '/api/releases/form/' + serverObj._id).done(
          function(release) {
            expect(release).to.be.an('object');
            expect(release).to.include.keys('user', 'group',
              'approved', 'dateModified', '_id',
              'urls', 'metadata', 'releaseDates');
            // Make sure that there are not arrays of strings (ids). They should all be replaced with Objects
            $.each(release.metadata, function(key, valArray) {
              expect(valArray[0]).to.not.be.a('string');
            });
            done();
          });
      });

    it(
      'should make a POST request to /api/secure/releases/form/:id and update release in database',
      function(done) {
        // Change a value on serverObj to see if server properly updates
        serverObj.urls.pubMedUrl = 'ThisValueShouldBeUpdatedOnServer';
        $.ajax({
          type: 'POST',
          url: serverUrl + '/api/secure/releases/form/' +
            serverObj._id,
          data: serverObj
        }).done(function(response) {
          var expectedResp = {
            ok: 1,
            nModified: 1,
            n: 1
          };
          expect(response).to.deep.equal(expectedResp);
          done();
        });
      });

    it(
      'should make a DELETE request to /api/secure/releases/form/:id and delete release in database',
      function(done) {
        $.ajax({
          type: 'DELETE',
          url: serverUrl + '/api/secure/releases/form/' +
            serverObj._id
        }).done(function(response) {
          response.should.be.a('string');
          done();
        });
      });

  });

  describe('Error Handling', function() {
    var invalidObj = {
      'keyThatDoesNotConformToSchema': 'The value associated with the invalid key',
      'foo': 'bar',
      'foo2': 'baz'
    };
    var invalidFormId = 'NOT_A_VALID_FORM_ID';

    it(
      'should return a 404 status and message if invalid id given with GET request to /api/releases/form/:id',
      function(done) {
        $.ajax({
          type: 'GET',
          url: serverUrl + '/api/releases/form/' +
            invalidFormId,
          error: function(xhr) {
            xhr.status.should.equal(404);
            xhr.responseText.should.equal(
              'Error: Release could not be found. Id may be invalid'
            );
            done();
          }
        });
      });

    it(
      'should return a 400 status and message if invalid object is POSTed to /api/secure/releases/form/',
      function(done) {

        $.ajax({
          type: 'POST',
          url: serverUrl + '/api/secure/releases/form/',
          data: invalidObj,
          tryCount: 0,
          retryLimit: 3,
          error: function(xhr) {
            if (xhr.status === 0) {
              this.tryCount++;
              if (this.tryCount <= this.retryLimit) {
                $.ajax(this);
                return;
              }
              return;
            }
            xhr.status.should.equal(400);
            xhr.responseText.should.be.a('string');
            done();
          }
        });
      });
  });
});
