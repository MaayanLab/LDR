var jwt = require('express-jwt'),
    _ = require('lodash'),
    Q = require('q'),
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
                    .populate('group')
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
                            .populate('group')
                            .lean()
                            .exec(function(err, results) {
                                if (err) {
                                    console.log(err);
                                    res.status(404).send('Error searching releases');
                                }

                                if (!results.length) {
                                    res.status(200).send(releasesArr);
                                }
                                _.each(results, function(release, i) {
                                    getMetadata(release, function(err, finalRelease) {
                                        if (err) {
                                            res.status(500).send('There was an error building' +
                                                ' meta data for these releases. Try again.')
                                        }
                                        else {
                                            var dates = finalRelease.releaseDates;
                                            var up = dates.upcoming;
                                            // Legacy. All entries should have up.
                                            if (up === '' || !up) {
                                                finalRelease.releaseDates.upcoming =
                                                    dates.level1 !== '' ? dates.level1 :
                                                        dates.level2 !== '' ? dates.level2 :
                                                            dates.level3 !== '' ? dates.level3 :
                                                                dates.level4 !== '' ?
                                                                    dates.level4 : 'NA';
                                            }
                                            releasesArr.push(finalRelease);
                                            if (i === results.length - 1) {
                                                res.status(200).send(releasesArr);
                                            }
                                        }
                                    });
                                });
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
            .populate('group')
            .lean()
            .exec(function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error: Release could not be found. ' +
                        'Id may be invalid');
                }
                if (!release) {
                    res.status(404).send('Error: Release with given id could ' +
                        'not be found.');
                }

                getMetadata(release, function(err, finalRelease) {
                    if (err) {
                        res.status(500).send('There was an error building ' +
                            'meta data for this release. Try again.');
                    }
                    else {
                        var dates = finalRelease.releaseDates;
                        var up = dates.upcoming;
                        if (up === '' || !up) {
                            finalRelease.releaseDates.upcoming =
                                dates.level1 !== '' ? dates.level1 :
                                    dates.level2 !== '' ? dates.level2 :
                                        dates.level3 !== '' ? dates.level3 :
                                            dates.level4 !== '' ?
                                                dates.level4 : 'NA';
                        }
                        res.status(200).send(finalRelease);
                    }
                })
            });
    });

    // Multiple releases endpoint for all releases
    app.get(baseUrl + '/api/releases/', function(req, res) {
        DataRelease
            .find({})
            .populate('group')
            .lean()
            .exec(function(err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                }
                var releasesArr = [];
                _.each(allData, function(release, i) {
                    getMetadata(release, function(err, finalRelease) {
                        if (err) {
                            res.status(500).send('There was an error building' +
                                ' meta data for these releases. Try again.')
                        }
                        else {
                            var dates = finalRelease.releaseDates;
                            var up = dates.upcoming;
                            if (up === '' || !up) {
                                finalRelease.releaseDates.upcoming =
                                    dates.level1 !== '' ? dates.level1 :
                                        dates.level2 !== '' ? dates.level2 :
                                            dates.level3 !== '' ? dates.level3 :
                                                dates.level4 !== '' ?
                                                    dates.level4 : 'NA';
                            }
                            releasesArr.push(finalRelease);
                            if (i === allData.length - 1) {
                                res.status(200).send(releasesArr);
                            }
                        }
                    });
                });
            });
    });

    // Multiple releases endpoint for specific group or user
    app.get(baseUrl + '/api/releases/:type(group|user)/:id',
        function(req, res) {
            var query = {};
            if (req.params.type === 'group')
                query = { group: req.params.id };
            if (req.params.type === 'user')
                query = { user: req.params.id };

            DataRelease
                .find(query)
                .populate('group')
                .lean()
                .exec(function(err, allData) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Releases could not be found.');
                    }
                    var releasesArr = [];
                    _.each(allData, function(release, i) {
                        getMetadata(release, function(err, finalRelease) {
                            if (err) {
                                res.status(500).send('There was an error ' +
                                    'building meta data for these releases. ' +
                                    'Try again.')
                            }
                            else {
                                var dates = finalRelease.releaseDates;
                                var up = dates.upcoming;
                                if (up === '' || !up) {
                                    finalRelease.releaseDates.upcoming =
                                        dates.level1 !== '' ? dates.level1 :
                                            dates.level2 !== '' ? dates.level2 :
                                                dates.level3 !== '' ? dates.level3 :
                                                    dates.level4 !== '' ?
                                                        dates.level4 : 'NA';
                                }
                                releasesArr.push(finalRelease);
                                if (i === allData.length - 1) {
                                    res.status(200).send(releasesArr);
                                }
                            }
                        });
                    });
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
                .populate('group')
                .lean()
                .exec(function(err, releases) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Could not return ' +
                            'approved releases');
                    }
                    else {
                        var releasesArr = [];
                        _.each(releases, function(release, i) {
                            getMetadata(release, function(err, finalRelease) {
                                if (err) {
                                    res.status(500).send('There was an error building' +
                                        ' meta data for these releases. Try again.')
                                }
                                else {
                                    releasesArr.push(finalRelease);
                                    if (i === releases.length - 1) {
                                        res.status(200).send(releasesArr);
                                    }
                                }
                            });
                        });
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
                }
                else {
                    var dateToSearch = latestRelease.upcomingRelease;
                    if (!(dateToSearch instanceof Date)) {
                        dateToSearch = new Date(dateToSearch);
                    }
                    console.log(latestRelease._id);
                    console.log(dateToSearch);
                    DataRelease
                        .find(
                        { upcomingRelease: { $gt: dateToSearch } })
                        .sort({ released: -1, upcomingRelease: 1 })
                        .limit(25)
                        .populate('group')
                        .lean()
                        .exec(function(err, afterReleases) {
                            if (err) {
                                console.log(err);
                                res.status(404).send('Could not find releases' +
                                    ' after ' + latestRelease.dateModified);
                            }
                            var releasesArr = [];
                            // Send an empty array if there are no later
                            // releases
                            if (!afterReleases.length) {
                                res.status(204).send(afterReleases);
                            }
                            _.each(afterReleases, function(release, i) {
                                getMetadata(release, function(err, finalRelease) {
                                    if (err) {
                                        res.status(500).send('There was an error building' +
                                            ' meta data for these releases. Try again.')
                                    }
                                    else {
                                        releasesArr.push(finalRelease);
                                        if (i === afterReleases.length - 1) {
                                            res.status(200).send(releasesArr);
                                        }
                                    }
                                });
                            });
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

        DataRelease.create(inputData, function(err, form) {
            if (err) {
                console.log(err);
                res.status(400).send('A ' + err.name + ' occurred while ' +
                    'saving JSON to database. Please confirm that your JSON ' +
                    'is formatted properly. Visit http://www.jsonlint.com ' +
                    'to confirm.');
            }
            else {
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
                    'id ' + query._id + '. Please try again')
            }
            else {
                DataRelease.findOne(query, function(err, release) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Release with id: ' + query._id +
                            ' was updated, but could not be returned')
                    }
                    else {
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
                    'entry with id ' + query._id + '. Please try again.')
            }
            else {
                release.urls = urls;
                release.save();
                res.status(202).send(release);
            }
        });
    });

    // POST endpoint for superuser to return unapproved releases
    app.post(baseUrl + '/api/secure/releases/form/:id/return/', function(req, res) {
        var id = req.params.id;
        var query = { _id: id };
        var message = req.body.message;
        DataRelease.findOne(query, function(err, release) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating urls for ' +
                    'entry with id ' + id + '. Please try again.')
            }
            else {
                release.needsEdit = true;
                release.message = message;
                release.save();
                res.status(202).send(release);
            }
        });
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
                    }
                    else if (release.urls.dataUrl === "") {
                        res.status(403).send('Data URL required!');
                    }
                    else if (release.approved === false) {
                        res.status(403).send('Dataset must be approved!');
                    }
                    else {
                        release.released = true;
                        release.save();
                        res.status(204).send('Dataset successfully released.')
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
