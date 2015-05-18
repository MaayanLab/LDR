/**
 * Created by mmcdermott on 5/12/15.
 */

describe('Server', function() {

    var baseUrl = 'http://localhost:3001';

    it('should be running', function(done) {
        $.get(baseUrl).done(function(data) {
            expect(data).to.exist;
            expect(data).to.be.a('string');
            done();
        })
    });

    describe('Endpoints', function() {

        describe('/users', function() {
            it('should return user list from GET request', function(done) {
                $.get(baseUrl + '/api/users/').done(function(data) {
                    expect(data).to.be.an('array');
                    expect(data).to.not.be.empty;
                    var user = data[0];
                    expect(user).to.be.an('object');
                    expect(user).to.include.keys('username', 'password', 'center', 'admin');
                    done();
                })
            });
        });

        describe('/releases', function() {
            it('should return data releases from GET request', function(done) {
                $.get(baseUrl + '/api/releases/').done(function(data) {
                    expect(data).to.be.an('array');
                    expect(data).to.not.be.empty;
                    var release = data[0];
                    expect(release).to.be.an('object');
                    expect(release).to.include.keys('user', 'center', 'approved', 'dateModified', '_id',
                        'urls', 'metadata', 'releaseDates');
                    done();
                })
            });
        });
    });

    describe('Releases Pipeline', function() {
        it('should return an empty form on GET request to /api/releases/form/', function(done) {
            $.get(baseUrl + '/api/releases/form/').done(function(form) {
                expect(form).to.be.an('object');
                expect(form).to.include.keys('metadata', 'releaseDates', 'urls');
                done();
            });
            $.get(baseUrl + '/api/releases/form/').done(function(form) {
                expect(form).to.be.an('object');
                expect(form).to.include.keys('metadata', 'releaseDates', 'urls');
                done();
            });
        });
        var validObj = {
            "user": "5519bd94ea7e106fc6784170",
            "center": "5519bd94ea7e106fc6784164",
            "metadata": {
                "assay": [], "cellLines": ["554cde880bdc502a4057f5c4"], "readouts": [],
                "perturbagens": [], "manipulatedGene": [], "organism": [], "relevantDisease": [],
                "experiment": [], "analysisTools": [], "tagsKeywords": []
            },
            "releaseDates": { "level1": "", "level2": "", "level3": "", "level4": "" },
            "urls": { "pubMedUrl": "", "dataUrl": "", "metadataUrl": "", "qcDocumentUrl": "" }
        };

        var serverObj;

        it('should make a POST request to /api/secure/releases/form/ and return release with id', function(done) {
            $.ajax({
                type: 'POST',
                url: baseUrl + '/api/secure/releases/form/',
                data: validObj
            }).done(function(release) {
                // Check for keys added by server
                expect(release).include.keys('_id', 'dateModified', 'approved');
                // Pass release to update test
                serverObj = release;
                done();
            })
        });

        it('should make a GET request to /api/releases/form/:id and return individual release', function(done) {
            $.get(baseUrl + '/api/releases/form/' + serverObj._id).done(function(release) {
                expect(release).to.be.an('object');
                expect(release).to.include.keys('user', 'center', 'approved', 'dateModified', '_id',
                    'urls', 'metadata', 'releaseDates');
                // Make sure that there are not arrays of strings (ids). They should all be replaced with Objects
                $.each(release.metadata, function(key, valArray) {
                    expect(valArray[0]).to.not.be.a('string');
                });
                done();
            })
        });

        it('should make a POST request to /api/secure/releases/form/:id and update release in database',
            function(done) {
                // Change a value on serverObj to see if server properly updates
                serverObj.urls.pubMedUrl = "ThisValueShouldBeUpdatedOnServer";
                $.ajax({
                    type: 'POST',
                    url: baseUrl + '/api/secure/releases/form/' + serverObj._id,
                    data: serverObj
                }).done(function(updatedRelease) {
                    expect(updatedRelease).include.keys('_id', 'dateModified', 'approved');
                    // Check that object on server has changed url
                    expect(updatedRelease.urls.pubMedUrl).to.be.eq("ThisValueShouldBeUpdatedOnServer");
                    // Pass updated release to delete test
                    serverObj = updatedRelease;
                    done();
                })
            });

        it('should make a DELETE request to /api/secure/releases/form/:id and delete release in database',
            function(done) {
                $.ajax({
                    type: 'DELETE',
                    url: baseUrl + '/api/secure/releases/form/' + serverObj._id
                }).done(function(response) {
                    expect(response).to.be.a('string');
                    done();
                })
            });

    });

    describe('Error Handling', function() {
        var invalidObj = {
            "keyThatDoesntConformToSchema": "The value associated with the invalid key",
            "foo": "bar",
            "foo2": "baz"
        };
        var invalidFormId = 'NOT_A_VALID_FORM_ID';

        it('should return a 404 status and message if invalid id given with GET request to /api/releases/form/:id',
            function(done) {
                $.get(baseUrl + '/api/releases/form/' + invalidFormId).fail(function(response) {
                    expect(response).to.exist;
                    expect(response.status).to.eq(404);
                    expect(response.responseText).to.be.a('string');
                    done();
                })
            });

        it('should return a 400 status and message if invalid Object is POSTed to /api/secure/releases/form/',
            function(done) {
                $.ajax({
                    type: 'POST',
                    url: baseUrl + '/api/secure/releases/form/',
                    data: invalidObj
                }).fail(function(response) {
                    expect(response).to.exist;
                    expect(response.status).to.eq(400);
                    expect(response.responseText).to.be.a('string');
                    done();
                })
            })
    });
});