/**
 * @author Michael McDermott
 * Created on 7/29/15.
 */

var _ = require('lodash'),
  Models = require('../models'),
  Workshop = Models.Workshop,
  Webinar = Models.Webinar,
  Course = Models.Course,
  FundingOpp = Models.FundingOpp,
  baseUrl = require('../config/baseUrl').baseUrl;

module.exports = function(app) {
  'use strict';

  // Async function for getting event information
  // Provide Model, options (date, upcoming, past, and lean), and a cb function
  var getEvent = function(mongooseModel, options, callback) {
    var opts, cb, chain, today;
    today = new Date();

    // Properly manage arguments of getEvent function
    if (_.isFunction(options) && _.isUndefined(callback)) {
      cb = options;
      opts = {};
    } else if (_.isFunction(callback) && _.isObject(options)) {
      opts = options;
      cb = callback;
    } else {
      throw new Error('Options and Callback are not properly formatted');
    }

    // Build mongoose query based on options object
    if (mongooseModel && opts.home) {
      chain = mongooseModel.find({showAtHome: true});
    } else if (mongooseModel) {
      chain = mongooseModel.find({});
    }
    if (opts.dateAsc) {
      chain = chain.sort({date: 1});
    } else if (opts.dateDesc) {
      chain = chain.sort({date: -1});
    }
    if (opts.upcoming) {
      chain = chain.where('date').gte(today);
    } else if (opts.past) {
      chain = chain.where('date').lte(today);
    }
    if (opts.lean) {
      chain = chain.lean();
    }

    // Run the built mongoose query and pass the results to the cb function
    chain
      .exec(function(err, data) {
        if (err) {
          console.log(err);
          cb(err, null);
        } else {
          cb(null, data);
        }
      }
    );
  };

  // Get all events, all upcoming events, all past events, or events for the
  // homepage.
  // If eventType provided, get all of that specific type of event
  app.get(baseUrl +
    '/api/events/:eventType(events|webinars|workshops|fundingOpps|courses)?/:eventOpts(upcoming|past|home)?',
    function(req, res) {
      // Get URL parameters
      var eventType = req.params.eventType;
      var eventOpts = req.params.eventOpts;

      // Array of all objects to be passed back to response
      var allEvents = [];

      // If an event type is specified, the number of events is 1, otherwise
      // number of events is the total 4
      var numEvents = _.isUndefined(eventType) ? 4 : 1;
      var numFinished = 0;

      // Build options object based on URL parameters
      // options.dateAsc and options.dateDesc determine the order of the
      // returned dates
      var options = {
        lean: true
      };
      if (eventOpts === 'upcoming') {
        options.dateAsc = true;
        options.upcoming = true;
      } else if (eventOpts === 'past') {
        options.dateDesc = true;
        options.past = true;
      } else if (eventOpts === 'home') {
        options.dateAsc = true;
        options.home = true;
      } else {
        options.dateAsc = true;
      }

      function callback(err, data) {
        if (err) {
          console.log(err);
          res.status(404).send('Error getting events');
        } else {
          // Add all data from data array to allEvents array
          allEvents = _.union(allEvents, data);

          // If options.dateAsc === true, sort the events array with the
          // earliest date first. If options.dateDesc === true, sort the
          // events array with the earliest date last (latest date first).
          allEvents.sort(function(eventOne, eventTwo) {
            if (options.dateAsc) {
              return eventOne.date.getTime() - eventTwo.date.getTime();
            } else if (options.dateDesc) {
              return eventTwo.date.getTime() - eventOne.date.getTime();
            }
          });

          // ASYNC functions. Increment number finished and only send
          // results when all have finished.
          numFinished++;
          if (numFinished === numEvents) {
            res.status(200).send(allEvents);
          }
        }
      }

      if (eventType === 'webinars') {
        getEvent(Webinar, options, callback);
      } else if (eventType === 'workshops') {
        getEvent(Workshop, options, callback);
      } else if (eventType === 'courses') {
        getEvent(Course, options, callback);
      } else if (eventType === 'fundingOpps') {
        getEvent(FundingOpp, options, callback);
      } else {
        getEvent(Workshop, options, callback);
        getEvent(Webinar, options, callback);
        getEvent(Course, options, callback);
        getEvent(FundingOpp, options, callback);
      }

    }
  );
};
