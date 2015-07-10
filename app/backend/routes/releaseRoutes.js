var jwt = require('express-jwt'),
    jsonWT = require('jsonwebtoken'),
    _ = require('lodash'),
    Q = require('q'),
    secret = require('../config/database').secret,
    Models = require('../models'),
    DataRelease = Models.DataRelease,
    Group = Models.Group,
    getMetadata = require('../getMetadata'),
    baseUrl = require('../config/baseUrl').baseUrl,
    config = require('../config/database');

module.exports = function(app) {

    // Endpoint for searching releases. NEEDS QUERY PARAMETER.
    app.get(baseUrl + '/api/releases/search', function(req, res) {
        var query = req.query.query;
        if (!query) {
            res.status(400).send('Query string not properly formatted.');
        }
        // 1. Find groups matching query and gather ids
        // 2. Find releases matching from the group that matches an
        //    id found in step 1.
        // 3. Find releases matching query.
        var releasesArr = [];
        Group
            .find({ $text: { $search: query } }, '_id')
            .lean()
            .exec(function(err, groupIds) { // [ { _id: ... }, ... ]
                if (err) {
                    res.status(500).send(
                        'There was an error searching for releases.'
                    );
                }

                // _.map() and _.pluck do not work for mongoose arrays
                var ids = [];
                _.each(groupIds, function(obj) {
                    ids.push(obj._id);
                });
                DataRelease
                    .find({ group: { $in: ids } })
                    .sort({ dateModified: -1 })
                    .populate([
                        { path: 'group', model: 'Group' },
                        { path: 'messages.user', model: 'User' },
                        { path: 'metadata.assay', model: 'Assay' },
                        { path: 'metadata.cellLines', model: 'CellLine' },
                        { path: 'metadata.perturbagens', model: 'Perturbagen' },
                        { path: 'metadata.readouts', model: 'Readout' },
                        { path: 'metadata.manipulatedGene', model: 'Gene' },
                        { path: 'metadata.organism', model: 'Organism' },
                        { path: 'metadata.relevantDisease', model: 'Disease' },
                        { path: 'metadata.analysisTools', model: 'Tool' }
                    ])
                    .lean()
                    .exec(function(err, results) {
                        if (err) {
                            console.log(err);
                            res.status(404).send('Error searching releases');
                        }
                        _.each(results, function(releaseObj) {
                            releasesArr.push(releaseObj);
                        });

                        DataRelease
                            .find({ $text: { $search: query } })
                            .sort({ dateModified: -1 })
                            .populate([
                                { path: 'group', model: 'Group' },
                                { path: 'messages.user', model: 'User' },
                                { path: 'metadata.assay', model: 'Assay' },
                                { path: 'metadata.cellLines', model: 'CellLine' },
                                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                                { path: 'metadata.readouts', model: 'Readout' },
                                { path: 'metadata.manipulatedGene', model: 'Gene' },
                                { path: 'metadata.organism', model: 'Organism' },
                                { path: 'metadata.relevantDisease', model: 'Disease' },
                                { path: 'metadata.analysisTools', model: 'Tool' }
                            ])
                            .lean()
                            .exec(function(err, results) {
                                if (err) {
                                    console.log(err);
                                    res.status(404).send('Error searching releases');
                                } else {
                                    data = _.union(results, releasesArr);
                                    res.status(200).send(data);
                                }
                            }
                        );
                    }
                );
            }
        );
    });

    // Returns empty release for initialization on front-end
    app.get(baseUrl + '/api/releases/form/', function(req, res) {
        var releaseInit = {
            datasetName: '',
            description: '',
            metadata: {
                assay: [],
                cellLines: [],
                perturbagens: [],
                readouts: [],
                manipulatedGene: [],
                organism: [],
                relevantDisease: [],
                analysisTools: [],
                tagsKeywords: []
            },
            releaseDates: {
                level1: '',
                level2: '',
                level3: '',
                level4: ''
            },
            urls: {
                pubMedUrl: '',
                dataUrl: '',
                metadataUrl: '',
                qcDocumentUrl: ''
            }
        };
        res.status(200).send(releaseInit);
    });

    // Individual release endpoint.
    // Query id returns form with that id for editing on front end.
    app.get(baseUrl + '/api/releases/form/:id', function(req, res) {
        DataRelease
            .findOne({ _id: req.params.id })
            .populate([
                { path: 'group', model: 'Group' },
                { path: 'messages.user', model: 'User' },
                { path: 'metadata.assay', model: 'Assay' },
                { path: 'metadata.cellLines', model: 'CellLine' },
                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                { path: 'metadata.readouts', model: 'Readout' },
                { path: 'metadata.manipulatedGene', model: 'Gene' },
                { path: 'metadata.organism', model: 'Organism' },
                { path: 'metadata.relevantDisease', model: 'Disease' },
                { path: 'metadata.analysisTools', model: 'Tool' }
            ])
            .lean()
            .exec(function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error: Release could not be found. ' +
                        'Id may be invalid');
                } else if (!release) {
                    res.status(404).send('Error: Release with given id could ' +
                        'not be found.');
                } else {
                    res.status(200).send(release);
                }
            });
    });

    // Multiple releases endpoint for all releases
    app.get(baseUrl + '/api/releases/', function(req, res) {
        DataRelease
            .find({})
            .populate([
                { path: 'group', model: 'Group' },
                { path: 'messages.user', model: 'User' },
                { path: 'metadata.assay', model: 'Assay' },
                { path: 'metadata.cellLines', model: 'CellLine' },
                { path: 'metadata.perturbagens', model: 'Perturbagen' },
                { path: 'metadata.readouts', model: 'Readout' },
                { path: 'metadata.manipulatedGene', model: 'Gene' },
                { path: 'metadata.organism', model: 'Organism' },
                { path: 'metadata.relevantDisease', model: 'Disease' },
                { path: 'metadata.analysisTools', model: 'Tool' }
            ])
            .lean()
            .exec(function(err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                } else {
                    res.status(200).send(allData);
                }
            }
        );
    });

    // Multiple releases endpoint for specific group or user
    app.get(baseUrl + '/api/releases/:type(group|user)/:id',
        function(req, res) {
            var query = {};
            if (req.params.type === 'group') {
                query = { group: req.params.id };
            }
            if (req.params.type === 'user') {
                query = { user: req.params.id };
            }
            DataRelease
                .find(query)
                .populate([
                    { path: 'group', model: 'Group' },
                    { path: 'messages.user', model: 'User' },
                    { path: 'metadata.assay', model: 'Assay' },
                    { path: 'metadata.cellLines', model: 'CellLine' },
                    { path: 'metadata.perturbagens', model: 'Perturbagen' },
                    { path: 'metadata.readouts', model: 'Readout' },
                    { path: 'metadata.manipulatedGene', model: 'Gene' },
                    { path: 'metadata.organism', model: 'Organism' },
                    { path: 'metadata.relevantDisease', model: 'Disease' },
                    { path: 'metadata.analysisTools', model: 'Tool' }
                ])
                .lean()
                .exec(function(err, releases) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Releases could not be found.');
                    } else {
                        res.status(200).send(releases);
                    }
                }
            );
        }
    );

    // Releases endpoint to get 25 latest approved releases
    app.get(baseUrl + '/api/releases/approved/', function(req, res) {
            DataRelease
                .find({ approved: true })
                .sort({ released: -1, upcomingRelease: 1 })
                .limit(25)
                .populate([
                    { path: 'group', model: 'Group' },
                    { path: 'messages.user', model: 'User' },
                    { path: 'metadata.assay', model: 'Assay' },
                    { path: 'metadata.cellLines', model: 'CellLine' },
                    { path: 'metadata.perturbagens', model: 'Perturbagen' },
                    { path: 'metadata.readouts', model: 'Readout' },
                    { path: 'metadata.manipulatedGene', model: 'Gene' },
                    { path: 'metadata.organism', model: 'Organism' },
                    { path: 'metadata.relevantDisease', model: 'Disease' },
                    { path: 'metadata.analysisTools', model: 'Tool' }
                ])
                .lean()
                .exec(function(err, releases) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Could not return ' +
                            'approved releases');
                    } else {
                        res.status(200).send(releases);
                    }
                }
            );
        }
    );

    // Releases endpoint for homepage infinite scroll
    app.get(baseUrl + '/api/releases/approved/:afterId/', function(req, res) {
        var afterId = req.params.afterId;
        var query = { _id: afterId };
        DataRelease
            .findOne(query)
            .lean()
            .exec(function(err, latestRelease) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Could not return release');
                } else {
                    var dateToSearch = latestRelease.releaseDates.upcoming;
                    if (!(dateToSearch instanceof Date)) {
                        dateToSearch = new Date(dateToSearch);
                    }
                    DataRelease
                        .find(
                        { 'releaseDates.upcoming' : { $gt: dateToSearch } })
                        .sort({ released: -1, 'releaseDates.upcoming' : 1 })
                        .limit(25)
                        .populate([
                            { path: 'group', model: 'Group' },
                            { path: 'messages.user', model: 'User' },
                            { path: 'metadata.assay', model: 'Assay' },
                            { path: 'metadata.cellLines', model: 'CellLine' },
                            { path: 'metadata.perturbagens', model: 'Perturbagen' },
                            { path: 'metadata.readouts', model: 'Readout' },
                            { path: 'metadata.manipulatedGene', model: 'Gene' },
                            { path: 'metadata.organism', model: 'Organism' },
                            { path: 'metadata.relevantDisease', model: 'Disease' },
                            { path: 'metadata.analysisTools', model: 'Tool' }
                        ])
                        .lean()
                        .exec(function(err, afterReleases) {
                            if (err) {
                                console.log(err);
                                res.status(404).send('Could not find releases' +
                                    ' after ' + latestRelease.releaseDates.upcoming);
                            } else {
                                res.status(200).send(afterReleases);
                            }
                        }
                    );
                }
            }
        );
    });

    // Post release without id and save it to the database
    app.post(baseUrl + '/api/secure/releases/form/', function(req, res) {
        var inputData = req.body;
        inputData.approved = false;

        console.log(inputData);
        DataRelease.create(inputData, function(err, form) {
            if (err) {
                console.log(err);
                res.status(400).send('A ' + err.name + ' occurred while ' +
                    'saving JSON to database. Please confirm that your JSON ' +
                    'is formatted properly. Visit http://www.jsonlint.com ' +
                    'to confirm.');
            } else {
                console.log(form);
                res.status(200).send(form);
            }
        });
    });

    // POST release with id, find it and update.
    app.post(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        var inputData = req.body;

        // Check if released. If so, do not set approved to false.
        // Should never be released here.
        if (!inputData.released) {
            inputData.approved = false;
        }
        inputData.needsEdit = false;
        var query = { _id: req.params.id };
        // Can't update _id field
        delete inputData._id;
        DataRelease.update(query, inputData, function(err) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating entry with ' +
                    'id ' + query._id + '. Please try again');
            } else {
                DataRelease.findOne(query, function(err, release) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Release with id: ' + query._id +
                            ' was updated, but could not be returned');
                    } else {
                        res.status(202).send(release);
                    }
                });
            }
        });
    });

    // POST endpoint for released forms. Only update urls
    app.post(baseUrl + '/api/secure/releases/form/:id/urls/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
        var urls = req.body;
        DataRelease.findOne(query, function(err, release) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating urls for ' +
                    'entry with id ' + query._id + '. Please try again.');
            } else {
                release.urls = urls;
                release.save();
                res.status(202).send(release);
            }
        });
    });

    // POST endpoint for messages and superuser to return unapproved releases
    app.post(baseUrl + '/api/secure/releases/form/:id/:type(return|message)/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
        var messageObj = req.body;
        messageObj.date = new Date();

        if (req.headers.authorization &&
            req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1];
            var user = jsonWT.verify(token, secret, {
                issuer: 'http://amp.pharm.mssm.edu/LDR/'
            });
            messageObj.user = user._id;
            DataRelease.findOne(query, function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(400).send('There was an error updating messages' +
                        ' for entry with id ' + id + '. Please try again.');
                } else {
                    if (req.params.type === 'return') {
                        release.needsEdit = true;
                        messageObj.return = true;
                    } else {
                        messageObj.return = false;
                    }
                    release.messages.push(messageObj);
                    release.save();
                    res.status(202).send('Message POSTed');
                }
            });
        } else {
            res.status(401).send('Token or URL are invalid. Try again.');
        }
    });

    // Release an entry. Must have a data URL and be approved
    app.put(baseUrl + '/api/secure/releases/form/:id/release',
        function(req, res) {
            var id = req.params.id;
            var query = { _id: id };
            DataRelease
                .findOne(query)
                .exec(function(err, release) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('An error occurred getting ' +
                            'release with id: ' + id);
                    } else if (release.urls.dataUrl === "") {
                        res.status(403).send('Data URL required!');
                    } else if (release.approved === false) {
                        res.status(403).send('Dataset must be approved!');
                    } else {
                        release.released = true;
                        release.save();
                        res.status(204).send('Dataset successfully released.');
                    }
                }
            );
        }
    );

    // DELETE individual release
    app.delete(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        DataRelease
            .findOne({ _id: req.params.id })
            .remove(function(err) {
                if (err) {
                    console.log(err);
                    res.status(404).send('There was an error deleting the ' +
                        'data release with id ' + req.params.id +
                        ' Error: ' + err);
                }
                res.status(200).send('The data release with id ' +
                    req.params.id + ' was deleted');
            }
        );
    });
};
