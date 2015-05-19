var jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database');

var jwtCheck = jwt({
    secret: config.secret
});

module.exports = function(app) {

    // TODO: Uncomment to require token on request to /api/secure
    //app.use('/api/secure', jwtCheck);

    app.get('/MilestonesLanding/MilestonesLanding/', function(req, res) {
        res.redirect('/MilestonesLanding/');
    });

    require('./users')(app);
    require('./releaseRoutes')(app);

};
