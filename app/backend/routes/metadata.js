/**
 * @author Michael McDermott
 * Created on 7/10/15.
 */

var jwt = require('jsonwebtoken'),
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
  secret = require('../config/database').secret,
  baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {
  'use strict';

  app.get(baseUrl +
    '/api/autocomplete/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)',
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
        .find({
          name: new RegExp(req.query.q, 'i')
        })
        .lean()
        .limit(10)
        .exec(function(err, results) {
          if (err) {
            console.log(err);
            res.status(404).send(
              'There was an error completing your request');
          } else {
            res.status(200).send(results);
          }
        });
    }
  );

  app.get(baseUrl +
    '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)',
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
            res.status(404).send(
              'There was an error completing your request');
          } else {
            res.status(200).send(results);
          }
        });
    }
  );

  app.get(baseUrl +
    '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/count',
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
        });
    }
  );

  app.get(baseUrl +
    '/api/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/:id',
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

      var query = {
        _id: id
      };
      sample
        .findOne(query)
        .lean()
        .exec(function(err, results) {
          if (err) {
            console.log(err);
            res.status(404).send(
              'There was an error completing your request');
          } else {
            res.status(200).send(results);
          }
        });
    }
  );

  app.get(baseUrl + '/api/counts', function(req, res) {
    var summary = {};
    User.count(function(err, uCount) {
      if (err) {
        console.log(err);
        res.status(404).send('An error occurred obtaining counts.');
      } else {
        summary.users = uCount;
        Group
          .where('name')
          .ne('NIH')
          .count(function(groupErr, gCount) {
            if (groupErr) {
              console.log(groupErr);
              res.status(404).send(
                'An error occurred obtaining counts.');
            } else {
              // Subtract 1 for the NIH
              summary.groups = gCount;
              DataRelease
                .find({})
                .lean()
                .exec(function(dataErr, releases) {
                  if (dataErr) {
                    console.log(dataErr);
                    res.status(404).send('An error ' +
                      'occurred obtaining counts.');
                  } else {
                    var assays = [];
                    var cellLines = [];
                    var perturbagens = [];
                    var readouts = [];
                    var diseases = [];
                    var genes = [];
                    var organisms = [];

                    _.each(releases, function(release) {
                      assays = _.uniq(_.union(release.metadata
                        .assay, assays));
                      cellLines = _.uniq(_.union(release.metadata
                        .cellLines, cellLines));
                      perturbagens = _.uniq(_.union(release.metadata
                        .perturbagens, perturbagens));
                      readouts = _.uniq(_.union(release.metadata
                        .readouts, readouts));
                      diseases = _.uniq(_.union(release.metadata
                        .diseases, diseases));
                      organisms = _.uniq(_.union(release.metadata
                        .organisms, organisms));
                      genes = _.uniq(_.union(release.metadata
                        .genes, genes));
                    });

                    summary.dataReleases = releases.length;
                    summary.assays = assays.length;
                    summary.cellLines = cellLines.length;
                    summary.perturbagens = perturbagens.length;
                    summary.readouts = readouts.length;
                    summary.diseases = diseases.length;
                    summary.organisms = organisms.length;
                    summary.genes = genes.length;

                    res.status(200).send(summary);
                  }
                });
            }
          });
      }
    });
  });

  app.get(baseUrl + '/api/counts/released', function(req, res) {
    var summary = {};
    User.count(function(err, uCount) {
      if (err) {
        console.log(err);
        res.status(404).send('An error occurred obtaining counts.');
      } else {
        summary.users = uCount;
        Group
          .where('name')
          .ne('NIH')
          .count(function(groupErr, gCount) {
            if (groupErr) {
              console.log(groupErr);
              res.status(404).send(
                'An error occurred obtaining counts.');
            } else {
              // Subtract 1 for the NIH
              summary.groups = gCount;
              DataRelease
                .find({ released: true })
                .lean()
                .exec(function(dataErr, releases) {
                  if (dataErr) {
                    console.log(dataErr);
                    res.status(404).send('An error occurred obtaining counts.');
                  } else {
                    var assays = [];
                    var cellLines = [];
                    var perturbagens = [];
                    var readouts = [];
                    var diseases = [];
                    var genes = [];
                    var organisms = [];

                    _.each(releases, function(release) {
                      assays = _.uniq(_.union(release.metadata.assay, assays));
                      cellLines = _.uniq(_.union(release.metadata.cellLines, cellLines));
                      perturbagens = _.uniq(_.union(release.metadata.perturbagens, perturbagens));
                      readouts = _.uniq(_.union(release.metadata.readouts, readouts));
                      diseases = _.uniq(_.union(release.metadata.diseases, diseases));
                      organisms = _.uniq(_.union(release.metadata.organisms, organisms));
                      genes = _.uniq(_.union(release.metadata.genes, genes));
                    });

                    summary.dataReleases = releases.length;
                    summary.assays = assays.length;
                    summary.cellLines = cellLines.length;
                    summary.perturbagens = perturbagens.length;
                    summary.readouts = readouts.length;
                    summary.diseases = diseases.length;
                    summary.organisms = organisms.length;
                    summary.genes = genes.length;

                    res.status(200).send(summary);
                  }
                });
            }
          });
      }
    });
  });

  app.post(baseUrl +
    '/api/secure/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/',
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

      sample.create(inputData, function(err, resSample) {
        if (err) {
          console.log(err);
          // Catch duplicate key error
          if (err.code === 11000) {
            res.status(400).send('A sample with that name ' +
              'already exists. Please try another.');
          } else {
            res.status(400).send('A ' + err.name + ' occurred while ' +
              'saving to the database.');
          }
        } else {
          res.status(200).send(resSample._id);
        }
      });
    }
  );
};
