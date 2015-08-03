/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

'use strict';

var Models = require('../models'),
    Event = Models.Event,
    baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {

  // Get upcoming 4 events
  app.get(baseUrl + '/api/events/upcoming', function(req, res) {
    Event
      .find({})
      .sort({ date: 1 })
      .limit(4)
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting upcoming 4 events.');
        } else {
          res.status(200).send(events);
        }
      }
    );
  });

  app.get(baseUrl + '/api/events', function(req, res) {
    Event
      .find({})
      .sort({ date: 1 })
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting all events.');
        } else {
          res.status(200).send(events);
        }
      }
    );
  });
};
