/**
 * @author Michael McDermott
 * Created on 7/10/15.
 */

/**
 * @author Michael McDermott
 * Created on 7/9/15.
 */

var jwt = require('express-jwt'),
    jsonWT = require('jsonwebtoken'),
    _ = require('lodash'),
    Models = require('../models'),
    Assay = Models.Assay,
    CellLine = Models.CellLine,
    Perturbagen = Models.Perturbagen,
    Readout = Models.Readout,
    Gene = Models.Gene,
    Disease = Models.Disease,
    Organism = Models.Organism,
    Tool = Models.Tool,
    secret = require('../config/database').secret;
    baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {
    app.get(baseUrl + '/api/autocomplete/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)',
        function(req, res) {
            var s = req.params.sample;
            var sample;

            if (s === 'assays') {
                sample = Assay;
            } else if (s === 'cellLines') {
                sample = CellLine;
            } else if (s === 'perturbagens') {
                sample = Perturbagen;
            } else if (s === 'readouts') {
                sample = Readout;
            } else if (s === 'genes') {
                sample = Gene;
            } else if (s === 'diseases') {
                sample = Disease;
            } else if (s === 'organisms') {
                sample = Organism;
            } else if (s === 'tools') {
                sample = Tool;
            }

            sample
                .find({ name: new RegExp(req.query.q, 'i') })
                .lean()
                .exec(function(err, results) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('There was an error completing your request');
                    } else {
                        res.status(200).send(results);
                    }
                }
            );
        }
    );

    app.get(baseUrl + '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)',
        function(req, res) {
            var s = req.params.sample;
            var sample;

            if (s === 'assays') {
                sample = Assay;
            } else if (s === 'cellLines') {
                sample = CellLine;
            } else if (s === 'perturbagens') {
                sample = Perturbagen;
            } else if (s === 'readouts') {
                sample = Readout;
            } else if (s === 'genes') {
                sample = Gene;
            } else if (s === 'diseases') {
                sample = Disease;
            } else if (s === 'organisms') {
                sample = Organism;
            } else if (s === 'tools') {
                sample = Tool;
            }

            sample
                .find({})
                .lean()
                .exec(function(err, results) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('There was an error completing your request');
                    } else {
                        res.status(200).send(results);
                    }
                }
            );
        }
    );

    app.get(baseUrl + '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/:id',
        function(req, res) {
            var id = req.params.id;
            var s = req.params.sample;
            var sample;

            if (s === 'assays') {
                sample = Assay;
            } else if (s === 'cellLines') {
                sample = CellLine;
            } else if (s === 'perturbagens') {
                sample = Perturbagen;
            } else if (s === 'readouts') {
                sample = Readout;
            } else if (s === 'genes') {
                sample = Gene;
            } else if (s === 'diseases') {
                sample = Disease;
            } else if (s === 'organisms') {
                sample = Organism;
            } else if (s === 'tools') {
                sample = Tool;
            }

            var query = { _id: id };
            sample
                .find(query)
                .lean()
                .exec(function(err, results) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('There was an error completing your request');
                    } else {
                        res.status(200).send(results);
                    }
                }
            );
        }
    );

    app.post(baseUrl + '/api/secure/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/',
        function(req, res) {
            var inputData = req.body;
            var s = req.params.sample;
            var token, user, sample;

            if (req.headers.authorization &&
                req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
                user = jwt.verify(token, secret, {
                    issuer: 'http://amp.pharm.mssm.edu/LDR/'
                });
                inputData.group = user.group._id;
            } else {
                res.status(401).send('Token or URL are invalid. Try again.');
            }

            if (s === 'assays') {
                sample = Assay;
            } else if (s === 'cellLines') {
                sample = CellLine;
            } else if (s === 'perturbagens') {
                sample = Perturbagen;
            } else if (s === 'readouts') {
                sample = Readout;
            } else if (s === 'genes') {
                sample = Gene;
            } else if (s === 'diseases') {
                sample = Disease;
            } else if (s === 'organisms') {
                sample = Organism;
            } else if (s === 'tools') {
                sample = Tool;
            }

            sample.create(inputData, function(err, sample) {
                if (err) {
                    console.log(err);
                    // Catch duplicate key error
                    if (err.code === 11000) {
                        res.status(400).send('A sample with that name ' +
                            'already exists. Please try another.')
                    }
                    else {
                        res.status(400).send('A ' + err.name + ' occurred while ' +
                            'saving to the database.');
                    }
                } else {
                    res.status(200).send(sample._id);
                }
            });
        }
    );
};