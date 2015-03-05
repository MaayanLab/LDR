var jwt             = require('jsonwebtoken'),
    config          = require('../config/database'),
    _               = require('lodash');

module.exports = function(app, passport) {

    app.get('/checklogin', function(req, res) {
        if (req.isAuthenticated())
            return res.status(302).send('User is logged in');
        res.status(401).send('User is not logged in');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.status(200).send('User successfully logged out');
    });

    app.post('/login', passport.authenticate('local-login'), function(req, res) {
        token = createToken(req.user); 
        var userBlob = {
            user: req.user,
            id_token: token
        };
        console.log(userBlob);
        res.status(201).send(userBlob);

    });

    app.post('/data/create', function(req, res) {
        console.log('Posting');
    });

};

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60 *5 });
}

// Add as middle argument to get/post if the user needs
// authorization

function isLoggedIn(req, res, next) {
    console.log(req);
    if (req.isAuthenticated())
        return next();
    res.status(401).send('User is unauthorized');
}
