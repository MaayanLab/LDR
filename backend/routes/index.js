var jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database');

module.exports = function (app) {

    // TODO: Uncomment to require token on request to /api/secure
    //app.use('/api/secure', jwtCheck);

    app.get('/MilestonesLanding/MilestonesLanding/', function (req, res) {
        res.redirect('/MilestonesLanding/');
    });

    require('./assays')(app);
    require('./cellLines')(app);
    require('./readouts')(app);
    require('./perturbagens')(app);
    require('./users')(app);
    require('./formRoutes')(app);

};
