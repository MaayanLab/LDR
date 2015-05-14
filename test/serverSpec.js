/**
 * Created by mmcdermott on 5/12/15.
 */

describe('Server', function() {

    it('should be running', function(done) {
        $.get('http://localhost:3001/').done(function(data) {
            expect(data).to.exist;
            expect(data).to.be.a('string');
            done();
        })
    });

    describe('/api...', function() {

        describe('/users', function() {
            it('should return user list from GET request', function(done) {
                $.get('http://localhost:3001/api/users').done(function(data) {
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
                $.get('http://localhost:3001/api/releases').done(function(data) {
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

        describe('/releases/form and /releases/form/', function() {
            it('should return an empty form on GET request', function(done) {
                $.get('http://localhost:3001/api/releases/form').done(function(form) {
                    expect(form).to.be.an('object');
                    expect(form).to.include.keys('metadata', 'releaseDates', 'urls');
                    done();
                });
                $.get('http://localhost:3001/api/releases/form/').done(function(form) {
                    expect(form).to.be.an('object');
                    expect(form).to.include.keys('metadata', 'releaseDates', 'urls');
                    done();
                });
            });
        });

        describe('/releases/form/:id', function() {
            it('should return an a form with loaded objects on GET request', function(done) {
                var formId = '5554cb58d8f83c0415e4b329';
                $.get('http://localhost:3001/api/releases/form/' + formId).done(function(release) {
                    expect(release).to.be.an('object');
                    expect(release).to.include.keys('user', 'center', 'approved', 'dateModified', '_id',
                        'urls', 'metadata', 'releaseDates');
                    // Make sure that there are not arrays of strings (ids). They should all be replaced with Objects
                    $.each(release.metadata, function(key, valArray) {
                        expect(valArray[0]).to.not.be.a('string');
                    });
                    expect(release.metadata.cellLines[0]).to.be.an('object');
                    done();
                })
            });
            it('should return a 404 and message if invalid id given with GET request', function(done) {
                var formId = 'NOT_A_VALID_FORM_ID';
                $.get('http://localhost:3001/api/releases/form/' + formId).fail(function(response) {
                    expect(response).to.exist;
                    expect(response.status).to.eq(404);
                    expect(response.responseText).to.be.a('string');
                    done();
                })
            });
        });
    });
});