/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

var _ = require('lodash'),
  jwt = require('jsonwebtoken'),
  secret = require('../config/database').secret,
  baseUrl = require('../config/baseUrl').baseUrl,
  Models = require('../models'),
  DataRelease = Models.DataRelease,
  Assay = Models.Assay,
  CellLine = Models.CellLine,
  Perturbagen = Models.Perturbagen,
  Readout = Models.Readout,
  User = Models.User,
  Group = Models.Group;

module.exports = function(app) {
  'use strict';

  app.get(baseUrl + '/api/groups/', function(req, res) {
    Group
      .find({})
      .where('name').nin(['NIH', 'BD2K-LINCS'])
      .lean()
      .exec(function(err, groups) {
        if (err) {
          console.log(err);
          res.status(404).send('Could not retrieve groups. ' +
            'Please try again.');
        } else {
          res.status(200).send(groups);
        }
      });
  });

  app.get(baseUrl + '/api/group/:id/', function(req, res) {
    var groupId = req.params.id;
    Group
      .findOne({
        _id: groupId
      })
      .lean()
      .exec(function(err, group) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting group with id: ' + groupId);
        } else {
          res.status(200).send(group);
        }
      });
  });

  app.get(baseUrl + '/api/group/:id/statistics/', function(req, res) {
    var groupId = req.params.id;
    var statResponse = {
      user: 0,
      release: 0,
      assay: 0,
      cell: 0,
      perturbagen: 0,
      readout: 0
    };
    User
      .where({
        group: groupId
      })
      .count(function(err, userCount) {
        if (err) {
          console.log(err);
        }
        statResponse.user = userCount;

        DataRelease
          .where({
            group: groupId
          })
          .count(function(drErr, releaseCount) {
            if (drErr) {
              console.log(drErr);
            }
            statResponse.release = releaseCount;

            Assay
              .where({
                group: groupId
              })
              .count(function(asErr, asCount) {
                if (asErr) {
                  console.log(asErr);
                }
                statResponse.assay = asCount;

                CellLine
                  .where({
                    group: groupId
                  })
                  .count(function(clErr, clCount) {
                    if (clErr) {
                      console.log(clErr);
                    }
                    statResponse.cell = clCount;

                    Perturbagen
                      .where({
                        group: groupId
                      })
                      .count(function(pertErr, pertCount) {
                        if (pertErr) {
                          console.log(pertErr);
                        }
                        statResponse.perturbagen = pertCount;

                        Readout
                          .where({
                            group: groupId
                          })
                          .count(function(rdErr, roCount) {
                            if (rdErr) {
                              console.log(rdErr);
                            }
                            statResponse.readout = roCount;
                            res.status(200).send(statResponse);
                          });
                      });
                  });
              });
          });
      });
  });

  app.get(baseUrl + '/api/group/:id/users/', function(req, res) {
    var groupId = req.params.id;
    var query = {
      group: groupId
    };

    var token, user;

    if (req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer') {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      user = jwt.verify(token, secret, {
        issuer: 'http://amp.pharm.mssm.edu/LDR/'
      });
      if (user.admitted && user.group._id === groupId) {
        User
          .find(query)
          .lean()
          .exec(function(err, users) {
            if (err) {
              console.log(err);
              res.status(404).send('Users for group could not be found');
            } else {
              res.status(200).send(users);
            }
          });
      } else {
        res.status(401).send('You are not authorized to access this URL.');
      }
    } else {
      res.status(401).send('Token or URL are invalid. Try again.');
    }

  });

  app.get(baseUrl + '/api/group/:id/icon/', function(req, res) {
    var groupId = req.params.id;

    Group
      .findOne({
        _id: groupId
      })
      .exec(function(err, group) {
        if (err) {
          console.log(err);
          res.status(404).send('Group could not be found');
        } else if (!group.icon) {
          group.icon = {
            type: '',
            path: ''
          };
          group.save();
          res.status(404).end();
        } else if (group.icon.path) {
          res.status(200).sendFile(group.icon.path, {
            headers: {
              'Content-Type': group.icon.type
            }
          }, function(grErr) {
            if (grErr) {
              console.log(grErr);
              res.status(grErr.status).end();
            } else {
              console.log('Sent:', group.icon.path);
            }
          });
        }
      });
  });

  app.put(baseUrl + '/api/secure/group/:groupId/users/:userId/approve/',
    function(req, res) {
      var groupId = req.params.groupId;
      var userId = req.params.userId;
      var token, user;

      // Automatically admit the user if there is no one in the group
      User
        .find({
          group: groupId
        })
        .lean()
        .exec(function(err, users) {
          if (err) {
            console.log(err);
          }
          if (users.length) {
            checkForApproval();
          } else {
            approveUser();
          }
        });

      var checkForApproval = function() {
        if (req.headers.authorization &&
          req.headers.authorization.split(' ')[0] === 'Bearer') {
          token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
          user = jwt.verify(token, secret, {
            issuer: 'http://amp.pharm.mssm.edu/LDR/'
          });
          if (user.admitted && user.group._id === groupId) {
            approveUser();
          } else {
            res.status(401).send('You are not authorized ' +
              'to access this URL.');
          }
        } else {
          res.status(401).send('Token or URL are invalid. Try again.');
        }
      };

      var approveUser = function() {
        User.update({
            _id: userId
          }, {
            admitted: true
          },
          function(err) {
            if (err) {
              res.status(404).send('There was an error ' +
                'admitting this user. Please try again.');
            } else {
              res.status(204).send('User successfully ' +
                'updated');
            }
          }
        );
      };
    }
  );

  app.put(baseUrl + '/api/secure/group/:id/update/', function(req, res) {
    var groupId = req.params.id;
    var updatedGroup = req.body;
    var query = {
      _id: groupId
    };
    Group.update(query, updatedGroup, function(err) {
      if (err) {
        console.log(err);
        res.status(400).send('Error updating user');
      } else {
        res.status(204).send('Group successfully updated');
      }
    });
  });

  // Do not make this API secure so that unregistered users can create a
  // group
  app.post(baseUrl + '/api/group/create/', function(req, res) {

    Group.create(req.body, function(err, group) {
      if (err) {
        console.log(err);
        res.status(404).send('Error creating group');
      } else {
        res.status(201).send(_.omit(group, ['__v']));
      }
    });
  });

  app.post(baseUrl + '/api/secure/group/:id/upload/', function(req, res) {
    var groupId = req.params.id;
    Group
      .findOne({
        _id: groupId
      })
      .exec(function(err, group) {
        if (err) {
          console.log(err);
          res.status(500).send('There was an error setting the ' +
            'group icon. Please try again.');
        } else {
          group.icon.path = req.files.file.path;
          group.icon.type = req.files.file.mimetype;
          group.save();
          res.status(200).send('Group icon successfully updated');
        }
      });
  });
};
