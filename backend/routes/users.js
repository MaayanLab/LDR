var jwt             = require('express-jwt'),
  Models          = require('../models'),
  config          = require('../config/database'),
  _               = require('lodash');


function createToken(user) {
  return jsonWT.sign(_.omit(user, 'password'), config.secret, { expiresInMinutes: 60 * 5 });
}

module.exports = function(app, passport) {

// USERS
  /*
   app.get('/api/users', function(req, res) {
   Models.User.find({}, function(err, users) {
   if (err) {
   console.log(err);
   return done(err);
   }
   res.status(200).send(users);
   });
   });
   */
  app.get('/logout', function(req, res) {
    req.logout();
    res.status(200).send('User successfully logged out');
  });

  app.post('/login', passport.authenticate('local-login'), function(req, res) {
    var token = createToken(req.user);
    var userBlob = {
      user: req.user,
      id_token: token
    };
    res.status(201).send(userBlob);

  });

};
