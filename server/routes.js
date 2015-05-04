var jsonWT        = require('jsonwebtoken'),
  jwt             = require('express-jwt'),
  shortId         = require('shortid'),
  Models          = require('./models'),
  config          = require('./config/database'),
  baseUrl         = require('./config/baseUrl').baseUrl,
  _               = require('lodash')
  bcrypt          = require('bcrypt')


function createToken(user) {
  return jsonWT.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60 * 5 });
}

var jwtCheck = jwt({
  secret: config.secret
});

module.exports = function(app, passport) {

  app.use('/api/secure', jwtCheck);

  app.get('/MilestonesLanding/MilestonesLanding/', function(req, res) {
    res.redirect('/MilestonesLanding/');
  });

  app.get('/api/data/schema', function(req, res) {
    res.send(Models.Data.schema.tree);
  });

  app.get('/api/centers', function(req, res) {
    Models.Center
      .find({})
      .exec(function(err, centers) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(centers);
      });
  });

  // USERS
  /*
   app.get('/api/users', function(req, res) {
   Models.User.find({'_id': { '$exists': true }}, function(err, users) {
   if (err) {
   console.log(err);
   return done(err);
   }
   res.status(200).send(users);
   });
   });
   */
  app.post('/register', function(req, res) {
      console.log('receiving POST on server');
      var user = new Models.User({
          _id: Models.genId(),
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
      });
      user.save(function(err) {
          if (err) {
              console.log(err);
          }
      });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.status(200).send('User successfully logged out');
  });

  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    var token = createToken(req.user);
    console.log(token);
    var userBlob = {
      user: req.user,
      id_token: token
    };
    res.status(201).send(userBlob);

  });

  // ASSAYS GET, POST, DELETE
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
      query = { '_id': { '$exists': true }};
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

  // CELL LINES GET, POST, DELETE
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
      query = { '_id': { '$exists': true }};
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

  // PERTURBAGENS GET, POST, DELETE
  app.get('/api/perturbagens', function(req, res) {
    // params are blank, id, or center
    var query;
    if (req.query.id) {
      query = { '_id': req.query.id};
    }
    else if (req.query.centerId) {
      query = { 'center': req.query.centerId };
    }
    else {
      query = { '_id': { '$exists': true }};
    }
    Models.Perturbagen
      .find(query)
      .populate('center')
      .exec(function(err, perturbagens) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(perturbagens);
      });
  });

  app.post('/api/secure/perturbagens', function(req, res) {
    console.log('Posting To Perturbagens');
    var inputData = req.body;
    inputData._id = Models.genId();
    var saveData = Models.Perturbagen.create(inputData);
    res.status(201).send(saveData);
  });

  app.put('/api/secure/perturbagens', function(req, res) {
    console.log('Updating perturbagen with id ' + req.query.id);
    if (req.query.id) {
      var query = { '_id': req.query.id};
      var newPert = req.body;
      delete newPert._id;
      Models.Perturbagen.update(query, newPert, function(err,result) {
        if (err) {
          console.log(err);
          res.status(404).send(err);
        }
        res.status(200).send(result);
      });
    }
    else {
      res.status(404).send('Perturbagen id wasn\'t given, or the URL query was invalid');
    }
  });

  app.delete('/api/secure/perturbagens', function(req, res) {
    Models.Perturbagen.find({ '_id': req.query.id }).remove(function(err, result) {
      if (err) {
        console.log(err);
        res.status(404).send('Could not delete assay with id: ' + req.query.id + ' Error: ' + err);
      }
      res.status(200).send('Assay with id ' + req.query.id + ' deleted.');
    });

  });

  // READOUTS GET, POST, DELETE
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
      query = { '_id': { '$exists': true }};
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

  // FORM/DATASET GET, POST, UPDATE, DELETE
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

  // TODO: Change after making assay and cell line acronyms
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
