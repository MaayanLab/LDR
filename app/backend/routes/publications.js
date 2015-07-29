/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

'use strict';

var Publication = require('../models').Publication,
    baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {

  app.get(baseUrl + '/api/publications', function(req, res) {
    Publication
      .find({})
      .lean()
      .exec(function(err, publications) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting publications.');
        } else {
          res.status(200).send(publications);
        }
      }
    );
  });
};
