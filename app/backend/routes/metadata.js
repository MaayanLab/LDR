/**
 * @author Michael McDermott
 * Created on 7/10/15.
 */

'use strict';

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
  app.get(baseUrl +
    '/api/:type(autocomplete)?/:sample(assays|cellLines|perturbagens|readouts|genes|diseases|organisms|tools)/:id?/:count(count)?',
    function(req, res) {
      var s = req.params.sample;
      var type = req.params.type;
      var id = req.params.id;
      var count = req.params.count;
      var q = req.query.q;
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

      var query = {};
      if (type === 'autocomplete' && q.length) {
        // /api/autocomplete/sample?q=abcdefg
        query = {
          name: new RegExp(q, 'i')
        };
        findMeta(sample, query);
      } else if (_.isUndefined(type) && !_.isUndefined(id)) {
        // /api/sample/id
        query = {
          _id: id
        };
        findMeta(sample, query);
      } else if (_.isUndefined(type) && !_.isUndefined(count) &&
        _.isUndefined(id)) {
        // /api/sample/count
        countMeta(sample);
      }

      function findMeta(mongooseModel, inpQuery) {
        mongooseModel
          .find(inpQuery)
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

      function countMeta(mongooseModel) {
        mongooseModel
          .count(function(err, count) {
            if (err) {
              console.log(err);
            } else {
              res.status(200).send(count);
            }
          });
      }
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
          .count(function(grErr, gCount) {
            if (grErr) {
              console.log(err);
              res.status(404).send(
                'An error occurred obtaining counts.');
            } else {
              // Subtract 1 for the NIH
              summary.groups = gCount;
              DataRelease
                .find({})
                .lean()
                .populate([{
                  path: 'metadata.assay',
                  model: 'Assay'
                }, {
                  path: 'metadata.cellLines',
                  model: 'CellLine'
                }, {
                  path: 'metadata.perturbagens',
                  model: 'Perturbagen'
                }, {
                  path: 'metadata.readouts',
                  model: 'Readout'
                }, {
                  path: 'metadata.manipulatedGene',
                  model: 'Gene'
                }, {
                  path: 'metadata.organism',
                  model: 'Organism'
                }, {
                  path: 'metadata.relevantDisease',
                  model: 'Disease'
                }, {
                  path: 'metadata.analysisTools',
                  model: 'Tool'
                }])
                .exec(function(drErr, releases) {
                  if (drErr) {
                    console.log(err);
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

      sample.create(inputData, function(err, newSample) {
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
          res.status(200).send(newSample._id);
        }
      });
    }
  );
};
