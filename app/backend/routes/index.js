var jwt = require('express-jwt'),
  baseUrl = require('../config/baseUrl').baseUrl,
  config = require('../config/database');

var jwtCheck = jwt({
  secret: config.secret
});

module.exports = function(app) {
  'use strict';

  app.get(baseUrl + '/api/version', function(req, res) {
    res.status(200).send(require('../../../package.json').version);
  });

  app.use('/api/secure', jwtCheck);

  require('./users')(app);
  require('./admin')(app);
  require('./groups')(app);
  require('./metadata')(app);
  require('./releases')(app);

};
