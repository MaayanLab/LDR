var jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database');

var jwtCheck = jwt({
    secret: config.secret
});

module.exports = function(app) {

    // TODO: Uncomment to require token on request to /api/secure
    //app.use('/api/secure', jwtCheck);

    require('./users')(app);
    require('./admin')(app);
    require('./groups')(app);
    require('./releaseRoutes')(app);

};
