var jsonWT = require('jsonwebtoken'),
    jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database'),
    _ = require('lodash');


function createToken(user) {
    return jsonWT.sign(_.omit(user, 'password'), config.secret, {expiresInMinutes: 60 * 5});
}

module.exports = function (app) {

// USERS
    /*
     app.get('/api/users', function(req, res) {
     Models.User.find({}, function(err, users) {
     if (err) {
     console.log(err);
     return done(err);
     }
     res.status(200).send(users);
     });
     });
     */
    app.get('/logout', function (req, res) {
        req.logout();
        res.status(200).send('User successfully logged out');
    });

    app.post('/login', function (req, res) {
        Models.User
            .findOne({'username': req.body.username})
            .populate('center')
            .exec(function (err, user) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!user)
                    return res.status(404).send('User not found.');
                if (!user.validPassword(req.body.password))
                    return res.status(401).send('Password invalid. Please try again.');

                var token = createToken(req.user);
                var userBlob = {
                    user: user,
                    id_token: token
                };
                console.log(userBlob);
                res.status(201).send(userBlob);

            });
    });
};
