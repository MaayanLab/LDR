var jwt = require('express-jwt'),
    _ = require('lodash'),
    Q = require('q'),
    DataRelease = require('../models').DataRelease,
    getMetadata = require('../getMetadata'),
    baseUrl = require('../config/baseUrl').baseUrl,
    config = require('../config/database');

module.exports = function(app) {
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
                });
        });

    // Post release without id and save it to the database
    app.post(baseUrl + '/api/secure/releases/form/', function(req, res) {
        var inputData = req.body;
        inputData.dateModified = new Date();
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

    // POST release with id, find it and update. If not, save it to the
    // database.
    app.post(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        var inputData = req.body;
        console.log(inputData);
        inputData.dateModified = new Date();
        inputData.approved = false;

        var query = { _id: req.params.id };
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
                })
        }
    );

    // DELETE individual release
    app.delete(baseUrl + '/api/secure/releases/form/:id', function(req, res) {
        DataRelease.findOne({ _id: req.params.id }).remove(function(err) {
            if (err) {
                console.log(err);
                res.status(404).send('There was an error deleting the data ' +
                    'release with id ' + req.query.formId +
                    ' Error: ' + err);
            }
            res.status(200).send('The data release with id ' + req.params.id +
                ' was deleted');
        });
    });
};
