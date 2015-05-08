var jwt             = require('express-jwt'),
  Models          = require('../models'),
  config          = require('../config/database');

module.exports = function(app) {

// READOUTS GET, POST, PUT, DELETE
  app.get('/api/readouts', function(req, res) {
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
    Models.Readout
      .find(query)
      .populate('center')
      .exec(function(err, readouts) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(readouts);
      });
  });

  app.post('/api/secure/readouts', function(req, res) {
    console.log('Posting');
    var inputData = req.body;
    inputData._id = Models.genId();
    var saveData = Models.Readout.create(inputData);
    res.status(201).send(saveData);
  });

  app.put('/api/secure/readouts', function(req, res) {
    // params are blank, id, or center
    console.log('Updating readout with id ' + req.query.id);
    if (req.query.id) {
      var query = { '_id': req.query.id};
      var newROut = req.body;
      delete newROut._id;
      Models.Readout.update(query, newROut, function(err,result) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(result);
      });
    }
    else {
      res.status(404).send('Readout id wasn\'t given, or the URL query was invalid');
    }
  });

  app.delete('/api/secure/readouts', function(req, res) {
    Models.Readout.find({ '_id': req.query.id }).remove(function(err, result) {
      if (err) {
        console.log(err);
        res.status(404).send('Could not delete assay with id: ' + req.query.id + ' Error: ' + err);
      }
      res.status(200).send('Assay with id ' + req.query.id + ' deleted.');
    });

  });

};