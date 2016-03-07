var jsonWT = require('jsonwebtoken'),
  jwt = require('express-jwt'),
  nodemailer = require('nodemailer'),
  _ = require('lodash'),
  crypto = require('crypto'),
  async = require('async'),
  User = require('../models').User,
  config = require('../config/database'),
  baseUrl = require('../config/baseUrl').baseUrl;

function createToken(user) {
  'use strict';

  return jsonWT.sign(user, config.secret, {
    expiresInMinutes: 120,
    issuer: 'http://amp.pharm.mssm.edu/LDR/'
  });
}

module.exports = function(app) {
  'use strict';

  // USERS
  app.get(baseUrl + '/api/users/', function(req, res) {
    User
      .find({})
      .populate('group')
      .lean()
      .exec(function(err, users) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting users.');
        }
        var userList = [];
        _.each(users, function(user) {
          userList.push(_.omit(user, ['password', 'admin', '__v']));
        });
        res.status(200).send(userList);
      });
  });

  app.put(baseUrl + '/api/secure/user/:id/update/', function(req, res) {
    var userId = req.params.id;
    var updatedUser = req.body;
    var query = {
      _id: userId
    };
    User.update(query, updatedUser, function(err) {
      if (err) {
        console.log(err);
        res.status(400).send('Error updating user');
      } else {
        res.status(204).send('User successfully updated');
      }
    });
  });

  app.put(baseUrl + '/api/secure/user/:id/changePassword/',
    function(req, res) {

      var userId = req.params.id;
      var enteredPassword = req.body.old;
      var newPassword = req.body.new;

      var query = {
        _id: userId
      };
      User
        .findOne(query)
        .exec(function(err, user) {
          if (err) {
            console.log(err);
            res.status(404).send('Error: Could not find user ' +
              'with id:' + userId + '.');
          } else if (enteredPassword) {
            user.checkPassword(enteredPassword,
              function(pwErr, isMatch) {
                if (pwErr) {
                  console.log(pwErr);
                  res.status(404).send('Error changing password.');
                } else if (isMatch && newPassword) {
                  user.password = newPassword;
                  console.log(user);
                  user.save(function(saveErr) {
                    if (saveErr) {
                      console.log(saveErr);
                    }
                  });
                  res.status(204).send('Password successfully updated');
                }
              }
            );
          } else {
            res.status(404).send('There was an error changing the' +
              'user\'s password.');
          }
        });
    }
  );

  app.post(baseUrl + '/login', function(req, res) {
    User
      .findOne({
        username: req.body.username
      })
      .populate('group')
      .exec(function(err, user) {
        if (err) {
          console.log(err);
          res.status(401).send('Error logging user in.');
        } else if (!user) {
          res.status(404).send('User not found.');
        } else if (req.body.password) {
          user.checkPassword(req.body.password,
            function(pwErr, isMatch) {
              if (pwErr || !isMatch) {
                res.status(401).send('Error logging user in.');
              } else if (isMatch) {
                var userWOPassword = _.omit(user.toObject(), [
                  'password', '__v'
                ]);
                var token = createToken(userWOPassword);

                var userBlob = {
                  user: userWOPassword,
                  id_token: token
                };
                res.status(200).send(userBlob);
              }
            }
          );
        } else {
          res.status(404).send('There was an error logging in. ' +
            'Please try again.');
        }
      });
  });

  app.post(baseUrl + '/register', function(req, res) {
    // Store the group id in the database, but return the user with
    // a populated group
    var inputUser = req.body;
    var groupObj = inputUser.group;
    inputUser.group = groupObj && groupObj._id;
    inputUser.admin = false;
    if (!inputUser.admitted) {
      inputUser.admitted = false;
    }
    User.create(inputUser, function(err, user) {
      if (err) {
        res.status(500).send('User could not be created');
        console.log('Error creating User: ' + err);
        return;
      }
      var userWOPass = _.omit(user.toObject(), [
        'password', 'passwordConfirm', '__v'
      ]);
      var token = createToken(userWOPass);
      if (groupObj) {
        userWOPass.group = groupObj;
      }
      var newUserBlob = {
        user: userWOPass,
        id_token: token
      };
      res.status(201).send(newUserBlob);
    });
  });

  app.get(baseUrl + '/api/reset/:token', function(req, res) {
    User
      .findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      })
      .populate('group')
      .exec(function(err, user) {
        if (!user) {
          res.status(404).send(
            'User not found or token may have expired.');
          return;
        }
        var userWOPass = _.omit(user.toObject(), [
          'password', 'passwordConfirm', '__v'
        ]);
        res.status(202).send(userWOPass);
      });
  });

  app.post(baseUrl + '/api/forgot', function(req, res, next) {
    var respSent = false;
    var email;
    if (!req.body.email) {
      res.status(400).send('User email required.');
      respSent = true;
    } else {
      email = req.body.email;
    }
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          email: req.body.email
        }, function(err, user) {
          if (!user && !respSent) {
            res.status(404).send('User not found');
            respSent = true;
            return;
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'maayanlabapps@gmail.com',
            pass: 'systemsbiology'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'password-reset@amp.pharm.mssm.edu',
          subject: 'LDR Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your LINCS Dataset Registry account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the reset process:\n\n' +
            'http://' + req.headers.host + '/LDR/#/user/reset/' +
            token +
            '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          done(err, 'done');
        });
      }
    ], function(err) {
      if (!respSent && !err) {
        res.status(202).send('An e-mail has been sent to ' + email +
          ' with further instructions.');
      } else if (!respSent && err) {
        console.log(err);
        res.status(500).send('An error occurred resetting password.');
      }
    });
  });

  app.post(baseUrl + '/api/reset/:token', function(req, res) {
    var respSent;
    async.waterfall([
      function(done) {
        User
          .findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {
              $gt: Date.now()
            }
          })
          .exec(function(err, user) {
            if (!user) {
              respSent = true;
              res.status(404).send('User not found.');
              return;
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              if (!err) {
                respSent = true;
                res.status(202).send('User password reset.');
              }
              done(err, user);
            });
          });
      },
      function(user, done) {
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'maayanlabapps@gmail.com',
            pass: 'systemsbiology'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'LDR@amp.pharm.mssm.edu',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' +
            user.email + ' has just been changed.\n\n' +
            'If you did not request this, please email ' +
            'michael.mcdermott@mssm.edu immediately. Thank you.'
        };
        transporter.sendMail(mailOptions, function(err) {
          done(err);
        });
      }
    ], function(err) {
      if (err && !respSent) {
        console.log(err);
        res.status(500).send('An error occurred while resetting password.');
      }
    });
  });
};
