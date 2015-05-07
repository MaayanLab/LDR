var jsonWT          = require('jsonwebtoken'),
    jwt = require('express-jwt'),
    Models = require('../models'),
    config = require('../config/database'),
    _ = require('lodash');


function createToken(user) {
    return jsonWT.sign(_.omit(user, 'password'), config.secret, {expiresInMinutes: 60 * 5});
}

module.exports = function (app, passport) {

    // USERS
    app.get('/api/users', function (req, res) {
        Models.User.find({}, function (err, users) {
            if (err) {
                console.log(err);
                return done(err);
            }
            res.status(200).send(users);
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.status(200).send('User successfully logged out');
    });

    app.post('/login', function (req, res) {
        console.log(req.body);
        Models.User
            .findOne({'username': req.body.username})
            .populate('center')
            .exec(function (err, user) {
                if (err) {
                    console.log(err);
                    res.status(404).send(err);
                }
                if (!user)
                    res.status(404).send('User could not be found.');
                if (!user.validPassword(req.body.password))
                    res.status(401).send('Password was incorrect');

                var token = createToken(user);
                var userBlob = {
                    user: user,
                    id_token: token
                };
                console.log(userBlob.user);
                res.status(201).send(userBlob);
            });
    });

    app.post('/register', function (req, res) {
        console.log('receiving POST on server');
        var user = new Models.User({
            _id: Models.genId(),
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)),
            center: req.body.center
        });
        user.save(function (err) {
            if (err) {
                console.log(err);
                res.status(404).send(err);
            }
        });
        res.status(304).send(user);
    });

}
;
