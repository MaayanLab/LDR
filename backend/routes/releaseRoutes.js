var jwt = require('express-jwt'),
    DataRelease = require('../models').DataRelease,
    buildMetadata = require('../models').buildMetadata,
    config = require('../config/database');

module.exports = function(app) {

    // FORM/DATASET GET, POST, PUT, DELETE

    // Individual form endpoint. Empty query returns empty form. Query id returns form with that id
    app.get('/api/releases/form', function(req, res) {
        if (req.query.id) {
            DataRelease
                .find({ _id: req.query.id })
                .exec(function(err, release) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Releases could not be found.');
                    }
                    buildMetadata(release);
                    res.status(200).send(release);
                });
        }
        else {
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
                    level1: { val: null },
                    level2: { val: null },
                    level3: { val: null },
                    level4: { val: null }
                },
                urls: {
                    pubMedUrl: { val: null },
                    dataUrl: { val: null },
                    metadataUrl: { val: null },
                    qcDocumentUrl: { val: null }
                }
            };
            res.status(200).send(releaseInit)
        }
    });

    // Multiple forms endpoint. Empty query returns all forms. centerId and userId return forms for user or center
    app.get('/api/releases', function(req, res) {
        var query = {};
        if (req.query.centerId && req.query.userId)
            query = { center: req.query.centerId, userId: req.query.userId };
        else if (req.query.centerId)
            query = { center: req.query.centerId };
        else if (req.query.userId)
            query = { userId: req.query.userId };

        DataRelease
            .find(query)
            //.lean()
            .exec(function(err, allData) {
                if (err) {
                    console.log(err);
                    res.status(404).send('Releases could not be found.');
                }
                buildMetadata(allData);
                res.status(200).send(allData);
            });
    });

    app.post('/api/secure/releases', function(req, res) {

        console.log('Posting To releases...');
        var inputData = req.body;
        inputData.approved = false;
        inputData.dateModified = new Date();

        var form = new DataRelease(inputData);
        console.log(form);
        form.save(function(err) {
            console.log(err);
        });

        res.status(201).send(form);
    });

    // UPDATE
    app.put('/api/secure/releases', function(req, res) {
        var newForm = req.body;
        // delete newForm._id;
        DataRelease.update({ _id: req.query.id }, newForm, function(err, result) {
            if (err)
                res.status(404).send('Data release with id ' + req.query.id + ' could not be updated');
            res.status(200).send(result);
        });
    });

    // DELETE
    app.delete('/api/secure/releases', function(req, res) {
        var query;
        if (req.query.userId && req.query.formId)
            query = { _id: req.query.formId, userId: req.query.userId };
        else if (req.query.formId)
            query = { _id: req.query.formId };

        if (query) {
            DataRelease.find(query).remove(function(err) {
                if (err) {
                    console.log(err);
                    res.status(404).send('There was an error deleting the data release with id ' + req.query.formId + ' Error: ' + err);
                }
                res.status(200).send('The data release with id ' + req.query.formId + ' was deleted');
            });
        }
        else {
            res.status(404).send('There was an error deleting data release. Invalid url query.');
        }
    });
};
