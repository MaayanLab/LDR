var jwt             = require('express-jwt'),
  Models          = require('../app/models'),
  config          = require('../config/database'),
  _               = require('lodash');

module.exports = function(app, passport) {

// FORM/DATASET GET, POST, PUT, DELETE
app.get('/api/data', function(req, res) {
  var query = {};
  if (req.query.userId && req.query.formId)
    query = { _id: req.query.formId, user: req.query.userId };
  else if (req.query.userId)
    query = { user: req.query.userId };
  else if (req.query.formId)
    query = { _id: req.query.formId };

  Models.Data
    .find(query)
    .populate('user')
    .populate('center')
    .populate('assay')
    .populate('cellLines')
    .populate('perturbagens')
    .populate('readouts')
    .exec(function(err, allData) {
      if (err) {
        console.log(err);
        res.status(404).send('Forms could not be found.');
      }
      res.status(200).send(allData);
    });
});

app.post('/api/secure/data', function(req, res) {
  var getCellLine = function(id, callback) {
    Models.CellLine.find({ '_id': id }, function(err, result) {
      if (err) {
        callback(err, null);
      }
      callback(null, result[0]);
    });
  };

  console.log('Posting To Data');
  var inputData = req.body;
  if (inputData.cellLines.length > 1) {
    inputData._id = 'LINCS-' + inputData.center.name + '-MTPL-' + shortId.generate();
  } else if (inputData.cellLines.length === 1) {
    getCellLine(inputData.cellLines[0], function(err, cellLine) {
      if (err) {
        console.log(err);
      }
      inputData._id = 'LINCS-' + inputData.center.name + '-' + cellLine.name + '-' + shortId.generate();
    });
  } else {
    inputData._id = 'LINCS-' + inputData.center.name + '-NONE-' + shortId.generate();
  }

  console.log(inputData);
  var form = new Models.Data(inputData);
  form.save(function(err) {
    console.log(err);
  });
  res.status(201).send(form);
});

// UPDATE
app.put('/api/secure/data', function(req, res) {
  var newForm = req.body;
  delete newForm._id;
  Models.Data.update({ _id: req.query.id }, newForm, function(err, result) {
    if (err)
      res.status(404).send('Form with id ' + req.query.id + ' could not be updated');
    res.status(200).send(result);
  });
});

// DELETE
app.delete('/api/secure/data', function(req, res) {
  var query;
  if (req.query.userId && req.query.formId)
    query = { _id: req.query.formId, userId: req.query.userId };
  else if (req.query.formId)
    query = { _id: req.query.formId };

  if (query !== undefined) {
    Models.Data.find(query).remove(function(err, result) {
      if (err) {
        console.log(err);
        res.status(404).send('There was an error deleting the form with id ' + req.query.formId + ' Error: ' + err);
      }
      res.status(200).send('The form with id ' + req.query.formId + ' was deleted');
    });
  }
  else {
    res.status(404).send('There was an error deleting form. Invalid url query.');
  }
});

};