var jwt             = require('express-jwt'),
  Models          = require('../app/models'),
  config          = require('../config/database'),
  _               = require('lodash');

module.exports = function(app, passport) {

  // CELL LINES GET, POST, PUT, DELETE
  app.get('/api/cellLines', function(req, res) {
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
    Models.CellLine
      .find(query)
      .populate('center')
      .exec(function(err, cellLines) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(cellLines);
      });
  });

  app.post('/api/secure/cellLines', function(req, res) {
    console.log('Posting To Cell Lines');
    var inputData = req.body;
    inputData._id = Models.genId();
    var saveData = Models.CellLine.create(inputData);
    res.status(201).send(saveData);
  });

  app.put('/api/secure/cellLines', function(req, res) {
    console.log('Updating cell line with id ' + req.query.id);
    if (req.query.id) {
      var query = { '_id': req.query.id};
      var newLine = req.body;
      delete newLine._id;
      Models.CellLine.update(query, newLine, function(err,result) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(result);
      });
    }
    else {
      res.status(404).send('Cell line id wasn\'t given, or the URL query was invalid');
    }
  });

  app.delete('/api/secure/cellLines', function(req, res) {
    Models.CellLine.find({ '_id': req.query.id }).remove(function(err, result) {
      if (err) {
        console.log(err);
        res.status(404).send('Could not delete assay with id: ' + req.query.id + ' Error: ' + err);
      }
      res.status(200).send('Assay with id ' + req.query.id + ' deleted.');
    });

  });

};