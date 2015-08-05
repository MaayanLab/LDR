var jwt = require('express-jwt'),
  config = require('../config/database');

var jwtCheck = jwt({
  secret: config.secret
});

module.exports = function(app) {
  'use strict';

  app.use('/api/secure', jwtCheck);

  require('./community')(app);
  require('./news')(app);
  require('./publications')(app);
  require('./events')(app);
  require('./users')(app);
  require('./admin')(app);
  require('./groups')(app);
  require('./metadata')(app);
  require('./releases')(app);

};
