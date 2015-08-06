/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

'use strict';

var Models = require('../models'),
  Event = Models.Event,
  baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {

  // Get all events
  app.get(baseUrl + '/api/events/', function(req, res) {
    Event
      .find({})
      .sort({
        date: 1
      })
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting all events.');
        } else {
          res.status(200).send(events);
        }
      });
  });

  // Get all upcoming events
  app.get(baseUrl + '/api/events/upcoming/', function(req, res) {
    var today = new Date();
    Event
      .find({})
      .where('date').gte(today)
      .sort({
        date: 1
      })
      .limit()
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting upcoming 4 events.');
        } else {
          res.status(200).send(events);
        }
      });
  });

  // Get all past events
  app.get(baseUrl + '/api/events/past', function(req, res) {
    var today = new Date();
    Event
      .find({})
      .where('date').lte(today)
      .sort({
        date: 1
      })
      .limit()
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting upcoming 4 events.');
        } else {
          res.status(200).send(events);
        }
      });
  });

  // Get events for homepage
  app.get(baseUrl + '/api/events/home/', function(req, res) {
    Event
      .find({
        showAtHome: true
      })
      .sort({
        date: 1
      })
      .limit(3)
      .lean()
      .exec(function(err, events) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting events for homepage.');
        } else {
          res.status(200).send(events);
        }
      });
  });

  // Get all events of a certain type
  app.get(baseUrl +
    '/api/events/:eventType(webinars|fundingOpps|courses|workshops)/',
    function(req, res) {
      var query = {};
      var et = req.params.eventType;
      if (et === 'webinars') {
        query = { type: 'Webinar' };
      } else if (et === 'fundingOpps') {
        query = { type: 'Funding Opportunity' };
      } else if (et === 'courses') {
        query = { type: 'Course' };
      } else if (et === 'workshops') {
        query = { type: 'Workshop' };
      } else {
        res.status(400).send('URL not formatted properly');
      }

      Event
        .find(query)
        .sort({date: 1})
        .exec(function(err, events) {
          if (err) {
            console.log(err);
            res.status(404).send('Error getting events');
          } else {
            res.status(200).send(events);
          }
        }
      );
    });

  // Get all upcoming events of a certain type
  app.get(baseUrl +
    '/api/events/:eventType(webinars|fundingOpps|courses|workshops)/upcoming/',
    function(req, res) {
      var today = new Date();
      var query = {};
      var et = req.params.eventType;
      if (et === 'webinars') {
        query = { type: 'Webinar' };
      } else if (et === 'fundingOpps') {
        query = { type: 'Funding Opportunity' };
      } else if (et === 'courses') {
        query = { type: 'Course' };
      } else if (et === 'workshops') {
        query = { type: 'Workshop' };
      } else {
        res.status(400).send('URL not formatted properly');
      }

      Event
        .find(query)
        .where('date').gte(today)
        .sort({date: 1})
        .exec(function(err, upcomingEvents) {
          if (err) {
            console.log(err);
            res.status(404).send('Error getting upcoming events');
          } else {
            res.status(200).send(upcomingEvents);
          }
        }
      );
    });

  // Get all past events of a certain type
  app.get(baseUrl +
    '/api/events/:eventType(webinars|fundingOpps|courses|workshops)/past/',
    function(req, res) {
      var today = new Date();
      var query = {};
      var et = req.params.eventType;
      if (et === 'webinars') {
        query = { type: 'Webinar' };
      } else if (et === 'fundingOpps') {
        query = { type: 'Funding Opportunity' };
      } else if (et === 'courses') {
        query = { type: 'Course' };
      } else if (et === 'workshops') {
        query = { type: 'Workshop' };
      } else {
        res.status(400).send('URL not formatted properly');
      }

      Event
        .find(query)
        .where('date').lte(today)
        .sort({date: 1})
        .exec(function(err, upcomingEvents) {
          if (err) {
            console.log(err);
            res.status(404).send('Error getting upcoming events');
          } else {
            res.status(200).send(upcomingEvents);
          }
        }
      );
    });
};
