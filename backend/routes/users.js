var jsonWT = require('jsonwebtoken'),
    jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database'),
    _ = require('underscore');

function createToken(user) {
    // TODO: Change name of issuer after determining final name of application
    return jsonWT.sign(user, config.secret, {
        expiresInMinutes: 60,
        issuer: 'http://amp.pharm.mssm.edu/MilestonesLanding/'
    });
}

module.exports = function (app) {
    // USERS
    app.get('/api/users', function (req, res) {
        Models.User.find({}, function (err, users) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(users);
        });
    });

    // Not really needed. Just need to delete JWT on client side
    app.get('/logout', function (req, res) {
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

                var userWOPassword = _.omit(user.toObject(), ['password', '__v']);
                var token = createToken(userWOPassword);
                var userBlob = {
                    user: userWOPassword,
                    id_token: token
                };

                res.status(201).send(userBlob);

            });
    });
};
