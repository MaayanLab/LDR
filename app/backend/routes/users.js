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
                res.status(404).send('Error getting users.');
            }
            res.status(200).send(users);
        });
    });

    app.put(baseUrl + '/api/secure/user/:id/changePassword', function(req, res) {

        var userId = req.params.id;
        var enteredPassword = req.body.old;
        var newPassword = req.body.new;

        var query = { _id: userId };
        User
            .findOne(query)
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error: Could not find user with id:' + userId + '.');
                }
                else {
                    console.log(user);
                    user.checkPassword(enteredPassword, function(err, isMatch) {
                        if (err) {
                            console.log(err);
                            res.status(404).send('Error changing password.');
                        }
                        else if (isMatch) {
                            user.password = newPassword;
                            console.log(user);
                            user.save(function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                            res.status(204).send('Password successfully updated');
                        }
                    });
            }
            });
    });

    app.post(baseUrl + '/login', function(req, res) {
        User
            .findOne({ username: req.body.username })
            .populate('group')
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    res.status(401).send('Error logging user in.');
                }
                else if (!user)
                    res.status(404).send('User not found.');
                else {
                    user.checkPassword(req.body.password, function(err, isMatch) {
                        if (err) {
                            console.log(err);
                            res.status(401).send('Error logging user in.');
                        }
                        else if (isMatch) {
                            var userWOPassword = _.omit(user.toObject(), ['password', '__v']);
                            var token = createToken(userWOPassword);
                            var userBlob = {
                                user: userWOPassword,
                                id_token: token
                            };
                            res.status(201).send(userBlob);
                        }
                    });
                }
            });
    });

    app.post(baseUrl + '/register', function(req, res) {
        var inputUser = req.body;
        inputUser.admin = false;
        new User(inputUser)
            .save(function(err) {
                if (err) {
                    console.log('Error creating User: ' + err);
                }
                else {
                    res.status(304).send('User created successfully.');
                }
            });
    })
};
