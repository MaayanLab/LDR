var jwt = require('express-jwt'),
    config = require('../config/database');

var jwtCheck = jwt({
    secret: config.secret
});

module.exports = function(app) {

    app.use('/api/secure', jwtCheck);

    require('./users')(app);
    require('./admin')(app);
    require('./groups')(app);
    require('./metadata')(app);
    require('./releases')(app);

};
