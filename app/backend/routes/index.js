var jwt = require('express-jwt'),
    config = require('../config/database');

var jwtCheck = jwt({
    secret: config.secret
});

module.exports = function(app, mongoose) {

    app.use('/api/secure', jwtCheck);

    require('./users')(app, mongoose);
    require('./admin')(app);
    require('./groups')(app, mongoose);
    require('./tools')(app);
    require('./releaseRoutes')(app);

};
