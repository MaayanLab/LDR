var jsonWT          = require('jsonwebtoken'),
  jwt             = require('express-jwt'),
  Models          = require('../app/models'),
  config          = require('../config/database'),
  _               = require('lodash');


var jwtCheck = jwt({
  secret: config.secret
});

module.exports = function(app, passport) {

  app.use('/api/secure', jwtCheck);

  app.get('/MilestonesLanding/MilestonesLanding/', function(req, res) {
    res.redirect('/MilestonesLanding/');
  });

  require('./assays')(app, passport);
  require('./cellLines')(app, passport);
  require('./readouts')(app, passport);
  require('./perturbagens')(app, passport);
  require('./users')(app, passport);

};
