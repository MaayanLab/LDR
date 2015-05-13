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

    it('should return data releases from GET request to /api/releases', function(done) {
        $.get('http://localhost:3001/api/releases').done(function(data) {
            expect(data).to.be.an('array');
            expect(data).to.not.be.empty;
            var release = data[0];
            expect(release).to.be.an('object');
            expect(release).to.include.keys('user', 'center', 'dateModified', 'approved');
            done();
        })
    });

    it('should return user list from GET request to /api/users', function(done) {
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