/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

var http = require('http'),
    Q = require('q'),
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

    app.get(baseUrl + '/api/group/:id/statistics', function(req, res) {
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

    app.get(baseUrl + '/api/group/:id/users', function(req, res) {
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
};