var jsonWT = require('jsonwebtoken'),
    jwt = require('express-jwt'),
    User = require('../models').User,
    config = require('../config/database'),
    baseUrl = require('../config/baseUrl').baseUrl,
    _ = require('underscore');

function createToken(user) {
    return jsonWT.sign(user, config.secret, {
        expiresInMinutes: 60,
        issuer: 'http://amp.pharm.mssm.edu/LDR/'
    });
}

module.exports = function(app) {
    // USERS
    app.get(baseUrl + '/api/users/', function(req, res) {
        User.find({}, function(err, users) {
            if (err) {
                console.log(err);
                res.status(404).send('Error getting users: ' + err);
            }
            res.status(200).send(users);
        });
    });

    app.post(baseUrl + '/login', function(req, res) {
        User
            .findOne({ 'username': req.body.username })
            .populate('center')
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error logging user in: ' + err);
                }
                else if (!user)
                    res.status(404).send('User not found.');
                else if (!user.validPassword(req.body.password))
                    res.status(401).send('Password invalid. Please try again.');

                else {
                    var userWOPassword = _.omit(user.toObject(), ['password', '__v']);
                    var token = createToken(userWOPassword);
                    var userBlob = {
                        user: userWOPassword,
                        id_token: token
                    };
                    res.status(201).send(userBlob);
                }
            });
    });

    app.post(baseUrl + '/register', function(req, res) {
        var inputUser = req.body;
        var newUser = new User(inputUser);
        newUser.save(function(err) {
            if (err) {
                res.status(400).send('Error creating user: ' + err);
            }
        });
        res.status(304).send('User created successfully.');
    })
};
