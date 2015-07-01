var jsonWT = require('jsonwebtoken'),
    jwt = require('express-jwt'),
    User = require('../models').User,
    config = require('../config/database'),
    baseUrl = require('../config/baseUrl').baseUrl,
    _ = require('lodash');

function createToken(user) {
    return jsonWT.sign(user, config.secret, {
        expiresInMinutes: 120,
        issuer: 'http://amp.pharm.mssm.edu/LDR/'
    });
}

module.exports = function(app) {
    // USERS
    app.get(baseUrl + '/api/users/', function(req, res) {
        User
            .find({})
            .populate('group')
            .lean()
            .exec(function(err, users) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error getting users.');
                }
                var userList = [];
                _.each(users, function(user) {
                    userList.push(_.omit(user, ['password', 'admin', '__v']));
                });
                res.status(200).send(userList);
            }
        );
    });

    app.put(baseUrl + '/api/secure/user/:id/update/', function(req, res) {
        var userId = req.params.id;
        var updatedUser = req.body;
        var query = { _id: userId };
        User.update(query, updatedUser, function(err, user) {
            if (err) {
                console.log(err);
                res.status(400).send('Error updating user');
            } else {
                res.status(204).send('User successfully updated');
            }
        });
    });

    app.put(baseUrl + '/api/secure/user/:id/changePassword/',
        function(req, res) {

            var userId = req.params.id;
            var enteredPassword = req.body.old;
            var newPassword = req.body.new;

            var query = { _id: userId };
            User
                .findOne(query)
                .exec(function(err, user) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Error: Could not find user ' +
                            'with id:' + userId + '.');
                    } else if (enteredPassword) {
                        user.checkPassword(enteredPassword,
                            function(err, isMatch) {
                                if (err) {
                                    console.log(err);
                                    res.status(404).send('Error ' +
                                        'changing password.');
                                } else if (isMatch && newPassword) {
                                    user.password = newPassword;
                                    console.log(user);
                                    user.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                    res.status(204).send('Password ' +
                                        'successfully updated');
                                }
                            }
                        );
                    } else {
                        res.status(404).send('There was an error changing the' +
                            'user\'s password.');
                    }
                }
            );
        }
    );

    app.post(baseUrl + '/login', function(req, res) {
        User
            .findOne({ username: req.body.username })
            .populate('group')
            .exec(function(err, user) {
                if (err) {
                    console.log(err);
                    res.status(401).send('Error logging user in.');
                } else if (!user) {
                    res.status(404).send('User not found.');
                } else if (req.body.password) {
                    user.checkPassword(req.body.password,
                        function(err, isMatch) {
                            if (err) {
                                console.log(err);
                                res.status(401).send('Error logging user in.');
                            } else if (isMatch) {
                                var userWOPassword = _.omit(user.toObject(),
                                    ['password', '__v']);
                                var token = createToken(userWOPassword);

                                var userBlob = {
                                    user: userWOPassword,
                                    id_token: token
                                };
                                res.status(200).send(userBlob);
                            }
                        }
                    );
                } else {
                    res.status(404).send('There was an error logging in. ' +
                        'Please try again.');
                }
            }
        );
    });

    app.post(baseUrl + '/register', function(req, res) {
        // Store the group id in the database, but return the user with
        // a populated group
        var inputUser = req.body;
        var groupObj = inputUser.group;
        inputUser.group = groupObj._id;
        inputUser.admin = false;
        if (!inputUser.admitted) {
            inputUser.admitted = false;
        }
        User.create(inputUser, function(err, user) {
            if (err) {
                console.log('Error creating User: ' + err);
            } else {
                var userWOPass = _.omit(user,
                    ['password', 'passwordConfirm', '__v']);
                var token = createToken(userWOPass);
                userWOPass.group = groupObj;
                var newUserBlob = {
                    user: userWOPass,
                    id_token: token
                };
                res.status(201).send(newUserBlob);
            }
        });
    });
};
