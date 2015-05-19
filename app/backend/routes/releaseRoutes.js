var jwt = require('express-jwt'),
    _ = require('lodash'),
    Q = require('q'),
    DataRelease = require('../models').DataRelease,
    buildMetadata = require('../models').buildMetadata,
    config = require('../config/database');

module.exports = function(app) {
    // Returns empty release for initialization on front-end
    app.get('/api/releases/form/', function(req, res) {
        var releaseInit = {
            metadata: {
                assay: [],
                cellLines: [],
                readouts: [],
                perturbagens: [],
                manipulatedGene: [],
                organism: [],
                relevantDisease: [],
                experiment: [],
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

    // Individual release endpoint. Query id returns form with that id for editing on front end.
    app.get('/api/releases/form/:id', function(req, res) {
        DataRelease
            .findOne({ _id: req.params.id })
            .populate('center')
            .exec(function(err, release) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Error: Release could not be found. Id may be invalid');
                }
                if (!release) {
                    res.status(404).send('Error: Release with given id could not be found.');
                }

                var resultObj = {};
                var metadataPromises = buildMetadata(release, resultObj);
                Q.all(metadataPromises).then(function() {
                    release.metadata = resultObj;
                    res.status(200).send(release);
                });
            });
    });

    // Multiple releases endpoint for all releases
    app.get('/api/releases/', function(req, res) {
        DataRelease
            .find({})
            .populate('center')
            .exec(function(err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                }
                var releasesArr = [];
                _.forEach(allData, function(release, i) {
                    var resultObj = {};
                    var metadataPromises = buildMetadata(release, resultObj);
                    Q.all(metadataPromises).then(function() {
                        release.metadata = resultObj;
                        releasesArr.push(release);
                        // TODO: Fix hacky res send
                        if (i === allData.length - 1) {
                            res.status(200).send(releasesArr);
                        }
                    })
                });
            });
    });

    // Multiple releases endpoint for specific center or user
    app.get('/api/releases/:type(center|user)/:id', function(req, res) {
        console.log('REQUEST RECEIVED');
        var query = {};
        if (req.params.type === 'center')
            query = { center: req.params.id };
        if (req.params.type === 'user')
            query = { user: req.params.id };

        DataRelease
            .find(query)
            .exec(function(err, allData) {
                console.log('DATA HAS BEEN FETCHED');
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                }
                console.log('PASSED IF ERROR');
                var releasesArr = [];
                _.forEach(allData, function(release, i) {
                    var resultObj = {};
                    var metadataPromises = buildMetadata(release, resultObj);
                    Q.all(metadataPromises).then(function() {
                        release.metadata = resultObj;
                        releasesArr.push(release);
                        // TODO: Fix hacky res send
                        if (i === allData.length - 1) {
                            res.status(200).send(releasesArr);
                        }
                    });
                });
            });
    });

    // Post release without id and save it to the database
    app.post('/api/secure/releases/form/', function(req, res) {
        console.log('CALL TO ENDPOINT: /api/secure/releases/form/');
        var inputData = req.body;
        inputData.dateModified = new Date();
        inputData.approved = false;

        var form = new DataRelease(inputData);
        form.save(function(err) {
            if (err) {
                console.log(err);
                res.status(400).send('A ' + err.name + ' occurred while saving JSON to database. ' +
                    'Please confirm that your JSON is formatted properly. Visit http://www.jsonlint.com to confirm.');
            }
            else {
                res.status(200).send(form);
            }
        });
    });

    // POST release with id, find it and update. If not, save it to the database.
    app.post('/api/secure/releases/form/:id', function(req, res) {
        console.log('CALL TO ENDPOINT: /api/secure/releases/form/:id');
        var inputData = req.body;
        inputData.dateModified = new Date();
        inputData.approved = false;

        // POSTed data has an _id. Find the document and update it.
        console.log('Updating release with id: ' + req.params.id);
        var query = { _id: req.params.id };
        delete inputData._id;
        DataRelease.update(query, inputData, function(err) {
            if (err) {
                console.log(err);
                res.status(400).send('There was an error updating entry with id ' + query._id + '. Please try again')
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

    // DELETE individual release
    app.delete('/api/secure/releases/form/:id', function(req, res) {
        DataRelease.findOne({ _id: req.params.id }).remove(function(err) {
            if (err) {
                console.log(err);
                res.status(404).send('There was an error deleting the data release with id ' + req.query.formId +
                    ' Error: ' + err);
            }
            res.status(200).send('The data release with id ' + req.params.id + ' was deleted');
        });
    });
};
