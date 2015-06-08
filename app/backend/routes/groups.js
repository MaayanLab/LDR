/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

var http = require('http'),
    Q = require('q'),
    jwt = require('jsonwebtoken'),
    secret = require('../config/database').secret,
    getGroupStats = require('../getGroupStats'),
    baseUrl = require('../config/baseUrl').baseUrl,
    Models = require('../models'),
    DataRelease = Models.DataRelease,
    User = Models.User,
    Group = Models.Group;

module.exports = function(app) {

    app.get(baseUrl + '/api/groups/', function(req, res) {
        Group
            .find({})
            .lean()
            .exec(function(err, groups) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Could not retrieve groups. ' +
                        'Please try again.');
                }
                else {
                    res.status(200).send(groups);
                }
            })
    });

    app.get(baseUrl + '/api/group/:id/statistics/', function(req, res) {
        var groupId = req.params.id;
        getGroupStats(groupId, function(err, statsResponse) {
            if (err) {
                console.log(err);
                res.status(404).send('Error getting statistics for ' +
                    'group with id: ' + groupId);
            }
            else {
                res.status(200).send(statsResponse);
            }
        });
    });

    app.get(baseUrl + '/api/group/:id/users/', function(req, res) {
        var groupId = req.params.id;
        var query = { group: groupId };
        User
            .find(query)
            .lean()
            .exec(function(err, users) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Users for group with id: ' +
                        groupId + ' could not be found')
                }
                else {
                    res.status(200).send(users);
                }
            })
    });

    app.put(baseUrl + '/api/secure/group/:groupId/users/:userId/approve/',
        function(req, res) {
            var groupId = req.params.groupId;
            var userId = req.params.userId;
            var token, user;
            if (req.headers.authorization &&
                req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
            }
            if (token) {
                user = jwt.verify(token, secret, {
                    issuer: 'http://amp.pharm.mssm.edu/LDR/'
                });
                if (user.admitted && user.group._id === groupId) {
                    User
                        .update({ _id: userId }, { admitted: true },
                        function(err, user) {
                            if (err) {
                                res.status(404).send('There was an error ' +
                                    'admitting this user. Please try again.')
                            }
                            else {
                                res.status(204).send('User successfully ' +
                                    'updated');
                            }
                        }
                    )
                }
                else {
                    res.status(401).send('You are not authorized to access ' +
                        'this URL.')
                }
            }
            else {
                res.status(401).send('Token or URL are invalid. Try again.')
            }
        }
    );
};