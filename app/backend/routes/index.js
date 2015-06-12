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
    require('./tools')(app);
    require('./releaseRoutes')(app);
    require('./uploads')(app);

};
