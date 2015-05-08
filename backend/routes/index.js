var jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database'),
    _ = require('lodash');


var jwtCheck = jwt({
    secret: config.secret
});

module.exports = function (app, passport) {

    // TODO: Uncomment to require token on request to /api/secure
    //app.use('/api/secure', jwtCheck);

    app.get('/MilestonesLanding/MilestonesLanding/', function (req, res) {
        res.redirect('/MilestonesLanding/');
    });

    require('./assays')(app, passport);
    require('./cellLines')(app, passport);
    require('./readouts')(app, passport);
    require('./perturbagens')(app, passport);
    require('./users')(app, passport);
    require('./formRoutes')(app, passport);

};
