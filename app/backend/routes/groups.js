/**
 * @author Michael McDermott
 * Created on 5/21/15.
 */

var http = require('http'),
  Q = require('q'),
  _ = require('lodash'),
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
  app.get(baseUrl + '/api/groups/', function(req, res) {
    Group
      .find({})
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
          res.status(404).send('Error getting group with id: ' +
            groupId);
        } else {
          res.status(200).send(group);
        }
      });
  });

  app.get(baseUrl + '/api/group/:id/statistics/', function(req, res) {
    var groupId = req.params.id;
    var statResponse = {};
    var statModels = [
      { model: User, key: 'user' },
      { model: DataRelease, key: 'release' },
      { model: Assay, key: 'assay' },
      { model: CellLine, key: 'cell' },
      { model: Perturbagen, key: 'perturbagen' },
      { model: Readout, key: 'readout' }
    ];
    var promises = [];
    _.each(statModels, function(modelObj) {
      var def = Q.defer();
      modelObj.model
        .where({ group: groupId })
        .count(function(err, count) {
          if (err) {
            def.reject(err);
          } else {
            statResponse[modelObj.key] = count;
            def.resolve(count);
          }
        });
      promises.push(def.promise);
    });
    Q.all(promises).then(function(results) {
      res.status(200).send(statResponse);
    });
  });

  app.get(baseUrl + '/api/group/:id/users/', function(req, res) {
    var groupId = req.params.id;
    var query = {
      group: groupId
    };
    User
      .find(query)
      .lean()
      .exec(function(err, users) {
        if (err) {
          console.log(err);
          res.status(404).send('Users for group with id: ' +
            groupId + ' could not be found');
        } else {
          res.status(200).send(users);
        }
      });
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
            headers: { 'Content-Type': group.icon.type }
          }, function(err) {
            if (err) {
              console.log(err);
              res.status(err.status).end();
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
        User.update({ _id: userId }, {
          admitted: true
        },
        function(err, user) {
          if (err) {
            res.status(404).send('There was an error ' +
              'admitting this user. Please try again.');
          } else {
            res.status(204).send('User successfully ' +
              'updated');
          }
        });
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
      .findOne({ _id: groupId })
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
