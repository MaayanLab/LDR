var jwt             = require('jsonwebtoken'),
//    formsAngular    = require('forms-angular'),
    Models          = require('./app/models'),
    config          = require('./config/database'),
    _               = require('lodash');

module.exports = function(app, passport) {

    // console.log(Models.Data);
    // var DataFormHandler = new (formsAngular)(app);
    // DataFormHandler.addResource('data', Models.Data);
    // var fng = new formsAngular(app, { urlPrefix: '/forms/' });
    // fng.newResource(Models.Data);

    app.get('/api/data/schema', function(req, res) {
        res.status(200).send(Models.Data.schema);
    });

    app.get('/api/users', function(req, res) {
        Models.User.find({'username': { '$exists': true }}, function(err, users) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(users);
        });            
    });

    app.get('/api/assays', function(req, res) {
        Models.Assay.find({'name': { '$exists': true }}, function(err, assays) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(assays);
        });            
    });

    app.get('/api/cellLines', function(req, res) {
        Models.CellLine.find({'name': { '$exists': true }}, function(err, lines) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(lines);
        });            
    });

    app.get('/api/perturbagens', function(req, res) {
        Models.Perturbagen.find({'name': { '$exists': true }}, function(err, perts) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(perts);
        });            
    });

    app.get('/api/readouts', function(req, res) {
        Models.Readout.find({'name': { '$exists': true }}, function(err, readouts) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(readouts);
        });            
    });

    app.get('/api/releaseDates', function(req, res) {
        Models.ReleaseDate.find({'name': { '$exists': true }}, function(err, rDates) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(rDates);
        });            
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.status(200).send('User successfully logged out');
    });

    app.post('/login', passport.authenticate('local-login'), function(req, res) {
        console.log(Models.User);
        token = createToken(req.user); 
        var userBlob = {
            user: req.user,
            id_token: token
        };
        console.log(userBlob);
        res.status(201).send(userBlob);

    });

    app.post('/api/data/user', function(req, res) {
        console.log(req.body);
        Models.Data.find({ userId: req.body._id }, function(err, userData) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(userData);
        });
    });

    app.post('/api/data/add', function(req, res) {
        console.log('Posting');
        var inputData = req.body;
        inputData._id = Models.genId();
        var saveData = Models.Data.create(inputData);
        console.log(saveData);
        res.status(201).send(saveData);
    });

    

};

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60 *5 });
}

