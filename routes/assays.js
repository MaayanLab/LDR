var jwt             = require('express-jwt'),
  Models          = require('../app/models'),
  config          = require('../config/database'),
  _               = require('lodash');

module.exports = function(app, passport) {

  // ASSAYS GET, POST, PUT, DELETE
  app.get('/api/assays', function(req, res) {
    // params are blank, id, or center
    var query;
    if (req.query.id) {
      query = { '_id': req.query.id};
    }
    else if (req.query.centerId) {
      query = { 'center': req.query.centerId };
    }
    else {
      query = {};
    }
    Models.Assay
      .find(query)
      .populate('center')
      .exec(function(err, assays) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(assays);
      });
  });

  app.post('/api/secure/assays', function(req, res) {
    console.log('Posting To Assays');
    var assayData = req.body;
    assayData._id = Models.genId();
    Models.Assay.create(assayData, function(err,result) {
      if (err)
        console.log(err);
      res.status(201).send(result);
    });
  });

  app.put('/api/secure/assays', function(req, res) {
    console.log('Updating assay with id ' + req.query.id);
    if (req.query.id) {
      var query = { '_id': req.query.id};
      var newAssay = req.body;
      delete newAssay._id;
      Models.Assay.update(query, newAssay, function(err,result) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(result);
      });
    }
    else {
      res.status(404).send('Assay id wasn\'t given, or the URL query was invalid');
    }
  });

  app.delete('/api/secure/assays', function(req, res) {
    Models.Assay.find({ '_id': req.query.id }).remove(function(err, result) {
      if (err) {
        console.log(err);
        res.status(404).send('Could not delete assay with id: ' + req.query.id + ' Error: ' + err);
      }
      res.status(200).send('Assay with id ' + req.query.id + ' deleted.');
    });

  });

};