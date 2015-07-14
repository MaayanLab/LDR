/**
 * @author Michael McDermott
 * Created on 7/10/15.
 */

var jwt = require('express-jwt'),
    _ = require('lodash'),
    Models = require('../models'),
    User = Models.User,
    Group = Models.Group,
    DataRelease = Models.DataRelease,
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

    app.get(baseUrl + '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/count',
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
                .count(function(err, count) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.status(200).send(count);
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

    app.get(baseUrl + '/api/counts', function(req, res) {
        var summary = {};
        var left = Object.keys(Models).length;
        User.count(function(err, uCount) {
            if (err) {
                console.log(err);
                res.status(404).send('An error occurred obtaining counts.');
            } else {
                summary.Users = uCount;
                Group.count(function(err, gCount) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('An error occurred obtaining counts.');
                    } else {
                        summary.Groups = gCount;
                        DataRelease
                            .find({})
                            .lean()
                            .populate([
                                { path: 'metadata.assay', model: 'Assay' },
                                { path: 'metadata.cellLines', model: 'CellLine' },
                                {
                                    path: 'metadata.perturbagens',
                                    model: 'Perturbagen'
                                },
                                { path: 'metadata.readouts', model: 'Readout' },
                                { path: 'metadata.manipulatedGene', model: 'Gene' },
                                { path: 'metadata.organism', model: 'Organism' },
                                {
                                    path: 'metadata.relevantDisease',
                                    model: 'Disease'
                                },
                                { path: 'metadata.analysisTools', model: 'Tool' }
                            ])
                            .exec(function(err, releases) {
                                if (err) {
                                    console.log(err);
                                    res.status(404).send('An error ' +
                                        'occurred obtaining counts.');
                                } else {
                                    summary.DataReleases = releases.length;
                                    var assays = [];
                                    var cellLines = [];
                                    var perturbagens = [];
                                    var readouts = [];
                                    var diseases = [];
                                    var genes = [];
                                    var organisms = [];
                                    _.each(releases, function(release) {
                                        _.each(release.metadata.assay, function(assay) {
                                            if (assays.indexOf(assay) === -1) {
                                                assays.push(assay);
                                            }
                                        });
                                        _.each(release.metadata.cellLines, function(line) {
                                            if (cellLines.indexOf(line) === -1) {
                                                cellLines.push(line);
                                            }
                                        });
                                        _.each(release.metadata.perturbagens, function(pert) {
                                            if (perturbagens.indexOf(pert) === -1) {
                                                perturbagens.push(pert);
                                            }
                                        });
                                        _.each(release.metadata.readouts, function(rOut) {
                                            if (readouts.indexOf(rOut) === -1) {
                                                readouts.push(rOut);
                                            }
                                        });
                                        _.each(release.metadata.diseases, function(dis) {
                                            if (diseases.indexOf(dis) === -1) {
                                                diseases.push(dis);
                                            }
                                        });
                                        _.each(release.metadata.organisms, function(org) {
                                            if (organisms.indexOf(org) === -1) {
                                                organisms.push(org);
                                            }
                                        });
                                        _.each(release.metadata.genes, function(gene) {
                                            if (genes.indexOf(gene) === -1) {
                                                genes.push(gene);
                                            }
                                        });
                                    });
                                    summary.Assays = assays.length;
                                    summary.CellLines = cellLines.length;
                                    summary.Perturbagens = perturbagens.length;
                                    summary.Readouts = readouts.length;
                                    summary.Diseases = diseases.length;
                                    summary.Organisms = organisms.length;
                                    summary.Genes = genes.length;

                                    res.status(200).send(summary);
                                }
                            });
                    }
                });
            }
        });
    });

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