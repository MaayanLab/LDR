/**
 * @author Michael McDermott
 * Created on 5/29/15.
 */

var jwt = require('jsonwebtoken'),
  secret = require('../config/database').secret,
  baseUrl = require('../config/baseUrl').baseUrl,
  DataRelease = require('../models').DataRelease;

module.exports = function(app) {
  app.post(baseUrl +
    '/api/secure/admin/:releaseId/:action(approve|unapprove|return)',
    function(req, res) {
      var updateObj, token, user;
      if (req.params.action === 'approve') {
        updateObj = {
          approved: true
        };
      } else if (req.params.action === 'unapprove') {
        updateObj = {
          approved: false
        };
      } else if (req.params.action === 'return' && req.body.message) {
        updateObj = {
          needsEdit: true,
          message: req.body.message
        };
      }
      if (req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
      }
      if (token && updateObj) {
        user = jwt.verify(token, secret, {
          issuer: 'http://amp.pharm.mssm.edu/LDR/'
        });
        if (user.admin) {
          DataRelease
            .update({
                _id: req.params.releaseId
              }, updateObj,
              function(err, release) {
                if (err) {
                  res.status(404).send('There was an error ' +
                    'approving the release. Please try again.')
                } else {
                  res.status(200).send(release);
                }
              }
            )
        } else {
          res.status(401).send('You are not authorized to access ' +
            'this URL.')
        }
      } else {
        res.status(401).send('Token or URL are invalid. Try again.')
      }
    }
  );
};
